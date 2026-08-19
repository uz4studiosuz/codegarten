import type { GameDefinition } from "../types";
import { AlgoRaceGame } from "./AlgoRaceGame";

export const algoRaceGame: GameDefinition = {
  id: "algo-race",
  name: "Qadamlarni sanash",
  description:
    "Qidiruv algoritmi javobga yetish uchun nechta tekshiruv qilishini hisoblash.",
  suits: ["exercise", "challenge", "review"],
  topics: ["efficiency"],
  keywords: ["tez", "qadam", "qidiruv", "binary", "saralash", "murakkablik", "o(n)", "samarad"],
  Component: AlgoRaceGame,
};
