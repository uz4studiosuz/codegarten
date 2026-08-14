/**
 * Codegarten Design System - Spacing Tokens
 * 12px base spacing grid system as outlined in DESIGN-brilliant-org.md
 */

export const spacing = {
  px: "1px",
  1: "4px",
  2: "8px",
  3: "12px", // Base unit
  4: "16px",
  5: "20px",
  6: "24px", // 2x base
  8: "32px",
  9: "36px", // 3x base
  10: "40px",
  12: "48px", // 4x base
  16: "64px",
  20: "80px",
  24: "96px", // 8x base
  32: "128px",
} as const;

export const containers = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1440px",
} as const;
