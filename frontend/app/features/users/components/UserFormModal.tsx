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

import type { UserRole } from "../types/user.types";

type FormMode = "create" | "edit";

interface Props {
  open: boolean;
  mode: FormMode;
  loading: boolean;
  values: {
    nombre: string;
    email: string;
    rol: UserRole;
    password: string;
  };
  errors: Partial<
    Record<"nombre" | "email" | "rol" | "password", string>
  >;
  onOpenChange: (open: boolean) => void;
  setField: (field: "nombre" | "email" | "rol" | "password", value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const UserFormModal = ({
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Actualizar usuario" : "Crear usuario"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza la información básica del usuario."
              : "Completa los datos para registrar un nuevo usuario."}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4 mt-6" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={values.nombre}
              onChange={(e) => setField("nombre", e.target.value)}
              placeholder="Nombre completo"
              required
            />
            {errors.nombre ? (
              <p className="text-sm text-destructive">{errors.nombre}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="usuario@correo.com"
              required
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label>Rol</Label>
            <Select
              value={values.rol}
              onValueChange={(value) => setField("rol", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Vendedor">Vendedor</SelectItem>
              </SelectContent>
            </Select>
            {errors.rol ? (
              <p className="text-sm text-destructive">{errors.rol}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">
              Contraseña {isEdit ? "(opcional)" : ""}
            </Label>
            <Input
              id="password"
              type="password"
              value={values.password}
              onChange={(e) => setField("password", e.target.value)}
              placeholder={
                isEdit ? "Nueva contraseña (opcional)" : "Mínimo 6 caracteres"
              }
            />
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isEdit
                  ? "Actualizando..."
                  : "Creando..."
                : isEdit
                  ? "Actualizar usuario"
                  : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
