import React from "react";
import { CardVariant } from "@/types/design-system";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-white border border-[#e5e7eb] shadow-card",
  elevated: "bg-white border border-[#d1d5db] shadow-float",
  interactive:
    "bg-white border border-[#e5e7eb] hover:border-[#121212] transition-all duration-200 shadow-card hover:shadow-float",
  glass: "bg-white/90 backdrop-blur-md border border-[#e5e7eb] shadow-card",
  tintPeach: "bg-[#fbf3ea] border border-[#f2e2cf]",
  tintMint: "bg-[#eaf6ed] border border-[#d4edd9]",
  tintSky: "bg-[#edf4fb] border border-[#d7e6f6]",
};

const paddingStyles = {
  none: "p-0",
  sm: "p-3 sm:p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
  xl: "p-8 sm:p-12",
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  hoverable = false,
  padding = "md",
  className = "",
  ...props
}) => {
  return (
    <div
      className={`
        rounded-2xl overflow-hidden
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hoverable ? "transition-all duration-200 hover:-translate-y-0.5 cursor-pointer" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
