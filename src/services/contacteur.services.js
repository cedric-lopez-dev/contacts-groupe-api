import contacteurModel from '../models/contacteur.model.js';
import { createContactFromDocuware, updateContact, getContactsBySocid, updateContactFromDocuware } from './contact.services.js';
import { createSubscriptionFromDocuware, getSubscriptionsByMemberId, updateSubscriptionFromDocuware } from './subscription.services.js';

import { createThirdpartyFromDocuware, updateThirdparty } from './thirdparties.service.js';

export const createFromDocuware = async (data) => {

    const docuwareData = contacteurModel.transformFromDocuware(data);
    const newContacteur = await createContacteur(docuwareData);
    const memberID = newContacteur;
    const newThirdparty = await createThirdpartyFromDocuware(data);
    const thirdpartyID = newThirdparty;
    const updatedContacteur = await updateContacteur(
        memberID,
        { socid: thirdpartyID }
    );
    const newContacts = await createContactFromDocuware(data);

    const updatedContact = await Promise.all(newContacts.map(async contact => {
        return await updateContact(
            contact,
            { socid: thirdpartyID }
        );
    }));
    const newSubscription = await createSubscriptionFromDocuware(data, memberID);

    return { updatedContacteur, updatedContact };
};

export const updateFromDocuware = async (data, contacteur) => {
    const docuwareData = contacteurModel.transformFromDocuware(data);
    const updatedContacteur = await updateContacteur(
        contacteur.id,
        docuwareData
    );

    const updatedThirdparty = await updateThirdparty(
        updatedContacteur.fk_soc,
        data
    );
    const thirdpartyWithContacts = await getContactsBySocid(updatedContacteur.fk_soc);

    const updatedContacts = await updateContactFromDocuware(thirdpartyWithContacts, data);


    const subscriptions = await getSubscriptionsByMemberId(updatedContacteur.id);

    const updatedSubscription = await updateSubscriptionFromDocuware(subscriptions[0].id, data, updatedContacteur.id);

    return {};
}


export const createContacteur = async (data) => {
    const validatedData = await contacteurModel.validate(data);
    const dolibarrData = contacteurModel.toDolibarrFormat(validatedData);
    try {
        const response = await fetch(`${process.env.DOLIBARR_URL}members`, {
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

            throw new Error(errors, 'Erreur lors de la création du contacteur');
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Erreur lors de la sauvegarde : ${error.message}`);
    }
}
export const updateContacteur = async (memberID, data) => {
    const response = await fetch(`${process.env.DOLIBARR_URL}members/${memberID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'DOLAPIKEY': process.env.DOLIBARR_API_KEY
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        const errors = Object.entries(error.error)
            .map(([key, value]) => [key, value]);
        throw new Error(errors, 'Erreur lors de la mise à jour du contacteur');
    }
    return await response.json();
}

export const getContacteurByDocuwareId = async (idDocuware) => {
    const sqlFilter = `ef.iddocuware:like:'${idDocuware}'`;
    const response = await fetch(
        `${process.env.DOLIBARR_URL}members?sqlfilters=${sqlFilter}`,
        {
            headers: {
                'Accept': 'application/json',
                'DOLAPIKEY': process.env.DOLIBARR_API_KEY
            }
        }
    );
    if (!response.ok) {
        console.log(response);
        throw new Error('Erreur lors de la récupération du contacteur');
    }
    return await response.json();
}