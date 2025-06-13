import express from 'express';
import { verifyApiKey } from '../../middleware/apiKeyMiddleware.js';
import { contacteurFromDocuware } from '../../controllers/contacteur.controller.js';


const adminRouter = express.Router();

adminRouter.use(verifyApiKey);

adminRouter.post('/contacteurFromDocuware', contacteurFromDocuware);

export default adminRouter;