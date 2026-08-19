import type { GameDefinition } from "../types";
import { SequenceOrderGame } from "./SequenceOrderGame";

export const sequenceOrderGame: GameDefinition = {
  id: "sequence-order",
  name: "Qadamlarni tartibga solish",
  description: "Aralashib ketgan qadamlarni to'g'ri ketma-ketlikda terib chiqish.",
  suits: ["exercise", "challenge", "review"],
  topics: ["sequencing"],
  keywords: ["ketma-ketlik", "tartib", "qadam", "algoritm", "sequence", "buyruq"],
  Component: SequenceOrderGame,
};
