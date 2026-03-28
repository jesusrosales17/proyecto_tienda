import type { Request, Response, NextFunction } from 'express';
import pool from '../config/database.js';
import type { UserAuthRow } from '../types/user.types.js';



export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
        const [rows] = await pool.query<UserAuthRow[]>("SELECT id, correo_electronico AS email, nombre, rol, estado  FROM usuarios");
        res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
}