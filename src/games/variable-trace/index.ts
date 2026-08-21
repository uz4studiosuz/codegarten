import type { GameDefinition } from "../types";
import { VariableTraceGame } from "./VariableTraceGame";

export const variableTraceGame: GameDefinition = {
  id: "variable-trace",
  name: "Qutilardagi qiymatni kuzatish",
  description:
    "Dastur tugagach qutilarda qanday son, matn yoki mantiqiy qiymat qolishini oldindan aytish.",
  suits: ["exercise", "challenge", "review"],
  topics: ["variables"],
  keywords: [
    "o'zgaruvchi",
    "qiymat",
    "xotira",
    "quti",
    "almashtirish",
    "hisoblagich",
    "tur",
    "matn",
    "mantiqiy",
    "boolean",
    "rost",
  ],
  // In pool order, and the numeric puzzles deliberately keep their original
  // indices: reordering them would silently change which task the lessons that
  // already reach this game pose. Text and boolean puzzles are appended, and a
  // lesson gets one by naming it in its title (see the game's `prefer`).
  puzzles: [
    { variant: 0, title: "Qo'shish eski qiymatni oladi", hint: "Har qatorni yuqoridan pastga bajarib kuzatish", difficulty: "Oson" },
    { variant: 1, title: "Nusxa olish bog'lash emas", hint: "Yangi qiymat eskisini butunlay o'chiradi", difficulty: "Oson" },
    { variant: 2, title: "Ikki marta ko'paytirish", hint: "Hisoblagich o'zining eski qiymatiga tayanadi", difficulty: "Oson" },
    { variant: 3, title: "Vaqtinchalik quti", hint: "Uchinchi quti nima uchun kerak bo'lgan?", difficulty: "O'rta" },
    { variant: 4, title: "Bitta jarima ikki marta", hint: "Ayirish ham eski qiymatdan boshlanadi", difficulty: "Oson" },
    { variant: 5, title: "Nusxadan keyin yo'llar ajraladi", hint: "Ikki quti bir xil boshlanadi, keyin ajraladi", difficulty: "O'rta" },
    { variant: 6, title: "Ko'paytma o'sha paytda hisoblandi", hint: "Uchta quti, faqat bittasi oxirida o'zgaradi", difficulty: "O'rta" },
    { variant: 7, title: "Faqat oxirgi qiymat qoladi", hint: "Qiymat bir necha marta almashadi", difficulty: "Oson" },
    { variant: 8, title: "Matnni ulash", hint: "Qutida son emas, matn turadi — + ulaydi", difficulty: "Oson" },
    { variant: 9, title: "Matnli nusxa, o'zgargan asl", hint: "Yangi matn eskisini xuddi shunday o'chiradi", difficulty: "O'rta" },
    { variant: 10, title: "Bitta + , ikki xil ish", hint: "Ikki qutida ham + bor, lekin bir xil ish qilmaydi", difficulty: "O'rta" },
    { variant: 11, title: "Taqqoslash natijasi saqlanadi", hint: "Rost yoki yolg'on ham qutida turadi", difficulty: "O'rta" },
    { variant: 12, title: "EMAS bir marta ishlaydi", hint: "EMAS teskarilaydi — lekin qachon?", difficulty: "Qiyin" },
    { variant: 13, title: "Shart tekshirilgan payt", hint: "Shart tekshirilgandan keyin son o'zgaradi", difficulty: "Qiyin" },
    { variant: 14, title: "Nusxa, ulash va taqqoslash", hint: "Uchta g'oya bitta dasturda", difficulty: "Qiyin" },
  ],
  Component: VariableTraceGame,
};
