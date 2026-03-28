import type { RowDataPacket } from "mysql2";

export interface UserBase {
  id: number;
  email: string;
  nombre: string;
}

export interface UserAuthRow extends RowDataPacket, UserBase {
  password: string;
}
