import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "./ThemeContext";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, remember: boolean) => void;
  register: (email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const { isDarkMode } = useTheme();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const toastStyle: ToastOptions = {
    position: "bottom-center",
    autoClose: 2500,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    style: {
      bottom: "25px",
      margin: "0 auto",
      borderRadius: "3px",
      width: "92%",
      backgroundColor: isDarkMode ? "rgba(10, 12, 16)" : "rgba(251, 252, 252)",
      color: isDarkMode ? "#f3f4f6" : "#1f2937",
      border: isDarkMode ? "1px solid rgba(20, 24, 28)" : "none",
    },
  };

  useEffect(() => {
    // Verificar si hay un usuario almacenado en localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);  // Si hay un usuario en localStorage, cargarlo en el estado
    }
  }, []); // Solo ejecutar una vez cuando el componente se monta

  const validateFields = (email: string, password: string) => {
    if (!email) {
      toast.error(
        "El campo de correo electrónico no puede estar vacío.",
        toastStyle
      );
      return false;
    }
    if (!password) {
      toast.error("El campo de contraseña no puede estar vacío.", toastStyle);
      return false;
    }
    return true;
  };

  const register = async (email: string, password: string) => {
    if (!validateFields(email, password)) return;

    try {
      const response = await fetch(`${backendUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || "Error al registrar el usuario.");
      }

      const newUser = await response.json();
      setUser({ id: newUser.id.toString(), email: newUser.email });
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      toast.success("Registro exitoso.", toastStyle);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error desconocido.",
        toastStyle
      );
    }
  };

  const login = async (email: string, password: string, remember: boolean) => {
    if (!validateFields(email, password)) return;

    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || "Error al iniciar sesión.");
      }

      const loggedUser = await response.json();
      const currentUser = {
        id: loggedUser.id.toString(),
        email: loggedUser.email,
      };

      setUser(currentUser);
      if (remember)
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      toast.success("Inicio de sesión exitoso.", toastStyle);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error desconocido.",
        toastStyle
      );
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    toast.warn("Se ha cerrado la sesión.", toastStyle);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
