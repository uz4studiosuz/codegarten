"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  IconCircleCheckFilled,
  IconLock,
  IconChevronRight,
  IconChevronLeft,
} from "@tabler/icons-react";
import { foundationsTrack, upcomingTracks, moduleStats } from "@/data/curriculum";
import { useProgress } from "@/context/ProgressContext";

interface CoursesCatalogProps {
  onSelectModule: (moduleId: string) => void;
}

export const CoursesCatalog: React.FC<CoursesCatalogProps> = ({
  onSelectModule,
}) => {
  const mainTrack = foundationsTrack;
  const { moduleProgress, trackPercent } = useProgress();

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
    scrollContainerRef.current?.scrollBy({
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

  const stopDragging = () => {
    isDraggingRef.current = false;
    setIsDraggingState(false);
  };

  /** Modules stay open so a learner can jump in anywhere; only lessons gate. */
  const handleCardClick = (moduleId: string) => {
    if (hasDraggedRef.current) return;
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

      {/* ── MAIN TRACK ── */}
      <section className="mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-black dark:text-white tracking-tight leading-tight">
              {mainTrack.title}
            </h2>
            <p className="text-[13px] text-gray-400 dark:text-zinc-500 mt-0.5">
              {mainTrack.description}
            </p>
          </div>

          {/* Live completion pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#1F1F1F] border border-gray-200 dark:border-zinc-700 shrink-0 shadow-xs">
            <div className="relative w-[18px] h-[18px] shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
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
                  stroke="#26B54F"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${(trackPercent / 100) * 87.96} 87.96`}
                />
              </svg>
            </div>
            <span className="text-[13px] font-semibold text-black dark:text-white whitespace-nowrap">
              {trackPercent}% bajarildi
            </span>
          </div>
        </div>

        {/* ── Horizontal module strip ── */}
        <div className="relative bg-[#F8F9FA] dark:bg-[#1F1F1F] rounded-[15px] border border-gray-200/80 dark:border-zinc-800/80 p-4 sm:p-5 shadow-2xs">

          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow flex items-center justify-center text-gray-500 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="Orqaga"
            >
              <IconChevronLeft size={16} stroke={2} />
            </button>
          )}

          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow flex items-center justify-center text-gray-500 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="Oldinga"
            >
              <IconChevronRight size={16} stroke={2} />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            onScroll={checkScrollability}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
            className={`flex gap-3 overflow-x-auto scrollbar-none select-none ${
              isDraggingState ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {mainTrack.modules.map((mod, idx) => {
              const mp = moduleProgress(mod.id);
              const stats = moduleStats(mod);

              return (
                <div
                  key={mod.id}
                  onClick={() => handleCardClick(mod.id)}
                  className="min-w-[140px] sm:min-w-[148px] lg:min-w-[155px] w-[148px] shrink-0 bg-white dark:bg-[#141414] rounded-[15px] border border-gray-200 dark:border-zinc-700/60 p-3.5 flex flex-col justify-between h-[215px] sm:h-[230px] transition-all duration-200 cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-500 active:scale-[0.99]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono font-bold text-gray-300 dark:text-zinc-600">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      {mp.isFinished ? (
                        <IconCircleCheckFilled size={18} className="text-[#26B54F]" />
                      ) : mp.isStarted ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#26B54F]" />
                      ) : (
                        <span className="text-[10px] font-mono text-gray-300 dark:text-zinc-600">
                          {stats.lessonCount} dars
                        </span>
                      )}
                    </div>

                    <div className="w-full flex items-center justify-center mb-3">
                      <div className="w-[60px] h-[60px] sm:w-[68px] sm:h-[68px]">
                        <Image
                          src={mod.imageSrc}
                          alt={mod.title}
                          width={68}
                          height={68}
                          className="w-full h-full object-contain"
                          draggable={false}
                        />
                      </div>
                    </div>

                    <h3 className="text-[13px] font-bold text-black dark:text-white text-center leading-snug min-h-[36px] flex items-center justify-center px-1">
                      {mod.title}
                    </h3>
                  </div>

                  <div className="mt-2">
                    <div className="w-full h-1 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full rounded-full bg-[#26B54F] transition-[width] duration-500"
                        style={{ width: `${mp.percent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500">
                      {mp.percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── UPCOMING TRACKS ── */}
      {upcomingTracks.map((track) => (
        <section key={track.id} className="mb-3 last:mb-0">
          <div className="bg-white dark:bg-[#1F1F1F] rounded-[15px] border border-gray-200 dark:border-zinc-700/60 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 block mb-1">
                  {track.category}
                </span>
                <h3 className="text-[15px] sm:text-base font-extrabold text-black dark:text-white">
                  {track.title}
                </h3>
                <p className="text-[13px] text-gray-400 dark:text-zinc-500 mt-0.5">
                  {track.description}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-[12px] font-medium text-gray-500 dark:text-zinc-400 shrink-0 shadow-xs whitespace-nowrap">
                <IconLock size={14} stroke={2} />
                <span>Tez kunda</span>
              </div>
            </div>
          </div>
        </section>
      ))}

    </div>
  );
};
