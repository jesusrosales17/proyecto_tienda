import type { RowDataPacket } from "mysql2";
import type { UserRole } from "./user.types.js";

export interface CountRow extends RowDataPacket {
  total: number;
}

export interface SumRow extends RowDataPacket {
  total: number | null;
}

export interface DashboardMetrics {
  totalUsuarios: number | null;
  totalVentas: number;
  totalProductos: number;
  totalVendido: number;
}

export interface DashboardSummaryResponse {
  role: UserRole;
  metrics: DashboardMetrics;
}
