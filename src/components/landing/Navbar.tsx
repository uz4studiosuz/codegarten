"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/design-system/primitives/Button";
import { useAuth } from "@/context/AuthContext";
import { User, LogOut, Settings, Flame } from "lucide-react";

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { openAuthModal, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-40 transition-all duration-200 bg-white/95 backdrop-blur-md
        ${isScrolled ? "border-b border-[#e5e7eb] py-3.5" : "py-5"}
      `}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Minimalist Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/Logo.svg"
                alt="Codegarten"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#121212] font-sans">
              Codegarten
            </span>
          </Link>

          {/* Right Actions: Log In / Register or User Profile */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#121212]">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>7</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#00872e] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs font-bold text-[#121212] truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate font-mono">
                        {user.phoneOrEmail}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-gray-500" />
                      <span>Mening profilim</span>
                    </button>
                    <button
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-gray-500" />
                      <span>Sozlamalar</span>
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Chiqish</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="text-sm font-medium text-[#121212] hover:text-[#00872e] transition-colors cursor-pointer"
                >
                  Kirish
                </button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => openAuthModal("register")}
                  className="hidden sm:inline-flex"
                >
                  Bepul Boshlash
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

