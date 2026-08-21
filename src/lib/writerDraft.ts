import type {
  ContentSection,
  KeyTerm,
  LessonContent,
  LessonImage,
  LessonStep,
  QuizQuestion,
  SectionBlock,
} from "@/types/lessonContent";
import { sectionBlocks } from "./lessonSteps";

/**
 * Writer draft model
 * ------------------
 * Mirrors exactly what ships in the ZIP: one module file, one content file per
 * lesson, uploaded images as real files under public/, and — when the author
 * defines a new track — the tracks file. Keeping the draft shaped like the output
 * means export is a serialisation step, not a translation, so nothing can drift
 * between the preview and the files that land in the project.
 *
 * Lesson bodies are always held as an ordered `steps` list here, even when the
 * imported file used the older pools, so the editor has exactly one shape to work
 * on. See src/lib/lessonSteps.ts for the reading side.
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
  exercise: "Tushuntirish, savollar va interaktiv o'yin",
  challenge: "Qiyinroq mashq — interaktiv o'yin bilan",
  review: "Bosqich takrori — savollar bilan yakunlanadi",
};

export type StepKind = LessonStep["kind"];
export type BlockKind = SectionBlock["kind"];

export const BLOCK_LABELS: Record<BlockKind, string> = {
  text: "Matn",
  code: "Kod",
  choice: "Tanlov",
  image: "Rasm",
  callout: "Xulosa",
};

export const BLOCK_HINTS: Record<BlockKind, string> = {
  text: "Bir yoki bir necha xatboshi",
  code: "Kod namunasi — har buyruq alohida qator",
  choice: "Variantlar tanlovi (to'g'ri/noto'g'ri)",
  image: "Havola yoki yuklangan rasm",
  callout: "Eng muhim fikr, ajratib ko'rsatiladi",
};

export const STEP_LABELS: Record<Exclude<StepKind, "goal">, string> = {
  section: "Bo'lim",
  terms: "Kalit so'zlar",
  quiz: "Savol",
  challenge: "Interaktiv o'yin",
};

/** Only exercise and challenge lessons end hands-on. */
export function kindHasGame(kind: LessonKind): boolean {
  return kind === "exercise" || kind === "challenge";
}

// ── Empty shapes ────────────────────────────────────────────────────────────

export function emptyBlock(kind: BlockKind): SectionBlock {
  if (kind === "code") return { kind: "code", caption: "", lines: [] };
  if (kind === "image") return { kind: "image", image: { src: "", alt: "", size: "full" } };
  if (kind === "callout") return { kind: "callout", text: "" };
  if (kind === "choice") {
    return {
      kind: "choice",
      question: "",
      options: ["", ""],
      correctIndex: 0,
      explanation: "",
    };
  }
  return { kind: "text", text: "" };
}

export function emptySection(): ContentSection {
  return { heading: "", blocks: [emptyBlock("text")] };
}

/**
 * A section as the editor works on it: always an ordered block list, never the
 * older fixed fields. Sections imported from the project may still use those.
 */
export function toDraftSection(section: ContentSection): ContentSection {
  const blocks = sectionBlocks(section);
  return {
    heading: section.heading ?? "",
    blocks: blocks.length > 0 ? blocks : [emptyBlock("text")],
  };
}

export function draftBlocks(section: ContentSection): SectionBlock[] {
  return section.blocks ?? [];
}

/** True when nothing has been written into this block yet. */
export function blockIsEmpty(block: SectionBlock): boolean {
  if (block.kind === "text" || block.kind === "callout") return !block.text.trim();
  if (block.kind === "image") return !block.image.src.trim();
  if (block.kind === "choice") {
    return (
      !block.question?.trim() &&
      !block.options.some((line) => line.trim())
    );
  }
  return !block.lines.some((line) => line.trim());
}

export function emptyQuestion(): QuizQuestion {
  return { question: "", options: ["", "", ""], correctIndex: 0, explanation: "" };
}

export function emptyTerm(): KeyTerm {
  return { en: "", uz: "", note: "" };
}

export function emptyStep(kind: Exclude<StepKind, "goal">): LessonStep {
  if (kind === "section") return { kind: "section", section: emptySection() };
  if (kind === "terms") return { kind: "terms", terms: [emptyTerm()] };
  if (kind === "quiz") return { kind: "quiz", question: emptyQuestion() };
  return { kind: "challenge" };
}

export function emptyContent(): LessonContent {
  return { goal: "", steps: [emptyStep("section"), emptyStep("quiz")] };
}

/**
 * Turns any lesson content into the steps shape the editor works on. Module files
 * imported from the project may still carry the older pools.
 */
export function toDraftContent(content: LessonContent | undefined): LessonContent {
  if (!content) return emptyContent();
  if (content.steps && content.steps.length > 0) {
    return {
      goal: content.goal ?? "",
      steps: content.steps
        .filter((step) => step.kind !== "goal")
        .map((step) =>
          step.kind === "section"
            ? { kind: "section", section: toDraftSection(step.section) }
            : step
        ),
    };
  }

  const steps: LessonStep[] = [];
  for (const section of content.sections ?? []) {
    steps.push({ kind: "section", section: toDraftSection(section) });
  }
  if ((content.terms ?? []).length > 0) {
    steps.push({ kind: "terms", terms: content.terms! });
  }
  for (const question of content.quiz ?? []) steps.push({ kind: "quiz", question });

  return {
    goal: content.goal ?? "",
    steps: steps.length > 0 ? steps : emptyContent().steps,
  };
}

export function draftSteps(content: LessonContent): LessonStep[] {
  return content.steps ?? [];
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

// ── Images ──────────────────────────────────────────────────────────────────

const DATA_URI = /^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/i;

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

/** Uploads are kept inline while drafting; only export turns them into files. */
export function isUploadedImage(src: string): boolean {
  return DATA_URI.test(src.trim());
}

/** Roughly how many bytes a base64 data URI occupies once decoded. */
export function dataUriBytes(src: string): number {
  const match = DATA_URI.exec(src.trim());
  if (!match) return 0;
  const base64 = match[2];
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
/** Above this, the browser's storage quota becomes a real risk for a draft. */
export const LARGE_IMAGE_BYTES = 500 * 1024;

// ── Export ──────────────────────────────────────────────────────────────────

export interface ExportFile {
  path: string;
  /** Text payload — JSON files and the README. */
  contents?: string;
  /** Base64 payload — uploaded images, written into the ZIP as binary. */
  base64?: string;
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

function tidyImage(
  image: LessonImage,
  rewrite: (src: string) => string
): { image: LessonImage } {
  return {
    image: {
      src: rewrite(image.src.trim()),
      alt: image.alt.trim() || image.caption?.trim() || "Dars rasmi",
      ...(image.caption?.trim() ? { caption: image.caption.trim() } : {}),
      ...(image.size && image.size !== "full" ? { size: image.size } : {}),
    },
  };
}

function tidyChoice(
  block: Extract<SectionBlock, { kind: "choice" }>
): Extract<SectionBlock, { kind: "choice" }> {
  const kept = block.options
    .map((option, index) => ({ option: option.trim(), index }))
    .filter((entry) => entry.option.length > 0);
  const correctIndex = kept.findIndex((entry) => entry.index === block.correctIndex);

  return {
    kind: "choice",
    ...(block.question?.trim() ? { question: block.question.trim() } : {}),
    options: kept.map((entry) => entry.option),
    correctIndex: correctIndex === -1 ? 0 : correctIndex,
    ...(block.explanation?.trim() ? { explanation: block.explanation.trim() } : {}),
  };
}

function tidySection(
  section: ContentSection,
  rewrite: (src: string) => string
): ContentSection {
  const blocks: SectionBlock[] = [];

  for (const block of sectionBlocks(section)) {
    if (block.kind === "text" || block.kind === "callout") {
      const text = block.text.trim();
      if (text) blocks.push({ kind: block.kind, text });
    } else if (block.kind === "code") {
      const lines = block.lines;
      if (lines.some((line) => line.trim())) {
        blocks.push({
          kind: "code",
          ...(block.caption?.trim() ? { caption: block.caption.trim() } : {}),
          lines,
        });
      }
    } else if (block.kind === "choice") {
      const tidied = tidyChoice(block);
      if (tidied.options.length > 0 || tidied.question) {
        blocks.push(tidied);
      }
    } else if (block.image.src.trim()) {
      blocks.push({ kind: "image", ...tidyImage(block.image, rewrite) });
    }
  }

  return { heading: section.heading.trim(), blocks };
}

/**
 * Blank options are removed, which shifts the positions after them — so the
 * answer index is remapped rather than copied. Copying it (as this used to do)
 * exported the wrong answer key whenever an empty line sat above the right
 * answer, and nothing downstream could detect it.
 */
function tidyQuestion(question: QuizQuestion): QuizQuestion {
  const kept = question.options
    .map((option, index) => ({ option: option.trim(), index }))
    .filter((entry) => entry.option.length > 0);
  const correctIndex = kept.findIndex((entry) => entry.index === question.correctIndex);

  return {
    question: question.question.trim(),
    options: kept.map((entry) => entry.option),
    // -1 only happens when the marked answer was itself blank, which validation
    // reports as an error before export is allowed.
    correctIndex: correctIndex === -1 ? 0 : correctIndex,
    explanation: question.explanation.trim(),
  };
}

/**
 * Drops empty steps and blank optional fields so exported content stays clean.
 * `rewriteImage` maps an inline upload to the path it will live at in the project.
 */
export function tidyContent(
  content: LessonContent,
  rewriteImage: (src: string) => string = (src) => src
): LessonContent {
  const steps: LessonStep[] = [];

  for (const step of draftSteps(content)) {
    if (step.kind === "section") {
      const section = tidySection(step.section, rewriteImage);
      const empty = !section.heading && (section.blocks ?? []).length === 0;
      if (!empty) steps.push({ kind: "section", section });
    } else if (step.kind === "terms") {
      const terms = step.terms
        .filter((t) => t.en.trim())
        .map((t) => ({ en: t.en.trim(), uz: t.uz.trim(), note: t.note.trim() }));
      if (terms.length > 0) steps.push({ kind: "terms", terms });
    } else if (step.kind === "quiz") {
      if (step.question.question.trim()) {
        steps.push({ kind: "quiz", question: tidyQuestion(step.question) });
      }
    } else if (step.kind === "challenge") {
      steps.push({ kind: "challenge" });
    }
  }

  return { goal: content.goal.trim(), steps };
}

const README = `Codegarten - modul o'rnatish
=============================

Bu arxivdagi papkalarni loyiha ildiziga (package.json turgan joyga) ko'chirib
tashlang. Fayllar mavjud papkalarga qo'shiladi:

  content/modules/<kurs-papka>/<modul>.json    - modul tuzilishi
  content/lessons/<kurs-papka>/<dars>.json     - har darsning matni
  public/images/lessons/...                    - yuklangan rasmlar (bo'lsa)
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
      /*
       * Inline uploads become real files. Numbering per lesson keeps the names
       * stable across exports as long as the images themselves do not move.
       */
      const assets: ExportFile[] = [];
      const rewrite = (src: string): string => {
        const match = DATA_URI.exec(src.trim());
        if (!match) return src.trim();
        const extension = IMAGE_EXTENSIONS[match[1].toLowerCase()] ?? "png";
        const name = `${lesson.id}-${assets.length + 1}.${extension}`;
        assets.push({ path: `public/images/lessons/${name}`, base64: match[2] });
        return `/images/lessons/${name}`;
      };

      files.push({
        path: `content/lessons/${trackFolder}/${lesson.id}.json`,
        contents: JSON.stringify(tidyContent(lesson.content, rewrite), null, 2) + "\n",
      });
      files.push(...assets);
    }
  }

  // A new track has to reach content/tracks.json or the module has nowhere to
  // live, so the whole file is emitted with the new entry appended.
  if (draft.newTrack && draft.newTrack.id === draft.trackId) {
    const tracks = [
      ...existingTracks.filter((t) => t.id !== draft.newTrack!.id),
      { ...draft.newTrack, isSoon: draft.newTrack.isSoon ?? false },
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

      const steps = draftSteps(lesson.content);
      if (steps.length === 0) err(`${label}: qadamlar qo'shilmagan`, target);

      let sectionCount = 0;
      let quizCount = 0;
      let challengeCount = 0;

      steps.forEach((step, si) => {
        const at = `${label}: ${si + 1}-qadam`;

        if (step.kind === "section") {
          sectionCount += 1;
          const { section } = step;
          if (!section.heading.trim()) err(`${at} (bo'lim) sarlavhasi bo'sh`, target);

          const blocks = sectionBlocks(section);
          if (blocks.length === 0 || blocks.every(blockIsEmpty)) {
            err(`${at} (bo'lim) bo'sh — matn, rasm yoki kod bloki qo'shing`, target);
          }

          blocks.forEach((block, bi) => {
            const where = `${at}, ${bi + 1}-blok (${BLOCK_LABELS[block.kind]})`;
            if (blockIsEmpty(block)) {
              err(`${where} bo'sh — to'ldiring yoki o'chirib tashlang`, target);
              return;
            }
            if (block.kind === "choice") {
              const filled = block.options.filter((o) => o.trim());
              if (filled.length < 2) {
                err(`${where}: kamida 2 ta variant kerak`, target);
              }
              if (!block.options[block.correctIndex]?.trim()) {
                err(`${where}: to'g'ri javob bo'sh variantga qo'yilgan`, target);
              }
              return;
            }
            if (block.kind !== "image") return;

            const src = block.image.src.trim();
            if (!block.image.alt.trim()) {
              warn(`${where}: izohli nom (alt) yozilmagan`, target);
            }
            if (isUploadedImage(src)) {
              const bytes = dataUriBytes(src);
              if (bytes > MAX_IMAGE_BYTES) {
                err(
                  `${where}: yuklangan rasm juda katta (${Math.round(
                    bytes / 1024
                  )} KB) — 2 MB dan kichik bo'lishi kerak`,
                  target
                );
              } else if (bytes > LARGE_IMAGE_BYTES) {
                warn(
                  `${where}: rasm ${Math.round(
                    bytes / 1024
                  )} KB — brauzerdagi qoralama uchun kattaroq, siqib yuklash tavsiya etiladi`,
                  target
                );
              }
            } else if (!/^(\/|https?:\/\/)/.test(src)) {
              err(
                `${where}: manzil "/" bilan boshlanadigan yo'l yoki http(s) havola bo'lishi kerak`,
                target
              );
            }
          });
        } else if (step.kind === "terms") {
          const filled = step.terms.filter((t) => t.en.trim());
          if (filled.length === 0) {
            err(`${at} (kalit so'zlar) bo'sh — atama qo'shing yoki qadamni o'chiring`, target);
          }
          filled.forEach((t, ti) => {
            if (!t.uz.trim()) {
              err(`${at}: ${ti + 1}-atamaning o'zbekchasi yozilmagan`, target);
            }
          });
        } else if (step.kind === "quiz") {
          quizCount += 1;
          const q = step.question;
          if (!q.question.trim()) err(`${at} (savol) matni bo'sh`, target);
          const options = q.options.filter((o) => o.trim());
          if (options.length < 2) err(`${at}: kamida 2 variant kerak`, target);
          // The marked answer must survive the blank-line cleanup that export does.
          if (!q.options[q.correctIndex]?.trim()) {
            err(`${at}: to'g'ri javob bo'sh variantga qo'yilgan`, target);
          }
          if (!q.explanation.trim()) warn(`${at}: savol izohi bo'sh`, target);

          /*
           * Testers worked out that the longest option was the answer. A length
           * check here is crude but it catches the habit while it is being formed.
           */
          const trimmed = q.options.map((o) => o.trim()).filter(Boolean);
          const answer = q.options[q.correctIndex]?.trim() ?? "";
          const others = trimmed.filter((o) => o !== answer);
          if (answer && others.length > 0) {
            const longest = Math.max(...trimmed.map((o) => o.length));
            const avgOther = others.reduce((sum, o) => sum + o.length, 0) / others.length;
            if (answer.length === longest && answer.length > avgOther * 1.4) {
              warn(
                `${at}: to'g'ri javob boshqa variantlardan sezilarli uzun — o'quvchi mazmunga qaramay uzunini tanlab qo'yadi`,
                target
              );
            }
          }
        } else if (step.kind === "challenge") {
          challengeCount += 1;
          if (!kindHasGame(lesson.kind)) {
            err(
              `${at}: "${KIND_LABELS[lesson.kind]}" turidagi darsda o'yin ishlatilmaydi — qadamni o'chiring yoki dars turini o'zgartiring`,
              target
            );
          }
        }
      });

      if (sectionCount === 0) err(`${label}: kamida bitta bo'lim kerak`, target);
      if (quizCount === 0) err(`${label}: kamida bitta savol kerak`, target);
      if (challengeCount > 1) {
        err(`${label}: o'yin qadami faqat bitta bo'lishi mumkin`, target);
      }
      if (kindHasGame(lesson.kind) && challengeCount === 0) {
        warn(
          `${label}: o'yin qadami qo'yilmagan — o'yin darsning oxiriga qo'shiladi`,
          target
        );
      }

      if (steps.every((step) => step.kind !== "terms")) {
        warn(
          `${label}: kalit so'zlar yo'q — lug'atga saqlanadigan atama bo'lmaydi`,
          target
        );
      }

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
