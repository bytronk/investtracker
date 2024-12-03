import React, { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { useTheme } from "../context/ThemeContext";
import { Search, X } from "lucide-react";

const cryptoAssets = [
  { id: "BTC", name: "Bitcoin", url: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg" },
  { id: "ETH", name: "Ethereum", url: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg" },
  { id: "SOL", name: "Solana", url: "https://cryptologos.cc/logos/thumbs/solana.png?v=034" },
  { id: "ADA", name: "Cardano", url: "https://cdn.simpleicons.org/cardano/[COLOR]" },
  { id: "XRP", name: "Ripple", url: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/xrp.svg" },
  { id: "HBAR", name: "Hedera", url: "https://cdn-icons-png.flaticon.com/512/14446/14446161.png" },
  { id: "DOT", name: "Polkadot", url: "https://s2.coinmarketcap.com/static/cloud/img/logo/polkadot/Polkadot_Logo_Animation_64x64.gif" },
  { id: "XLM", name: "Stellar", url: "https://cdn.simpleicons.org/stellar/[COLOR]" },
  { id: "ALGO", name: "Algorand", url: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/algo.svg" },
  { id: "LTC", name: "Litecoin", url: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/ltc.svg" },
  { id: "LNK", name: "Chainlink", url: "https://cdn.simpleicons.org/chainlink/[COLOR]" },
  { id: "POL", name: "Polygon", url: "https://cdn.simpleicons.org/polygon/[COLOR]" },
  { id: "BCH", name: "Bitcoin Cash", url: "https://cdn.simpleicons.org/bitcoincash/[COLOR]" },
  { id: "FTM", name: "Fantom", url: "https://cdn.simpleicons.org/fantom/[COLOR]" },
  { id: "AVAX", name: "Avalanche", url: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/avax.svg" },
  { id: "USDT", name: "Tether", url: "https://cdn.simpleicons.org/tether/[COLOR]" },
  { id: "BNB", name: "BNB", url: "https://cdn.simpleicons.org/bnbchain/[COLOR]" },
  { id: "DOGE", name: "Dogecoin", url: "https://cryptologos.cc/logos/thumbs/dogecoin.png?v=034" },
  { id: "USDC", name: "USDC", url: "https://cryptologos.cc/logos/thumbs/usd-coin.png?v=034" },
  { id: "TRX", name: "TRON", url: "https://cryptologos.cc/logos/thumbs/tron.png?v=034" },
  { id: "TON", name: "Toncoin", url: "https://cryptologos.cc/logos/thumbs/toncoin.png?v=034" },
  { id: "SHIB", name: "Shiba Inu", url: "https://cryptologos.cc/logos/thumbs/shiba-inu.png?v=034" },
  { id: "SUI", name: "Sui", url: "https://cryptologos.cc/logos/thumbs/sui.png?v=034" },
  { id: "NEAR", name: "NEAR Protocol", url: "https://cdn.simpleicons.org/near/6ce99e" },
  { id: "UNI", name: "Uniswap", url: "https://cryptologos.cc/logos/thumbs/uniswap.png?v=034" },
  { id: "AAVE", name: "Aave", url: "https://cdn-icons-png.flaticon.com/512/15208/15208113.png" },
];


const stockAssets = [
  { id: "APC", name: "Apple", url: "https://cdn-icons-png.flaticon.com/512/179/179309.png" },
  { id: "AMZ", name: "Amazon", url: "https://cdn.simpleicons.org/amazon/[COLOR]" },
  { id: "FB2A", name: "Meta Platforms", url: "https://cdn.simpleicons.org/meta/[COLOR]" },
  { id: "NKE", name: "Nike", url: "https://cdn.simpleicons.org/nike/cdd0d2" },
  { id: "NVD", name: "NVIDIA", url: "https://cdn.simpleicons.org/nvidia/[COLOR]" },
  { id: "TL0", name: "Tesla", url: "https://cdn.simpleicons.org/tesla/[COLOR]" },
  { id: "CCC3", name: "Coca-Cola", url: "https://cdn.simpleicons.org/cocacola/[COLOR]" },
  { id: "MIGA", name: "MicroStrategy", url: "https://cdn.simpleicons.org/microstrategy/[COLOR]" },
  { id: "2PP", name: "PayPal", url: "https://cdn.simpleicons.org/paypal/[COLOR]" },
];

export const AssetForm: React.FC = () => {
  const { addTransaction } = usePortfolio();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState<{
    type: "crypto" | "stock";
    amount: string;
    assetId: string;
    date: string;
    operation: "buy" | "sell";
  }>({
    type: "crypto",
    amount: "",
    assetId: "",
    date: new Date().toISOString().split("T")[0],
    operation: "buy",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);

    if (isNaN(amount) || amount <= 0 || !formData.assetId) {
      alert("Por favor, completa todos los campos correctamente.");
      return;
    }

    addTransaction({
      type: formData.operation === "buy" ? "compra" : "venta",
      amount,
      date: formData.date,
      assetId: formData.assetId,
    });

    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);

    setFormData({
      type: "crypto",
      amount: "",
      assetId: "",
      date: new Date().toISOString().split("T")[0],
      operation: "buy",
    });
    setSearchQuery("");
  };

  const assets = formData.type === "crypto" ? cryptoAssets : stockAssets;

  const filteredAssets = assets
    .filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div
      className={`rounded-lg shadow-md p-6 backdrop-blur-sm ${
        isDarkMode ? "bg-gray-800/30 text-gray-100" : "bg-white/70 text-gray-900"
      }`}
    >
      <h2 className="text-xl font-semibold mb-4">Registrar operación</h2>
      {showAlert && (
        <div
          className={`rounded-lg p-4 mb-4 ${
            isDarkMode
              ? "bg-green-600 text-white"
              : "bg-green-100 text-green-800"
          }`}
        >
          ¡Operación registrada con éxito!
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Operación */}
        <select
          value={formData.operation}
          onChange={(e) =>
            setFormData({ ...formData, operation: e.target.value as "buy" | "sell" })
          }
          className={`p-2 border rounded-md w-full ${
            isDarkMode
              ? "bg-gray-800/5 text-gray-100 border-gray-700/10"
              : "bg-gray-50/10 text-gray-900 border-gray-500/10"
          }`}
        >
          <option value="buy">Compra</option>
          <option value="sell">Venta</option>
        </select>

        {/* Tipo */}
        <select
          value={formData.type}
          onChange={(e) =>
            setFormData({ ...formData, type: e.target.value as "crypto" | "stock", assetId: "" })
          }
          className={`p-2 border rounded-md w-full ${
            isDarkMode
              ? "bg-gray-800/5 text-gray-100 border-gray-700/10"
              : "bg-gray-50/10 text-gray-900 border-gray-500/10"
          }`}
        >
          <option value="crypto">Criptomonedas</option>
          <option value="stock">Acciones</option>
        </select>

        {/* Lista de activos con búsqueda */}
        <div
          className={`col-span-1 md:col-span-2 border rounded-md p-2 space-y-2 ${
            isDarkMode
              ? "bg-gray-800/5 text-gray-100 border-gray-700/10"
              : "bg-gray-50/5 text-gray-900 border-gray-500/10"
          }`}
        >
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                isFocused ? "text-blue-500" : isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <input
              type="text"
              placeholder="Buscar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`pl-3 p-2 border rounded-md w-full ${
                isDarkMode
                  ? "bg-gray-800/5 text-gray-100 border-gray-700/10"
                  : "bg-gray-50/5 text-gray-900 border-gray-500/10"
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isFocused ? "text-blue-500" : isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className={`flex items-center p-2 rounded-md cursor-pointer ${
                  formData.assetId === asset.id
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() =>
                  setFormData({ ...formData, assetId: asset.id })
                }
              >
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-6 h-6 mr-3"
                />
                <span>{asset.name} ({asset.id})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Importe */}
        <input
          type="number"
          value={formData.amount}
          onChange={(e) =>
            setFormData({ ...formData, amount: e.target.value })
          }
          className={`pl-2 p-2 border rounded-md w-full ${
            isDarkMode
              ? "bg-gray-800/5 text-gray-100 border-gray-700/10"
              : "bg-gray-50/10 text-gray-900 border-gray-500/10"
          }`}
          placeholder="Importe (EUR)"
          required
        />

        {/* Fecha */}
        <input
          type="date"
          value={formData.date}
          onChange={(e) =>
            setFormData({ ...formData, date: e.target.value })
          }
          className={`p-2 border rounded-md w-full appearance-none ${
            isDarkMode
              ? "bg-gray-800/5 text-gray-100 border-gray-700/10"
              : "bg-gray-50/10 text-gray-900 border-gray-500/10"
          }`}
          required
        />

        {/* Botón */}
        <button
          type="submit"
          className="col-span-1 md:col-span-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition duration-200"
        >
          Registrar
        </button>
      </form>
    </div>
  );
};
