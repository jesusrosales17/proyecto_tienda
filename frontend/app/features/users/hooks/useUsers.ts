import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { UserState, type UserBase, type UserRole } from "../types/user.types";

type SaveUserPayload = {
  nombre: string;
  email: string;
  rol: UserRole;
  password?: string;
};

export const useUsers = () => {
  const [usersList, setUsersList] = useState<UserBase[]>([]);

  const getUsers = useCallback(async () => {
    const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
      credentials: "include",
    });

    const users = await result.json();
    setUsersList(users);
  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const createUser = useCallback(async (payload: SaveUserPayload) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "No se pudo crear el usuario", {
          duration: 5000,
        });
        return false;
      }

      const createdUser = (result.user ?? result.data ?? result) as UserBase;

      if (createdUser?.id) {
        setUsersList((prev) => [createdUser, ...prev]);
      }

      toast.success("Usuario creado");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado");
      return false;
    }
  }, []);

  const updateUser = useCallback(async (id: number, payload: SaveUserPayload) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/${id}`,
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
        toast.error(result.error || "No se pudo actualizar el usuario", {
          duration: 5000,
        });
        return false;
      }

      const updatedUser = (result.user ?? result.data ?? result) as UserBase;

      setUsersList((prev) =>
        prev.map((user) => {
          if (user.id !== id) return user;

          if (updatedUser?.id) {
            return updatedUser;
          }

          return {
            ...user,
            nombre: payload.nombre,
            email: payload.email,
            rol: payload.rol,
          };
        }),
      );

      toast.success("Usuario actualizado");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado");
      return false;
    }
  }, []);

  const toggleUserState = useCallback(
    async (user: UserBase) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/users/toggleStatus/${user.id}`,
          {
            method: "PATCH",
            credentials: "include",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          toast.error(result.error || "No se pudo cambiar el estado del usuario", {
            duration: 5000,
          });
          return;
        }

        setUsersList((prev) =>
          prev.map((item) =>
            item.id === user.id
              ? {
                  ...item,
                  estado:
                    item.estado === UserState.Active
                      ? UserState.Innactive
                      : UserState.Active,
                }
              : item,
          ),
        );

        toast.success("Estado del usuario actualizado");
      } catch (error) {
        console.error(error);
        toast.error("Ocurrió un error inesperado");
      }
    },
    [],
  );

  return {
    usersList,
    getUsers,
    createUser,
    updateUser,
    toggleUserState,
  };
};
