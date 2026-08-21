"use client";

import React, { useEffect, useMemo, useState } from "react";
import { IconBug, IconPencil } from "@tabler/icons-react";
import type { GameProps } from "../types";
import { bool, enumValue, hasConfig, int, str } from "../config";
import {
  GameBoard,
  GameHowTo,
  GameNote,
  GameShell,
  pickVariant,
  seededShuffle,
  useGameCheck,
} from "../shared";

/**
 * Find the broken line — and say what it should have been
 * ------------------------------------------------------
 * Debugging is a separate skill from writing: the program looks reasonable and
 * still misbehaves. The learner reads a short program against a stated goal and
 * marks the one line that breaks it — then sees why it did.
 *
 * The first version stopped there, which taught only one bug class. Real
 * debugging is far more often changing one symbol — `>` to `>=`, `5` to `4`, one
 * level of indentation — than removing a line, and the curriculum's debugging
 * level teaches exactly those three. So a puzzle now comes in one of two modes:
 *
 *   find — mark the line that breaks the goal (a genuinely redundant or
 *          self-defeating line; the fix is to drop or rethink it), and
 *   fix  — mark the line AND pick the replacement that makes the program meet
 *          its goal.
 *
 * In fix mode the candidate replacements are one puzzle-wide strip, not a list
 * per line: candidates that belonged to the picked line would announce which
 * line was broken the moment the learner tapped anything. They are shuffled per
 * lesson for the same reason.
 *
 * More than one replacement can be right — `toki i <= 5` and `toki i < 6` are the
 * same loop — so acceptance is a set rather than one answer. A wrong attempt says
 * only that the program still misses its goal: naming which half was wrong would
 * hand over the other half.
 *
 * Indentation is drawn with guide columns rather than left as blank space,
 * because in one of the three bug kinds the indentation *is* the difference
 * between two candidates.
 */

type Mode = "find" | "fix";

/** What a fix puzzle rehearses, so the lesson teaching that bug kind gets it. */
type Tag = "compare" | "bound" | "indent" | "swap" | "direction";

interface Fix {
  /** Replacement for the broken line, leading spaces and all. */
  text: string;
  /** Whether the program actually meets its goal once this replacement is in. */
  ok: boolean;
}

interface Puzzle {
  mode: Mode;
  goal: string;
  hint: string;
  lines: string[];
  /** Index of the single line that breaks the goal. */
  badIndex: number;
  /** fix mode: the replacements on offer, right and wrong mixed. */
  fixes?: Fix[];
  tag?: Tag;
  /** Shown after a correct answer — the teaching moment. */
  why: string;
}

const ok = (text: string): Fix => ({ text, ok: true });
const no = (text: string): Fix => ({ text, ok: false });

/**
 * Ordered simplest first, because the lesson ordinal walks this list: the find
 * puzzles come first and the fix puzzles after them. The three lessons that
 * teach a specific bug kind reach their fix puzzle through `prefer` below rather
 * than by waiting for the ordinal to get that far.
 */
const PUZZLES: Puzzle[] = [
  {
    mode: "find",
    goal: "Robot 3 katak oldinga yurishi kerak edi. Buyruqlar ichida ortiqcha qadam bor.",
    hint: "Har bir qatorni maqsad bilan solishtirib o'qing.",
    lines: ["oldinga()", "oldinga()", "o'ngga_burl()", "oldinga()"],
    badIndex: 2,
    why: "Burilish robotni yo'nalishdan chiqaradi — 3 marta oldinga yurish uchun faqat oldinga() kerak.",
  },
  {
    mode: "find",
    goal: "Robot to'rt marta signal berishi kerak edi, lekin jim qoldi.",
    hint: "Sikl necha marta aylanishini boshlang'ich qiymat belgilaydi.",
    lines: ["son = 4", "toki son > 4:", "  signal()", "  son = son - 1"],
    badIndex: 1,
    why: "son 4 ga teng bo'lgani uchun \"son > 4\" birinchi tekshiruvda yolg'on chiqdi va sikl umuman ishlamadi.",
  },
  {
    mode: "find",
    goal: "Ro'yxatdagi har bir sonni ekranga chiqarish kerak edi, lekin faqat bittasi chiqdi.",
    hint: "Chiqarish buyrug'i sikl ichida turishi kerak.",
    lines: ["sonlar = [4, 7, 9]", "har son uchun sonlar:", "  hisobla(son)", "chiqar(son)"],
    badIndex: 3,
    why: "chiqar(son) sikldan tashqarida — shuning uchun u faqat bir marta, oxirgi qiymat bilan ishladi.",
  },
  {
    mode: "find",
    goal: "Kvadrat chizilishi kerak edi, lekin shakl yopilmayapti.",
    hint: "Kvadratda 4 tomon va 4 burilish bo'ladi.",
    lines: ["chiz(100)", "burl(90)", "chiz(100)", "burl(90)", "chiz(100)", "burl(45)"],
    badIndex: 5,
    why: "Kvadratning har burchagi 90 daraja. 45 daraja burilish shaklni yopmaydi.",
  },
  {
    mode: "find",
    goal: "Kvadratning yuzini hisoblash kerak edi.",
    hint: "Yuza — tomonni tomonga ko'paytirish.",
    lines: ["tomon = 5", "yuza = tomon + tomon", "chiqar(yuza)"],
    badIndex: 1,
    why: "Qo'shish perimetrning yarmini beradi. Yuza uchun ko'paytirish kerak: tomon * tomon.",
  },
  {
    mode: "find",
    goal: "Uchburchak chizilishi kerak edi, lekin shakl noto'g'ri chiqdi.",
    hint: "Uchburchakda uchta tomon bo'ladi.",
    lines: ["chiz(80)", "burl(120)", "chiz(80)", "burl(120)", "chiz(80)", "chiz(80)"],
    badIndex: 5,
    why: "Oxirgi chiz(80) ortiqcha — uch tomon allaqachon chizilgan va shakl yopilgan edi.",
  },
  {
    mode: "find",
    goal: "Foydalanuvchi 18 yoshdan katta bo'lsa ruxsat berilishi kerak edi.",
    hint: "Tenglikni tekshirish va solishtirish — ikki xil amal.",
    lines: ["yosh = 25", "agar yosh = 18:", "  ruxsat_ber()", "aks holda:", "  rad_et()"],
    badIndex: 1,
    why: "Shart faqat aynan 18 yoshni tekshiradi. \"Katta yoki teng\" (>=) kerak edi, aks holda 25 yosh ham rad etiladi.",
  },
  {
    mode: "find",
    goal: "Ikki o'zgaruvchining qiymati almashishi kerak edi.",
    hint: "Bir qutiga yangi qiymat solinsa, ichidagi eskisi o'chadi.",
    lines: ["a = 5", "b = 9", "a = b", "b = a"],
    badIndex: 2,
    why: "a = b qatoridan keyin 5 raqami hech qayerda qolmaydi — avval vaqtinchalik qutiga saqlash kerak.",
  },
  {
    mode: "find",
    goal: "Sikl 5 marta ishlashi kerak, lekin dastur to'xtamayapti.",
    hint: "Hisoblagich o'zgarmasa, shart hech qachon yolg'on bo'lmaydi.",
    lines: ["son = 0", "toki son < 5:", "  chiz(son)", "  son = son", "yakun"],
    badIndex: 3,
    why: "son = son qiymatni o'zgartirmaydi, shuning uchun shart doim to'g'ri qoladi — cheksiz sikl.",
  },

  /* ── tuzatishni tanlash ── */

  {
    mode: "fix",
    tag: "compare",
    goal:
      "18 yoshdan katta yoki teng bo'lgan har kim ruxsat olishi kerak edi. Hozir aynan 18 yoshdagi odam rad javob oladi.",
    hint: "Chegaradagi qiymatni — aynan 18 ni — qo'lda tekshirib ko'ring.",
    lines: ["yosh = 18", "agar yosh > 18:", "  chiqar(\"ruxsat\")", "aks holda:", "  chiqar(\"rad\")"],
    badIndex: 1,
    fixes: [
      ok("agar yosh >= 18:"),
      ok("agar yosh > 17:"),
      no("agar yosh == 18:"),
      no("yosh = 19"),
    ],
    why:
      "yosh > 18 chegaradagi 18 ni chetda qoldiradi. >= belgisi uni ham qabul qiladi; butun yoshlar uchun > 17 ham aynan shu ma'noni beradi, lekin >= niyatni ochiq ko'rsatadi.",
  },
  {
    mode: "fix",
    tag: "bound",
    goal: "1 dan 5 gacha barcha sonlar ekranga chiqishi kerak edi. Hozir 4 tagacha chiqadi.",
    hint: "Sikl birinchi va oxirgi qanday qiymat bilan aylanishini yozib chiqing.",
    lines: ["i = 1", "toki i <= 4:", "  chiqar(i)", "  i = i + 1"],
    badIndex: 1,
    fixes: [ok("toki i <= 5:"), ok("toki i < 6:"), no("toki i < 5:"), no("i = 0")],
    why:
      "toki i <= 4 sharti 5 ga yetmasdan to'xtadi. Chegarani 5 ga ko'tarish kerak: <= 5 yoki < 6 — ikkisi ham 1 dan 5 gacha aylanadi.",
  },
  {
    mode: "fix",
    tag: "indent",
    goal:
      "soni faqat 80 dan yuqori ballarni sanashi kerak edi. Hozir u hamma ballni sanaydi va 3 chiqaradi.",
    hint: "Qatorning chekinishi u qaysi blok ichida turganini bildiradi.",
    lines: [
      "ballar = [70, 90, 85]",
      "soni = 0",
      "har ball uchun ballar:",
      "  agar ball >= 80:",
      "    chiqar(\"yaxshi\")",
      "  soni = soni + 1",
      "chiqar(soni)",
    ],
    badIndex: 5,
    fixes: [
      ok("    soni = soni + 1"),
      no("soni = soni + 1"),
      no("  agar ball > 80:"),
      no("  soni = 0"),
    ],
    why:
      "soni = soni + 1 qatori shart ichida emas, sikl ichida turgan edi. Bir daraja ichkariga surilgach u faqat shart bajarilganda ishlaydi: 90 va 85 — 2 ta.",
  },
  {
    mode: "fix",
    tag: "swap",
    goal: "a va b qiymatlari almashishi kerak edi: oxirida a = 9, b = 5 bo'lsin.",
    hint: "vaqt qutisida nima turganini har qatordan keyin yozib boring.",
    lines: ["a = 5", "b = 9", "vaqt = a", "a = b", "b = a"],
    badIndex: 4,
    fixes: [ok("b = vaqt"), no("a = vaqt"), no("vaqt = b"), no("b = vaqt - 1")],
    why:
      "a = b qatoridan keyin a da 9 turadi, shuning uchun b = a ikkisini ham 9 qiladi. Eski 5 faqat vaqt qutisida saqlangan — b unisidan olishi kerak.",
  },
  {
    mode: "fix",
    tag: "direction",
    goal: "Ro'yxatdagi eng katta ballni topish kerak edi. Hozir 0 chiqadi.",
    hint: "Shart qachon rost bo'lishi kerak: yangi ball kattaroq bo'lganda-mi, kichikroq bo'lganda-mi?",
    lines: [
      "ballar = [50, 60, 70]",
      "eng = 0",
      "har ball uchun ballar:",
      "  agar ball < eng:",
      "    eng = ball",
      "chiqar(eng)",
    ],
    badIndex: 3,
    fixes: [
      ok("  agar ball > eng:"),
      ok("  agar ball >= eng:"),
      no("  agar eng > ball:"),
      no("  eng = 0"),
    ],
    why:
      "agar ball < eng: sharti hech qachon bajarilmadi, chunki eng 0 dan boshlandi va har bir ball undan katta. Taqqoslashni teskari o'girish kerak: > yoki >= — ikkisi ham 70 ni topadi.",
  },
];

/**
 * The three lessons of the debugging level each teach one bug kind by name, so
 * their titles decide the puzzle instead of the ordinal. Nothing matching leaves
 * the pool whole.
 */
const TAG_WORDS: [Tag, RegExp][] = [
  ["compare", /taqqoslash|belgisi/],
  ["bound", /chegara/],
  ["indent", /joyda|joyi|chekinish/],
  ["swap", /almash/],
];

function preferFor(context: string | undefined): ((puzzle: Puzzle) => boolean) | undefined {
  const words = (context ?? "").toLowerCase();
  const found = TAG_WORDS.find(([, pattern]) => pattern.test(words));
  if (!found) return undefined;
  return (puzzle) => puzzle.tag === found[0];
}

/* ─────────────────────────── author-supplied puzzle ─────────────────────────── */

/** The writer's select gives strings, and an author may well type "ha". */
function readOk(value: unknown): boolean {
  const asBool = bool(value);
  if (asBool !== undefined) return asBool;
  const text = str(value)?.toLowerCase();
  return text === "yes" || text === "ha" || text === "ok" || text === "1";
}

/**
 * Read the replacements by hand rather than through `strList`, for the same
 * reason as `lines` below: one of the three bug kinds is a line at the wrong
 * indentation, and trimming the candidates would make its fix identical to the
 * bug.
 */
function readFixes(value: unknown): Fix[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out: Fix[] = [];
  for (const row of value) {
    if (row === null || typeof row !== "object") continue;
    const raw = (row as Record<string, unknown>).text;
    if (typeof raw !== "string" || raw.trim() === "") continue;
    out.push({ text: raw, ok: readOk((row as Record<string, unknown>).ok) });
  }
  // One candidate is not a choice, and a set with no right answer is unplayable.
  return out.length >= 2 && out.some((fix) => fix.ok) ? out : undefined;
}

/** Builds the puzzle an author configured in the writer, or null if incomplete. */
function fromConfig(config: unknown): Puzzle | null {
  const raw = config as Record<string, unknown>;

  // Read the lines by hand instead of through `strList`: these programs use
  // leading spaces to show what sits inside a loop or a condition, and trimming
  // them would erase the very structure the bug hides in.
  if (!Array.isArray(raw.lines)) return null;
  const lines = raw.lines.filter(
    (line): line is string => typeof line === "string" && line.trim() !== ""
  );
  if (lines.length < 2) return null;

  // Clamping an out-of-range answer would mark some innocent line as the bug,
  // so a config pointing nowhere falls back to the built-in pool instead.
  const badIndex = int(raw.badIndex);
  if (badIndex === undefined || badIndex < 0 || badIndex >= lines.length) return null;

  const fixes = readFixes(raw.fixes);
  // Replacements that were typed but not usable — none of them marked correct,
  // say — must not quietly turn into a find puzzle with the author's work
  // ignored; that is the "I changed it and nothing happened" this whole config
  // path exists to avoid.
  if (Array.isArray(raw.fixes) && raw.fixes.length > 0 && !fixes) return null;

  // An author who filled in replacements meant fix mode; asking for fix mode
  // without them would render a board with nothing to choose from.
  const mode = enumValue(raw.mode, ["find", "fix"] as const) ?? (fixes ? "fix" : "find");
  if (mode === "fix" && !fixes) return null;

  return {
    mode,
    goal: str(raw.goal) ?? "Dastur maqsadiga yetmayapti — sabab bitta qatorda.",
    hint: str(raw.hint) ?? "Har bir qatorni maqsad bilan solishtirib o'qing.",
    lines,
    badIndex,
    fixes: mode === "fix" ? fixes : undefined,
    why: str(raw.why) ?? "",
  };
}

/* ──────────────────────────────── drawing code ──────────────────────────────── */

/**
 * One line of program text. The leading spaces become guide columns: in the
 * indentation puzzles two candidates differ by nothing else, and blank space is
 * not something a child can compare across two boxes.
 */
function ProgramText({ line, className = "" }: { line: string; className?: string }) {
  const depth = Math.floor((/^ */.exec(line)?.[0].length ?? 0) / 2);

  return (
    <span className={`flex min-w-0 flex-1 items-stretch ${className}`}>
      {Array.from({ length: depth }, (_, i) => (
        <span
          key={i}
          className="w-[13px] shrink-0 border-l border-dashed border-gray-300 dark:border-[#3a3a41]"
        />
      ))}
      <span className="font-mono text-[13.5px] sm:text-[14px] leading-6 min-w-0 whitespace-pre-wrap break-words">
        {line.trimStart()}
      </span>
    </span>
  );
}

/* ──────────────────────────────── the board ──────────────────────────────── */

export function DebugExtraGame(props: GameProps) {
  const { config, context, seed, variant } = props;

  const puzzle = useMemo(
    () =>
      (hasConfig(config) ? fromConfig(config) : null) ??
      pickVariant(PUZZLES, seed, { ordinal: variant, prefer: preferFor(context) }),
    [config, context, seed, variant]
  );

  // Shuffled per lesson: authored in "right answer first" order, the strip would
  // be solvable by position rather than by reading.
  const fixes = useMemo(
    () => (puzzle.fixes ? seededShuffle(puzzle.fixes, seed) : []),
    [puzzle.fixes, seed]
  );

  const [picked, setPicked] = useState<number | null>(null);
  const [fixIndex, setFixIndex] = useState<number | null>(null);

  useEffect(() => {
    setPicked(null);
    setFixIndex(null);
  }, [puzzle]);

  const isFix = puzzle.mode === "fix";
  const chosen = fixIndex === null ? undefined : fixes[fixIndex];

  const { status, reset } = useGameCheck(props, {
    ready: picked !== null && (!isFix || chosen !== undefined),
    // Several replacements can be right — one loop bound written two ways is the
    // same loop — so acceptance is a set, not a single answer.
    check: () => picked === puzzle.badIndex && (!isFix || chosen?.ok === true),
  });

  const solved = status === "success";

  const choose = (change: () => void) => {
    // The revealed explanation is the reward; a stray tap must not clear it.
    if (solved) return;
    reset();
    change();
  };

  return (
    <GameShell
      task={
        isFix
          ? "Buzuq qatorni toping va uni nima bilan almashtirishni tanlang."
          : "Xatoni keltirib chiqaradigan qatorni toping."
      }
      hint={puzzle.hint}
      status={status}
      successText={puzzle.why}
      failText={
        isFix
          ? // Saying which half was wrong would hand over the other half.
            "Bu o'zgartirishdan keyin ham dastur maqsadga yetmaydi. Ikkisini birga tekshiring: qaysi qator va qaysi belgi?"
          : "Bu qator maqsadga zid emas. Dasturni maqsad bilan qatorma-qator solishtiring."
      }
      footer={
        <GameNote>
          <span className="font-semibold">Maqsad:</span> {puzzle.goal}
        </GameNote>
      }
    >
      {isFix && (
        <div className="mb-3">
          <GameHowTo
            steps={[
              "Maqsadga yetmayotgan qatorni bosib belgilang.",
              "Pastdan uni almashtiradigan qatorni tanlang — chekinishiga ham qarang.",
            ]}
          />
        </div>
      )}

      <GameBoard label="Dastur">
        <div className="flex flex-col gap-2">
          {puzzle.lines.map((line, i) => {
            const isPicked = picked === i;
            const revealCorrect = solved && i === puzzle.badIndex;
            const revealWrongPick = status === "fail" && isPicked;
            // Only ever the learner's own choice, so this reveals nothing.
            const replaced = isPicked && chosen ? chosen.text : undefined;

            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(() => setPicked(i))}
                className={`w-full rounded-[12px] border-2 px-3.5 py-3 text-left transition-colors cursor-pointer ${
                  revealCorrect
                    ? "border-[#26B54F] bg-[#26B54F]/10"
                    : revealWrongPick
                    ? "border-amber-500 bg-amber-500/10"
                    : isPicked
                    ? "border-[#A78BFA] bg-[#A78BFA]/10"
                    : "border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] hover:border-gray-300 dark:hover:border-[#3d3d45]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="w-4 shrink-0 text-right font-mono text-[12.5px] leading-6 text-gray-400 dark:text-[#5c5c64]">
                    {i + 1}
                  </span>
                  <ProgramText
                    line={line}
                    className={
                      replaced
                        ? "text-gray-400 dark:text-[#6d6d74] line-through decoration-1"
                        : "text-gray-800 dark:text-[#e4e4e7]"
                    }
                  />
                  {(isPicked || revealCorrect) && (
                    <IconBug
                      size={17}
                      className={`shrink-0 mt-[3px] ${
                        revealCorrect ? "text-[#26B54F]" : "text-[#A78BFA]"
                      }`}
                    />
                  )}
                </div>

                {/* The chosen replacement sits under the line it replaces, so the
                    change reads as a change rather than as a separate list. */}
                {replaced !== undefined && (
                  <div className="mt-1 flex items-start gap-3">
                    <span className="w-4 shrink-0" />
                    <ProgramText
                      line={replaced}
                      className={
                        solved
                          ? "text-[#177F37] dark:text-[#4ADE80] font-semibold"
                          : "text-[#7C5CE0] dark:text-[#c4b5fd] font-semibold"
                      }
                    />
                    <IconPencil
                      size={15}
                      className={`shrink-0 mt-[5px] ${
                        solved ? "text-[#26B54F]" : "text-[#A78BFA]"
                      }`}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </GameBoard>

      {isFix && (
        <div className="mt-3">
          <GameBoard label="Tuzatish variantlari">
            <div className="flex flex-col gap-2">
              {fixes.map((fix, i) => {
                const isChosen = fixIndex === i;

                return (
                  <button
                    key={`${i}-${fix.text}`}
                    type="button"
                    onClick={() => choose(() => setFixIndex(isChosen ? null : i))}
                    className={`w-full rounded-[12px] border-2 px-3.5 py-3 text-left transition-colors cursor-pointer ${
                      isChosen
                        ? solved
                          ? "border-[#26B54F] bg-[#26B54F]/10"
                          : status === "fail"
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-[#A78BFA] bg-[#A78BFA]/10"
                        : "border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] hover:border-gray-300 dark:hover:border-[#3d3d45]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <IconPencil
                        size={15}
                        className={`shrink-0 mt-[5px] ${
                          isChosen
                            ? "text-[#A78BFA]"
                            : "text-gray-300 dark:text-[#4a4a52]"
                        }`}
                      />
                      <ProgramText
                        line={fix.text}
                        className={
                          isChosen
                            ? "text-[#7C5CE0] dark:text-[#c4b5fd] font-semibold"
                            : "text-gray-800 dark:text-[#e4e4e7]"
                        }
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </GameBoard>
        </div>
      )}
    </GameShell>
  );
}
