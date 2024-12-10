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
  const headerRef = useRef<HTMLDivElement | null>(null); // Ref para el encabezado
  const [isExpanded, setIsExpanded] = useState(false);

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
      const headerOffset = headerRef.current.getBoundingClientRect().top; // Calcula posición del encabezado respecto a la ventana
      const scrollOffset = window.scrollY + headerOffset - 70; // Ajuste según la altura del menú (70px como ejemplo)

      window.scrollTo({
        top: scrollOffset,
        behavior: "smooth",
      });
    }
  };

  const confirmAndDeleteTransaction = (id: string) => {
    const toastId = toast.error(
      <div className="flex flex-col items-center space-y-4">
        <p className="text-sm md:text-base">
          ¿Seguro que quieres eliminar la transacción?
        </p>
        <div className="flex space-x-3">
          <button
            onClick={() => toast.dismiss(toastId)} // Cierra el toast inicial
            className="bg-gray-500 text-white px-2 py-1 text-sm rounded hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              handleDelete(id); // Lógica para eliminar la transacción
              toast.dismiss(toastId); // Cierra el toast inicial
              toast.success("¡Transacción eliminada con éxito!", toastStyle);
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
      }
    );
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
    <div
      ref={transactionsRef}
      className="rounded-lg shadow-md p-6 backdrop-blur-sm bg-white/70 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100"
    >
      <div
        ref={headerRef} // Referencia al encabezado
        className="flex items-center justify-between cursor-pointer"
        onClick={toggleExpand}
      >
        <h2 className="text-xl font-semibold mb-3">Lista de Transacciones</h2>
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
              {transactionList.map((transaction) => {
                const Icon = getTransactionIcon(transaction.type);
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-2 px-0 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Icon
                        className={`h-6 w-6 p-1 rounded-full ${
                          ["ingreso", "interes", "dividendo", "venta"].includes(
                            transaction.type
                          )
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      />
                      <div className="flex flex-col">
                        <p className="font-medium capitalize">
                          {transaction.type}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <p
                        className={`font-medium ${
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
                        onClick={() => confirmAndDeleteTransaction(transaction.id)}
                      >
                        <Trash className="h-5 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
