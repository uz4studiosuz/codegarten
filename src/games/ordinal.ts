import { allTracks, gameMatchInputFor, moduleLessons } from "@/data/curriculum";
import { resolveGameId } from "./resolve";

/**
 * Which puzzle of its game a lesson gets
 * --------------------------------------
 * Games hold several puzzles and used to pick one by hashing the lesson id,
 * which meant collisions: two loops lessons could pose the exact same task while
 * other puzzles were never seen. Here every lesson in the project is walked once
 * in curriculum order and numbered within its game, so lesson 1 of the loops
 * game takes puzzle 1, lesson 2 takes puzzle 2, and a repeat only happens after
 * the pool is exhausted.
 *
 * Client-only on purpose: resolving a game pulls the game components in, and the
 * server graph must stay free of them.
 */

let ordinals: Map<string, number> | null = null;

function build(): Map<string, number> {
  const seen = new Map<string, number>();
  const out = new Map<string, number>();

  for (const track of allTracks) {
    for (const module of track.modules) {
      for (const location of moduleLessons(module)) {
        const gameId = resolveGameId(gameMatchInputFor(location));
        if (!gameId) continue;
        const used = seen.get(gameId) ?? 0;
        seen.set(gameId, used + 1);
        out.set(location.lesson.id, used);
      }
    }
  }

  return out;
}

/** Undefined for a lesson that ends without a game. */
export function gameVariantOrdinal(lessonId: string): number | undefined {
  ordinals ??= build();
  return ordinals.get(lessonId);
}
