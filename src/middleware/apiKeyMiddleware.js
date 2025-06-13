import dotenv from 'dotenv';
dotenv.config();

export const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(403).json({
            message: "Clé API invalide ou manquante",
            status: "error"
        });
    }

    next();
};
