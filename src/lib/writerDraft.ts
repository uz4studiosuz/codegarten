import type { LessonContent } from "@/types/lessonContent";

/**
 * Writer draft model
 * ------------------
 * Mirrors exactly what ships in the ZIP: one module file, one content file per
 * lesson, and — when the author defines a new track — the tracks file. Keeping
 * the draft shaped like the output means export is a serialisation step, not a
 * translation, so nothing can drift between the preview and the files that land
 * in the project.
 */

export type LessonKind = "concept" | "exercise" | "challenge" | "review";

export interface DraftLesson {
  id: string;
  title: string;
  kind: LessonKind;
  xp: number;
  estMinutes: number;
  /** Empty means "let the app match one by topic" — omitted from the export. */
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

/** A brand-new learning track the author is introducing with this module. */
export interface DraftTrack {
  id: string;
  category: string;
  title: string;
  titleEn: string;
  description: string;
  colorTheme: string;
  isSoon?: boolean;
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
  /** Topics the module teaches, used to match interactive games. */
  topics: string[];
  levels: DraftLevel[];
  /**
   * Set when `trackId` names a track that does not exist yet. Exported as an
   * updated content/tracks.json so the new direction registers with the module.
   */
  newTrack?: DraftTrack;
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

export const KIND_HINTS: Record<LessonKind, string> = {
  concept: "Tushuntirish va savollar — o'yin qo'shilmaydi",
  exercise: "Tushuntirish, savollar va oxirida interaktiv o'yin",
  challenge: "Qiyinroq mashq — oxirida interaktiv o'yin",
  review: "Bosqich takrori — savollar bilan yakunlanadi",
};

// ── Empty shapes ────────────────────────────────────────────────────────────

export function emptyContent(): LessonContent {
  return {
    goal: "",
    sections: [{ heading: "", body: [""] }],
    terms: [],
    quiz: [],
  };
}

/**
 * Ids are derived from the level id, but a deleted lesson leaves a gap: a plain
 * `length + 1` would recreate an id that is already taken and silently overwrite
 * a content file on export. `taken` is what keeps them unique.
 */
export function emptyLesson(
  levelId: string,
  index: number,
  taken: readonly string[] = []
): DraftLesson {
  let n = index + 1;
  const used = new Set(taken);
  while (used.has(`${levelId}-${n}`)) n += 1;

  return {
    id: `${levelId}-${n}`,
    title: "",
    kind: "concept",
    xp: XP_BY_KIND.concept,
    estMinutes: MINUTES_BY_KIND.concept,
    gameId: "",
    content: emptyContent(),
  };
}

export function emptyLevel(
  moduleId: string,
  num: number,
  takenLevelIds: readonly string[] = []
): DraftLevel {
  let n = num;
  const used = new Set(takenLevelIds);
  while (used.has(`${moduleId}-l${n}`)) n += 1;

  const id = `${moduleId}-l${n}`;
  return {
    id,
    num: n,
    title: "",
    summary: "",
    lessons: [emptyLesson(id, 0)],
  };
}

export function emptyModule(options?: { num?: number; trackId?: string }): DraftModule {
  const id = "mod-yangi";
  return {
    id,
    num: options?.num ?? 1,
    trackId: options?.trackId ?? "programming-cs-foundations",
    title: "",
    titleEn: "",
    description: "",
    tagline: "",
    imageSrc: "/images/loops.png",
    accent: "#22C55E",
    topics: [],
    levels: [emptyLevel(id, 1)],
  };
}

export function emptyTrack(): DraftTrack {
  return {
    id: "",
    category: "YANGI BOSQICH",
    title: "",
    titleEn: "",
    description: "",
    colorTheme: "#22C55E",
    isSoon: false,
  };
}

// ── Id maintenance ──────────────────────────────────────────────────────────

/**
 * Rewrites level and lesson ids to follow a renamed module id. Without this, a
 * module renamed to `mod-7` still exports lessons called `mod-yangi-l1-1`, which
 * is the single most confusing thing the writer used to do.
 */
export function renumberIds(draft: DraftModule): DraftModule {
  return {
    ...draft,
    levels: draft.levels.map((level, li) => {
      const levelId = `${draft.id}-l${li + 1}`;
      return {
        ...level,
        id: levelId,
        num: li + 1,
        lessons: level.lessons.map((lesson, i) => ({
          ...lesson,
          id: `${levelId}-${i + 1}`,
        })),
      };
    }),
  };
}

/** True when any id no longer matches what renumberIds would produce. */
export function idsAreStale(draft: DraftModule): boolean {
  return draft.levels.some((level, li) => {
    const levelId = `${draft.id}-l${li + 1}`;
    if (level.id !== levelId || level.num !== li + 1) return true;
    return level.lessons.some((lesson, i) => lesson.id !== `${levelId}-${i + 1}`);
  });
}

export function allLessonIds(draft: DraftModule): string[] {
  return draft.levels.flatMap((level) => level.lessons.map((lesson) => lesson.id));
}

export function countLessons(draft: DraftModule): number {
  return draft.levels.reduce((sum, level) => sum + level.lessons.length, 0);
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
    ...(draft.topics.length > 0 ? { topics: draft.topics } : {}),
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

/**
 * Drops empty optional fields so exported content stays clean.
 *
 * Blank options are removed, which shifts the positions after them — so the
 * answer index is remapped rather than copied. Copying it (as this used to do)
 * exported the wrong answer key whenever an empty line sat above the right
 * answer, and nothing downstream could detect it.
 */
export function tidyContent(content: LessonContent): LessonContent {
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
      .map((q) => {
        const kept = q.options
          .map((option, index) => ({ option: option.trim(), index }))
          .filter((entry) => entry.option.length > 0);
        const correctIndex = kept.findIndex((entry) => entry.index === q.correctIndex);

        return {
          question: q.question.trim(),
          options: kept.map((entry) => entry.option),
          // -1 only happens when the marked answer was itself blank, which
          // validation reports as an error before export is allowed.
          correctIndex: correctIndex === -1 ? 0 : correctIndex,
          explanation: q.explanation.trim(),
        };
      }),
  };
}

const README = `Codegarten - modul o'rnatish
=============================

Bu arxivdagi papkalarni loyiha ildiziga (package.json turgan joyga) ko'chirib
tashlang. Fayllar mavjud papkalarga qo'shiladi:

  content/modules/<kurs-papka>/<modul>.json    - modul tuzilishi
  content/lessons/<kurs-papka>/<dars>.json     - har darsning matni
  content/tracks.json                          - FAQAT yangi yo'nalish qo'shganda

So'ng loyihada:

  npm run dev

Shu bilan modul avtomatik ro'yxatga qo'shiladi - TypeScript faylni tahrirlash
kerak emas. Kurrikulum "npm run dev" va "npm run build" oldidan qayta
yig'iladi.
`;

export function buildExportFiles(
  draft: DraftModule,
  /** Existing tracks, needed when the draft introduces a new one. */
  existingTracks: readonly DraftTrack[] = []
): ExportFile[] {
  const trackFolder = draft.trackId || "programming-cs-foundations";
  const files: ExportFile[] = [
    {
      path: `content/modules/${trackFolder}/${draft.id}.json`,
      contents: JSON.stringify(moduleFileFor(draft), null, 2) + "\n",
    },
  ];

  for (const level of draft.levels) {
    for (const lesson of level.lessons) {
      files.push({
        path: `content/lessons/${trackFolder}/${lesson.id}.json`,
        contents: JSON.stringify(tidyContent(lesson.content), null, 2) + "\n",
      });
    }
  }

  // A new track has to reach content/tracks.json or the module has nowhere to
  // live, so the whole file is emitted with the new entry appended.
  if (draft.newTrack && draft.newTrack.id === draft.trackId) {
    const tracks = [
      ...existingTracks.filter((t) => t.id !== draft.newTrack!.id),
      {
        ...draft.newTrack,
        isSoon: draft.newTrack.isSoon ?? false,
      },
    ];
    files.push({
      path: "content/tracks.json",
      contents: JSON.stringify(tracks, null, 2) + "\n",
    });
  }

  files.push({ path: "README.txt", contents: README });
  return files;
}

// ── Validation ──────────────────────────────────────────────────────────────

/** Where the writer should jump when the author clicks an issue. */
export type IssueTarget =
  | { kind: "module" }
  | { kind: "track" }
  | { kind: "level"; levelIndex: number }
  | { kind: "lesson"; levelIndex: number; lessonIndex: number };

export interface DraftIssue {
  level: "error" | "warning";
  message: string;
  target: IssueTarget;
}

export interface ValidationContext {
  /** Module ids already in the project — exporting over one replaces it. */
  existingModuleIds?: readonly string[];
  /** Lesson ids already in the project, same hazard. */
  existingLessonIds?: readonly string[];
  /** Track ids already in the project. */
  existingTrackIds?: readonly string[];
}

const ID_PATTERN = /^[a-z0-9-]+$/;

/** Mirrors scripts/validate-lesson-content.mjs so problems surface while typing. */
export function validateDraft(
  draft: DraftModule,
  context: ValidationContext = {}
): DraftIssue[] {
  const issues: DraftIssue[] = [];
  const err = (message: string, target: IssueTarget) =>
    issues.push({ level: "error", message, target });
  const warn = (message: string, target: IssueTarget) =>
    issues.push({ level: "warning", message, target });

  const moduleTarget: IssueTarget = { kind: "module" };

  if (!ID_PATTERN.test(draft.id)) {
    err(
      `Modul id faqat kichik harf, raqam va "-" dan iborat bo'lishi kerak: "${draft.id}"`,
      moduleTarget
    );
  }
  if (context.existingModuleIds?.includes(draft.id)) {
    err(
      `"${draft.id}" moduli loyihada allaqachon bor — eksport qilsangiz ustiga yozib ketadi. Boshqa id bering.`,
      moduleTarget
    );
  }
  if (!draft.title.trim()) err("Modul nomi bo'sh", moduleTarget);
  if (!draft.titleEn.trim()) warn("Inglizcha nomi bo'sh", moduleTarget);
  if (!draft.description.trim()) warn("Modul tavsifi bo'sh", moduleTarget);
  if (!draft.tagline.trim()) {
    warn("Qisqa shior (tagline) bo'sh — katalog kartasida ko'rinadi", moduleTarget);
  }
  if (draft.topics.length === 0) {
    warn(
      "Mavzu (topic) tanlanmagan — o'yinlar dars mavzusiga qarab tanlanmaydi",
      moduleTarget
    );
  }

  // Track: either an existing one, or a fully described new one.
  const knownTrack = context.existingTrackIds?.includes(draft.trackId);
  if (!draft.trackId.trim()) {
    err("Yo'nalish tanlanmagan", { kind: "track" });
  } else if (!knownTrack) {
    if (!draft.newTrack || draft.newTrack.id !== draft.trackId) {
      err(
        `"${draft.trackId}" yo'nalishi loyihada yo'q — uni yangi yo'nalish sifatida to'ldiring`,
        { kind: "track" }
      );
    } else {
      if (!ID_PATTERN.test(draft.newTrack.id)) {
        err("Yangi yo'nalish id noto'g'ri (kichik harf, raqam va \"-\")", {
          kind: "track",
        });
      }
      if (!draft.newTrack.title.trim()) {
        err("Yangi yo'nalish nomi bo'sh", { kind: "track" });
      }
      if (!draft.newTrack.description.trim()) {
        warn("Yangi yo'nalish tavsifi bo'sh", { kind: "track" });
      }
    }
  }

  if (draft.levels.length === 0) err("Kamida bitta bosqich kerak", moduleTarget);

  const lessonIds = new Set<string>();
  const levelIds = new Set<string>();

  draft.levels.forEach((level, li) => {
    const levelTarget: IssueTarget = { kind: "level", levelIndex: li };
    const where = `${li + 1}-bosqich`;

    if (!ID_PATTERN.test(level.id)) {
      err(`${where}: id noto'g'ri ("${level.id}")`, levelTarget);
    }
    if (levelIds.has(level.id)) {
      err(`${where}: id takrorlangan ("${level.id}")`, levelTarget);
    }
    levelIds.add(level.id);

    if (!level.title.trim()) err(`${where}: nomi bo'sh`, levelTarget);
    if (!level.summary.trim()) warn(`${where}: bir qatorli izoh bo'sh`, levelTarget);
    if (level.lessons.length === 0) {
      err(`${where}: kamida bitta dars kerak`, levelTarget);
    }

    level.lessons.forEach((lesson, i) => {
      const target: IssueTarget = { kind: "lesson", levelIndex: li, lessonIndex: i };
      const label = `${where}, ${i + 1}-dars`;

      if (!ID_PATTERN.test(lesson.id)) {
        err(`${label}: id noto'g'ri ("${lesson.id}")`, target);
      }
      if (lessonIds.has(lesson.id)) {
        err(`${label}: id takrorlangan ("${lesson.id}")`, target);
      }
      lessonIds.add(lesson.id);
      if (context.existingLessonIds?.includes(lesson.id)) {
        err(
          `${label}: "${lesson.id}" dars fayli loyihada allaqachon bor — ustiga yozilmasligi uchun id ni o'zgartiring`,
          target
        );
      }

      if (!lesson.title.trim()) err(`${label}: nomi bo'sh`, target);
      if (!lesson.content.goal.trim()) err(`${label}: maqsad yozilmagan`, target);

      const sections = lesson.content.sections.filter(
        (s) => s.heading.trim() || s.body.some((b) => b.trim())
      );
      if (sections.length === 0) err(`${label}: kamida bitta bo'lim kerak`, target);
      sections.forEach((section, si) => {
        if (!section.heading.trim()) {
          err(`${label}: ${si + 1}-bo'lim sarlavhasi bo'sh`, target);
        }
        if (!section.body.some((b) => b.trim())) {
          err(`${label}: ${si + 1}-bo'lim matni bo'sh`, target);
        }
      });

      const quiz = lesson.content.quiz.filter((q) => q.question.trim());
      if (quiz.length === 0) err(`${label}: kamida bitta savol kerak`, target);
      quiz.forEach((q, qi) => {
        const options = q.options.filter((o) => o.trim());
        if (options.length < 2) {
          err(`${label}: ${qi + 1}-savolda kamida 2 variant kerak`, target);
        }
        // The marked answer must survive the blank-line cleanup that export does.
        const markedIsBlank = !q.options[q.correctIndex]?.trim();
        if (markedIsBlank) {
          err(`${label}: ${qi + 1}-savolda to'g'ri javob bo'sh variantga qo'yilgan`, target);
        }
        if (!q.explanation.trim()) {
          warn(`${label}: ${qi + 1}-savol izohi bo'sh`, target);
        }
      });

      if (lesson.content.terms.length === 0) {
        warn(
          `${label}: kalit so'zlar yo'q — lug'atga saqlanadigan atama bo'lmaydi`,
          target
        );
      }
      lesson.content.terms.forEach((t, ti) => {
        if (t.en.trim() && !t.uz.trim()) {
          err(`${label}: ${ti + 1}-atamaning o'zbekchasi yozilmagan`, target);
        }
      });

      if (lesson.xp <= 0) err(`${label}: XP noldan katta bo'lishi kerak`, target);
      if (lesson.estMinutes <= 0) {
        err(`${label}: daqiqa noldan katta bo'lishi kerak`, target);
      }
    });
  });

  return issues;
}

/** Issues that belong to one tree node, so the tree can show a dot on it. */
export function issuesFor(
  issues: readonly DraftIssue[],
  target: IssueTarget
): DraftIssue[] {
  return issues.filter((issue) => {
    const t = issue.target;
    if (t.kind !== target.kind) return false;
    if (t.kind === "level" && target.kind === "level") {
      return t.levelIndex === target.levelIndex;
    }
    if (t.kind === "lesson" && target.kind === "lesson") {
      return t.levelIndex === target.levelIndex && t.lessonIndex === target.lessonIndex;
    }
    return true;
  });
}
