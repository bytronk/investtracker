import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { toast, ToastOptions } from "react-toastify"; // Importar Toastify
import "react-toastify/dist/ReactToastify.css"; // Estilos de Toastify
import { useTheme } from "./ThemeContext"; // Importar el contexto de tema

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
  const { isDarkMode } = useTheme(); // Usar el estado del tema

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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

  const validateFields = (email: string, password: string) => {
    if (!email) {
      toast.error("El campo de correo electrónico no puede estar vacío.", toastStyle);
      return false;
    }
    if (!password) {
      toast.error("El campo de contraseña no puede estar vacío.", toastStyle);
      return false;
    }
    return true;
  };

  const login = (email: string, password: string, remember: boolean) => {
    if (!validateFields(email, password)) return;

    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (!users[email]) {
      toast.error("El usuario no existe. Por favor, regístrate primero.", toastStyle);
      return;
    }
    if (users[email].password !== password) {
      toast.error("Contraseña incorrecta.", toastStyle);
      return;
    }

    const currentUser = { id: users[email].id, email };
    setUser(currentUser);

    if (remember) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }
    toast.success("Inicio de sesión.", toastStyle);
  };

  const register = (email: string, password: string) => {
    if (!validateFields(email, password)) return;

    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (users[email]) {
      toast.error("El usuario ya está registrado.", toastStyle);
      return;
    }

    const newUser = { id: Date.now().toString(), password };
    users[email] = newUser;
    localStorage.setItem("users", JSON.stringify(users));

    const currentUser = { id: newUser.id, email };
    setUser(currentUser);
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    toast.success("Registro exitoso.", toastStyle);
    toast.success("Inicio de sesión.", toastStyle);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    toast.warn("Se ha cerrado la sesión.", toastStyle); // Usar el estilo dinámico
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
