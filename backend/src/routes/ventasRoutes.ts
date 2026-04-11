import { Router } from "express";

import {
  createVenta,
  getClientesHistoricos,
  getProductosDisponibles,
  getVentas,
} from "../controllers/ventasController.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/productos", auth, authorize("Administrador", "Vendedor"), getProductosDisponibles);
router.get("/clientes", auth, authorize("Administrador", "Vendedor"), getClientesHistoricos);
router.get("/", auth, authorize("Administrador", "Vendedor"), getVentas);
router.post("/", auth, authorize("Administrador", "Vendedor"), createVenta);

export default router;

