import React, { forwardRef } from "react";
import { ButtonVariant, ButtonSize } from "@/types/design-system";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#00872e] text-white hover:bg-[#007327] rounded-full font-medium shadow-button border border-transparent",
  secondary:
    "bg-transparent text-[#121212] hover:bg-[#f3f4f6] border border-[#d1d5db] hover:border-[#121212] rounded-full font-medium",
  ghost:
    "bg-transparent text-[#4b5563] hover:text-[#121212] hover:bg-[#f3f4f6] rounded-full font-medium border border-transparent",
  pill:
    "bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#121212] rounded-full font-medium border border-[#e5e7eb]",
  outline:
    "bg-transparent text-[#121212] border border-[#d1d5db] hover:border-[#121212] rounded-full font-medium",
  dark:
    "bg-[#121212] text-white hover:bg-[#27272a] rounded-full font-medium shadow-button",
  gradient:
    "bg-[#00872e] text-white hover:bg-[#007327] rounded-full font-medium shadow-button",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs sm:text-sm gap-1.5",
  md: "px-6 py-2.5 sm:py-3 text-sm sm:text-base gap-2",
  lg: "px-8 py-3.5 sm:py-4 text-base sm:text-lg gap-2.5",
  xl: "px-9 py-4 sm:py-4.5 text-lg sm:text-xl gap-3",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center
          transition-all duration-150 ease-out select-none
          cursor-pointer disabled:cursor-not-allowed disabled:opacity-40
          active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00872e]/50
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Yuklanmoqda...</span>
          </span>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
