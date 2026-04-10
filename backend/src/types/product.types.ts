import type { RowDataPacket } from "mysql2";

export enum ProductState {
  Active = 1,
  Inactive = 0,
}

/** Filas del SELECT usan alias: nombre_producto AS nombre */
export interface ProductRow extends RowDataPacket {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_compra: string;
  precio_venta: string;
  cantidad_inventario: number;
  estado: ProductState;
}
