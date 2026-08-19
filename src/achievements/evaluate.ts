import { ACHIEVEMENTS } from "./catalog";
import type { Achievement, AchievementState, ProgressSnapshot } from "./types";

/**
 * Pure evaluation: a snapshot in, the standing of every achievement out. No
 * storage, no React — which makes the rules trivially testable and means the
 * same function can run on the server if achievements ever move there.
 */
export function evaluate(snapshot: ProgressSnapshot): AchievementState[] {
  return ACHIEVEMENTS.map((achievement) => {
    const value = achievement.metric(snapshot);
    const percent = Math.max(
      0,
      Math.min(100, Math.round((value / achievement.goal) * 100))
    );
    return {
      achievement,
      value,
      goal: achievement.goal,
      percent,
      earned: value >= achievement.goal,
    };
  });
}

export function earnedIds(states: AchievementState[]): string[] {
  return states.filter((s) => s.earned).map((s) => s.achievement.id);
}

/**
 * Which achievements crossed the line since the last check. Anything already in
 * `celebrated` is skipped, so re-earning a streak badge does not re-congratulate.
 */
export function newlyEarned(
  states: AchievementState[],
  celebrated: readonly string[]
): Achievement[] {
  const already = new Set(celebrated);
  return states
    .filter((s) => s.earned && !already.has(s.achievement.id))
    .map((s) => s.achievement);
}

/**
 * The nearest unearned achievement — what the dashboard nudges toward. Ties go
 * to the one needing the fewest remaining units, so the hint is actionable.
 */
export function nextUp(states: AchievementState[]): AchievementState | undefined {
  return states
    .filter((s) => !s.earned)
    .sort((a, b) => b.percent - a.percent || (a.goal - a.value) - (b.goal - b.value))[0];
}
