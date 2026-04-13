import type { NextFunction, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

import pool from "../config/database.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import type { CompraItemInput, CreateCompraBody, ProductoCompraRow } from "../types/compras.types.js";

/** Lista productos activos para armar una compra (precio de compra + stock). */
export const getProductosParaCompra = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const [rows] = await pool.query<ProductoCompraRow[]>(
      `SELECT 
        id, 
        nombre_producto AS nombre, 
        precio_compra AS precioCompra, 
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

export const getProveedoresHistoricos = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT TRIM(proveedor) AS proveedor
       FROM compras
       WHERE proveedor IS NOT NULL AND TRIM(proveedor) <> ''
       ORDER BY proveedor ASC`
    );

    const proveedores = rows.map((row) => String(row.proveedor));
    return res.status(200).json(proveedores);
  } catch (error) {
    return next(error);
  }
};

export const getCompras = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        c.id,
        c.proveedor,
        c.total,
        c.fecha,
        u.nombre AS usuario,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'nombre', p.nombre_producto,
            'cantidad', dc.cantidad_comprada,
            'precio', dc.precio_unitario
          )
        ) AS productos
      FROM compras c
      INNER JOIN usuarios u ON u.id = c.usuario_id
      INNER JOIN detalle_compras dc ON dc.compra_id = c.id
      INNER JOIN productos p ON p.id = dc.producto_id
      GROUP BY c.id, u.nombre
      ORDER BY c.fecha DESC
      LIMIT 30`
    );

    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
};

const mergeItems = (productos: CompraItemInput[]) => {
  const mergedByProduct = new Map<number, { cantidad: number; precioCompra: number }>();
  for (const item of productos) {
    const productoId = Number(item.productoId);
    const cantidad = Number(item.cantidad);
    const precioCompra = Number(item.precioCompra);
    const current = mergedByProduct.get(productoId);
    mergedByProduct.set(productoId, {
      cantidad: (current?.cantidad ?? 0) + cantidad,
      precioCompra,
    });
  }
  return mergedByProduct;
};

export const createCompra = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const connection = await pool.getConnection();

  try {
    const { proveedor, productos } = req.body as CreateCompraBody;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (!proveedor || !proveedor.trim()) {
      return res.status(400).json({ error: "El proveedor es obligatorio" });
    }

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: "Debe agregar al menos un producto" });
    }

    const normalizedItems = productos.map((item) => ({
      productoId: Number(item.productoId),
      cantidad: Number(item.cantidad),
      precioCompra: Number(item.precioCompra),
    }));

    const hasInvalidItem = normalizedItems.some(
      (item) =>
        !Number.isInteger(item.productoId) ||
        item.productoId <= 0 ||
        !Number.isInteger(item.cantidad) ||
        item.cantidad <= 0 ||
        !Number.isFinite(item.precioCompra) ||
        item.precioCompra <= 0
    );

    if (hasInvalidItem) {
      return res.status(400).json({ error: "Los productos enviados no son válidos" });
    }

    const mergedByProduct = mergeItems(normalizedItems);
    const productIds = [...mergedByProduct.keys()];

    await connection.beginTransaction();

    const [productRows] = await connection.query<ProductoCompraRow[]>(
      `SELECT 
        id, 
        nombre_producto AS nombre, 
        precio_compra AS precioCompra, 
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

    const productMap = new Map<number, ProductoCompraRow>(productRows.map((row) => [row.id, row]));

    let total = 0;
    const detalleValues: Array<[number, number, number]> = [];
    const stockAdds: Array<[number, number]> = [];
    const purchasePriceUpdates: Array<[number, number]> = [];

    for (const [productoId, item] of mergedByProduct.entries()) {
      const cantidadComprada = item.cantidad;
      const product = productMap.get(productoId);

      if (!product || product.estado !== 1) {
        await connection.rollback();
        return res.status(400).json({ error: `Producto no disponible: ${productoId}` });
      }

      const precioUnitario = Number(item.precioCompra);
      total += precioUnitario * cantidadComprada;
      detalleValues.push([productoId, cantidadComprada, precioUnitario]);
      stockAdds.push([cantidadComprada, productoId]);
      purchasePriceUpdates.push([precioUnitario, productoId]);
    }

    const [compraResult] = await connection.query<ResultSetHeader>(
      "INSERT INTO compras (usuario_id, proveedor, total) VALUES (?, ?, ?)",
      [usuarioId, proveedor.trim(), total]
    );

    const compraId = compraResult.insertId;

    for (const [productoId, cantidadComprada, precioUnitario] of detalleValues) {
      await connection.query<ResultSetHeader>(
        "INSERT INTO detalle_compras (compra_id, producto_id, cantidad_comprada, precio_unitario) VALUES (?, ?, ?, ?)",
        [compraId, productoId, cantidadComprada, precioUnitario]
      );
    }

    for (const [cantidadComprada, productoId] of stockAdds) {
      await connection.query<ResultSetHeader>(
        "UPDATE productos SET cantidad_inventario = cantidad_inventario + ? WHERE id = ?",
        [cantidadComprada, productoId]
      );
    }

    for (const [precioCompra, productoId] of purchasePriceUpdates) {
      await connection.query<ResultSetHeader>(
        "UPDATE productos SET precio_compra = ? WHERE id = ?",
        [precioCompra, productoId]
      );
    }

    await connection.commit();

    return res.status(201).json({
      message: "Compra registrada correctamente",
      compra: {
        id: compraId,
        proveedor: proveedor.trim(),
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
