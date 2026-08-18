"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  IconHome,
  IconBook,
  IconBolt,
  IconMenu2,
  IconX,
  IconSettings,
  IconInfoCircle,
  IconHelp,
  IconLogout,
  IconMoon,
  IconSun,
  IconChevronRight,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserProfileMock, mockUserProfile } from "@/data/mockCourseData";
import { useTheme } from "@/context/ThemeContext";
import { useProgress } from "@/context/ProgressContext";

interface AppNavbarProps {
  activeTab?: "home" | "courses" | "settings";
  setActiveTab?: (tab: "home" | "courses") => void;
  user?: UserProfileMock;
  onOpenStreakModal?: () => void;
  onOpenSettings?: () => void;
  onOpenAbout?: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  activeTab = "home",
  setActiveTab,
  user: propUser,
  onOpenStreakModal,
  onOpenSettings,
  onOpenAbout,
}) => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { logout, user: authUser } = useAuth();
  const { streak, xp } = useProgress();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayUser = propUser || mockUserProfile;

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

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-white dark:bg-[#1F1F1F] border-b border-gray-100 dark:border-[#27272a] transition-colors duration-200 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ========================================================= */}
          {/* LEFT: Codegarten Brand Logo                               */}
          {/* ========================================================= */}
          <div className="flex items-center gap-8">
            <Link
              href="/home"
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
            </Link>

            {/* ========================================================= */}
            {/* CENTER: Clean Tabs (Bosh sahifa, Kurslar)                 */}
            {/* ========================================================= */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/home"
                onClick={() => setActiveTab?.("home")}
                className={`relative py-5 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === "home"
                    ? "text-[#000000] dark:text-white font-bold"
                    : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <IconHome size={18} stroke={2} />
                <span>Bosh sahifa</span>
                {activeTab === "home" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-full" />
                )}
              </Link>

              <Link
                href="/courses"
                onClick={() => setActiveTab?.("courses")}
                className={`relative py-5 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === "courses"
                    ? "text-[#000000] dark:text-white font-bold"
                    : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <IconBook size={18} stroke={2} />
                <span>Kurslar</span>
                {activeTab === "courses" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-full" />
                )}
              </Link>
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
              title={`${streak} kunlik faollik · ${xp} XP`}
            >
              <IconBolt size={16} stroke={2} className="text-[#22C55E] fill-[#22C55E] dark:text-amber-400 dark:fill-amber-400" />
              <span className="font-mono text-sm">{streak}</span>
            </button>

            {/* Menu Hamburger Button */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-9 h-9 rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1F1F1F] text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                aria-label="Menu"
              >
                <IconMenu2 size={18} stroke={2} />
              </button>

              {/* Exact Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1c1c1e] rounded-[10px] shadow-2xl border border-gray-100 dark:border-zinc-800 py-2 z-50 animate-scaleIn">
                  {/* Settings */}
                  <Link
                    href="/settings"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenSettings?.();
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <IconSettings size={18} stroke={1.75} className="text-gray-500" />
                      <span>Sozlamalar</span>
                    </div>
                  </Link>

                  {/* About */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenAbout?.();
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <IconInfoCircle size={18} stroke={1.75} className="text-gray-500" />
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
                        <IconSun size={18} stroke={1.75} className="text-amber-400" />
                      ) : (
                        <IconMoon size={18} stroke={1.75} className="text-purple-600" />
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
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left cursor-pointer"
                  >
                    <IconLogout size={18} stroke={1.75} className="text-red-500" />
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


