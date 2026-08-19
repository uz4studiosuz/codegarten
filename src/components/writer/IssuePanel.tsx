"use client";

import React from "react";
import { IconAlertTriangle, IconCircleCheck, IconChevronRight } from "@tabler/icons-react";
import type { DraftIssue, IssueTarget } from "@/lib/writerDraft";
import type { Selection } from "./selection";

/**
 * Validation results as a to-do list. Every row is clickable: it selects the
 * node the problem belongs to, which is what turns "3 xato" from a warning into
 * a fix. Finding the broken lesson by hand was the writer's worst chore.
 */

function selectionFor(target: IssueTarget): Selection {
  if (target.kind === "lesson") {
    return {
      kind: "lesson",
      levelIndex: target.levelIndex,
      lessonIndex: target.lessonIndex,
    };
  }
  if (target.kind === "level") return { kind: "level", levelIndex: target.levelIndex };
  return { kind: "module" };
}

export function IssuePanel({
  issues,
  onSelect,
}: {
  issues: DraftIssue[];
  onSelect: (selection: Selection) => void;
}) {
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  if (issues.length === 0) {
    return (
      <div className="rounded-[15px] border-2 border-[#26B54F]/40 bg-[#26B54F]/[0.06] p-4 flex items-start gap-2.5">
        <IconCircleCheck size={17} className="shrink-0 mt-0.5 text-[#26B54F]" />
        <p className="text-[13px] leading-relaxed text-gray-700 dark:text-zinc-300">
          Hammasi joyida — modul eksportga tayyor.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-[#27272a] flex items-center gap-2">
        <span className="text-sm font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
          Tekshiruv
        </span>
        {errors.length > 0 && (
          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-600 dark:text-red-400">
            {errors.length} xato
          </span>
        )}
        {warnings.length > 0 && (
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
            {warnings.length} ogohlantirish
          </span>
        )}
      </div>

      <ul className="max-h-[280px] overflow-y-auto divide-y divide-gray-100 dark:divide-[#1f1f23]">
        {[...errors, ...warnings].map((issue, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onSelect(selectionFor(issue.target))}
              className="w-full flex items-start gap-2.5 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-[#1c1c20] transition-colors cursor-pointer group"
            >
              <IconAlertTriangle
                size={14}
                className={`shrink-0 mt-0.5 ${
                  issue.level === "error" ? "text-red-500" : "text-amber-500"
                }`}
              />
              <span className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-gray-700 dark:text-zinc-300">
                {issue.message}
              </span>
              <IconChevronRight
                size={14}
                className="shrink-0 mt-0.5 text-gray-300 dark:text-zinc-600 group-hover:text-[#26B54F] transition-colors"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
