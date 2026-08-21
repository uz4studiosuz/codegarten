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
  ordinal.ts            which puzzle of its game each lesson gets
  shared/
    ui.tsx              GameShell, GameBoard, GameHowTo, DropSlot, DragGhost
    useGameCheck.ts     footer button wiring and one-time XP
    useBlockDrag.ts     pointer-based drag from a palette into slots
    seed.ts             deterministic puzzle picking
  <game-id>/
    index.ts            the GameDefinition
    <GameName>Game.tsx  the component
```

## The topic rule

A game must practise the idea its lesson just taught — a loops lesson ending in
a drawing puzzle teaches nothing about loops. Matching happens on meaning, in
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

## Which puzzle, not just which game

A game holds several puzzles, and picking one by hashing the lesson id meant
collisions: two loops lessons could pose the identical task while other puzzles
were never seen at all. `ordinal.ts` walks every lesson in the project, numbers
it within its game, and that number reaches the game as `props.variant`:

```tsx
const puzzle = pickVariant(PUZZLES, props.seed, { ordinal: props.variant });
```

`pickVariant` then steps through the pool round-robin, so a repeat only happens
once the pool is spent. Give a game as many puzzles as it has lessons pointing at
it — six to eight is the current baseline. `prefer` still narrows the pool when
the lesson names something specific ("Binary Search" must not get the
linear-search puzzle).

## Adding a game

**1. Create the folder and component.** Take `GameProps`, and let the shared
hook do the wiring:

```tsx
"use client";

import { useState } from "react";
import type { GameProps } from "../types";
import { GameBoard, GameShell, pickVariant, useGameCheck } from "../shared";

const PUZZLES = [{ answer: 42 }, { answer: 7 }];

export function MyGame(props: GameProps) {
  // Several lessons share one game; ordinal spreads them across the pool.
  const puzzle = pickVariant(PUZZLES, props.seed, { ordinal: props.variant });
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
  // Your pool, in pool order — this is what the writer's picker shows an author.
  puzzles: [
    { variant: 0, title: "Birinchi masala", hint: "Bir qatorda nima so'ralishi", difficulty: "Oson" },
  ],
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
- **Derive puzzles from `props.seed` and `props.variant`.** Same lesson → same
  puzzle; different lessons sharing a game → different puzzles.
- **Never reveal the answer on a wrong attempt.** Say what is off, not what is
  right: printing the right number under the box, or replaying the algorithm's
  steps after a wrong guess, ends the thinking and turns the retry into copying.
  Reveals are the reward for a correct answer.
- **Do not update the result live when the result *is* the answer.** Watching
  the output match the target turns a puzzle into nudging pieces until the two
  strips look alike. Show it after checking.
- **Make moves look like moves.** Children testing the first versions could see
  the pieces but not what was expected of them. Blocks that get dragged into
  visibly empty slots read as blocks; a `GameHowTo` list of two or three
  imperative lines does the rest.
- **Support touch.** Use `useBlockDrag` rather than HTML5 drag-and-drop, which
  never fires on touch devices.

## Drag and drop

`useBlockDrag` covers the one interaction most games need: pick a block up from a
palette, drop it into a slot, drag it between slots, drag it out to discard.
Pointer events, so touch works.

```tsx
const drag = useBlockDrag<Tile>({
  onDrop: (tile, slot, from) => place(tile, slot, from), // from = source slot
  onDropOutside: (_tile, from) => from !== undefined && removeAt(from),
  onTap: (tile) => append(tile),                          // tapping still works
});

<DropSlot index={i} filled={Boolean(tile)} active={drag.overSlot === i}>
  <div {...drag.bind(tile, i)} className={grabClass}>
    …
    {/* a control inside a draggable block needs data-no-drag, or the block
        captures the pointer and the button never sees the release */}
    <button data-no-drag onClick={() => removeAt(i)} />
  </div>
</DropSlot>

{drag.isDragging && drag.drag && (
  <DragGhost x={drag.drag.x} y={drag.drag.y}>{/* what follows the finger */}</DragGhost>
)}
```

## The puzzle pool

A game holds several puzzles and picks one per lesson (see `shared/seed.ts`). It
also declares them on its `GameDefinition.puzzles`, which is what the writer's
picker shows an author. Keep the two in step — that list used to live in a table
of its own and drifted, promising a sorting puzzle for a game that only ever
counted search steps.

## Registered games

| id | topics | what the learner does |
|---|---|---|
| `sequence-order` | sequencing | Drags shuffled steps into the one correct order, swapping rows to reorder. |
| `robot-grid` | sequencing | Drags command blocks into slots to walk a robot to the star, routing around walls. |
| `debug-extra` | debugging | Marks the line that breaks a program's goal — and in later puzzles picks its replacement. |
| `loop-repeat` | loops | Builds a loop body and its bound, or the stopping condition of a `toki` loop, with the counter visible. |
| `function-factory` | functions | Assembles the body of a function, then watches that one body run against every call. |
| `list-walk` | lists | Points at a cell by index, predicts what a walk prints, and fills in the loop body that computes a result. |
| `condition-branch` | conditionals | Assembles a rule — plain `agar` first, `aks holda` in later puzzles — and runs it against every test case. |
| `variable-trace` | variables | Predicts what each box holds after the program runs — numbers, text or true/false. |
| `algo-race` | efficiency | Counts how many checks a search strategy needs, then sees the actual visits. Belongs to the algorithms track, not the foundations one. |
