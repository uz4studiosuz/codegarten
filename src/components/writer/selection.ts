/**
 * What the writer is currently editing. One shared shape, because the tree, the
 * inspector and the live preview all have to agree on it: clicking a lesson in
 * the preview selects it in the tree and opens its form, and vice versa.
 */
export type Selection =
  | { kind: "module" }
  | { kind: "level"; levelIndex: number }
  | { kind: "lesson"; levelIndex: number; lessonIndex: number };

/** Keeps a selection pointing at something that still exists after a delete. */
export function clampSelection(
  selection: Selection,
  levels: readonly { lessons: readonly unknown[] }[]
): Selection {
  if (levels.length === 0) return { kind: "module" };
  if (selection.kind === "module") return selection;

  const levelIndex = Math.min(selection.levelIndex, levels.length - 1);
  if (selection.kind === "level") return { kind: "level", levelIndex };

  const lessons = levels[levelIndex].lessons;
  if (lessons.length === 0) return { kind: "level", levelIndex };
  return {
    kind: "lesson",
    levelIndex,
    lessonIndex: Math.min(selection.lessonIndex, lessons.length - 1),
  };
}
