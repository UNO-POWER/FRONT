import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// vite.config se ejecuta en Node (esbuild), fuera del typecheck del proyecto.
export default defineConfig({
  plugins: [react()],
  // sockjs-client referencia `global` (API de Node); Vite no lo define en el browser por defecto.
  define: {
    global: "window",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
});
