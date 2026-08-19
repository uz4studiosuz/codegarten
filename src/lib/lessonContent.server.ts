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
const LESSON_ID = /^[a-z0-9-_]+$/i;

async function findLessonFile(dir: string, targetName: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = await findLessonFile(full, targetName);
        if (found) return found;
      } else if (entry.isFile() && entry.name === targetName) {
        return full;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export async function getLessonContent(
  lessonId: string
): Promise<LessonContent | null> {
  if (!LESSON_ID.test(lessonId)) return null;

  const targetFileName = `${lessonId}.json`;
  
  // 1. Direct fast lookup in content/lessons root
  const directPath = path.join(CONTENT_DIR, targetFileName);
  try {
    const raw = await fs.readFile(directPath, "utf8");
    return JSON.parse(raw) as LessonContent;
  } catch {
    // 2. Recursive search in subdirectories (e.g. content/lessons/webcoding/ or content/lessons/programming-cs-foundations/)
    const foundPath = await findLessonFile(CONTENT_DIR, targetFileName);
    if (!foundPath) return null;
    try {
      const raw = await fs.readFile(foundPath, "utf8");
      return JSON.parse(raw) as LessonContent;
    } catch {
      return null;
    }
  }
}

async function collectAllLessonIds(dir: string): Promise<string[]> {
  let results: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(await collectAllLessonIds(full));
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        results.push(entry.name.replace(/\.json$/, ""));
      }
    }
  } catch {}
  return results;
}

/** Every authored lesson id, used by the validation script and tests. */
export async function listAuthoredLessonIds(): Promise<string[]> {
  return collectAllLessonIds(CONTENT_DIR);
}
