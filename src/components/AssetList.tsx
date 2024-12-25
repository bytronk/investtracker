import React, { useState, useRef } from "react";
import { ChevronDown, CircleEllipsis } from "lucide-react";
import { toast, ToastOptions } from "react-toastify";
import { usePortfolio } from "../context/PortfolioContext";
import { cryptoAssets, stockAssets } from "../data/assets";
import { useTheme } from "../context/ThemeContext"; // Importar ThemeContext

interface AssetListProps {
  type: "crypto" | "stock";
}

export const AssetList: React.FC<AssetListProps> = ({ type }) => {
  const { portfolio, updateAsset } = usePortfolio();
  const { isDarkMode } = useTheme(); // Obtener el estado del tema
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);

  const assets = portfolio.assets.filter((asset) => asset.type === type);

  const title =
    type === "crypto" ? "Cartera de Criptomonedas" : "Cartera de Acciones";
  const emptyMessage =
    type === "crypto"
      ? "No hay criptomonedas registradas"
      : "No hay acciones registradas";

  const getAssetDetails = (symbol: string, type: "crypto" | "stock") => {
    const source = type === "crypto" ? cryptoAssets : stockAssets;
    return source.find((asset) => asset.id === symbol);
  };

  const toastStyle: ToastOptions = {
    position: "bottom-center",
    autoClose: false,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: false,
    style: {
      margin: "0 auto",
      borderRadius: "3px",
      width: "92%",
      backgroundColor: isDarkMode
        ? "rgba(10, 12, 16, 0.95)" // Oscuro
        : "rgba(251, 252, 252, 0.95)", // Claro
      color: isDarkMode ? "#f3f4f6" : "#1f2937",
      border: isDarkMode
        ? "1px solid rgba(20, 24, 28)" // Oscuro
        : "1px solid rgba(229, 231, 235)", // Claro
    },
  };

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);

    if (!isExpanded && headerRef.current) {
      const headerOffset = headerRef.current.getBoundingClientRect().top;
      const scrollOffset = window.scrollY + headerOffset - 70;

      window.scrollTo({
        top: scrollOffset,
        behavior: "smooth",
      });
    }
  };

  const handleDeclareLoss = (assetId: string, totalInvested: number) => {
    if (isAlertActive) return;

    setIsAlertActive(true);

    const toastId = toast.error(
      <div className="flex flex-col items-center space-y-4">
        <p className="text-sm md:text-base text-center">
          ¿Declaras como pérdidas realizadas el importe total de este activo?
          Esta acción no se puede revertir.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              toast.dismiss(toastId);
              setIsAlertActive(false);
            }}
            className="bg-gray-500 text-white px-2 py-1 text-sm rounded hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              updateAsset(assetId, totalInvested, type, true); // Declarar pérdida
              toast.dismiss(toastId);
              toast.success("Pérdidas declaradas con éxito.", {
                position: "bottom-center",
                autoClose: 2500,
                style: toastStyle.style, // Aplicar estilo dinámico
                pauseOnHover: false, // No pausar al pasar el mouse
                closeOnClick: true, // Cerrar al tocar/click
              });
              setIsAlertActive(false);
            }}
            className="bg-red-600 text-white px-2 py-1 text-sm rounded hover:bg-red-700 transition"
          >
            Confirmar
          </button>
        </div>
      </div>,
      {
        ...toastStyle,
        onClose: () => setIsAlertActive(false),
      }
    );
  };

  return (
    <div
      className="rounded-lg shadow-md p-6 backdrop-blur-sm
      bg-white/70 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100"
    >
      <div
        ref={headerRef}
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
          isExpanded ? "max-h-[10000px]" : "max-h-[269px]"
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
                      {asset.realizedProfit === 0 && (
                        <span className="text-gray-500">
                          {asset.realizedProfit.toLocaleString("es-ES")}€
                        </span>
                      )}
                      {asset.realizedProfit !== undefined &&
                        asset.realizedProfit < 0 && (
                          <span className="text-red-500">
                            {asset.realizedProfit.toLocaleString("es-ES")}€
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
                    onClick={() =>
                      handleDeclareLoss(asset.symbol, asset.totalInvested)
                    }
                  >
                    <CircleEllipsis className="w-4" />
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
