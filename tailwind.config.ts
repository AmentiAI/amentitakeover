import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0b1a2b",
          50: "#f5f7fb",
          100: "#e8eef6",
          200: "#cddaea",
          500: "#4a6a8f",
          700: "#1d3557",
          900: "#0b1a2b",
        },
        stage: {
          warm: "#f5a623",
          engaged: "#e9c46a",
          contacted: "#7cb342",
          replied: "#2e8b57",
          interested: "#2ca6a4",
          callback: "#3a86ff",
          meeting: "#5e60ce",
          proposal: "#8338ec",
          nurture: "#d6336c",
          won: "#8b0000",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
