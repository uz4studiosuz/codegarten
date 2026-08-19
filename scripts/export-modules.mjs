/**
 * One-off migration: split the modules hard-coded in src/data/curriculum.ts into
 * one JSON file per module under content/modules/, plus content/tracks.json.
 *
 *   node scripts/export-modules.mjs
 *
 * After this, curriculum data is authored as JSON and picked up by
 * scripts/build-curriculum.mjs, so new modules need no TypeScript edits.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const repoRoot = process.cwd();
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cg-modules-"));

console.log("Compiling curriculum...");
execFileSync(
  process.execPath,
  [
    path.join(repoRoot, "node_modules", "typescript", "bin", "tsc"),
    path.join(repoRoot, "src", "data", "curriculum.ts"),
    "--outDir",
    tmpDir,
    "--module",
    "commonjs",
    "--target",
    "es2020",
    "--skipLibCheck",
    "--resolveJsonModule",
  ],
  { stdio: "inherit" }
);

const mod = await import(
  "file://" + path.join(tmpDir, "curriculum.js").replace(/\\/g, "/")
);
const { foundationsTrack, upcomingTracks } = mod;

const modulesDir = path.join(repoRoot, "content", "modules");
fs.mkdirSync(modulesDir, { recursive: true });

// Track metadata without the modules — those become their own files.
const tracks = [foundationsTrack, ...upcomingTracks].map((t) => ({
  id: t.id,
  category: t.category,
  title: t.title,
  titleEn: t.titleEn,
  description: t.description,
  colorTheme: t.colorTheme,
}));

fs.writeFileSync(
  path.join(repoRoot, "content", "tracks.json"),
  JSON.stringify(tracks, null, 2) + "\n",
  "utf8"
);

let count = 0;
for (const track of [foundationsTrack, ...upcomingTracks]) {
  for (const m of track.modules) {
    const out = {
      id: m.id,
      num: m.num,
      trackId: track.id,
      title: m.title,
      titleEn: m.titleEn,
      description: m.description,
      tagline: m.tagline,
      imageSrc: m.imageSrc,
      accent: m.accent,
      levels: m.levels.map((level) => ({
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
          ...(lesson.challengeId ? { gameId: lesson.challengeId } : {}),
        })),
      })),
    };
    fs.writeFileSync(
      path.join(modulesDir, `${m.id}.json`),
      JSON.stringify(out, null, 2) + "\n",
      "utf8"
    );
    count += 1;
  }
}

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log(`Wrote ${count} module files and content/tracks.json`);
