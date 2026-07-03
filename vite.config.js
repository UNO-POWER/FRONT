import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // sockjs-client referencia `global` (API de Node); Vite no lo define en el browser por defecto.
  define: {
    global: "window",
  },
  server: {
    port: 5173,
  },
});
