import { useState } from "react";

import { type UserBase, type UserRole } from "../types/user.types";

type FormMode = "create" | "edit";

type UserFormValues = {
  nombre: string;
  email: string;
  rol: UserRole;
  password: string;
};

type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;

interface Options {
  createUser: (payload: {
    nombre: string;
    email: string;
    rol: UserRole;
    password?: string;
  }) => Promise<boolean>;
  updateUser: (
    id: number,
    payload: {
      nombre: string;
      email: string;
      rol: UserRole;
      password?: string;
    },
  ) => Promise<boolean>;
}

const DEFAULT_VALUES: UserFormValues = {
  nombre: "",
  email: "",
  rol: "Vendedor",
  password: "",
};

export const useUserForm = ({ createUser, updateUser }: Options) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<FormMode>("create");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [values, setValues] = useState<UserFormValues>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<UserFormErrors>({});

  const openCreate = () => {
    setMode("create");
    setCurrentUserId(null);
    setValues(DEFAULT_VALUES);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (user: UserBase) => {
    setMode("edit");
    setCurrentUserId(user.id);
    setValues({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      password: "",
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

  const setField = <K extends keyof UserFormValues>(
    field: K,
    value: UserFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: UserFormErrors = {};

    if (!values.nombre.trim()) nextErrors.nombre = "El nombre es obligatorio";

    if (!values.email.trim()) {
      nextErrors.email = "El correo es obligatorio";
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      nextErrors.email = "Correo inválido";
    }

    if (!values.rol) {
      nextErrors.rol = "El rol es obligatorio";
    }

    if (mode === "create") {
      if (!values.password.trim()) {
        nextErrors.password = "La contraseña es obligatoria";
      } else if (values.password.length < 6) {
        nextErrors.password = "La contraseña debe tener al menos 6 caracteres";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      nombre: values.nombre.trim(),
      email: values.email.trim(),
      rol: values.rol,
      ...(mode === "create" || values.password.trim()
        ? { password: values.password }
        : {}),
    };

    setLoading(true);

    try {
      if (mode === "edit" && currentUserId == null) {
        return;
      }

      const ok =
        mode === "create"
          ? await createUser(payload)
          : await updateUser(currentUserId!, payload);

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
