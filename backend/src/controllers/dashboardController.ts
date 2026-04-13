import type { NextFunction, Response } from "express";

import pool from "../config/database.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import type { CountRow, DashboardSummaryResponse, SumRow } from "../types/dashboard.types.js";

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getDashboardSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const connection = await pool.getConnection();

  try {
    const role = req.user?.rol;
    const userId = req.user?.id;

    if (!role || !userId) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const salesBaseCondition = "fecha >= CURDATE() AND fecha < DATE_ADD(CURDATE(), INTERVAL 1 DAY)";
    const salesCondition =
      role === "Administrador" ? salesBaseCondition : `${salesBaseCondition} AND usuario_id = ?`;
    const salesParams = role === "Administrador" ? [] : [userId];

    const [totalVentasRows] = await connection.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM ventas WHERE ${salesCondition}`,
      salesParams,
    );

    const [totalVendidoRows] = await connection.query<SumRow[]>(
      `SELECT COALESCE(SUM(total), 0) AS total FROM ventas WHERE ${salesCondition}`,
      salesParams,
    );

    const [totalProductosRows] = await connection.query<CountRow[]>(
      "SELECT COUNT(*) AS total FROM productos",
    );

    let totalUsuarios: number | null = null;

    if (role === "Administrador") {
      const [totalUsuariosRows] = await connection.query<CountRow[]>("SELECT COUNT(*) AS total FROM usuarios");
      totalUsuarios = toNumber(totalUsuariosRows[0]?.total);
    }

    const metrics = {
      totalUsuarios,
      totalVentas: toNumber(totalVentasRows[0]?.total),
      totalProductos: toNumber(totalProductosRows[0]?.total),
      totalVendido: toNumber(totalVendidoRows[0]?.total),
    };

    const response: DashboardSummaryResponse = {
      role,
      metrics,
    };

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  } finally {
    connection.release();
  }
};
