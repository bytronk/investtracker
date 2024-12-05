import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Transaction } from "../types";

interface TransactionFormProps {
  onSubmit: (type: Transaction["type"], amount: number, date: string) => void;
  showAlert: boolean;
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  showAlert,
  setShowAlert,
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    type: "ingreso" as Transaction["type"],
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);

    if (!amount || amount <= 0) {
      alert("El importe debe ser mayor que 0.");
      return;
    }

    onSubmit(formData.type, amount, formData.date);

    setFormData({
      type: "ingreso",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    });

    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <>
      {showAlert && (
        <div
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50`}
        >
          <div
            className={`rounded-lg p-4 ${
              isDarkMode
                ? "bg-green-600 text-white"
                : "bg-green-100 text-green-800"
            }`}
          >
            ¡Transacción registrada con éxito!
          </div>
        </div>
      )}
      <div
        className={`rounded-lg shadow-md p-6 backdrop-blur-sm ${
          isDarkMode ? "bg-gray-800/30 text-gray-100" : "bg-white/70 text-gray-900"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">Registrar transacción</h2>
        <form
          onSubmit={handleSubmit}
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
            type="number"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            className={`p-2 border rounded-md appearance-none ${
              isDarkMode
                ? "bg-gray-800/5 text-gray-100 border-gray-700/10"
                : "bg-gray-50/5 border-gray-500/10"
            } text-center`}
            placeholder="Importe (EUR)"
            required
            step="any"
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
    </>
  );
};
