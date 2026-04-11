export enum ProductState {
  Active = 1,
  Inactive = 0,
}

export interface ProductBase {
  id: number;
  nombre: string;
  descripcion: string;
  precio_compra: number;
  precio_venta: number;
  cantidad_inventario: number;
  estado: number;
}
