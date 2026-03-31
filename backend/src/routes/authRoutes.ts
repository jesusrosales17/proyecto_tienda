import { Router } from "express";

import { login, me } from "../controllers/authController.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.get("/me", auth, me);

export default router;
