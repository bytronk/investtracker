import React, { createContext, useContext, useState, useEffect } from "react";
import { Portfolio, Asset, Transaction } from "../types";
import { useAuth } from "./AuthContext";

interface PortfolioContextType {
  portfolio: Portfolio;
  addAsset: (asset: Omit<Asset, "id">) => void;
  updateAsset: (assetId: string, quantity: number, amount: number) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (transactionId: string) => void;
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

  const deleteTransaction = (transactionId: string) => {
    const transactionToDelete = portfolio.transactions.find(
      (t) => t.id === transactionId
    );

    if (transactionToDelete) {
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

      const newTransactions = portfolio.transactions.filter(
        (t) => t.id !== transactionId
      );

      const newPortfolio = {
        ...portfolio,
        transactions: newTransactions,
        savingsAccount: newSavingsAccount,
      };
      savePortfolio(newPortfolio);
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        portfolio,
        addAsset,
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
