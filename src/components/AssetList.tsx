import React, { useState, useEffect } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { cryptoAssets, stockAssets } from "../data/assets";

interface AssetListProps {
  type: "crypto" | "stock";
}

export const AssetList: React.FC<AssetListProps> = ({ type }) => {
  const { portfolio } = usePortfolio();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [activeAsset, setActiveAsset] = useState<string | null>(null);

  // Detectar si el dispositivo es táctil
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    };
    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);
    return () => window.removeEventListener("resize", checkTouchDevice);
  }, []);

  const assets = portfolio.assets.filter((asset) => asset.type === type);

  const title = type === "crypto" ? "Criptomonedas" : "Acciones";
  const emptyMessage =
    type === "crypto"
      ? "No hay criptomonedas registradas"
      : "No hay acciones registradas";

  const getAssetDetails = (symbol: string, type: "crypto" | "stock") => {
    const source = type === "crypto" ? cryptoAssets : stockAssets;
    return source.find((asset) => asset.id === symbol);
  };

  return (
    <div
      className="rounded-lg shadow-md p-6 backdrop-blur-sm
      bg-white/70 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100"
    >
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {assets.map((asset) => {
          const details = getAssetDetails(asset.symbol, type);
          const isActive = activeAsset === asset.id;

          return (
            <div
              key={asset.id}
              className={`flex items-center justify-between p-2 px-3 border rounded-lg 
                bg-gray-50/5 dark:bg-gray-800/5 border-gray-500/10 dark:border-gray-700/10 transition-colors duration-200 
                ${
                  isActive
                    ? "bg-gray-200/30 dark:bg-gray-700/20"
                    : !isTouchDevice
                    ? "hover:bg-gray-200/30 dark:hover:bg-gray-800/20"
                    : ""
                }`}
              onMouseEnter={() => !isTouchDevice && setActiveAsset(asset.id)}
              onMouseLeave={() => !isTouchDevice && setActiveAsset(null)}
              onTouchStart={() => {
                if (isTouchDevice) setActiveAsset(asset.id);
              }}
              onTouchEnd={() => {
                if (isTouchDevice) setActiveAsset(null);
              }}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={details?.url || ""}
                  alt={details?.name || asset.symbol}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <h3 className="font-medium">{details?.name || asset.symbol}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {asset.symbol}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {new Intl.NumberFormat("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  }).format(asset.totalInvested)}
                </p>
              </div>
            </div>
          );
        })}
        {assets.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            {emptyMessage}
          </p>
        )}
      </div>
    </div>
  );
};
