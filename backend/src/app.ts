import express from 'express';
import cookieParcer from 'cookie-parser';

import { errorHandler } from './middlewares/errorHandler.js';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();


// convertir a json
app.use(express.json());

app.use(cookieParcer());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);


// middleware para los errores
app.use(errorHandler);


export default app;