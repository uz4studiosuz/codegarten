import type { GameDefinition } from "../types";
import { DebugExtraGame } from "./DebugExtraGame";

export const debugExtraGame: GameDefinition = {
  id: "debug-extra",
  name: "Xato qatorni topish",
  description: "Qisqa dasturni maqsad bilan solishtirib, buzuq qatorni aniqlash.",
  suits: ["exercise", "challenge", "review"],
  topics: ["debugging"],
  keywords: ["xato", "ortiqcha", "debug", "tuzat", "cheksiz", "topish"],
  Component: DebugExtraGame,
};
