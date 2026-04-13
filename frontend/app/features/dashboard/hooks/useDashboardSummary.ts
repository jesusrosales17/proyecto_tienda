import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { DashboardMetrics, DashboardSummaryResponse } from "../types/dashboard.types";

const emptyMetrics: DashboardMetrics = {
  totalUsuarios: null,
  totalVentas: 0,
  totalProductos: 0,
  totalVendido: 0,
};

export const useDashboardSummary = () => {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<DashboardSummaryResponse["role"] | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics);

  const getSummary = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/dashboard/summary`, {
        credentials: "include",
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        toast.error(err.message || err.error || "No se pudo cargar el dashboard");
        return;
      }

      const data = (await response.json()) as DashboardSummaryResponse;
      setRole(data.role);
      setMetrics(data.metrics ?? emptyMetrics);
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado al cargar el dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getSummary();
  }, [getSummary]);

  return {
    loading,
    role,
    metrics,
    getSummary,
  };
};
