import React, { useEffect, useState } from "react";
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
    date: new Date().toISOString().split("T")[0],
  });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    };
    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);
    return () => window.removeEventListener("resize", checkTouchDevice);
  }, []);

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
      date: formData.date,
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
      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={`rounded-lg shadow-md p-6 transform transition-transform duration-200 ${
            isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
          } ${!isTouchDevice ? "hover:scale-105" : ""}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Mi Patrimonio</h3>
            <PiggyBank className="h-8 w-8 bg-blue-500 text-white p-1.5 rounded-full" />
          </div>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "EUR",
            }).format(
              portfolio.savingsAccount +
                portfolio.assets.reduce(
                  (acc, asset) => acc + asset.totalInvested,
                  0
                )
            )}
          </p>
        </div>
        <div
          className={`rounded-lg shadow-md p-6 transform transition-transform duration-200 ${
            isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
          } ${!isTouchDevice ? "hover:scale-105" : ""}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Cuenta Remunerada</h3>
            <PiggyBank className="h-8 w-8 bg-blue-500 text-white p-1.5 rounded-full" />
          </div>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "EUR",
            }).format(portfolio.savingsAccount)}
          </p>
        </div>
      </div>

      {/* Lista de Movimientos */}
      <div
        className={`rounded-lg shadow-md p-6 ${
          isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">Movimientos</h2>
        <div className="space-y-3">
          {portfolio.transactions.map((transaction) => {
            const Icon = getTransactionIcon(transaction.type);

            return (
              <div
                key={transaction.id}
                className={`flex items-center justify-between p-2 px-2.5 border rounded-lg ${
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`h-7 w-7 p-1 rounded-full ${
                      ["ingreso", "interes", "dividendo"].includes(
                        transaction.type
                      )
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  />
                  <div className="space-y-1">
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
                    className="text-blue-500 hover:text-blue-700"
                    aria-label="Eliminar movimiento"
                  >
                    <Trash className="h-5 w-5" />
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
          isDarkMode ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-900"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">Registrar Movimiento</h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
            className={`p-2 border rounded-md appearance-none ${
              isDarkMode
                ? "bg-gray-800 text-gray-100 border-gray-700"
                : "bg-gray-100 text-gray-900 border-gray-300"
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
            className={`p-2 border rounded-md ${
              isDarkMode
                ? "bg-gray-800 text-gray-100 border-gray-700"
                : "bg-gray-100 text-gray-900 border-gray-300"
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
                ? "bg-gray-800 text-gray-100 border-gray-700"
                : "bg-gray-100 text-gray-900 border-gray-300"
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
    </div>
  );
};
