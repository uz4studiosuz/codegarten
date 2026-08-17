"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  foundationalLearningPath,
  secondaryLearningPaths,
} from "@/data/mockCourseData";

interface CoursesCatalogProps {
  onSelectModule: (moduleId: string) => void;
}

export const CoursesCatalog: React.FC<CoursesCatalogProps> = ({
  onSelectModule,
}) => {
  const mainPath = foundationalLearningPath;
  const secondaryPaths = secondaryLearningPaths;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Mouse drag-to-scroll state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const hasDraggedRef = useRef(false);

  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // Allow 2px threshold for floating point calculations
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => window.removeEventListener("resize", checkScrollability);
  }, [checkScrollability]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = 240;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Mouse Drag to Scroll Handlers
  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    setIsDraggingState(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const el = scrollContainerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.2; // scroll speed multiplier
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - walk;
    checkScrollability();
  };

  const onMouseUp = () => {
    isDraggingRef.current = false;
    setIsDraggingState(false);
  };

  const onMouseLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDraggingState(false);
    }
  };

  const handleCardClick = (moduleId: string, isLocked: boolean) => {
    if (hasDraggedRef.current || isLocked) return;
    onSelectModule(moduleId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 font-sans transition-colors duration-200">
      {/* ========================================================= */}
      {/* HEADER SECTION: Title & Subtitle matching Figma 1:1       */}
      {/* ========================================================= */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#000000] dark:text-white tracking-tight">
          O&apos;quv Yo&apos;nalishlari
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Mukammallikka erishish uchun qadamma-qadam yo&apos;nalishlar
        </p>
      </div>

      {/* ========================================================= */}
      {/* 1. ASOSIY BOSQICH: Dasturiy Tafakkur & Algoritmlar        */}
      {/* ========================================================= */}
      <section className="mb-6">
        <div className="bg-white dark:bg-[#1F1F1F] rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-6 sm:p-8 shadow-xs transition-colors">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 block mb-1">
                ASOSIY BOSQICH
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#000000] dark:text-white tracking-tight">
                {mainPath.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
                {mainPath.description}
              </p>
            </div>

            {/* Circular Progress Pill matching Figma */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 self-start sm:self-center shrink-0">
              <div className="relative w-4 h-4 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200 dark:text-zinc-700"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#22C55E]"
                    strokeDasharray="15, 100"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
              <span className="text-xs font-bold text-[#000000] dark:text-white">
                15% bajarildi
              </span>
            </div>
          </div>

          {/* INNER CONTAINER WITH MODULE CARDS, DRAG-TO-SCROLL & CONDITIONAL BUTTONS */}
          <div className="relative bg-gray-50/70 dark:bg-[#18181b] p-4 sm:p-5 rounded-[15px] border border-gray-100 dark:border-zinc-800/60">
            {/* Conditional Left Button */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => handleScroll("left")}
                className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-200 hover:scale-110 active:scale-95 transition-all absolute -left-4 top-1/2 -translate-y-1/2 z-20 cursor-pointer animate-fadeIn"
                title="Oldingi modullar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Conditional Right Button */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => handleScroll("right")}
                className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-200 hover:scale-110 active:scale-95 transition-all absolute -right-4 top-1/2 -translate-y-1/2 z-20 cursor-pointer animate-fadeIn"
                title="Keyingi modullar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* DRAGGABLE HORIZONTAL MODULE STRIP */}
            <div
              ref={scrollContainerRef}
              onScroll={checkScrollability}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              className={`flex gap-3 sm:gap-3.5 overflow-x-auto scrollbar-none py-1 select-none transition-[cursor] ${
                isDraggingState ? "cursor-grabbing" : "cursor-grab"
              }`}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {mainPath.modules.map((mod, idx) => {
                const isCompleted = mod.status === "completed";
                const isActive = mod.status === "active";
                const isLocked = mod.status === "locked";

                return (
                  <div
                    key={mod.id}
                    onClick={() => handleCardClick(mod.id, isLocked)}
                    className={`min-w-[145px] sm:min-w-[155px] lg:min-w-[160px] flex-1 shrink-0 group relative bg-white dark:bg-[#1F1F1F] rounded-[15px] border-2 p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 ${
                      isCompleted
                        ? "border-gray-200 dark:border-[#27272a] hover:border-[#22C55E] cursor-pointer shadow-xs"
                        : isActive
                        ? "border-2 border-gray-200 dark:border-[#27272a] shadow-xs cursor-pointer"
                        : "border-gray-200 dark:border-[#27272a] opacity-80 cursor-not-allowed"
                    }`}
                  >
                    <div>
                      {/* Top Bar: 01, 02... & Icon */}
                      <div className="flex items-center justify-between mb-2 pointer-events-none">
                        <span className="text-[11px] font-mono font-bold text-gray-400 dark:text-zinc-500">
                          0{idx + 1}
                        </span>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                        ) : isActive ? (
                          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-gray-300 dark:text-zinc-600" />
                        )}
                      </div>

                      {/* 3D Isometric Image */}
                      <div className="w-full aspect-square flex items-center justify-center my-1.5 sm:my-2 pointer-events-none">
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14">
                          <Image
                            src={mod.imageSrc || "/images/loops.png"}
                            alt={mod.title}
                            width={56}
                            height={56}
                            className="w-full h-full object-contain select-none"
                            draggable={false}
                          />
                        </div>
                      </div>

                      {/* Title Centered */}
                      <h3 className="text-xs sm:text-[13px] font-bold text-[#000000] dark:text-white text-center leading-tight min-h-[34px] flex items-center justify-center pointer-events-none">
                        {mod.title}
                      </h3>
                    </div>

                    {/* Bottom Progress Bar & Text */}
                    <div className="mt-3 pt-1 pointer-events-none">
                      <div className="w-full h-1 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full rounded-full ${
                            isCompleted || isActive ? "bg-[#22C55E]" : "bg-transparent"
                          }`}
                          style={{ width: `${mod.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-zinc-500 block text-left">
                        {mod.progressPercent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. O'RTA BOSQICH: Ma'lumotlar Tahlili va Python           */}
      {/* ========================================================= */}
      <section className="mb-4">
        <div className="bg-white dark:bg-[#1F1F1F] rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-5 sm:p-6 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 block mb-1">
                O&apos;RTA BOSQICH
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-[#000000] dark:text-white tracking-tight">
                Ma&apos;lumotlar Tahlili va Python
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                Katta ma&apos;lumotlar tahlili, grafiklar va statistik vizualizatsiya.
              </p>
            </div>

            {/* Tez kunda Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-gray-600 dark:text-zinc-400 self-start sm:self-center shrink-0">
              <Lock className="w-3.5 h-3.5" />
              <span>Tez kunda</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. MAXSUS BOSQICH: Sun'iy Intellekt va Neyron Tarmoqlar   */}
      {/* ========================================================= */}
      <section>
        <div className="bg-white dark:bg-[#1F1F1F] rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-5 sm:p-6 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 block mb-1">
                MAXSUS BOSQICH
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-[#000000] dark:text-white tracking-tight">
                Sun&apos;iy Intellekt va Neyron Tarmoqlar
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                Mashinaviy ta&apos;lim, vaznlar, aktivatsiya funksiyalari va LLM larni chuqur tushunish.
              </p>
            </div>

            {/* Tez kunda Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-gray-600 dark:text-zinc-400 self-start sm:self-center shrink-0">
              <Lock className="w-3.5 h-3.5" />
              <span>Tez kunda</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
