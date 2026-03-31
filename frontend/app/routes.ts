import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("login", "routes/auth/login.tsx"),
  route("", "routes/app-layout.tsx", [
    index("routes/dashboard.tsx"),
    route("ventas", "routes/ventas.tsx"),
    route("compras", "routes/compras.tsx"),
    route("usuarios", "routes/usuarios.tsx"),
    route("productos", "routes/productos.tsx"),
  ]),
] satisfies RouteConfig;
