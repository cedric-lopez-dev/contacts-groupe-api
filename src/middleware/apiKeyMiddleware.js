import dotenv from 'dotenv';
dotenv.config();

export const verifyApiKey = (req, res, next) => {
    const apiKeyFromHeader = req.headers['x-api-key'];
    const apiKeyFromQuery = req.query.apiKey;

    const apiKey = apiKeyFromHeader || apiKeyFromQuery;

    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(403).json({
            message: "Clé API invalide ou manquante. Veuillez fournir une clé API valide via le header 'x-api-key' ou le paramètre d'URL 'apiKey'",
            status: "error"
        });
    }

    next();
};
