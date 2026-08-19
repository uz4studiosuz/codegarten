"use client";

import React from "react";
import { IconBulb, IconCircleCheckFilled, IconAlertTriangle } from "@tabler/icons-react";
import type { GameStatus } from "../types";

/**
 * Shared game chrome
 * ------------------
 * Every game states one task, shows one board and gives one verdict. Keeping
 * that frame here means the games look like one product rather than six
 * separate toys, and a new game only has to draw its playfield.
 */

export function GameShell({
  task,
  hint,
  status,
  successText,
  failText,
  children,
  footer,
}: {
  /** The single sentence telling the learner what to do. */
  task: string;
  hint?: string;
  status: GameStatus;
  successText: string;
  /** Shown after a wrong attempt — say what went wrong, not just "wrong". */
  failText: string;
  children: React.ReactNode;
  /** Optional controls under the board (reset, counters). */
  footer?: React.ReactNode;
}) {
  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-center text-[20px] sm:text-[24px] font-semibold leading-snug text-gray-900 dark:text-white">
        {task}
      </h2>
      {hint && (
        <p className="mt-2 text-center text-[14px] leading-relaxed text-gray-500 dark:text-[#8b8b93] max-w-[440px]">
          {hint}
        </p>
      )}

      <div className="mt-7 w-full max-w-[480px]">{children}</div>

      {footer && <div className="mt-3 w-full max-w-[480px]">{footer}</div>}

      {status !== "idle" && (
        <div
          className={`mt-6 w-full max-w-[480px] flex items-start gap-3 rounded-[16px] border px-4 py-3.5 ${
            status === "success"
              ? "border-[#26B54F]/30 bg-[#26B54F]/[0.08]"
              : "border-amber-500/30 bg-amber-500/[0.08]"
          }`}
        >
          {status === "success" ? (
            <IconCircleCheckFilled size={19} className="shrink-0 mt-0.5 text-[#26B54F]" />
          ) : (
            <IconAlertTriangle size={19} className="shrink-0 mt-0.5 text-amber-500" />
          )}
          <p
            className={`text-[15px] leading-relaxed font-medium ${
              status === "success"
                ? "text-green-900 dark:text-[#d4f7dd]"
                : "text-amber-800 dark:text-amber-200"
            }`}
          >
            {status === "success" ? successText : failText}
          </p>
        </div>
      )}
    </div>
  );
}

/** The bordered playfield the board is drawn on. */
export function GameBoard({
  children,
  label,
  className = "",
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div className="rounded-[20px] border border-gray-200 dark:border-[#26262a] bg-gray-50 dark:bg-[#141416] overflow-hidden">
      {label && (
        <div className="px-4 py-2.5 border-b border-gray-200 dark:border-[#26262a] text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-[#6d6d74]">
          {label}
        </div>
      )}
      <div className={`p-4 sm:p-5 ${className}`}>{children}</div>
    </div>
  );
}

/** A read-only line of program text, used by most games as the "code" side. */
export function CodeLine({
  children,
  tone = "plain",
  index,
}: {
  children: React.ReactNode;
  tone?: "plain" | "picked" | "correct" | "wrong" | "muted";
  index?: number;
}) {
  const tones: Record<string, string> = {
    plain:
      "border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] text-gray-800 dark:text-[#d4d4d8]",
    picked: "border-[#A78BFA] bg-[#A78BFA]/10 text-[#7C5CE0] dark:text-[#c4b5fd]",
    correct: "border-[#26B54F] bg-[#26B54F]/10 text-[#177F37] dark:text-[#4ADE80]",
    wrong: "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    muted:
      "border-gray-200 dark:border-[#232327] bg-gray-100/60 dark:bg-[#17171a] text-gray-400 dark:text-[#6d6d74]",
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-[12px] border-2 px-3.5 py-2.5 transition-colors ${tones[tone]}`}
    >
      {index !== undefined && (
        <span className="w-4 shrink-0 text-right font-mono text-[12px] opacity-60">
          {index}
        </span>
      )}
      <span className="font-mono text-[13.5px] sm:text-[14px] min-w-0 flex-1">{children}</span>
    </div>
  );
}

/** Small tactile pill used for choices, palettes and steppers. */
export function GameChip({
  children,
  onClick,
  selected = false,
  disabled = false,
  tone = "neutral",
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  tone?: "neutral" | "green" | "violet" | "amber";
  title?: string;
}) {
  const tones: Record<string, string> = {
    neutral: selected
      ? "border-[#26B54F] bg-[#26B54F]/15 text-[#177F37] dark:text-[#4ADE80]"
      : "border-gray-200 dark:border-[#2b2b31] hover:border-gray-300 dark:hover:border-[#3d3d45] text-gray-700 dark:text-[#c9c9d0]",
    green: "border-transparent bg-[#26B54F] text-white shadow-[0_3px_0_0_#177F37]",
    violet: "border-transparent bg-[#7C5CE0] text-white shadow-[0_3px_0_0_#563DA6]",
    amber: "border-transparent bg-[#E0A13C] text-white shadow-[0_3px_0_0_#A87526]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`select-none rounded-[12px] border-2 px-3.5 py-2.5 font-mono text-[13.5px] font-bold transition-all active:translate-y-[2px] active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed ${
        onClick && !disabled ? "cursor-pointer" : "cursor-default"
      } ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

/** A "why" note the game shows next to its board, for the teaching moment. */
export function GameNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[14px] border border-[#A78BFA]/30 bg-[#A78BFA]/[0.07] px-3.5 py-3">
      <IconBulb size={17} className="shrink-0 mt-0.5 text-[#A78BFA]" />
      <p className="text-[13.5px] leading-relaxed text-gray-700 dark:text-[#c9c9d0]">
        {children}
      </p>
    </div>
  );
}

/** Reset link shown under a board, identical in every game. */
export function GameReset({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="font-mono text-[13px] text-gray-400 dark:text-[#6f6f77] hover:text-gray-600 dark:hover:text-[#a1a1aa] disabled:opacity-40 transition-colors cursor-pointer"
    >
      Boshidan
    </button>
  );
}

/**
 * Numbered how-to, shown above a board that needs more than one kind of move.
 * Children trying the games could see the pieces but not what was expected of
 * them; two short imperative lines fixed that better than any longer hint.
 */
export function GameHowTo({ steps }: { steps: string[] }) {
  return (
    <ol className="flex flex-col gap-1.5">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-[1px] shrink-0 w-[19px] h-[19px] rounded-full bg-[#7C5CE0]/15 text-[#7C5CE0] dark:text-[#c4b5fd] text-[11px] font-bold flex items-center justify-center">
            {i + 1}
          </span>
          <span className="text-[13px] leading-snug text-gray-600 dark:text-[#a1a1aa]">
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}

/**
 * A slot a block can be dropped into. `index` becomes the `data-drop-index` the
 * drag hook looks for, so slots stay declarative.
 */
export function DropSlot({
  index,
  active,
  filled,
  tone = "violet",
  className = "",
  children,
}: {
  index: number;
  /** The pointer is over this slot right now. */
  active?: boolean;
  /** Something already sits here, so the dashed outline is dropped. */
  filled?: boolean;
  tone?: "violet" | "green";
  className?: string;
  children?: React.ReactNode;
}) {
  const accent = tone === "green" ? "#26B54F" : "#7C5CE0";

  return (
    <div
      data-drop-index={index}
      style={active ? { borderColor: accent, backgroundColor: `${accent}14` } : undefined}
      className={`min-h-[44px] rounded-[12px] flex items-center transition-colors ${
        filled
          ? "border-2 border-transparent"
          : `border-2 border-dashed ${
              active ? "" : "border-gray-300 dark:border-[#3a3a41]"
            }`
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** The block that follows the pointer while dragging. */
export function DragGhost({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-90 scale-105"
      style={{ left: x, top: y }}
    >
      {children}
    </div>
  );
}

/** Marks a block as pick-up-able, so the affordance is identical everywhere. */
export const grabClass =
  "cursor-grab active:cursor-grabbing select-none touch-none";
