import type { GameDefinition } from "../types";
import { RobotGridGame } from "./RobotGridGame";

export const robotGridGame: GameDefinition = {
  id: "robot-grid",
  name: "Robotni boshqarish",
  description:
    "Buyruq bloklarini sudrab qatorlarga terib, robotni devorlarni aylanib yulduzga olib borish.",
  suits: ["exercise", "challenge"],
  topics: ["sequencing"],
  // "to'siq" is deliberately absent: it would pull the conditionals lesson
  // "Robot to'siqdan o'tadi" away from the game that teaches `agar`.
  keywords: [
    "robot",
    "labirint",
    "yo'l",
    "boshqar",
    "harakat",
    "buyruq",
    "katak",
    "devor",
  ],
  // In pool order. The first two boards are an empty grid, because a first
  // program should be about counting steps; walls arrive from index 2 so the
  // handful of lessons that reach this game actually meet one.
  puzzles: [
    { variant: 0, title: "To'g'ri chiziq", hint: "Burilish kerak emas — qadamlarni sanash yetarli (3 buyruq)", difficulty: "Oson" },
    { variant: 1, title: "Bitta burilish", hint: "Burilish robotni aylantiradi, joyidan qo'zg'atmaydi (4 buyruq)", difficulty: "Oson" },
    { variant: 2, title: "Devor oldida", hint: "Devorga urilsa dastur to'xtaydi — chetlab o'tish kerak (5 buyruq)", difficulty: "O'rta" },
    { variant: 3, title: "Yonma-yon, lekin devor orada", hint: "Aylanib o'tish uchun ikki marta burilish kerak (6 buyruq)", difficulty: "O'rta" },
    { variant: 4, title: "Ikki tomonga yurish", hint: "Orada bir marta burilish bo'ladi (6 buyruq)", difficulty: "O'rta" },
    { variant: 5, title: "Ikki devor, 5x5", hint: "O'ng tomon to'silgan — boshqa tomondan aylanib chiqish (6 buyruq)", difficulty: "Qiyin" },
    { variant: 6, title: "Chapga burilish", hint: "Robot yuqoriga qaragan: chapga burilsa qayerga yuradi? (4 buyruq)", difficulty: "Oson" },
    { variant: 7, title: "Ikki devor, uzun yo'l", hint: "Qisqa aylanma yo'l ham to'silgan (7 buyruq)", difficulty: "Qiyin" },
    { variant: 8, title: "Katta maydon", hint: "Avval yo'nalish, keyin qadam (6 buyruq)", difficulty: "O'rta" },
    { variant: 9, title: "Pastga qarab", hint: "Kerakli tomonga qaysi burilish olib boradi? (4 buyruq)", difficulty: "O'rta" },
  ],
  Component: RobotGridGame,
};
