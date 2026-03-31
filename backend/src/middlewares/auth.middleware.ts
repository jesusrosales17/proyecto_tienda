import jwt from 'jsonwebtoken';

import type { Request, Response, NextFunction } from "express";
import type { AuthTokenPayload } from "../types/auth.types.js";

import config from "../config/config.js";

export interface AuthRequest extends Request {
  user?: AuthTokenPayload;
}



export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    console.log(req.cookies);

    if (!token) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
};
;