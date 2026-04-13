import { AdminDashboardSummary } from "~/features/dashboard/components/AdminDashboardSummary";
import { DashboardSummarySkeleton } from "~/features/dashboard/components/DashboardSummarySkeleton";
import { SellerDashboardSummary } from "~/features/dashboard/components/SellerDashboardSummary";
import { useDashboardSummary } from "~/features/dashboard/hooks/useDashboardSummary";
import { moneyFormatter } from "~/features/dashboard/lib/formatters";
import { UserRole } from "~/features/auth/lib/roles";

export default function DashboardPage() {
  const { loading, role, metrics } = useDashboardSummary();

  if (loading) {
    return <DashboardSummarySkeleton cards={role === UserRole.Administrador ? 4 : 3} />;
  }

  if (role === UserRole.Administrador) {
    return <AdminDashboardSummary metrics={metrics} moneyFormatter={moneyFormatter} />;
  }

  return <SellerDashboardSummary metrics={metrics} moneyFormatter={moneyFormatter} />;
}
