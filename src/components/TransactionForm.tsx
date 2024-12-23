import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { usePortfolio } from "../context/PortfolioContext"; // Importar el contexto del portafolio
import { Transaction } from "../types";
import { stockAssets } from "../data/assets";
import { toast, ToastOptions } from "react-toastify";

interface TransactionFormProps {
  onSubmit: (
    type: Transaction["type"],
    amount: number,
    date: string,
    assetId?: string
  ) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
}) => {
  const { isDarkMode } = useTheme();
  const { portfolio } = usePortfolio(); // Acceder al portafolio
  const [formData, setFormData] = useState({
    type: "ingreso" as Transaction["type"],
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

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

    // Validar manualmente el campo numérico
    if (!amount || amount <= 0) {
      toast.error("El importe debe ser mayor que 0.", toastStyle);
      return;
    }

    // Validar que no se pueda retirar más del saldo disponible
    if (formData.type === "retiro" && amount > portfolio.savingsAccount) {
      toast.error(
        "Efectivo insuficiente. Por favor, registre un ingreso.",
        toastStyle
      );
      return;
    }

    // Validar que se seleccione una acción para el tipo "dividendo"
    if (formData.type === "dividendo" && !selectedStock) {
      toast.error(
        "Debe seleccionar una acción para registrar un dividendo.",
        toastStyle
      );
      return;
    }

    onSubmit(formData.type, amount, formData.date, selectedStock || undefined);

    toast.success("¡Transacción registrada con éxito!", toastStyle);

    setFormData({
      type: "ingreso",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    });
    setSelectedStock(null);
  };

  useEffect(() => {
    if (formData.type === "dividendo" && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [formData.type]);

  const purchasedStocks = portfolio.transactions
    .filter(
      (transaction) => transaction.type === "compra" && transaction.assetId
    )
    .map((transaction) =>
      stockAssets.find((asset) => asset.id === transaction.assetId)
    )
    .filter((asset) => asset !== undefined); // Filtrar activos válidos

  return (
    <div
      ref={formRef}
      className={`rounded-lg shadow-md p-6 backdrop-blur-sm ${
        isDarkMode
          ? "bg-gray-800/30 text-gray-100"
          : "bg-white/70 text-gray-900"
      }`}
    >
      <h2 className="text-xl font-semibold mb-4">Registrar transacción</h2>
      <form
        onSubmit={handleSubmit}
        noValidate // Desactiva validaciones predeterminadas del navegador
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {formData.type === "dividendo" && purchasedStocks.length > 0 && (
          <div
            className={`p-2 border rounded-md max-h-48 overflow-y-auto col-span-1 sm:col-span-2 lg:col-span-4 ${
              isDarkMode
                ? "bg-gray-800/5 text-gray-100 border-gray-700/10"
                : "bg-gray-50/5 border-gray-500/10"
            }`}
          >
            {purchasedStocks.map((stock) => (
              <div
                key={stock?.id}
                className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer ${
                  selectedStock === stock?.id ? "bg-blue-500 text-white" : ""
                }`}
                onClick={() =>
                  setSelectedStock((prev) =>
                    prev === stock?.id ? null : stock?.id
                  )
                }
              >
                <img src={stock?.url} alt={stock?.name} className="w-6 h-6" />
                <p className="text-sm font-medium">
                  {stock?.name}{" "}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({stock?.id})
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}

        <select
          value={formData.type}
          onChange={(e) => {
            setFormData({
              ...formData,
              type: e.target.value as Transaction["type"],
            });
            setSelectedStock(null); // Reiniciar selección al cambiar el tipo
          }}
          className={`p-2 border rounded-md appearance-none ${
            isDarkMode
              ? "bg-gray-800/5 text-gray-100 border-gray-700/10"
              : "bg-gray-50/5 border-gray-500/10"
          } text-center`}
        >
          <option value="ingreso">Ingreso</option>
          <option value="interes">Interés</option>
          <option value="dividendo">Dividendo</option>
          <option value="retiro">Retiro</option>
        </select>

        <input
          type="number"
          value={formData.amount}
          onChange={(e) => {
            const value = e.target.value;
            if (!isNaN(Number(value)) || value === "") {
              setFormData({ ...formData, amount: value });
            } else {
              toast.error("El importe debe ser un número válido.", toastStyle);
            }
          }}
          className={`p-2 border rounded-md appearance-none ${
            isDarkMode
              ? "bg-gray-800/5 text-gray-100 border-gray-700/10"
              : "bg-gray-50/5 border-gray-500/10"
          } text-center`}
          placeholder="Importe (EUR)"
        />

        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className={`p-2 border rounded-md appearance-none ${
            isDarkMode
              ? "bg-gray-800/5 text-gray-100 border-gray-700/10"
              : "bg-gray-50/5 border-gray-500/10"
          } text-center`}
          required
        />

        <button
          type="submit"
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition duration-200"
        >
          Registrar
        </button>
      </form>
    </div>
  );
};
