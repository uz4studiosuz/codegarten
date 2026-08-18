/**
 * Codegarten Design System - Typography Tokens
 */

export const typography = {
  fontFamilies: {
    sans: 'var(--font-sans), "Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
    mono: 'var(--font-mono), "JetBrains Mono", "Fira Code", monospace',
    display: 'var(--font-sans), "Plus Jakarta Sans", system-ui, sans-serif',
  },
  fontSize: {
    display: { size: "2.75rem", lineHeight: "1.15", tracking: "-0.03em" },   // 44px
    h1: { size: "2.25rem", lineHeight: "1.2", tracking: "-0.025em" },        // 36px
    h2: { size: "1.75rem", lineHeight: "1.25", tracking: "-0.02em" },        // 28px
    h3: { size: "1.25rem", lineHeight: "1.35", tracking: "-0.015em" },       // 20px
    h4: { size: "1rem", lineHeight: "1.4", tracking: "-0.01em" },            // 16px
    bodyLg: { size: "1.125rem", lineHeight: "1.6", tracking: "normal" },     // 18px
    body: { size: "1rem", lineHeight: "1.5", tracking: "normal" },           // 16px
    bodySm: { size: "0.875rem", lineHeight: "1.5", tracking: "normal" },     // 14px
    caption: { size: "0.75rem", lineHeight: "1.4", tracking: "0.02em" },     // 12px
    mono: { size: "0.875rem", lineHeight: "1.6", tracking: "normal" },
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
} as const;
