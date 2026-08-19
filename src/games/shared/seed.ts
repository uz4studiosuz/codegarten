/**
 * Deterministic puzzle picking
 * ---------------------------
 * Several lessons share one game, so each game holds a handful of puzzles and
 * picks one from the lesson id. Same lesson → same puzzle on every visit (a
 * learner returning to a lesson finds what they left), different lessons → a
 * different puzzle, with no per-lesson authoring needed.
 */

/** FNV-1a: tiny, no dependencies, well spread for short strings. */
export function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash ^ seed.charCodeAt(i)) * 16777619) >>> 0;
  }
  return hash;
}

/**
 * The puzzle this lesson gets. Falls back to the first when unseeded.
 *
 * `prefer` narrows the pool to the puzzles that suit the lesson — when nothing
 * matches, the full pool is used rather than failing, so a game always has
 * something to show.
 */
export function pickVariant<T>(
  variants: readonly T[],
  seed: string | undefined,
  prefer?: (variant: T) => boolean
): T {
  if (variants.length === 0) throw new Error("pickVariant: no variants");

  const preferred = prefer ? variants.filter(prefer) : [];
  const pool = preferred.length > 0 ? preferred : variants;

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
