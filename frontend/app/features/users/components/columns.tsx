import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "~/components/ui/badge";

import { UserState, type UserBase } from "../types/user.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Edit, MoreHorizontal, ToggleLeft, ToggleRight } from "lucide-react";

export const getColumns = (
  onEditUser: (user: UserBase) => void,
  onToggleUserState: (user: UserBase) => void,
): ColumnDef<UserBase>[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const isActive = row.original.estado === UserState.Active;

      return (
        <Badge
          className={`${isActive ? "bg-green-100 text-green-800 border-green-800" : "bg-gray-100 text-gray-800  "}`}
        >
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "rol",
    header: "Rol",
  },
  {
    accessorKey: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const user: UserBase = row.original;
      const isActive = user.estado === UserState.Active;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"ghost"}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            >
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-xl border-border/80 bg-popover/95 p-1.5 shadow-xl backdrop-blur"
            align="end"
          >
            <DropdownMenuLabel className="text-primary">Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="rounded-lg transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary data-highlighted:bg-primary/10 data-highlighted:text-primary"
              onClick={() => onEditUser(user)}
            >
              <Edit />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex items-center gap-2 rounded-lg transition-colors ${
                isActive
                  ? "text-red-600 hover:bg-red-500/10 hover:text-red-700 focus:bg-red-500/10 focus:text-red-700 data-highlighted:bg-red-500/10 data-highlighted:text-red-700"
                  : "text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-800 focus:bg-emerald-500/10 focus:text-emerald-800 data-highlighted:bg-emerald-500/10 data-highlighted:text-emerald-800"
              }`}
              onClick={() => onToggleUserState(user)}
            >
              {isActive ? (
                <ToggleLeft className="h-4 w-4" />
              ) : (
                <ToggleRight className="h-4 w-4" />
              )}

              <span className="text-sm font-medium">
                {isActive ? "Desactivar usuario" : "Activar usuario"}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
