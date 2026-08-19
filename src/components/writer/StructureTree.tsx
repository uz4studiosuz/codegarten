"use client";

import React from "react";
import {
  IconChevronUp,
  IconChevronDown,
  IconPlus,
  IconTrash,
  IconStack2,
} from "@tabler/icons-react";
import {
  DraftIssue,
  DraftModule,
  KIND_LABELS,
  issuesFor,
} from "@/lib/writerDraft";
import type { Selection } from "./selection";

/**
 * The module outline, and the only navigation in the writer. Everything the
 * author edits is reached from here, and every node carries a dot when
 * validation has something to say about it — so finding what is broken is
 * looking, not scrolling.
 */

function Dot({ issues }: { issues: DraftIssue[] }) {
  if (issues.length === 0) return null;
  const hasError = issues.some((i) => i.level === "error");
  return (
    <span
      title={issues.map((i) => i.message).join("\n")}
      className={`shrink-0 w-2 h-2 rounded-full ${hasError ? "bg-red-500" : "bg-amber-500"}`}
    />
  );
}

function IconAction({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="shrink-0 p-1 rounded-md text-gray-300 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-[#232327] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}

export function StructureTree({
  draft,
  issues,
  selection,
  onSelect,
  onAddLevel,
  onRemoveLevel,
  onMoveLevel,
  onAddLesson,
  onRemoveLesson,
  onMoveLesson,
}: {
  draft: DraftModule;
  issues: DraftIssue[];
  selection: Selection;
  onSelect: (selection: Selection) => void;
  onAddLevel: () => void;
  onRemoveLevel: (levelIndex: number) => void;
  onMoveLevel: (levelIndex: number, direction: -1 | 1) => void;
  onAddLesson: (levelIndex: number) => void;
  onRemoveLesson: (levelIndex: number, lessonIndex: number) => void;
  onMoveLesson: (levelIndex: number, lessonIndex: number, direction: -1 | 1) => void;
}) {
  const moduleSelected = selection.kind === "module";

  return (
    <div className="flex flex-col gap-2">
      {/* ── Module ── */}
      <button
        type="button"
        onClick={() => onSelect({ kind: "module" })}
        className={`flex items-center gap-2 rounded-[12px] border-2 px-3 py-2.5 text-left transition-colors cursor-pointer ${
          moduleSelected
            ? "border-[#26B54F] bg-[#26B54F]/[0.08]"
            : "border-gray-200 dark:border-[#27272a] hover:border-gray-300 dark:hover:border-zinc-700"
        }`}
      >
        <IconStack2 size={16} className="shrink-0 text-[#26B54F]" />
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold text-black dark:text-white truncate">
            {draft.title || "(nomsiz modul)"}
          </span>
          <span className="block font-mono text-[10.5px] text-gray-400 dark:text-zinc-500 truncate">
            {draft.id}
          </span>
        </span>
        <Dot issues={issuesFor(issues, { kind: "module" })} />
      </button>

      {/* ── Levels & lessons ── */}
      {draft.levels.map((level, li) => {
        const levelSelected = selection.kind === "level" && selection.levelIndex === li;

        return (
          <div key={`${level.id}-${li}`} className="flex flex-col gap-1">
            <div
              onClick={() => onSelect({ kind: "level", levelIndex: li })}
              className={`group flex items-center gap-1.5 rounded-[10px] border-2 px-2.5 py-2 transition-colors cursor-pointer ${
                levelSelected
                  ? "border-[#26B54F] bg-[#26B54F]/[0.08]"
                  : "border-transparent hover:bg-gray-50 dark:hover:bg-[#1c1c20]"
              }`}
            >
              <span className="shrink-0 font-mono text-[10.5px] font-bold text-gray-400 dark:text-zinc-500">
                L{li + 1}
              </span>
              <span className="min-w-0 flex-1 text-[12.5px] font-bold text-gray-800 dark:text-zinc-200 truncate">
                {level.title || "(nomsiz bosqich)"}
              </span>
              <Dot issues={issuesFor(issues, { kind: "level", levelIndex: li })} />

              <span className="flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <IconAction
                  label="Yuqoriga"
                  onClick={() => onMoveLevel(li, -1)}
                  disabled={li === 0}
                >
                  <IconChevronUp size={13} />
                </IconAction>
                <IconAction
                  label="Pastga"
                  onClick={() => onMoveLevel(li, 1)}
                  disabled={li === draft.levels.length - 1}
                >
                  <IconChevronDown size={13} />
                </IconAction>
                <IconAction label="Dars qo'shish" onClick={() => onAddLesson(li)}>
                  <IconPlus size={13} />
                </IconAction>
                <IconAction
                  label="Bosqichni o'chirish"
                  onClick={() => onRemoveLevel(li)}
                  disabled={draft.levels.length <= 1}
                >
                  <IconTrash size={13} />
                </IconAction>
              </span>
            </div>

            <div className="flex flex-col gap-0.5 pl-3 ml-1 border-l-2 border-gray-100 dark:border-[#232327]">
              {level.lessons.map((lesson, i) => {
                const selected =
                  selection.kind === "lesson" &&
                  selection.levelIndex === li &&
                  selection.lessonIndex === i;

                return (
                  <div
                    key={`${lesson.id}-${i}`}
                    onClick={() =>
                      onSelect({ kind: "lesson", levelIndex: li, lessonIndex: i })
                    }
                    className={`group flex items-center gap-1.5 rounded-[9px] border-2 px-2.5 py-1.5 transition-colors cursor-pointer ${
                      selected
                        ? "border-[#26B54F] bg-[#26B54F]/[0.08]"
                        : "border-transparent hover:bg-gray-50 dark:hover:bg-[#1c1c20]"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-[12.5px] truncate ${
                          selected
                            ? "font-bold text-[#1a8a3c] dark:text-[#4ADE80]"
                            : "text-gray-700 dark:text-zinc-300"
                        }`}
                      >
                        {lesson.title || "(nomsiz dars)"}
                      </span>
                      <span className="block text-[10.5px] text-gray-400 dark:text-zinc-500 truncate">
                        {KIND_LABELS[lesson.kind]} · {lesson.xp} XP
                      </span>
                    </span>

                    <Dot
                      issues={issuesFor(issues, {
                        kind: "lesson",
                        levelIndex: li,
                        lessonIndex: i,
                      })}
                    />

                    <span className="flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <IconAction
                        label="Yuqoriga"
                        onClick={() => onMoveLesson(li, i, -1)}
                        disabled={i === 0}
                      >
                        <IconChevronUp size={13} />
                      </IconAction>
                      <IconAction
                        label="Pastga"
                        onClick={() => onMoveLesson(li, i, 1)}
                        disabled={i === level.lessons.length - 1}
                      >
                        <IconChevronDown size={13} />
                      </IconAction>
                      <IconAction
                        label="Darsni o'chirish"
                        onClick={() => onRemoveLesson(li, i)}
                        disabled={level.lessons.length <= 1}
                      >
                        <IconTrash size={13} />
                      </IconAction>
                    </span>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => onAddLesson(li)}
                className="self-start inline-flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-bold text-[#26B54F] hover:underline cursor-pointer"
              >
                <IconPlus size={12} /> Dars
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={onAddLevel}
        className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-[10px] border-2 border-dashed border-gray-200 dark:border-[#27272a] py-2 text-[12.5px] font-bold text-gray-500 dark:text-zinc-400 hover:border-[#26B54F] hover:text-[#26B54F] transition-colors cursor-pointer"
      >
        <IconPlus size={14} /> Bosqich qo&apos;shish
      </button>
    </div>
  );
}
