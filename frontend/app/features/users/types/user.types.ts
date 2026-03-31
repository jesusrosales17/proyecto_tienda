
export type UserRole = "Administrador" | "Vendedor";
export enum UserState {
  Active = 1,
  Innactive = 0
}
export interface UserBase {
  id: number;
  email: string;
  nombre: string;
  rol: UserRole;
  estado: number;
}
