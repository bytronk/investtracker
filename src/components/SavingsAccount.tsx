import React, { useState } from "react";
import {
  PiggyBank,
  ArrowUpCircle,
  ArrowDownCircle,
  Percent,
  DollarSign,
  Trash,
} from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";
import { useTheme } from "../context/ThemeContext";
import { Transaction } from "../types";

export const SavingsAccount: React.FC = () => {
  const { portfolio, addTransaction, deleteTransaction } = usePortfolio();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    type: "ingreso",
    amount: "",
    date: new Date().toISOString().split("T")[0], // Fecha actual por defecto
  });

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "ingreso":
        return ArrowUpCircle;
      case "interes":
        return Percent;
      case "dividendo":
        return DollarSign;
      case "retiro":
        return ArrowDownCircle;
      default:
        return PiggyBank;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addTransaction({
      type: formData.type as Transaction["type"],
      amount: parseFloat(formData.amount),
      date: formData.date, // Asignar la fecha seleccionada
    });

    setFormData({
      type: "ingreso",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
  };

  return (
    <div className="space-y-6">
      {/* Cuenta Remunerada */}
      <div
        className={`rounded-lg shadow-md p-6 ${
          isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Cuenta Remunerada</h2>
          <PiggyBank className="h-8 w-8 text-blue-500" />
        </div>
        <p className="text-3xl font-bold">
          {new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
          }).format(portfolio.savingsAccount)}
        </p>
      </div>

      {/* Lista de Movimientos */}
      <div
        className={`rounded-lg shadow-md p-6 ${
          isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">Movimientos</h2>
        <div className="space-y-4">
          {portfolio.transactions.map((transaction) => {
            const Icon = getTransactionIcon(transaction.type);
            return (
              <div
                key={transaction.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  isDarkMode ? "bg-gray-900" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Icon
                    className={`h-8 w-8 p-1.5 rounded-full ${
                      ["ingreso", "interes", "dividendo"].includes(
                        transaction.type
                      )
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  />
                  <div>
                    <p className="font-medium capitalize">{transaction.type}</p>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {new Date(transaction.date).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <p
                    className={`font-medium ${
                      ["ingreso", "interes", "dividendo"].includes(
                        transaction.type
                      )
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {["ingreso", "interes", "dividendo"].includes(
                      transaction.type
                    )
                      ? "+"
                      : "-"}
                    {new Intl.NumberFormat("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    }).format(transaction.amount)}
                  </p>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-blue-500 hover:text-blue-700 transition"
                    aria-label="Eliminar movimiento"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Formulario de Registro */}
      <div
        className={`rounded-lg shadow-md p-6 ${
          isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">Registrar Movimiento</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Tipo de Movimiento
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className={`w-full p-2 border rounded-md ${
                isDarkMode
                  ? "bg-gray-700 text-gray-100 border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            >
              <option value="ingreso">Ingreso</option>
              <option value="interes">Interés</option>
              <option value="dividendo">Dividendo</option>
              <option value="retiro">Retiro</option>
            </select>
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Importe (EUR)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className={`w-full p-2 border rounded-md ${
                isDarkMode
                  ? "bg-gray-700 text-gray-100 border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
              required
              step="any"
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Fecha
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className={`w-full p-2 border rounded-md ${
                isDarkMode
                  ? "bg-gray-700 text-gray-100 border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition duration-200"
          >
            Registrar Movimiento
          </button>
        </form>
      </div>
    </div>
  );
};
