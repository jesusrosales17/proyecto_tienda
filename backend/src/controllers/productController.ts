import type { Request, Response, NextFunction } from "express";
import type { ResultSetHeader } from "mysql2";

import pool from "../config/database.js";
import { ProductState, type ProductRow } from "../types/product.types.js";

/** Debe coincidir con VARCHAR(255) en la tabla */
const MAX_NOMBRE_PRODUCTO = 255;

const toNumber = (v: unknown): number => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const mapProduct = (row: ProductRow) => ({
  id: row.id,
  nombre: row.nombre,
  descripcion: row.descripcion ?? "",
  precio_compra: toNumber(row.precio_compra),
  precio_venta: toNumber(row.precio_venta),
  cantidad_inventario: Number(row.cantidad_inventario),
  estado: row.estado,
});

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    let sql =
      "SELECT id, nombre_producto AS nombre, descripcion, precio_compra, precio_venta, cantidad_inventario, estado FROM productos";
    const params: string[] = [];

    if (q) {
      sql += " WHERE nombre_producto LIKE ? OR descripcion LIKE ?";
      const like = `%${q}%`;
      params.push(like, like);
    }

    sql += " ORDER BY nombre_producto ASC";

    const [rows] = await pool.query<ProductRow[]>(sql, params);
    res.status(200).json(rows.map(mapProduct));
  } catch (error) {
    return next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, descripcion, precio_compra, precio_venta, cantidad_inventario, estado } = req.body;

    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      return res.status(400).json({ error: "El nombre del producto es obligatorio" });
    }

    if (nombre.trim().length > MAX_NOMBRE_PRODUCTO) {
      return res.status(400).json({
        error: `El nombre no puede superar ${MAX_NOMBRE_PRODUCTO} caracteres.`,
      });
    }

    const pc = toNumber(precio_compra);
    const pv = toNumber(precio_venta);
    const qty = Number(cantidad_inventario);

    if (!Number.isFinite(pc) || pc < 0) {
      return res.status(400).json({ error: "Precio de compra inválido" });
    }
    if (!Number.isFinite(pv) || pv < 0) {
      return res.status(400).json({ error: "Precio de venta inválido" });
    }
    if (!Number.isInteger(qty) || qty < 0) {
      return res.status(400).json({ error: "La cantidad en inventario debe ser un entero mayor o igual a 0" });
    }

    const estadoVal =
      estado === ProductState.Inactive || estado === 0 || estado === "0"
        ? ProductState.Inactive
        : ProductState.Active;

    const desc =
      descripcion === undefined || descripcion === null
        ? null
        : String(descripcion).trim() || null;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO productos (nombre_producto, descripcion, precio_compra, precio_venta, cantidad_inventario, estado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre.trim(), desc, pc, pv, qty, estadoVal],
    );

    return res.status(201).json({
      message: "Producto creado exitosamente",
      product: {
        id: result.insertId,
        nombre: nombre.trim(),
        descripcion: desc ?? "",
        precio_compra: pc,
        precio_venta: pv,
        cantidad_inventario: qty,
        estado: estadoVal,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio_compra, precio_venta, cantidad_inventario, estado } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID del producto es requerido" });
    }

    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      return res.status(400).json({ error: "El nombre del producto es obligatorio" });
    }

    if (nombre.trim().length > MAX_NOMBRE_PRODUCTO) {
      return res.status(400).json({
        error: `El nombre no puede superar ${MAX_NOMBRE_PRODUCTO} caracteres.`,
      });
    }

    const pc = toNumber(precio_compra);
    const pv = toNumber(precio_venta);
    const qty = Number(cantidad_inventario);

    if (!Number.isFinite(pc) || pc < 0) {
      return res.status(400).json({ error: "Precio de compra inválido" });
    }
    if (!Number.isFinite(pv) || pv < 0) {
      return res.status(400).json({ error: "Precio de venta inválido" });
    }
    if (!Number.isInteger(qty) || qty < 0) {
      return res.status(400).json({ error: "La cantidad en inventario debe ser un entero mayor o igual a 0" });
    }

    const estadoVal =
      estado === ProductState.Inactive || estado === 0 || estado === "0"
        ? ProductState.Inactive
        : ProductState.Active;

    const desc =
      descripcion === undefined || descripcion === null
        ? null
        : String(descripcion).trim() || null;

    const [existing] = await pool.query<ProductRow[]>("SELECT id FROM productos WHERE id = ?", [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    await pool.query<ResultSetHeader>(
      `UPDATE productos SET nombre_producto = ?, descripcion = ?, precio_compra = ?, precio_venta = ?, cantidad_inventario = ?, estado = ?
       WHERE id = ?`,
      [nombre.trim(), desc, pc, pv, qty, estadoVal, id],
    );

    return res.status(200).json({
      message: "Producto actualizado exitosamente",
      product: {
        id: Number(id),
        nombre: nombre.trim(),
        descripcion: desc ?? "",
        precio_compra: pc,
        precio_venta: pv,
        cantidad_inventario: qty,
        estado: estadoVal,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID del producto es requerido" });
    }

    const [result] = await pool.query<ResultSetHeader>("DELETE FROM productos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    return res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    return next(error);
  }
};
