import type { UserRole } from "~/features/auth/lib/roles";

export type DashboardMetrics = {
  totalUsuarios: number | null;
  totalVentas: number;
  totalProductos: number;
  totalVendido: number;
};

export type DashboardSummaryResponse = {
  role: UserRole;
  metrics: DashboardMetrics;
};
