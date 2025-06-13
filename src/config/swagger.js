import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le fichier YAML
const swaggerDocument = yaml.load(
    readFileSync(join(__dirname, 'swagger.yaml'), 'utf8')
);

// Configuration simple pour Swagger UI
const swaggerOptions = {
    swaggerOptions: {
        defaultModelsExpandDepth: -1
    }
};

export const specs = swaggerDocument;
export const options = swaggerOptions; 