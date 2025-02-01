import React, { createContext, useState, useEffect, useContext, useMemo } from "react";
import { Portfolio, Transaction } from "../types";
import { useAuth } from "./AuthContext";
import { cryptoAssets, stockAssets } from "../data/assets";
import { toast, ToastOptions } from "react-toastify";
import { useTheme } from "./ThemeContext";

interface PortfolioContextType {
  portfolio: Portfolio;
  updateAsset: (
    symbol: string,
    amount: number,
    type: "crypto" | "stock",
    isLoss?: boolean,
    forceDelete?: boolean
  ) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  updateSavingsAccount: (newTotal: number) => void;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [portfolio, setPortfolio] = useState<Portfolio>({
    assets: [],
    transactions: [],
    savingsAccount: 0,
  });

  // Memoizar los estilos de los toast para evitar re-renders innecesarios
  const toastStyle: ToastOptions = useMemo(
    () => ({
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
    }),
    [isDarkMode] // Se actualiza solo cuando cambia el modo oscuro
  );

  // Cargar datos del portfolio desde la API
  useEffect(() => {
    if (user) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/portfolio/${user.portfolio_id}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data || typeof data.savings_account?.total === "undefined") {
            toast.error("Error al cargar el Efectivo Disponible.", toastStyle);
            return;
          }

          setPortfolio({
            assets: data.assets || [],
            transactions: data.transactions || [],
            savingsAccount: Number(data.savings_account.total) || 0,
          });
        })
        .catch(() =>
          toast.error("Error al cargar el Portfolio. Inténtalo de nuevo más tarde.", toastStyle)
        );
    }
  }, [user, toastStyle]);

  // Actualizar savings_account en la base de datos y en el estado local
  const updateSavingsAccount = (newTotal: number) => {
    if (user) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/savings_account/${user.portfolio_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total: newTotal }),
      })
        .then((res) => res.json())
        .then((updatedData) => {
          setPortfolio((prev) => ({
            ...prev,
            savingsAccount: Number(updatedData.total) || prev.savingsAccount,
          }));
        })
        .catch(() =>
          toast.error("Error al actualizar Efectivo Disponible.", toastStyle)
        );
    }
  };

  const determineAssetType = (assetId: string): "crypto" | "stock" => {
    if (cryptoAssets.some((asset) => asset.id === assetId)) {
      return "crypto";
    }
    if (stockAssets.some((asset) => asset.id === assetId)) {
      return "stock";
    }
    throw new Error(`Asset ID "${assetId}" no pertenece a ningún tipo conocido.`);
  };

  const updateAsset = (
    symbol: string,
    amount: number,
    type: "crypto" | "stock",
    isLoss: boolean = false,
    forceDelete: boolean = false
  ) => {
    const assetIndex = portfolio.assets.findIndex(
      (asset) => asset.symbol === symbol && asset.type === type
    );

    if (assetIndex !== -1) {
      const currentAsset = portfolio.assets[assetIndex];
      let newRealizedProfit = currentAsset.realizedProfit ?? 0;

      if (forceDelete) {
        portfolio.assets.splice(assetIndex, 1);
      } else if (isLoss) {
        newRealizedProfit -= currentAsset.totalInvested;
        portfolio.assets[assetIndex] = {
          ...currentAsset,
          totalInvested: 0,
          realizedProfit: newRealizedProfit,
        };

        if (newRealizedProfit === 0) {
          portfolio.assets.splice(assetIndex, 1);
        }
      } else {
        const newTotalInvested = currentAsset.totalInvested + amount;
        newRealizedProfit += Math.abs(Math.min(newTotalInvested, 0));

        if (newTotalInvested <= 0 && newRealizedProfit === 0) {
          portfolio.assets.splice(assetIndex, 1);
        } else {
          portfolio.assets[assetIndex] = {
            ...currentAsset,
            totalInvested: Math.max(newTotalInvested, 0),
            realizedProfit: newRealizedProfit,
          };
        }
      }
    } else {
      if (amount < 0) {
        portfolio.assets.push({
          id: Date.now().toString(),
          symbol,
          type,
          totalInvested: 0,
          realizedProfit: Math.abs(amount),
        });
      } else {
        portfolio.assets.push({
          id: Date.now().toString(),
          symbol,
          type,
          totalInvested: amount,
          realizedProfit: 0,
        });
      }
    }

    setPortfolio({ ...portfolio });
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: transaction.date || new Date().toISOString(),
      assetId: transaction.assetId,
    };

    let newSavingsAccount = portfolio.savingsAccount;

    if (transaction.type === "compra") {
      newSavingsAccount -= transaction.amount;
      const assetType = determineAssetType(transaction.assetId || "");
      updateAsset(transaction.assetId || "", transaction.amount, assetType);
    } else if (transaction.type === "venta") {
      newSavingsAccount += transaction.amount;
      const assetType = determineAssetType(transaction.assetId || "");
      updateAsset(transaction.assetId || "", -transaction.amount, assetType);
    } else if (transaction.type === "dividendo" && transaction.assetId) {
      newSavingsAccount += transaction.amount;
    } else if (["ingreso", "interes"].includes(transaction.type)) {
      newSavingsAccount += transaction.amount;
    } else if (transaction.type === "retiro") {
      newSavingsAccount -= transaction.amount;
    }

    updateSavingsAccount(newSavingsAccount);

    const newPortfolio = {
      ...portfolio,
      transactions: [newTransaction, ...portfolio.transactions],
      savingsAccount: newSavingsAccount,
    };

    setPortfolio(newPortfolio);
  };

  const deleteTransaction = (id: string) => {
    const transactionToDelete = portfolio.transactions.find(
      (transaction) => transaction.id === id
    );
    if (!transactionToDelete) return;

    let newSavingsAccount = portfolio.savingsAccount;

    if (["ingreso", "interes", "dividendo"].includes(transactionToDelete.type)) {
      newSavingsAccount -= transactionToDelete.amount;
    } else if (transactionToDelete.type === "retiro") {
      newSavingsAccount += transactionToDelete.amount;
    } else if (transactionToDelete.type === "compra") {
      newSavingsAccount += transactionToDelete.amount;
      const assetType = determineAssetType(transactionToDelete.assetId || "");
      updateAsset(transactionToDelete.assetId || "", -transactionToDelete.amount, assetType);
    } else if (transactionToDelete.type === "venta") {
      newSavingsAccount -= transactionToDelete.amount;
      const assetType = determineAssetType(transactionToDelete.assetId || "");
      updateAsset(transactionToDelete.assetId || "", transactionToDelete.amount, assetType);
    }

    updateSavingsAccount(newSavingsAccount);

    const updatedTransactions = portfolio.transactions.filter(
      (transaction) => transaction.id !== id
    );

    const newPortfolio = {
      ...portfolio,
      transactions: updatedTransactions,
      savingsAccount: newSavingsAccount,
    };

    setPortfolio(newPortfolio);
  };

  return (
    <PortfolioContext.Provider value={{ portfolio, updateAsset, addTransaction, deleteTransaction, updateSavingsAccount }}>
      {children}
    </PortfolioContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
};
