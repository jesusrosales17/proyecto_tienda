import express from 'express';
import cors from 'cors';
import cookieParcer from 'cookie-parser';

import { errorHandler } from './middlewares/errorHandler.js';
import config from './config/config.js';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import ventasRoutes from "./routes/ventasRoutes.js";
import productRoutes from './routes/productRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

// cors
app.use(
  cors({
    origin: (origin, callback) => {
      // Permite herramientas sin origin (Postman/curl)
      if (!origin) {
        return callback(null, true);
      }

      // En desarrollo permite localhost con cualquier puerto (5173, 5174, etc.)
      if (config.nodeEnv !== "production" && /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }

      // En producción o cuando se define FRONTEND_URL, valida origen exacto
      if (origin === config.frontendUrl) {
        return callback(null, true);
      }

      return callback(new Error("Origen no permitido por CORS"));
    },
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
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);


// middleware para los errores
app.use(errorHandler);


export default app;