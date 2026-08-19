"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  IconBolt,
  IconArrowRight,
  IconPlayerPlayFilled,
  IconSparkles,
  IconCheck,
  IconLayoutGrid,
  IconRoute,
} from "@tabler/icons-react";
import { foundationsTrack, moduleLessons, moduleStats } from "@/data/curriculum";
import { useProgress, type ModuleVisit } from "@/context/ProgressContext";
import { useAuth } from "@/context/AuthContext";
import { AchievementsCard } from "@/achievements";

interface HomeDashboardProps {
  onStartLesson: (moduleId: string, lessonId?: string) => void;
  onNavigateToCourses: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onStartLesson,
  onNavigateToCourses,
}) => {
  const { user: authUser } = useAuth();
  const {
    xp,
    streak,
    weeklyActivity,
    recentModules,
    nextLessonIn,
    trackPercent,
  } = useProgress();

  const modules = foundationsTrack.modules;
  const displayName = authUser?.name || "o'quvchi";

  /**
   * Resuming happens at module level, the way a learner thinks about it: "I was
   * doing Loops", not "I was on lesson m2-l2-3". The card stack below is one
   * card per recently opened module, newest first.
   */
  const cards = recentModules;
  const hasRecent = cards.length > 0;

  /** Where a brand-new learner is pointed: the very first lesson of module 1. */
  const firstLesson = useMemo(() => {
    const first = modules[0];
    if (!first) return undefined;
    return nextLessonIn(first.id) ?? moduleLessons(first)[0];
  }, [modules, nextLessonIn]);

  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState<1 | -1 | 0>(0);
  const [animKey, setAnimKey] = useState(0);

  const dragStartX = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);

  const activeCard: ModuleVisit | undefined =
    cards.length > 0 ? cards[Math.min(selectedCardIndex, cards.length - 1)] : undefined;
  const total = cards.length;

  const goTo = useCallback(
    (nextIdx: number, dir: 1 | -1) => {
      const clamped = Math.max(0, Math.min(total - 1, nextIdx));
      if (clamped === selectedCardIndex) return;
      setSwipeDir(dir);
      setAnimKey((k) => k + 1);
      setSelectedCardIndex(clamped);
    },
    [selectedCardIndex, total]
  );

  const handleSelectCard = (index: number) => {
    if (index === selectedCardIndex) return;
    goTo(index, index > selectedCardIndex ? 1 : -1);
  };

  // ── Drag handlers on the main card ──
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Controls inside the card must stay clickable, so never capture on them.
    if ((e.target as HTMLElement).closest("button, a")) return;
    dragStartX.current = e.clientX;
    isDragging.current = false;
    setDragOffset(0);
    try {
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture is a nicety; dragging still works without it.
    }
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
      if (diff < 0) goTo(selectedCardIndex + 1, 1);
      else goTo(selectedCardIndex - 1, -1);
    }
    isDragging.current = false;
  };

  // Keep the selection inside range when history changes underneath it.
  useEffect(() => {
    setSelectedCardIndex((i) => (i < cards.length ? i : 0));
  }, [cards.length]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 font-sans transition-colors duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

        {/* ══ LEFT COLUMN ══ */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
            Salom, {displayName}
          </h1>

          {/* STREAK & XP */}
          <div className="rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconBolt size={18} stroke={2} className="text-amber-500 fill-amber-500" />
                <span className="text-sm sm:text-base font-bold text-black dark:text-white">
                  {streak} kunlik faollik
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800/80 px-3 py-1 rounded-full">
                {xp} XP
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center">
              {weeklyActivity.map((day) => (
                <div key={day.dayKey} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                      day.isCompleted
                        ? "bg-[#26B54F] text-white shadow-xs"
                        : day.isToday
                        ? "bg-amber-100 dark:bg-amber-950/40 border-2 border-amber-400"
                        : "bg-gray-100 dark:bg-[#24252a]"
                    }`}
                  >
                    <IconBolt
                      size={16}
                      stroke={2}
                      className={
                        day.isCompleted
                          ? "fill-white text-white"
                          : day.isToday
                          ? "fill-amber-500 text-amber-500"
                          : "text-gray-300 dark:text-zinc-700"
                      }
                    />
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      day.isCompleted || day.isToday
                        ? "text-black dark:text-gray-200"
                        : "text-gray-400 dark:text-zinc-500"
                    }`}
                  >
                    {day.dayName}
                  </span>
                </div>
              ))}
            </div>

            {streak === 0 && (
              <p className="mt-4 text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                Bugun bitta dars yakunlang — faollik zanjiri shundan boshlanadi.
              </p>
            )}
          </div>

          {/* ACHIEVEMENTS — rules, storage and the dialog live in src/achievements */}
          <AchievementsCard />

          {/* TRACK PROGRESS */}
          <button
            type="button"
            onClick={onNavigateToCourses}
            className="rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-5 text-left hover:border-gray-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                UMUMIY YO&apos;NALISH
              </span>
              <span className="text-xs font-bold text-[#26B54F]">{trackPercent}%</span>
            </div>
            <p className="text-sm font-bold text-black dark:text-white mb-2.5">
              {foundationsTrack.title}
            </p>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#26B54F] transition-[width] duration-500"
                style={{ width: `${trackPercent}%` }}
              />
            </div>
          </button>
        </div>

        {/* ══ RIGHT COLUMN: resume, or the first-step nudge ══ */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm sm:text-base font-bold text-gray-500 dark:text-zinc-400 min-w-0 truncate">
              {hasRecent ? "Tezkor qaytish" : "Ta'limni boshlash"}
            </span>
            <button
              type="button"
              onClick={onNavigateToCourses}
              className="shrink-0 inline-flex items-center gap-1 text-[13px] font-semibold text-[#26B54F] hover:underline cursor-pointer whitespace-nowrap"
            >
              Barcha kurslar
              <IconArrowRight size={14} />
            </button>
          </div>

          {/* ══ RESUME: one card per recently opened module ══ */}
          {hasRecent && activeCard && (
            <div className="relative">
              <div className="absolute -right-3 top-3 bottom-3 w-full rounded-[15px] border-2 border-gray-200/50 dark:border-[#27272a]/60 bg-white/40 dark:bg-[#1F1F1F]/40 z-0 pointer-events-none" />
              <div className="absolute -right-1.5 top-1.5 bottom-1.5 w-full rounded-[15px] border-2 border-gray-200/80 dark:border-[#27272a]/80 bg-white/70 dark:bg-[#1F1F1F]/70 z-0 pointer-events-none" />

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
                <div
                  key={animKey}
                  style={{
                    animation:
                      animKey === 0
                        ? "none"
                        : swipeDir === 1
                        ? "cardSlideInRight 350ms cubic-bezier(0.16, 1, 0.3, 1) both"
                        : "cardSlideInLeft 350ms cubic-bezier(0.16, 1, 0.3, 1) both",
                  }}
                >
                  <style>{`
                    @keyframes cardSlideInRight {
                      from { opacity: 0; transform: translateX(60px) scale(0.96); }
                      to { opacity: 1; transform: translateX(0) scale(1); }
                    }
                    @keyframes cardSlideInLeft {
                      from { opacity: 0; transform: translateX(-60px) scale(0.96); }
                      to { opacity: 1; transform: translateX(0) scale(1); }
                    }
                  `}</style>

                  <div className="text-center mb-4 pointer-events-none">
                    <span className="inline-block text-xs font-extrabold font-mono tracking-widest text-[#26B54F] uppercase">
                      {activeCard.module.num}-MODUL
                    </span>
                    <h2 className="mt-1.5 text-xl sm:text-2xl font-extrabold text-black dark:text-white tracking-tight leading-tight">
                      {activeCard.module.title}
                    </h2>
                    <span className="mt-1 block text-xs text-gray-400 dark:text-zinc-500">
                      {activeCard.module.tagline || activeCard.module.titleEn}
                    </span>
                  </div>

                  <div className="flex items-center justify-center my-6 sm:my-7 pointer-events-none">
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36">
                      <Image
                        src={activeCard.module.imageSrc}
                        alt={activeCard.module.title}
                        width={144}
                        height={144}
                        className="w-full h-full object-contain drop-shadow-md"
                        priority
                        draggable={false}
                      />
                    </div>
                  </div>

                  {/* Module progress and the lesson "Davom ettirish" lands on */}
                  <div className="bg-gray-50 dark:bg-[#222328] rounded-[15px] p-4 border-2 border-gray-100 dark:border-zinc-800 mb-6 flex items-center gap-4 transition-colors pointer-events-none">
                    <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200 dark:text-zinc-700"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-[#26B54F]"
                          strokeDasharray={`${activeCard.progress.percent}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-bold font-mono text-black dark:text-white">
                        {activeCard.progress.percent}%
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-gray-400 dark:text-gray-400 block font-medium">
                        {activeCard.progress.isFinished
                          ? "Modul yakunlangan"
                          : `Keyingi dars · ${activeCard.progress.completed}/${activeCard.progress.total} dars`}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-black dark:text-white truncate block">
                        {activeCard.progress.isFinished
                          ? `${activeCard.progress.total} dars · ${moduleStats(activeCard.module).totalXp} XP`
                          : activeCard.nextLesson?.lesson.title}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartLesson(activeCard.module.id, activeCard.nextLesson?.lesson.id);
                    }}
                    className="btn-primary-tactile w-full flex items-center justify-center relative z-20 cursor-pointer"
                  >
                    <span>
                      {activeCard.progress.isFinished
                        ? "Qayta ko'rish"
                        : activeCard.progress.isStarted
                        ? "Davom ettirish"
                        : "Boshlash"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartLesson(activeCard.module.id);
                    }}
                    className="mt-3 w-full inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-gray-500 dark:text-zinc-400 hover:text-[#26B54F] transition-colors cursor-pointer"
                  >
                    <IconRoute size={15} />
                    Modul yo&apos;lini ko&apos;rish
                  </button>
                </div>

                {/* Dots mirror the strip below */}
                {cards.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-4">
                    {cards.map((card, i) => (
                      <button
                        key={card.module.id}
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCard(i);
                        }}
                        aria-label={card.module.title}
                        title={card.module.title}
                        className="p-1.5 -m-1 cursor-pointer"
                      >
                        <span
                          className={`block rounded-full transition-all duration-300 ${
                            i === selectedCardIndex
                              ? "w-4 h-1.5 bg-[#26B54F]"
                              : "w-1.5 h-1.5 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ EMPTY STATE: nothing opened yet ══ */}
          {!hasRecent && firstLesson && (
            <div className="relative z-10 bg-white dark:bg-[#1F1F1F] rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-6 sm:p-8 shadow-sm overflow-hidden text-center transition-all">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#26B54F]/10 border border-[#26B54F]/25 text-[#26B54F] text-xs font-extrabold uppercase tracking-wider mb-4">
                <IconSparkles size={14} />
                <span>Boshlang&apos;ich bosqich</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-black dark:text-white tracking-tight leading-tight max-w-lg mx-auto">
                Dasturlash sarguzashtingizni boshlang!
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                Hali birorta modul boshlanmagan. Birinchi moduldan boshlab, interaktiv
                topshiriqlar va o&apos;yinlar orqali dasturlash asoslarini o&apos;rganing.
              </p>

              {/* Empty-state illustration: the path waiting to be walked */}
              <div className="relative flex items-center justify-center my-6 sm:my-8">
                <div className="absolute w-40 h-40 sm:w-48 sm:h-48 bg-[#26B54F]/10 rounded-full blur-2xl pointer-events-none" />
                <EmptyPathIllustration />
              </div>

              <div className="bg-gray-50 dark:bg-[#222328] rounded-[15px] p-4 border-2 border-gray-100 dark:border-zinc-800 mb-6 max-w-md mx-auto flex items-center justify-between text-left">
                <div className="min-w-0 pr-3">
                  <span className="text-[11px] font-extrabold font-mono tracking-wider text-[#26B54F] uppercase block">
                    {firstLesson.module.num}-modul · {firstLesson.module.title}
                  </span>
                  <span className="text-sm font-bold text-black dark:text-white truncate block mt-0.5">
                    {firstLesson.lesson.title}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xs font-extrabold text-black dark:text-zinc-200 block">
                    +{firstLesson.lesson.xp} XP
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-zinc-500 block">
                    ~{firstLesson.lesson.estMinutes} daqiqa
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => onStartLesson(firstLesson.module.id, firstLesson.lesson.id)}
                  className="btn-primary-tactile w-full flex items-center justify-center gap-2 cursor-pointer"
                >
                  <IconPlayerPlayFilled size={16} />
                  <span>Darsni boshlash</span>
                </button>

                <button
                  type="button"
                  onClick={onNavigateToCourses}
                  className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-6 py-3.5 sm:py-4 rounded-[40px] border-2 border-gray-200 dark:border-[#27272a] hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-[#1a1a1e] text-sm font-bold text-black dark:text-white transition-all cursor-pointer shadow-xs active:translate-y-0.5"
                >
                  <IconLayoutGrid size={15} />
                  <span>Kurslarni ko&apos;rish</span>
                </button>
              </div>
            </div>
          )}

          {/* ══ OXIRGI MODULLAR ══ */}
          <div className="mt-5">
            {!hasRecent ? (
              <div className="rounded-[15px] border-2 border-dashed border-gray-200 dark:border-[#27272a] p-4 sm:p-5 bg-gray-50/50 dark:bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-[#26B54F]/15 flex items-center justify-center">
                    <IconSparkles size={16} className="text-[#26B54F]" />
                  </div>
                  <p className="text-xs sm:text-[13px] text-gray-500 dark:text-zinc-400 leading-relaxed min-w-0 flex-1">
                    Modulni boshlashingiz bilan, oxirgi ochilgan modullar va tezkor
                    davom ettirish tugmalari shu yerda to&apos;planadi.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2.5">
                  <IconRoute size={15} className="text-gray-400" />
                  <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    OXIRGI MODULLAR
                  </span>
                </div>

                <div
                  className="flex gap-2.5 sm:gap-3.5 overflow-x-auto scrollbar-none pb-1"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {cards.map((card, i) => {
                    const isSelected = i === selectedCardIndex;

                    return (
                      <button
                        key={card.module.id}
                        type="button"
                        onClick={() => handleSelectCard(i)}
                        title={`${card.module.title} — ${card.progress.percent}%`}
                        className={`shrink-0 w-[104px] sm:w-[116px] rounded-[15px] border-2 p-2.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#26B54F] bg-[#26B54F]/[0.08]"
                            : "border-gray-200 dark:border-[#27272a] hover:border-gray-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div className="relative aspect-square rounded-[10px] bg-gray-50 dark:bg-[#1a1a1e] flex items-center justify-center mb-2">
                          <Image
                            src={card.module.imageSrc}
                            alt={card.module.title}
                            width={44}
                            height={44}
                            className="w-10 h-10 sm:w-11 sm:h-11 object-contain"
                          />
                          {card.progress.isFinished && (
                            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#26B54F] flex items-center justify-center">
                              <IconCheck size={10} stroke={4} className="text-white" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11.5px] font-bold leading-snug text-black dark:text-white line-clamp-2 min-h-[30px]">
                          {card.module.title}
                        </p>
                        <div className="mt-1.5 h-1 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#26B54F] transition-[width] duration-500"
                            style={{ width: `${card.progress.percent}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[10.5px] font-mono text-gray-500 dark:text-zinc-500">
                          {card.progress.completed}/{card.progress.total}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

/**
 * Empty-state illustration: three path nodes with only the first one lit. Drawn
 * inline so it follows the theme instead of shipping a second asset.
 */
function EmptyPathIllustration() {
  return (
    <svg
      width="168"
      height="120"
      viewBox="0 0 168 120"
      fill="none"
      role="img"
      aria-label="Boshlanmagan o'quv yo'li"
      className="relative"
    >
      <path
        d="M28 92 C 56 92, 56 60, 84 60 S 112 28, 140 28"
        stroke="currentColor"
        className="text-gray-200 dark:text-zinc-700"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="7 9"
      />
      <circle cx="28" cy="92" r="14" className="fill-[#26B54F]" />
      <path d="M24 87.5 L 33 92 L 24 96.5 Z" className="fill-white" />
      <circle
        cx="84"
        cy="60"
        r="11"
        className="fill-gray-100 dark:fill-[#24252a] stroke-gray-200 dark:stroke-zinc-700"
        strokeWidth="2"
      />
      <circle
        cx="140"
        cy="28"
        r="11"
        className="fill-gray-100 dark:fill-[#24252a] stroke-gray-200 dark:stroke-zinc-700"
        strokeWidth="2"
      />
    </svg>
  );
}
