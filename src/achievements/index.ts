/**
 * Public surface of the achievements module. Everything else in this folder is
 * an implementation detail — import from here.
 */
export { AchievementsProvider, useAchievements } from "./context";
export { AchievementsCard } from "./components/AchievementsCard";
export { ACHIEVEMENTS, ACHIEVEMENT_COUNT, findAchievement } from "./catalog";
export { evaluate, earnedIds, newlyEarned, nextUp } from "./evaluate";
export { GROUP_LABELS } from "./types";
export type {
  Achievement,
  AchievementGroup,
  AchievementState,
  ProgressSnapshot,
} from "./types";
