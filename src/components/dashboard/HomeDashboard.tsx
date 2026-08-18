"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconBolt,
  IconArrowRight,
  IconPlayerPlayFilled,
  IconSparkles,
  IconTrophy,
  IconClock,
  IconCheck,
  IconLock,
} from "@tabler/icons-react";
import { foundationsTrack, moduleStats } from "@/data/curriculum";
import { useProgress } from "@/context/ProgressContext";
import { useAuth } from "@/context/AuthContext";

interface HomeDashboardProps {
  onStartLesson: (moduleId: string, lessonId?: string) => void;
  onNavigateToCourses: () => void;
}

/** Badges are derived from live progress, never stored. */
function useEarnedBadges() {
  const { completedCount, streak, xp } = useProgress();

  return useMemo(() => {
    const all = [
      {
        id: "first-step",
        name: "Birinchi Qadam",
        description: "Birinchi darsni yakunladingiz",
        icon: "🎯",
        earned: completedCount >= 1,
      },
      {
        id: "five-lessons",
        name: "Sur'at",
        description: "5 ta darsni yakunladingiz",
        icon: "🧩",
        earned: completedCount >= 5,
      },
      {
        id: "streak-3",
        name: "3 Kunlik Strike",
        description: "Ketma-ket 3 kun dars qildingiz",
        icon: "⚡",
        earned: streak >= 3,
      },
      {
        id: "xp-100",
        name: "Yuzlik",
        description: "100 XP to'pladingiz",
        icon: "🏅",
        earned: xp >= 100,
      },
    ];
    return { all, earned: all.filter((b) => b.earned) };
  }, [completedCount, streak, xp]);
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
    moduleProgress,
    nextLessonIn,
    recentLessons,
    isFreshStart,
    recommendedLesson,
    trackPercent,
    isUnlocked,
    isCompleted,
  } = useProgress();

  const modules = foundationsTrack.modules;
  const { all: allBadges, earned: earnedBadges } = useEarnedBadges();

  const displayName = authUser?.name || "o'quvchi";

  /**
   * The big cards and the strip below show the same thing — where to resume.
   * Recent lessons drive both; a learner with no history gets the recommended
   * first lesson so the card is never empty.
   */
  const cards = useMemo(() => {
    if (recentLessons.length > 0) return recentLessons.slice(0, 6);
    const fallback = recommendedLesson ?? nextLessonIn(modules[0].id);
    return fallback ? [fallback] : [];
  }, [recentLessons, recommendedLesson, nextLessonIn, modules]);

  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState<1 | -1 | 0>(0);
  const [animKey, setAnimKey] = useState(0);

  const dragStartX = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);

  const activeCard = cards.length > 0 ? cards[Math.min(selectedCardIndex, cards.length - 1)] : undefined;
  const activeCardProgress = moduleProgress(activeCard?.module.id ?? "");
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

  // Keep the selection inside range when history changes underneath it.
  useEffect(() => {
    setSelectedCardIndex((i) => (i < cards.length ? i : 0));
  }, [cards.length]);

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

          {/* BADGES */}
          <div className="rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                YUTUQLARINGIZ
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-400 dark:text-zinc-400">
                {earnedBadges.length} / {allBadges.length}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {allBadges.map((badge) => (
                <div
                  key={badge.id}
                  title={`${badge.name} — ${badge.description}`}
                  className={`aspect-square rounded-[12px] flex items-center justify-center text-xl transition-all ${
                    badge.earned
                      ? "bg-[#26B54F]/15 border-2 border-[#26B54F]/40"
                      : "bg-gray-100 dark:bg-[#1c1c20] border-2 border-gray-200 dark:border-zinc-800 grayscale opacity-40"
                  }`}
                >
                  {badge.earned ? badge.icon : <IconLock size={15} className="text-gray-400" />}
                </div>
              ))}
            </div>

            {earnedBadges.length === 0 && (
              <p className="mt-3 text-xs font-medium text-gray-500 dark:text-zinc-400 leading-relaxed">
                Hali yutuqlaringiz yo&apos;q. Birinchi darsni yakunlab, birinchisini oching!
              </p>
            )}
          </div>

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

        {/* ══ RIGHT COLUMN: Tezkor qaytish ══ */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm sm:text-base font-bold text-gray-500 dark:text-zinc-400 min-w-0 truncate">
              Tezkor qaytish
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

          {/* LAYERED CARD STACK — one card per resume target */}
          {activeCard && (
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
                    {activeCard!.module.title}
                  </span>
                  <h2 className="mt-1.5 text-xl sm:text-2xl font-extrabold text-black dark:text-white tracking-tight leading-tight">
                    {activeCard!.lesson.title}
                  </h2>
                  <span className="mt-1 block text-xs text-gray-400 dark:text-zinc-500">
                    Level {activeCard!.level.num} · {activeCard!.level.title}
                  </span>
                </div>

                <div className="flex items-center justify-center my-6 sm:my-7 pointer-events-none">
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36">
                    <Image
                      src={activeCard!.module.imageSrc}
                      alt={activeCard!.module.title}
                      width={144}
                      height={144}
                      className="w-full h-full object-contain drop-shadow-md"
                      priority
                      draggable={false}
                    />
                  </div>
                </div>

                {/* Module progress behind this lesson */}
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
                        strokeDasharray={`${activeCardProgress.percent}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold font-mono text-black dark:text-white">
                      {activeCardProgress.percent}%
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-gray-400 dark:text-gray-400 block font-medium">
                      {isCompleted(activeCard!.lesson.id)
                        ? "Yakunlangan dars"
                        : activeCardProgress.isStarted
                        ? "Kutib turgan dars"
                        : "Birinchi dars"}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-black dark:text-white truncate block">
                      {activeCard!.lesson.xp} XP · {activeCard!.lesson.estMinutes} daqiqa
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onStartLesson(activeCard!.module.id, activeCard!.lesson.id)
                  }
                  className="btn-primary-tactile w-full flex items-center justify-center"
                >
                  <span>
                    {isCompleted(activeCard!.lesson.id)
                      ? "Qayta ko'rish"
                      : activeCardProgress.isStarted
                      ? "Davom ettirish"
                      : "Boshlash"}
                  </span>
                </button>
              </div>

              {/* Dots mirror the strip below */}
              {cards.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  {cards.map((card, i) => (
                    <button
                      key={card.lesson.id}
                      type="button"
                      onClick={() => handleSelectCard(i)}
                      aria-label={card.lesson.title}
                      title={card.lesson.title}
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

          {/* ── OXIRGI DARSLAR: horizontal strip, also the card selector ── */}
          <div className="mt-5">
            {isFreshStart ? (
              /* Nothing opened yet — point at one clear first step */
              <div className="rounded-[15px] border-2 border-dashed border-gray-200 dark:border-[#27272a] p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-[#26B54F]/15 flex items-center justify-center">
                    <IconSparkles size={18} className="text-[#26B54F]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-black dark:text-white">
                      Bu yerda oxirgi darslaringiz ko&apos;rinadi
                    </p>
                    <p className="mt-1 text-[13px] text-gray-500 dark:text-zinc-400 leading-relaxed">
                      Hali hech narsa boshlanmagan. Yuqoridagi kartadan boshlasangiz,
                      darslar shu yerda to&apos;planib boradi.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2.5">
                  <IconClock size={15} className="text-gray-400" />
                  <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    OXIRGI DARSLAR
                  </span>
                </div>

                <div
                  className="flex gap-2.5 sm:gap-3.5 overflow-x-auto scrollbar-none pb-1"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {cards.map((card, i) => {
                    const done = isCompleted(card.lesson.id);
                    const isSelected = i === selectedCardIndex;

                    return (
                      <button
                        key={card.lesson.id}
                        type="button"
                        onClick={() => handleSelectCard(i)}
                        title={`${card.lesson.title} — ${card.module.title}`}
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
                          {done && (
                            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#26B54F] flex items-center justify-center">
                              <IconCheck size={10} stroke={4} className="text-white" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11.5px] font-bold leading-snug text-black dark:text-white line-clamp-2 min-h-[30px]">
                          {card.lesson.title}
                        </p>
                        <p className="mt-0.5 text-[10.5px] text-gray-500 dark:text-zinc-500 truncate">
                          Level {card.level.num}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {earnedBadges.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-[12px] text-gray-500 dark:text-zinc-400">
                    <IconTrophy size={14} className="text-amber-500" />
                    Eng yangi yutuq: {earnedBadges[earnedBadges.length - 1].name}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
