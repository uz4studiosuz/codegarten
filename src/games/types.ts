import type React from "react";
import type { GameTopic } from "./topics";

/**
 * Interactive game contract
 * -------------------------
 * A game is the hands-on step at the end of a lesson. The lesson runner owns the
 * chrome — progress bar, XP pill, the footer button — and a game only reports
 * upward through these callbacks. That keeps games self-contained: a new one can
 * be added without touching the runner.
 *
 * See README.md in this folder for how to add one, and resolve.ts for how a
 * lesson gets matched to the game that actually teaches its topic.
 */

export type GameStatus = "idle" | "success" | "fail";

export interface GameProps {
  /** Call once, the first time the learner solves it. Awards the lesson XP. */
  onSolved: () => void;
  /**
   * Whether the footer "Tekshirish" button should be active. Report false while
   * the learner has not yet made a move, and while an animation is running.
   */
  onReadyChange: (ready: boolean) => void;
  /**
   * Hand the runner the function its footer button should call. The runner
   * drives checking so the button lives in one place for every game.
   */
  registerCheck: (check: () => void) => void;
  /** Optional: lets the runner reflect success/failure in its own chrome. */
  onStatusChange?: (status: GameStatus) => void;
  /**
   * Stable per-lesson string (the lesson id). Games with several puzzles pick
   * one from it, so two lessons sharing a game do not pose the same puzzle —
   * and reopening a lesson always poses the same one.
   */
  seed?: string;
  /**
   * The lesson and level titles, lowercased. A game holding several puzzles can
   * narrow them to the one the lesson is actually about — a "Binary Search"
   * lesson should not be handed the linear-search puzzle.
   */
  context?: string;
  /**
   * This lesson's position among all lessons that end in this game. Passing it
   * to `pickVariant` walks the puzzle pool round-robin, so two lessons sharing a
   * game never pose the same task while unseen puzzles remain. See
   * src/games/ordinal.ts.
   */
  variant?: number;
  /**
   * Custom configuration provided directly from the writer, bypassing standard
   * puzzle selection if present. Allows authors to define completely new puzzle
   * configurations without changing code.
   */
  config?: any;
}

/**
 * One puzzle of a game, described for the writer's picker so an author can see
 * which task a learner will actually be given.
 *
 * A game declares these itself (see each game's `index.ts`). They used to live in
 * a separate hand-kept table, which drifted: it still advertised sorting and
 * hash-map puzzles for a game whose pool only ever counted search steps, so the
 * writer promised one task and the lesson delivered another.
 */
export interface GamePuzzleInfo {
  /** Index into the game's own puzzle pool. */
  variant: number;
  title: string;
  hint: string;
  difficulty?: "Oson" | "O'rta" | "Qiyin";
}

export interface GameDefinition {
  /** Stable id referenced by `gameId` in content/modules/*.json. */
  id: string;
  /** Shown in the writer's game picker. */
  name: string;
  /** One line on what the learner does — also shown in the writer. */
  description: string;
  /** Which lesson kinds this game suits, for authoring guidance. */
  suits: string[];
  /**
   * Which curriculum topics the game actually practises. Matching on this is
   * what keeps a loops lesson from ending in a geometry puzzle.
   */
  topics: GameTopic[];
  /**
   * Lowercase words that, appearing in a lesson or level title, mean this game
   * is the right ending for it. Uzbek and English both, since titles mix them.
   */
  keywords?: string[];
  /**
   * The game's own puzzle pool, in pool order, for the writer's picker. Declared
   * here so it cannot drift away from the puzzles the game actually holds.
   */
  puzzles?: GamePuzzleInfo[];
  Component: React.ComponentType<GameProps>;
}
