import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Wallet, PiggyBank, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; // Importar el hook

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme(); // Usar el hook de tema

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex">
              <Link
                to="/"
                className={`flex items-center px-4 ${
                  location.pathname === "/" ? "border-b-2 border-blue-500" : ""
                }`}
              >
                <Wallet className="h-5 w-5 mr-2" />
                <span className="font-medium">Cartera</span>
              </Link>
              <Link
                to="/cuenta-remunerada"
                className={`flex items-center px-4 ${
                  location.pathname === "/cuenta-remunerada"
                    ? "border-b-2 border-blue-500"
                    : ""
                }`}
              >
                <PiggyBank className="h-5 w-5 mr-2" />
                <span className="font-medium">Cuenta Remunerada</span>
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>

      {/* Botón flotante para cambiar de tema */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 dark:bg-gray-700 dark:hover:bg-gray-600 transition transform hover:scale-110 active:scale-90"
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
