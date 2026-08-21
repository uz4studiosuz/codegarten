import type { GameDefinition } from "../types";
import { LoopRepeatGame } from "./LoopRepeatGame";

export const loopRepeatGame: GameDefinition = {
  id: "loop-repeat",
  name: "Sikl bilan naqsh yasash",
  description:
    "Sikl tanasini yig'ib, hisoblagich yoki to'xtash sharti bilan naqshni qayta yaratish.",
  suits: ["exercise", "challenge", "review"],
  topics: ["loops"],
  keywords: [
    "sikl",
    "naqsh",
    "takror",
    "loop",
    "repeat",
    "hisoblagich",
    "zinapoya",
    "toki",
  ],
  // In pool order: four colour strips to get "repeat a block" across, then the
  // counter puzzles a fixed body cannot fake, then `toki`. The strip pool used to
  // hold ten near-duplicates, which meant nobody ever reached a counter puzzle.
  puzzles: [
    { variant: 0, title: "Bitta rang, besh katak", hint: "Eng qisqa bo'lak bir katakdan iborat bo'lishi ham mumkin", difficulty: "Oson" },
    { variant: 1, title: "Yashil-binafsha zanjiri", hint: "Takrorlanadigan eng qisqa bo'lakni sikl ichiga yozish", difficulty: "Oson" },
    { variant: 2, title: "Sariq-ko'k juftligi", hint: "Ikki katakli naqsh uch marta qaytariladi", difficulty: "Oson" },
    { variant: 3, title: "Uch rangli bo'lak", hint: "Uch rang ketma-ket kelib, yana boshidan takrorlanadi", difficulty: "Oson" },
    { variant: 4, title: "Zinapoya — chiz_chiziq(i)", hint: "Har qator boshqa uzunlikda: aniq son yozilsa hammasi bir xil chiqadi", difficulty: "O'rta" },
    { variant: 5, title: "Teskari zinapoya — 5 - i", hint: "Hisoblagich oshadi, qatorlar esa qisqaradi", difficulty: "O'rta" },
    { variant: 6, title: "Rangla, keyin chiz", hint: "Qatorlar yuqoridan pastga bajariladi — tartib natijaga ta'sir qiladi", difficulty: "O'rta" },
    { variant: 7, title: "Ikkitalab o'sish — i * 2", hint: "Qatorlar 2 talab oshadi, hisoblagich esa bittalab", difficulty: "Qiyin" },
    { variant: 8, title: "toki i <= 4", hint: "Sikl shart rost bo'lgan vaqtda aylanadi", difficulty: "O'rta" },
    { variant: 9, title: "Teskari sanoq — toki i > 1", hint: "Hisoblagich kamayadi: shart qaysi qiymatda yolg'on bo'ladi?", difficulty: "Qiyin" },
    { variant: 10, title: "Ikkitalab qadam — toki i < 6", hint: "Hisoblagich ikkitalab oshgani uchun ba'zi qiymatlarni bosib o'tmaydi", difficulty: "Qiyin" },
  ],
  Component: LoopRepeatGame,
};
