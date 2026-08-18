/**
 * Content guard rail. Run with:  npm run content:check
 *
 * Checks that every curriculum lesson has a JSON file, that no orphan files
 * exist, and that each file matches the LessonContent shape. Exits non-zero on
 * failure so it can gate CI.
 */
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const contentDir = path.join(repoRoot, "content", "lessons");
const curriculumFile = path.join(repoRoot, "src", "data", "curriculum.ts");

const errors = [];
const warnings = [];

// ── Curriculum lesson ids, read straight from the source of truth ───────────
const curriculumSrc = fs.readFileSync(curriculumFile, "utf8");
const curriculumIds = [...curriculumSrc.matchAll(/L\("([a-z0-9-]+)",/g)].map(
  (m) => m[1]
);

if (curriculumIds.length === 0) {
  errors.push("Could not read any lesson ids from src/data/curriculum.ts");
}

// ── Authored files ──────────────────────────────────────────────────────────
const files = fs.existsSync(contentDir)
  ? fs.readdirSync(contentDir).filter((f) => f.endsWith(".json"))
  : [];
const authoredIds = files.map((f) => f.replace(/\.json$/, ""));

for (const id of curriculumIds) {
  if (!authoredIds.includes(id)) errors.push(`Missing content file: ${id}.json`);
}
for (const id of authoredIds) {
  if (!curriculumIds.includes(id)) {
    warnings.push(`Orphan content file (no such lesson in curriculum): ${id}.json`);
  }
}

// ── Shape checks ────────────────────────────────────────────────────────────
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

for (const file of files) {
  const id = file.replace(/\.json$/, "");
  let data;
  try {
    data = JSON.parse(fs.readFileSync(path.join(contentDir, file), "utf8"));
  } catch (err) {
    errors.push(`${file}: invalid JSON — ${err.message}`);
    continue;
  }

  const fail = (msg) => errors.push(`${id}: ${msg}`);

  if (!isNonEmptyString(data.goal)) fail("goal must be a non-empty string");

  if (!Array.isArray(data.sections) || data.sections.length === 0) {
    fail("sections must be a non-empty array");
  } else {
    data.sections.forEach((section, i) => {
      if (!isNonEmptyString(section.heading)) fail(`sections[${i}].heading missing`);
      if (!Array.isArray(section.body) || section.body.length === 0) {
        fail(`sections[${i}].body must be a non-empty array`);
      }
      if (section.code && !Array.isArray(section.code.lines)) {
        fail(`sections[${i}].code.lines must be an array`);
      }
    });
  }

  if (!Array.isArray(data.terms)) {
    fail("terms must be an array");
  } else {
    data.terms.forEach((term, i) => {
      if (!isNonEmptyString(term.en)) fail(`terms[${i}].en missing`);
      if (!isNonEmptyString(term.uz)) fail(`terms[${i}].uz missing`);
      if (!isNonEmptyString(term.note)) fail(`terms[${i}].note missing`);
    });
  }

  if (!Array.isArray(data.quiz) || data.quiz.length === 0) {
    fail("quiz must be a non-empty array");
  } else {
    data.quiz.forEach((question, i) => {
      if (!isNonEmptyString(question.question)) fail(`quiz[${i}].question missing`);
      if (!Array.isArray(question.options) || question.options.length < 2) {
        fail(`quiz[${i}].options needs at least two entries`);
      } else if (
        !Number.isInteger(question.correctIndex) ||
        question.correctIndex < 0 ||
        question.correctIndex >= question.options.length
      ) {
        fail(`quiz[${i}].correctIndex out of range`);
      }
      if (!isNonEmptyString(question.explanation)) {
        fail(`quiz[${i}].explanation missing`);
      }
    });
  }
}

// ── Report ──────────────────────────────────────────────────────────────────
console.log(
  `Checked ${files.length} content files against ${curriculumIds.length} curriculum lessons.`
);
for (const w of warnings) console.warn(`  warn  ${w}`);
for (const e of errors) console.error(`  FAIL  ${e}`);

if (errors.length > 0) {
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log(warnings.length ? "\nOK, with warnings." : "\nAll content valid.");
