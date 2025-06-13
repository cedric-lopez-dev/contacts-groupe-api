import express from 'express';
import routes from './src/routes/routes.js';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { specs, options } from './src/config/swagger.js';

dotenv.config();

const app = express()
const port = 3000

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization, access-token');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json())

// Routes API
app.use('/api', routes)

// Documentation Swagger
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(specs, options));

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})