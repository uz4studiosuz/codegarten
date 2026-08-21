import type { GameDefinition } from "../types";
import { DebugExtraGame } from "./DebugExtraGame";

export const debugExtraGame: GameDefinition = {
  id: "debug-extra",
  name: "Xato qatorni topish va tuzatish",
  description:
    "Qisqa dasturni maqsad bilan solishtirib, buzuq qatorni topish va uni to'g'ri qatorga almashtirish.",
  suits: ["exercise", "challenge", "review"],
  topics: ["debugging"],
  keywords: [
    "xato",
    "ortiqcha",
    "debug",
    "tuzat",
    "cheksiz",
    "topish",
    "chegara",
    "taqqoslash",
    "chekinish",
    "joyda",
  ],
  // In pool order: nine "which line breaks it" puzzles, then five where the line
  // has to be replaced rather than removed. Real debugging is more often changing
  // one symbol, and the debugging module's level 2 teaches exactly the three bug
  // kinds puzzles 9-11 rehearse.
  puzzles: [
    { variant: 0, title: "Ortiqcha burilish", hint: "Har qatorni maqsad bilan solishtirib o'qish", difficulty: "Oson" },
    { variant: 1, title: "Sikl umuman ishlamadi", hint: "Boshlang'ich qiymat necha aylanishni belgilaydi", difficulty: "O'rta" },
    { variant: 2, title: "Chiqarish sikldan tashqarida", hint: "Chiqarish buyrug'i sikl ichida turishi kerak", difficulty: "O'rta" },
    { variant: 3, title: "Kvadrat yopilmadi", hint: "Kvadratda 4 tomon va 4 burilish bo'ladi", difficulty: "Oson" },
    { variant: 4, title: "Yuza qo'shish bilan", hint: "Yuza — tomonni tomonga ko'paytirish", difficulty: "Oson" },
    { variant: 5, title: "Ortiqcha tomon", hint: "Uchburchakda uchta tomon bo'ladi", difficulty: "Oson" },
    { variant: 6, title: "Tenglik solishtirish emas", hint: "Tenglik va solishtirish — ikki xil amal", difficulty: "O'rta" },
    { variant: 7, title: "Almashtirishda yo'qolgan qiymat", hint: "Yangi qiymat eskisini o'chiradi", difficulty: "Qiyin" },
    { variant: 8, title: "Cheksiz sikl", hint: "Hisoblagich o'zgarmasa shart yolg'on bo'lmaydi", difficulty: "Qiyin" },
    { variant: 9, title: "Chegaradagi 18 — tuzatish", hint: "Chegaradagi qiymatni, aynan 18 ni tekshirib ko'rish", difficulty: "O'rta" },
    { variant: 10, title: "Bir marta kam aylandi — tuzatish", hint: "Siklning birinchi va oxirgi qiymatini yozib chiqish", difficulty: "O'rta" },
    { variant: 11, title: "Chekinish bir daraja kam — tuzatish", hint: "Chekinish qator qaysi blok ichida turganini bildiradi", difficulty: "Qiyin" },
    { variant: 12, title: "Almashtirish yarim qoldi — tuzatish", hint: "vaqt qutisida nima turganini har qatordan keyin yozish", difficulty: "Qiyin" },
    { variant: 13, title: "Taqqoslash teskari — tuzatish", hint: "Shart qachon rost bo'lishi kerak?", difficulty: "O'rta" },
  ],
  Component: DebugExtraGame,
};
