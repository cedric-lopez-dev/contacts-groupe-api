import { createFromDocuware } from '../services/contacteur.services.js';


export const contacteurFromDocuware = async (req, res) => {

    try {
        const contacteur = await createFromDocuware(req.body);
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
