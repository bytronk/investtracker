import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";

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

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, password: string, remember: boolean) => {
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (!users[email]) {
      alert("El usuario no existe. Por favor, regístrate primero.");
      return;
    }
    if (users[email].password !== password) {
      alert("Contraseña incorrecta.");
      return;
    }

    const currentUser = { id: users[email].id, email };
    setUser(currentUser);

    if (remember) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }
  };

  const register = (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (users[email]) {
      alert("El usuario ya está registrado.");
      return;
    }

    const newUser = { id: Date.now().toString(), password };
    users[email] = newUser;
    localStorage.setItem("users", JSON.stringify(users));

    const currentUser = { id: newUser.id, email };
    setUser(currentUser);
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    alert("Registro exitoso.");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    alert("Se ha cerrado la sesión.");
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
