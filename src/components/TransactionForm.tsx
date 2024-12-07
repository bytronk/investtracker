import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Transaction } from "../types";
import { toast, ToastOptions } from "react-toastify";

interface TransactionFormProps {
  onSubmit: (type: Transaction["type"], amount: number, date: string) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    type: "ingreso" as Transaction["type"],
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

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

    onSubmit(formData.type, amount, formData.date);

    toast.success("¡Transacción registrada con éxito!", toastStyle);

    setFormData({
      type: "ingreso",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <div
      className={`rounded-lg shadow-md p-6 backdrop-blur-sm ${
        isDarkMode ? "bg-gray-800/30 text-gray-100" : "bg-white/70 text-gray-900"
      }`}
    >
      <h2 className="text-xl font-semibold mb-4">Registrar transacción</h2>
      <form
        onSubmit={handleSubmit}
        noValidate // Desactiva validaciones predeterminadas del navegador
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <select
          value={formData.type}
          onChange={(e) =>
            setFormData({ ...formData, type: e.target.value as Transaction["type"] })
          }
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
          type="number" // Cambia a texto para evitar validaciones predeterminadas
          value={formData.amount}
          onChange={(e) => {
            // Validar entrada numérica manualmente
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
          onChange={(e) =>
            setFormData({ ...formData, date: e.target.value })
          }
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
