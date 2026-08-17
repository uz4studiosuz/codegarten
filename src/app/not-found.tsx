"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IconCompass,
  IconHome,
  IconArrowLeft,
  IconBook,
  IconSearch,
  IconCode,
  IconSparkles,
} from "@tabler/icons-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#121212] text-black dark:text-white flex flex-col font-sans transition-colors duration-200 selection:bg-[#22C55E]/20 selection:text-[#22C55E]">
      {/* Top minimal header */}
      <header className="w-full border-b border-gray-200/80 dark:border-zinc-800 bg-white/80 dark:bg-[#18181B]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/Logo.svg"
                alt="Codegarten"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-black dark:text-white">
              Codegarten
            </span>
          </Link>

          <Link
            href="/courses"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <IconBook size={16} stroke={1.75} />
            <span>Kurslar katalogi</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Hero Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 text-center relative overflow-hidden">
        {/* Soft Background Ambient Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-[#22C55E]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* 404 Illustration Badge */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white dark:bg-[#1C1C1E] border-2 border-gray-200 dark:border-zinc-700 shadow-xl flex items-center justify-center mx-auto transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <IconCompass
              size={54}
              stroke={1.5}
              className="text-[#22C55E] animate-pulse"
            />
          </div>
          <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-[#22C55E] text-white font-mono font-extrabold text-xs shadow-md">
            404
          </span>
        </div>

        {/* Heading & Subtitle */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black dark:text-white tracking-tight mb-3">
          Yo&apos;ldan adashdingizmi?
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed mb-8">
          Siz qidirayotgan sahifa mavjud emas yoki boshqa manzilga ko&apos;chirilgan.
          Keling, sizni kerakli yo&apos;nalishga qaytaramiz.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-sm mb-10">
          <Link
            href="/home"
            className="btn-primary-tactile flex-1 py-3 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
          >
            <IconHome size={18} stroke={2} />
            <span>Bosh sahifaga qaytish</span>
          </Link>

          <Link
            href="/courses"
            className="w-full sm:w-auto py-3 px-6 rounded-full border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1C1C1E] text-xs sm:text-sm font-bold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <IconBook size={18} stroke={2} />
            <span>Kurslar</span>
          </Link>
        </div>

        {/* Quick Help Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left">
          <Link
            href="/home"
            className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-gray-200/80 dark:border-zinc-800 hover:border-[#22C55E] dark:hover:border-[#22C55E] transition-all group shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-700 dark:text-zinc-300 group-hover:bg-[#22C55E]/10 group-hover:text-[#22C55E] mb-2.5 transition-colors">
              <IconCode size={18} stroke={1.75} />
            </div>
            <h2 className="text-xs font-bold text-black dark:text-white mb-0.5">
              Tezkor darslar
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400">
              Oxirgi faol modulingizdan davom eting
            </p>
          </Link>

          <Link
            href="/courses"
            className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-gray-200/80 dark:border-zinc-800 hover:border-[#22C55E] dark:hover:border-[#22C55E] transition-all group shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-700 dark:text-zinc-300 group-hover:bg-[#22C55E]/10 group-hover:text-[#22C55E] mb-2.5 transition-colors">
              <IconCompass size={18} stroke={1.75} />
            </div>
            <h2 className="text-xs font-bold text-black dark:text-white mb-0.5">
              Yo&apos;nalishlar
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400">
              CS, Algoritmlar va AI modullari
            </p>
          </Link>

          <Link
            href="/settings"
            className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-gray-200/80 dark:border-zinc-800 hover:border-[#22C55E] dark:hover:border-[#22C55E] transition-all group shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-700 dark:text-zinc-300 group-hover:bg-[#22C55E]/10 group-hover:text-[#22C55E] mb-2.5 transition-colors">
              <IconSparkles size={18} stroke={1.75} />
            </div>
            <h2 className="text-xs font-bold text-black dark:text-white mb-0.5">
              Sozlamalar
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400">
              Hisob va profil qulayliklari
            </p>
          </Link>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 text-center text-xs text-gray-400 dark:text-zinc-600 border-t border-gray-200/60 dark:border-zinc-800">
        <p>&copy; {new Date().getFullYear()} Codegarten Inc. Barcha huquqlar himoyalangan.</p>
      </footer>
    </div>
  );
}
