import type React from "react";

/**
 * Interactive game contract
 * -------------------------
 * A game is the hands-on step at the end of a lesson. The lesson runner owns the
 * chrome — progress bar, XP pill, the footer button — and a game only reports
 * upward through these callbacks. That keeps games self-contained: a new one can
 * be added without touching the runner.
 *
 * See README.md in this folder for how to add one.
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
  Component: React.ComponentType<GameProps>;
}
