import subscriptionModel from '../models/subscription.model.js';

export const createSubscriptionFromDocuware = async (data, memberID) => {
    const docuwareData = subscriptionModel.transformFromDocuware(data, memberID);
    const subscription = await createSubscription(docuwareData);
    return subscription;
};

export const createSubscription = async (data) => {
    const validatedData = await subscriptionModel.validate(data);
    const dolibarrData = subscriptionModel.toDolibarrFormat(validatedData);
    try {
        const response = await fetch(`${process.env.DOLIBARR_URL}subscriptions`, {
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
            throw new Error(errors, 'Erreur lors de la création de l\'abonnement');
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Erreur lors de la sauvegarde : ${error?.message || String(error)}`);
    }
};

export const getSubscriptionsByMemberId = async (memberId) => {
    const response = await fetch(`${process.env.DOLIBARR_URL}subscriptions?fk_adherent=${memberId}`, {
        headers: {
            'Content-Type': 'application/json',
            'DOLAPIKEY': process.env.DOLIBARR_API_KEY
        }
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des souscriptions');
    }
    return await response.json();
};

export const updateSubscription = async (subscriptionID, data) => {
    const validatedData = await subscriptionModel.validate(data);
    const dolibarrData = subscriptionModel.toDolibarrFormat(validatedData);
    try {
        const response = await fetch(`${process.env.DOLIBARR_URL}subscriptions/${subscriptionID}`, {
            method: 'PUT',
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
            throw new Error(errors, 'Erreur lors de la mise à jour de l\'abonnement');
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Erreur lors de la sauvegarde : ${error?.message || String(error)}`);
    }
};

export const updateSubscriptionFromDocuware = async (subscriptionID, data, memberID) => {
    const docuwareData = subscriptionModel.transformFromDocuware(data, memberID);
    const updatedSubscription = await updateSubscription(subscriptionID, docuwareData);
    return updatedSubscription;
};