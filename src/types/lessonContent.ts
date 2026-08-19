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

export interface LessonImage {
  /**
   * A path inside public/ (`/images/...`), an absolute URL, or — while a draft is
   * still being written — a data: URI from an upload. The writer turns uploads
   * into real files under public/ on export.
   */
  src: string;
  /** Read out by screen readers and shown if the image fails to load. */
  alt: string;
  caption?: string;
}

/**
 * One piece of a teaching screen.
 *
 * A section used to have a fixed internal layout — every paragraph, then the
 * image, then the code, then the takeaway — so an author could not put a code
 * sample directly under the picture it explains. `ContentSection.blocks` is an
 * ordered list of these instead, and the screen renders them in exactly the
 * order they were authored.
 */
export type SectionBlock =
  | { kind: "text"; text: string }
  | { kind: "code"; caption?: string; lines: string[] }
  | { kind: "image"; image: LessonImage }
  | { kind: "callout"; text: string };

export interface ContentSection {
  heading: string;
  /**
   * The authored layout. When absent, it is derived from the fields below in the
   * historical order, so every lesson written before this existed renders
   * unchanged.
   */
  blocks?: SectionBlock[];
  body?: string[];
  code?: CodeBlock;
  image?: LessonImage;
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

/**
 * One screen of a lesson.
 *
 * A lesson used to be a fixed run — every section, then the terms, then every
 * question — which is wrong for plenty of material: some ideas want a question
 * right after the paragraph that taught them. `LessonContent.steps` is an
 * ordered list of these, so an author decides the run themselves.
 *
 * The objective screen is always first and is not part of the list; the
 * interactive game is appended when the lesson has one, unless a `challenge` step
 * already says where it goes.
 */
export type LessonStep =
  | { kind: "goal" }
  | { kind: "section"; section: ContentSection }
  | { kind: "terms"; terms: KeyTerm[] }
  | { kind: "quiz"; question: QuizQuestion }
  | { kind: "challenge" };

export interface LessonContent {
  /** One line stating what the learner will be able to do afterwards. */
  goal: string;
  /**
   * The authored run. When absent, the run is derived from the pools below in the
   * historical order, so every lesson written before this existed keeps working.
   */
  steps?: LessonStep[];
  sections?: ContentSection[];
  terms?: KeyTerm[];
  quiz?: QuizQuestion[];
}
