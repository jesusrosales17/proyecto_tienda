import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { ProductState, type ProductBase } from "../types/product.types";

const money = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);

export const getColumns = (
  onEditProduct: (product: ProductBase) => void,
  onDeleteProduct: (product: ProductBase) => void,
): ColumnDef<ProductBase>[] => [
  {
    accessorKey: "nombre",
    header: "Producto",
    cell: ({ row }) => {
      const desc = row.original.descripcion?.trim();
      return (
        <div>
          <div className="font-medium">{row.original.nombre}</div>
          {desc ? (
            <div className="text-xs text-muted-foreground line-clamp-2 max-w-[240px]">
              {desc}
            </div>
          ) : null}
        </div>
      );
    },
  },
  {
    accessorKey: "precio_compra",
    header: "Precio compra",
    cell: ({ row }) => money(row.original.precio_compra),
  },
  {
    accessorKey: "precio_venta",
    header: "Precio venta",
    cell: ({ row }) => money(row.original.precio_venta),
  },
  {
    accessorKey: "cantidad_inventario",
    header: "Inventario",
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const isActive = row.original.estado === ProductState.Active;
      return (
        <Badge
          className={`${isActive ? "bg-green-100 text-green-800 border-green-800" : "bg-gray-100 text-gray-800"}`}
        >
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
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
              onClick={() => onEditProduct(product)}
            >
              <Edit />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-lg text-red-600 hover:bg-red-500/10 hover:text-red-700 focus:bg-red-500/10 focus:text-red-700 data-highlighted:bg-red-500/10 data-highlighted:text-red-700"
              onClick={() => onDeleteProduct(product)}
            >
              <Trash2 />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
