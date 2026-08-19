import type { GameDefinition } from "./types";
import { getGame, listGames } from "./registry";
import { hashSeed } from "./shared/seed";

/**
 * Which game ends a lesson
 * ------------------------
 * A rotation put a geometry puzzle at the end of a loops lesson, which taught
 * the learner nothing about loops. Matching happens on meaning instead:
 *
 *   1. `gameId` authored on the lesson always wins.
 *   2. Otherwise the lesson's own words decide — a title mentioning "sikl" ends
 *      in the loop game.
 *   3. Otherwise the module's `topics` decide, so a new lesson in the loops
 *      module is right by default without any authoring.
 *   4. Only when nothing matches does it fall back to a stable pick, so every
 *      exercise stays playable while content is still being written.
 *
 * Both the app and the writer's preview call this, so what an author sees is
 * what a learner gets.
 */

export interface GameMatchInput {
  /** Authored override from content/modules/*.json. */
  gameId?: string;
  /** Lesson kind — concept and review lessons teach and quiz, without a game. */
  kind: string;
  lessonTitle?: string;
  levelTitle?: string;
  /** Topics declared by the module the lesson belongs to. */
  moduleTopics?: string[];
  /** Lesson id: keeps fallback picks stable and spread out. */
  seed?: string;
}

const KEYWORD_WEIGHT = 4;
const TOPIC_WEIGHT = 6;
const KIND_WEIGHT = 1;

/** Lessons that end hands-on. Concept and review lessons end on the quiz. */
function wantsGame(kind: string): boolean {
  return kind === "exercise" || kind === "challenge";
}

function scoreGame(game: GameDefinition, input: GameMatchInput, haystack: string): number {
  let score = 0;

  for (const topic of input.moduleTopics ?? []) {
    if (game.topics.includes(topic as GameDefinition["topics"][number])) {
      score += TOPIC_WEIGHT;
    }
  }

  for (const keyword of game.keywords ?? []) {
    if (haystack.includes(keyword)) score += KEYWORD_WEIGHT;
  }

  if (game.suits.includes(input.kind)) score += KIND_WEIGHT;

  return score;
}

export function resolveGame(input: GameMatchInput): GameDefinition | undefined {
  if (input.gameId) {
    const authored = getGame(input.gameId);
    if (authored) return authored;
    // An unknown id is an authoring mistake; fall through to matching rather
    // than dropping the hands-on step entirely.
  }

  if (!wantsGame(input.kind)) return undefined;

  const games = listGames();
  if (games.length === 0) return undefined;

  const haystack = `${input.lessonTitle ?? ""} ${input.levelTitle ?? ""}`.toLowerCase();
  const scored = games.map((game) => ({ game, score: scoreGame(game, input, haystack) }));
  const best = Math.max(...scored.map((s) => s.score));

  // Nothing said anything about the topic — spread the fallback so a module
  // without topics does not end every lesson with the same puzzle.
  if (best <= KIND_WEIGHT) {
    const pool = scored.filter((s) => s.game.suits.includes(input.kind)).map((s) => s.game);
    const fallback = pool.length > 0 ? pool : games;
    return fallback[hashSeed(input.seed ?? "codegarten") % fallback.length];
  }

  const winners = scored.filter((s) => s.score === best).map((s) => s.game);
  return winners[hashSeed(input.seed ?? "codegarten") % winners.length];
}

/** Convenience for callers that only need the id (content authoring, tests). */
export function resolveGameId(input: GameMatchInput): string | undefined {
  return resolveGame(input)?.id;
}
