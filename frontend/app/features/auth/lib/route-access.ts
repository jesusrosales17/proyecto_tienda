import { UserRole } from "~/features/auth/lib/roles";

const roleRoutePrefixes: Record<UserRole, string[]> = {
  [UserRole.Administrador]: ["/", "/ventas", "/compras", "/usuarios", "/productos"],
  [UserRole.Vendedor]: ["/", "/ventas"],
};

export const isRouteAllowedForRole = (pathname: string, role: UserRole): boolean => {
  const allowedPrefixes = roleRoutePrefixes[role];

  return allowedPrefixes.some((prefix) => {
    if (prefix === "/") {
      return pathname === "/";
    }

    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
};
