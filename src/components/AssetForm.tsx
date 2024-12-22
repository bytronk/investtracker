import React, { useState } from "react";
import { toast, ToastOptions } from "react-toastify";
import { usePortfolio } from "../context/PortfolioContext";
import { useTheme } from "../context/ThemeContext";
import { Search, X } from "lucide-react";
import { cryptoAssets, stockAssets } from "../data/assets";
import "react-toastify/dist/ReactToastify.css";

export const AssetForm: React.FC = () => {
  const { portfolio, addTransaction } = usePortfolio(); // Accedemos a savingsAccount desde portfolio
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState<{
    type: "crypto" | "stock";
    amount: string;
    assetId: string;
    date: string;
    operation: "buy" | "sell";
  }>({
    type: "crypto",
    amount: "",
    assetId: "",
    date: new Date().toISOString().split("T")[0],
    operation: "buy",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);

    // Validación personalizada: Verificar importe válido
    if (isNaN(amount) || amount <= 0) {
      toast.error("El importe debe ser mayor que 0.", toastStyle);
      return;
    }

    // Validación personalizada: Verificar efectivo disponible
    if (formData.operation === "buy" && portfolio.savingsAccount < amount) {
      toast.error(
        "Efectivo insuficiente. Por favor, registre un ingreso.",
        toastStyle
      );
      return;
    }

    if (!formData.assetId) {
      toast.error("Por favor, selecciona un activo.", toastStyle);
      return;
    }

    // Registrar la transacción
    addTransaction({
      type: formData.operation === "buy" ? "compra" : "venta",
      amount,
      date: formData.date,
      assetId: formData.assetId,
    });

    // Notificación de éxito
    toast.success("¡Operación registrada con éxito!", toastStyle);

    // Resetear el formulario
    setFormData({
      type: "crypto",
      amount: "",
      assetId: "",
      date: new Date().toISOString().split("T")[0],
      operation: "buy",
    });
    setSearchQuery("");
  };

  const assets = formData.type === "crypto" ? cryptoAssets : stockAssets;

  const filteredAssets = assets
    .filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div
      className={`rounded-lg shadow-md p-6 backdrop-blur-sm ${
        isDarkMode ? "bg-gray-800/30 text-gray-100" : "bg-white/70 text-gray-900"
      }`}
    >
      <h2 className="text-xl font-semibold mb-4">Registrar operación</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Operación */}
        <select
          value={formData.operation}
          onChange={(e) =>
            setFormData({
              ...formData,
              operation: e.target.value as "buy" | "sell",
            })
          }
          className={`p-2 border rounded-md w-full ${
            isDarkMode
              ? "bg-gray-800/5 text-gray-100 border-gray-700/10"
              : "bg-gray-50/10 text-gray-900 border-gray-500/10"
          }`}
        >
          <option value="buy">Compra</option>
          <option value="sell">Venta</option>
        </select>

        {/* Tipo */}
        <select
          value={formData.type}
          onChange={(e) =>
            setFormData({
              ...formData,
              type: e.target.value as "crypto" | "stock",
              assetId: "",
            })
          }
          className={`p-2 border rounded-md w-full ${
            isDarkMode
              ? "bg-gray-800/5 text-gray-100 border-gray-700/10"
              : "bg-gray-50/10 text-gray-900 border-gray-500/10"
          }`}
        >
          <option value="crypto">Criptomonedas</option>
          <option value="stock">Acciones</option>
        </select>

        {/* Lista de activos con búsqueda */}
        <div
          className={`col-span-1 md:col-span-2 border rounded-md p-2 space-y-2 ${
            isDarkMode
              ? "bg-gray-800/5 text-gray-100 border-gray-700/10"
              : "bg-gray-50/5 text-gray-900 border-gray-500/10"
          }`}
        >
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                isFocused
                  ? "text-blue-500"
                  : isDarkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            />
            <input
              type="text"
              placeholder="Buscar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`pl-3 p-2 border rounded-md w-full ${
                isDarkMode
                  ? "bg-gray-800/5 text-gray-100 border-gray-700/10"
                  : "bg-gray-50/5 text-gray-900 border-gray-500/10"
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isFocused
                    ? "text-blue-500"
                    : isDarkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className={`flex items-center p-2 rounded-md cursor-pointer ${
                  formData.assetId === asset.id ? "bg-blue-600 dark:bg-blue-500 text-white" : ""
                }`}
                onClick={() => setFormData({ ...formData, assetId: asset.id })}
              >
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-6 h-6 mr-3"
                />
                <span>
                  {asset.name} <span className="text-sm text-gray-500 dark:text-gray-400">({asset.id})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Importe */}
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className={`pl-2 p-2 border rounded-md w-full ${
            isDarkMode
              ? "bg-gray-800/5 text-gray-100 border-gray-700/10"
              : "bg-gray-50/10 text-gray-900 border-gray-500/10"
          }`}
          placeholder="Importe (EUR)"
        />

        {/* Fecha */}
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className={`p-2 border rounded-md w-full appearance-none ${
            isDarkMode
              ? "bg-gray-800/5 text-gray-100 border-gray-700/10"
              : "bg-gray-50/10 text-gray-900 border-gray-500/10"
          }`}
          required
        />

        {/* Botón */}
        <button
          type="submit"
          className="col-span-1 md:col-span-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition duration-100"
        >
          Registrar
        </button>
      </form>
    </div>
  );
};
