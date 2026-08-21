import type { GameDefinition } from "./types";
import { algoRaceGame } from "./algo-race";
import { conditionBranchGame } from "./condition-branch";
import { debugExtraGame } from "./debug-extra";
import { functionFactoryGame } from "./function-factory";
import { listWalkGame } from "./list-walk";
import { loopRepeatGame } from "./loop-repeat";
import { robotGridGame } from "./robot-grid";
import { sequenceOrderGame } from "./sequence-order";
import { variableTraceGame } from "./variable-trace";

/**
 * The one place a game gets registered. Add the import above and the entry
 * below, and the game is immediately selectable from content JSON, matchable by
 * topic (see resolve.ts) and visible in the writer's picker — nothing else needs
 * to change.
 */
const GAMES: GameDefinition[] = [
  sequenceOrderGame,
  robotGridGame,
  debugExtraGame,
  loopRepeatGame,
  functionFactoryGame,
  conditionBranchGame,
  variableTraceGame,
  listWalkGame,
  algoRaceGame,
];

const BY_ID = new Map(GAMES.map((g) => [g.id, g]));

/** Every registered game, for the writer's picker and the games overview. */
export function listGames(): GameDefinition[] {
  return GAMES;
}

export function getGame(id: string | undefined): GameDefinition | undefined {
  return id ? BY_ID.get(id) : undefined;
}
