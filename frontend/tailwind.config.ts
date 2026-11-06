import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#080D18",
          900: "#0B1220",
          800: "#131D31",
          700: "#1E293B",
          600: "#334155",
        },
        brand: {
          blue: "#2563EB",
          "blue-hover": "#1D4ED8",
          gold: "#D4AF37",
          "gold-hover": "#B89628",
          "gold-light": "#F9F3DC",
        },
        slate: {
          bg: "#F8FAFC",
        }
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
