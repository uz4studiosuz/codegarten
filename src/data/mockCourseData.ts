export interface DayActivity {
  dayName: string; // e.g. "D", "S", "Ch", "P", "J", "Sh", "Ya"
  dayShort: string; // e.g. "M", "T", "W", "T", "F", "S", "S"
  isCompleted: boolean;
  isToday?: boolean;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface UserProfileMock {
  name: string;
  email: string;
  avatarUrl?: string;
  streakDays: number;
  xpPoints: number;
  level: number;
  leagueName: string;
  leagueRank: number;
  weeklyActivity: DayActivity[];
  badges: UserBadge[];
}

export interface LessonStep {
  id: string;
  title: string;
  durationMin: number;
  status: "completed" | "active" | "locked";
  type: "concept" | "puzzle" | "code_challenge";
}

export interface CourseModule {
  id: string;
  moduleNumber: number;
  title: string;
  titleEn: string;
  description: string;
  level: string;
  progressPercent: number;
  status: "completed" | "active" | "locked";
  iconName: string;
  colorAccent: string;
  imageSrc?: string;
  steps: LessonStep[];
}

export interface LearningPath {
  id: string;
  category: "ASOSIY BOSQICH" | "O'RTA BOSQICH" | "MAXSUS BOSQICH";
  title: string;
  titleEn: string;
  description: string;
  overallProgressPercent: number;
  isStarred?: boolean;
  colorTheme: string;
  modules: CourseModule[];
}

// -------------------------------------------------------------
// USER & DASHBOARD MOCK DATA
// (You can easily edit and customize this data structure)
// -------------------------------------------------------------

export const mockUserProfile: UserProfileMock = {
  name: "Abdulloh",
  email: "abdulloh@codegarten.uz",
  streakDays: 2,
  xpPoints: 480,
  level: 1,
  leagueName: "Litiy Ligasi",
  leagueRank: 12,
  weeklyActivity: [
    { dayName: "D", dayShort: "M", isCompleted: true },
    { dayName: "S", dayShort: "T", isCompleted: true, isToday: true },
    { dayName: "Ch", dayShort: "W", isCompleted: false },
    { dayName: "P", dayShort: "T", isCompleted: false },
    { dayName: "J", dayShort: "F", isCompleted: false },
    { dayName: "Sh", dayShort: "S", isCompleted: false },
    { dayName: "Ya", dayShort: "S", isCompleted: false },
  ],
  badges: [
    {
      id: "badge-1",
      name: "Birinchi Qadam",
      description: "Birinchi darsni muvaffaqiyatli yakunladingiz",
      icon: "🎯",
      unlockedAt: "2026-08-15",
    },
    {
      id: "badge-2",
      name: "Mantiq Ustasi",
      description: "5 ta mantiqiy jumboqni xatosiz yechdingiz",
      icon: "🧩",
      unlockedAt: "2026-08-16",
    },
    {
      id: "badge-3",
      name: "2 Kunlik Strike",
      description: "Ketma-ket 2 kun davomida dars qildingiz",
      icon: "⚡",
      unlockedAt: "2026-08-17",
    },
  ],
};

// Main Foundational Learning Path ("Dasturlash va Kompyuter Fanlari")
export const foundationalLearningPath: LearningPath = {
  id: "programming-cs-foundations",
  category: "ASOSIY BOSQICH",
  title: "Dasturiy Tafakkur & Algoritmlar",
  titleEn: "Thinking in Code & Computer Science",
  description: "Kompyuter mantiqi, algoritmik fikrlash va kod arxitekturasi poydevori.",
  overallProgressPercent: 15,
  isStarred: true,
  colorTheme: "#22C55E",
  modules: [
    {
      id: "mod-1",
      moduleNumber: 1,
      title: "Buyruqlar va Ketma-ketlik",
      titleEn: "Commands & Sequencing",
      description: "Kompyuterga aniq ko'rsatmalar berish va ketma-ket ijro mantiqi.",
      level: "MODUL 1",
      progressPercent: 100,
      status: "completed",
      iconName: "terminal",
      colorAccent: "#22C55E",
      imageSrc: "/images/sequences.png",
      steps: [
        { id: "s1-1", title: "Qizdirish mashqi (Warm Up)", durationMin: 3, status: "completed", type: "concept" },
        { id: "s1-2", title: "Ko'rsatmalarni tartiblash", durationMin: 5, status: "completed", type: "puzzle" },
        { id: "s1-3", title: "Birinchi algoritm marshruti", durationMin: 6, status: "completed", type: "code_challenge" },
      ],
    },
    {
      id: "mod-2",
      moduleNumber: 2,
      title: "Sikllar (Loops)",
      titleEn: "Loops & Pattern Recognition",
      description: "Kodning qaytarilishini optimallashtirish va takroriy naqshlarni avtomatlashtirish.",
      level: "MODUL 1",
      progressPercent: 40,
      status: "active",
      iconName: "repeat",
      colorAccent: "#22C55E",
      imageSrc: "/images/loops.png",
      steps: [
        { id: "s2-1", title: "Naqshlarni aniqlash (Pattern Recognition)", durationMin: 4, status: "completed", type: "concept" },
        { id: "s2-2", title: "Sikllar bilan optimallash (While & For)", durationMin: 7, status: "active", type: "puzzle" },
        { id: "s2-3", title: "Cheksiz sikldan qochish", durationMin: 8, status: "locked", type: "code_challenge" },
      ],
    },
    {
      id: "mod-3",
      moduleNumber: 3,
      title: "Funksiyalar va Modullik",
      titleEn: "Functions & Modular Code",
      description: "Kodni qayta ishlatish, parametrlar uzatish va toza arxitektura.",
      level: "MODUL 2",
      progressPercent: 0,
      status: "locked",
      iconName: "boxes",
      colorAccent: "#EC4899",
      imageSrc: "/images/functions.png",
      steps: [
        { id: "s3-1", title: "Qora quti tamoyili", durationMin: 5, status: "locked", type: "concept" },
        { id: "s3-2", title: "Parametrli funksiyalar", durationMin: 8, status: "locked", type: "code_challenge" },
      ],
    },
    {
      id: "mod-4",
      moduleNumber: 4,
      title: "Shartlar va Mantiqiy Tarmoqlar",
      titleEn: "Conditionals & Boolean Logic",
      description: "If/Else mantiqiy qarorlar qabul qilish va tarmoqlanuvchi dasturlar.",
      level: "MODUL 2",
      progressPercent: 0,
      status: "locked",
      iconName: "git-branch",
      colorAccent: "#F59E0B",
      imageSrc: "/images/sequences.png",
      steps: [
        { id: "s4-1", title: "Mantiqiy ifodalar (True/False)", durationMin: 4, status: "locked", type: "concept" },
        { id: "s4-2", title: "Tarmoqlanuvchi algoritmlar", durationMin: 7, status: "locked", type: "puzzle" },
      ],
    },
    {
      id: "mod-5",
      moduleNumber: 5,
      title: "O'zgaruvchilar va Xotira",
      titleEn: "Variables & Memory Storage",
      description: "Ma'lumotlarni RAM xotirada saqlash, o'zgartirish va murojaat qilish.",
      level: "MODUL 3",
      progressPercent: 0,
      status: "locked",
      iconName: "database",
      colorAccent: "#3B82F6",
      imageSrc: "/images/loops.png",
      steps: [
        { id: "s5-1", title: "Xotira qutilari tushunchasi", durationMin: 5, status: "locked", type: "concept" },
        { id: "s5-2", title: "Qiymatlarni almashtirish", durationMin: 6, status: "locked", type: "puzzle" },
      ],
    },
    {
      id: "mod-6",
      moduleNumber: 6,
      title: "Algoritmik Murakkablik (Big-O)",
      titleEn: "Algorithmic Efficiency & Big-O",
      description: "Tezkor va xotirani kam sarflovchi algoritmlarni tahlil qilish.",
      level: "MODUL 3",
      progressPercent: 0,
      status: "locked",
      iconName: "zap",
      colorAccent: "#10B981",
      imageSrc: "/images/functions.png",
      steps: [
        { id: "s6-1", title: "Qidirish tezligi: O(1) vs O(N)", durationMin: 6, status: "locked", type: "concept" },
        { id: "s6-2", title: "Binary Search kuchi", durationMin: 9, status: "locked", type: "puzzle" },
      ],
    },
  ],
};

// Additional Secondary Paths for Courses Catalog
export const secondaryLearningPaths: LearningPath[] = [
  {
    id: "data-analysis-path",
    category: "O'RTA BOSQICH",
    title: "Ma'lumotlar Tahlili va Python",
    titleEn: "Data Analysis & Python Logic",
    description: "Katta ma'lumotlar tahlili, grafiklar va statistik vizualizatsiya.",
    overallProgressPercent: 0,
    colorTheme: "#F59E0B",
    modules: [
      {
        id: "da-1",
        moduleNumber: 1,
        title: "Python Asoslari va Matritsalar",
        titleEn: "Python Foundations",
        description: "Python sintaksisi va ma'lumotlar to'plamlari bilan ishlash.",
        level: "1-BOSQICH",
        progressPercent: 0,
        status: "locked",
        iconName: "table",
        colorAccent: "#F59E0B",
        steps: [],
      },
      {
        id: "da-2",
        moduleNumber: 2,
        title: "Statistik Hisob-kitoblar",
        titleEn: "Statistical Intuition",
        description: "Ehtimollar nazariyasi va ma'lumotlar taqsimoti.",
        level: "2-BOSQICH",
        progressPercent: 0,
        status: "locked",
        iconName: "bar-chart-2",
        colorAccent: "#3B82F6",
        steps: [],
      },
    ],
  },
  {
    id: "ai-neural-networks",
    category: "MAXSUS BOSQICH",
    title: "Sun'iy Intellekt va Neyron Tarmoqlar",
    titleEn: "How AI & Neural Networks Work",
    description: "Mashinaviy ta'lim, vaznlar, aktivatsiya funksiyalari va LLM larni chuqur tushunish.",
    overallProgressPercent: 0,
    colorTheme: "#EC4899",
    modules: [
      {
        id: "ai-1",
        moduleNumber: 1,
        title: "Perceptron va Neyronlar",
        titleEn: "The Single Neuron",
        description: "Sun'iy neyron qanday qilib qaror qabul qiladi?",
        level: "1-BOSQICH",
        progressPercent: 0,
        status: "locked",
        iconName: "cpu",
        colorAccent: "#EC4899",
        steps: [],
      },
      {
        id: "ai-2",
        moduleNumber: 2,
        title: "GPT va LLM Modellar Arxitekturasi",
        titleEn: "Attention & Transformers",
        description: "Zamonaviy AI modellarining matnni bashorat qilish siri.",
        level: "2-BOSQICH",
        progressPercent: 0,
        status: "locked",
        iconName: "sparkles",
        colorAccent: "#8B5CF6",
        steps: [],
      },
    ],
  },
];
