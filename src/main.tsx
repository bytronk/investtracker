import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Elimina el loader inicial cuando React se monta
const removeInitialLoader = () => {
  const loader = document.getElementById("initial-loader");
  if (loader) {
    loader.remove();
  }
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

removeInitialLoader();
