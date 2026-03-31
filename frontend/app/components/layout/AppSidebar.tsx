import { LayoutDashboard, ShoppingBag, ShoppingCart, Users, Package } from "lucide-react";
import { NavLink } from "react-router";

import {
  Sidebar,
  SidebarContent,
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
  const items = sidebarByRole[role];

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
    </Sidebar>
  );
};
