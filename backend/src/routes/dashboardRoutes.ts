import { Router } from "express";

import { getDashboardSummary } from "../controllers/dashboardController.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/summary", auth, authorize("Administrador", "Vendedor"), getDashboardSummary);

export default router;
