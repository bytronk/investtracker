import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { toast, ToastOptions } from "react-toastify";

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, register } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const toastStyleFields: ToastOptions = {
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

  const validateFields = (): boolean => {
    if (!email) {
      toast.error("Introduce un correo electrónico.", toastStyleFields);
      return false;
    }
    if (!password) {
      toast.error("Introduce la contraseña.", toastStyleFields);
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()) return;

    if (isLogin) {
      login(email, password, true); // Siempre recuerda la sesión
    } else {
      register(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-black flex items-center justify-center p-4 relative">
      <div
        className="w-full max-w-md bg-white/10 dark:bg-gray-800/20 backdrop-blur-sl rounded-lg shadow-xl p-8 flex flex-col justify-between transform -translate-y-16 sm:-translate-y-12"
        style={{ minHeight: "28rem" }}
      >
        <h1
          className="text-4xl font-light tracking-wide text-center mb-6 select-none"
          style={{
            background: "linear-gradient(90deg, #66b2ff, #0047ab)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "system-ui",
            lineHeight: "115%",
          }}
        >
          investtracker
        </h1>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 flex-1 flex flex-col justify-between"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Correo Electrónico"
              className="w-full px-4 py-2 border dark:border-transparent rounded-md bg-white/20 dark:bg-gray-700/10 backdrop-blur-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Contraseña"
              className="w-full px-4 py-2 border dark:border-transparent rounded-md bg-white/20 dark:bg-gray-700/10 backdrop-blur-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200"
          >
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            aria-label="Alternar entre iniciar sesión y registrarse"
            className="text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 transition duration-200"
          >
            {isLogin
              ? "¿No tienes cuenta? Regístrate"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>
      </div>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 absolute bottom-28 w-full">
        vcdev investtracker © 2024
      </p>
      <button
        onClick={toggleTheme}
        className={`fixed bottom-4 right-4 p-2 rounded-full shadow-lg backdrop-blur-sm 
          ${
            isDarkMode
              ? "bg-gray-500/10 text-white hover:bg-gray-500/20"
              : "bg-white/10 text-gray-800 hover:bg-white/20"
          } 
          transition transform hover:scale-110 active:scale-90`}
      >
        {isDarkMode ? (
          <Sun className="h-7 w-7" />
        ) : (
          <Moon className="h-7 w-7" />
        )}
      </button>
    </div>
  );
};
