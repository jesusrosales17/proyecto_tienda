import type { Request, Response, NextFunction } from "express";
import type { AuthTokenPayload } from "../types/auth.types.js";
import type { UserRole } from "../types/user.types.js";



export interface AuthRequest extends Request {
  user?: AuthTokenPayload;
}


export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: "No autorizado" });
    }

    next();
  };
};