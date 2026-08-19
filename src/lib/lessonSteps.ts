import type {
  ContentSection,
  KeyTerm,
  LessonContent,
  LessonStep,
  QuizQuestion,
} from "@/types/lessonContent";

/**
 * The run of a lesson
 * -------------------
 * One place that answers "which screens does this lesson have, in what order".
 * Two shapes reach it: content authored as an ordered `steps` list, and the older
 * pools (`sections`, `terms`, `quiz`) that imply the historical order. Everything
 * downstream — the runner, the writer preview, validation — reads the result of
 * this function rather than the raw fields, so neither shape leaks further.
 *
 * Pure and free of React on purpose: the same normalisation runs in the content
 * validation script's sibling logic and could move to the server unchanged.
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
      section.body.some((line) => line.trim()) ||
      section.image?.src.trim()
  );
}
