import { PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/usuarios";
import { useState } from "react";
import { useUsers } from "~/features/users/hooks/useUsers";
import { UserState } from "~/features/users/types/user.types";
import { UsersTable } from "~/features/users/components/UsersTable";

export function meta({}: Route.MetaArgs) {
  return [
    {
      title: "Gestion de usuarios",
    },
  ];
}

export default function UsuariosPage() {
  const { usersList } = useUsers();

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Administra los usuarios que pueden acceder al sistema
          </p>
        </div>
        <Button>
          <PlusIcon /> Agregar Usuario
        </Button>
      </div>

        <UsersTable users={usersList} />
      
    </>
  );
}
