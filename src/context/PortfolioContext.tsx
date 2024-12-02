import React, { createContext, useState, useEffect, useContext } from "react";
import { Portfolio, Transaction } from "../types";
import { useAuth } from "./AuthContext";

interface PortfolioContextType {
  portfolio: Portfolio;
  updateAsset: (
    symbol: string,
    quantity: number,
    amount: number,
    type: "crypto" | "stock"
  ) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio>({
    assets: [],
    transactions: [],
    savingsAccount: 0,
  });

  useEffect(() => {
    if (user) {
      const storedPortfolio = localStorage.getItem(`portfolio_${user.id}`);
      if (storedPortfolio) {
        setPortfolio(JSON.parse(storedPortfolio));
      }
    }
  }, [user]);

  const savePortfolio = (newPortfolio: Portfolio) => {
    if (user) {
      localStorage.setItem(
        `portfolio_${user.id}`,
        JSON.stringify(newPortfolio)
      );
      setPortfolio(newPortfolio);
    }
  };

  const updateAsset = (
    symbol: string,
    quantity: number,
    amount: number,
    type: "crypto" | "stock"
  ) => {
    const assetIndex = portfolio.assets.findIndex(
      (asset) => asset.symbol === symbol
    );

    if (assetIndex !== -1) {
      const currentAsset = portfolio.assets[assetIndex];

      if (quantity < 0) {
        // Si es una venta, ajustar `totalInvested` proporcionalmente
        const proportion = Math.abs(quantity) / currentAsset.quantity;
        const proportionalAmount = currentAsset.totalInvested * proportion;

        portfolio.assets[assetIndex] = {
          ...currentAsset,
          quantity: currentAsset.quantity + quantity,
          totalInvested: currentAsset.totalInvested - proportionalAmount,
        };

        // Evitar valores negativos por redondeo
        if (portfolio.assets[assetIndex].totalInvested < 0) {
          portfolio.assets[assetIndex].totalInvested = 0;
        }
      } else {
        // Si es una compra, simplemente sumar cantidad e importe
        portfolio.assets[assetIndex] = {
          ...currentAsset,
          quantity: currentAsset.quantity + quantity,
          totalInvested: currentAsset.totalInvested + amount,
        };
      }

      // Eliminar el activo si la cantidad llega a 0
      if (portfolio.assets[assetIndex].quantity <= 0) {
        portfolio.assets.splice(assetIndex, 1);
      }
    } else if (quantity > 0) {
      // Agregar un nuevo activo si no existe
      portfolio.assets.push({
        id: Date.now().toString(),
        symbol,
        type,
        quantity,
        totalInvested: amount,
      });
    }

    savePortfolio({ ...portfolio });
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: transaction.date || new Date().toISOString(),
    };

    let newSavingsAccount = portfolio.savingsAccount;

    if (transaction.type === "compra") {
      newSavingsAccount -= transaction.amount;
      updateAsset(
        transaction.assetId || "",
        transaction.quantity || 0,
        transaction.amount,
        transaction.assetId === "crypto" ? "crypto" : "stock"
      );
    } else if (transaction.type === "venta") {
      newSavingsAccount += transaction.amount;
      updateAsset(
        transaction.assetId || "",
        -(transaction.quantity || 0),
        -transaction.amount,
        transaction.assetId === "crypto" ? "crypto" : "stock"
      );
    } else if (
      ["ingreso", "interes", "dividendo"].includes(transaction.type)
    ) {
      newSavingsAccount += transaction.amount;
    } else if (transaction.type === "retiro") {
      newSavingsAccount -= transaction.amount;
    }

    const newPortfolio = {
      ...portfolio,
      transactions: [newTransaction, ...portfolio.transactions],
      savingsAccount: newSavingsAccount,
    };
    savePortfolio(newPortfolio);
  };

  const deleteTransaction = (id: string) => {
    const transactionToDelete = portfolio.transactions.find(
      (transaction) => transaction.id === id
    );
    if (!transactionToDelete) return;

    let newSavingsAccount = portfolio.savingsAccount;

    if (
      ["ingreso", "interes", "dividendo"].includes(transactionToDelete.type)
    ) {
      newSavingsAccount -= transactionToDelete.amount;
    } else if (transactionToDelete.type === "retiro") {
      newSavingsAccount += transactionToDelete.amount;
    } else if (transactionToDelete.type === "compra") {
      newSavingsAccount += transactionToDelete.amount;
      updateAsset(
        transactionToDelete.assetId || "",
        -(transactionToDelete.quantity || 0),
        -transactionToDelete.amount,
        transactionToDelete.assetId === "crypto" ? "crypto" : "stock"
      );
    } else if (transactionToDelete.type === "venta") {
      newSavingsAccount -= transactionToDelete.amount;
      updateAsset(
        transactionToDelete.assetId || "",
        transactionToDelete.quantity || 0,
        transactionToDelete.amount,
        transactionToDelete.assetId === "crypto" ? "crypto" : "stock"
      );
    }

    const updatedTransactions = portfolio.transactions.filter(
      (transaction) => transaction.id !== id
    );

    const newPortfolio = {
      ...portfolio,
      transactions: updatedTransactions,
      savingsAccount: newSavingsAccount,
    };
    savePortfolio(newPortfolio);
  };

  return (
    <PortfolioContext.Provider
      value={{
        portfolio,
        updateAsset,
        addTransaction,
        deleteTransaction,
      }}
    >
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
