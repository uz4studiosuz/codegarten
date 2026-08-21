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

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold uppercase tracking-wider text-[#26B54F]">
          {trackTitle}
        </span>
        <span className="text-[12px] text-gray-400 dark:text-zinc-500">
          {trackModules.length + 1} ta modul
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* The draft being edited, highlighted */}
        <div
          onClick={onOpenDraft}
          className="rounded-[16px] border-2 border-[#26B54F] bg-[#26B54F]/[0.06] p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#26B54F]/10 transition-colors"
        >
          <div className="min-w-0">
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#26B54F] text-white mb-1.5">
              Tahrirlanayotgan modul
            </span>
            <h3 className="font-extrabold text-[16px] text-gray-900 dark:text-white truncate">
              {draft.title || "(Nomsiz modul)"}
            </h3>
            <p className="text-[12px] text-gray-500 dark:text-zinc-400 mt-0.5">
              {levelsCount} bosqich · {lessonsCount} dars
            </p>
          </div>
          <IconChevronRight size={18} className="text-[#26B54F] shrink-0" />
        </div>

        {/* Existing modules, dimmed */}
        {trackModules.map((m) => (
          <div
            key={m.id}
            className="rounded-[16px] border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#16161a] p-4 flex items-center justify-between gap-3 opacity-60"
          >
            <div className="min-w-0">
              <h3 className="font-bold text-[15px] text-gray-700 dark:text-zinc-300 truncate">
                {m.title}
              </h3>
              <p className="text-[12px] text-gray-400 dark:text-zinc-500 mt-0.5">
                {m.levels.length} bosqich · {m.levels.reduce((s, l) => s + l.lessons.length, 0)} dars
              </p>
            </div>
            <IconLockFilled size={15} className="text-gray-300 dark:text-zinc-600 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stage 2: the lesson path ────────────────────────────────────────────────

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
  return (
    <div className="p-4 flex flex-col gap-5">
      <div className="flex flex-col gap-1 border-b border-gray-100 dark:border-[#27272a] pb-3">
        <h2 className="text-[18px] font-extrabold text-gray-900 dark:text-white">
          {draft.title || "Modul yo'li"}
        </h2>
        {draft.description && (
          <p className="text-[13px] text-gray-500 dark:text-zinc-400">{draft.description}</p>
        )}
      </div>

      {draft.levels.map((level, li) => {
        const isSelectedLevel = selection.kind === "level" && selection.levelIndex === li;
        return (
          <div
            key={li}
            className={`rounded-[16px] border-2 p-3.5 flex flex-col gap-3 transition-colors ${
              isSelectedLevel
                ? "border-[#26B54F] bg-[#26B54F]/[0.04]"
                : "border-gray-100 dark:border-[#222226] bg-gray-50/50 dark:bg-[#16161a]"
            }`}
          >
            <div
              onClick={() => onOpenLevel(li)}
              className="flex items-center justify-between cursor-pointer group"
            >
              <div className="min-w-0">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#26B54F]">
                  {li + 1}-bosqich
                </span>
                <h4 className="font-bold text-[14.5px] text-gray-900 dark:text-zinc-100 truncate group-hover:text-[#26B54F] transition-colors">
                  {level.title || "(Nomsiz bosqich)"}
                </h4>
              </div>
              <span className="text-[11.5px] text-gray-400 dark:text-zinc-500 shrink-0">
                {level.lessons.length} dars
              </span>
            </div>

            <div className="flex flex-col gap-1.5 pl-2 border-l-2 border-gray-200 dark:border-[#2a2a30]">
              {level.lessons.map((lesson, lei) => {
                const isSelectedLesson =
                  selection.kind === "lesson" &&
                  selection.levelIndex === li &&
                  selection.lessonIndex === lei;

                return (
                  <button
                    key={lei}
                    type="button"
                    onClick={() => onOpenLesson(li, lei)}
                    className={`flex items-center justify-between p-2 rounded-[10px] text-left transition-colors cursor-pointer ${
                      isSelectedLesson
                        ? "bg-[#26B54F] text-white font-bold"
                        : "hover:bg-gray-100 dark:hover:bg-[#202025] text-gray-700 dark:text-zinc-300 font-medium"
                    }`}
                  >
                    <span className="text-[13px] truncate">
                      {lei + 1}. {lesson.title || "(Nomsiz dars)"}
                    </span>
                    <span
                      className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                        isSelectedLesson
                          ? "bg-white/20 text-white"
                          : "bg-gray-200/60 dark:bg-[#25252a] text-gray-500 dark:text-zinc-400"
                      }`}
                    >
                      {lesson.xp} XP
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
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
