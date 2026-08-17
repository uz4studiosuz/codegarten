"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Zap, ArrowRight } from "lucide-react";
import { mockUserProfile, foundationalLearningPath } from "@/data/mockCourseData";

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

  const [selectedModuleIndex, setSelectedModuleIndex] = useState(1);
  // swipeDir: 1 = left (next), -1 = right (prev), 0 = initial
  const [swipeDir, setSwipeDir] = useState<1 | -1 | 0>(0);
  const [animKey, setAnimKey] = useState(0);

  // Drag state for the main card
  const dragStartX = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);

  const activeModule = path.modules[selectedModuleIndex] || path.modules[0];
  const total = path.modules.length;

  const goTo = useCallback(
    (nextIdx: number, dir: 1 | -1) => {
      const clamped = Math.max(0, Math.min(total - 1, nextIdx));
      if (clamped === selectedModuleIndex) return;
      setSwipeDir(dir);
      setAnimKey((k) => k + 1);
      setSelectedModuleIndex(clamped);
    },
    [selectedModuleIndex, total]
  );

  const handleSelectModule = (index: number) => {
    if (index === selectedModuleIndex) return;
    const dir: 1 | -1 = index > selectedModuleIndex ? 1 : -1;
    goTo(index, dir);
  };

  // ── Drag handlers on the main card ──
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = e.clientX;
    isDragging.current = false;
    setDragOffset(0);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const diff = e.clientX - dragStartX.current;
    if (Math.abs(diff) > 6) isDragging.current = true;
    if (isDragging.current) setDragOffset(diff);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const diff = e.clientX - dragStartX.current;
    dragStartX.current = null;
    setDragOffset(0);

    if (Math.abs(diff) > 60) {
      // swipe left → next, swipe right → prev
      if (diff < 0) goTo(selectedModuleIndex + 1, 1);
      else goTo(selectedModuleIndex - 1, -1);
    }
    isDragging.current = false;
  };

  // Animation: enter from right if dir=1, from left if dir=-1
  const enterTranslate = swipeDir === 1 ? "translateX(56px)" : swipeDir === -1 ? "translateX(-56px)" : "translateX(0)";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 font-sans transition-colors duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Greeting */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#000000] dark:text-white tracking-tight">
              Salom, {user.name}
            </h1>
          </div>

          {/* FAOLIK / STREAK CARD */}
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
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {user.weeklyActivity.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      day.isCompleted
                        ? "bg-[#22C55E] text-white shadow-xs"
                        : day.isToday
                        ? "bg-amber-100 dark:bg-amber-950/40 border-2 border-amber-400 text-amber-500"
                        : "bg-gray-100 dark:bg-[#24252a] text-gray-400 dark:text-zinc-600"
                    }`}
                  >
                    <Zap
                      className={`w-3.5 h-3.5 ${
                        day.isCompleted
                          ? "fill-white text-white"
                          : day.isToday
                          ? "fill-amber-500 text-amber-500"
                          : "text-gray-300 dark:text-zinc-700"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      day.isCompleted || day.isToday
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

          {/* YUTUQLARINGIZ */}
          <div className="rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                YUTUQLARINGIZ
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-400 dark:text-zinc-400">
                0 ta
              </span>
            </div>
            <div className="py-3 flex items-center justify-center text-center">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-zinc-400 leading-relaxed max-w-[260px]">
                Hali yutuqlaringiz mavjud emas. Faollikni oshiring va yutuqlarga ega bo&apos;ling!
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Tezkor qaytish ── */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base font-bold text-gray-500 dark:text-zinc-400">
              Tezkor qaytish
            </span>
          </div>

          {/* LAYERED CARD STACK */}
          <div className="relative">
            {/* Shadow deck layers */}
            <div className="absolute -right-3 top-3 bottom-3 w-full rounded-[15px] border-2 border-gray-200/50 dark:border-[#27272a]/60 bg-white/40 dark:bg-[#1F1F1F]/40 z-0 pointer-events-none" />
            <div className="absolute -right-1.5 top-1.5 bottom-1.5 w-full rounded-[15px] border-2 border-gray-200/80 dark:border-[#27272a]/80 bg-white/70 dark:bg-[#1F1F1F]/70 z-0 pointer-events-none" />

            {/* MAIN FOREGROUND CARD — draggable */}
            <div
              className="relative z-10 bg-white dark:bg-[#1F1F1F] rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-6 sm:p-8 shadow-sm overflow-hidden"
              style={{
                cursor: isDragging.current ? "grabbing" : "grab",
                transform: `translateX(${dragOffset * 0.25}px) rotate(${dragOffset * 0.015}deg)`,
                transition: dragOffset === 0 ? "transform 0.3s cubic-bezier(0.16,1,0.3,1)" : "none",
                userSelect: "none",
                touchAction: "pan-y",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {/* Swipe-animated content */}
              <div
                key={animKey}
                style={{
                  animation: animKey === 0
                    ? "none"
                    : `cardSlideIn 360ms cubic-bezier(0.16,1,0.3,1) both`,
                  // CSS variable for direction
                  ["--enter-x" as string]: enterTranslate,
                }}
              >
                <style>{`
                  @keyframes cardSlideIn {
                    from {
                      opacity: 0;
                      transform: var(--enter-x) scale(0.96);
                    }
                    to {
                      opacity: 1;
                      transform: translateX(0) scale(1);
                    }
                  }
                `}</style>

                {/* Title + Level */}
                <div className="text-center mb-4 pointer-events-none">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#000000] dark:text-white tracking-tight">
                    {activeModule.title}
                  </h2>
                  <span className="inline-block mt-1 text-xs font-extrabold font-mono tracking-widest text-[#22C55E] uppercase">
                    {activeModule.level}
                  </span>
                </div>

                {/* 3D Image */}
                <div className="flex items-center justify-center my-6 sm:my-8 pointer-events-none">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                    <Image
                      src={activeModule.imageSrc || "/images/loops.png"}
                      alt={activeModule.title}
                      width={160}
                      height={160}
                      className="w-full h-full object-contain drop-shadow-md"
                      priority
                      draggable={false}
                    />
                  </div>
                </div>

                {/* Progress strip */}
                <div className="bg-gray-50 dark:bg-[#222328] rounded-[15px] p-4 border-2 border-gray-100 dark:border-zinc-800 mb-6 flex items-center gap-4 transition-colors pointer-events-none">
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
                  <div>
                    <span className="text-xs text-gray-400 dark:text-gray-400 block font-medium">
                      Hozirgi mavzu
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#000000] dark:text-white">
                      {activeModule.steps[1]?.title || activeModule.steps[0]?.title}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={() => onStartLesson(activeModule.id)}
                  className="btn-primary-tactile w-full flex items-center justify-center"
                >
                  <span>Davom ettirish</span>
                </button>
              </div>

              {/* Swipe hint indicator dots */}
              <div className="flex items-center justify-center gap-1.5 mt-4 pointer-events-none">
                {path.modules.map((_, i) => (
                  <span
                    key={i}
                    className={`block rounded-full transition-all duration-300 ${
                      i === selectedModuleIndex
                        ? "w-4 h-1.5 bg-[#22C55E]"
                        : "w-1.5 h-1.5 bg-gray-200 dark:bg-zinc-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* BOTTOM MODULE THUMBNAILS */}
          <div className="grid grid-cols-6 gap-2.5 sm:gap-3.5 mt-2">
            {path.modules.map((mod, idx) => {
              const isSelected = idx === selectedModuleIndex;
              return (
                <button
                  key={mod.id}
                  onClick={() => handleSelectModule(idx)}
                  className={`aspect-square rounded-[15px] p-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-2 border-[#22C55E] shadow-xs scale-105 bg-[#22C55E]/20"
                      : "border-2 border-gray-200 dark:border-[#27272a] hover:border-gray-300 dark:hover:border-zinc-700 opacity-80 hover:opacity-100"
                  }`}
                  title={mod.title}
                >
                  <div className="relative w-8 h-8 sm:w-11 sm:h-11">
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
