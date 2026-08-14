import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/design-system/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#ffffff",
        surface: {
          DEFAULT: "#ffffff",
          soft: "#f7f7f5",
          muted: "#ebebea",
          card: "#ffffff",
        },
        tint: {
          peach: "#fbf3ea",
          mint: "#eaf6ed",
          sky: "#edf4fb",
          lavender: "#f4f1fb",
        },
        brand: {
          DEFAULT: "#00872e",
          hover: "#007327",
          light: "#e6f4ea",
          blue: "#213c9e",
          blueHover: "#192f7e",
        },
        ink: {
          DEFAULT: "#121212",
          secondary: "#4b5563",
          muted: "#6b7280",
          faint: "#9ca3af",
        },
        border: {
          DEFAULT: "#e5e7eb",
          subtle: "#f3f4f6",
          medium: "#d1d5db",
          dark: "#111827",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        pill: "9999px",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.06)",
        float: "0 12px 32px -4px rgba(0, 0, 0, 0.1)",
        button: "0 2px 4px rgba(0, 0, 0, 0.08)",
      },
      fontFamily: {
        serif: [
          "var(--font-serif)",
          "Newsreader",
          "Recoleta",
          "Georgia",
          "serif",
        ],
        sans: [
          "var(--font-sans)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "JetBrains Mono",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
