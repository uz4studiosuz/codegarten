/**
 * Deterministic puzzle picking
 * ---------------------------
 * Several lessons share one game, so each game holds a handful of puzzles and
 * picks one per lesson. Two things have to hold at once:
 *
 *   - the same lesson always poses the same puzzle (a learner coming back finds
 *     what they left), and
 *   - two lessons that share a game do not pose the same puzzle.
 *
 * Hashing the lesson id alone only gives the first: with four puzzles and eight
 * loops lessons, collisions were the rule rather than the exception, which is
 * why the same task kept reappearing under different titles. `ordinal` — the
 * lesson's position among all lessons that resolved to this game — walks the
 * pool round-robin instead, so a repeat only happens once the pool is spent.
 */

/** FNV-1a: tiny, no dependencies, well spread for short strings. */
export function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash ^ seed.charCodeAt(i)) * 16777619) >>> 0;
  }
  return hash;
}

export interface VariantChoice<T> {
  /**
   * Narrows the pool to the puzzles that suit this lesson. When nothing matches,
   * the full pool is used rather than failing — a game always has something to
   * show.
   */
  prefer?: (variant: T) => boolean;
  /**
   * Position of this lesson among the lessons using this game. Supplied by
   * src/games/ordinal.ts for real lessons and by the lesson index in the
   * writer's preview.
   */
  ordinal?: number;
}

/** The puzzle this lesson gets. */
export function pickVariant<T>(
  variants: readonly T[],
  seed: string | undefined,
  choice: VariantChoice<T> = {}
): T {
  if (variants.length === 0) throw new Error("pickVariant: no variants");

  const preferred = choice.prefer ? variants.filter(choice.prefer) : [];
  const pool = preferred.length > 0 ? preferred : variants;

  if (choice.ordinal !== undefined && Number.isFinite(choice.ordinal)) {
    // Modulo of a possibly negative ordinal still has to land inside the pool.
    const index = ((choice.ordinal % pool.length) + pool.length) % pool.length;
    return pool[index];
  }

  if (!seed) return pool[0];
  return pool[hashSeed(seed) % pool.length];
}

/** A seeded shuffle, so shuffled options do not jump around between renders. */
export function seededShuffle<T>(items: readonly T[], seed: string | undefined): T[] {
  const out = [...items];
  let state = hashSeed(seed ?? "codegarten");
  for (let i = out.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) >>> 0;
    // High bits only: an LCG's low bits cycle badly over short arrays.
    const j = (state >>> 16) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Fisher-Yates with real randomness — a fresh order on every visit. */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
