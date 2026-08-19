/**
 * Codegarten curriculum
 * ---------------------
 * Structure only: track → modules → levels → lessons. Progress, XP and
 * unlocking are derived from this shape (see ProgressContext), never stored here.
 *
 * The data itself is authored as JSON under content/modules/ and aggregated into
 * curriculum.generated.json by scripts/build-curriculum.mjs, which runs before
 * dev and build. To add a module, drop in a JSON file — no edits here.
 */

import generated from "./curriculum.generated.json";

export type LessonKind = "concept" | "exercise" | "challenge" | "review";

export interface Lesson {
  id: string;
  title: string;
  kind: LessonKind;
  /** Awarded once, the first time the lesson is completed. */
  xp: number;
  estMinutes: number;
  /** Which interactive game to finish with. Falls back to a rotation when absent. */
  gameId?: string;
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
  category: string;
  title: string;
  titleEn: string;
  description: string;
  colorTheme: string;
  /** Tracks without modules render as "Tez kunda" teasers. */
  modules: CourseModule[];
}

// ── Loaded data ─────────────────────────────────────────────────────────────

export const allTracks: Track[] = generated.tracks as Track[];

/** The main track learners start on — the first one that actually has modules. */
export const foundationsTrack: Track =
  allTracks.find((t) => t.modules.length > 0) ?? allTracks[0];

export const upcomingTracks: Track[] = allTracks.filter(
  (t) => t.id !== foundationsTrack.id
);

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
  for (const track of allTracks) {
    const found = track.modules.find((m) => m.id === moduleId);
    if (found) return found;
  }
  return undefined;
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
 * Which interactive game a lesson opens. Authored content wins; until a lesson
 * names one, lessons rotate through the built-in games so every node is playable.
 */
const GAME_ROTATION = ["shape-color", "robot-grid"];

export function gameIdFor(lesson: Lesson, moduleIndex: number): string {
  return lesson.gameId ?? GAME_ROTATION[moduleIndex % GAME_ROTATION.length];
}
