import type { Request, Response, NextFunction } from 'express';
import type { UserAuthRow,  UserWithEstadoRow } from '../types/user.types.js';
import type { ResultSetHeader } from 'mysql2';

import pool from '../config/database.js';


export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
        const [rows] = await pool.query<UserAuthRow[]>("SELECT id, correo_electronico AS email, nombre, rol, estado  FROM usuarios");
        res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
}

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, nombre, password, rol } = req.body;

    if (!email.trim() || !nombre.trim() || !password.trim() || !rol.trim()) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios",
      });
    }

    const [existingUser] = await pool.query<UserAuthRow[]>("SELECT id FROM usuarios WHERE correo_electronico = ?", [email.trim()]);

    if (existingUser.length > 0) {
      return res.status(400).json({
        error: "El correo electrónico ya está en uso",
      });
    }

    const [result] = await pool.query<ResultSetHeader>("INSERT INTO usuarios (correo_electronico, nombre, contrasena, rol) VALUES (?, ?, ?, ?)", [email.trim(), nombre.trim(), password.trim(), rol.trim()]);
    return res.status(201).json({
      message: "Usuario creado exitosamente",
      user: {
        id: result.insertId,
        email: email.trim(),
        nombre: nombre.trim(),
        rol: rol.trim()
      }
    });
  } catch (error) {
    return next(error);
  }
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { email, nombre, password, rol } = req.body;
    const {id} = req.params;
    if(!id) {
      return res.status(400).json({
        error: "ID del usuario es requerido"
      });
    }

    if(!email.trim() || !nombre.trim() || !password.trim() || !rol.trim()) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios"
      });
    }

    const [existingUser] = await pool.query<UserAuthRow[]>("SELECT id FROM usuarios WHERE id = ?", [id]);

    if (existingUser.length === 0) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    const [existingUserWithEmail] = await pool.query<UserAuthRow[]>("SELECT id FROM usuarios WHERE correo_electronico = ? AND id != ?", [email.trim(), id]);

    if (existingUserWithEmail.length > 0) {
      return res.status(400).json({
        error: "El correo electrónico ya está en uso",
      });
    }

    const [result] = await pool.query<ResultSetHeader>("UPDATE usuarios SET correo_electronico = ?, nombre = ?, contrasena = ?, rol = ? WHERE id = ?", [email.trim(), nombre.trim(), password.trim(), rol.trim(), id]);

    return res.status(200).json({
      message: "Usuario actualizado exitosamente",
      user: {
        id,
        email: email.trim(),
        nombre: nombre.trim(),
        rol: rol.trim()
      }
    });
  } catch (error) {
    return next(error);
  }
}

export const toggleStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const [existingUser] = await pool.query<UserWithEstadoRow[]>("SELECT id, estado FROM usuarios WHERE id = ?", [id]);

    if (existingUser.length === 0) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    const newStatus = existingUser?.[0]?.estado === 1 ? 0 : 1;
    const [result] = await pool.query<ResultSetHeader>("UPDATE usuarios SET estado = ? WHERE id = ?", [newStatus, id]);

    return res.status(200).json({
      message: "Estado del usuario actualizado exitosamente",
      user: {
        id,
        estado: newStatus
      }
    });
  } catch(error) {
    return next(error);
  }
}