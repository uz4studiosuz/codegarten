"use client";

import React from "react";
import { IconLock } from "@tabler/icons-react";
import { useAchievements } from "../context";

/**
 * The dashboard's achievements panel. A locked badge is a hint, not a blank —
 * the nearest one is spelled out with its progress so the learner always knows
 * what the next small win is.
 */
export function AchievementsCard() {
  const { states, earned, total, next } = useAchievements();

  return (
    <div className="rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          YUTUQLARINGIZ
        </span>
        <span className="text-xs sm:text-sm font-bold text-gray-400 dark:text-zinc-400">
          {earned.length} / {total}
        </span>
      </div>

      {earned.length > 0 ? (
        <div className="grid grid-cols-3 gap-2.5">
          {states
            .filter((state) => state.earned)
            .map((state) => (
              <div
                key={state.achievement.id}
                title={`${state.achievement.name} — ${state.achievement.description}`}
                className="aspect-square rounded-[12px] flex items-center justify-center text-[24px] transition-all bg-[#26B54F]/15 border-2 border-[#26B54F]/40 hover:scale-105"
              >
                {state.achievement.icon}
              </div>
            ))}
        </div>
      ) : (
        <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 leading-relaxed py-1">
          Hali yutuqlaringiz yo&apos;q. Darslarni yakunlab, birinchi yutug&apos;ingizni oching!
        </p>
      )}

      {next && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[12px] font-semibold text-gray-600 dark:text-zinc-300 min-w-0 truncate">
              Keyingi: {next.achievement.name}
            </span>
            <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500 shrink-0">
              {next.value}/{next.goal} {next.achievement.unit}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#26B54F] transition-[width] duration-500"
              style={{ width: `${next.percent}%` }}
            />
          </div>
          <p className="mt-2 text-[11.5px] text-gray-500 dark:text-zinc-400 leading-relaxed">
            {next.achievement.description}
          </p>
        </div>
      )}

      {!next && (
        <p className="mt-4 text-[12px] font-semibold text-[#26B54F] dark:text-[#4ADE80]">
          Barcha yutuqlar ochildi — zo&apos;r natija!
        </p>
      )}
    </div>
  );
}
