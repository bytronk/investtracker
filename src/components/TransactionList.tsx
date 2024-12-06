import React, { useRef, useState } from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Percent,
  DollarSign,
  ChevronDown,
  Trash,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Transaction } from "../types";

interface TransactionListProps {
  transactions: Record<string, Transaction[]>;
  currentMonthKey: string;
  previousMonthKey: string;
  showAllTransactions: boolean;
  setShowAllTransactions: React.Dispatch<React.SetStateAction<boolean>>;
  handleDelete: (id: string) => void;
  formatDate: (date: string) => string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currentMonthKey,
  previousMonthKey,
  showAllTransactions,
  setShowAllTransactions,
  handleDelete,
  formatDate,
}) => {
  const { isDarkMode } = useTheme();
  const transactionsRef = useRef<HTMLDivElement | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const handleToggleTransactions = () => {
    setShowAllTransactions((prev) => !prev);

    if (!showAllTransactions && transactionsRef.current) {
      transactionsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const confirmAndDeleteTransaction = (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta transacción?")) {
      return; // Salir si el usuario cancela
    }
    handleDelete(id); // Llamar a la función de eliminación
    setShowDeleteAlert(true);

    // Ocultar la alerta después de 3 segundos
    setTimeout(() => setShowDeleteAlert(false), 3000);
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
        return DollarSign;
    }
  };

  return (
    <>
      {showDeleteAlert && (
        <div
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50`}
        >
          <div
            className={`rounded-lg p-4 ${
              isDarkMode ? "bg-red-600 text-white" : "bg-red-100 text-red-800"
            }`}
          >
            ¡Transacción eliminada con éxito!
          </div>
        </div>
      )}
      <div
        ref={transactionsRef}
        className={`rounded-lg shadow-md p-6 backdrop-blur-sm ${
          isDarkMode ? "bg-gray-800/30 text-gray-100" : "bg-white/70 text-gray-900"
        }`}
      >
        <button
          onClick={handleToggleTransactions}
          className="text-xl font-semibold flex items-center justify-between w-full"
        >
          Transacciones{" "}
          <ChevronDown
            className={`h-7 w-7 text-blue-500 mt-2 transform transition-transform ${
              showAllTransactions ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            showAllTransactions ? "max-h-[4000px]" : "max-h-80"
          }`}
        >
          {Object.entries(transactions).map(([monthKey, transactionList]) => (
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
                    {transactionList.map((transaction) => {
                      const Icon = getTransactionIcon(transaction.type);
                      return (
                        <div
                          key={transaction.id}
                          className={`flex items-center justify-between p-2 px-3 border rounded-lg ${
                            isDarkMode
                              ? "bg-gray-800/5 border-gray-700/10"
                              : "bg-gray-50/5 border-gray-500/10"
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
                              onClick={() => confirmAndDeleteTransaction(transaction.id)}
                              className="text-blue-500 hover:text-blue-700"
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
    </>
  );
};
