import Joi from 'joi';

// Constants
const PHONE_REGEX = /^(\+\d{1,4}|0)[1-9](\s?\d{2}){4}$|^(\+\d{1,4}|0)[1-9]\d{8}$/;
const TYPES_ADHERENT = ["PREMIUM", "VISITEUR", "PARTENAIRE"];
const CIVILITES = ["MR", "MME", "MLLE"];

// Validation schema
const contacteurSchema = Joi.object({
    firstname: Joi.string()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Le prénom est requis',
            'string.min': 'Le prénom doit contenir au moins {#limit} caractère',
            'string.max': 'Le prénom ne peut pas dépasser {#limit} caractères'
        }),
    lastname: Joi.string()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Le nom est requis',
            'string.min': 'Le nom doit contenir au moins {#limit} caractère',
            'string.max': 'Le nom ne peut pas dépasser {#limit} caractères'
        }),
    civility: Joi.string()
        .valid(...CIVILITES)
        .default('MR')
        .messages({
            'any.only': 'La civilité doit être MR, MME ou MLLE'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'L\'adresse email est invalide',
            'string.empty': 'L\'email est requis'
        }),
    phone: Joi.string()
        .pattern(PHONE_REGEX)
        .required()
        .messages({
            'string.pattern.base': 'Format invalide. Utilisez un format français (06XXXXXXXX) ou international (+33XXXXXXXX)',
            'string.empty': 'Le téléphone est requis'
        }),
    societe: Joi.string()
        .max(200)
        .allow('')
        .allow(null)
        .messages({
            'string.max': 'Le nom de la société ne peut pas dépasser {#limit} caractères'
        }),
    type: Joi.string()
        .valid(...TYPES_ADHERENT)
        .default('PREMIUM')
        .messages({
            'any.only': `Le type doit être ${TYPES_ADHERENT.join(', ')}`
        }),
    note_private: Joi.string()
        .max(2000)
        .allow('')
        .allow(null)
        .messages({
            'string.max': 'La note ne peut pas dépasser {#limit} caractères'
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
        .allow(null)
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
        login: data.firstname + data.lastname,
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
        array_options: {},

        // Autres champs techniques requis avec valeurs par défaut
        ref: "1"
    };
};

export default {
    validate,
    toDolibarrFormat,
    TYPES_ADHERENT,
    CIVILITES
}; 