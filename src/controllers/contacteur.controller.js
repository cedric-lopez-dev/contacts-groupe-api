import contacteurService from '../services/contacteur.services.js';

export const getMembers = async (req, res) => {
    try {
        const contacteurs = await contacteurService.find(req.query);
        res.json({
            status: 'success',
            data: contacteurs
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération des contacteurs',
            error: error.message
        });
    }
};

export const getMemberById = async (req, res) => {
    try {
        const contacteur = await contacteurService.findById(req.params.id);
        if (!contacteur) {
            return res.status(404).json({
                status: 'error',
                message: 'Contacteur non trouvé'
            });
        }
        res.json({
            status: 'success',
            data: contacteur
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération du contacteur',
            error: error.message
        });
    }
};

export const contacteurFromDocuware = async (req, res) => {
    try {
        // const contacteur = await contacteurService.create(req.body);
        const contacteur = {}
        res.status(201).json({
            status: 'success',
            message: 'Contacteur créé avec succès',
            data: contacteur
        });
    } catch (error) {
        if (error.errors) {
            return res.status(400).json({
                status: 'error',
                message: 'Données invalides',
                errors: error.errors
            });
        }
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la création du contacteur',
            error: error.message
        });
    }
};

export const updateMember = async (req, res) => {
    try {
        const contacteur = await contacteurService.update(req.params.id, req.body);
        res.json({
            status: 'success',
            message: 'Contacteur mis à jour avec succès',
            data: contacteur
        });
    } catch (error) {
        if (error.errors) {
            return res.status(400).json({
                status: 'error',
                message: 'Données invalides',
                errors: error.errors
            });
        }
        if (error.message.includes('non trouvé')) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la mise à jour du contacteur',
            error: error.message
        });
    }
};

export const deleteMember = async (req, res) => {
    try {
        await contacteurService.remove(req.params.id);
        res.json({
            status: 'success',
            message: 'Contacteur supprimé avec succès'
        });
    } catch (error) {
        if (error.message.includes('non trouvé')) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la suppression du contacteur',
            error: error.message
        });
    }
};