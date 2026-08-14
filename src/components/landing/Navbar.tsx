"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/design-system/primitives/Button";

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

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
        fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-white
        ${isScrolled ? "border-b border-[#e5e7eb] py-3.5" : "py-5"}
      `}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Minimalist Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            {/* Mascot / Diamond Icon */}
            <div className="w-7 h-7 rounded-md bg-[#00872e] flex items-center justify-center text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="w-4 h-4"
              >
                <path d="M16.5 9.4 7.55 4.24a1.78 1.78 0 0 0-2.5 1.55v12.42a1.78 1.78 0 0 0 2.5 1.55L16.5 14.6a1.78 1.78 0 0 0 0-3.2z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#121212] font-sans">
              Codegarten
            </span>
          </Link>

          {/* Right Action: Clean Log In Link */}
          <div className="flex items-center gap-4">
            <Link
              href="#login"
              className="text-sm font-medium text-[#121212] hover:text-[#00872e] transition-colors"
            >
              Kirish
            </Link>
            <Link href="#get-started">
              <Button size="sm" variant="primary" className="hidden sm:inline-flex">
                Bepul Boshlash
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
