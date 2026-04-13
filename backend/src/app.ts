import express from 'express';
import cors from 'cors';
import cookieParcer from 'cookie-parser';

import { errorHandler } from './middlewares/errorHandler.js';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import ventasRoutes from "./routes/ventasRoutes.js";
import comprasRoutes from "./routes/comprasRoutes.js";
import productRoutes from './routes/productRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);


// convertir a json
app.use(express.json());

app.use(cookieParcer());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/compras", comprasRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);


// middleware para los errores
app.use(errorHandler);


export default app;