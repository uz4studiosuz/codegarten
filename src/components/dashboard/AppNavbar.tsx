"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Home,
  BookOpen,
  Zap,
  Menu,
  X,
  Settings,
  Info,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
} from "lucide-react";
import { UserProfileMock } from "@/data/mockCourseData";
import { useTheme } from "@/context/ThemeContext";

interface AppNavbarProps {
  activeTab: "home" | "courses";
  setActiveTab: (tab: "home" | "courses") => void;
  user: UserProfileMock;
  onOpenStreakModal?: () => void;
  onOpenSettings?: () => void;
  onOpenAbout?: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenStreakModal,
  onOpenSettings,
  onOpenAbout,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-white dark:bg-[#1F1F1F] border-b border-gray-100 dark:border-[#27272a] transition-colors duration-200 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ========================================================= */}
          {/* LEFT: Codegarten Brand Logo                               */}
          {/* ========================================================= */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab("home")}
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-none select-none"
            >
              <div className="w-8 h-8 group-hover:scale-105 transition-transform shrink-0">
                <Image
                  src="/Logo.svg"
                  alt="Codegarten Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#000000] dark:text-white font-sans">
                Codegarten
              </span>
            </button>

            {/* ========================================================= */}
            {/* CENTER: Clean Tabs (Bosh sahifa, Kurslar)                 */}
            {/* ========================================================= */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                type="button"
                onClick={() => setActiveTab("home")}
                className={`relative py-5 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${activeTab === "home"
                    ? "text-[#000000] dark:text-white font-bold"
                    : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                  }`}
              >
                <Home className="w-4 h-4" />
                <span>Bosh sahifa</span>
                {activeTab === "home" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("courses")}
                className={`relative py-5 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${activeTab === "courses"
                    ? "text-[#000000] dark:text-white font-bold"
                    : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                  }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Kurslar</span>
                {activeTab === "courses" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-full" />
                )}
              </button>
            </nav>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: Streak Counter & Menu Button                       */}
          {/* ========================================================= */}
          <div className="flex items-center gap-3">
            {/* Streak Counter Pill: [ ⚡ 2 ] */}
            <button
              type="button"
              onClick={onOpenStreakModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1c1c1e] text-black dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer select-none font-bold text-xs shadow-xs"
              title="2 kunlik faollik"
            >
              <Zap className="w-3.5 h-3.5 text-[#22C55E] fill-[#22C55E] dark:text-amber-400 dark:fill-amber-400" />
              <span className="font-mono text-sm">{user.streakDays}</span>
            </button>

            {/* Menu Hamburger Button */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#27272a] text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Exact Dropdown Menu (Screenshot 3 Style) */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 py-2 z-50 animate-scaleIn">
                  {/* Settings */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenSettings?.();
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span>Sozlamalar</span>
                    </div>
                  </button>

                  {/* About */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenAbout?.();
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Info className="w-4 h-4 text-gray-500" />
                      <span>Haqida</span>
                    </div>
                  </button>

                  {/* Theme Switcher (Dark / Light) */}
                  <button
                    onClick={() => {
                      toggleTheme();
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {theme === "dark" ? (
                        <Sun className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-purple-600" />
                      )}
                      <span>{theme === "dark" ? "Kunduzgi rejim" : "Tungi rejim"}</span>
                    </div>
                    <span className="text-[11px] font-mono text-gray-400 uppercase">
                      {theme}
                    </span>
                  </button>

                  <div className="border-t border-gray-100 dark:border-zinc-800 my-1" />

                  {/* Log out */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Chiqish</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
