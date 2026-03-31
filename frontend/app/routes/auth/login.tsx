import { Login } from "~/features/auth/components/Login";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [{title: "Inicia sesión"}
  ] 
}

export default function loginPage() {
  return <Login />
}