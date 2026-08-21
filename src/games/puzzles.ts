/**
 * The writer's puzzle picker
 * -------------------------
 * An author choosing an exact puzzle needs to see what task it poses. That list
 * comes from the game itself (`GameDefinition.puzzles`), never from a table kept
 * beside it: the table this file used to hold had drifted, advertising sorting and
 * hash-map puzzles for a game whose pool only counted search steps, so the writer
 * described one task and the lesson played another.
 */
import type { GamePuzzleInfo } from "./types";
import { getGame } from "./registry";

export type { GamePuzzleInfo };

export function getGamePuzzles(gameId: string | undefined): GamePuzzleInfo[] {
  return getGame(gameId)?.puzzles ?? [];
}
