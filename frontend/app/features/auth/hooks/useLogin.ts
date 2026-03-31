import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export const useLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const emailInput = useRef<HTMLInputElement | null>(null);
  const passwordInput = useRef<HTMLInputElement | null>(null);

  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const email = emailInput.current?.value;
    const password = passwordInput.current?.value;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Ocurrio un error inesperado, intente de nuevo", {
          duration: 5000,
        });
        return;
      }

      toast.success("Inicio de sesión exitoso");
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Ocurrio un error inesperado, intente de nuevo");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    emailInput,
    passwordInput,
    onSubmit,
  };
};
