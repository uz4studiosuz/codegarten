"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  IconCircleCheckFilled,
  IconLock,
  IconChevronRight,
  IconChevronLeft,
} from "@tabler/icons-react";
import { foundationalLearningPath } from "@/data/mockCourseData";

interface CoursesCatalogProps {
  onSelectModule: (moduleId: string) => void;
}

export const CoursesCatalog: React.FC<CoursesCatalogProps> = ({
  onSelectModule,
}) => {
  const mainPath = foundationalLearningPath;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const hasDraggedRef = useRef(false);

  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => window.removeEventListener("resize", checkScrollability);
  }, [checkScrollability]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -260 : 260,
      behavior: "smooth",
    });
  };

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
    const walk = (x - startXRef.current) * 1.2;
    if (Math.abs(walk) > 4) hasDraggedRef.current = true;
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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 font-sans">

      {/* ── PAGE HEADER ── */}
      <div className="mb-7">
        <h1 className="text-2xl sm:text-[28px] font-extrabold text-black dark:text-white tracking-tight leading-tight">
          O&apos;quv Yo&apos;nalishlari
        </h1>
        <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">
          Mukammallikka erishish uchun qadamma-qadam yo&apos;nalishlar
        </p>
      </div>

      {/* ── MAIN PATH: Dasturiy Tafakkur & Algoritmlar ── */}
      <section className="mb-4">
        {/* Title row — NO outer card wrapper, matches screenshot */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-black dark:text-white tracking-tight leading-tight">
              {mainPath.title}
            </h2>
            <p className="text-[13px] text-gray-400 dark:text-zinc-500 mt-0.5">
              {mainPath.description}
            </p>
          </div>

          {/* 15% bajarildi pill — right-aligned */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#1F1F1F] border border-gray-200 dark:border-zinc-700 shrink-0 shadow-xs">
            {/* Mini ring progress */}
            <div className="relative w-[18px] h-[18px] shrink-0">
              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 36 36"
              >
                <circle
                  cx="18" cy="18" r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-gray-200 dark:text-zinc-700"
                />
                <circle
                  cx="18" cy="18" r="14"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="13.2 87.96"
                />
              </svg>
            </div>
            <span className="text-[13px] font-semibold text-black dark:text-white whitespace-nowrap">
              15% bajarildi
            </span>
          </div>
        </div>

        {/* ── INNER GRAY CONTAINER with horizontal cards ── */}
        <div className="relative bg-white dark:bg-[#1F1F1F] rounded-[18px] p-4">

          {/* Left scroll button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow flex items-center justify-center text-gray-500 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <IconChevronLeft size={16} stroke={2} />
            </button>
          )}

          {/* Right scroll button — visible when can scroll right */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow flex items-center justify-center text-gray-500 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <IconChevronRight size={16} stroke={2} />
            </button>
          )}

          {/* Draggable cards strip */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollability}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            className={`flex gap-3 overflow-x-auto scrollbar-none select-none ${isDraggingState ? "cursor-grabbing" : "cursor-grab"
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
                  className={`min-w-[140px] sm:min-w-[148px] lg:min-w-[155px] w-[148px] shrink-0 bg-[#ffffff] dark:bg-[#141414] rounded-[16px] border border-gray-200 dark:border-zinc-700/60 p-3.5 flex flex-col justify-between h-[215px] sm:h-[230px] transition-all duration-200 ${isLocked
                    ? "cursor-not-allowed opacity-75"
                    : "cursor-pointer hover:shadow-md active:scale-[0.99]"
                    }`}
                >
                  {/* Top row: number + status icon */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono font-bold text-gray-300 dark:text-zinc-600">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      {isCompleted ? (
                        <IconCircleCheckFilled size={18} className="text-[#22C55E]" />
                      ) : isActive ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                      ) : (
                        <IconLock size={15} stroke={2} className="text-gray-300 dark:text-zinc-600" />
                      )}
                    </div>

                    {/* 3D image */}
                    <div className="w-full flex items-center justify-center mb-3">
                      <div className="w-[60px] h-[60px] sm:w-[68px] sm:h-[68px]">
                        <Image
                          src={mod.imageSrc || "/images/loops.png"}
                          alt={mod.title}
                          width={68}
                          height={68}
                          className="w-full h-full object-contain"
                          draggable={false}
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-[13px] font-bold text-black dark:text-white text-center leading-snug min-h-[36px] flex items-center justify-center px-1">
                      {mod.title}
                    </h3>
                  </div>

                  {/* Progress bar + percent */}
                  <div className="mt-2">
                    <div className="w-full h-1 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full ${isCompleted || isActive ? "bg-[#22C55E]" : "bg-transparent"
                          }`}
                        style={{ width: `${mod.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500">
                      {mod.progressPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── O'RTA BOSQICH ── */}
      <section className="mb-3">
        <div className="bg-white dark:bg-[#1F1F1F] rounded-[18px] border border-gray-200 dark:border-zinc-700/60 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 block mb-1">
                O&apos;RTA BOSQICH
              </span>
              <h3 className="text-[15px] sm:text-base font-extrabold text-black dark:text-white">
                Ma&apos;lumotlar Tahlili va Python
              </h3>
              <p className="text-[13px] text-gray-400 dark:text-zinc-500 mt-0.5">
                Katta ma&apos;lumotlar tahlili, grafiklar va statistik vizualizatsiya.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-[12px] font-medium text-gray-500 dark:text-zinc-400 shrink-0 shadow-xs whitespace-nowrap">
              <IconLock size={14} stroke={2} />
              <span>Tez kunda</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAXSUS BOSQICH ── */}
      <section>
        <div className="bg-white dark:bg-[#1F1F1F] rounded-[18px] border border-gray-200 dark:border-zinc-700/60 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 block mb-1">
                MAXSUS BOSQICH
              </span>
              <h3 className="text-[15px] sm:text-base font-extrabold text-black dark:text-white">
                Sun&apos;iy Intellekt va Neyron Tarmoqlar
              </h3>
              <p className="text-[13px] text-gray-400 dark:text-zinc-500 mt-0.5">
                Mashinaviy ta&apos;lim, vaznlar, aktivatsiya funksiyalari va LLM larni chuqur tushunish.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-[12px] font-medium text-gray-500 dark:text-zinc-400 shrink-0 shadow-xs whitespace-nowrap">
              <IconLock size={14} stroke={2} />
              <span>Tez kunda</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};