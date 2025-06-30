import thirdpartiesModel from '../models/thirdparties.model.js';

export const createThirdpartyFromDocuware = async (data) => {
    const docuwareData = thirdpartiesModel.transformFromDocuware(data);
    const newThirdparty = await createThirdparty(docuwareData);
    return newThirdparty;
};

export const createThirdparty = async (data) => {
    const validatedData = await thirdpartiesModel.validate(data);
    const dolibarrData = thirdpartiesModel.toDolibarrFormat(validatedData);
    try {
        const response = await fetch(`${process.env.DOLIBARR_URL}thirdparties`, {
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

            throw new Error(errors, 'Erreur lors de la création du tiers');
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Erreur lors de la sauvegarde : ${error.message}`);
    }
};