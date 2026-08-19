import type { GameDefinition } from "../types";
import { VariableTraceGame } from "./VariableTraceGame";

export const variableTraceGame: GameDefinition = {
  id: "variable-trace",
  name: "Qutilardagi qiymatni kuzatish",
  description:
    "Dastur tugagach o'zgaruvchilarda qanday qiymat qolishini oldindan aytish.",
  suits: ["exercise", "challenge", "review"],
  topics: ["variables"],
  keywords: ["o'zgaruvchi", "qiymat", "xotira", "quti", "almashtirish", "hisoblagich", "tur"],
  Component: VariableTraceGame,
};
