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
const modulesDir = path.join(repoRoot, "content", "modules");

const errors = [];
const warnings = [];

/** Mirrors GameTopic in src/games/topics.ts. */
const KNOWN_TOPICS = [
  "sequencing",
  "debugging",
  "loops",
  "functions",
  "conditionals",
  "variables",
  "efficiency",
  "geometry",
];

// ── Curriculum lesson ids, read from the authored module files ───────────────
const curriculumIds = [];
if (!fs.existsSync(modulesDir)) {
  errors.push("Missing content/modules — run scripts/export-modules.mjs first");
} else {
  for (const file of fs.readdirSync(modulesDir).filter((f) => f.endsWith(".json"))) {
    let module;
    try {
      module = JSON.parse(fs.readFileSync(path.join(modulesDir, file), "utf8"));
    } catch (err) {
      errors.push(`modules/${file}: invalid JSON — ${err.message}`);
      continue;
    }
    // Topics decide which interactive game each lesson ends with, so a typo
    // here silently downgrades every exercise in the module to a fallback game.
    for (const topic of module.topics ?? []) {
      if (!KNOWN_TOPICS.includes(topic)) {
        errors.push(
          `modules/${file}: unknown topic "${topic}" — expected one of ${KNOWN_TOPICS.join(", ")}`
        );
      }
    }
    if (!module.topics || module.topics.length === 0) {
      warnings.push(
        `modules/${file}: no topics — its exercises fall back to a generic game`
      );
    }

    for (const level of module.levels ?? []) {
      for (const lesson of level.lessons ?? []) {
        if (lesson.id) curriculumIds.push(lesson.id);
      }
    }
  }
}

if (curriculumIds.length === 0) {
  errors.push("No lesson ids found in content/modules/*.json");
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
  `Checked ${files.length} content files against ${curriculumIds.length} lessons in content/modules.`
);
for (const w of warnings) console.warn(`  warn  ${w}`);
for (const e of errors) console.error(`  FAIL  ${e}`);

if (errors.length > 0) {
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log(warnings.length ? "\nOK, with warnings." : "\nAll content valid.");
