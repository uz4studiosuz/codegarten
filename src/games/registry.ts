import type { GameDefinition } from "./types";
import { robotGridGame } from "./robot-grid";
import { shapeColorGame } from "./shape-color";

/**
 * The one place a game gets registered. Add the import above and the entry
 * below, and the game is immediately selectable from content JSON and from the
 * writer's picker — nothing else needs to change.
 */
const GAMES: GameDefinition[] = [shapeColorGame, robotGridGame];

const BY_ID = new Map(GAMES.map((g) => [g.id, g]));

/** Every registered game, for the writer's picker and the games overview. */
export function listGames(): GameDefinition[] {
  return GAMES;
}

export function getGame(id: string | undefined): GameDefinition | undefined {
  return id ? BY_ID.get(id) : undefined;
}
