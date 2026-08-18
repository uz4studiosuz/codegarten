import type { Config } from "tailwindcss";
import { lightColors, darkColors } from "./src/design-system/tokens/colors";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/design-system/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: lightColors.canvas,
        darkCanvas: darkColors.canvas,
        darkSurface: darkColors.surfacePrimary, // #1F1F1F
        darkSurfaceSubtle: darkColors.surfaceSecondary, // #242426
        darkBorder: darkColors.borderLight, // #27272a
        brandGreen: {
          DEFAULT: lightColors.brandGreenAccent,
          hover: darkColors.brandGreenHover,
          dark: darkColors.brandGreenLight,
          light: lightColors.brandGreenLight,
        },
        primary: {
          DEFAULT: "#ff8d23",
          dark: "#ce6809",
          light: "#ffe8d3",
        },
        secondary: {
          DEFAULT: "#9d62ff",
          dark: "#7139cc",
          light: "#f5efff",
        },
        teal: {
          DEFAULT: "#2cb0a1",
          dark: "#218478",
          light: "#d5efec",
        },
        ink: {
          DEFAULT: "#000000",
          secondary: "#364153",
          muted: "#636366",
          faint: "#8e8e93",
        },
        border: {
          DEFAULT: "#f5efff",
          subtle: "#f5efff",
          medium: "rgba(0, 0, 0, 0.1)",
          dark: "#1c1c1e",
        },
      },
      borderRadius: {
        sm: "2px",
        md: "8px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        card: "24px",
        pill: "9999px",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        card: "0 0 15px 0 rgba(0, 0, 0, 0.05)",
        float: "0 0 25px 0 rgba(0, 0, 0, 0.1)",
        "tactile-purple": "0 4px 0 0 #7139cc",
        "tactile-orange": "0 4px 0 0 #ce6809",
        "tactile-teal": "0 4px 0 0 #218478",
        "tactile-green": "0 4px 0 0 #1ba842",
        "tactile-dark": "0 4px 0 0 #27272a",
        "tactile-outline": "0 3px 0 0 rgba(0, 0, 0, 0.06)",
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
          "Plus Jakarta Sans",
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
