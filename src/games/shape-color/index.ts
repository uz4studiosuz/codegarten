import type { GameDefinition } from "../types";
import { ShapeColorGame } from "./ShapeColorGame";

export const shapeColorGame: GameDefinition = {
  id: "shape-color",
  name: "Shakllarni bo'yash",
  description:
    "Chaqiruvlarning rang argumentini to'ldirib, rasmni namunadagi ko'rinishga keltirish.",
  suits: ["exercise", "challenge"],
  topics: ["geometry", "functions"],
  keywords: ["shakl", "rang", "bo'ya", "chiz", "kvadrat", "parametr"],
  Component: ShapeColorGame,
};
