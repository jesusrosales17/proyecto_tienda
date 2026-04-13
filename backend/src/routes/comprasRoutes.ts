import { Router } from "express";

import {
  createCompra,
  getCompras,
  getProductosParaCompra,
  getProveedoresHistoricos,
} from "../controllers/comprasController.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/productos", auth, authorize("Administrador"), getProductosParaCompra);
router.get("/proveedores", auth, authorize("Administrador"), getProveedoresHistoricos);
router.get("/", auth, authorize("Administrador"), getCompras);
router.post("/", auth, authorize("Administrador"), createCompra);

export default router;
