import React from "react";
import { TypographyVariant } from "@/types/design-system";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  gradient?: boolean;
  gradientColor?: "brand" | "emerald" | "rainbow";
  align?: "left" | "center" | "right";
}

export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  gradient = false,
  gradientColor = "brand",
  align = "left",
  children,
  className = "",
  ...props
}) => {
  const Tag = `h${level}` as React.ElementType;

  const levelStyles = {
    1: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]",
    2: "text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight",
    3: "text-xl sm:text-2xl font-bold tracking-tight leading-snug",
    4: "text-lg sm:text-xl font-semibold leading-snug",
    5: "text-base sm:text-lg font-semibold",
    6: "text-sm sm:text-base font-semibold uppercase tracking-wider",
  }[level];

  const gradientStyles = gradient
    ? gradientColor === "emerald"
      ? "text-gradient-emerald"
      : gradientColor === "rainbow"
      ? "text-gradient-rainbow"
      : "text-gradient-brand"
    : "text-text-primary";

  const alignStyles = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align];

  return (
    <Tag
      className={`${levelStyles} ${gradientStyles} ${alignStyles} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  color?: "primary" | "secondary" | "muted" | "brand" | "emerald";
  align?: "left" | "center" | "right";
  weight?: "regular" | "medium" | "semibold" | "bold";
}

export const Text: React.FC<TextProps> = ({
  size = "base",
  color = "secondary",
  align = "left",
  weight = "regular",
  children,
  className = "",
  ...props
}) => {
  const sizeStyles = {
    xs: "text-xs leading-relaxed",
    sm: "text-sm leading-relaxed",
    base: "text-base leading-relaxed",
    lg: "text-lg leading-relaxed",
    xl: "text-xl leading-relaxed",
  }[size];

  const colorStyles = {
    primary: "text-text-primary",
    secondary: "text-text-secondary",
    muted: "text-text-muted",
    brand: "text-brand-light",
    emerald: "text-accent-green",
  }[color];

  const weightStyles = {
    regular: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  }[weight];

  return (
    <p
      className={`${sizeStyles} ${colorStyles} ${weightStyles} text-${align} ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export const CodeInline: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <code
      className={`font-mono text-sm px-1.5 py-0.5 rounded bg-bg-elevated text-brand-light border border-border-subtle ${className}`}
      {...props}
    >
      {children}
    </code>
  );
};
