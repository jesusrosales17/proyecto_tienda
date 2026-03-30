import { Router } from "express";
import { createUser, getUsers, toggleStatus, updateUser } from "../controllers/userController.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/",auth, authorize('Administrador') ,getUsers);
router.post("/",auth, authorize('Administrador') ,createUser);
router.put("/:id",auth, authorize('Administrador') ,updateUser);
router.patch("/toggleStatus/:id",auth, authorize('Administrador') ,toggleStatus);

export default router;