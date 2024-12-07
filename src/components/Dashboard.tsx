import React, { useState, useEffect } from "react";
import { TrendingUp, Bitcoin, LineChart, Wallet } from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";
import { useTheme } from "../context/ThemeContext";
import { AssetList } from "./AssetList";
import { AssetForm } from "./AssetForm";

export const Dashboard: React.FC = () => {
  const { portfolio } = usePortfolio();
  const { isDarkMode } = useTheme();
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    };
    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);
    return () => window.removeEventListener("resize", checkTouchDevice);
  }, []);

  const calculateTotals = () => {
    const cryptoTotal = portfolio.assets
      .filter((asset) => asset.type === "crypto")
      .reduce((sum, asset) => sum + asset.totalInvested, 0);

    const stocksTotal = portfolio.assets
      .filter((asset) => asset.type === "stock")
      .reduce((sum, asset) => sum + asset.totalInvested, 0);

    return {
      patrimonio: cryptoTotal + stocksTotal + portfolio.savingsAccount,
      cartera: cryptoTotal + stocksTotal,
      crypto: cryptoTotal,
      stocks: stocksTotal,
    };
  };

  const totals = calculateTotals();

  const cards = [
    {
      title: "Mi Patrimonio",
      value: totals.patrimonio,
      icon: TrendingUp,
      color: "bg-blue-500",
      textColor: "text-blue-500",
      borderColor: "border-blue-500",
    },
    {
      title: "Mi Cartera",
      value: totals.cartera,
      icon: Wallet,
      color: "bg-green-500",
      textColor: "text-green-500",
      borderColor: "border-green-500",
    },
    {
      title: "Invertido en Cripto",
      value: totals.crypto,
      icon: Bitcoin,
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
      borderColor: "border-yellow-500",
    },
    {
      title: "Invertido en Acciones",
      value: totals.stocks,
      icon: LineChart,
      color: "bg-purple-500",
      textColor: "text-purple-500",
      borderColor: "border-purple-500",
    },
  ];

  const handleTouchStart = (title: string) => {
    setActiveCard(title);
  };

  const handleTouchEnd = () => {
    setActiveCard(null);
  };

  return (
    <div
      className={`space-y-6 ${
        isDarkMode ? "bg-black text-gray-100" : "bg-gray-100 text-gray-900"
      } min-h-screen`}
    >
      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`rounded-lg shadow-md p-6 transform transition-transform duration-200 backdrop-blur-sm ${
              isDarkMode
                ? "bg-gray-800/30 text-gray-100"
                : "bg-white/70 text-gray-900"
            } ${activeCard === card.title ? "scale-105" : ""}`}
            {...(isTouchDevice
              ? {
                  onTouchStart: () => handleTouchStart(card.title),
                  onTouchEnd: handleTouchEnd,
                }
              : {
                  onMouseEnter: () => setActiveCard(card.title),
                  onMouseLeave: () => setActiveCard(null),
                })}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <div
                className={`${card.borderColor} border border-dashed p-1.5 rounded-full flex items-center justify-center`}
              >
                <card.icon className={`h-5 w-5 ${card.textColor}`} />
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

      {/* Listas de activos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetList type="crypto" />
        <AssetList type="stock" />
      </div>

      {/* Formulario */}
      <AssetForm />
    </div>
  );
};
