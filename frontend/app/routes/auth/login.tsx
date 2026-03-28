import { Login } from "~/features/auth/components/Login";
import {  type Route } from '../../../.react-router/types/app/routes/+types/home';

export function meta({}: Route.MetaArgs) {
  return [{title: "Inicia sesión"}
  ] 
}

export default function login() {
  return <Login />
}