/**
 * Codegarten Design System - Color Tokens
 * Clean, minimalist, editorial palette matching Brilliant.org
 * ZERO gradients, solid crisp colors, soft pastel surfaces.
 */

export const colors = {
  // Primary Canvases & Backgrounds
  canvas: "#ffffff",
  surfacePrimary: "#ffffff",
  surfaceSecondary: "#f7f7f5",
  surfaceTertiary: "#ebebea",
  surfaceCard: "#ffffff",

  // Soft Pastel Tint Surfaces (for feature cards)
  tintPeach: "#fbf3ea",
  tintMint: "#eaf6ed",
  tintSky: "#edf4fb",
  tintLavender: "#f4f1fb",

  // Brand Primaries (Solid & Clean)
  brandGreen: "#00872e", // Brilliant's signature solid green
  brandGreenHover: "#007327",
  brandGreenLight: "#e6f4ea",

  brandBlue: "#213c9e",
  brandBlueHover: "#192f7e",

  // Text Roles (Crisp, High Contrast)
  textPrimary: "#121212",
  textSecondary: "#4b5563",
  textMuted: "#6b7280",
  textLight: "#ffffff",

  // Clean Borders & Dividers
  borderLight: "#e5e7eb",
  borderMedium: "#d1d5db",
  borderDark: "#111827",

  // Status Colors
  success: "#00872e",
  error: "#dc2626",
  warning: "#d97706",

  // Footer Dark
  footerBg: "#0c0d0e",
  footerText: "#9ca3af",
} as const;

export type ColorToken = keyof typeof colors;
