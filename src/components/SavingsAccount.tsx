import React, { useEffect, useState } from "react";
import { TrendingUp, PiggyBank, Percent, DollarSign } from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";
import { useTheme } from "../context/ThemeContext";
import { Transaction } from "../types";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";

export const SavingsAccount: React.FC = () => {
  const { portfolio, addTransaction, deleteTransaction } = usePortfolio(); // Asegúrate de que deleteTransaction está disponible
  const { isDarkMode } = useTheme();
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detectar si el dispositivo es táctil
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    };
    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);
    return () => window.removeEventListener("resize", checkTouchDevice);
  }, []);

  const handleSubmitTransaction = (
    type: Transaction["type"],
    amount: number,
    date: string
  ) => {
    addTransaction({ type, amount, date });
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
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

  const groupedByMonth = sortedTransactions.reduce<
    Record<string, Transaction[]>
  >((groups, transaction) => {
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
  }, {});

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
      <TransactionList
        transactions={groupedByMonth}
        currentMonthKey={currentMonthKey}
        previousMonthKey={previousMonthKey}
        showAllTransactions={showAllTransactions}
        setShowAllTransactions={setShowAllTransactions}
        handleDelete={deleteTransaction}
        formatDate={formatDate}
      />

      {/* Formulario de Registro */}
      <TransactionForm
        onSubmit={handleSubmitTransaction}
        showAlert={showAlert}
        setShowAlert={setShowAlert}
      />
    </div>
  );
};
