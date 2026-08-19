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
import {
  CourseModule,
  LessonLocation,
  allTracks,
  findLesson,
  foundationsTrack,
  getModule,
  moduleLessons,
} from "@/data/curriculum";

const STORAGE_KEY = "codegarten_progress_v1";
const RECENT_LIMIT = 8;

interface RecentEntry {
  moduleId: string;
  lessonId: string;
  /** ISO timestamp of the last visit. */
  at: string;
}

interface RecentModuleEntry {
  moduleId: string;
  /** Lesson the learner was on when they last left the module. */
  lessonId: string;
  at: string;
}

interface ProgressData {
  /** lessonId → ISO timestamp it was first completed. */
  completed: Record<string, string>;
  xp: number;
  /** Consecutive active days as of `lastCompletedDay`. */
  streak: number;
  lastCompletedDay: string | null;
  /** Every day (YYYY-MM-DD) the learner finished at least one lesson. */
  activeDays: string[];
  recent: RecentEntry[];
  /**
   * Modules in visit order, newest first. Resuming happens at module level —
   * a learner thinks "I was doing Loops", not "I was on lesson m2-l2-3".
   */
  recentModules: RecentModuleEntry[];
}

const EMPTY: ProgressData = {
  completed: {},
  xp: 0,
  streak: 0,
  lastCompletedDay: null,
  activeDays: [],
  recent: [],
  recentModules: [],
};

/**
 * Saves written before module-level resume have no `recentModules`. Rather than
 * showing an empty "continue" list to a learner mid-course, the module history
 * is rebuilt from the lesson history, newest first.
 */
function migrate(data: ProgressData): ProgressData {
  if (data.recentModules.length > 0 || data.recent.length === 0) return data;

  const seen = new Set<string>();
  const recentModules: RecentModuleEntry[] = [];
  for (const entry of data.recent) {
    if (seen.has(entry.moduleId)) continue;
    seen.add(entry.moduleId);
    recentModules.push({ moduleId: entry.moduleId, lessonId: entry.lessonId, at: entry.at });
  }
  return { ...data, recentModules };
}

// ── Date helpers (local time, day granularity) ──────────────────────────────

function dayKey(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function addDays(d: Date, delta: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + delta);
  return copy;
}

/** Monday-first weekday labels, matching the dashboard strip. */
const UZ_DAY_LABELS = ["D", "S", "Ch", "P", "J", "Sh", "Ya"];

export interface DayActivity {
  dayName: string;
  dayKey: string;
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
}

/** A module the learner has already opened, resolved and ready to render. */
export interface ModuleVisit {
  module: CourseModule;
  progress: ModuleProgress;
  /** Where "Davom ettirish" lands: first unfinished lesson of the module. */
  nextLesson: LessonLocation | undefined;
  /** The lesson they were last on, for the "you left off here" line. */
  lastLesson: LessonLocation | undefined;
  at: string;
}

/** Flat counters, the input every achievement rule reads. */
export interface ProgressStats {
  completedLessons: number;
  xp: number;
  streak: number;
  activeDays: number;
  completedModules: number;
  completedLevels: number;
  trackPercent: number;
}

export interface ModuleProgress {
  completed: number;
  total: number;
  percent: number;
  isStarted: boolean;
  isFinished: boolean;
}

interface ProgressContextValue {
  /** False until localStorage has been read, so the UI can avoid flashing stale zeroes. */
  hydrated: boolean;
  xp: number;
  /** Zero once the chain is broken (nothing finished today or yesterday). */
  streak: number;
  weeklyActivity: DayActivity[];
  completedCount: number;

  isCompleted: (lessonId: string) => boolean;
  isUnlocked: (moduleId: string, lessonId: string) => boolean;
  completeLesson: (moduleId: string, lessonId: string) => number;
  visitLesson: (moduleId: string, lessonId: string) => void;

  moduleProgress: (moduleId: string) => ModuleProgress;
  levelProgress: (moduleId: string, levelId: string) => ModuleProgress;
  trackPercent: number;

  /** First unfinished lesson of a module — where "Continue" should land. */
  nextLessonIn: (moduleId: string) => LessonLocation | undefined;
  /** Most recently opened lessons, newest first, already resolved. */
  recentLessons: LessonLocation[];
  /** Most recently opened modules, newest first — what the dashboard resumes. */
  recentModules: ModuleVisit[];
  /** Counters used by the achievements engine. */
  stats: ProgressStats;
  /** True when the learner has never opened or finished anything. */
  isFreshStart: boolean;
  /** What to nudge a brand-new learner toward. */
  recommendedLesson: LessonLocation | undefined;

  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<ProgressData>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  /**
   * Child effects run before parent effects, so a consumer can try to write
   * before this provider has read storage. Writing then would persist the
   * EMPTY baseline over real progress, so every write is gated on this ref.
   */
  const hydratedRef = useRef(false);

  // Load once on mount — the server renders the empty state.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ProgressData>;
        setData(migrate({ ...EMPTY, ...parsed }));
      }
    } catch {
      // Corrupt or unavailable storage — start clean rather than crash.
    }
    hydratedRef.current = true;
    setHydrated(true);
  }, []);

  const writeThrough = useCallback((next: ProgressData) => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage full or blocked; progress stays in memory for this session.
    }
  }, []);

  const persist = useCallback(
    (next: ProgressData) => {
      setData(next);
      writeThrough(next);
    },
    [writeThrough]
  );

  // ── Reads ────────────────────────────────────────────────────────────────

  const isCompleted = useCallback(
    (lessonId: string) => Boolean(data.completed[lessonId]),
    [data.completed]
  );

  /** A lesson opens once the one before it in the module is done. */
  const isUnlocked = useCallback(
    (moduleId: string, lessonId: string) => {
      const module = getModule(moduleId);
      if (!module) return false;
      const all = moduleLessons(module);
      const idx = all.findIndex((l) => l.lesson.id === lessonId);
      if (idx <= 0) return true;
      if (data.completed[lessonId]) return true;
      return Boolean(data.completed[all[idx - 1].lesson.id]);
    },
    [data.completed]
  );

  const countFor = useCallback(
    (lessons: LessonLocation[]): ModuleProgress => {
      const completed = lessons.filter((l) => data.completed[l.lesson.id]).length;
      const total = lessons.length;
      return {
        completed,
        total,
        percent: total === 0 ? 0 : Math.round((completed / total) * 100),
        isStarted: completed > 0,
        isFinished: total > 0 && completed === total,
      };
    },
    [data.completed]
  );

  const moduleProgress = useCallback(
    (moduleId: string) => {
      const module = getModule(moduleId);
      if (!module) return { completed: 0, total: 0, percent: 0, isStarted: false, isFinished: false };
      return countFor(moduleLessons(module));
    },
    [countFor]
  );

  const levelProgress = useCallback(
    (moduleId: string, levelId: string) => {
      const module = getModule(moduleId);
      const level = module?.levels.find((l) => l.id === levelId);
      if (!module || !level) {
        return { completed: 0, total: 0, percent: 0, isStarted: false, isFinished: false };
      }
      return countFor(
        moduleLessons(module).filter((l) => l.level.id === level.id)
      );
    },
    [countFor]
  );

  const nextLessonIn = useCallback(
    (moduleId: string) => {
      const module = getModule(moduleId);
      if (!module) return undefined;
      const all = moduleLessons(module);
      return all.find((l) => !data.completed[l.lesson.id]) ?? all[all.length - 1];
    },
    [data.completed]
  );

  const trackPercent = useMemo(() => {
    const all = foundationsTrack.modules.flatMap((m: CourseModule) => moduleLessons(m));
    const done = all.filter((l) => data.completed[l.lesson.id]).length;
    return all.length === 0 ? 0 : Math.round((done / all.length) * 100);
  }, [data.completed]);

  const recentLessons = useMemo(
    () =>
      data.recent
        .map((entry) => findLesson(entry.moduleId, entry.lessonId))
        .filter((l): l is LessonLocation => Boolean(l)),
    [data.recent]
  );

  const recentModules = useMemo<ModuleVisit[]>(
    () =>
      (data.recentModules || [])
        .map((entry): ModuleVisit | undefined => {
          const module = getModule(entry.moduleId);
          if (!module) return undefined;
          const lessons = moduleLessons(module);
          const completed = lessons.filter((l) => data.completed[l.lesson.id]).length;
          return {
            module,
            progress: {
              completed,
              total: lessons.length,
              percent:
                lessons.length === 0
                  ? 0
                  : Math.round((completed / lessons.length) * 100),
              isStarted: completed > 0,
              isFinished: lessons.length > 0 && completed === lessons.length,
            },
            nextLesson:
              lessons.find((l) => !data.completed[l.lesson.id]) ??
              lessons[lessons.length - 1],
            lastLesson: lessons.find((l) => l.lesson.id === entry.lessonId),
            at: entry.at,
          };
        })
        .filter((visit): visit is ModuleVisit => Boolean(visit)),
    [data.recentModules, data.completed]
  );

  /** A streak only counts while unbroken: finished today, or yesterday and still catchable. */
  const streak = useMemo(() => {
    if (!data.lastCompletedDay) return 0;
    const today = dayKey(new Date());
    const yesterday = dayKey(addDays(new Date(), -1));
    if (data.lastCompletedDay === today || data.lastCompletedDay === yesterday) {
      return data.streak;
    }
    return 0;
  }, [data.lastCompletedDay, data.streak]);

  const weeklyActivity = useMemo<DayActivity[]>(() => {
    const now = new Date();
    const todayKey = dayKey(now);
    // JS weeks start Sunday; shift so Monday is index 0.
    const mondayOffset = (now.getDay() + 6) % 7;
    const monday = addDays(now, -mondayOffset);
    const active = new Set(data.activeDays);

    return UZ_DAY_LABELS.map((label, i) => {
      const d = addDays(monday, i);
      const key = dayKey(d);
      return {
        dayName: label,
        dayKey: key,
        isCompleted: active.has(key),
        isToday: key === todayKey,
        isFuture: key > todayKey,
      };
    });
  }, [data.activeDays]);

  const completedCount = useMemo(
    () => Object.keys(data.completed).length,
    [data.completed]
  );

  const isFreshStart = completedCount === 0 && data.recent.length === 0;

  /**
   * Counters the achievements engine reads. Kept here because this provider is
   * the only place that knows what "finished" means for a level or a module.
   */
  const stats = useMemo<ProgressStats>(() => {
    let completedModules = 0;
    let completedLevels = 0;

    for (const track of allTracks) {
      for (const module of track.modules) {
        const lessons = moduleLessons(module);
        if (
          lessons.length > 0 &&
          lessons.every((l) => data.completed[l.lesson.id])
        ) {
          completedModules += 1;
        }
        for (const level of module.levels) {
          if (
            level.lessons.length > 0 &&
            level.lessons.every((l) => data.completed[l.id])
          ) {
            completedLevels += 1;
          }
        }
      }
    }

    return {
      completedLessons: completedCount,
      xp: data.xp,
      streak,
      activeDays: data.activeDays.length,
      completedModules,
      completedLevels,
      trackPercent,
    };
  }, [data.completed, data.xp, data.activeDays.length, streak, trackPercent, completedCount]);

  const recommendedLesson = useMemo(
    () => nextLessonIn(foundationsTrack.modules[0].id),
    [nextLessonIn]
  );

  // ── Writes ───────────────────────────────────────────────────────────────

  const pushRecent = (
    recent: RecentEntry[],
    moduleId: string,
    lessonId: string
  ): RecentEntry[] => {
    const entry: RecentEntry = { moduleId, lessonId, at: new Date().toISOString() };
    const withoutDupe = recent.filter((r) => r.lessonId !== lessonId);
    return [entry, ...withoutDupe].slice(0, RECENT_LIMIT);
  };

  const pushRecentModule = (
    list: RecentModuleEntry[] = [],
    moduleId: string,
    lessonId: string
  ): RecentModuleEntry[] => {
    const entry: RecentModuleEntry = { moduleId, lessonId, at: new Date().toISOString() };
    const withoutDupe = (list || []).filter((r) => r.moduleId !== moduleId);
    return [entry, ...withoutDupe].slice(0, RECENT_LIMIT);
  };

  const visitLesson = useCallback(
    (moduleId: string, lessonId: string) => {
      if (!hydratedRef.current) return;
      setData((prev) => {
        const next: ProgressData = {
          ...prev,
          recent: pushRecent(prev.recent, moduleId, lessonId),
          recentModules: pushRecentModule(prev.recentModules, moduleId, lessonId),
        };
        writeThrough(next);
        return next;
      });
    },
    [writeThrough]
  );

  /** Returns the XP actually awarded — zero when the lesson was already done. */
  const completeLesson = useCallback(
    (moduleId: string, lessonId: string): number => {
      const location = findLesson(moduleId, lessonId);
      if (!location || !hydratedRef.current) return 0;

      let awarded = 0;

      setData((prev) => {
        const alreadyDone = Boolean(prev.completed[lessonId]);
        awarded = alreadyDone ? 0 : location.lesson.xp;

        const today = dayKey(new Date());
        const yesterday = dayKey(addDays(new Date(), -1));

        let streakValue = prev.streak;
        if (prev.lastCompletedDay !== today) {
          streakValue = prev.lastCompletedDay === yesterday ? prev.streak + 1 : 1;
        }

        const next: ProgressData = {
          completed: alreadyDone
            ? prev.completed
            : { ...prev.completed, [lessonId]: new Date().toISOString() },
          xp: prev.xp + awarded,
          streak: streakValue,
          lastCompletedDay: today,
          activeDays: prev.activeDays.includes(today)
            ? prev.activeDays
            : [...prev.activeDays, today],
          recent: pushRecent(prev.recent, moduleId, lessonId),
          recentModules: pushRecentModule(prev.recentModules, moduleId, lessonId),
        };

        writeThrough(next);
        return next;
      });

      return awarded;
    },
    [writeThrough]
  );

  const resetProgress = useCallback(() => persist(EMPTY), [persist]);

  // Memoised so consumers only re-render when progress actually changes.
  const value = useMemo<ProgressContextValue>(() => ({
    hydrated,
    xp: data.xp,
    streak,
    weeklyActivity,
    completedCount,
    isCompleted,
    isUnlocked,
    completeLesson,
    visitLesson,
    moduleProgress,
    levelProgress,
    trackPercent,
    nextLessonIn,
    recentLessons,
    recentModules,
    stats,
    isFreshStart,
    recommendedLesson,
    resetProgress,
  }), [
    hydrated,
    data.xp,
    streak,
    weeklyActivity,
    completedCount,
    isCompleted,
    isUnlocked,
    completeLesson,
    visitLesson,
    moduleProgress,
    levelProgress,
    trackPercent,
    nextLessonIn,
    recentLessons,
    recentModules,
    stats,
    isFreshStart,
    recommendedLesson,
    resetProgress,
  ]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = (): ProgressContextValue => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within a ProgressProvider");
  return ctx;
};
