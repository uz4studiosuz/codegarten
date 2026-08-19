import type { LessonContent } from "@/types/lessonContent";

/**
 * Writer draft model
 * ------------------
 * Mirrors exactly what ships in the ZIP: one module file plus one content file
 * per lesson. Keeping the draft shaped like the output means export is a
 * serialisation step, not a translation — nothing can drift between preview and
 * the files that land in the project.
 */

export type LessonKind = "concept" | "exercise" | "challenge" | "review";

export interface DraftLesson {
  id: string;
  title: string;
  kind: LessonKind;
  xp: number;
  estMinutes: number;
  /** Empty means "let the app pick" — omitted from the exported JSON. */
  gameId: string;
  content: LessonContent;
}

export interface DraftLevel {
  id: string;
  num: number;
  title: string;
  summary: string;
  lessons: DraftLesson[];
}

export interface DraftModule {
  id: string;
  num: number;
  trackId: string;
  title: string;
  titleEn: string;
  description: string;
  tagline: string;
  imageSrc: string;
  accent: string;
  levels: DraftLevel[];
}

export const XP_BY_KIND: Record<LessonKind, number> = {
  concept: 10,
  exercise: 15,
  challenge: 25,
  review: 30,
};

export const MINUTES_BY_KIND: Record<LessonKind, number> = {
  concept: 3,
  exercise: 5,
  challenge: 8,
  review: 10,
};

export const KIND_LABELS: Record<LessonKind, string> = {
  concept: "Tushuncha",
  exercise: "Mashq",
  challenge: "Sinov",
  review: "Takrorlash",
};

export function emptyContent(): LessonContent {
  return {
    goal: "",
    sections: [{ heading: "", body: [""] }],
    terms: [],
    quiz: [],
  };
}

export function emptyLesson(levelId: string, index: number): DraftLesson {
  return {
    id: `${levelId}-${index + 1}`,
    title: "",
    kind: "concept",
    xp: XP_BY_KIND.concept,
    estMinutes: MINUTES_BY_KIND.concept,
    gameId: "",
    content: emptyContent(),
  };
}

export function emptyLevel(moduleId: string, num: number): DraftLevel {
  const id = `${moduleId}-l${num}`;
  return {
    id,
    num,
    title: "",
    summary: "",
    lessons: [emptyLesson(id, 0)],
  };
}

export function emptyModule(): DraftModule {
  const id = "mod-yangi";
  return {
    id,
    num: 7,
    trackId: "programming-cs-foundations",
    title: "",
    titleEn: "",
    description: "",
    tagline: "",
    imageSrc: "/images/loops.png",
    accent: "#22C55E",
    levels: [emptyLevel(id, 1)],
  };
}

// ── Export ──────────────────────────────────────────────────────────────────

export interface ExportFile {
  path: string;
  contents: string;
}

/** Strips writer-only fields so the module file matches what the app expects. */
export function moduleFileFor(draft: DraftModule) {
  return {
    id: draft.id,
    num: draft.num,
    trackId: draft.trackId,
    title: draft.title,
    titleEn: draft.titleEn,
    description: draft.description,
    tagline: draft.tagline,
    imageSrc: draft.imageSrc,
    accent: draft.accent,
    levels: draft.levels.map((level) => ({
      id: level.id,
      num: level.num,
      title: level.title,
      summary: level.summary,
      lessons: level.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        kind: lesson.kind,
        xp: lesson.xp,
        estMinutes: lesson.estMinutes,
        ...(lesson.gameId ? { gameId: lesson.gameId } : {}),
      })),
    })),
  };
}

/** Drops empty optional fields so exported content stays clean. */
function tidyContent(content: LessonContent): LessonContent {
  return {
    goal: content.goal.trim(),
    sections: content.sections.map((section) => ({
      heading: section.heading.trim(),
      body: section.body.map((b) => b.trim()).filter(Boolean),
      ...(section.code && section.code.lines.filter(Boolean).length > 0
        ? {
            code: {
              ...(section.code.caption?.trim()
                ? { caption: section.code.caption.trim() }
                : {}),
              lines: section.code.lines,
            },
          }
        : {}),
      ...(section.callout?.trim() ? { callout: section.callout.trim() } : {}),
    })),
    terms: content.terms
      .filter((t) => t.en.trim())
      .map((t) => ({ en: t.en.trim(), uz: t.uz.trim(), note: t.note.trim() })),
    quiz: content.quiz
      .filter((q) => q.question.trim())
      .map((q) => ({
        question: q.question.trim(),
        options: q.options.map((o) => o.trim()).filter(Boolean),
        correctIndex: q.correctIndex,
        explanation: q.explanation.trim(),
      })),
  };
}

const README = `Codegarten - modul o'rnatish
=============================

Bu arxivdagi papkalarni loyiha ildiziga (package.json turgan joyga) ko'chirib
tashlang. Fayllar mavjud papkalarga qo'shiladi, hech narsani almashtirmaydi:

  content/modules/<modul>.json    - modul tuzilishi (bosqichlar, darslar)
  content/lessons/<dars>.json     - har darsning matni

So'ng loyihada:

  npm run dev

Shu bilan modul avtomatik ro'yxatga qo'shiladi - TypeScript faylni tahrirlash
kerak emas. Kurrikulum "npm run dev" va "npm run build" oldidan qayta
yig'iladi.

Tekshirish:

  npm run content:check

Bu buyruq yo'q, ortiqcha yoki xato formatdagi dars fayllarini topadi.
`;

export function buildExportFiles(draft: DraftModule): ExportFile[] {
  const files: ExportFile[] = [
    {
      path: `content/modules/${draft.id}.json`,
      contents: JSON.stringify(moduleFileFor(draft), null, 2) + "\n",
    },
  ];

  for (const level of draft.levels) {
    for (const lesson of level.lessons) {
      files.push({
        path: `content/lessons/${lesson.id}.json`,
        contents: JSON.stringify(tidyContent(lesson.content), null, 2) + "\n",
      });
    }
  }

  files.push({ path: "README.txt", contents: README });
  return files;
}

// ── Validation ──────────────────────────────────────────────────────────────

export interface DraftIssue {
  level: "error" | "warning";
  message: string;
}

const ID_PATTERN = /^[a-z0-9-]+$/;

/** Mirrors scripts/validate-lesson-content.mjs so problems surface while typing. */
export function validateDraft(draft: DraftModule): DraftIssue[] {
  const issues: DraftIssue[] = [];
  const err = (message: string) => issues.push({ level: "error", message });
  const warn = (message: string) => issues.push({ level: "warning", message });

  if (!ID_PATTERN.test(draft.id)) {
    err(`Modul id faqat kichik harf, raqam va "-" dan iborat bo'lishi kerak: "${draft.id}"`);
  }
  if (!draft.title.trim()) err("Modul nomi bo'sh");
  if (!draft.description.trim()) warn("Modul tavsifi bo'sh");
  if (draft.levels.length === 0) err("Kamida bitta bosqich kerak");

  const lessonIds = new Set<string>();

  draft.levels.forEach((level, li) => {
    const where = `${li + 1}-bosqich`;
    if (!ID_PATTERN.test(level.id)) err(`${where}: id noto'g'ri ("${level.id}")`);
    if (!level.title.trim()) err(`${where}: nomi bo'sh`);
    if (level.lessons.length === 0) err(`${where}: kamida bitta dars kerak`);

    level.lessons.forEach((lesson, i) => {
      const label = `${where}, ${i + 1}-dars`;

      if (!ID_PATTERN.test(lesson.id)) err(`${label}: id noto'g'ri ("${lesson.id}")`);
      if (lessonIds.has(lesson.id)) err(`${label}: id takrorlangan ("${lesson.id}")`);
      lessonIds.add(lesson.id);

      if (!lesson.title.trim()) err(`${label}: nomi bo'sh`);
      if (!lesson.content.goal.trim()) err(`${label}: maqsad yozilmagan`);

      const sections = lesson.content.sections.filter(
        (s) => s.heading.trim() || s.body.some((b) => b.trim())
      );
      if (sections.length === 0) err(`${label}: kamida bitta bo'lim kerak`);
      sections.forEach((section, si) => {
        if (!section.heading.trim()) err(`${label}: ${si + 1}-bo'lim sarlavhasi bo'sh`);
        if (!section.body.some((b) => b.trim())) {
          err(`${label}: ${si + 1}-bo'lim matni bo'sh`);
        }
      });

      const quiz = lesson.content.quiz.filter((q) => q.question.trim());
      if (quiz.length === 0) err(`${label}: kamida bitta savol kerak`);
      quiz.forEach((q, qi) => {
        const options = q.options.filter((o) => o.trim());
        if (options.length < 2) err(`${label}: ${qi + 1}-savolda kamida 2 variant kerak`);
        if (q.correctIndex < 0 || q.correctIndex >= options.length) {
          err(`${label}: ${qi + 1}-savolda to'g'ri javob tanlanmagan`);
        }
        if (!q.explanation.trim()) warn(`${label}: ${qi + 1}-savol izohi bo'sh`);
      });

      if (lesson.content.terms.length === 0) {
        warn(`${label}: kalit so'zlar yo'q — lug'atga saqlanadigan atama bo'lmaydi`);
      }
      lesson.content.terms.forEach((t, ti) => {
        if (t.en.trim() && !t.uz.trim()) {
          err(`${label}: ${ti + 1}-atamaning o'zbekchasi yozilmagan`);
        }
      });

      const needsGame = lesson.kind === "exercise" || lesson.kind === "challenge";
      if (needsGame && !lesson.gameId) {
        warn(`${label}: o'yin tanlanmagan — ilova o'zi tanlaydi`);
      }
    });
  });

  return issues;
}
