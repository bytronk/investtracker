import React, { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";

export const AssetForm: React.FC = () => {
  const { addAsset, updateAsset, addTransaction } = usePortfolio();
  const [formData, setFormData] = useState({
    type: "crypto",
    symbol: "",
    name: "",
    logoUrl: "",
    quantity: "",
    amount: "",
    operation: "buy",
  });

  const resetForm = () => {
    setFormData({
      type: "crypto",
      symbol: "",
      name: "",
      logoUrl: "",
      quantity: "",
      amount: "",
      operation: "buy",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseFloat(formData.quantity);
    const amount = parseFloat(formData.amount);

    if (isNaN(quantity) || isNaN(amount) || quantity <= 0 || amount <= 0) {
      alert("Por favor, ingresa valores válidos para cantidad e importe.");
      return;
    }

    if (formData.operation === "buy") {
      const asset = {
        symbol: formData.symbol.toUpperCase(),
        name: formData.name,
        type: formData.type as "crypto" | "stock",
        logoUrl: formData.logoUrl,
        quantity,
        totalInvested: amount,
      };
      addAsset(asset);
      addTransaction({
        type: "compra",
        amount,
        description: `Compra de ${quantity} ${formData.symbol.toUpperCase()}`,
      });
    } else {
      updateAsset(formData.symbol, -quantity, -amount);
      addTransaction({
        type: "venta",
        amount,
        description: `Venta de ${quantity} ${formData.symbol.toUpperCase()}`,
      });
    }

    resetForm();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Activo
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="crypto">Criptomoneda</option>
            <option value="stock">Acción</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Operación
          </label>
          <select
            value={formData.operation}
            onChange={(e) =>
              setFormData({ ...formData, operation: e.target.value })
            }
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="buy">Compra</option>
            <option value="sell">Venta</option>
          </select>
        </div>
        {formData.operation === "buy" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Símbolo
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) =>
                  setFormData({ ...formData, symbol: e.target.value })
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL del Logo
              </label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, logoUrl: e.target.value })
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cantidad
          </label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
            step="any"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Importe (EUR)
          </label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
            step="any"
          />
        </div>
      </div>
      <div className="flex justify-between items-center space-x-4">
        <button
          type="button"
          onClick={resetForm}
          className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 transition duration-200 text-center"
        >
          Limpiar
        </button>
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 text-center"
        >
          Registrar
        </button>
      </div>
    </form>
  );
};
