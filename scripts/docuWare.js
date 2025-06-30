import { writeFile, unlink } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import { readdir, unlink as unlinkFile } from 'fs/promises';
import { join as joinPath } from 'path';
import { rename, rmdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getToken = async () => {
    try {
        const response = await fetch('https://login-emea.docuware.cloud/7eee9134-94d4-442d-b4be-8bed8384872f/connect/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'password',
                scope: 'docuware.platform',
                client_id: 'docuware.platform.net.client',
                username: 'jeremy',
                password: 'MilaLiamCharlize66!'
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Erreur lors de la récupération du token:', error);
        throw error;
    }
}

try {
    const token = await getToken();

    const DOCUWARE_CONFIG = {
        serverUrl: 'https://contacts66.docuware.cloud',
        platform: 'DocuWare/Platform',
        fileCabinetId: 'a128f889-f8f0-415b-88b2-05f6ddee6866'
    };

    const getDocument = async (documentId) => {
        try {
            const url = `${DOCUWARE_CONFIG.serverUrl}/${DOCUWARE_CONFIG.platform}/FileCabinets/${DOCUWARE_CONFIG.fileCabinetId}/Documents/${documentId}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur lors de la récupération du document:', error);
            throw error;
        }
    };

    const documents = await getDocument(402);

    const response = await fetch(`${DOCUWARE_CONFIG.serverUrl}/${DOCUWARE_CONFIG.platform}/FileCabinets/${DOCUWARE_CONFIG.fileCabinetId}/Documents/${documents.Id}/FileDownload`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });

    if (!response.ok) {
        throw new Error(`Erreur lors du téléchargement du fichier: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    await writeFile(join(__dirname, 'fiche-de-renseignements.zip'), Buffer.from(buffer));
    console.log(`Fichier téléchargé : fiche-de-renseignements.zip`);

    // Décompression du zip
    const zipPath = join(__dirname, 'fiche-de-renseignements.zip');
    const extractPath = join(__dirname, 'fiche-de-renseignements');
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);
    console.log(`Fichiers extraits dans : ${extractPath}`);
    await unlink(zipPath);
    console.log('Fichier zip supprimé après extraction.');

    // Récupération dynamique du nom du logo (première image trouvée)
    const logoSection = documents.Sections.find(
        section => section.ContentType && section.ContentType.startsWith('image/')
    );
    if (!logoSection) {
        throw new Error('Aucun logo/image trouvé dans le document.');
    }
    const logoFileName = logoSection.OriginalFileName;

    // Suppression de tous les fichiers extraits sauf le logo
    const files = await readdir(extractPath);
    for (const file of files) {
        if (file !== logoFileName) {
            await unlinkFile(joinPath(extractPath, file));
        }
    }

    // Déplacement du logo à la racine
    const logoSourcePath = joinPath(extractPath, logoFileName);
    const logoDestPath = join(__dirname, logoFileName);
    await rename(logoSourcePath, logoDestPath);

    // Suppression du dossier d'extraction
    await rmdir(extractPath);
    console.log(`Logo déplacé à la racine : ${logoFileName} et dossier temporaire supprimé.`);
} catch (error) {
    console.error('Erreur lors de l\'exécution du script :', error);
    process.exit(1);
}