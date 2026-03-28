import type { Request, Response, NextFunction } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";

import pool from "../config/database.js";
import config from "../config/config.js";
import type { LoginBody, AuthTokenPayload, LoginSuccessResponse } from "../types/auth.types.js";
import type { UserAuthRow } from "../types/user.types.js";

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as LoginBody;

    if (!email || !password) {
      return res.status(400).json({
        error: "email y password son obligatorios",
      });
    }

    const [rows] = await pool.query<UserAuthRow[]>(
      "SELECT id, correo_electronico AS email, nombre, contrasena AS password FROM usuarios WHERE correo_electronico = ? LIMIT 1",
      [email]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        error: "Credenciales inválidas",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        error: "Credenciales inválidas",
      });
    }

    const expiresIn = config.jwtExpiresIn as NonNullable<SignOptions["expiresIn"]>;

    const payload: AuthTokenPayload = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn });

    res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: true });

    const response: LoginSuccessResponse = {
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};
