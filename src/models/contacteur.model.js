import Joi from 'joi';

// Constants
const PHONE_REGEX = /^(\+\d{1,4}|0)[1-9](\s?\d{2}){4}$|^(\+\d{1,4}|0)[1-9]\d{8}$/;
const TYPES_ADHERENT = ["PREMIUM", "VISITEUR", "PARTENAIRE"];
const CIVILITES = ["MR", "MME", "MLLE"];
const baseMessages = 'contacteur';

// Validation schema
const contacteurSchema = Joi.object({
    firstname: Joi.string()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.empty': `${baseMessages} prénom est requis`,
            'string.min': `${baseMessages} prénom doit contenir au moins {#limit} caractère`,
            'string.max': `${baseMessages} prénom ne peut pas dépasser {#limit} caractères`
        }),
    lastname: Joi.string()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.empty': `${baseMessages} nom est requis`,
            'string.min': `${baseMessages} nom doit contenir au moins {#limit} caractère`,
            'string.max': `${baseMessages} nom ne peut pas dépasser {#limit} caractères`
        }),
    civility: Joi.string()
        .valid(...CIVILITES)
        .default('MR')
        .messages({
            'any.only': `${baseMessages} civilité doit être MR, MME ou MLLE`
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': `${baseMessages} adresse email est invalide`,
            'string.empty': `${baseMessages} email est requis`
        }),
    phone: Joi.string()
        .pattern(PHONE_REGEX)
        .required()
        .messages({
            'string.pattern.base': `${baseMessages} format invalide. Utilisez un format français (06XXXXXXXX) ou international (+33XXXXXXXX)`,
            'string.empty': `${baseMessages} téléphone est requis`
        }),
    societe: Joi.string()
        .max(200)
        .allow('')
        .allow(null)
        .messages({
            'string.max': `${baseMessages} nom de la société ne peut pas dépasser {#limit} caractères`
        }),
    type: Joi.string()
        .valid(...TYPES_ADHERENT)
        .default('PREMIUM')
        .messages({
            'any.only': `${baseMessages} type doit être ${TYPES_ADHERENT.join(', ')}`
        }),
    note_private: Joi.string()
        .max(2000)
        .allow('')
        .allow(null)
        .messages({
            'string.max': `${baseMessages} note ne peut pas dépasser {#limit} caractères`
        }),
    address: Joi.string()
        .max(255)
        .allow('')
        .allow(null),
    zip: Joi.string()
        .max(10)
        .allow('')
        .allow(null),
    town: Joi.string()
        .max(100)
        .allow('')
        .allow(null),
    iddocuware: Joi.string()
        .allow('')
        .allow(null)
        .messages({
            'string.base': `${baseMessages} ID Docuware doit être une chaîne de caractères`
        }),
    avantages_membres: Joi.string()
        .allow('')
        .allow(null)
        .messages({
            'string.base': `${baseMessages} Avantages membres doit être une chaîne de caractères`
        }),
    avantages_public: Joi.string()
        .allow('')
        .allow(null)
        .messages({
            'string.base': `${baseMessages} Avantages grand doit être une chaîne de caractères`
        }),
    activite_representee: Joi.string()
        .allow('')
        .allow(null)
        .messages({
            'string.base': `${baseMessages} Activité représentée doit être une chaîne de caractères`
        })
});

// Validation function
const validate = async (data) => {
    try {
        return await contacteurSchema.validateAsync(data, { abortEarly: false });
    } catch (error) {
        const errors = error.details.reduce((acc, err) => ({
            ...acc,
            [err.path[0]]: err.message
        }), {});
        throw { errors };
    }
};

// Data transformation functions
const normalizePhoneNumber = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/[\s.-]/g, '');

    if (cleaned.startsWith('0') && cleaned.length === 10) {
        return '+33' + cleaned.substring(1);
    }
    if (cleaned.startsWith('33') && !cleaned.startsWith('+33')) {
        return '+' + cleaned;
    }
    if (!cleaned.startsWith('+')) {
        return '+' + cleaned;
    }
    return cleaned;
};

const getTypeId = (type) => {
    const typeMap = {
        "PREMIUM": "1",
        "VISITEUR": "6",
        "PARTENAIRE": "5"
    };
    return typeMap[type] || "1";
};

const getGenderFromCivility = (civility) => {
    return civility === "MR" ? "man" : "woman";
};

// Fonction pour normaliser les noms (enlever accents et mettre en minuscules)
const normalizeName = (name) => {
    if (!name) return '';
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
        .replace(/[^a-z0-9\s]/g, '') // Garde seulement lettres, chiffres et espaces
        .trim();
};

const toDolibarrFormat = (data) => {
    return {
        // Valeurs par défaut requises
        entity: "1",
        statut: "1",
        status: "1",
        country_id: "1",
        country_code: "FR",

        // Données utilisateur
        lastname: data.lastname,
        firstname: data.firstname,
        email: data.email || "",
        login: normalizeName(data.firstname) + normalizeName(data.lastname),
        phone: normalizePhoneNumber(data.phone) || "",  // Différent de phone_mobile pour members
        civility_id: data.civility || "MR",
        societe: data.societe || "",
        company: data.societe || "",    // Double champ pour la société
        morphy: "phy",
        gender: getGenderFromCivility(data.civility || "MR"),
        public: "0",
        type: data.type,
        typeid: getTypeId(data.type),   // Conversion du type en ID
        need_subscription: "1",

        // Notes
        note_private: data.note_private || "",

        // Options spécifiques, tableau vide par défaut
        array_options: {
            options_iddocuware: data.iddocuware || "",
            options_avantage_membres: data.avantages_membres || "",
            options_avantages_grand_public: data.avantages_public || "",
            options_activite: data.activite_representee || ""
        },

        // Autres champs techniques requis avec valeurs par défaut
        ref: "1"
    };
};

const transformFromDocuware = (data) => {
    return {
        firstname: data.PRENOM_CARTE_DE_MEMBRE_1 || '',
        lastname: data.NOM_CARTE_DE_MEMBRE_1 || '',
        email: data.EMAIL_CARTE_DE_MEMBRE_1 || '',
        phone: data.PORTABLE_CARTE_DE_MEMBRE_1 || '',
        societe: data.NOM_DE_L_ENTREPRISE || '',
        address: data.ADRESSE_DE_L_ENTREPRISE || '',
        iddocuware: data.ID_FICHE?.toString() || null,
        avantages_membres: data.AVANTAGES_MIS_EN_PLACE__RESER || "",
        avantages_public: data.AVANTAGES_MIS_EN_PLACE__GRAND || "",
        activite_representee: data.ACTIVITE_REPRESENTEE || ""
    };
};

export default {
    validate,
    toDolibarrFormat,
    transformFromDocuware,
    TYPES_ADHERENT,
    CIVILITES
}; 