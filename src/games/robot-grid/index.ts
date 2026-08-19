import type { GameDefinition } from "../types";
import { RobotGridGame } from "./RobotGridGame";

export const robotGridGame: GameDefinition = {
  id: "robot-grid",
  name: "Robotni boshqarish",
  description:
    "Buyruq bloklarini sudrab qatorlarga terib, robotni yulduzga olib borish.",
  suits: ["exercise", "challenge"],
  topics: ["sequencing"],
  keywords: ["robot", "labirint", "yo'l", "boshqar", "harakat", "buyruq", "katak"],
  Component: RobotGridGame,
};
