import { useState } from "react";

import { ProductState, type ProductBase } from "../types/product.types";

type FormMode = "create" | "edit";

type ProductFormValues = {
  nombre: string;
  descripcion: string;
  precio_compra: string;
  precio_venta: string;
  cantidad_inventario: string;
  estado: string;
};

type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

interface Options {
  createProduct: (payload: {
    nombre: string;
    descripcion: string;
    precio_compra: number;
    precio_venta: number;
    cantidad_inventario: number;
    estado: number;
  }) => Promise<boolean>;
  updateProduct: (
    id: number,
    payload: {
      nombre: string;
      descripcion: string;
      precio_compra: number;
      precio_venta: number;
      cantidad_inventario: number;
      estado: number;
    },
  ) => Promise<boolean>;
}

const DEFAULT_VALUES: ProductFormValues = {
  nombre: "",
  descripcion: "",
  precio_compra: "0",
  precio_venta: "0",
  cantidad_inventario: "0",
  estado: String(ProductState.Active),
};

export const useProductForm = ({ createProduct, updateProduct }: Options) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<FormMode>("create");
  const [loading, setLoading] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);
  const [values, setValues] = useState<ProductFormValues>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<ProductFormErrors>({});

  const openCreate = () => {
    setMode("create");
    setCurrentProductId(null);
    setValues(DEFAULT_VALUES);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (product: ProductBase) => {
    setMode("edit");
    setCurrentProductId(product.id);
    setValues({
      nombre: product.nombre,
      descripcion: product.descripcion ?? "",
      precio_compra: String(product.precio_compra),
      precio_venta: String(product.precio_venta),
      cantidad_inventario: String(product.cantidad_inventario),
      estado: String(product.estado),
    });
    setErrors({});
    setOpen(true);
  };

  const onOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setErrors({});
    }
  };

  const setField = <K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: ProductFormErrors = {};

    if (!values.nombre.trim()) {
      nextErrors.nombre = "El nombre es obligatorio";
    } else if (values.nombre.trim().length > 255) {
      nextErrors.nombre = "El nombre no puede superar 255 caracteres";
    }

    const pc = parseFloat(values.precio_compra);
    if (!Number.isFinite(pc) || pc < 0) {
      nextErrors.precio_compra = "Precio de compra inválido";
    }

    const pv = parseFloat(values.precio_venta);
    if (!Number.isFinite(pv) || pv < 0) {
      nextErrors.precio_venta = "Precio de venta inválido";
    }

    const qty = parseInt(values.cantidad_inventario, 10);
    if (!Number.isInteger(qty) || qty < 0) {
      nextErrors.cantidad_inventario = "Cantidad inválida (entero ≥ 0)";
    }

    if (values.estado !== String(ProductState.Active) && values.estado !== String(ProductState.Inactive)) {
      nextErrors.estado = "Estado inválido";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      nombre: values.nombre.trim(),
      descripcion: values.descripcion.trim(),
      precio_compra: parseFloat(values.precio_compra),
      precio_venta: parseFloat(values.precio_venta),
      cantidad_inventario: parseInt(values.cantidad_inventario, 10),
      estado: Number(values.estado),
    };

    setLoading(true);

    try {
      if (mode === "edit" && currentProductId == null) {
        return;
      }

      const ok =
        mode === "create"
          ? await createProduct(payload)
          : await updateProduct(currentProductId!, payload);

      if (!ok) return;

      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};
