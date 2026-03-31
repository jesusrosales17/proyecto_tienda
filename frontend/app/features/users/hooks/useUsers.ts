import { useEffect, useState } from "react";
import type { UserBase } from "../types/user.types";

export const useUsers = () => {
  const [usersList, setUsersList] = useState<UserBase[]>([]);

  useEffect(() => {
    getUsers();
  }, [])

  const getUsers = async () => {
    const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
      credentials: "include"
    });
    const users = await result.json();
    setUsersList(users);
  } 

  return  {
    usersList,
  }
}
