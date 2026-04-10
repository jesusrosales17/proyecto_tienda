import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { ProductState, type ProductBase } from "../types/product.types";
import { getColumns } from "./columns";
import {
  ProductsTableFilters,
  type ProductsStatusFilter,
} from "./ProductsTableFilters";

interface Props {
  products: ProductBase[];
  onEditProduct: (product: ProductBase) => void;
  onDeleteProduct: (product: ProductBase) => void;
}

export const ProductsTable = ({
  products,
  onEditProduct,
  onDeleteProduct,
}: Props) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductsStatusFilter>("all");
  const columns = useMemo(
    () => getColumns(onEditProduct, onDeleteProduct),
    [onEditProduct, onDeleteProduct],
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((p) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? p.estado === ProductState.Active
            : p.estado === ProductState.Inactive;

      if (!matchesStatus) return false;

      if (!query) return true;

      const desc = (p.descripcion ?? "").toLowerCase();
      return p.nombre.toLowerCase().includes(query) || desc.includes(query);
    });
  }, [products, search, statusFilter]);

  const table = useReactTable({
    data: filteredProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalStock = useMemo(
    () => products.reduce((sum, p) => sum + p.cantidad_inventario, 0),
    [products],
  );

  return (
    <>
      <div className="mb-4 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Inventario total: </span>
        {totalStock} unidades en catálogo ({products.length} productos)
      </div>

      <ProductsTableFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="bg-slate-600 hover:bg-slate-600"
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => (
                  <TableHead className="text-white" key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay productos para mostrar
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
