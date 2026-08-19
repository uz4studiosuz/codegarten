"use client";

import React from "react";
import Image from "next/image";
import {
  IconChevronRight,
  IconLockFilled,
  IconStarFilled,
  IconBarbell,
  IconEye,
  IconRefresh,
} from "@tabler/icons-react";
import { LessonRunner } from "@/components/lesson/LessonRunner";
import { resolveGame } from "@/games/resolve";
import { getGame } from "@/games/registry";
import type { CourseModule } from "@/data/curriculum";
import { DraftModule, KIND_LABELS } from "@/lib/writerDraft";
import type { Selection } from "./selection";

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
  const lessonSelection = selection.kind === "lesson" ? selection : undefined;
  const level = lessonSelection ? draft.levels[lessonSelection.levelIndex] : undefined;
  const lesson = level?.lessons[lessonSelection?.lessonIndex ?? -1];

  return (
    <div className="rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] overflow-hidden flex flex-col h-full">
      {/* ── Header: what a learner would be looking at ── */}
      <div className="px-3.5 py-2.5 border-b border-gray-100 dark:border-[#27272a] flex items-center gap-2">
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
      </div>

      <div className="flex-1 overflow-y-auto">
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

        {stage === "lesson" && <LessonStage draft={draft} selection={selection} />}
      </div>
    </div>
  );
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
  trackModules: readonly CourseModule[];
  onOpenDraft: () => void;
}) {
  const lessonCount = draft.levels.reduce((sum, l) => sum + l.lessons.length, 0);

  /** Existing modules plus the draft, ordered the way the catalog would. */
  const strip = [
    ...trackModules.map((module) => ({ kind: "existing" as const, module })),
    { kind: "draft" as const },
  ].sort((a, b) => {
    const numA = a.kind === "draft" ? draft.num : a.module.num;
    const numB = b.kind === "draft" ? draft.num : b.module.num;
    return numA - numB;
  });

  return (
    <div className="p-4">
      <h3 className="text-[15px] font-extrabold text-black dark:text-white tracking-tight">
        {trackTitle}
      </h3>
      <p className="mt-0.5 text-[12px] text-gray-500 dark:text-zinc-400">
        Katalogdagi modullar qatori — yangi modulingiz o&apos;z tartib raqamida turadi.
      </p>

      <div
        className="mt-4 flex gap-3 overflow-x-auto scrollbar-none pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {strip.map((entry) =>
          entry.kind === "existing" ? (
            <div
              key={entry.module.id}
              className="shrink-0 w-[132px] rounded-[15px] border border-gray-200 dark:border-zinc-700/60 p-3 flex flex-col opacity-55"
            >
              <span className="font-mono text-[10.5px] font-bold text-gray-300 dark:text-zinc-600">
                {String(entry.module.num).padStart(2, "0")}
              </span>
              <div className="my-2 flex justify-center">
                <Image
                  src={entry.module.imageSrc}
                  alt={entry.module.title}
                  width={52}
                  height={52}
                  className="w-[52px] h-[52px] object-contain"
                />
              </div>
              <p className="text-[11.5px] font-bold text-black dark:text-white text-center leading-snug line-clamp-2 min-h-[30px]">
                {entry.module.title}
              </p>
              <span className="mt-1.5 text-[10px] text-center text-gray-400 dark:text-zinc-500">
                loyihada bor
              </span>
            </div>
          ) : (
            <button
              key="draft"
              type="button"
              onClick={onOpenDraft}
              className="shrink-0 w-[132px] rounded-[15px] border-2 border-[#26B54F] bg-[#26B54F]/[0.06] p-3 flex flex-col text-left hover:bg-[#26B54F]/[0.12] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10.5px] font-bold text-[#26B54F]">
                  {String(draft.num).padStart(2, "0")}
                </span>
                <span className="rounded-full bg-[#26B54F] px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                  yangi
                </span>
              </div>
              <div className="my-2 flex justify-center">
                {draft.imageSrc ? (
                  <Image
                    src={draft.imageSrc}
                    alt={draft.title || "Yangi modul"}
                    width={52}
                    height={52}
                    className="w-[52px] h-[52px] object-contain"
                  />
                ) : (
                  <div className="w-[52px] h-[52px] rounded-[12px] bg-gray-100 dark:bg-[#232327]" />
                )}
              </div>
              <p className="text-[11.5px] font-bold text-black dark:text-white text-center leading-snug line-clamp-2 min-h-[30px]">
                {draft.title || "(nomsiz modul)"}
              </p>
              <span className="mt-1.5 text-[10px] text-center text-gray-500 dark:text-zinc-400">
                {lessonCount} dars · {draft.levels.length} bosqich
              </span>
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={onOpenDraft}
        className="mt-3 w-full rounded-full bg-[#26B54F] py-2.5 text-[13px] font-bold text-white hover:bg-[#1ea94f] transition-colors cursor-pointer"
      >
        Modul yo&apos;lini ochish
      </button>
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
  /** The path a learner walks: the first lesson is open, the rest follow it. */
  let position = 0;

  return (
    <div className="p-4">
      <div className="rounded-[15px] border border-gray-200 dark:border-[#2b2b31] bg-[#F8F9FA] dark:bg-[#101013] p-4">
        <div className="flex items-center gap-3">
          {draft.imageSrc && (
            <Image
              src={draft.imageSrc}
              alt={draft.title || "Modul"}
              width={44}
              height={44}
              className="w-11 h-11 object-contain shrink-0"
            />
          )}
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-black dark:text-white truncate">
              {draft.title || "(nomsiz modul)"}
            </h3>
            <p className="text-[12px] text-gray-500 dark:text-[#8b8b93] line-clamp-2">
              {draft.description || "Tavsif yozilmagan"}
            </p>
          </div>
        </div>
      </div>

      {draft.levels.map((level, li) => (
        <section key={`${level.id}-${li}`} className="mt-5">
          <button
            type="button"
            onClick={() => onOpenLevel(li)}
            className="w-full px-4 py-2.5 rounded-[16px] flex flex-col cursor-pointer transition-colors hover:bg-[#26B54F]/[0.06]"
            style={{
              outline: "2px solid #26B54F",
              outlineOffset: "-2px",
              boxShadow: "inset 0px -5px 0px 0px #26B54F",
            }}
          >
            <span className="text-center text-[10px] font-mono font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Level {li + 1}
            </span>
            <span className="text-center text-[13px] text-black dark:text-white">
              {level.title || "(nomsiz bosqich)"}
            </span>
          </button>

          <div className="mt-4 flex flex-col gap-3">
            {level.lessons.map((lesson, i) => {
              const isFirst = position === 0;
              position += 1;
              const selected =
                selection.kind === "lesson" &&
                selection.levelIndex === li &&
                selection.lessonIndex === i;

              return (
                <button
                  key={`${lesson.id}-${i}`}
                  type="button"
                  onClick={() => onOpenLesson(li, i)}
                  className={`group flex items-center gap-3 rounded-[14px] border-2 px-3 py-2.5 text-left transition-colors cursor-pointer ${
                    selected
                      ? "border-[#26B54F] bg-[#26B54F]/[0.08]"
                      : "border-transparent hover:bg-gray-50 dark:hover:bg-[#1c1c20]"
                  }`}
                >
                  {/* The disc a learner taps on the real path */}
                  <span
                    className={`shrink-0 w-12 h-11 rounded-full flex items-center justify-center transition-transform group-active:translate-y-[3px] ${
                      isFirst
                        ? "bg-[#F0B03C] shadow-[0px_4px_0px_0px_#C0851F]"
                        : "bg-neutral-200 dark:bg-neutral-700 shadow-[0px_4px_0px_0px_rgba(150,150,150,0.6)]"
                    }`}
                  >
                    {isFirst ? (
                      <IconStarFilled size={20} className="text-white" />
                    ) : lesson.kind === "review" ? (
                      <IconBarbell size={19} className="text-neutral-400" />
                    ) : (
                      <IconLockFilled size={17} className="text-neutral-400" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold text-gray-800 dark:text-[#d4d4d8] truncate">
                      {lesson.title || "(nomsiz dars)"}
                    </span>
                    <span className="block text-[11px] text-gray-500 dark:text-[#6d6d74]">
                      {KIND_LABELS[lesson.kind]} · {lesson.xp} XP · {lesson.estMinutes} daq
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <p className="mt-5 text-[11.5px] leading-relaxed text-gray-400 dark:text-zinc-500">
        Yo&apos;lda faqat birinchi dars ochiq turadi — qolganlari o&apos;quvchi
        oldingisini yakunlagach ochiladi.
      </p>
    </div>
  );
}

// ── Stage 3: the lesson itself ──────────────────────────────────────────────

function LessonStage({
  draft,
  selection,
}: {
  draft: DraftModule;
  selection: Selection;
}) {
  const [restartKey, setRestartKey] = React.useState(0);

  if (selection.kind !== "lesson") {
    return (
      <Placeholder text="Chapdagi ro'yxatdan dars tanlang — uning ko'rinishi shu yerda paydo bo'ladi." />
    );
  }

  const level = draft.levels[selection.levelIndex];
  const lesson = level?.lessons[selection.lessonIndex];
  if (!level || !lesson) {
    return <Placeholder text="Bu dars o'chirilgan — boshqasini tanlang." />;
  }

  const hasBody = lesson.content.sections.some(
    (s) => s.heading.trim() || s.body.some((b) => b.trim())
  );
  if (!hasBody) {
    return (
      <Placeholder text="Dars matni hali bo'sh. Maqsad va kamida bitta bo'lim yozilgach, dars shu yerda ishga tushadi." />
    );
  }

  // The same resolution the app uses, so the preview ends in the real game.
  const game =
    getGame(lesson.gameId) ??
    resolveGame({
      kind: lesson.kind,
      lessonTitle: lesson.title,
      levelTitle: level.title,
      moduleTopics: draft.topics,
      seed: lesson.id,
    });

  return (
    <div className="flex flex-col">
      <div className="px-3.5 py-2 border-b border-gray-100 dark:border-[#27272a] flex items-center justify-between gap-2">
        <span className="text-[11.5px] text-gray-500 dark:text-zinc-400 truncate">
          {game ? `Oxirida o'yin: ${game.name}` : "O'yinsiz dars"}
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

      <div className="min-h-[560px]">
        <LessonRunner
          key={`${lesson.id}-${restartKey}`}
          embedded
          lessonId={lesson.id || "preview"}
          lessonTitle={lesson.title || "(nomsiz dars)"}
          levelTitle={`Level ${selection.levelIndex + 1} - ${level.title || ""}`}
          content={lesson.content}
          game={game}
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
