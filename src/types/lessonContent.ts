/**
 * Lesson content shape — the contract between the JSON files under
 * content/lessons/ and the components that render them.
 *
 * Types only, no data: safe to import from client components.
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
  /** Index into `options` as authored; the runner reshuffles for display. */
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
