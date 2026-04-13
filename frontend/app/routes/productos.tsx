import { PlusIcon } from "lucide-react";
import { useOutletContext } from "react-router";

import { Button } from "~/components/ui/button";
import { UserRole } from "~/features/auth/lib/roles";
import { ProductFormModal } from "~/features/products/components/ProductFormModal";
import { ProductsTable } from "~/features/products/components/ProductsTable";
import { useProductForm } from "~/features/products/hooks/useProductForm";
import { useProducts } from "~/features/products/hooks/useProducts";

import type { Route } from "./+types/productos";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Productos" }];
}

type AppLayoutContext = {
  userRole: UserRole;
};

export default function ProductosPage() {
  const { userRole } = useOutletContext<AppLayoutContext>();
  const canManageProducts = userRole === UserRole.Administrador;
  const { productsList, createProduct, updateProduct, deleteProduct } = useProducts();
  const {
    open,
    mode,
    loading,
    values,
    errors,
    openCreate,
    openEdit,
    onOpenChange,
    setField,
    submit,
  } = useProductForm({ createProduct, updateProduct });

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Catálogo, precios e inventario.
            {!canManageProducts ? " Vista de solo consulta para vendedor." : ""}
          </p>
        </div>
        {canManageProducts ? (
          <Button onClick={openCreate}>
            <PlusIcon /> Registrar producto
          </Button>
        ) : null}
      </div>

      <ProductsTable
        products={productsList}
        onEditProduct={openEdit}
        onDeleteProduct={deleteProduct}
        canManageProducts={canManageProducts}
      />

      {canManageProducts ? (
        <ProductFormModal
          open={open}
          mode={mode}
          loading={loading}
          values={values}
          errors={errors}
          onOpenChange={onOpenChange}
          setField={setField}
          onSubmit={submit}
        />
      ) : null}
    </>
  );
}
