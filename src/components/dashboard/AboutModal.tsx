"use client";

import React from "react";
import Image from "next/image";
import { IconX, IconSparkles, IconCircleCheckFilled, IconHeart } from "@tabler/icons-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] text-[#000000] dark:text-white rounded-[32px] shadow-2xl p-7 border border-gray-100 dark:border-zinc-800 z-10 animate-scaleIn text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <IconX size={16} stroke={2} />
        </button>

        {/* Logo */}
        <div className="w-14 h-14 mx-auto mb-3">
          <Image
            src="/Logo.svg"
            alt="Codegarten"
            width={56}
            height={56}
            className="w-full h-full object-contain"
          />
        </div>

        <h3 className="text-2xl font-extrabold tracking-tight">Codegarten</h3>
        <p className="text-xs font-mono text-[#22C55E] font-bold mt-0.5">
          Talqin 1.0.0
        </p>

        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
          Yoshlar va kattalar uchun mo&apos;ljallangan interaktiv mantiqiy fikrlash,
          algoritmik tafakkur va dasturlash ta&apos;limi platformasi.
        </p>

        <div className="mt-5 p-3.5 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800 text-left text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
          <div className="flex items-center gap-2">
            <IconCircleCheckFilled size={16} className="text-[#22C55E] shrink-0" />
            <span>Interaktiv mantiqiy labirint va modullar</span>
          </div>
          <div className="flex items-center gap-2">
            <IconCircleCheckFilled size={16} className="text-[#22C55E] shrink-0" />
            <span>Haftalik Strike va XP reytingi</span>
          </div>
          <div className="flex items-center gap-2">
            <IconCircleCheckFilled size={16} className="text-[#22C55E] shrink-0" />
            <span>Xalqaro standartdagi STEM pedagogikasi</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <span>Toshkentda mehr bilan yaratilgan</span>
          <IconHeart size={14} className="text-red-500 fill-red-500" />
        </div>
      </div>
    </div>
  );
};
