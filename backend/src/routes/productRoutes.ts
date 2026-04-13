import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
  quickCreateProduct,
  updateProduct,
} from "../controllers/productController.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", auth, authorize("Administrador", "Vendedor"), getProducts);
router.post("/", auth, authorize("Administrador"), createProduct);
router.post("/quick-create", auth, authorize("Administrador"), quickCreateProduct);
router.put("/:id", auth, authorize("Administrador"), updateProduct);
router.delete("/:id", auth, authorize("Administrador"), deleteProduct);

export default router;
