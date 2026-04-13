import { DashboardStatCard } from "./DashboardStatCard";
import type { DashboardMetrics } from "../types/dashboard.types";

type SellerDashboardSummaryProps = {
  metrics: DashboardMetrics;
  moneyFormatter: Intl.NumberFormat;
};

export const SellerDashboardSummary = ({ metrics, moneyFormatter }: SellerDashboardSummaryProps) => {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <DashboardStatCard title="Mis ventas de hoy" value={metrics.totalVentas} />
      <DashboardStatCard title="Total de productos" value={metrics.totalProductos} />
      <DashboardStatCard
        title="Total que he vendido hoy"
        value={moneyFormatter.format(metrics.totalVendido)}
      />
    </section>
  );
};
