import express from 'express';
import cors from 'cors';
import cookieParcer from 'cookie-parser';

import { errorHandler } from './middlewares/errorHandler.js';
import config from './config/config.js';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';

const app = express();

// cors
app.use(cors({
	origin: config.frontendUrl,
	credentials: true,
}));


// convertir a json
app.use(express.json());

app.use(cookieParcer());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);


// middleware para los errores
app.use(errorHandler);


export default app;