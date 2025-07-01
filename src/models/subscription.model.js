import Joi from 'joi';

const baseMessages = 'subscription';

const subscriptionSchema = Joi.object({
    date_start: Joi.date().required().messages({
        'date.base': `${baseMessages} date de début est requise`
    }),
    date_end: Joi.date().required().messages({
        'date.base': `${baseMessages} date de fin est requise`
    }),
    member_id: Joi.number().required().messages({
        'number.base': `${baseMessages} membre est requis`
    }),
});

const validate = async (data) => {
    try {
        return await subscriptionSchema.validateAsync(data, { abortEarly: false });
    } catch (error) {
        const errors = error.details.reduce((acc, err) => ({
            ...acc,
            [err.path[0]]: err.message
        }), {});
        throw { errors };
    }
};

const transformFromDocuware = (data, memberID) => {
    return {
        date_start: data.DATE_DE_DEBUT_DE_CONTRAT || '',
        date_end: data.DATE_DE_FIN_DE_CONTRAT || '',
        member_id: memberID,
    };
};

const toDolibarrFormat = (data) => {
    // Décalage de 2 heures en millisecondes
    const offsetMs = 2 * 60 * 60 * 1000;
    return {
        dateh: data.date_start ? Math.floor((new Date(data.date_start).getTime() + offsetMs) / 1000) : null,
        datef: data.date_end ? Math.floor((new Date(data.date_end).getTime() + offsetMs) / 1000) : null,
        fk_type: 1,
        fk_adherent: data.member_id,
        amount: '1200.00000000',
    };
};


export default {
    validate,
    transformFromDocuware,
    toDolibarrFormat
};
