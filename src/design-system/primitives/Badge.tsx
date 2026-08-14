import React from "react";
import { BadgeVariant } from "@/types/design-system";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb]",
  brand: "bg-[#e6f4ea] text-[#00872e] border border-[#b7e1cd]",
  success: "bg-[#e6f4ea] text-[#00872e] border border-[#b7e1cd]",
  warning: "bg-[#fef3c7] text-[#b45309] border border-[#fde68a]",
  gray: "bg-[#f3f4f6] text-[#4b5563] border border-[#e5e7eb]",
  outline: "bg-transparent text-[#121212] border border-[#d1d5db]",
  active: "bg-[#121212] text-white border border-[#121212]",
  glow: "bg-[#e6f4ea] text-[#00872e] border border-[#b7e1cd]",
};

const sizeStyles = {
  sm: "px-2.5 py-0.5 text-xs gap-1",
  md: "px-3.5 py-1 text-xs sm:text-sm font-medium gap-1.5",
  lg: "px-4 py-1.5 text-sm font-medium gap-2",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  icon,
  pulse = false,
  className = "",
  ...props
}) => {
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        select-none whitespace-nowrap transition-colors
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 mr-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00872e] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00872e]"></span>
        </span>
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
