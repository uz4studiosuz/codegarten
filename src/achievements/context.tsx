"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useProgress } from "@/context/ProgressContext";
import { useVocabulary } from "@/context/VocabularyContext";
import { ACHIEVEMENTS } from "./catalog";
import { earnedIds, evaluate, newlyEarned, nextUp } from "./evaluate";
import { clearAchievements, loadAchievements, saveAchievements } from "./storage";
import type { Achievement, AchievementState, ProgressSnapshot } from "./types";
import { AchievementCelebration } from "./components/AchievementCelebration";

/**
 * Achievements provider
 * ---------------------
 * Watches the progress snapshot, evaluates the catalog and queues anything that
 * just crossed the line. The celebration dialog is mounted here rather than per
 * page, so a badge earned at the end of a lesson is congratulated wherever the
 * learner happens to be.
 *
 * Two rules keep it from being annoying:
 *  - the first evaluation after install adopts existing progress silently, so
 *    nobody gets six dialogs at once;
 *  - an achievement is celebrated exactly once, tracked in localStorage.
 */

interface AchievementsContextValue {
  /** Every achievement with the learner's current standing. */
  states: AchievementState[];
  earned: AchievementState[];
  total: number;
  /** Nearest unearned achievement — the dashboard's "next up" hint. */
  next: AchievementState | undefined;
  /** The one being celebrated right now, if any. */
  celebrating: Achievement | undefined;
  /** How many more are waiting behind it. */
  queueLength: number;
  dismissCelebration: () => void;
  /** Called from settings alongside resetProgress. */
  resetAchievements: () => void;
}

const AchievementsContext = createContext<AchievementsContextValue | undefined>(
  undefined
);

export const AchievementsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { stats, hydrated: progressHydrated } = useProgress();
  const { count: savedTerms, hydrated: vocabHydrated } = useVocabulary();

  const [celebrated, setCelebrated] = useState<Record<string, string>>({});
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [storageRead, setStorageRead] = useState(false);

  /**
   * Ids already celebrated or already queued. Kept in a ref because the effect
   * below must not re-queue the same badge when progress changes again before
   * the learner closes the dialog.
   */
  const handledRef = useRef<Set<string>>(new Set());
  const seededRef = useRef(false);

  useEffect(() => {
    const stored = loadAchievements();
    setCelebrated(stored.celebrated);
    seededRef.current = stored.seeded;
    Object.keys(stored.celebrated).forEach((id) => handledRef.current.add(id));
    setStorageRead(true);
  }, []);

  const snapshot = useMemo<ProgressSnapshot>(
    () => ({
      completedLessons: stats.completedLessons,
      xp: stats.xp,
      streak: stats.streak,
      activeDays: stats.activeDays,
      completedLevels: stats.completedLevels,
      completedModules: stats.completedModules,
      trackPercent: stats.trackPercent,
      savedTerms,
    }),
    [stats, savedTerms]
  );

  const states = useMemo(() => evaluate(snapshot), [snapshot]);

  const persist = useCallback((nextCelebrated: Record<string, string>) => {
    setCelebrated(nextCelebrated);
    saveAchievements({ celebrated: nextCelebrated, seeded: true });
  }, []);

  // Detect crossings. Gated on both stores being read so the empty baseline
  // never looks like "nothing earned yet" for a returning learner.
  useEffect(() => {
    if (!storageRead || !progressHydrated || !vocabHydrated) return;

    if (!seededRef.current) {
      seededRef.current = true;
      const adopted: Record<string, string> = { ...celebrated };
      const now = new Date().toISOString();
      for (const id of earnedIds(states)) {
        if (!adopted[id]) adopted[id] = now;
        handledRef.current.add(id);
      }
      persist(adopted);
      return;
    }

    const fresh = newlyEarned(states, Array.from(handledRef.current));
    if (fresh.length === 0) return;

    fresh.forEach((achievement) => handledRef.current.add(achievement.id));
    setQueue((prev) => [...prev, ...fresh]);
  }, [states, storageRead, progressHydrated, vocabHydrated, celebrated, persist]);

  const dismissCelebration = useCallback(() => {
    setQueue((prev) => {
      const [shown, ...rest] = prev;
      if (shown) {
        // Recorded on dismissal: a dialog the learner never saw stays pending.
        persist({ ...celebrated, [shown.id]: new Date().toISOString() });
      }
      return rest;
    });
  }, [celebrated, persist]);

  const resetAchievements = useCallback(() => {
    clearAchievements();
    handledRef.current = new Set();
    seededRef.current = false;
    setCelebrated({});
    setQueue([]);
  }, []);

  const value = useMemo<AchievementsContextValue>(
    () => ({
      states,
      earned: states.filter((s) => s.earned),
      total: ACHIEVEMENTS.length,
      next: nextUp(states),
      celebrating: queue[0],
      queueLength: queue.length,
      dismissCelebration,
      resetAchievements,
    }),
    [states, queue, dismissCelebration, resetAchievements]
  );

  return (
    <AchievementsContext.Provider value={value}>
      {children}
      <AchievementCelebration
        achievement={value.celebrating}
        remaining={Math.max(0, value.queueLength - 1)}
        earnedCount={value.earned.length}
        total={value.total}
        onClose={dismissCelebration}
      />
    </AchievementsContext.Provider>
  );
};

export const useAchievements = (): AchievementsContextValue => {
  const ctx = useContext(AchievementsContext);
  if (!ctx) {
    throw new Error("useAchievements must be used within an AchievementsProvider");
  }
  return ctx;
};
