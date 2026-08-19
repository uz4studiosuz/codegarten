import type { GameDefinition } from "../types";
import { LoopRepeatGame } from "./LoopRepeatGame";

export const loopRepeatGame: GameDefinition = {
  id: "loop-repeat",
  name: "Sikl bilan naqsh yasash",
  description:
    "Takrorlanuvchi bo'lakni topib, sikl va takrorlar soni bilan naqshni qayta yaratish.",
  suits: ["exercise", "challenge", "review"],
  topics: ["loops"],
  keywords: ["sikl", "naqsh", "takror", "loop", "repeat", "hisoblagich"],
  Component: LoopRepeatGame,
};
