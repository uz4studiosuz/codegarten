"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  IconArrowLeft,
  IconBook,
  IconDumbbell,
  IconCheck,
  IconStarFilled,
  IconLockFilled,
  IconBarbell,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { AppNavbar } from "@/components/dashboard/AppNavbar";
import {
  Lesson,
  Level,
  getModule,
  moduleLessons,
  moduleStats,
} from "@/data/curriculum";
import { useProgress } from "@/context/ProgressContext";

/** Brand primary, matching the Figma "Primary" token. */
const PRIMARY = "#26B54F";

/** Sticky offsets: 64px navbar, then the pinned "Next up" ribbon. */
const NEXTUP_TOP = 76;
const LEVEL_TOP = 160;

/** A repeating sine-like wander that turns a lesson list into a trail. */
const ZIG_PATTERN = [0, 40, 64, 40, 0, -40, -64, -40];

type DiscState = "completed" | "active" | "locked";

/**
 * Duolingo-style pressable disc: a hard offset shadow that collapses as the
 * node is pushed down, so clicking feels physical.
 */
function LessonDisc({
  state,
  isReview,
}: {
  state: DiscState;
  isReview: boolean;
}) {
  const skin =
    state === "completed"
      ? "bg-[#26B54F] shadow-[0px_5px_0px_0px_#1A8038]"
      : state === "active"
      ? "bg-[#F0B03C] shadow-[0px_5px_0px_0px_#C0851F]"
      : "bg-neutral-200 shadow-[0px_5px_0px_0px_rgba(183,183,183,1.00)]";

  const icon =
    state === "completed" ? (
      <IconCheck size={28} stroke={3.2} className="text-white" />
    ) : state === "active" ? (
      <IconStarFilled size={25} className="text-white" />
    ) : isReview ? (
      <IconBarbell size={25} stroke={2} className="text-neutral-400" />
    ) : (
      <IconLockFilled size={21} className="text-neutral-400" />
    );

  return (
    <div
      className={`w-16 h-14 rounded-full flex items-center justify-center transition-all duration-100 group-active:translate-y-[5px] group-active:shadow-none ${skin}`}
    >
      {icon}
    </div>
  );
}

/** The Figma level card: 2px inset outline plus a 6px inset base in primary. */
function LevelCard({ level }: { level: Level }) {
  return (
    <div
      className="px-4 py-3 bg-[#0d0d0f] rounded-[20px] flex flex-col justify-start items-stretch"
      style={{
        outline: `2px solid ${PRIMARY}`,
        outlineOffset: "-2px",
        boxShadow: `inset 0px -6px 0px 0px ${PRIMARY}`,
      }}
    >
      <div className="text-center text-[10px] font-mono font-bold uppercase leading-4 tracking-wide text-gray-500">
        Level {level.num}
      </div>
      <div className="pt-0.5 text-center text-sm font-normal leading-5 text-white">
        {level.title}
      </div>
    </div>
  );
}

export default function ModulePathPage() {
  const urlParams = useParams();
  const moduleId = (urlParams?.moduleId as string) || "mod-2";

  const { isCompleted, isUnlocked, nextLessonIn, moduleProgress, levelProgress } =
    useProgress();

  const module = getModule(moduleId);

  if (!module) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col font-sans">
        <AppNavbar activeTab="courses" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-lg font-bold">Bunday modul topilmadi.</p>
          <Link
            href="/courses"
            className="text-[15px] text-[#26B54F] hover:underline"
          >
            Kurslar ro&apos;yxatiga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const stats = moduleStats(module);
  const progress = moduleProgress(moduleId);
  const nextLesson = nextLessonIn(moduleId);
  const allLessons = moduleLessons(module);

  const discStateFor = (lesson: Lesson): DiscState => {
    if (isCompleted(lesson.id)) return "completed";
    if (nextLesson?.lesson.id === lesson.id) return "active";
    return isUnlocked(moduleId, lesson.id) ? "active" : "locked";
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col font-sans">
      <AppNavbar activeTab="courses" />

      {/* ── Breadcrumb ── */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-[1118px] mx-auto px-6 py-5 flex items-center gap-2.5">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-[15px] text-[#8b8b93] hover:text-white transition-colors"
          >
            <IconArrowLeft size={18} />
            Courses
          </Link>
          <span className="text-[#3a3a41] text-[15px]">/</span>
          <span className="text-[15px] text-[#c9c9d0]">{module.title}</span>
        </div>
      </div>

      <main className="flex-1 max-w-[1118px] w-full mx-auto px-6 py-[52px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-11 lg:gap-[72px] items-start">

          {/* ══ LEFT: module summary — pinned while the path scrolls ══ */}
          <div className="lg:sticky lg:top-[76px]">
            <div className="rounded-[26px] border border-[#2b2b31] bg-[#101013] p-7">
              <Image
                src={module.imageSrc}
                alt={module.title}
                width={72}
                height={72}
                className="w-[72px] h-[72px] object-contain"
              />

              <h1 className="mt-6 text-[26px] font-bold leading-tight text-white">
                {module.title}
              </h1>
              <p className="mt-2.5 text-[15px] leading-[1.65] text-[#8b8b93]">
                {module.description}
              </p>

              {/* Live module progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2 text-[13px]">
                  <span className="text-[#8b8b93]">
                    {progress.completed}/{progress.total} dars
                  </span>
                  <span className="font-bold text-[#4ADE80]">{progress.percent}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#26B54F] transition-[width] duration-500"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 h-px bg-[#2b2b31]" />

              <div className="mt-5 flex items-center gap-7 text-[15px] text-[#9a9aa2]">
                <span className="inline-flex items-center gap-2">
                  <IconBook size={18} stroke={1.8} className="text-[#7a7a83]" />
                  {stats.lessonCount} Lessons
                </span>
                <span className="inline-flex items-center gap-2">
                  <IconDumbbell size={18} stroke={1.8} className="text-[#7a7a83]" />
                  {stats.exerciseCount} Exercises
                </span>
              </div>
            </div>
          </div>

          {/* ══ RIGHT: the lesson trail ══ */}
          <div className="min-w-0">

            {/* Pinned "Next up" ribbon — always reachable while scrolling */}
            {nextLesson && (
              <div
                className="sticky z-30 mb-8"
                style={{ top: NEXTUP_TOP }}
              >
                <Link
                  href={`/learn/${moduleId}/${nextLesson.lesson.id}`}
                  className="flex items-center gap-4 rounded-[20px] border border-[#2b2b31] bg-[#16161a]/95 backdrop-blur px-5 py-3.5 hover:border-[#3d3d45] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] text-[#8b8b93]">Next up</div>
                    <div className="mt-0.5 text-[16px] font-bold text-white truncate">
                      {nextLesson.lesson.title}
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#26B54F] px-4 py-2 text-[13px] font-bold text-white">
                    <IconPlayerPlayFilled size={13} />
                    {progress.isStarted ? "Davom etish" : "Boshlash"}
                  </span>
                </Link>
              </div>
            )}

            {/*
             * One section per level. The level card is sticky inside its own
             * section, so as a section scrolls out its card hands the pinned
             * slot over to the next level's card.
             */}
            {module.levels.map((level) => {
              const lp = levelProgress(moduleId, level.id);

              return (
                <section key={level.id} className="relative mb-4">
                  <div className="sticky z-20 py-2 bg-[#0d0d0f]" style={{ top: LEVEL_TOP }}>
                    <LevelCard level={level} />
                  </div>

                  <div className="flex flex-col pt-6">
                    {level.lessons.map((lesson) => {
                      const globalIndex = allLessons.findIndex(
                        (l) => l.lesson.id === lesson.id
                      );
                      const zig = ZIG_PATTERN[globalIndex % ZIG_PATTERN.length];
                      const state = discStateFor(lesson);
                      const locked = state === "locked";
                      const isReview = lesson.kind === "review";

                      /*
                       * The wandering trail only reads well when there is room
                       * for it. Below lg the disc pins to the left edge so the
                       * title gets the full width and can wrap instead of being
                       * clipped.
                       */
                      const anchor = {
                        "--x": `calc(50% + ${zig}px - 32px)`,
                        "--x-sm": "4px",
                      } as React.CSSProperties;

                      return (
                        <div
                          key={lesson.id}
                          className="relative w-full min-h-[76px] lg:h-[61px] mb-6 lg:mb-[38px]"
                          style={anchor}
                        >
                          <Link
                            href={locked ? "#" : `/learn/${moduleId}/${lesson.id}`}
                            aria-disabled={locked}
                            tabIndex={locked ? -1 : undefined}
                            onClick={(e) => locked && e.preventDefault()}
                            title={`${lesson.title} · ${lesson.xp} XP`}
                            className={`group absolute top-0 left-[var(--x-sm)] lg:left-[var(--x)] flex items-center gap-4 ${
                              locked
                                ? "cursor-default"
                                : "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#26B54F] rounded-full"
                            }`}
                          >
                            <LessonDisc state={state} isReview={isReview} />
                            <div className="min-w-0 max-w-[calc(100vw-150px)] sm:max-w-[280px] lg:max-w-none">
                              <div
                                className={`text-[14px] sm:text-[15px] leading-snug lg:whitespace-nowrap ${
                                  state === "active"
                                    ? "font-bold text-white"
                                    : locked
                                    ? "font-medium text-[#6d6d74]"
                                    : "font-medium text-[#c9c9d0]"
                                }`}
                              >
                                {lesson.title}
                              </div>
                              <div className="text-[12px] text-[#5c5c64] whitespace-nowrap">
                                {lesson.xp} XP · {lesson.estMinutes} daq
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>

                  {/* Level footer — shows the level is cleared */}
                  {lp.isFinished && (
                    <div className="flex justify-center pb-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#26B54F]/15 px-3.5 py-1.5 text-[12px] font-bold text-[#4ADE80]">
                        <IconCheck size={13} stroke={3} />
                        Bosqich yakunlandi
                      </span>
                    </div>
                  )}
                </section>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}
