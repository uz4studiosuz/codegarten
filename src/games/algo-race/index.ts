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
  // In pool order. Every puzzle is the same question — how many checks does this
  // strategy need on this list — so the pool varies the list, the position of the
  // target and the strategy, not the task.
  puzzles: [
    { variant: 0, title: "Chiziqli qidiruv, 8 element", hint: "Birma-bir tekshirib 5-o'rindagi elementga yetish", difficulty: "Oson" },
    { variant: 1, title: "Binary search, 8 element", hint: "Har qadam qolgan variantlarni yarmiga qisqartiradi", difficulty: "Oson" },
    { variant: 2, title: "Binary search, 16 element", hint: "16 element uchun qadam soni 4 dan oshmaydi", difficulty: "O'rta" },
    { variant: 3, title: "Chiziqli qidiruv, eng yomon holat", hint: "Kerakli element eng oxirida turganda", difficulty: "O'rta" },
    { variant: 4, title: "Chiziqli qidiruv, eng yaxshi holat", hint: "Element boshida bo'lsa — O(N) baribir eng yomon holat bahosi", difficulty: "O'rta" },
    { variant: 5, title: "Binary search o'rtaga tushdi", hint: "Ba'zan omadli, lekin kafolati 3 qadam", difficulty: "O'rta" },
    { variant: 6, title: "Binary search, eng chapdagi element", hint: "12 element, kerakli son esa eng boshida", difficulty: "Qiyin" },
    { variant: 7, title: "Chiziqli qidiruv, qisqa ro'yxat", hint: "4 element — qisqa ro'yxatda farq sezilmaydi", difficulty: "Oson" },
  ],
  Component: AlgoRaceGame,
};
