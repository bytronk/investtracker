import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const { login, register } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      login(email, password, remember);
    } else {
      register(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
      <div
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 flex flex-col justify-between transform -translate-y-16 sm:-translate-y-12"
        style={{ minHeight: "28rem" }} // Altura uniforme
      >
        {/* Título dentro del formulario */}
        <h1 className="text-4xl font-extralight tracking-wide text-center text-gray-900 dark:text-gray-100 mb-6 select-none">
          <span className="text-blue-600 dark:text-blue-400">invest</span>
          tracker
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          {isLogin && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                aria-label="Recordar sesión"
                className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 text-sm text-gray-900 dark:text-gray-300"
              >
                Recuérdame
              </label>
            </div>
          )}
          {!isLogin && (
            <div className="h-5"></div> // Espacio para mantener la altura uniforme
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200"
          >
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            aria-label="Alternar entre iniciar sesión y registrarse"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition duration-200"
          >
            {isLogin
              ? "¿No tienes cuenta? Regístrate"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>
      </div>

      {/* Pie de página */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 absolute bottom-28 w-full">
        vcdev investtracker © 2024
      </p>

      {/* Botón flotante para cambiar de tema */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 dark:bg-gray-700 dark:hover:bg-gray-600 transition transform hover:scale-110 active:scale-90"
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};
