"use client";

import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { AuthModal } from "@/components/auth/AuthModal";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProgressProvider>
          <AuthModal />
          {children}
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
