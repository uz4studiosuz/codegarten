"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Zap,
  ArrowRight,
} from "lucide-react";
import {
  mockUserProfile,
  foundationalLearningPath,
} from "@/data/mockCourseData";

interface HomeDashboardProps {
  onStartLesson: (moduleId: string, lessonId?: string) => void;
  onNavigateToCourses: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onStartLesson,
  onNavigateToCourses,
}) => {
  const user = mockUserProfile;
  const path = foundationalLearningPath;

  // Selected module in Tezkor qaytish (default: Module 1 "Sikllar")
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(1);
  const [swipeKey, setSwipeKey] = useState(0);

  const activeModule = path.modules[selectedModuleIndex] || path.modules[0];

  const handleSelectModule = (index: number) => {
    if (index === selectedModuleIndex) return;
    setSelectedModuleIndex(index);
    setSwipeKey((prev) => prev + 1); // Trigger card swipe animation
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 font-sans transition-colors duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: User Greeting, Daily Streak & Badges         */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Greeting */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#000000] dark:text-white tracking-tight">
              Salom, {user.name}
            </h1>
          </div>

          {/* 1. FAOLIK / STREAK CARD (2px stroke, 15px radius) */}
          <div className="rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm sm:text-base font-bold text-[#000000] dark:text-white">
                  {user.streakDays} kunlik faollik
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800/80 px-3 py-1 rounded-full">
                {user.xpPoints} XP
              </span>
            </div>

            {/* 7 Days Circular Tracker: D, S, Ch, P, J, Sh, Ya */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {user.weeklyActivity.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${day.isCompleted
                      ? "bg-[#22C55E] text-white shadow-xs"
                      : day.isToday
                        ? "bg-amber-100 dark:bg-amber-950/40 border-2 border-amber-400 text-amber-500"
                        : "bg-gray-100 dark:bg-[#24252a] text-gray-400 dark:text-zinc-600"
                      }`}
                  >
                    <Zap
                      className={`w-3.5 h-3.5 ${day.isCompleted
                        ? "fill-white text-white"
                        : day.isToday
                          ? "fill-amber-500 text-amber-500"
                          : "text-gray-300 dark:text-zinc-700"
                        }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-bold ${day.isCompleted || day.isToday
                      ? "text-[#000000] dark:text-gray-200"
                      : "text-gray-400 dark:text-zinc-500"
                      }`}
                  >
                    {day.dayName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. YUTUQLARINGIZ / BADGES CARD (No BG, No dashed stroke, No icon - Clean Text Only) */}
          <div className="rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                YUTUQLARINGIZ
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-400 dark:text-zinc-400">
                0 ta
              </span>
            </div>

            {/* Clean Text Only Container */}
            <div className="py-3 flex items-center justify-center text-center">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-zinc-400 leading-relaxed max-w-[260px]">
                Hali yutuqlaringiz mavjud emas. Faollikni oshiring va yutuqlarga ega bo&apos;ling!
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: "Tezkor qaytish" Layered Hero Card          */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Subheading */}
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base font-bold text-gray-500 dark:text-zinc-400">
              Tezkor qaytish
            </span>
          </div>

          {/* LAYERED CARD STACK CONTAINER WITH 3D CARD SILHOUETTES */}
          <div className="relative">
            {/* Background Layer 2 (Outer Right Deck Silhouette) */}
            <div className="absolute -right-3 top-3 bottom-3 w-full rounded-[15px] border-2 border-gray-200/50 dark:border-[#27272a]/60 bg-white/40 dark:bg-[#1b1c20]/40 z-0 pointer-events-none" />

            {/* Background Layer 1 (Inner Right Deck Silhouette) */}
            <div className="absolute -right-1.5 top-1.5 bottom-1.5 w-full rounded-[15px] border-2 border-gray-200/80 dark:border-[#27272a]/80 bg-white/70 dark:bg-[#1b1c20]/70 z-0 pointer-events-none" />

            {/* MAIN FOREGROUND CARD (2px Stroke & 15px Radius) */}
            <div className="relative z-10 bg-white dark:bg-[#1b1c20] rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-6 sm:p-8 shadow-sm transition-all duration-300">
              {/* Swipe Animated Content Container */}
              <div
                key={swipeKey}
                className="transition-all duration-300 animate-fadeIn"
                style={{
                  animationName: "swipeInCard",
                  animationDuration: "350ms",
                  animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Inline CSS animation style */}
                <style jsx>{`
                  @keyframes swipeInCard {
                    0% {
                      opacity: 0;
                      transform: translateX(40px) scale(0.97);
                    }
                    100% {
                      opacity: 1;
                      transform: translateX(0) scale(1);
                    }
                  }
                `}</style>

                {/* Header: Title & Green Module Tag */}
                <div className="text-center mb-4">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#000000] dark:text-white tracking-tight">
                    {activeModule.title}
                  </h2>
                  <span className="inline-block mt-1 text-xs font-extrabold font-mono tracking-widest text-[#22C55E] uppercase">
                    {activeModule.level}
                  </span>
                </div>

                {/* CENTER UPLOADED 3D ISOMETRIC IMAGE */}
                <div className="flex items-center justify-center my-6 sm:my-8">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                    <Image
                      src={activeModule.imageSrc || "/images/loops.png"}
                      alt={activeModule.title}
                      width={160}
                      height={160}
                      className="w-full h-full object-contain drop-shadow-md transform hover:scale-105 transition-transform duration-200 select-none"
                      priority
                    />
                  </div>
                </div>

                {/* PROGRESS RING & TOPIC PREVIEW STRIP (Restored original container style) */}
                <div className="bg-gray-50 dark:bg-[#222328] rounded-[15px] p-4 border-2 border-gray-100 dark:border-zinc-800 mb-6 flex items-center gap-4 transition-colors">
                  {/* Circular Progress Ring */}
                  <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200 dark:text-zinc-700"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#22C55E]"
                        strokeDasharray={`${activeModule.progressPercent}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-xs font-bold font-mono text-[#000000] dark:text-white">
                      {activeModule.progressPercent}%
                    </span>
                  </div>

                  {/* Current Topic Text */}
                  <div>
                    <span className="text-xs text-gray-400 dark:text-gray-400 block font-medium">
                      Hozirgi mavzu
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#000000] dark:text-white">
                      {activeModule.steps[1]?.title || activeModule.steps[0]?.title}
                    </span>
                  </div>
                </div>

                {/* FIGMA 3D TACTILE PRIMARY GREEN CTA BUTTON */}
                <button
                  type="button"
                  onClick={() => onStartLesson(activeModule.id)}
                  className="btn-primary-tactile w-full flex items-center justify-center"
                >
                  <span>Davom ettirish</span>
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM MODULE THUMBNAILS ROW (6 Cards with 2px Strokes & Active Green Bevel) */}
          <div className="grid grid-cols-6 gap-2.5 sm:gap-3.5 mt-2">
            {path.modules.map((mod, idx) => {
              const isSelected = idx === selectedModuleIndex;
              return (
                <button
                  key={mod.id}
                  onClick={() => handleSelectModule(idx)}
                  className={`aspect-square rounded-[15px] p-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${isSelected
                    ? "border-2 border-[#22C55E] shadow-xs scale-105 bg-[#22C55E]/10"
                    : "border-2 border-gray-200 dark:border-[#27272a] hover:border-gray-300 dark:hover:border-zinc-700 opacity-80 hover:opacity-100"
                    }`}
                  title={mod.title}
                >
                  <div className="relative w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center">
                    <Image
                      src={mod.imageSrc || "/images/loops.png"}
                      alt={mod.title}
                      width={44}
                      height={44}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
