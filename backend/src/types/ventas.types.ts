import type { RowDataPacket } from "mysql2";

export interface VentaItemInput {
  productoId: number;
  cantidad: number;
}

export interface CreateVentaBody {
  cliente?: string;
  productos?: VentaItemInput[];
}

export interface ProductoVentaRow extends RowDataPacket {
  id: number;
  nombre: string;
  precioVenta: number;
  stock: number;
  estado: number;
}

