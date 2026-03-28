import { useRef } from "react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const Login = () => {
  const emailInput = useRef<HTMLInputElement | null>(null);
  const passwordInput = useRef<HTMLInputElement | null>(null);

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = emailInput.current?.value;
    const password = passwordInput.current?.value;

    console.log({email, password})
  };

  return (
    <main className="relative grid min-h-[calc(100dvh-4rem)] place-items-center px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.97_0_0),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,oklch(0.24_0_0),transparent_55%)]" />

      <Card className="relative z-10 w-full max-w-md border-border/70 bg-card/95 shadow-xl backdrop-blur">
        <CardHeader className="space-y-2 text-center mb-7">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Bienvenido de nuevo
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Inicia sesión para continuar en el sistema.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                ref={emailInput}
                id="email"
                type="email"
                placeholder="tu@correo.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
              </div>
              <Input
                ref={passwordInput}
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" className="h-10 w-full">
              Iniciar sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};
