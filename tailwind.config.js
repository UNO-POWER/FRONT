/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tokens de superficie (ver DESIGN.md §4.1)
        surface: {
          DEFAULT: "#0A0D14",
          raised: "#121826",
          overlay: "#1A2130",
        },
        line: "rgba(255,255,255,0.08)",
        // Colores de carta calibrados para fondo oscuro
        carta: {
          rojo: "#F43F5E",
          amarillo: "#F59E0B",
          verde: "#10B981",
          azul: "#3B82F6",
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', "system-ui", "sans-serif"],
        display: ['"Space Grotesk Variable"', '"Inter Variable"', "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(139, 92, 246, 0.45)" },
          "50%": { boxShadow: "0 0 24px 6px rgba(139, 92, 246, 0.25)" },
        },
        // Robo de cartas (propio o forzado por +2/+4/power-up): anillo ambar que rebota.
        "flash-robo": {
          "0%": { boxShadow: "0 0 0 0 rgba(245, 158, 11, 0.55)" },
          "70%": { boxShadow: "0 0 0 10px rgba(245, 158, 11, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(245, 158, 11, 0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s linear infinite",
        "pulse-glow": "pulse-glow 2.2s ease-in-out infinite",
        "flash-robo": "flash-robo 0.7s ease-out 2",
      },
    },
  },
  plugins: [],
};
