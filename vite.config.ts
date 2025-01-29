import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "_redirects", // Archivo en la raíz del proyecto
          dest: ".", // Copiarlo a la raíz de la carpeta dist
        },
      ],
    }),
  ],
  server: {
    port: 5173,
    host: "0.0.0.0", // Permitir conexiones externas
  },
  define: {
    "process.env": process.env,
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
