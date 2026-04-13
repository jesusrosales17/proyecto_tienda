import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

import { AppSidebar } from "~/components/layout/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { isRouteAllowedForRole } from "~/features/auth/lib/route-access";
import { isUserRole } from "~/features/auth/lib/roles";
import type { AuthUser } from "~/features/auth/lib/roles";

type ApiMeResponse = {
  user?: Record<string, unknown>;
  [key: string]: unknown;
};

const getRoleFromPayload = (payload: Record<string, unknown> | null): AuthUser["rol"] | null => {
  if (!payload) {
    return null;
  }

  const role = payload.role ?? payload.rol;

  return isUserRole(role) ? role : null;
};

export const ProtectedAppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadCurrentUser = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          navigate("/login", { replace: true });
          return;
        }

        const payload = (await response.json()) as ApiMeResponse;
        const userCandidate =
          payload.user && typeof payload.user === "object"
            ? payload.user
            : ((payload as Record<string, unknown>) ?? null);

        const role = getRoleFromPayload(userCandidate as Record<string, unknown> | null);

        if (!role) {
          navigate("/login", { replace: true });
          return;
        }

        setUser({ ...(userCandidate as Record<string, unknown>), rol: role });
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") {
          return;
        }

        navigate("/login", { replace: true });
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      controller.abort();
    };
  }, [navigate]);

  const hasAccess = useMemo(() => {
    if (!user) {
      return false;
    }

    return isRouteAllowedForRole(location.pathname, user.rol);
  }, [location.pathname, user]);

  useEffect(() => {
    if (!isLoading && user && !hasAccess) {
      toast.error("No tienes permisos para acceder a esa ruta");
      navigate("/", { replace: true });
    }
  }, [hasAccess, isLoading, navigate, user]);

  if (isLoading) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <p className="text-sm text-muted-foreground">Cargando sesión...</p>
      </main>
    );
  }

  if (!user || !hasAccess) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar role={user.rol} />

      <SidebarInset className="min-w-0 md:pl-0">
        <header className="flex h-16 items-center gap-2 border-b pl-2 pr-3 sm:pl-3 sm:pr-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <p className="text-xs text-muted-foreground">
              Hola{user.nombre ? `, ${String(user.nombre)}` : ""}.
            </p>
          </div>
        </header>

        <main className="flex-1 w-full min-w-0 py-5 pl-1 pr-3 sm:py-6 sm:pl-2 sm:pr-4 lg:pr-6">
          <Outlet context={{ userRole: user.rol }} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
