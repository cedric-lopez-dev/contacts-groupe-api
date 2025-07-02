import Joi from 'joi';

const baseMessages = 'contact';

const contactSchema = Joi.object({
    nom: Joi.string()
        .max(255)
        .required()
        .messages({
            'string.empty': `${baseMessages} nom est requis`,
            'string.max': `${baseMessages} nom ne peut pas dépasser {#limit} caractères`
        }),
    prenom: Joi.string()
        .max(255)
        .required()
        .messages({
            'string.empty': `${baseMessages} prenom est requis`,
            'string.max': `${baseMessages} prenom ne peut pas dépasser {#limit} caractères`
        }),
    email: Joi.string()
        .email()
        .messages({
            'string.empty': `${baseMessages} email est requis`,
            'string.email': `${baseMessages} email doit être une adresse email valide`
        }),
    telephone: Joi.string()
        .max(255)
        .messages({
            'string.max': `${baseMessages} telephone ne peut pas dépasser {#limit} caractères`
        }),
    poste: Joi.string()
        .max(255)
        .messages({
            'string.max': `${baseMessages} poste ne peut pas dépasser {#limit} caractères`
        }),
    dateNaissance: Joi.date()
        .messages({
            'date.base': `${baseMessages} date de naissance est requise`
        }),
    address: Joi.string()
        .max(255)
        .messages({
            'string.max': `${baseMessages} adresse ne peut pas dépasser {#limit} caractères`
        }),
    socid: Joi.string()
        .max(255)
        .messages({
            'string.max': `${baseMessages} socid ne peut pas dépasser {#limit} caractères`
        })
});

const validate = async (data) => {
    try {
        return await contactSchema.validateAsync(data, { abortEarly: false });
    } catch (error) {
        const errors = error.details.reduce((acc, err) => ({
            ...acc,
            [err.path[0]]: err.message
        }), {});
        throw { errors };
    }
};

const transformFromDocuware = (data) => {
    const members = [];

    // Membre 1
    if (data.NOM_CARTE_DE_MEMBRE_1 || data.PRENOM_CARTE_DE_MEMBRE_1) {
        members.push({
            nom: data.NOM_CARTE_DE_MEMBRE_1 || '',
            prenom: data.PRENOM_CARTE_DE_MEMBRE_1 || '',
            email: data.EMAIL_CARTE_DE_MEMBRE_1 || '',
            telephone: data.PORTABLE_CARTE_DE_MEMBRE_1 || '',
            poste: data.POSTE_OCCUPE_CARTE_DE_MEMBRE_ || '',
            dateNaissance: data.DATE_DE_NAISSANCE_CARTE_DE_ME || null
        });
    }

    // Membre 2
    if (data.NOM_CARTE_DE_MEMBRE_2 || data.PRENOM_CARTE_DE_MEMBRE_2) {
        members.push({
            nom: data.NOM_CARTE_DE_MEMBRE_2 || '',
            prenom: data.PRENOM_CARTE_DE_MEMBRE_2 || '',
            email: data.EMAIL_CARTE_DE_MEMBRE_2 || '',
            telephone: data.PORTABLE_CARTE_DE_MEMBRE_2 || '',
            poste: data.POSTE_OCCUPE_CARTE_DE_MEMBRE1 || '',
            dateNaissance: data.DATE_DE_NAISSANCE_CARTE_DE_M1 || null
        });
    }

    // Membre 3
    if (data.NOM_CARTE_DE_MEMBRE_3 || data.PRENOM_CARTE_DE_MEMBRE_3) {
        members.push({
            nom: data.NOM_CARTE_DE_MEMBRE_3 || '',
            prenom: data.PRENOM_CARTE_DE_MEMBRE_3 || '',
            email: data.EMAIL_CARTE_DE_MEMBRE_3 || '',
            telephone: data.PORTABLE_CARTE_DE_MEMBRE_3 || '',
            poste: data.POSTE_OCCUPE_CARTE_DE_MEMBRE2 || '',
            dateNaissance: data.DATE_DE_NAISSANCE_CARTE_DE_M2 || null
        });
    }

    return {
        members,
        address: data.ADRESSE_DE_L_ENTREPRISE,
    };
};

const toDolibarrFormat = (member) => {

    return {
        lastname: member.nom,
        firstname: member.prenom,
        email: member.email,
        phone: member.telephone,
        poste: member.poste,
        dateNaissance: member.dateNaissance,
        address: member.address,
        socid: member.socid
    };
};

export default {
    validate,
    toDolibarrFormat,
    transformFromDocuware
};