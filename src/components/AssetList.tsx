import React, { useState, useRef } from "react";
import { ChevronDown, TrendingDown } from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";
import { cryptoAssets, stockAssets } from "../data/assets";

interface AssetListProps {
  type: "crypto" | "stock";
}

export const AssetList: React.FC<AssetListProps> = ({ type }) => {
  const { portfolio } = usePortfolio();
  const [isExpanded, setIsExpanded] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null); // Ref para el encabezado

  const assets = portfolio.assets.filter((asset) => asset.type === type);

  const title = type === "crypto" ? "Cartera de Criptomonedas" : "Cartera de Acciones";
  const emptyMessage =
    type === "crypto"
      ? "No hay criptomonedas registradas"
      : "No hay acciones registradas";

  const getAssetDetails = (symbol: string, type: "crypto" | "stock") => {
    const source = type === "crypto" ? cryptoAssets : stockAssets;
    return source.find((asset) => asset.id === symbol);
  };

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);

    if (!isExpanded && headerRef.current) {
      const headerOffset = headerRef.current.getBoundingClientRect().top; // Posición relativa al viewport
      const scrollOffset = window.scrollY + headerOffset - 70; // Ajustar el margen superior (70px como ejemplo)

      window.scrollTo({
        top: scrollOffset,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className="rounded-lg shadow-md p-6 backdrop-blur-sm
      bg-white/70 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100"
    >
      <div
        ref={headerRef} // Referencia al encabezado
        className="flex items-center justify-between cursor-pointer"
        onClick={toggleExpand}
      >
        <h2 className="text-xl font-semibold mb-3">{title}</h2>
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
          {assets.map((asset) => {
            const details = getAssetDetails(asset.symbol, type);

            return (
              <div
                key={asset.id}
                className="flex items-center justify-between p-1 px-0 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={details?.url || ""}
                    alt={details?.name || asset.symbol}
                    className="w-6 h-6"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <h3 className="font-medium mr-2">
                        {details?.name || asset.symbol}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({details?.id || asset.symbol})
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Beneficio realizado:{" "}
                      {asset.realizedProfit !== undefined &&
                        asset.realizedProfit > 0 && (
                          <span className="text-green-500">
                            +{asset.realizedProfit.toLocaleString("es-ES")}€
                          </span>
                        )}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="font-medium text-[0.920rem]">
                    {new Intl.NumberFormat("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    }).format(asset.totalInvested)}
                  </p>
                  <button
                    className="text-blue-500 flex items-center justify-center hover:text-blue-400 transition duration-200"
                    title="Pérdidas"
                  >
                    <TrendingDown className="h-5 w-6" />
                  </button>
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
    </div>
  );
};
