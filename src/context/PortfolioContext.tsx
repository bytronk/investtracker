import React, { createContext, useContext, useState, useEffect } from "react";
import { Portfolio, Asset, Transaction } from "../types";
import { useAuth } from "./AuthContext";

interface PortfolioContextType {
  portfolio: Portfolio;
  addAsset: (asset: Omit<Asset, "id">) => void;
  updateAsset: (assetId: string, quantity: number, amount: number) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (transaction: Transaction) => void; // Añadido aquí
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

  const addAsset = (asset: Omit<Asset, "id">) => {
    const newAsset = { ...asset, id: Date.now().toString() };
    const newPortfolio = {
      ...portfolio,
      assets: [...portfolio.assets, newAsset],
    };
    savePortfolio(newPortfolio);
  };

  const updateAsset = (assetId: string, quantity: number, amount: number) => {
    const newAssets = portfolio.assets.map((asset) =>
      asset.id === assetId
        ? {
            ...asset,
            quantity: asset.quantity + quantity,
            totalInvested: asset.totalInvested + amount,
          }
        : asset
    );
    savePortfolio({ ...portfolio, assets: newAssets });
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: transaction.date || new Date().toISOString(),
    };

    let newSavingsAccount = portfolio.savingsAccount;
    if (
      ["ingreso", "interes", "dividendo", "venta"].includes(transaction.type)
    ) {
      newSavingsAccount += transaction.amount;
    } else if (["retiro", "compra"].includes(transaction.type)) {
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
      ["ingreso", "interes", "dividendo", "venta"].includes(
        transactionToDelete.type
      )
    ) {
      newSavingsAccount -= transactionToDelete.amount;
    } else if (["retiro", "compra"].includes(transactionToDelete.type)) {
      newSavingsAccount += transactionToDelete.amount;
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

  const updateTransaction = (updatedTransaction: Transaction) => {
    const previousTransaction = portfolio.transactions.find(
      (transaction) => transaction.id === updatedTransaction.id
    );

    if (!previousTransaction) return;

    let newSavingsAccount = portfolio.savingsAccount;

    // Revert previous transaction
    if (
      ["ingreso", "interes", "dividendo", "venta"].includes(
        previousTransaction.type
      )
    ) {
      newSavingsAccount -= previousTransaction.amount;
    } else if (["retiro", "compra"].includes(previousTransaction.type)) {
      newSavingsAccount += previousTransaction.amount;
    }

    // Apply updated transaction
    if (
      ["ingreso", "interes", "dividendo", "venta"].includes(
        updatedTransaction.type
      )
    ) {
      newSavingsAccount += updatedTransaction.amount;
    } else if (["retiro", "compra"].includes(updatedTransaction.type)) {
      newSavingsAccount -= updatedTransaction.amount;
    }

    const updatedTransactions = portfolio.transactions.map((transaction) =>
      transaction.id === updatedTransaction.id
        ? updatedTransaction
        : transaction
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
        addAsset,
        updateAsset,
        addTransaction,
        deleteTransaction,
        updateTransaction, // Incluido aquí
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
