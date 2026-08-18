import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import type { LessonContent } from "@/types/lessonContent";

/**
 * Lesson content lives as one JSON file per lesson under content/lessons/ and is
 * read on the server. Only the requested lesson crosses to the client, so the
 * bundle stays flat no matter how much the curriculum grows.
 */
const CONTENT_DIR = path.join(process.cwd(), "content", "lessons");

/** Lesson ids come from the URL, so keep them to the shape the curriculum uses. */
const LESSON_ID = /^[a-z0-9-]+$/i;

export async function getLessonContent(
  lessonId: string
): Promise<LessonContent | null> {
  if (!LESSON_ID.test(lessonId)) return null;

  try {
    const raw = await fs.readFile(path.join(CONTENT_DIR, `${lessonId}.json`), "utf8");
    return JSON.parse(raw) as LessonContent;
  } catch {
    // Missing or unreadable file — the page renders its not-found state.
    return null;
  }
}

/** Every authored lesson id, used by the validation script and tests. */
export async function listAuthoredLessonIds(): Promise<string[]> {
  const files = await fs.readdir(CONTENT_DIR);
  return files
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}
