import Joi from 'joi';

const baseMessages = 'thirdparties';

// Validation schema
const thirdpartiesSchema = Joi.object({
    name: Joi.string()
        .max(255)
        .required()
        .messages({
            'string.empty': `${baseMessages} nom est requis`,
            'string.max': `${baseMessages} nom ne peut pas dépasser {#limit} caractères`
        }),
    name_alias: Joi.string()
        .max(255)
        .allow('')
        .allow(null),
    email: Joi.string()
        .email()
        .allow('')
        .allow(null)
        .messages({
            'string.email': `${baseMessages} adresse email est invalide`
        }),
    phone: Joi.string()
        .max(20)
        .allow('')
        .allow(null),
    phone_mobile: Joi.string()
        .max(20)
        .allow('')
        .allow(null),
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
    country_code: Joi.string()
        .max(3)
        .default('FR'),
    note_private: Joi.string()
        .max(2000)
        .allow('')
        .allow(null),
    client: Joi.string()
        .valid('0', '1')
        .default('0'),
    prospect: Joi.number()
        .valid(0, 1)
        .default(0),
    fournisseur: Joi.string()
        .valid('0', '1')
        .default('0'),
    status: Joi.string()
        .valid('0', '1')
        .default('1'),
    address: Joi.string()
        .max(255)
        .allow('')
        .allow(null),
    zip: Joi.string(),
    rcs: Joi.string(),
});

// Validation function
const validate = async (data) => {
    try {
        return await thirdpartiesSchema.validateAsync(data, { abortEarly: false });
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

const toDolibarrFormat = (data) => {
    return {
        name: data.name,
        name_alias: data.name_alias,
        email: data.email,
        phone: data.phone,
        address: data.address,
        idprof2: data.rcs,
    };
};

const transformFromDocuware = (data) => {
    return {
        name: data.DENOMINATION_COMMERCIALE || '',
        name_alias: `${data.PRENOM_CARTE_DE_MEMBRE_1} ${data.NOM_CARTE_DE_MEMBRE_1}` || '',
        email: data.EMAIL_CARTE_DE_MEMBRE_1 || '',
        phone: data.PORTABLE_CARTE_DE_MEMBRE_1 || '',
        address: data.ADRESSE_DE_L_ENTREPRISE || '',
        rcs: data.RCS_DE_L_ENTREPRISE || '',
    };
};

export default {
    validate,
    toDolibarrFormat,
    transformFromDocuware
};
