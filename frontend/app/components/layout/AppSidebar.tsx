import { LayoutDashboard, LogOut, Package, ShoppingBag, ShoppingCart, Users } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { UserRole } from "~/features/auth/lib/roles";

type SidebarItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

type AppSidebarProps = {
  role: UserRole;
};

const sidebarByRole: Record<UserRole, SidebarItem[]> = {
  [UserRole.Administrador]: [
    { label: "Inicio", to: "/", icon: LayoutDashboard },
    { label: "Compras", to: "/compras", icon: ShoppingCart },
    { label: "Ventas", to: "/ventas", icon: ShoppingBag },
    { label: "Usuarios", to: "/usuarios", icon: Users },
    { label: "Productos", to: "/productos", icon: Package },
  ],
  [UserRole.Vendedor]: [
    { label: "Inicio", to: "/", icon: LayoutDashboard },
    { label: "Ventas", to: "/ventas", icon: ShoppingBag },
  ],
};

export const AppSidebar = ({ role }: AppSidebarProps) => {
  const navigate = useNavigate();
  const items = sidebarByRole[role];

  const handleLogout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("No se pudo cerrar sesión");
        return;
      }

      toast.success("Sesión cerrada");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado");
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="h-16 justify-center border-b px-4">
        <h2 className="text-lg font-semibold">Panel</h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {items.map(({ label, to, icon: Icon }) => (
            <SidebarMenuItem key={to}>
              <SidebarMenuButton asChild tooltip={label}>
                <NavLink to={to} end={to === "/"}>
                  <Icon className="size-4" />
                  <span>{label}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Cerrar sesión"
              className="text-red-600 hover:bg-red-500/10 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
