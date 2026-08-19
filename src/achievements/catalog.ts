import type { Achievement } from "./types";

/**
 * The achievement catalog
 * ----------------------
 * Pure data. Every entry is a milestone a learner can see coming: the metric is
 * always something the dashboard already shows, so a locked badge doubles as a
 * hint about what to do next.
 *
 * Order matters only for display — grouped by theme, easiest first inside each
 * group.
 */
export const ACHIEVEMENTS: Achievement[] = [
  // ── Boshlash ──────────────────────────────────────────────────────────────
  {
    id: "first-step",
    name: "Birinchi qadam",
    description: "Birinchi darsni yakunlang",
    icon: "🎯",
    group: "boshlash",
    metric: (s) => s.completedLessons,
    goal: 1,
    unit: "dars",
    celebration:
      "Eng qiyini — boshlash. Birinchi dars yakunlandi, endi yo'l ochiq.",
  },
  {
    id: "five-lessons",
    name: "Sur'at",
    description: "5 ta darsni yakunlang",
    icon: "🧩",
    group: "boshlash",
    metric: (s) => s.completedLessons,
    goal: 5,
    unit: "dars",
    celebration: "5 dars ortda qoldi. Endi bu tasodif emas — bu odat boshlanishi.",
  },
  {
    id: "first-level",
    name: "Bosqich egasi",
    description: "Bitta bosqichni to'liq yakunlang",
    icon: "🪜",
    group: "boshlash",
    metric: (s) => s.completedLevels,
    goal: 1,
    unit: "bosqich",
    celebration:
      "Butun bir bosqich yakunlandi — mavzuni bo'lak-bo'lak o'zlashtirish shunday ishlaydi.",
  },

  // ── Izchillik ─────────────────────────────────────────────────────────────
  {
    id: "streak-3",
    name: "Uch kun ketma-ket",
    description: "Ketma-ket 3 kun dars qiling",
    icon: "⚡",
    group: "izchillik",
    metric: (s) => s.streak,
    goal: 3,
    unit: "kun",
    celebration:
      "Uch kun ketma-ket. Har kuni ozgina — bu haftada bir marta ko'p o'qishdan kuchli.",
  },
  {
    id: "streak-7",
    name: "Bir haftalik zanjir",
    description: "Ketma-ket 7 kun dars qiling",
    icon: "🔥",
    group: "izchillik",
    metric: (s) => s.streak,
    goal: 7,
    unit: "kun",
    celebration: "Yetti kunlik zanjir! Miya takrorlanadigan ritmni yaxshi eslab qoladi.",
  },
  {
    id: "active-10",
    name: "O'n kunlik yo'l",
    description: "10 kun faol bo'ling",
    icon: "📅",
    group: "izchillik",
    metric: (s) => s.activeDays,
    goal: 10,
    unit: "kun",
    celebration: "10 faol kun. Zanjir uzilsa ham, yo'l davom etyapti — asosiysi shu.",
  },

  // ── Mahorat ───────────────────────────────────────────────────────────────
  {
    id: "xp-100",
    name: "Yuzlik",
    description: "100 XP to'plang",
    icon: "🏅",
    group: "mahorat",
    metric: (s) => s.xp,
    goal: 100,
    unit: "XP",
    celebration: "100 XP — mashqlar va sinovlardan yig'ilgan haqiqiy natija.",
  },
  {
    id: "xp-500",
    name: "Besh yuzlik",
    description: "500 XP to'plang",
    icon: "💎",
    group: "mahorat",
    metric: (s) => s.xp,
    goal: 500,
    unit: "XP",
    celebration: "500 XP. Bu yerga faqat izchil ishlaganlar yetib keladi.",
  },
  {
    id: "first-module",
    name: "Modul yakuni",
    description: "Bitta modulni to'liq yakunlang",
    icon: "🏆",
    group: "mahorat",
    metric: (s) => s.completedModules,
    goal: 1,
    unit: "modul",
    celebration:
      "Butun modul yakunlandi — bu mavzuni endi nazariy emas, amaliy bilasiz.",
  },
  {
    id: "three-modules",
    name: "Uch modul",
    description: "3 modulni to'liq yakunlang",
    icon: "🧠",
    group: "mahorat",
    metric: (s) => s.completedModules,
    goal: 3,
    unit: "modul",
    celebration:
      "Uch modul: ketma-ketlik, sikl va funksiya — dasturlashning uchta ustuni.",
  },

  // ── Chuqurlik ─────────────────────────────────────────────────────────────
  {
    id: "vocab-10",
    name: "Lug'at yig'uvchi",
    description: "Lug'atga 10 atama saqlang",
    icon: "📚",
    group: "chuqurlik",
    metric: (s) => s.savedTerms,
    goal: 10,
    unit: "atama",
    celebration:
      "10 atama saqlandi. Inglizcha atamalarni bilish — hujjatlarni o'qish kaliti.",
  },
  {
    id: "track-half",
    name: "Yarim yo'l",
    description: "Yo'nalishning yarmini yakunlang",
    icon: "🚀",
    group: "chuqurlik",
    metric: (s) => s.trackPercent,
    goal: 50,
    unit: "%",
    celebration: "Yo'nalishning yarmi ortda. Qolgan yarmi endi ancha oson keladi.",
  },
];

export const ACHIEVEMENT_COUNT = ACHIEVEMENTS.length;

export function findAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
