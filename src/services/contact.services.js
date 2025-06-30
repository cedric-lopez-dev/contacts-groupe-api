import contactModel from "../models/contact.model.js";

export const createContactFromDocuware = async (data) => {

    const docuwareData = contactModel.transformFromDocuware(data);
    const contacts = await Promise.all(docuwareData.members.map(async member => {
        member.address = data.ADRESSE_DE_L_ENTREPRISE;
        const newContact = await createContact(member);
        return newContact;
    }));
    return contacts;
};


export const createContact = async (data) => {
    const validatedData = await contactModel.validate(data);
    const dolibarrData = contactModel.toDolibarrFormat(validatedData);
    try {
        const response = await fetch(`${process.env.DOLIBARR_URL}contacts`, {
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

            throw new Error(errors, 'Erreur lors de la création du contact');
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Erreur lors de la sauvegarde : ${error.message}`);
    }
};

export const updateContact = async (contactID, data) => {

    try {
        const response = await fetch(`${process.env.DOLIBARR_URL}contacts/${contactID}`, {
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

            throw new Error(errors, 'Erreur lors de la mise à jour du contact');
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Erreur lors de la sauvegarde : ${error.message}`);
    }
};