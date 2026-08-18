/**
 * Lesson content model
 * --------------------
 * Teaching material for curriculum lessons. A lesson plays as a step sequence:
 * teaching sections → key terms → quiz → (for exercise lessons) the interactive
 * block challenge.
 *
 * Convention: English technical keywords stay in English with the Uzbek
 * equivalent in parentheses, so learners recognise them in real code and docs.
 */

export interface KeyTerm {
  /** The term as it appears in real code and documentation. */
  en: string;
  /** Uzbek equivalent, rendered in parentheses. */
  uz: string;
  note: string;
}

export interface CodeBlock {
  caption?: string;
  lines: string[];
}

export interface ContentSection {
  heading: string;
  body: string[];
  code?: CodeBlock;
  /** Highlighted takeaway, rendered in a tinted box. */
  callout?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonContent {
  /** One line stating what the learner will be able to do afterwards. */
  goal: string;
  sections: ContentSection[];
  terms: KeyTerm[];
  quiz: QuizQuestion[];
}

// ── Authoring shorthands, kept terse so the content files stay readable ─────

export const s = (
  heading: string,
  body: string[],
  extra?: { code?: CodeBlock; callout?: string }
): ContentSection => ({ heading, body, ...extra });

export const t = (en: string, uz: string, note: string): KeyTerm => ({ en, uz, note });

export const q = (
  question: string,
  options: string[],
  correctIndex: number,
  explanation: string
): QuizQuestion => ({ question, options, correctIndex, explanation });

export const L = (
  goal: string,
  sections: ContentSection[],
  terms: KeyTerm[],
  quiz: QuizQuestion[]
): LessonContent => ({ goal, sections, terms, quiz });
