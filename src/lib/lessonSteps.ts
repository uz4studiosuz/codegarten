import type {
  ContentSection,
  KeyTerm,
  LessonContent,
  LessonStep,
  QuizQuestion,
  SectionBlock,
} from "@/types/lessonContent";

/**
 * The run of a lesson
 * -------------------
 * One place that answers "which screens does this lesson have, in what order —
 * and what does each screen lay out, in what order". Two shapes reach it: content
 * authored as ordered lists (`steps`, `section.blocks`), and the older fields that
 * imply a fixed order. Everything downstream — the runner, the writer preview,
 * validation — reads the result of these functions rather than the raw fields, so
 * neither shape leaks further.
 *
 * Pure and free of React on purpose: the same normalisation could move to the
 * server unchanged.
 */

/** The order lessons written before `steps` existed are played in. */
function legacyRun(content: LessonContent): LessonStep[] {
  const steps: LessonStep[] = [];
  for (const section of content.sections ?? []) {
    steps.push({ kind: "section", section });
  }
  if ((content.terms ?? []).length > 0) {
    steps.push({ kind: "terms", terms: content.terms! });
  }
  for (const question of content.quiz ?? []) {
    steps.push({ kind: "quiz", question });
  }
  return steps;
}

/**
 * Every screen of the lesson, in order. The objective always opens; the game
 * closes it unless a `challenge` step placed it somewhere else.
 */
export function lessonSteps(content: LessonContent, hasGame: boolean): LessonStep[] {
  const authored = content.steps;
  const body =
    authored && authored.length > 0
      ? // A `goal` step in authored content is redundant — the objective screen is
        // always first — and honouring it would show the same screen twice.
        authored.filter((step) => step.kind !== "goal")
      : legacyRun(content);

  const steps: LessonStep[] = [{ kind: "goal" }];
  let placedChallenge = false;

  for (const step of body) {
    if (step.kind === "challenge") {
      if (!hasGame || placedChallenge) continue;
      placedChallenge = true;
    }
    steps.push(step);
  }

  if (hasGame && !placedChallenge) steps.push({ kind: "challenge" });
  return steps;
}

/**
 * What one teaching screen lays out, in order. Sections written before `blocks`
 * existed keep the layout they always had: paragraphs, then the picture, then the
 * code sample, then the takeaway.
 */
export function sectionBlocks(section: ContentSection): SectionBlock[] {
  if (section.blocks && section.blocks.length > 0) return section.blocks;

  const blocks: SectionBlock[] = [];
  for (const paragraph of section.body ?? []) {
    if (paragraph.trim()) blocks.push({ kind: "text", text: paragraph });
  }
  if (section.image?.src) blocks.push({ kind: "image", image: section.image });
  if (section.code && section.code.lines.length > 0) {
    blocks.push({
      kind: "code",
      ...(section.code.caption ? { caption: section.code.caption } : {}),
      lines: section.code.lines,
    });
  }
  if (section.callout?.trim()) blocks.push({ kind: "callout", text: section.callout });
  return blocks;
}

/** Sections in run order, whichever shape the content uses. */
export function lessonSections(content: LessonContent): ContentSection[] {
  if (content.steps?.length) {
    return content.steps
      .filter((s): s is Extract<LessonStep, { kind: "section" }> => s.kind === "section")
      .map((s) => s.section);
  }
  return content.sections ?? [];
}

/** Every key term in the lesson, flattened across `terms` steps. */
export function lessonTerms(content: LessonContent): KeyTerm[] {
  if (content.steps?.length) {
    return content.steps
      .filter((s): s is Extract<LessonStep, { kind: "terms" }> => s.kind === "terms")
      .flatMap((s) => s.terms);
  }
  return content.terms ?? [];
}

/** Every question in the lesson, in run order. */
export function lessonQuiz(content: LessonContent): QuizQuestion[] {
  if (content.steps?.length) {
    return content.steps
      .filter((s): s is Extract<LessonStep, { kind: "quiz" }> => s.kind === "quiz")
      .map((s) => s.question);
  }
  return content.quiz ?? [];
}

/** True once there is enough written for the lesson to be worth previewing. */
export function hasReadableBody(content: LessonContent): boolean {
  return lessonSections(content).some(
    (section) =>
      section.heading.trim() ||
      sectionBlocks(section).some((block) =>
        block.kind === "text" || block.kind === "callout"
          ? block.text.trim().length > 0
          : block.kind === "choice"
          ? block.options.some((opt) => opt.trim().length > 0) || Boolean(block.question?.trim())
          : block.kind === "image"
          ? block.image.src.trim().length > 0
          : block.lines.some((line) => line.trim().length > 0)
      )
  );
}
