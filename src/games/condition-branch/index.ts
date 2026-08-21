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
  // In pool order: plain `agar` first, `aks holda` only once one branch is
  // solid. Watching children use the first version, two branches at once was
  // what lost them.
  puzzles: [
    { variant: 0, title: "Robot to'siq oldida signal beradi", hint: "Faqat `agar` — shart yolg'on bo'lsa hech narsa qilmaydi", difficulty: "Oson" },
    { variant: 1, title: "Batareya tejash rejimi", hint: "Chegarani aniq tanlash: 20% ning o'zi kam emas", difficulty: "Oson" },
    { variant: 2, title: "Xaridga chegirma", hint: "Bitta shart, bitta amal — ikkinchi tarmoq yo'q", difficulty: "O'rta" },
    { variant: 3, title: "Imtihondan o'tish", hint: "Birinchi `aks holda`: 50 ball ham o'tgan hisoblanadi", difficulty: "O'rta" },
    { variant: 4, title: "Robot to'siqni aylanib o'tadi", hint: "Ikkala tarmoq ham to'ldiriladi", difficulty: "O'rta" },
    { variant: 5, title: "Chiroq faqat kerak bo'lganda", hint: "Ikki shart birga — VA mantiqi", difficulty: "Qiyin" },
    { variant: 6, title: "Avtobus eshigi", hint: "Aynan 1700 so'm bo'lsa ham o'tkazish kerak", difficulty: "Qiyin" },
  ],
  Component: ConditionBranchGame,
};
