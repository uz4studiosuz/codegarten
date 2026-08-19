import type { GameDefinition } from "../types";
import { FunctionFactoryGame } from "./FunctionFactoryGame";

export const functionFactoryGame: GameDefinition = {
  id: "function-factory",
  name: "Funksiyani argument bilan chaqirish",
  description:
    "Bitta tayyor funksiyani turli argumentlar bilan chaqirib, uchta namunani chizish.",
  suits: ["exercise", "challenge", "review"],
  topics: ["functions"],
  keywords: ["funksiya", "parametr", "argument", "chaqir", "return", "modul", "qora quti"],
  Component: FunctionFactoryGame,
};
