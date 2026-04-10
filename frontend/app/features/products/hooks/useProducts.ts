import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { ProductBase } from "../types/product.types";

type SaveProductPayload = {
  nombre: string;
  descripcion: string;
  precio_compra: number;
  precio_venta: number;
  cantidad_inventario: number;
  estado: number;
};

export const useProducts = () => {
  const [productsList, setProductsList] = useState<ProductBase[]>([]);

  const getProducts = useCallback(async () => {
    const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products`, {
      credentials: "include",
    });

    if (!result.ok) {
      const err = await result.json().catch(() => ({}));
      toast.error(err.error || "No se pudo cargar el catálogo", { duration: 5000 });
      setProductsList([]);
      return;
    }

    const products = (await result.json()) as ProductBase[];
    setProductsList(products);
  }, []);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const createProduct = useCallback(async (payload: SaveProductPayload) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "No se pudo crear el producto", {
          duration: 5000,
        });
        return false;
      }

      const created = (result.product ?? result.data ?? result) as ProductBase;

      if (created?.id) {
        setProductsList((prev) => [created, ...prev]);
      } else {
        await getProducts();
      }

      toast.success("Producto registrado");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado");
      return false;
    }
  }, [getProducts]);

  const updateProduct = useCallback(
    async (id: number, payload: SaveProductPayload) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/products/${id}`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        const result = await response.json();

        if (!response.ok) {
          toast.error(result.error || "No se pudo actualizar el producto", {
            duration: 5000,
          });
          return false;
        }

        const updated = (result.product ?? result.data ?? result) as ProductBase;

        setProductsList((prev) =>
          prev.map((p) => {
            if (p.id !== id) return p;
            if (updated?.id) return updated;
            return {
              ...p,
              ...payload,
            };
          }),
        );

        toast.success("Producto actualizado");
        return true;
      } catch (error) {
        console.error(error);
        toast.error("Ocurrió un error inesperado");
        return false;
      }
    },
    [],
  );

  const deleteProduct = useCallback(async (product: ProductBase) => {
    if (!window.confirm(`¿Eliminar el producto «${product.nombre}»? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/products/${product.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(result.error || "No se pudo eliminar el producto", {
          duration: 5000,
        });
        return;
      }

      setProductsList((prev) => prev.filter((p) => p.id !== product.id));
      toast.success("Producto eliminado");
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado");
    }
  }, []);

  return {
    productsList,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
