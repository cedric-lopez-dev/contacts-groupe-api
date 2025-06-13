import contacteurModel from '../models/contacteur.model.js';

const create = async (data) => {
    const validatedData = await contacteurModel.validate(data);
    const dolibarrData = contacteurModel.toDolibarrFormat(validatedData);
    try {
        const response = await fetch(`${process.env.DOLIBARR_URL}members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'DOLAPIKEY': process.env.DOLIBARR_API_KEY
            },
            body: JSON.stringify(dolibarrData)
        });
        if (!response.ok) {
            const error = await response.json();
            const errors = Object.entries(error.error)
                .map(([key, value]) => [key, value]);

            throw new Error(errors, 'Erreur lors de la création du contacteur');
        }

        return await response.json();
    } catch (error) {
        throw new Error(`Erreur lors de la sauvegarde : ${error.message}`);
    }
};

const find = async (filters = {}) => {
    try {
        const url = new URL(`${process.env.DOLIBARR_URL}members`);

        if (filters.query) {
            url.searchParams.append('sqlfilters',
                `(t.lastname LIKE '%${filters.query}%' OR t.firstname LIKE '%${filters.query}%')`
            );
        }
        if (filters.type) url.searchParams.append('type', filters.type);
        if (filters.limit) url.searchParams.append('limit', filters.limit);
        if (filters.page) {
            const offset = (filters.page - 1) * (filters.limit || 20);
            url.searchParams.append('offset', offset);
        }

        const response = await fetch(url, {
            headers: {
                'DOLAPIKEY': process.env.DOLIBARR_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la recherche des contacteurs');
        }

        return await response.json();
    } catch (error) {
        throw new Error(`Erreur lors de la recherche : ${error.message}`);
    }
};

const findById = async (id) => {
    try {
        const response = await fetch(`${process.env.DOLIBARR_URL}members/${id}`, {
            headers: {
                'DOLAPIKEY': process.env.DOLIBARR_API_KEY
            }
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Contacteur non trouvé');
        }

        return await response.json();
    } catch (error) {
        throw new Error(`Erreur lors de la récupération : ${error.message}`);
    }
};

const update = async (id, updateData) => {
    try {
        const current = await findById(id);
        if (!current) throw new Error('Contacteur non trouvé');

        const validatedData = await contacteurModel.validate({ ...current, ...updateData });
        const dolibarrData = contacteurModel.toDolibarrFormat(validatedData);

        const response = await fetch(`${process.env.DOLIBARR_URL}members/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'DOLAPIKEY': process.env.DOLIBARR_API_KEY
            },
            body: JSON.stringify(dolibarrData)
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour du contacteur');
        }

        return await response.json();
    } catch (error) {
        throw new Error(`Erreur lors de la mise à jour : ${error.message}`);
    }
};

const remove = async (id) => {
    try {
        const response = await fetch(`${process.env.DOLIBARR_URL}members/${id}`, {
            method: 'DELETE',
            headers: {
                'DOLAPIKEY': process.env.DOLIBARR_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression du contacteur');
        }

        return true;
    } catch (error) {
        throw new Error(`Erreur lors de la suppression : ${error.message}`);
    }
};

export default {
    create,
    find,
    findById,
    update,
    remove
};
