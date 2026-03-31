export enum UserRole {
  Administrador = "Administrador",
  Vendedor = "Vendedor",
}

export type AuthUser = {
  id?: string | number;
  nombre?: string;
  email?: string;
  rol: UserRole;
  [key: string]: unknown;
};

export const isUserRole = (value: unknown): value is UserRole => {
  return value === UserRole.Administrador || value === UserRole.Vendedor;
};
