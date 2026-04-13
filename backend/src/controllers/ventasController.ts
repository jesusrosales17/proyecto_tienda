import type { NextFunction, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

import pool from "../config/database.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import type { CreateVentaBody, ProductoVentaRow } from "../types/ventas.types.js";

export const getProductosDisponibles = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const [rows] = await pool.query<ProductoVentaRow[]>(
      `SELECT 
        id, 
        nombre_producto AS nombre, 
        precio_venta AS precioVenta, 
        cantidad_inventario AS stock, 
        estado
      FROM productos
      WHERE estado = 1
      ORDER BY nombre_producto ASC`
    );

    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
};

export const getClientesHistoricos = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT TRIM(cliente) AS cliente
       FROM ventas
       WHERE cliente IS NOT NULL AND TRIM(cliente) <> ''
       ORDER BY cliente ASC`
    );

    const clientes = rows.map((row) => String(row.cliente));
    return res.status(200).json(clientes);
  } catch (error) {
    return next(error);
  }
};

export const getVentas = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const role = req.user?.rol;
    const userId = req.user?.id;

    if (!role || !userId) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const whereClause = role === "Administrador" ? "" : "WHERE v.usuario_id = ?";
    const queryParams = role === "Administrador" ? [] : [userId];

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        v.id,
        v.cliente,
        v.total,
        v.fecha,
        u.nombre AS vendedor,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'nombre', p.nombre_producto,
            'cantidad', dv.cantidad_vendida,
            'precio', dv.precio_unitario
          )
        ) AS productos
      FROM ventas v
      INNER JOIN usuarios u ON u.id = v.usuario_id
      INNER JOIN detalle_ventas dv ON dv.venta_id = v.id
      INNER JOIN productos p ON p.id = dv.producto_id
      ${whereClause}
      GROUP BY v.id, u.nombre
      ORDER BY v.fecha DESC`,
      queryParams,
    );

    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
};

export const createVenta = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const connection = await pool.getConnection();

  try {
    const { cliente, productos } = req.body as CreateVentaBody;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (!cliente || !cliente.trim()) {
      return res.status(400).json({ error: "El cliente es obligatorio" });
    }

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: "Debe agregar al menos un producto" });
    }

    const normalizedItems = productos.map((item) => ({
      productoId: Number(item.productoId),
      cantidad: Number(item.cantidad),
    }));

    const hasInvalidItem = normalizedItems.some(
      (item) =>
        !Number.isInteger(item.productoId) ||
        item.productoId <= 0 ||
        !Number.isInteger(item.cantidad) ||
        item.cantidad <= 0
    );

    if (hasInvalidItem) {
      return res.status(400).json({ error: "Los productos enviados no son válidos" });
    }

    const mergedByProduct = new Map<number, number>();
    for (const item of normalizedItems) {
      mergedByProduct.set(item.productoId, (mergedByProduct.get(item.productoId) ?? 0) + item.cantidad);
    }

    const productIds = [...mergedByProduct.keys()];

    await connection.beginTransaction();

    const [productRows] = await connection.query<ProductoVentaRow[]>(
      `SELECT 
        id, 
        nombre_producto AS nombre, 
        precio_venta AS precioVenta, 
        cantidad_inventario AS stock, 
        estado
      FROM productos
      WHERE id IN (?) FOR UPDATE`,
      [productIds]
    );

    if (productRows.length !== productIds.length) {
      await connection.rollback();
      return res.status(400).json({ error: "Uno o más productos no existen" });
    }

    const productMap = new Map<number, ProductoVentaRow>(productRows.map((row) => [row.id, row]));

    let total = 0;
    const detalleValues: Array<[number, number, number]> = [];
    const stockUpdates: Array<[number, number]> = [];

    for (const [productoId, cantidadVendida] of mergedByProduct.entries()) {
      const product = productMap.get(productoId);

      if (!product || product.estado !== 1) {
        await connection.rollback();
        return res.status(400).json({ error: `Producto no disponible: ${productoId}` });
      }

      if (cantidadVendida > product.stock) {
        await connection.rollback();
        return res.status(400).json({
          error: `Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}`,
        });
      }

      const precioUnitario = Number(product.precioVenta);
      total += precioUnitario * cantidadVendida;
      detalleValues.push([productoId, cantidadVendida, precioUnitario]);
      stockUpdates.push([cantidadVendida, productoId]);
    }

    const [ventaResult] = await connection.query<ResultSetHeader>(
      "INSERT INTO ventas (usuario_id, cliente, total) VALUES (?, ?, ?)",
      [usuarioId, cliente.trim(), total]
    );

    const ventaId = ventaResult.insertId;

    for (const [productoId, cantidadVendida, precioUnitario] of detalleValues) {
      await connection.query<ResultSetHeader>(
        "INSERT INTO detalle_ventas (venta_id, producto_id, cantidad_vendida, precio_unitario) VALUES (?, ?, ?, ?)",
        [ventaId, productoId, cantidadVendida, precioUnitario]
      );
    }

    for (const [cantidadVendida, productoId] of stockUpdates) {
      await connection.query<ResultSetHeader>(
        "UPDATE productos SET cantidad_inventario = cantidad_inventario - ? WHERE id = ?",
        [cantidadVendida, productoId]
      );
    }

    await connection.commit();

    return res.status(201).json({
      message: "Venta registrada correctamente",
      venta: {
        id: ventaId,
        cliente: cliente.trim(),
        total: Number(total.toFixed(2)),
      },
    });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
};

