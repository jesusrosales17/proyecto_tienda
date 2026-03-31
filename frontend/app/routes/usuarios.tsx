import { PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/usuarios";
import { useUsers } from "~/features/users/hooks/useUsers";
import { UsersTable } from "~/features/users/components/UsersTable";
import { useUserForm } from "~/features/users/hooks/useUserForm";
import { UserFormModal } from "~/features/users/components/UserFormModal";

export function meta({}: Route.MetaArgs) {
  return [
    {
      title: "Gestion de usuarios",
    },
  ];
}

export default function UsuariosPage() {
  const { usersList, createUser, updateUser, toggleUserState } = useUsers();
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
  } = useUserForm({ createUser, updateUser });

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Administra los usuarios que pueden acceder al sistema
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon /> Agregar Usuario
        </Button>
      </div>

      <UsersTable
        users={usersList}
        onEditUser={openEdit}
        onToggleUserState={toggleUserState}
      />

      <UserFormModal
        open={open}
        mode={mode}
        loading={loading}
        values={values}
        errors={errors}
        onOpenChange={onOpenChange}
        setField={setField}
        onSubmit={submit}
      />
    </>
  );
}
