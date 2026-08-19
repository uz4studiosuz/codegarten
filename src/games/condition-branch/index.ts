import type { GameDefinition } from "../types";
import { ConditionBranchGame } from "./ConditionBranchGame";

export const conditionBranchGame: GameDefinition = {
  id: "condition-branch",
  name: "Qaror qoidasini tuzish",
  description:
    "agar / aks holda qoidasini yig'ib, uni barcha sinov holatlarida tekshirish.",
  suits: ["exercise", "challenge", "review"],
  topics: ["conditionals"],
  keywords: ["shart", "agar", "if", "else", "mantiq", "tarmoq", "qaror", "taqqoslash", "yolg'on"],
  Component: ConditionBranchGame,
};
