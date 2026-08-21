import type { GameDefinition } from "../types";
import { FunctionFactoryGame } from "./FunctionFactoryGame";

export const functionFactoryGame: GameDefinition = {
  id: "function-factory",
  name: "Funksiya tanasini yozish",
  description:
    "Funksiya tanasini o'zi yig'ib, bitta tananing barcha chaqiruvlarda ishlashini sinash.",
  suits: ["exercise", "challenge", "review"],
  topics: ["functions"],
  keywords: ["funksiya", "parametr", "argument", "chaqir", "return", "modul", "qora quti"],
  // In pool order. The board draws before it computes: a body that draws is
  // easier to read than one that returns, so `return` arrives only once a body
  // built from parameters is solid.
  puzzles: [
    { variant: 0, title: "Bitta parametr, bitta qator", hint: "Uchta chaqiruvga ham yaraydigan qatorni tanlash", difficulty: "Oson" },
    { variant: 1, title: "Ikki parametr, ikki qator", hint: "Rang bo'yaydi, uzunlik chizadi — tartib muhim", difficulty: "Oson" },
    { variant: 2, title: "Aniq son tuzoq bo'ladi", hint: "Ikki chaqiruvga to'g'ri kelib, uchinchisida buziladi", difficulty: "O'rta" },
    { variant: 3, title: "Aniq rang tuzoq bo'ladi", hint: "Rang parametrini aniq rang bilan almashtirish xatosi", difficulty: "O'rta" },
    { variant: 4, title: "return — birinchi tanishuv", hint: "Natija rasm emas, son. Uni tashqariga return chiqaradi", difficulty: "O'rta" },
    { variant: 5, title: "Ikki argument bitta natijada", hint: "Ikkalasi ham hisobga qatnashishi kerak", difficulty: "O'rta" },
    { variant: 6, title: "Avval hisobla, keyin qaytar", hint: "Ikki qator: natijani yozish va uni uzatish", difficulty: "Qiyin" },
    { variant: 7, title: "Bitta chaqiruv adashtiradi", hint: "Bir dona olinganda narx bahoga teng bo'lib qoladi", difficulty: "Qiyin" },
  ],
  Component: FunctionFactoryGame,
};
