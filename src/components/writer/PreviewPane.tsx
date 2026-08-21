"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  IconChevronRight,
  IconLockFilled,
  IconEye,
  IconRefresh,
  IconMaximize,
  IconMinimize,
  IconBook,
  IconStarFilled,
} from "@tabler/icons-react";
import { LessonRunner } from "@/components/lesson/LessonRunner";
import { resolveGame } from "@/games/resolve";
import { getGame } from "@/games/registry";
import type { CourseModule } from "@/data/curriculum";
import { DraftModule, countLessons } from "@/lib/writerDraft";
import { hasReadableBody } from "@/lib/lessonSteps";
import type { Selection } from "./selection";
import type { LessonStep } from "@/types/lessonContent";

/**
 * Live preview
 * ------------
 * Shows the draft the way a learner meets it, in the same three steps the app
 * uses: the module strip, then the lesson path, then the lesson itself. Authors
 * kept mis-judging structure because the old preview jumped straight into a
 * single lesson with no surroundings.
 *
 * The preview and the editor share one selection, so clicking a lesson here
 * opens its form, and picking a lesson in the tree jumps the preview to it.
 */

export type PreviewStage = "modules" | "path" | "lesson";

export function PreviewPane({
  draft,
  trackTitle,
  trackModules,
  selection,
  onSelect,
  stage,
  onStageChange,
}: {
  draft: DraftModule;
  trackTitle: string;
  /** Modules already in the chosen track, shown around the draft. */
  trackModules: readonly CourseModule[];
  selection: Selection;
  onSelect: (selection: Selection) => void;
  stage: PreviewStage;
  onStageChange: (stage: PreviewStage) => void;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lessonSelection = selection.kind === "lesson" ? selection : undefined;
  const level = lessonSelection ? draft.levels[lessonSelection.levelIndex] : undefined;
  const lesson = level?.lessons[lessonSelection?.lessonIndex ?? -1];

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const content = (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-[9999] bg-white dark:bg-[#0c0c0e] flex flex-col overflow-hidden animate-fadeIn w-screen h-screen"
          : "rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] overflow-hidden flex flex-col h-full bg-white dark:bg-[#121215]"
      }
    >
      {/* Floating minimize button in Fullscreen mode */}
      {isFullscreen && (
        <button
          type="button"
          onClick={() => setIsFullscreen(false)}
          title="Kichraytirish (Esc)"
          aria-label="Kichraytirish"
          className="fixed top-4 right-5 z-[10000] inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md border border-gray-200 dark:border-[#333339] shadow-xl text-[12.5px] font-bold text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-zinc-500 transition-all cursor-pointer group"
        >
          <IconMinimize size={15} className="text-gray-500 group-hover:text-black dark:group-hover:text-white" />
          <span>Kichraytirish</span>
          <span className="text-[10.5px] font-mono text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-[#27272a] px-1.5 py-0.5 rounded">
            Esc
          </span>
        </button>
      )}

      {/* ── Header: visible only in normal (non-fullscreen) mode ── */}
      {!isFullscreen && (
        <div className="px-3.5 py-2.5 border-b border-gray-100 dark:border-[#27272a] flex items-center gap-2 shrink-0 bg-white dark:bg-[#121215]">
          <IconEye size={14} className="shrink-0 text-gray-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 shrink-0">
            Jonli ko&apos;rinish
          </span>

          <nav className="ml-auto flex items-center gap-1 min-w-0 text-[11.5px]">
            <button
              type="button"
              onClick={() => onStageChange("modules")}
              className={`px-2 py-1 rounded-full font-bold transition-colors cursor-pointer ${
                stage === "modules"
                  ? "bg-[#26B54F]/15 text-[#1a8a3c] dark:text-[#4ADE80]"
                  : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Modullar
            </button>
            <IconChevronRight size={12} className="text-gray-300 dark:text-zinc-600 shrink-0" />
            <button
              type="button"
              onClick={() => onStageChange("path")}
              className={`px-2 py-1 rounded-full font-bold max-w-[110px] truncate transition-colors cursor-pointer ${
                stage === "path"
                  ? "bg-[#26B54F]/15 text-[#1a8a3c] dark:text-[#4ADE80]"
                  : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              {draft.title || "Modul"}
            </button>
            <IconChevronRight size={12} className="text-gray-300 dark:text-zinc-600 shrink-0" />
            <button
              type="button"
              onClick={() => onStageChange("lesson")}
              disabled={!lesson}
              className={`px-2 py-1 rounded-full font-bold max-w-[110px] truncate transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                stage === "lesson"
                  ? "bg-[#26B54F]/15 text-[#1a8a3c] dark:text-[#4ADE80]"
                  : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              {lesson?.title || "Dars"}
            </button>
          </nav>

          {/* Fullscreen toggle button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            title="To'liq ekran ko'rinishi"
            aria-label="To'liq ekran"
            className="ml-1 p-1.5 rounded-full border border-gray-200 dark:border-[#333339] text-gray-500 dark:text-zinc-400 hover:text-[#26B54F] hover:border-[#26B54F]/50 transition-colors cursor-pointer"
          >
            <IconMaximize size={14} />
          </button>
        </div>
      )}

      <div
        className={`flex-1 overflow-y-auto ${
          isFullscreen ? "w-full h-full" : ""
        }`}
      >
        {stage === "modules" && (
          <ModulesStage
            draft={draft}
            trackTitle={trackTitle}
            trackModules={trackModules}
            onOpenDraft={() => onStageChange("path")}
          />
        )}

        {stage === "path" && (
          <PathStage
            draft={draft}
            selection={selection}
            onOpenLesson={(levelIndex, lessonIndex) => {
              onSelect({ kind: "lesson", levelIndex, lessonIndex });
              onStageChange("lesson");
            }}
            onOpenLevel={(levelIndex) => onSelect({ kind: "level", levelIndex })}
          />
        )}

        {stage === "lesson" && (
          <LessonStage
            draft={draft}
            selection={selection}
            isFullscreen={isFullscreen}
          />
        )}
      </div>
    </div>
  );

  if (isFullscreen && typeof document !== "undefined") {
    return (
      <>
        <div className="rounded-[15px] border-2 border-dashed border-gray-200 dark:border-[#27272a] h-full flex flex-col items-center justify-center p-6 text-center text-gray-400 text-xs">
          <p>To&apos;liq ekranda ko&apos;rilmoqda</p>
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="mt-2 text-[#26B54F] font-bold hover:underline cursor-pointer"
          >
            Kichraytirish (Esc)
          </button>
        </div>
        {createPortal(content, document.body)}
      </>
    );
  }

  return content;
}

// ── Stage 1: the module strip ───────────────────────────────────────────────

function ModulesStage({
  draft,
  trackTitle,
  trackModules,
  onOpenDraft,
}: {
  draft: DraftModule;
  trackTitle: string;
  /** Modules already in the chosen track, shown around the draft. */
  trackModules: readonly CourseModule[];
  onOpenDraft: () => void;
}) {
  const levelsCount = draft.levels.length;
  const lessonsCount = countLessons(draft);
  const themeColor = draft.accent || "#26B54F";

  return (
    <div className="p-5 flex flex-col gap-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#27272a] pb-3">
        <span className="text-[12.5px] font-bold uppercase tracking-wider text-[#26B54F]">
          {trackTitle}
        </span>
        <span className="text-[12px] text-gray-400 dark:text-zinc-500 font-mono">
          {trackModules.length + 1} ta modul
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {/* The draft being edited, full authentic card */}
        <div
          onClick={onOpenDraft}
          className="rounded-[22px] border-2 border-[#26B54F] bg-white dark:bg-[#151518] p-5 flex flex-col gap-4 cursor-pointer hover:shadow-lg transition-all relative overflow-hidden group shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="w-14 h-14 rounded-[16px] bg-[#26B54F]/10 flex items-center justify-center p-2 shrink-0 border border-[#26B54F]/20">
              {draft.imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={draft.imageSrc}
                  alt={draft.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <IconBook size={28} className="text-[#26B54F]" />
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider bg-[#26B54F] text-white shadow-2xs">
                Tahrirlanmoqda
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="font-extrabold text-[17px] text-gray-900 dark:text-white group-hover:text-[#26B54F] transition-colors">
              {draft.title || "(Nomsiz yangi modul)"}
            </h3>
            <p className="text-[13px] text-gray-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
              {draft.description || draft.tagline || "Ushbu modul bo'yicha darslar va mashqlar."}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#222226]">
            <span className="text-[12px] font-bold text-gray-500 dark:text-zinc-400">
              {levelsCount} bosqich · {lessonsCount} dars
            </span>

            <span
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[12px] font-bold text-white shadow-xs group-hover:scale-105 transition-transform"
              style={{ backgroundColor: themeColor }}
            >
              <span>Yo&apos;lni ko&apos;rish</span>
              <IconChevronRight size={14} />
            </span>
          </div>
        </div>

        {/* Existing modules, dimmed authentic preview */}
        {trackModules.map((m) => (
          <div
            key={m.id}
            className="rounded-[20px] border border-gray-200 dark:border-[#27272a] bg-gray-50/50 dark:bg-[#121215] p-4 flex items-center justify-between gap-3 opacity-60"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-[12px] bg-gray-200/60 dark:bg-[#202025] flex items-center justify-center p-1.5 shrink-0">
                {m.imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.imageSrc} alt={m.title} className="w-full h-full object-contain" />
                ) : (
                  <IconBook size={20} className="text-gray-400" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[14.5px] text-gray-700 dark:text-zinc-300 truncate">
                  {m.title}
                </h3>
                <p className="text-[11.5px] text-gray-400 dark:text-zinc-500">
                  {m.levels.length} bosqich · {m.levels.reduce((s, l) => s + l.lessons.length, 0)} dars
                </p>
              </div>
            </div>
            <IconLockFilled size={16} className="text-gray-400 dark:text-zinc-600 shrink-0 mr-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stage 2: the lesson path with authentic Figma LevelCards & Zigzag Discs ──

const ZIG_PATTERN = [0, 32, 52, 32, 0, -32, -52, -32];

function PathStage({
  draft,
  selection,
  onOpenLesson,
  onOpenLevel,
}: {
  draft: DraftModule;
  selection: Selection;
  onOpenLesson: (levelIndex: number, lessonIndex: number) => void;
  onOpenLevel: (levelIndex: number) => void;
}) {
  const themeColor = draft.accent || "#26B54F";
  const allLessonsCount = countLessons(draft);

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6 max-w-lg mx-auto">
      {/* Pinned Module Header */}
      <div className="rounded-[22px] border border-gray-200 dark:border-[#2b2b31] bg-[#F8F9FA] dark:bg-[#101013] p-5 shadow-2xs flex items-start gap-4">
        <div className="w-14 h-14 rounded-[16px] bg-white dark:bg-[#1a1a1e] border border-gray-200 dark:border-[#2b2b31] p-2 flex items-center justify-center shrink-0">
          {draft.imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.imageSrc} alt={draft.title} className="w-full h-full object-contain" />
          ) : (
            <IconBook size={28} className="text-[#26B54F]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-bold text-gray-900 dark:text-white truncate">
            {draft.title || "(Nomsiz modul)"}
          </h2>
          <p className="text-[12.5px] text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
            {draft.description || "Darslar ro'yxatidan istalgan darsni tanlang."}
          </p>
          <div className="flex items-center gap-3 mt-2 text-[12px] font-semibold text-gray-600 dark:text-zinc-400">
            <span>{draft.levels.length} bosqich</span>
            <span>·</span>
            <span>{allLessonsCount} dars</span>
          </div>
        </div>
      </div>

      {/* Levels and Zigzag Trail */}
      <div className="flex flex-col gap-8 pt-2">
        {draft.levels.map((level, li) => {
          const isSelectedLevel = selection.kind === "level" && selection.levelIndex === li;

          return (
            <div key={li} className="flex flex-col gap-6">
              {/* Figma Level Card */}
              <div
                onClick={() => onOpenLevel(li)}
                className={`px-4 py-3 bg-white dark:bg-[#0d0d0f] rounded-[20px] flex flex-col justify-start items-stretch cursor-pointer transition-all hover:scale-[1.01] ${
                  isSelectedLevel ? "ring-2 ring-[#26B54F]" : ""
                }`}
                style={{
                  outline: `2px solid ${themeColor}`,
                  outlineOffset: "-2px",
                  boxShadow: `inset 0px -6px 0px 0px ${themeColor}`,
                }}
              >
                <div className="text-center text-[10.5px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Level {li + 1}
                </div>
                <div className="pt-0.5 text-center text-sm font-bold text-black dark:text-white truncate">
                  {level.title || `Level ${li + 1}`}
                </div>
              </div>

              {/* Lessons Zigzag Discs */}
              <div className="flex flex-col items-center gap-6 py-2">
                {level.lessons.map((lesson, lei) => {
                  const globalIdx =
                    draft.levels.slice(0, li).reduce((sum, l) => sum + l.lessons.length, 0) + lei;
                  const zigOffset = ZIG_PATTERN[globalIdx % ZIG_PATTERN.length];
                  const isSelectedLesson =
                    selection.kind === "lesson" &&
                    selection.levelIndex === li &&
                    selection.lessonIndex === lei;

                  const isFirst = globalIdx === 0;

                  return (
                    <div
                      key={lei}
                      style={{ transform: `translateX(${zigOffset}px)` }}
                      className="flex items-center gap-3 transition-transform duration-200"
                    >
                      <button
                        type="button"
                        onClick={() => onOpenLesson(li, lei)}
                        title={`${lesson.title || "Dars"} · ${lesson.xp} XP`}
                        className={`group relative flex items-center justify-center cursor-pointer transition-all duration-100 active:translate-y-[4px]`}
                      >
                        {/* Duolingo 3D Pressable Disc */}
                        <div
                          className={`w-14 h-12 rounded-full flex items-center justify-center transition-all ${
                            isSelectedLesson
                              ? "bg-[#26B54F] shadow-[0px_5px_0px_0px_#177F37] ring-4 ring-[#26B54F]/30"
                              : isFirst
                              ? "bg-[#F0B03C] shadow-[0px_5px_0px_0px_#C0851F]"
                              : "bg-neutral-200 dark:bg-zinc-800 shadow-[0px_5px_0px_0px_rgba(160,160,160,0.8)] dark:shadow-[0px_5px_0px_0px_#27272a]"
                          }`}
                        >
                          {isSelectedLesson ? (
                            <IconEye size={24} className="text-white" />
                          ) : isFirst ? (
                            <IconStarFilled size={22} className="text-white" />
                          ) : (
                            <IconBook size={20} className="text-neutral-500 dark:text-zinc-400" />
                          )}
                        </div>
                      </button>

                      {/* Lesson title & XP badge */}
                      <button
                        type="button"
                        onClick={() => onOpenLesson(li, lei)}
                        className={`text-left max-w-[150px] min-w-[100px] cursor-pointer group-hover:underline ${
                          isSelectedLesson
                            ? "font-extrabold text-[#26B54F]"
                            : "font-semibold text-gray-700 dark:text-zinc-300"
                        }`}
                      >
                        <span className="block text-[12.5px] truncate leading-tight">
                          {lesson.title || "(nomsiz dars)"}
                        </span>
                        <span className="block text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
                          {lesson.xp} XP · {lesson.estMinutes} daq
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Stage 3: full lesson screen ─────────────────────────────────────────────

function LessonStage({
  draft,
  selection,
  isFullscreen = false,
}: {
  draft: DraftModule;
  selection: Selection;
  isFullscreen?: boolean;
}) {
  const [restartKey, setRestartKey] = useState(0);

  if (selection.kind !== "lesson") {
    return (
      <Placeholder text="Chapdagi tuzilmadan darsni tanlang — uning to'liq dars jarayoni shu yerda ko'rinadi." />
    );
  }

  const level = draft.levels[selection.levelIndex];
  const lesson = level?.lessons[selection.lessonIndex];
  if (!level || !lesson) {
    return <Placeholder text="Bu dars o'chirilgan — boshqasini tanlang." />;
  }

  /*
   * Stands in for src/games/ordinal.ts, which numbers lessons across the whole
   * project: a draft is not in the curriculum yet, so its own position decides
   * which puzzle the preview shows. Two neighbouring lessons still differ.
   */
  const globalLessonIndex =
    draft.levels
      .slice(0, selection.levelIndex)
      .reduce((sum, l) => sum + l.lessons.length, 0) + selection.lessonIndex;

  if (!hasReadableBody(lesson.content)) {
    return (
      <Placeholder text="Dars matni hali bo'sh. Maqsad va kamida bitta bo'lim yozilgach, dars shu yerda ishga tushadi." />
    );
  }

  // The same resolution the app uses, so the preview ends in the real game.
  const challengeStep = lesson.content.steps?.find(
    (s): s is Extract<LessonStep, { kind: "challenge" }> => s.kind === "challenge"
  );
  const game =
    getGame(challengeStep?.gameId || lesson.gameId) ??
    resolveGame({
      kind: lesson.kind,
      lessonTitle: lesson.title,
      levelTitle: level.title,
      moduleTopics: draft.topics,
      seed: lesson.id,
    });

  return (
    <div className={`flex flex-col ${isFullscreen ? "h-full" : ""}`}>
      {!isFullscreen && (
        <div className="px-3.5 py-2 border-b border-gray-100 dark:border-[#27272a] flex items-center justify-between gap-2">
          <span className="text-[11.5px] text-gray-500 dark:text-zinc-400 truncate">
            {game
              ? `O'yin: ${game.name}${
                  challengeStep?.variant !== undefined
                    ? ` (${challengeStep.variant + 1}-masala)`
                    : ""
                }`
              : "O'yinsiz dars"}
          </span>
          <button
            type="button"
            onClick={() => setRestartKey((k) => k + 1)}
            className="shrink-0 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#26B54F] hover:underline cursor-pointer"
          >
            <IconRefresh size={13} />
            Boshidan
          </button>
        </div>
      )}

      <div className={isFullscreen ? "flex-1 w-full" : "min-h-[560px]"}>
        <LessonRunner
          key={`${lesson.id}-${restartKey}`}
          embedded
          lessonId={lesson.id || "preview"}
          lessonTitle={lesson.title || "(nomsiz dars)"}
          levelTitle={`Level ${selection.levelIndex + 1} - ${level.title || ""}`}
          content={lesson.content}
          game={game}
          gameVariant={globalLessonIndex}
          xpReward={lesson.xp}
          exitHref="#"
          nextHref="#"
          nextLabel="Boshidan ko'rish"
          onFinished={() => {}}
          onRestart={() => setRestartKey((k) => k + 1)}
        />
      </div>
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="h-full min-h-[320px] flex items-center justify-center p-8 text-center">
      <p className="text-[13px] leading-relaxed text-gray-500 dark:text-zinc-400 max-w-[280px]">
        {text}
      </p>
    </div>
  );
}
