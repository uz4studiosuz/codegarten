/**
 * One-off migration: turn the authored TypeScript lesson modules into one JSON
 * file per lesson under content/lessons/. Run with:
 *
 *   node scripts/export-lesson-content.mjs
 *
 * Kept in the repo so the same trick works if content is ever re-authored in TS.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const repoRoot = process.cwd();
const sourceDir = path.join(repoRoot, "src", "data", "lessonContent");
const outDir = path.join(repoRoot, "content", "lessons");

if (!fs.existsSync(sourceDir)) {
  console.error(`No TS content found at ${sourceDir} — nothing to export.`);
  process.exit(1);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cg-content-"));

console.log("Compiling TS content modules...");
// Invoke tsc's JS entry point directly: spawning npx.cmd fails on Windows.
execFileSync(
  process.execPath,
  [
    path.join(repoRoot, "node_modules", "typescript", "bin", "tsc"),
    ...fs.readdirSync(sourceDir).map((f) => path.join(sourceDir, f)),
    "--outDir",
    tmpDir,
    "--module",
    "commonjs",
    "--target",
    "es2020",
    "--skipLibCheck",
  ],
  { stdio: "inherit" }
);

const { lessonContent } = await import(
  "file://" + path.join(tmpDir, "index.js").replace(/\\/g, "/")
);

fs.mkdirSync(outDir, { recursive: true });
let written = 0;
for (const [lessonId, content] of Object.entries(lessonContent)) {
  fs.writeFileSync(
    path.join(outDir, `${lessonId}.json`),
    JSON.stringify(content, null, 2) + "\n",
    "utf8"
  );
  written += 1;
}

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log(`Wrote ${written} lesson files to ${path.relative(repoRoot, outDir)}`);
