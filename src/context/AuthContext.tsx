"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type AuthMode = "login" | "register" | "verify" | "profile";
export type AuthTab = "phone" | "email";
export type VerificationMethod = "sms" | "telegram";

export interface UserProfile {
  name: string;
  lastName?: string;
  phoneOrEmail: string;
  avatarUrl?: string;
  gender?: "male" | "female";
  birthDate?: string;
  region?: string;
  district?: string;
}

interface AuthContextType {
  isOpen: boolean;
  mode: AuthMode;
  tab: AuthTab;
  method: VerificationMethod;
  pendingPhone: string;
  user: UserProfile | null;
  isLoading: boolean;
  openAuthModal: (initialMode?: AuthMode, initialTab?: AuthTab) => void;
  closeAuthModal: () => void;
  setMode: (mode: AuthMode) => void;
  setTab: (tab: AuthTab) => void;
  setMethod: (method: VerificationMethod) => void;
  setPendingPhone: (phone: string) => void;
  login: (userData: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [tab, setTab] = useState<AuthTab>("phone");
  const [method, setMethod] = useState<VerificationMethod>("sms");
  const [pendingPhone, setPendingPhone] = useState("");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user session from localStorage if available
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("codegarten_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to load user from localStorage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = (initialMode: AuthMode = "login", initialTab: AuthTab = "phone") => {
    setMode(initialMode);
    setTab(initialTab);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
  };

  const login = (userData: UserProfile) => {
    setUser(userData);
    try {
      localStorage.setItem("codegarten_user", JSON.stringify(userData));
    } catch (e) {
      console.error("Failed to save user", e);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("codegarten_user");
  };

  return (
    <AuthContext.Provider
      value={{
        isOpen,
        mode,
        tab,
        method,
        pendingPhone,
        user,
        isLoading,
        openAuthModal,
        closeAuthModal,
        setMode,
        setTab,
        setMethod,
        setPendingPhone,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
