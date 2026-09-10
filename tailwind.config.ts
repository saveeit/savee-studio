import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Savee brand palette (matches the site-builder editor chrome)
        // Savee design system palette (live values from savee.com theme-dark)
        brand: "#3e46ff",
        "brand-2": "#6b5eff",
        accent: "#aab4ff", // periwinkle selection outline
        danger: "#f43f5e",
        background: "#050505",
        panel: "#151515", // sidebars (savee gray-950)
        "panel-2": "#151515",
        card: "#1e1e1e", // slightly elevated cards
        surface: "#1e1e1e", // inputs / segmented backgrounds (savee gray-900)
        "surface-2": "#2f2f2f", // active / hover (savee gray-800)
        elevated: "#1e1e1e",
        line: "#2a2a2a", // subtle separators / borders
        separator: "#232323",
        muted: "#a3a3a3", // field labels (savee gray-400)
        stage: "#1e1e1e", // content stage (Mobbin-style dark gray)
        gray: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#2f2f2f",
          900: "#1e1e1e",
          950: "#151515",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        serif: ["Georgia", "Times New Roman", "serif"],
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
