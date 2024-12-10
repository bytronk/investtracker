import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Wallet, Receipt, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-800 dark:text-gray-200 overflow-x-hidden">
      {/* Navegación fija con glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 bg-white/20 dark:bg-gray-900/10 backdrop-blur-md border-b border-gray-300/20 dark:border-gray-600/20 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex space-x-4">
              <Link
                to="/"
                className={`relative flex items-center px-4 transition-all duration-200 ${
                  location.pathname === "/"
                    ? "text-blue-500"
                    : "hover:text-blue-400"
                }`}
              >
                <Wallet className="h-6 w-6 mr-2" />
                <span className="font-medium">Cartera</span>
                <span
                  className={`absolute bottom-[-8px] left-0 w-full h-[2.5px] bg-blue-500 transition-all duration-400 ease-in-out rounded-full ${
                    location.pathname === "/"
                      ? "translate-x-0 scale-x-100"
                      : "translate-x-full scale-x-0"
                  }`}
                ></span>
              </Link>
              <Link
                to="/cuenta-remunerada"
                className={`relative flex items-center px-4 transition-all duration-200 ${
                  location.pathname === "/cuenta-remunerada"
                    ? "text-blue-500"
                    : "hover:text-blue-400"
                }`}
              >
                <Receipt className="h-6 w-6 mr-2" />
                <span className="font-medium">Efectivo</span>
                <span
                  className={`absolute bottom-[-8px] left-0 w-full h-[2.5px] bg-blue-500 transition-all duration-400 ease-in-out rounded-full ${
                    location.pathname === "/cuenta-remunerada"
                      ? "translate-x-0 scale-x-100"
                      : "-translate-x-full scale-x-0"
                  }`}
                ></span>
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 text-gray-600 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-400 transition-all duration-200"
            >
              <LogOut className="h-6 w-6 mr-2 " />
              <span className="font-medium">Salir</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Ajustar margen superior para el contenido debido al menú fijo */}
      <main className="max-w-7xl mx-auto px-4 py-6 mt-16">{children}</main>

      {/* Botón flotante para cambiar de tema con glassmorphism */}
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
