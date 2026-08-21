import type { GameDefinition } from "../types";
import { SequenceOrderGame } from "./SequenceOrderGame";

export const sequenceOrderGame: GameDefinition = {
  id: "sequence-order",
  name: "Qadamlarni tartibga solish",
  description: "Aralashib ketgan qadamlarni to'g'ri ketma-ketlikda terib chiqish.",
  suits: ["exercise", "challenge", "review"],
  topics: ["sequencing"],
  keywords: ["ketma-ketlik", "tartib", "qadam", "algoritm", "sequence", "buyruq"],
  // In pool order: two everyday sequences to get the idea across, then the rest
  // from computing, because a third round of household chores reads as a
  // preschool card game rather than as programming.
  puzzles: [
    { variant: 0, title: "Velosipedda yo'lga chiqish", hint: "Xavfsizlik qadamlari yurishdan oldin (4 qadam)", difficulty: "Oson" },
    { variant: 1, title: "Choy damlash", hint: "Kompyuter yozilgan tartibda bajaradi (5 qadam)", difficulty: "Oson" },
    { variant: 2, title: "Fayl bilan ishlash", hint: "Och, o'qi, o'zgartir, saqla, yop (5 qadam)", difficulty: "Oson" },
    { variant: 3, title: "Xatoni tuzatish sikli", hint: "Xato dasturni ishga tushirmaguncha ko'rinmaydi (5 qadam)", difficulty: "O'rta" },
    { variant: 4, title: "Server so'rovga javob beradi", hint: "Ma'lumot faqat tekshiruvdan keyin beriladi (4 qadam)", difficulty: "O'rta" },
    { variant: 5, title: "Kodni loyihaga qo'shish", hint: "Testdan o'tmagan kod boshqalarni buzadi (4 qadam)", difficulty: "O'rta" },
    { variant: 6, title: "Eng katta sonni topish", hint: "Avval \"hozircha eng katta\" ni olish kerak (5 qadam)", difficulty: "Qiyin" },
    { variant: 7, title: "Ikki qiymatni almashtirish", hint: "Vaqtinchalik quti nima uchun kerak (4 qadam)", difficulty: "Qiyin" },
  ],
  Component: SequenceOrderGame,
};
