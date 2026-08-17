/**
 * Codegarten Design System - Color Tokens
 * Supports both Light Mode and Dark Mode palettes (matching Brilliant.org)
 */

export const lightColors = {
  // Primary Canvases & Backgrounds
  canvas: "#ffffff",
  surfacePrimary: "#ffffff",
  surfaceSecondary: "#f7f7f5",
  surfaceTertiary: "#ebebea",
  surfaceCard: "#ffffff",

  // Soft Pastel Tints
  tintPeach: "#fbf3ea",
  tintMint: "#eaf6ed",
  tintSky: "#edf4fb",
  tintLavender: "#f4f1fb",

  // Brand Colors
  brandGreen: "#00872e",
  brandGreenHover: "#007327",
  brandGreenLight: "#e6f4ea",
  brandGreenAccent: "#22C55E",

  // Text Roles
  textPrimary: "#121212",
  textSecondary: "#4b5563",
  textMuted: "#6b7280",
  textLight: "#ffffff",

  // Borders & Dividers
  borderLight: "#e5e7eb",
  borderMedium: "#d1d5db",
  borderSubtle: "#f5efff",
} as const;

export const darkColors = {
  // Primary Canvases & Backgrounds
  canvas: "#141414",
  surfacePrimary: "#1F1F1F",
  surfaceSecondary: "#242426",
  surfaceTertiary: "#2a2a2d",
  surfaceCard: "#1c1c1e",

  // Soft Tint Surfaces for Dark Mode
  tintPeach: "#2a221a",
  tintMint: "#1a2a20",
  tintSky: "#1a2430",
  tintLavender: "#241f30",

  // Brand Colors
  brandGreen: "#22C55E",
  brandGreenHover: "#16a34a",
  brandGreenLight: "#15803d",
  brandGreenAccent: "#22C55E",

  // Text Roles
  textPrimary: "#ffffff",
  textSecondary: "#a1a1aa",
  textMuted: "#71717a",
  textLight: "#ffffff",

  // Borders & Dividers
  borderLight: "#27272a",
  borderMedium: "#3f3f46",
  borderSubtle: "#242426",
} as const;

export const colors = {
  light: lightColors,
  dark: darkColors,
  // Base fallbacks for shared utility tokens
  ...lightColors,
} as const;

export type ColorToken = keyof typeof lightColors;
