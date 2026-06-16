import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Savee brand palette (matches the site-builder editor chrome)
        brand: "#2E36FF",
        "brand-2": "#9C93FF",
        accent: "#aab4ff", // periwinkle selection outline
        danger: "#f43f5e",
        background: "#000000",
        panel: "#000000", // sidebars are pure black
        "panel-2": "#000000",
        card: "#121214", // slightly elevated cards
        surface: "#1a1a1c", // inputs / segmented backgrounds
        "surface-2": "#26262a", // active / hover
        elevated: "#1a1a1c",
        line: "#232327", // subtle separators / borders
        separator: "#1c1c1f",
        muted: "#8b8b92", // field labels
        stage: "#dededd", // light content stage
        gray: {
          50: "#f7f7f8",
          100: "#ececee",
          200: "#d4d4d8",
          300: "#a1a1aa",
          400: "#71717a",
          500: "#52525b",
          600: "#3f3f46",
          700: "#2a2a2e",
          800: "#1d1d20",
          900: "#141416",
          950: "#0a0a0b",
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
