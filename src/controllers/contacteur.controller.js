import { createFromDocuware, getContacteurByDocuwareId, updateFromDocuware } from '../services/contacteur.services.js';


export const contacteurFromDocuware = async (req, res) => {
    console.log("req.body", req.body)
    if (req.body.STATUT === "Fiche Validée") {
        return fromAdhesion(req, res);
    }
    if (req.body.STATUT === "Contrat signé") {
        return fromContrat(req, res);
    }
    return res.status(200).json({
        status: 'ok',
        message: 'Statut non traité'
    });
};

const fromAdhesion = async (req, res) => {
    const idDocuware = req.body.DWDOCID;
    const contacteur = await getContacteurByDocuwareId(idDocuware);
    console.log("exist", contacteur)
    if (contacteur.length > 0) {
        const updatedContacteur = await updateFromDocuware(req.body, contacteur[0]);
        res.status(200).json({
            status: 'success',
            message: 'Contacteur mis à jour avec succès',
            data: updatedContacteur
        });
        return
    }


    try {
        console.log("no exist")
        const contacteur = await createFromDocuware(req.body);
        console.log("body", req.body)
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
}

const fromContrat = async (req, res) => {
    const idDocuware = req.body.ID_FICHE;
    const contacteur = await getContacteurByDocuwareId(idDocuware);
}