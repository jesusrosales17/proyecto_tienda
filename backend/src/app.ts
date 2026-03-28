import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';

import healthRoutes from './routes/healthRoutes.js';

const app = express();

// convertir a json
app.use(express.json());

app.use('/health', healthRoutes);

// middleware para los errores
app.use(errorHandler);


export default app;