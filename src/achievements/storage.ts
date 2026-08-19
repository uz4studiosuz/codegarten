const STORAGE_KEY = "codegarten_achievements_v1";

interface Stored {
  /** achievementId -> ISO timestamp it was celebrated. */
  celebrated: Record<string, string>;
  /**
   * True once the first evaluation has run. Without it, a learner who already
   * has progress would be shown a stack of dialogs the first time this ships.
   */
  seeded: boolean;
}

const EMPTY: Stored = { celebrated: {}, seeded: false };

export function loadAchievements(): Stored {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Stored>;
    return {
      celebrated: parsed.celebrated ?? {},
      seeded: Boolean(parsed.seeded),
    };
  } catch {
    // Corrupt or blocked storage: treat as a clean slate rather than crash.
    return EMPTY;
  }
}

export function saveAchievements(state: Stored): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Full or blocked storage; celebrations stay correct for this session only.
  }
}

export function clearAchievements(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do — the caller is resetting progress anyway.
  }
}

export type { Stored as StoredAchievements };
