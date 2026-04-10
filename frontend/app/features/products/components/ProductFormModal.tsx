import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

import { ProductState } from "../types/product.types";

type FormMode = "create" | "edit";

interface Props {
  open: boolean;
  mode: FormMode;
  loading: boolean;
  values: {
    nombre: string;
    descripcion: string;
    precio_compra: string;
    precio_venta: string;
    cantidad_inventario: string;
    estado: string;
  };
  errors: Partial<
    Record<
      "nombre" | "descripcion" | "precio_compra" | "precio_venta" | "cantidad_inventario" | "estado",
      string
    >
  >;
  onOpenChange: (open: boolean) => void;
  setField: (
    field:
      | "nombre"
      | "descripcion"
      | "precio_compra"
      | "precio_venta"
      | "cantidad_inventario"
      | "estado",
    value: string,
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const textareaClass = cn(
  "min-h-[88px] w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80",
);

export const ProductFormModal = ({
  open,
  mode,
  loading,
  values,
  errors,
  onOpenChange,
  setField,
  onSubmit,
}: Props) => {
  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar producto" : "Registrar producto"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza los datos del producto y el inventario."
              : "Completa la información para añadir un producto al catálogo."}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4 mt-6" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="producto-nombre">Nombre</Label>
            <Input
              id="producto-nombre"
              value={values.nombre}
              onChange={(e) => setField("nombre", e.target.value)}
              placeholder="Nombre del producto"
              maxLength={255}
              required
            />
            {errors.nombre ? (
              <p className="text-sm text-destructive">{errors.nombre}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="producto-descripcion">Descripción</Label>
            <textarea
              id="producto-descripcion"
              className={textareaClass}
              value={values.descripcion}
              onChange={(e) => setField("descripcion", e.target.value)}
              placeholder="Descripción opcional"
              rows={3}
            />
            {errors.descripcion ? (
              <p className="text-sm text-destructive">{errors.descripcion}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="precio-compra">Precio de compra</Label>
              <Input
                id="precio-compra"
                type="number"
                min={0}
                step="0.01"
                value={values.precio_compra}
                onChange={(e) => setField("precio_compra", e.target.value)}
              />
              {errors.precio_compra ? (
                <p className="text-sm text-destructive">{errors.precio_compra}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="precio-venta">Precio de venta</Label>
              <Input
                id="precio-venta"
                type="number"
                min={0}
                step="0.01"
                value={values.precio_venta}
                onChange={(e) => setField("precio_venta", e.target.value)}
              />
              {errors.precio_venta ? (
                <p className="text-sm text-destructive">{errors.precio_venta}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cantidad">Cantidad en inventario</Label>
              <Input
                id="cantidad"
                type="number"
                min={0}
                step={1}
                value={values.cantidad_inventario}
                onChange={(e) => setField("cantidad_inventario", e.target.value)}
              />
              {errors.cantidad_inventario ? (
                <p className="text-sm text-destructive">{errors.cantidad_inventario}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label>Estado</Label>
              <Select
                value={values.estado}
                onValueChange={(value) => setField("estado", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(ProductState.Active)}>Activo</SelectItem>
                  <SelectItem value={String(ProductState.Inactive)}>Inactivo</SelectItem>
                </SelectContent>
              </Select>
              {errors.estado ? (
                <p className="text-sm text-destructive">{errors.estado}</p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isEdit
                  ? "Guardando..."
                  : "Registrando..."
                : isEdit
                  ? "Guardar cambios"
                  : "Registrar producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
