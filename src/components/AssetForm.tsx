import React, { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { useTheme } from "../context/ThemeContext";

export const AssetForm: React.FC = () => {
  const { updateAsset, addTransaction } = usePortfolio();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState<{
    type: "crypto" | "stock";
    quantity: string;
    amount: string;
    date: string;
    operation: "buy" | "sell";
  }>({
    type: "crypto",
    quantity: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    operation: "buy",
  });
  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseFloat(formData.quantity);
    const amount = parseFloat(formData.amount);

    if (isNaN(quantity) || isNaN(amount) || quantity <= 0 || amount <= 0) {
      alert("Por favor, ingresa valores válidos para cantidad e importe.");
      return;
    }

    if (formData.operation === "buy") {
      addTransaction({
        type: "compra",
        amount,
        quantity,
        date: formData.date,
        assetId: formData.type,
      });
    } else {
      updateAsset(formData.type, -quantity, -amount, formData.type);
      addTransaction({
        type: "venta",
        amount,
        quantity,
        date: formData.date,
        assetId: formData.type,
      });
    }

    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);

    setFormData({
      type: "crypto",
      quantity: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      operation: "buy",
    });
  };

  return (
    <div
      className={`rounded-lg shadow-md p-6 backdrop-blur-sm ${
        isDarkMode ? "bg-gray-800/30 text-gray-100" : "bg-white/70 text-gray-900"
      }`}
    >
      <h2 className="text-xl font-semibold mb-4">Registrar operación</h2>
      {showAlert && (
        <div
          className={`rounded-lg p-4 mb-4 ${
            isDarkMode
              ? "bg-green-600 text-white"
              : "bg-green-100 text-green-800"
          }`}
        >
          ¡Operación registrada con éxito!
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <select
          value={formData.type}
          onChange={(e) =>
            setFormData({ ...formData, type: e.target.value as "crypto" | "stock" })
          }
          className={`p-2 border rounded-md appearance-none ${
            isDarkMode
              ? "bg-gray-800/20 text-gray-100 border-gray-700/20"
              : "bg-gray-100/10 text-gray-900 border-gray-150"
          } text-center`}
        >
          <option value="crypto">Criptomoneda</option>
          <option value="stock">Acción</option>
        </select>
        <select
          value={formData.operation}
          onChange={(e) =>
            setFormData({ ...formData, operation: e.target.value as "buy" | "sell" })
          }
          className={`p-2 border rounded-md appearance-none ${
            isDarkMode
              ? "bg-gray-800/20 text-gray-100 border-gray-700/20"
              : "bg-gray-100/10 text-gray-900 border-gray-150"
          } text-center`}
        >
          <option value="buy">Compra</option>
          <option value="sell">Venta</option>
        </select>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) =>
            setFormData({ ...formData, quantity: e.target.value })
          }
          className={`p-2 border rounded-md appearance-none ${
            isDarkMode
              ? "bg-gray-800/20 text-gray-100 border-gray-700/20"
              : "bg-gray-100/10 text-gray-900 border-gray-150"
          } text-center`}
          placeholder="Cantidad"
          required
          step="any"
        />
        <input
          type="number"
          value={formData.amount}
          onChange={(e) =>
            setFormData({ ...formData, amount: e.target.value })
          }
          className={`p-2 border rounded-md appearance-none ${
            isDarkMode
              ? "bg-gray-800/20 text-gray-100 border-gray-700/20"
              : "bg-gray-100/10 text-gray-900 border-gray-150"
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
              ? "bg-gray-800/20 text-gray-100 border-gray-700/20"
              : "bg-gray-100/10 text-gray-900 border-gray-150"
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
