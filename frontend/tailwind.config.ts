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
        // Master Prompt Design System Tokens
        midnight: {
          DEFAULT: "#14243A",
          50: "#F4F6F9",
          100: "#E6EAF0",
          200: "#CCD5E2",
          300: "#A3B3CA",
          400: "#758DAE",
          500: "#506A8F",
          600: "#3B5172",
          700: "#2B3D57",
          800: "#1C2A3E",
          900: "#14243A",
          950: "#0D1826",
        },
        problue: {
          DEFAULT: "#315EFB",
          50: "#EFF4FF",
          100: "#DBE6FE",
          200: "#BFD3FE",
          300: "#93B7FD",
          400: "#6092FB",
          500: "#315EFB",
          600: "#2144EB",
          700: "#1A32D6",
          800: "#1B2AAB",
          900: "#1B2887",
        },
        slateborder: {
          DEFAULT: "#E7ECF2",
          light: "#F1F5F9",
          dark: "#CBD5E1",
        },
        slatebg: {
          DEFAULT: "#F8FAFC",
        },
        slatemuted: {
          DEFAULT: "#64748B",
        },
        subtleteal: {
          DEFAULT: "#159D8B",
          50: "#E6F7F5",
          100: "#C2EDE7",
          500: "#159D8B",
          600: "#0F7D6F",
        },
        // Retained for backwards compatibility
        navy: {
          950: "#0D1826",
          900: "#14243A",
          800: "#1C2A3E",
          700: "#2B3D57",
          600: "#3B5172",
        },
        brand: {
          blue: "#315EFB",
          "blue-hover": "#2144EB",
          gold: "#D4AF37",
          "gold-hover": "#B89628",
          "gold-light": "#F9F3DC",
        },
        slate: {
          bg: "#F8FAFC",
        },
      },
      fontFamily: {
        sans: ["var(--font-heading)", "Plus Jakarta Sans", "Inter", "sans-serif"],
        heading: ["var(--font-heading)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(20, 36, 58, 0.04), 0 1px 3px 0 rgba(20, 36, 58, 0.02)",
        card: "0 2px 8px -2px rgba(20, 36, 58, 0.05), 0 1px 4px -1px rgba(20, 36, 58, 0.03)",
        elevated: "0 12px 32px -8px rgba(20, 36, 58, 0.08), 0 4px 12px -2px rgba(20, 36, 58, 0.04)",
        dropdown: "0 16px 40px -8px rgba(20, 36, 58, 0.12), 0 4px 16px -2px rgba(20, 36, 58, 0.06)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
