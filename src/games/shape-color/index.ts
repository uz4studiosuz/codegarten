import type { GameDefinition } from "../types";
import { ShapeColorGame } from "./ShapeColorGame";

export const shapeColorGame: GameDefinition = {
  id: "shape-color",
  name: "Shakllarni bo'yash",
  description:
    "Kod bloklaridagi rang parametrini o'zgartirib, barcha shakllarni sariq qilish.",
  suits: ["exercise", "challenge"],
  Component: ShapeColorGame,
};
