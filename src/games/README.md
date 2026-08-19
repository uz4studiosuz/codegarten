# Interactive games

Each game is the hands-on step at the end of a lesson. The lesson runner owns
all the chrome — progress bar, XP pill, the footer button, success and failure
messaging — so a game only has to render its own playfield and report upward.

## Folder layout

```
src/games/
  types.ts              the GameProps / GameDefinition contract
  registry.ts           the single place a game gets registered
  <game-id>/
    index.ts            the GameDefinition
    <GameName>Game.tsx  the component
```

## Adding a game

**1. Create the folder and component.** The component takes `GameProps` and
nothing else:

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameProps } from "../types";

export function MyGame({ onSolved, onReadyChange, registerCheck, onStatusChange }: GameProps) {
  const [answer, setAnswer] = useState("");
  const solved = useRef(false);

  // Enable the runner's Tekshirish button only once there is something to check
  useEffect(() => {
    onReadyChange(answer.length > 0);
  }, [answer, onReadyChange]);

  const check = useCallback(() => {
    const won = answer === "42";
    onStatusChange?.(won ? "success" : "fail");
    if (won && !solved.current) {
      solved.current = true;
      onSolved();          // awards the lesson XP — call at most once
    }
  }, [answer, onSolved, onStatusChange]);

  // Hand the runner the action its footer button should trigger
  useEffect(() => {
    registerCheck(check);
  }, [check, registerCheck]);

  return <input value={answer} onChange={(e) => setAnswer(e.target.value)} />;
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
  Component: MyGame,
};
```

**3. Register it in `registry.ts`** — add the import and push it into the
`GAMES` array. That is the whole wiring; the writer picks it up automatically.

**4. Point a lesson at it** by setting `gameId` in
`content/modules/<moduleId>.json`:

```json
{ "id": "m1-l1-2", "title": "...", "kind": "exercise", "xp": 15, "estMinutes": 5, "gameId": "my-game" }
```

Lessons that do not name a game rotate through the registered ones, so every
exercise stays playable while content is still being written.

## Rules that keep games interchangeable

- **Call `onSolved` at most once.** Guard it with a ref; the runner awards XP on
  the first call.
- **Never render your own Check or Continue button.** Report through
  `registerCheck` and `onReadyChange` so every game feels the same.
- **Report `onReadyChange(false)` while animating**, otherwise the learner can
  re-check mid-run.
- **Keep state inside the game.** Progress and XP belong to the runner; a game
  is replayable and holds nothing that must survive a remount.
- **Support touch.** Use pointer events rather than HTML5 drag-and-drop, which
  never fires on touch devices.

## Registered games

| id | name | what the learner does |
|---|---|---|
| `shape-color` | Shakllarni bo'yash | Changes block parameters until every shape is yellow. |
| `robot-grid` | Robotni boshqarish | Drags command blocks into numbered slots to walk a robot to the star. |
