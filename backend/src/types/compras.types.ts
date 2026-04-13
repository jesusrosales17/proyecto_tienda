import type { RowDataPacket } from "mysql2";

export interface CompraItemInput {
  productoId: number;
  cantidad: number;
  precioCompra: number;
}

export interface CreateCompraBody {
  proveedor?: string;
  productos?: CompraItemInput[];
}

export interface ProductoCompraRow extends RowDataPacket {
  id: number;
  nombre: string;
  precioCompra: number;
  stock: number;
  estado: number;
}
