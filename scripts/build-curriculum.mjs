/**
 * Aggregates the authored curriculum into a single generated file the app
 * imports. Runs automatically before dev and build (see predev / prebuild), so
 * dropping a new content/modules/<id>.json into the project is enough to
 * register a module — no TypeScript edits.
 *
 *   node scripts/build-curriculum.mjs
 */
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const modulesDir = path.join(repoRoot, "content", "modules");
const tracksFile = path.join(repoRoot, "content", "tracks.json");
const outFile = path.join(repoRoot, "src", "data", "curriculum.generated.json");

if (!fs.existsSync(tracksFile)) {
  console.error(`Missing ${path.relative(repoRoot, tracksFile)}`);
  process.exit(1);
}

const tracks = JSON.parse(fs.readFileSync(tracksFile, "utf8"));

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

const moduleFiles = findJsonFiles(modulesDir);

const modules = moduleFiles.map((fullFilePath) => {
  const fileRel = path.relative(modulesDir, fullFilePath);
  const data = JSON.parse(fs.readFileSync(fullFilePath, "utf8"));
  if (!data.id) throw new Error(`${fileRel}: missing "id"`);
  if (!data.trackId) throw new Error(`${fileRel}: missing "trackId"`);
  if (!Array.isArray(data.levels)) throw new Error(`${fileRel}: "levels" must be an array`);
  return data;
});

// Duplicate ids would make lookups ambiguous, so fail loudly.
const seen = new Set();
for (const m of modules) {
  if (seen.has(m.id)) throw new Error(`Duplicate module id: ${m.id}`);
  seen.add(m.id);
}

const knownTrackIds = new Set(tracks.map((t) => t.id));
for (const m of modules) {
  if (!knownTrackIds.has(m.trackId)) {
    throw new Error(`${m.id}: unknown trackId "${m.trackId}"`);
  }
}

const assembled = tracks.map((track) => ({
  ...track,
  isSoon: track.isSoon !== undefined ? Boolean(track.isSoon) : false,
  modules: modules
    .filter((m) => m.trackId === track.id)
    .sort((a, b) => a.num - b.num)
    // trackId was only needed for grouping.
    .map(({ trackId, ...rest }) => ({
      ...rest,
      accent: rest.accent || track.colorTheme || "#22C55E",
    })),
}));

const lessonCount = modules.reduce(
  (sum, m) => sum + m.levels.reduce((s, l) => s + l.lessons.length, 0),
  0
);

fs.writeFileSync(
  outFile,
  JSON.stringify({ tracks: assembled }, null, 2) + "\n",
  "utf8"
);

console.log(
  `Curriculum built: ${tracks.length} tracks, ${modules.length} modules, ${lessonCount} lessons ` +
    `-> ${path.relative(repoRoot, outFile)}`
);
