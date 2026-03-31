import type { RowDataPacket } from "mysql2";

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
}

export interface UserAuthRow extends RowDataPacket, UserBase {
  password: string;
}

export interface UserWithEstadoRow extends RowDataPacket, Pick<UserBase, 'id'> {
  estado: UserState;
}