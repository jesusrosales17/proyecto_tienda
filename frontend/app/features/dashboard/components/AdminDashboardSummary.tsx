import { DashboardStatCard } from "./DashboardStatCard";
import type { DashboardMetrics } from "../types/dashboard.types";

type AdminDashboardSummaryProps = {
  metrics: DashboardMetrics;
  moneyFormatter: Intl.NumberFormat;
};

export const AdminDashboardSummary = ({ metrics, moneyFormatter }: AdminDashboardSummaryProps) => {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardStatCard title="Número de usuarios" value={metrics.totalUsuarios ?? 0} />
      <DashboardStatCard title="Ventas de hoy" value={metrics.totalVentas} />
      <DashboardStatCard title="Total de productos" value={metrics.totalProductos} />
      <DashboardStatCard
        title="Total vendido hoy"
        value={moneyFormatter.format(metrics.totalVendido)}
      />
    </section>
  );
};
