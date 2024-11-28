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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {title}
      </h2>
      <div className="space-y-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <div className="flex items-center space-x-4">
              <img
                src={asset.logoUrl}
                alt={asset.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {asset.symbol}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {asset.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900 dark:text-gray-100">
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
