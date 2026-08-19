# Interactive games

Each game is the hands-on step at the end of a lesson. The lesson runner owns
all the chrome — progress bar, XP pill, the footer button, success and failure
messaging — so a game only has to render its own playfield and report upward.

## Folder layout

```
src/games/
  types.ts              the GameProps / GameDefinition contract
  topics.ts             the topic vocabulary shared with content/modules/*.json
  registry.ts           the single place a game gets registered
  resolve.ts            which game a lesson ends with, and why
  shared/               GameShell, useGameCheck, seeded puzzle picking
  <game-id>/
    index.ts            the GameDefinition
    <GameName>Game.tsx  the component
```

## The topic rule

A game must practise the idea its lesson just taught — a loops lesson ending in
a geometry puzzle teaches nothing about loops. Matching happens on meaning, in
this order (see `resolve.ts`):

1. `gameId` authored on the lesson wins outright.
2. The lesson's and level's own titles are scanned for each game's `keywords`.
3. The module's `topics` (in `content/modules/<id>.json`) are matched against
   each game's `topics`.
4. Only if nothing matches does a stable seeded pick keep the lesson playable.

So the usual way to get the right game is to give the module its topics — new
lessons in that module are then right by default, with no per-lesson authoring.

Concept and review lessons end on the quiz; only `exercise` and `challenge`
lessons get a game.

## Adding a game

**1. Create the folder and component.** Take `GameProps`, and let the shared
hook do the wiring:

```tsx
"use client";

import { useState } from "react";
import type { GameProps } from "../types";
import { GameBoard, GameShell, useGameCheck } from "../shared";
import { pickVariant } from "../shared/seed";

const PUZZLES = [{ answer: 42 }, { answer: 7 }];

export function MyGame(props: GameProps) {
  // Several lessons share one game, so the puzzle comes from the lesson id.
  const puzzle = pickVariant(PUZZLES, props.seed);
  const [answer, setAnswer] = useState<number | null>(null);

  const { status } = useGameCheck(props, {
    ready: answer !== null,                 // enables the footer button
    check: () => answer === puzzle.answer,  // awards XP on the first true
  });

  return (
    <GameShell
      task="Javobni tanlang."
      status={status}
      successText="To'g'ri — mana nima uchun."
      failText="Bu javob mos kelmadi, chunki ..."
    >
      <GameBoard label="Savol">{/* playfield */}</GameBoard>
    </GameShell>
  );
}
```

**2. Describe it in `index.ts`:**

```ts
import type { GameDefinition } from "../types";
import { MyGame } from "./MyGame";

export const myGame: GameDefinition = {
  id: "my-game",                       // referenced as gameId in content JSON
  name: "O'yin nomi",
  description: "O'quvchi nima qilishi bir qatorda.",
  suits: ["exercise", "challenge"],
  topics: ["loops"],                   // from topics.ts — this is what matches
  keywords: ["sikl", "takror"],        // words in lesson titles that mean "me"
  Component: MyGame,
};
```

**3. Register it in `registry.ts`** — add the import and push it into the
`GAMES` array. That is the whole wiring; the writer picks it up automatically.

**4. Optionally pin it to a lesson** with `gameId` in
`content/modules/<moduleId>.json`:

```json
{ "id": "m1-l1-2", "title": "...", "kind": "exercise", "xp": 15, "estMinutes": 5, "gameId": "my-game" }
```

## Rules that keep games interchangeable

- **Award XP once.** `useGameCheck` guards this; if you hand-roll, use a ref.
- **Never render your own Check or Continue button.** Report through
  `registerCheck` and `onReadyChange` so every game feels the same.
- **Report `onReadyChange(false)` while animating**, otherwise the learner can
  re-check mid-run.
- **Say why in `failText`.** A wrong attempt is the teaching moment; name what
  went wrong instead of only marking it wrong.
- **Keep state inside the game.** Progress and XP belong to the runner; a game
  is replayable and holds nothing that must survive a remount.
- **Derive puzzles from `props.seed`.** Same lesson → same puzzle; different
  lessons sharing a game → different puzzles.
- **Support touch.** Use pointer events rather than HTML5 drag-and-drop, which
  never fires on touch devices.

## Registered games

| id | topics | what the learner does |
|---|---|---|
| `sequence-order` | sequencing | Taps shuffled steps into the one correct order. |
| `robot-grid` | sequencing | Drags command blocks into slots to walk a robot to the star. |
| `debug-extra` | debugging | Reads a short program against its goal and marks the broken line. |
| `loop-repeat` | loops | Finds the repeating block and sets the repeat count to rebuild a pattern. |
| `function-factory` | functions | Calls one ready-made function with different arguments to hit three targets. |
| `shape-color` | geometry, functions | Changes block parameters until every shape is yellow. |
| `condition-branch` | conditionals | Assembles an if/else rule and watches it run against every test case. |
| `variable-trace` | variables | Predicts what each variable holds after the program runs. |
| `algo-race` | efficiency | Counts how many checks a search strategy needs, then sees the actual visits. |
