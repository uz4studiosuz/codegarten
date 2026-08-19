/**
 * Achievements — the contract
 * ---------------------------
 * Achievements are derived, never stored as truth: the catalog is a set of pure
 * rules over a snapshot of progress, so a rule can be added, renamed or
 * rebalanced without a migration. The only thing persisted is which ones have
 * already been celebrated, so a learner is congratulated exactly once.
 *
 * Layers, and what may import what:
 *
 *   types.ts       shapes only
 *   catalog.ts     the rules (pure data + pure functions)
 *   evaluate.ts    snapshot + catalog -> state (pure)
 *   storage.ts     the celebrated set in localStorage
 *   context.tsx    wires progress -> evaluate -> celebration queue
 *   components/    presentation only
 */

export type AchievementGroup = "boshlash" | "izchillik" | "mahorat" | "chuqurlik";

export const GROUP_LABELS: Record<AchievementGroup, string> = {
  boshlash: "Boshlash",
  izchillik: "Izchillik",
  mahorat: "Mahorat",
  chuqurlik: "Chuqurlik",
};

/**
 * Everything the rules are allowed to look at. Adding a field here is the only
 * way to make a new kind of achievement possible.
 */
export interface ProgressSnapshot {
  completedLessons: number;
  xp: number;
  /** Current unbroken streak in days. */
  streak: number;
  /** Distinct days with at least one finished lesson. */
  activeDays: number;
  completedLevels: number;
  completedModules: number;
  /** Percent of the main track finished. */
  trackPercent: number;
  /** Terms saved into the learner's Lug'at. */
  savedTerms: number;
}

export interface Achievement {
  id: string;
  name: string;
  /** What the learner has to do — shown while it is still locked. */
  description: string;
  icon: string;
  group: AchievementGroup;
  /** How far along the learner is, in the same unit as `goal`. */
  metric: (snapshot: ProgressSnapshot) => number;
  goal: number;
  /** Unit shown next to the progress numbers ("dars", "kun", "XP"). */
  unit: string;
  /** The congratulation line — says why this milestone matters. */
  celebration: string;
}

/** An achievement plus where the learner stands on it right now. */
export interface AchievementState {
  achievement: Achievement;
  value: number;
  goal: number;
  /** 0-100, clamped. */
  percent: number;
  earned: boolean;
}
