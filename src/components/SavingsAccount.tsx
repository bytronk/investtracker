import React, { useEffect, useRef, useState } from "react";
import {
  TrendingUp,
  PiggyBank,
  ArrowUpCircle,
  ArrowDownCircle,
  Percent,
  DollarSign,
  Trash,
  ChevronDown,
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
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const transactionsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    };
    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);
    return () => window.removeEventListener("resize", checkTouchDevice);
  }, []);

  const handleToggleTransactions = () => {
    setShowAllTransactions((prev) => !prev);

    if (!showAllTransactions && transactionsRef.current) {
      transactionsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

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

    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleDelete = (id: string) => {
    const confirmDelete = window.confirm("¿Eliminar transacción?");
    if (confirmDelete) {
      deleteTransaction(id);
      setShowDeleteAlert(true);
      setTimeout(() => setShowDeleteAlert(false), 3000);
    }
  };

  const sortedTransactions = [...portfolio.transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalInterest = portfolio.transactions
    .filter((transaction) => transaction.type === "interes")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalDividends = portfolio.transactions
    .filter((transaction) => transaction.type === "dividendo")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const calculateTotals = () => {
    const cryptoTotal = portfolio.assets
      .filter((asset) => asset.type === "crypto")
      .reduce((sum, asset) => sum + asset.totalInvested, 0);

    const stocksTotal = portfolio.assets
      .filter((asset) => asset.type === "stock")
      .reduce((sum, asset) => sum + asset.totalInvested, 0);

    return {
      patrimonio: cryptoTotal + stocksTotal + portfolio.savingsAccount,
    };
  };

  const totals = calculateTotals();

  const groupedByMonth = sortedTransactions.reduce<Record<string, Transaction[]>>(
    (groups, transaction) => {
      const date = new Date(transaction.date);
      const year = date.getFullYear();
      const currentYear = new Date().getFullYear();

      const monthKey =
        year === currentYear
          ? date.toLocaleDateString("es-ES", { month: "long" })
          : date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(transaction);
      return groups;
    },
    {}
  );

  const currentDate = new Date();
  const currentMonthKey = currentDate.toLocaleDateString("es-ES", {
    month: "long",
  });
  const previousMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1
  );
  const previousMonthKey = previousMonth.toLocaleDateString("es-ES", {
    month: "long",
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="space-y-6">
      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Mi Patrimonio",
            value: totals.patrimonio,
            icon: TrendingUp,
            color: "bg-blue-500",
          },
          {
            title: "Disponible",
            value: portfolio.savingsAccount,
            icon: PiggyBank,
            color: "bg-green-500",
          },
          {
            title: "Intereses",
            value: totalInterest,
            icon: Percent,
            color: "bg-yellow-500",
          },
          {
            title: "Dividendos",
            value: totalDividends,
            icon: DollarSign,
            color: "bg-purple-500",
          },
        ].map((card, index) => (
          <div
            key={index}
            className={`rounded-lg shadow-md p-6 transform transition-transform duration-200 backdrop-blur-sm ${
              isDarkMode
                ? "bg-gray-800/30 text-gray-100"
                : "bg-white/70 text-gray-900"
            } ${activeCard === card.title ? "scale-105" : ""}`}
            {...(isTouchDevice
              ? {
                  onTouchStart: () => setActiveCard(card.title),
                  onTouchEnd: () => setActiveCard(null),
                }
              : {
                  onMouseEnter: () => setActiveCard(card.title),
                  onMouseLeave: () => setActiveCard(null),
                })}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <div
                className={`${card.color} text-white p-1.5 rounded-full flex items-center justify-center`}
              >
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
              }).format(card.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Lista de Movimientos */}
      <div
        ref={transactionsRef}
        className={`rounded-lg shadow-md p-6 backdrop-blur-sm ${
          isDarkMode ? "bg-gray-800/30 text-gray-100" : "bg-white/70 text-gray-900"
        }`}
      >
        {showDeleteAlert && (
          <div
            className={`rounded-lg p-4 mb-4 ${
              isDarkMode
                ? "bg-red-600 text-white"
                : "bg-red-100 text-red-800"
            }`}
          >
            ¡Transacción eliminada con éxito!
          </div>
        )}
        <button
          onClick={handleToggleTransactions}
          className="text-xl font-semibold flex items-center justify-between w-full"
        >
          Transacciones{" "}
          <ChevronDown
            className={`h-6 w-6 text-blue-500 transform transition-transform ${
              showAllTransactions ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
        <div
          className={`overflow-hidden transition-all duration-1000 ease-in-out ${
            showAllTransactions ? "max-h-[3000px]" : "max-h-96"
          }`}
        >
          {Object.entries(groupedByMonth).map(([monthKey, transactions]) => (
            <div key={monthKey}>
              {showAllTransactions || monthKey === currentMonthKey ? (
                <>
                  <h3
                    className={`text-lg font-semibold mt-6 mb-2 ${
                      isDarkMode ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {monthKey === currentMonthKey
                      ? "Este mes"
                      : monthKey === previousMonthKey
                      ? "El mes pasado"
                      : monthKey}
                  </h3>
                  <div className="space-y-3">
                    {transactions.map((transaction) => {
                      const Icon = getTransactionIcon(transaction.type);
                      return (
                        <div
                          key={transaction.id}
                          className={`flex items-center justify-between p-2 px-2.5 border rounded-lg ${
                            isDarkMode
                              ? "bg-gray-800/25 border-gray-800/30"
                              : "bg-gray-100/40"
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
                              <p className="font-medium capitalize">
                                {transaction.type}
                              </p>
                              <p
                                className={`text-sm ${
                                  isDarkMode
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                {formatDate(transaction.date)}
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
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Formulario de Registro */}
      <div
        className={`rounded-lg shadow-md p-6 backdrop-blur-sm ${
          isDarkMode ? "bg-gray-800/30 text-gray-100" : "bg-white/70 text-gray-900"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">Registrar transacción</h2>
        {showAlert && (
          <div
            className={`rounded-lg p-4 mb-4 ${
              isDarkMode
                ? "bg-green-600 text-white"
                : "bg-green-100 text-green-800"
            }`}
          >
            ¡Transacción registrada con éxito!
          </div>
        )}
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
                ? "bg-gray-800/20 text-gray-100 border-gray-700/20"
                : "bg-gray-100/10 text-gray-900 border-gray-150"
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
    </div>
  );
};
