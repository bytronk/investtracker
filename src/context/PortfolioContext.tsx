import React, { createContext, useState, useEffect, useContext } from "react";
import { Portfolio, Transaction } from "../types";
import { useAuth } from "./AuthContext";
import { cryptoAssets, stockAssets } from "../data/assets";

interface PortfolioContextType {
  portfolio: Portfolio;
  updateAsset: (
    symbol: string,
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
    type: "crypto" | "stock"
  ) => {
    const assetIndex = portfolio.assets.findIndex(
      (asset) => asset.symbol === symbol && asset.type === type
    );

    if (assetIndex !== -1) {
      const currentAsset = portfolio.assets[assetIndex];

      portfolio.assets[assetIndex] = {
        ...currentAsset,
        totalInvested: currentAsset.totalInvested + amount,
      };

      if (portfolio.assets[assetIndex].totalInvested <= 0) {
        portfolio.assets.splice(assetIndex, 1);
      }
    } else if (amount > 0) {
      portfolio.assets.push({
        id: Date.now().toString(),
        symbol,
        type,
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
      const assetType = determineAssetType(transaction.assetId || "");
      updateAsset(transaction.assetId || "", transaction.amount, assetType);
    } else if (transaction.type === "venta") {
      newSavingsAccount += transaction.amount;
      const assetType = determineAssetType(transaction.assetId || "");
      updateAsset(transaction.assetId || "", -transaction.amount, assetType);
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
      const assetType = determineAssetType(transactionToDelete.assetId || "");
      updateAsset(
        transactionToDelete.assetId || "",
        -transactionToDelete.amount,
        assetType
      );
    } else if (transactionToDelete.type === "venta") {
      newSavingsAccount -= transactionToDelete.amount;
      const assetType = determineAssetType(transactionToDelete.assetId || "");
      updateAsset(
        transactionToDelete.assetId || "",
        transactionToDelete.amount,
        assetType
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
