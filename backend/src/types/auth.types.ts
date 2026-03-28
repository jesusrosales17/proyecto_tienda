import type { UserBase } from "./user.types.js";

export interface LoginBody {
  email?: string;
  password?: string;
}

export interface AuthTokenPayload {
  id: number;
  email: string;
  nombre: string;
}

export interface LoginSuccessResponse {
  message: string;
  token: string;
  user: UserBase;
}
