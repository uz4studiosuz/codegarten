"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/design-system/primitives/Button";
import { IconRotate2 } from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";

export const HeroSection: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { openAuthModal } = useAuth();

  const handlePointClick = (index: number) => {
    setSelectedPoint(index);
    setIsSubmitted(true);
  };

  const resetInteractive = () => {
    setSelectedPoint(null);
    setIsSubmitted(false);
  };

  return (
    <section className="pt-32 pb-16 sm:pt-40 sm:pb-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Heading & Value Proposition */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-[#121212] tracking-tight leading-[1.12] mb-6">
              Dasturlash va kompyuter fanlari bo&apos;yicha{" "}
              <span className="italic font-serif">shaxsiy repetitoringiz</span>
            </h1>

            <p className="text-base sm:text-lg text-[#4b5563] leading-relaxed mb-8 max-w-xl font-normal">
              Murakkab algoritmlar, ma&apos;lumotlar tuzilmalari va tizim arxitekturasini
              zerikarli videolarsiz, interaktiv amaliyot orqali chuqur his qiling.
            </p>

            {/* Action Buttons: Solid Green Pill + Outline Pill */}
            <div className="flex flex-wrap items-center gap-3.5 mb-10">
              <Link href="/register">
                <Button size="lg" variant="primary">
                  Bepul boshlash
                </Button>
              </Link>
              <a href="#curriculum">
                <Button size="lg" variant="secondary">
                  O&apos;quv yo&apos;nalishini tanlang
                </Button>
              </a>
            </div>

            {/* Trust Logotypes in Grayscale */}
            <div className="flex items-center gap-6 text-xs text-[#9ca3af] font-semibold tracking-wider uppercase">
              <span>The New York Times</span>
              <span>&bull;</span>
              <span>The Atlantic</span>
              <span>&bull;</span>
              <span>Forbes</span>
            </div>
          </div>

          {/* Right Column: Brilliant-Style Interactive Canvas Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md rounded-3xl bg-white border border-[#e5e7eb] p-6 sm:p-7 shadow-float relative">
              {/* Card Header with Mascot Indicator */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f3f4f6]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#00872e] flex items-center justify-center text-white text-xs font-bold">
                    K
                  </div>
                  <span className="text-xs font-medium text-[#4b5563]">
                    Interaktiv Sinov: Binary Tree Balansi
                  </span>
                </div>
                <span className="text-xs text-[#9ca3af] font-mono">1-savol</span>
              </div>

              {/* Interactive Visual Graph Canvas */}
              <div className="relative aspect-[4/3] w-full rounded-2xl bg-[#fafafa] border border-[#f0f0f0] flex flex-col items-center justify-center p-4 mb-5 overflow-hidden">
                {/* SVG Graph Structure */}
                <svg viewBox="0 0 300 200" className="w-full h-full">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Edges */}
                  <line x1="150" y1="40" x2="90" y2="100" stroke="#d1d5db" strokeWidth="2" />
                  <line x1="150" y1="40" x2="210" y2="100" stroke="#d1d5db" strokeWidth="2" />
                  <line x1="90" y1="100" x2="50" y2="150" stroke="#d1d5db" strokeWidth="2" />
                  <line x1="90" y1="100" x2="130" y2="150" stroke="#d1d5db" strokeWidth="2" />

                  {/* Root Node */}
                  <circle cx="150" cy="40" r="16" fill="#121212" />
                  <text x="150" y="45" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                    50
                  </text>

                  {/* Left Subtree Node */}
                  <circle cx="90" cy="100" r="16" fill="#00872e" />
                  <text x="90" y="105" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                    25
                  </text>

                  {/* Right Subtree (Target) */}
                  <circle
                    cx="210"
                    cy="100"
                    r="18"
                    fill={selectedPoint === 75 ? "#00872e" : "#e5e7eb"}
                    stroke={selectedPoint === 75 ? "#00872e" : "#9ca3af"}
                    strokeDasharray="4 4"
                    strokeWidth="2"
                    className="cursor-pointer transition-colors"
                  />
                  <text
                    x="210"
                    y="105"
                    fill={selectedPoint === 75 ? "#ffffff" : "#4b5563"}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {selectedPoint === 75 ? "75" : "?"}
                  </text>

                  {/* Leaves */}
                  <circle cx="50" cy="150" r="14" fill="#f3f4f6" stroke="#d1d5db" />
                  <text x="50" y="154" fill="#4b5563" fontSize="11" textAnchor="middle">
                    12
                  </text>

                  <circle cx="130" cy="150" r="14" fill="#f3f4f6" stroke="#d1d5db" />
                  <text x="130" y="154" fill="#4b5563" fontSize="11" textAnchor="middle">
                    35
                  </text>
                </svg>

                {/* Tutor Pointer Icon */}
                <div className="absolute bottom-3 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full border border-[#e5e7eb] text-[11px] text-[#4b5563] shadow-sm">
                  <span>To&apos;g&apos;ri qiymatni tanlang</span>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-xs sm:text-sm font-medium text-[#121212] mb-3.5">
                BST qoidasiga ko&apos;ra, o&apos;ng tomondagi bo&apos;sh tugunga qaysi son joylashishi kerak?
              </p>

              {/* Multiple Choice Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[18, 75, 42].map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePointClick(num)}
                    className={`py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                      selectedPoint === num
                        ? num === 75
                          ? "bg-[#e6f4ea] border-[#00872e] text-[#00872e]"
                          : "bg-[#fef2f2] border-[#dc2626] text-[#dc2626]"
                        : "bg-white border-[#e5e7eb] text-[#121212] hover:border-[#9ca3af]"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Feedback Alert */}
              {isSubmitted && (
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed flex items-center justify-between ${
                    selectedPoint === 75
                      ? "bg-[#e6f4ea] text-[#00872e]"
                      : "bg-[#fef2f2] text-[#dc2626]"
                  }`}
                >
                  <span className="font-medium">
                    {selectedPoint === 75
                      ? "To'g'ri! O'ng tugundagi barcha qiymatlar ildizdan (50) katta bo'lishi shart."
                      : "Noto'g'ri: BST da o'ng shox ildizdan katta bo'lishi kerak."}
                  </span>
                  <button onClick={resetInteractive} className="ml-2 text-xs underline cursor-pointer">
                    <IconRotate2 size={14} stroke={2} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
