/**
 * Exercises the writer's pure export/validation layer: ordered steps survive the
 * round trip, an uploaded image becomes a real file with a rewritten path, and a
 * blank option above the answer does not shift the answer key.
 */
import fs from "node:fs";
import ts from "typescript";

const source = fs.readFileSync("src/lib/writerDraft.ts", "utf8");
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText;

const dataUrl = "data:text/javascript;base64," + Buffer.from(js).toString("base64");
const W = await import(dataUrl);

let failures = 0;
const check = (name, condition, detail) => {
  if (condition) {
    console.log("  ok   " + name);
  } else {
    failures += 1;
    console.log("  FAIL " + name + (detail ? " — " + JSON.stringify(detail) : ""));
  }
};

// A 1x1 transparent PNG.
const PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==";

const draft = {
  ...W.emptyModule(),
  id: "mod-test",
  num: 9,
  trackId: "programming-cs-foundations",
  title: "Test moduli",
  titleEn: "Test module",
  description: "Sinov",
  tagline: "Sinov",
  topics: ["loops"],
  levels: [
    {
      id: "mod-test-l1",
      num: 1,
      title: "Sinov bosqichi",
      summary: "Qadamlarni sinaymiz",
      lessons: [
        {
          id: "mod-test-l1-1",
          title: "Aralash tartib",
          kind: "exercise",
          xp: 15,
          estMinutes: 5,
          gameId: "",
          content: {
            goal: "Qadamlar tartibini sinash.",
            steps: [
              {
                kind: "section",
                section: { heading: "Birinchi bo'lim", body: ["Matn."] },
              },
              {
                kind: "quiz",
                question: {
                  question: "Savol?",
                  // A blank option sits above the marked answer on purpose.
                  options: ["", "To'g'ri javob", "Yolg'on javob"],
                  correctIndex: 1,
                  explanation: "Shuning uchun.",
                },
              },
              { kind: "challenge" },
              {
                kind: "section",
                section: {
                  heading: "O'yindan keyingi bo'lim",
                  body: ["Xulosa."],
                  image: {
                    src: "data:image/png;base64," + PNG,
                    alt: "Sinov rasmi",
                    caption: "Yuklangan rasm",
                  },
                },
              },
              { kind: "terms", terms: [{ en: "loop", uz: "sikl", note: "Takrorlash." }] },
            ],
          },
        },
      ],
    },
  ],
};

// ── Validation ──────────────────────────────────────────────────────────────
const issues = W.validateDraft(draft, {
  existingModuleIds: ["mod-1", "mod-2"],
  existingLessonIds: ["m1-l1-1"],
  existingTrackIds: ["programming-cs-foundations"],
});
const errors = issues.filter((i) => i.level === "error");
check("a fully filled draft has no errors", errors.length === 0, errors.map((e) => e.message));

// ── Export ──────────────────────────────────────────────────────────────────
const files = W.buildExportFiles(draft, [
  {
    id: "programming-cs-foundations",
    category: "BOSHLANG'ICH",
    title: "Dasturiy Tafakkur",
    titleEn: "Foundations",
    description: "…",
    colorTheme: "#22C55E",
  },
]);

const paths = files.map((f) => f.path);
check(
  "module file written",
  paths.includes("content/modules/programming-cs-foundations/mod-test.json"),
  paths
);
check(
  "lesson file written",
  paths.includes("content/lessons/programming-cs-foundations/mod-test-l1-1.json"),
  paths
);
check(
  "uploaded image became a real file",
  paths.includes("public/images/lessons/mod-test-l1-1-1.png"),
  paths
);
check("no tracks.json when the track already exists", !paths.includes("content/tracks.json"));

const imageFile = files.find((f) => f.path === "public/images/lessons/mod-test-l1-1-1.png");
check("image is exported as binary base64", imageFile?.base64 === PNG);

const lesson = JSON.parse(
  files.find((f) => f.path.endsWith("mod-test-l1-1.json")).contents
);
check(
  "step order is preserved",
  JSON.stringify(lesson.steps.map((s) => s.kind)) ===
    JSON.stringify(["section", "quiz", "challenge", "section", "terms"]),
  lesson.steps.map((s) => s.kind)
);
check(
  "image src rewritten to a project path",
  lesson.steps[3].section.image.src === "/images/lessons/mod-test-l1-1-1.png",
  lesson.steps[3].section.image
);
check("image caption kept", lesson.steps[3].section.image.caption === "Yuklangan rasm");
check(
  "blank option dropped and the answer key remapped",
  lesson.steps[1].question.options.length === 2 &&
    lesson.steps[1].question.options[lesson.steps[1].question.correctIndex] === "To'g'ri javob",
  lesson.steps[1].question
);
check("legacy pools are not emitted alongside steps", !("sections" in lesson) && !("quiz" in lesson));

// ── Guard rails ─────────────────────────────────────────────────────────────
const withBlankAnswer = structuredClone(draft);
withBlankAnswer.levels[0].lessons[0].content.steps[1].question.correctIndex = 0;
const blankIssues = W.validateDraft(withBlankAnswer, {
  existingTrackIds: ["programming-cs-foundations"],
});
check(
  "marking a blank option as the answer is an error",
  blankIssues.some((i) => i.level === "error" && /bo'sh variantga/.test(i.message)),
  blankIssues.map((i) => i.message)
);

const conceptWithGame = structuredClone(draft);
conceptWithGame.levels[0].lessons[0].kind = "concept";
const conceptIssues = W.validateDraft(conceptWithGame, {
  existingTrackIds: ["programming-cs-foundations"],
});
check(
  "a game step in a concept lesson is an error",
  conceptIssues.some((i) => i.level === "error" && /o'yin ishlatilmaydi/.test(i.message)),
  conceptIssues.map((i) => i.message)
);

const lopsided = structuredClone(draft);
lopsided.levels[0].lessons[0].content.steps[1].question.options = [
  "Ha",
  "Bu juda uzun va batafsil yozilgan to'g'ri javob variantidir",
  "Yo'q",
];
lopsided.levels[0].lessons[0].content.steps[1].question.correctIndex = 1;
const lopsidedIssues = W.validateDraft(lopsided, {
  existingTrackIds: ["programming-cs-foundations"],
});
check(
  "a giveaway-long answer is warned about",
  lopsidedIssues.some((i) => i.level === "warning" && /sezilarli uzun/.test(i.message)),
  lopsidedIssues.filter((i) => i.level === "warning").map((i) => i.message)
);

const oversized = structuredClone(draft);
oversized.levels[0].lessons[0].content.steps[3].section.image.src =
  "data:image/png;base64," + "A".repeat(4 * 1024 * 1024);
const oversizedIssues = W.validateDraft(oversized, {
  existingTrackIds: ["programming-cs-foundations"],
});
check(
  "an oversized upload is an error",
  oversizedIssues.some((i) => i.level === "error" && /juda katta/.test(i.message))
);

// ── Legacy content still reads ──────────────────────────────────────────────
const legacy = W.toDraftContent({
  goal: "Eski shakl",
  sections: [{ heading: "A", body: ["x"] }],
  terms: [{ en: "loop", uz: "sikl", note: "n" }],
  quiz: [{ question: "q", options: ["a", "b"], correctIndex: 0, explanation: "e" }],
});
check(
  "legacy pools convert to a step list",
  JSON.stringify(legacy.steps.map((s) => s.kind)) ===
    JSON.stringify(["section", "terms", "quiz"]),
  legacy.steps.map((s) => s.kind)
);

// A new track has to reach content/tracks.json.
const newTrackDraft = structuredClone(draft);
newTrackDraft.trackId = "web-development";
newTrackDraft.newTrack = {
  id: "web-development",
  category: "O'RTA BOSQICH",
  title: "Veb dasturlash",
  titleEn: "Web development",
  description: "Sinov",
  colorTheme: "#3B82F6",
  isSoon: false,
};
const withTrack = W.buildExportFiles(newTrackDraft, [
  {
    id: "programming-cs-foundations",
    category: "BOSHLANG'ICH",
    title: "Dasturiy Tafakkur",
    titleEn: "Foundations",
    description: "…",
    colorTheme: "#22C55E",
  },
]);
const tracksFile = withTrack.find((f) => f.path === "content/tracks.json");
check("a new track emits tracks.json", Boolean(tracksFile));
if (tracksFile) {
  const tracks = JSON.parse(tracksFile.contents);
  check(
    "tracks.json keeps the existing track and appends the new one",
    tracks.length === 2 && tracks[1].id === "web-development",
    tracks.map((t) => t.id)
  );
  check(
    "new-track lesson files land in its own folder",
    withTrack.some((f) => f.path === "content/lessons/web-development/mod-test-l1-1.json"),
    withTrack.map((f) => f.path)
  );
}

console.log(failures === 0 ? "\nAll export checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
