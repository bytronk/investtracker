import React from "react";
import { usePortfolio } from "../context/PortfolioContext";

interface AssetListProps {
  type: "crypto" | "stock";
}

export const AssetList: React.FC<AssetListProps> = ({ type }) => {
  const { portfolio } = usePortfolio();
  const assets = portfolio.assets.filter((asset) => asset.type === type);

  const title = type === "crypto" ? "Criptomonedas" : "Acciones";
  const emptyMessage =
    type === "crypto"
      ? "No hay criptomonedas registradas"
      : "No hay acciones registradas";

  return (
    <div
      className="rounded-lg shadow-md p-6 backdrop-blur-sm
      bg-white/70 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100"
    >
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="flex items-center justify-between p-4 bg-gray-50/70 dark:bg-gray-700/30 rounded-lg 
            hover:bg-gray-100/70 dark:hover:bg-gray-600/30 transition-colors duration-200"
          >
            <div>
              <h3 className="font-medium">{asset.symbol}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {type === "crypto" ? "Criptomoneda" : "Acción"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                }).format(asset.totalInvested)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cantidad: {asset.quantity.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        {assets.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            {emptyMessage}
          </p>
        )}
      </div>
    </div>
  );
};
