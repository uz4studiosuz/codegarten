/**
 * Codegarten curriculum
 * ---------------------
 * The single source of truth for course content: a track holds modules, a
 * module holds levels, and a level holds lessons. Progress, XP and unlocking
 * are all derived from this shape (see ProgressContext), never stored here.
 */

export type LessonKind = "concept" | "exercise" | "challenge" | "review";

export interface Lesson {
  id: string;
  title: string;
  kind: LessonKind;
  /** Awarded once, the first time the lesson is completed. */
  xp: number;
  estMinutes: number;
  /** Which interactive challenge to load. Falls back to a rotation when absent. */
  challengeId?: string;
}

export interface Level {
  id: string;
  num: number;
  title: string;
  summary: string;
  lessons: Lesson[];
}

export interface CourseModule {
  id: string;
  num: number;
  title: string;
  titleEn: string;
  description: string;
  /** Short blurb used on catalog cards. */
  tagline: string;
  imageSrc: string;
  accent: string;
  levels: Level[];
}

export interface Track {
  id: string;
  category: "ASOSIY BOSQICH" | "O'RTA BOSQICH" | "MAXSUS BOSQICH";
  title: string;
  titleEn: string;
  description: string;
  colorTheme: string;
  /** Tracks without modules render as "Tez kunda" teasers. */
  modules: CourseModule[];
}

// ── Lesson shorthand ────────────────────────────────────────────────────────

const XP: Record<LessonKind, number> = {
  concept: 10,
  exercise: 15,
  challenge: 25,
  review: 30,
};

const MINUTES: Record<LessonKind, number> = {
  concept: 3,
  exercise: 5,
  challenge: 8,
  review: 10,
};

/** Compact lesson constructor — keeps the curriculum below readable. */
const L = (id: string, title: string, kind: LessonKind): Lesson => ({
  id,
  title,
  kind,
  xp: XP[kind],
  estMinutes: MINUTES[kind],
});

// ── Track 1: Dasturiy Tafakkur & Algoritmlar ────────────────────────────────

const MODULE_SEQUENCING: CourseModule = {
  id: "mod-1",
  num: 1,
  title: "Buyruqlar va Ketma-ketlik",
  titleEn: "Commands & Sequencing",
  description:
    "Kompyuterga aniq ko'rsatmalar berish va ketma-ket ijro mantiqini o'zlashtirish.",
  tagline: "Kompyuter til topishishni o'rganamiz",
  imageSrc: "/images/sequences.png",
  accent: "#22C55E",
  levels: [
    {
      id: "m1-l1",
      num: 1,
      title: "Birinchi buyruqlar",
      summary: "Kompyuter faqat aytilgan ishni bajaradi — na ko'p, na kam.",
      lessons: [
        L("m1-l1-1", "Kompyuter nimani tushunadi?", "concept"),
        L("m1-l1-2", "Birinchi buyrug'ingiz", "exercise"),
        L("m1-l1-3", "Buyruqlar tartibi", "exercise"),
        L("m1-l1-4", "Xatoni topish", "challenge"),
        L("m1-l1-5", "Bosqich takrori", "review"),
      ],
    },
    {
      id: "m1-l2",
      num: 2,
      title: "Ketma-ketlik mantiqi",
      summary: "Katta vazifani mayda, bajarilishi mumkin qadamlarga bo'lish.",
      lessons: [
        L("m1-l2-1", "Qadamlarga bo'lish", "concept"),
        L("m1-l2-2", "Robotni boshqarish", "exercise"),
        L("m1-l2-3", "Ortiqcha qadamni olib tashlash", "exercise"),
        L("m1-l2-4", "Labirintdan chiqish", "challenge"),
        L("m1-l2-5", "Bosqich takrori", "review"),
      ],
    },
    {
      id: "m1-l3",
      num: 3,
      title: "Algoritm tushunchasi",
      summary: "Har qanday aniq ko'rsatmalar to'plami — bu algoritm.",
      lessons: [
        L("m1-l3-1", "Algoritm nima?", "concept"),
        L("m1-l3-2", "Kundalik algoritmlar", "exercise"),
        L("m1-l3-3", "Eng qisqa yo'l", "challenge"),
        L("m1-l3-4", "Bosqich takrori", "review"),
      ],
    },
  ],
};

const MODULE_LOOPS: CourseModule = {
  id: "mod-2",
  num: 2,
  title: "Sikllar (Loops)",
  titleEn: "Loops & Pattern Recognition",
  description:
    "Kodning qaytarilishini optimallashtirish va takroriy naqshlarni avtomatlashtirish.",
  tagline: "Bir marta yoz, yuz marta ishlat",
  imageSrc: "/images/loops.png",
  accent: "#22C55E",
  levels: [
    {
      id: "m2-l1",
      num: 1,
      title: "Takrorlanuvchi naqshlar",
      summary: "Bir xil kodni ko'chirib yozish o'rniga naqshni ko'rishni o'rganamiz.",
      lessons: [
        L("m2-l1-1", "Naqshni sezish", "concept"),
        L("m2-l1-2", "Bir xil buyruqlar", "exercise"),
        L("m2-l1-3", "repeat blokini ishlatish", "exercise"),
        L("m2-l1-4", "Kvadrat chizish", "challenge"),
        L("m2-l1-5", "Bosqich takrori", "review"),
      ],
    },
    {
      id: "m2-l2",
      num: 2,
      title: "Sikl hisoblagichi",
      summary: "Sikl necha marta aylanadi va hisoblagich qanday o'zgaradi.",
      lessons: [
        L("m2-l2-1", "Hisoblagich nima?", "concept"),
        L("m2-l2-2", "Sikl chegaralari", "exercise"),
        L("m2-l2-3", "Ranglarni almashtirish", "exercise"),
        L("m2-l2-4", "Zinapoya naqshi", "challenge"),
        L("m2-l2-5", "Bosqich takrori", "review"),
      ],
    },
    {
      id: "m2-l3",
      num: 3,
      title: "Ichma-ich sikllar",
      summary: "Sikl ichidagi sikl — jadval va maydonlarni to'ldirish kaliti.",
      lessons: [
        L("m2-l3-1", "Sikl ichida sikl", "concept"),
        L("m2-l3-2", "Shaxmat taxtasi", "exercise"),
        L("m2-l3-3", "Cheksiz sikldan qochish", "exercise"),
        L("m2-l3-4", "Naqsh generatori", "challenge"),
        L("m2-l3-5", "Bosqich takrori", "review"),
      ],
    },
  ],
};

const MODULE_FUNCTIONS: CourseModule = {
  id: "mod-3",
  num: 3,
  title: "Funksiyalar va Modullik",
  titleEn: "Functions & Modular Code",
  description:
    "Kodni qayta ishlatish, parametrlar uzatish va toza arxitektura tuzish.",
  tagline: "Kodni bo'lakla, nomla, qayta ishlat",
  imageSrc: "/images/functions.png",
  accent: "#EC4899",
  levels: [
    {
      id: "m3-l1",
      num: 1,
      title: "Qora quti tamoyili",
      summary: "Ichida nima bo'layotganini bilmasdan ishlatish mumkin bo'lgan blok.",
      lessons: [
        L("m3-l1-1", "Funksiya nima?", "concept"),
        L("m3-l1-2", "Birinchi funksiya", "exercise"),
        L("m3-l1-3", "Funksiyani chaqirish", "exercise"),
        L("m3-l1-4", "Takrorni funksiyaga yig'ish", "challenge"),
        L("m3-l1-5", "Bosqich takrori", "review"),
      ],
    },
    {
      id: "m3-l2",
      num: 2,
      title: "Parametrlar",
      summary: "Bir funksiya — turli natijalar. Parametr shuni ta'minlaydi.",
      lessons: [
        L("m3-l2-1", "Parametr tushunchasi", "concept"),
        L("m3-l2-2", "Parametrli chizish", "exercise"),
        L("m3-l2-3", "Bir nechta parametr", "exercise"),
        L("m3-l2-4", "Universal shakl chizuvchi", "challenge"),
        L("m3-l2-5", "Bosqich takrori", "review"),
      ],
    },
    {
      id: "m3-l3",
      num: 3,
      title: "Qaytariladigan qiymat",
      summary: "Funksiya nafaqat ish bajaradi, balki javob ham qaytaradi.",
      lessons: [
        L("m3-l3-1", "return nima qiladi?", "concept"),
        L("m3-l3-2", "Hisoblovchi funksiya", "exercise"),
        L("m3-l3-3", "Funksiyalarni birlashtirish", "challenge"),
        L("m3-l3-4", "Bosqich takrori", "review"),
      ],
    },
  ],
};

const MODULE_CONDITIONALS: CourseModule = {
  id: "mod-4",
  num: 4,
  title: "Shartlar va Mantiqiy Tarmoqlar",
  titleEn: "Conditionals & Boolean Logic",
  description:
    "If/Else mantiqiy qarorlar qabul qilish va tarmoqlanuvchi dasturlar yozish.",
  tagline: "Dastur qanday qaror qabul qiladi",
  imageSrc: "/images/sequences.png",
  accent: "#F59E0B",
  levels: [
    {
      id: "m4-l1",
      num: 1,
      title: "To'g'ri yoki Yolg'on",
      summary: "Kompyuter dunyosida har savolning javobi rost yoki yolg'on.",
      lessons: [
        L("m4-l1-1", "Mantiqiy qiymatlar", "concept"),
        L("m4-l1-2", "Taqqoslash amallari", "exercise"),
        L("m4-l1-3", "Shart tuzish", "exercise"),
        L("m4-l1-4", "Bosqich takrori", "review"),
      ],
    },
    {
      id: "m4-l2",
      num: 2,
      title: "if va else",
      summary: "Yo'l ikkiga ajralganda dastur qaysi tomonga buriladi.",
      lessons: [
        L("m4-l2-1", "Tarmoqlanish", "concept"),
        L("m4-l2-2", "if bloki", "exercise"),
        L("m4-l2-3", "else bilan tanlov", "exercise"),
        L("m4-l2-4", "Robot to'siqdan o'tadi", "challenge"),
        L("m4-l2-5", "Bosqich takrori", "review"),
      ],
    },
    {
      id: "m4-l3",
      num: 3,
      title: "Murakkab shartlar",
      summary: "Bir nechta shartni VA / YOKI orqali birlashtirish.",
      lessons: [
        L("m4-l3-1", "VA / YOKI mantiqi", "concept"),
        L("m4-l3-2", "Ko'p shartli tanlov", "exercise"),
        L("m4-l3-3", "Qaror daraxti", "challenge"),
        L("m4-l3-4", "Bosqich takrori", "review"),
      ],
    },
  ],
};

const MODULE_VARIABLES: CourseModule = {
  id: "mod-5",
  num: 5,
  title: "O'zgaruvchilar va Xotira",
  titleEn: "Variables & Memory Storage",
  description:
    "Ma'lumotlarni xotirada saqlash, o'zgartirish va ularga murojaat qilish.",
  tagline: "Ma'lumot qayerda yashaydi",
  imageSrc: "/images/loops.png",
  accent: "#3B82F6",
  levels: [
    {
      id: "m5-l1",
      num: 1,
      title: "Xotira qutilari",
      summary: "Nomlangan quti — qiymatni saqlash va keyin topishning yo'li.",
      lessons: [
        L("m5-l1-1", "O'zgaruvchi nima?", "concept"),
        L("m5-l1-2", "Qiymat berish", "exercise"),
        L("m5-l1-3", "O'zgaruvchini o'zgartirish", "exercise"),
        L("m5-l1-4", "Bosqich takrori", "review"),
      ],
    },
    {
      id: "m5-l2",
      num: 2,
      title: "Qiymatlar bilan ishlash",
      summary: "Son, matn va mantiqiy qiymatlar — har biri o'zicha tutadi.",
      lessons: [
        L("m5-l2-1", "Turlar: son va matn", "concept"),
        L("m5-l2-2", "Ikki qiymatni almashtirish", "exercise"),
        L("m5-l2-3", "Hisoblagich yasash", "exercise"),
        L("m5-l2-4", "Bosqich takrori", "review"),
      ],
    },
    {
      id: "m5-l3",
      num: 3,
      title: "Ro'yxatlar",
      summary: "Bitta nom ostida ko'p qiymatni saqlash va aylanib chiqish.",
      lessons: [
        L("m5-l3-1", "Ro'yxat tushunchasi", "concept"),
        L("m5-l3-2", "Elementga murojaat", "exercise"),
        L("m5-l3-3", "Ro'yxatni aylanib chiqish", "challenge"),
        L("m5-l3-4", "Bosqich takrori", "review"),
      ],
    },
  ],
};

const MODULE_COMPLEXITY: CourseModule = {
  id: "mod-6",
  num: 6,
  title: "Algoritmik Murakkablik",
  titleEn: "Algorithmic Efficiency & Big-O",
  description:
    "Tezkor va xotirani kam sarflovchi algoritmlarni tahlil qilish va tanlash.",
  tagline: "Nega bir kod tezroq ishlaydi",
  imageSrc: "/images/functions.png",
  accent: "#10B981",
  levels: [
    {
      id: "m6-l1",
      num: 1,
      title: "Tezlikni o'lchash",
      summary: "Algoritm tezligini soatda emas, qadamlar sonida o'lchaymiz.",
      lessons: [
        L("m6-l1-1", "Nima uchun tezlik muhim?", "concept"),
        L("m6-l1-2", "Qadamlarni sanash", "exercise"),
        L("m6-l1-3", "O(1) va O(N)", "exercise"),
        L("m6-l1-4", "Bosqich takrori", "review"),
      ],
    },
    {
      id: "m6-l2",
      num: 2,
      title: "Qidirish algoritmlari",
      summary: "Million elementdan keraklisini 20 qadamda topish mumkin.",
      lessons: [
        L("m6-l2-1", "Chiziqli qidiruv", "concept"),
        L("m6-l2-2", "Binary Search kuchi", "exercise"),
        L("m6-l2-3", "Qaysi tezroq?", "challenge"),
        L("m6-l2-4", "Bosqich takrori", "review"),
      ],
    },
    {
      id: "m6-l3",
      num: 3,
      title: "Saralash",
      summary: "Tartiblangan ma'lumot bilan ishlash necha barobar tezroq.",
      lessons: [
        L("m6-l3-1", "Saralash nima uchun kerak?", "concept"),
        L("m6-l3-2", "Bubble Sort", "exercise"),
        L("m6-l3-3", "Saralashni tanlash", "challenge"),
        L("m6-l3-4", "Bosqich takrori", "review"),
      ],
    },
  ],
};

export const foundationsTrack: Track = {
  id: "programming-cs-foundations",
  category: "ASOSIY BOSQICH",
  title: "Dasturiy Tafakkur & Algoritmlar",
  titleEn: "Thinking in Code & Computer Science",
  description: "Kompyuter mantiqi, algoritmik fikrlash va kod arxitekturasi poydevori.",
  colorTheme: "#22C55E",
  modules: [
    MODULE_SEQUENCING,
    MODULE_LOOPS,
    MODULE_FUNCTIONS,
    MODULE_CONDITIONALS,
    MODULE_VARIABLES,
    MODULE_COMPLEXITY,
  ],
};

export const upcomingTracks: Track[] = [
  {
    id: "data-analysis-path",
    category: "O'RTA BOSQICH",
    title: "Ma'lumotlar Tahlili va Python",
    titleEn: "Data Analysis & Python Logic",
    description: "Katta ma'lumotlar tahlili, grafiklar va statistik vizualizatsiya.",
    colorTheme: "#F59E0B",
    modules: [],
  },
  {
    id: "ai-neural-networks",
    category: "MAXSUS BOSQICH",
    title: "Sun'iy Intellekt va Neyron Tarmoqlar",
    titleEn: "How AI & Neural Networks Work",
    description:
      "Mashinaviy ta'lim, vaznlar, aktivatsiya funksiyalari va LLM larni chuqur tushunish.",
    colorTheme: "#EC4899",
    modules: [],
  },
];

export const allTracks: Track[] = [foundationsTrack, ...upcomingTracks];

// ── Lookups & traversal ─────────────────────────────────────────────────────

export interface LessonLocation {
  lesson: Lesson;
  level: Level;
  module: CourseModule;
  /** Position within the whole module, used for ordering and unlocking. */
  moduleIndex: number;
  /** Position within its level, used for the "3/5" step counter. */
  levelIndex: number;
}

export function getModule(moduleId: string): CourseModule | undefined {
  return foundationsTrack.modules.find((m) => m.id === moduleId);
}

/** Every lesson in a module, in the order a learner walks them. */
export function moduleLessons(module: CourseModule): LessonLocation[] {
  const out: LessonLocation[] = [];
  module.levels.forEach((level) => {
    level.lessons.forEach((lesson, levelIndex) => {
      out.push({ lesson, level, module, moduleIndex: out.length, levelIndex });
    });
  });
  return out;
}

export function findLesson(
  moduleId: string,
  lessonId: string
): LessonLocation | undefined {
  const module = getModule(moduleId);
  if (!module) return undefined;
  return moduleLessons(module).find((l) => l.lesson.id === lessonId);
}

/** The lesson immediately after this one, or undefined at the end of a module. */
export function nextLessonAfter(
  moduleId: string,
  lessonId: string
): LessonLocation | undefined {
  const module = getModule(moduleId);
  if (!module) return undefined;
  const all = moduleLessons(module);
  const idx = all.findIndex((l) => l.lesson.id === lessonId);
  if (idx === -1) return undefined;
  return all[idx + 1];
}

export function moduleStats(module: CourseModule) {
  const lessons = moduleLessons(module);
  return {
    lessonCount: lessons.length,
    exerciseCount: lessons.filter(
      (l) => l.lesson.kind === "exercise" || l.lesson.kind === "challenge"
    ).length,
    totalXp: lessons.reduce((sum, l) => sum + l.lesson.xp, 0),
    levelCount: module.levels.length,
  };
}

/**
 * Which interactive challenge a lesson opens. Authored content wins; until it
 * exists lessons rotate through the built-in challenges so every node is playable.
 */
const CHALLENGE_ROTATION = ["shape-color", "grid-walk"];

export function challengeIdFor(lesson: Lesson, moduleIndex: number): string {
  return lesson.challengeId ?? CHALLENGE_ROTATION[moduleIndex % CHALLENGE_ROTATION.length];
}
