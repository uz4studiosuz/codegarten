import type { GameDefinition } from "../types";
import { ListWalkGame } from "./ListWalkGame";

export const listWalkGame: GameDefinition = {
  id: "list-walk",
  name: "Ro'yxat bo'ylab yurish",
  description:
    "Indeks bilan katakni topish, sikl natijasini oldindan aytish va aylanish tanasini yig'ish.",
  suits: ["exercise", "challenge", "review"],
  // Four of the puzzles genuinely walk a loop, but declaring "loops" here would
  // tie this game with loop-repeat on the loops module and steal its lessons.
  topics: ["lists"],
  keywords: [
    "ro'yxat",
    "royxat",
    "list",
    "array",
    "massiv",
    "indeks",
    "index",
    "element",
    "to'plam",
    "uzunlik",
    "chegara",
  ],
  // In pool order: point at a cell, then predict a walk, then build the body.
  // Reading an index comes first because every later puzzle leans on it.
  puzzles: [
    { variant: 0, title: "ranglar[0] — qaysi katak?", hint: "Har katak ostida indeksi yozilgan, sanoq 0 dan boshlanadi", difficulty: "Oson" },
    { variant: 1, title: "40 soni qaysi indeksda?", hint: "Indeks tartib raqamdan bitta kam bo'ladi", difficulty: "Oson" },
    { variant: 2, title: "Chegaradan chiqib ketish", hint: "sonlar[uzunlik(sonlar)] — punktir katak ro'yxatdan tashqarida", difficulty: "O'rta" },
    { variant: 3, title: "Sikl natijasini oldindan aytish", hint: "chiqar(son * 2) har element uchun nima chiqaradi", difficulty: "O'rta" },
    { variant: 4, title: "qo'sh, keyin o'chir", hint: "Ikki amalni birma-bir bajarib, oxirgi ro'yxatni aytish", difficulty: "O'rta" },
    { variant: 5, title: "O'chirishdan keyingi uzunlik", hint: "Uzunlik o'zgargach to'g'ri indekslar oralig'i ham o'zgaradi", difficulty: "O'rta" },
    { variant: 6, title: "Yig'indini to'plash", hint: "jami 0 dan boshlanadi va har aylanishda o'sadi", difficulty: "O'rta" },
    { variant: 7, title: "60 dan yuqori ballarni sanash", hint: "Shart ichidagi qator faqat shart rost bo'lganda bajariladi", difficulty: "Qiyin" },
    { variant: 8, title: "Eng katta qiymatni topish", hint: "Shart hozirgi saqlangan qiymatdan kattaroq bo'lganda rost", difficulty: "Qiyin" },
    { variant: 9, title: "Bir aylanishda ikki natija", hint: "Sikldagi qator har element uchun, agar ichidagisi faqat shartda", difficulty: "Qiyin" },
  ],
  Component: ListWalkGame,
};
