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
  "lists",
];

function findJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      results.push(fullPath);
    }
  }
  return results;
}

// ── Curriculum lesson ids, read from the authored module files ───────────────
const curriculumIds = [];
const moduleFiles = findJsonFiles(modulesDir);

if (moduleFiles.length === 0) {
  errors.push("Missing content/modules — run scripts/export-modules.mjs first");
} else {
  for (const fullPath of moduleFiles) {
    const file = path.basename(fullPath);
    let module;
    try {
      module = JSON.parse(fs.readFileSync(fullPath, "utf8"));
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
const lessonFiles = findJsonFiles(contentDir);
const authoredIds = lessonFiles.map((f) => path.basename(f).replace(/\.json$/, ""));

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

const STEP_KINDS = ["goal", "section", "terms", "quiz", "challenge"];

/**
 * A lesson body is either an ordered `steps` list or the older pools. Both are
 * flattened to the same three collections here so the checks below only have one
 * shape to know about. Mirrors src/lib/lessonSteps.ts.
 */
function flatten(data, fail) {
  if (Array.isArray(data.steps)) {
    if (data.steps.length === 0) fail("steps must not be empty");
    const sections = [];
    const terms = [];
    const quiz = [];
    let challenges = 0;

    data.steps.forEach((step, i) => {
      if (!step || !STEP_KINDS.includes(step.kind)) {
        fail(`steps[${i}].kind must be one of ${STEP_KINDS.join(", ")}`);
        return;
      }
      if (step.kind === "section") {
        if (!step.section) fail(`steps[${i}].section missing`);
        else sections.push({ at: `steps[${i}].section`, value: step.section });
      } else if (step.kind === "terms") {
        if (!Array.isArray(step.terms)) fail(`steps[${i}].terms must be an array`);
        else step.terms.forEach((t, k) => terms.push({ at: `steps[${i}].terms[${k}]`, value: t }));
      } else if (step.kind === "quiz") {
        if (!step.question) fail(`steps[${i}].question missing`);
        else quiz.push({ at: `steps[${i}].question`, value: step.question });
      } else if (step.kind === "challenge") {
        challenges += 1;
      }
    });

    if (challenges > 1) fail("only one challenge step is allowed");
    return { sections, terms, quiz };
  }

  const wrap = (arr, name) =>
    (Array.isArray(arr) ? arr : []).map((value, i) => ({ at: `${name}[${i}]`, value }));

  if (!Array.isArray(data.sections) || data.sections.length === 0) {
    fail("sections must be a non-empty array (or use steps)");
  }
  if (!Array.isArray(data.terms)) fail("terms must be an array");
  if (!Array.isArray(data.quiz) || data.quiz.length === 0) {
    fail("quiz must be a non-empty array (or use steps)");
  }

  return {
    sections: wrap(data.sections, "sections"),
    terms: wrap(data.terms, "terms"),
    quiz: wrap(data.quiz, "quiz"),
  };
}

const BLOCK_KINDS = ["text", "code", "image", "callout"];

/**
 * A screen is either an ordered `blocks` list or the older fixed fields. Both are
 * flattened to the same list here. Mirrors sectionBlocks() in src/lib/lessonSteps.ts.
 */
function flattenBlocks(section) {
  if (Array.isArray(section.blocks) && section.blocks.length > 0) {
    return section.blocks.map((value, i) => ({ at: `blocks[${i}]`, value }));
  }

  const blocks = [];
  for (const paragraph of section.body ?? []) {
    if (String(paragraph).trim()) blocks.push({ at: "body", value: { kind: "text", text: paragraph } });
  }
  if (section.image) blocks.push({ at: "image", value: { kind: "image", image: section.image } });
  if (section.code) {
    blocks.push({ at: "code", value: { kind: "code", ...section.code } });
  }
  if (section.callout) {
    blocks.push({ at: "callout", value: { kind: "callout", text: section.callout } });
  }
  return blocks;
}

/** Uploaded images must have been turned into real files before they land here. */
function checkImage(image, at, fail, warn) {
  if (!image) {
    fail(`${at}.image missing`);
    return;
  }
  if (!isNonEmptyString(image.src)) {
    fail(`${at}.image.src missing`);
    return;
  }
  const src = image.src.trim();
  if (src.startsWith("data:")) {
    fail(`${at}.image.src is still an inline upload — export it as a file under public/`);
  } else if (!/^(\/|https?:\/\/)/.test(src)) {
    fail(`${at}.image.src must start with "/" or http(s)://`);
  } else if (src.startsWith("/")) {
    const onDisk = path.join(repoRoot, "public", src.replace(/^\//, ""));
    if (!fs.existsSync(onDisk)) fail(`${at}.image.src points at a missing file: public${src}`);
  }
  if (!isNonEmptyString(image.alt)) warn(`${at}.image.alt missing — screen readers read nothing`);
}

let lengthTells = 0;

for (const fullPath of lessonFiles) {
  const file = path.basename(fullPath);
  const id = file.replace(/\.json$/, "");
  let data;
  try {
    data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (err) {
    errors.push(`${file}: invalid JSON — ${err.message}`);
    continue;
  }

  const fail = (msg) => errors.push(`${id}: ${msg}`);
  const warn = (msg) => warnings.push(`${id}: ${msg}`);

  if (!isNonEmptyString(data.goal)) fail("goal must be a non-empty string");

  const { sections, terms, quiz } = flatten(data, fail);

  if (sections.length === 0) fail("no sections — a lesson needs something to read");
  for (const { at, value: section } of sections) {
    if (!isNonEmptyString(section.heading)) fail(`${at}.heading missing`);

    const blocks = flattenBlocks(section);
    if (blocks.length === 0) {
      fail(`${at} is empty — needs a text, code or image block`);
    }

    for (const { at: blockAt, value: block } of blocks) {
      const where = `${at}.${blockAt}`;
      if (!block || !BLOCK_KINDS.includes(block.kind)) {
        fail(`${where}.kind must be one of ${BLOCK_KINDS.join(", ")}`);
        continue;
      }
      if (block.kind === "text" || block.kind === "callout") {
        if (!isNonEmptyString(block.text)) fail(`${where}.text is empty`);
      } else if (block.kind === "code") {
        if (!Array.isArray(block.lines) || block.lines.length === 0) {
          fail(`${where}.lines must be a non-empty array`);
        }
      } else {
        checkImage(block.image, where, fail, warn);
      }
    }
  }

  for (const { at, value: term } of terms) {
    if (!isNonEmptyString(term.en)) fail(`${at}.en missing`);
    if (!isNonEmptyString(term.uz)) fail(`${at}.uz missing`);
    if (!isNonEmptyString(term.note)) fail(`${at}.note missing`);
  }

  if (quiz.length === 0) fail("no quiz questions");
  for (const { at, value: question } of quiz) {
    if (!isNonEmptyString(question.question)) fail(`${at}.question missing`);
    if (!Array.isArray(question.options) || question.options.length < 2) {
      fail(`${at}.options needs at least two entries`);
      continue;
    }
    if (
      !Number.isInteger(question.correctIndex) ||
      question.correctIndex < 0 ||
      question.correctIndex >= question.options.length
    ) {
      fail(`${at}.correctIndex out of range`);
      continue;
    }
    if (!isNonEmptyString(question.explanation)) fail(`${at}.explanation missing`);

    /*
     * Testers learned to pick the longest option instead of reading. A distractor
     * set that is much shorter than the answer gives the question away, so it is
     * reported as a content defect rather than left to be discovered again.
     */
    const options = question.options.map((o) => String(o).trim());
    const answer = options[question.correctIndex];
    const others = options.filter((_, i) => i !== question.correctIndex);
    /*
     * Short options (numbers, operators, single words) carry no signal in their
     * length. For sentence-length options it is the whole game: at least one
     * distractor has to be longer than the answer, or "pick the longest one"
     * keeps working without reading the question.
     */
    if (answer.length >= 15 && !others.some((o) => o.length > answer.length)) {
      lengthTells += 1;
      warn(`${at}: the correct option is the longest one (${answer.length} chars vs ${others.map((o) => o.length).join(", ")}) — lengthen a distractor`);
    }
  }
}

// ── Report ──────────────────────────────────────────────────────────────────
console.log(
  `Checked ${lessonFiles.length} content files against ${curriculumIds.length} lessons in content/modules.`
);
if (lengthTells > 0) {
  console.log(`  ${lengthTells} question(s) where the correct option is the longest — a giveaway.`);
}
for (const w of warnings) console.warn(`  warn  ${w}`);
for (const e of errors) console.error(`  FAIL  ${e}`);

if (errors.length > 0) {
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log(warnings.length ? "\nOK, with warnings." : "\nAll content valid.");
