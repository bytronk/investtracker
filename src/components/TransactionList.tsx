import React, { useState, useRef } from "react";
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
import { toast, ToastOptions } from "react-toastify";
import { cryptoAssets, stockAssets } from "../data/assets";

interface TransactionListProps {
  transactions: Record<string, Transaction[]>;
  currentMonthKey: string;
  previousMonthKey: string;
  handleDelete: (id: string) => void;
  formatDate: (date: string) => string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currentMonthKey,
  previousMonthKey,
  handleDelete,
  formatDate,
}) => {
  const { isDarkMode } = useTheme();
  const transactionsRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);

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

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);

    if (!isExpanded && headerRef.current) {
      const headerOffset = headerRef.current.getBoundingClientRect().top;
      const scrollOffset = window.scrollY + headerOffset - 70;

      window.scrollTo({
        top: scrollOffset,
        behavior: "smooth",
      });
    }
  };

  const confirmAndDeleteTransaction = (id: string) => {
    if (isAlertActive) return;

    setIsAlertActive(true);

    const toastId = toast.error(
      <div className="flex flex-col items-center space-y-4">
        <p className="text-sm md:text-base">
          ¿Seguro que quieres eliminar la transacción?
        </p>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              toast.dismiss(toastId);
              setIsAlertActive(false);
            }}
            className="bg-gray-500 text-white px-2 py-1 text-sm rounded hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              handleDelete(id);
              toast.dismiss(toastId);
              toast.success("¡Transacción eliminada con éxito!", toastStyle);
              setIsAlertActive(false);
            }}
            className="bg-red-600 text-white px-2 py-1 text-sm rounded hover:bg-red-700 transition"
          >
            Confirmar
          </button>
        </div>
      </div>,
      {
        ...toastStyle,
        autoClose: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        onClose: () => setIsAlertActive(false),
      }
    );
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (["compra", "venta"].includes(transaction.type) && transaction.assetId) {
      const asset =
        cryptoAssets.find((asset) => asset.id === transaction.assetId) ||
        stockAssets.find((asset) => asset.id === transaction.assetId);
      if (asset) {
        return <img src={asset.url} alt={asset.name} className="w-6 h-6" />;
      }
    }

    switch (transaction.type) {
      case "ingreso":
        return <ArrowUpCircle className="h-[1.7rem] w-[1.7rem] text-green-500" />;
      case "interes":
        return <Percent className="h-6 w-6 p-1 text-yellow-500 border border-yellow-500 rounded-full" />;
      case "dividendo":
        return <DollarSign className="h-6 w-6 p-1 text-purple-500  border border-purple-500 rounded-full" />;
      case "retiro":
        return <ArrowDownCircle className="h-[1.7rem] w-[1.7rem] text-red-500" />;
      default:
        return <DollarSign className="h-6 w-6 text-gray-500" />;
    }
  };

  const getTransactionName = (transaction: Transaction) => {
    if (["compra", "venta"].includes(transaction.type) && transaction.assetId) {
      const asset =
        cryptoAssets.find((asset) => asset.id === transaction.assetId) ||
        stockAssets.find((asset) => asset.id === transaction.assetId);
      return asset?.name || transaction.assetId;
    }
    return transaction.type;
  };

  return (
    <div
      ref={transactionsRef}
      className="rounded-lg shadow-md p-6 backdrop-blur-sm bg-white/70 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100"
    >
      <div
        ref={headerRef}
        className="flex items-center justify-between cursor-pointer"
        onClick={toggleExpand}
      >
        <h2 className="text-xl font-semibold mb-3">Transacciones</h2>
        <ChevronDown
          className={`h-7 w-7 text-blue-500 transform transition-transform mb-1 -mr-2 ${
            isExpanded ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-[4000px]" : "max-h-[262px]"
        }`}
      >
        <div className="space-y-6 mt-4">
          {Object.entries(transactions).map(([monthKey, transactionList]) => (
            <div key={monthKey}>
              <h3 className="text-lg font-semibold mt-6 mb-2">
                {monthKey === currentMonthKey
                  ? "Este mes"
                  : monthKey === previousMonthKey
                  ? "El mes pasado"
                  : monthKey}
              </h3>
              {transactionList.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-2 px-0 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {getTransactionIcon(transaction)}
                    <div className="flex flex-col">
                      <p className="font-medium capitalize">
                        {getTransactionName(transaction)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {formatDate(transaction.date)}{" "}
                        {["compra", "venta", "dividendo"].includes(
                          transaction.type
                        ) && (
                          <span className="text-gray-400 capitalize">
                            · {transaction.type}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p
                      className={`font-medium text-[0.920rem] ${
                        ["ingreso", "interes", "dividendo", "venta"].includes(
                          transaction.type
                        )
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {["ingreso", "interes", "dividendo", "venta"].includes(
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
                      className="text-blue-500 flex items-center justify-center hover:text-blue-400 transition duration-200 mt-1"
                      onClick={() =>
                        confirmAndDeleteTransaction(transaction.id)
                      }
                    >
                      <Trash className="h-5 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
