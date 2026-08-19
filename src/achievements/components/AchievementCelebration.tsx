"use client";

import React, { useEffect } from "react";
import { IconTrophy, IconX } from "@tabler/icons-react";
import type { Achievement } from "../types";
import { GROUP_LABELS } from "../types";

/**
 * The congratulation dialog. Deliberately one badge at a time: a queue of two
 * earned at once reads as two small wins rather than one confusing pile.
 */
export function AchievementCelebration({
  achievement,
  remaining,
  earnedCount,
  total,
  onClose,
}: {
  achievement: Achievement | undefined;
  /** How many more are waiting behind this one. */
  remaining: number;
  earnedCount: number;
  total: number;
  onClose: () => void;
}) {
  // Confetti is loaded on demand: nobody pays for it until a badge is earned.
  useEffect(() => {
    if (!achievement) return;
    let cancelled = false;

    import("canvas-confetti")
      .then(({ default: confetti }) => {
        if (cancelled) return;
        confetti({
          particleCount: 90,
          spread: 70,
          startVelocity: 38,
          origin: { y: 0.35 },
          colors: ["#26B54F", "#4ADE80", "#E0A13C", "#7C5CE0"],
          disableForReducedMotion: true,
        });
      })
      .catch(() => {
        // Confetti is decoration; the dialog is the actual reward.
      });

    return () => {
      cancelled = true;
    };
  }, [achievement]);

  // Escape closes, like every other dialog in the app.
  useEffect(() => {
    if (!achievement) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5 font-sans">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievement-title"
        className="relative z-10 w-full max-w-[420px] rounded-[24px] border border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#16161a] p-7 shadow-2xl animate-scaleIn text-center"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Yopish"
          className="absolute right-4 top-4 text-gray-400 dark:text-[#6d6d74] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
        >
          <IconX size={18} />
        </button>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          <IconTrophy size={13} />
          Yangi yutuq
        </div>

        {/* The badge itself, on a soft halo */}
        <div className="relative mx-auto mt-5 w-24 h-24 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-[#26B54F]/15 blur-xl" />
          <span className="relative w-20 h-20 rounded-[22px] border-2 border-[#26B54F]/40 bg-[#26B54F]/10 flex items-center justify-center text-[38px] leading-none">
            {achievement.icon}
          </span>
        </div>

        <h2
          id="achievement-title"
          className="mt-5 text-[22px] font-extrabold tracking-tight text-black dark:text-white"
        >
          {achievement.name}
        </h2>
        <div className="mt-1 text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-[#6d6d74]">
          {GROUP_LABELS[achievement.group]}
        </div>

        <p className="mt-3 text-[15px] leading-relaxed text-gray-600 dark:text-[#a1a1aa]">
          {achievement.celebration}
        </p>

        <div className="mt-5 flex items-center justify-center gap-2 text-[13px] font-semibold text-gray-500 dark:text-[#8b8b93]">
          <span className="font-mono text-[#26B54F] dark:text-[#4ADE80]">
            {earnedCount}/{total}
          </span>
          yutuq ochildi
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-[#26B54F] py-3.5 text-[16px] font-bold text-white hover:bg-[#1ea94f] transition-colors cursor-pointer"
        >
          {remaining > 0 ? `Keyingisi (${remaining})` : "Davom etish"}
        </button>
      </div>
    </div>
  );
}
