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

const moduleFiles = fs.existsSync(modulesDir)
  ? fs.readdirSync(modulesDir).filter((f) => f.endsWith(".json"))
  : [];

const modules = moduleFiles.map((file) => {
  const data = JSON.parse(fs.readFileSync(path.join(modulesDir, file), "utf8"));
  if (!data.id) throw new Error(`${file}: missing "id"`);
  if (!data.trackId) throw new Error(`${file}: missing "trackId"`);
  if (!Array.isArray(data.levels)) throw new Error(`${file}: "levels" must be an array`);
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
  modules: modules
    .filter((m) => m.trackId === track.id)
    .sort((a, b) => a.num - b.num)
    // trackId was only needed for grouping.
    .map(({ trackId, ...rest }) => rest),
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
