"use client";

import React, { useEffect, useMemo, useState } from "react";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import type { GameProps } from "../types";
import {
  GameBoard,
  GameChip,
  GameHowTo,
  GameNote,
  GameShell,
  pickVariant,
  seededShuffle,
  useGameCheck,
} from "../shared";
import { enumValue, hasConfig, num, objList, str, strList, unique } from "../config";

/**
 * Trace the boxes
 * ---------------
 * A variable is a box whose old value is gone the moment a new one goes in.
 * The learner predicts the final contents before running anything.
 *
 * The first version only ever put numbers in the boxes, so "a box holds a value"
 * quietly became "a box holds a number" — the learner never met the same idea
 * carrying text or true/false. Boxes now hold all three, and the new value types
 * are used to make the overwrite lesson harder to dodge rather than to decorate
 * it: copying a text box and then changing the original, and computing a
 * true/false answer *before* the number it was computed from moves.
 *
 * `+` is deliberately one operator doing two jobs (add and join), because that is
 * exactly what m5-l2-1 teaches: 2 + 3 is 5, "2" + "3" is "23".
 *
 * Only a correct answer opens the line-by-line trace. Showing it after a wrong
 * guess — and printing the right number under the box, as the first version did —
 * handed over the answer and left nothing to think about on the second attempt.
 * The same rule shapes the failure message: naming which box is wrong is a fair
 * nudge for a number, but a true/false box has only one other value, so naming it
 * would be the answer.
 */

type Value = number | string | boolean;
type ValueType = "number" | "text" | "bool";

/** The right-hand side of a line: another box, or a value written out. */
type Operand = { ref: string } | { lit: Value };

const COMPARISONS = [">", ">=", "<", "<=", "==", "!="] as const;
type Comparison = (typeof COMPARISONS)[number];

type Kind =
  | "set"
  | "copy"
  | "add"
  | "sub"
  | "mul"
  /** Text joining. Renders as `+` too — the curriculum's point is that it is. */
  | "join"
  | "not"
  | Comparison;

const KINDS = [
  "set",
  "copy",
  "add",
  "sub",
  "mul",
  "join",
  "not",
  ...COMPARISONS,
] as const;

function isComparison(kind: Kind): kind is Comparison {
  return (COMPARISONS as readonly string[]).includes(kind);
}

interface Stmt {
  target: string;
  kind: Kind;
  value: Operand;
  /**
   * Binary lines only: the left side, when it is not the target box itself.
   * `katta = yosh >= 18` needs it; `ball = ball - 3` does not.
   */
  left?: Operand;
}

interface Puzzle {
  hint: string;
  vars: string[];
  program: Stmt[];
  why: string;
}

const val = (value: Value): Operand => ({ lit: value });
const box = (name: string): Operand => ({ ref: name });

/**
 * Ordered simplest first, because the lesson ordinal walks this list. The eight
 * number puzzles come first — puzzle 0 is somebody's first ever look at
 * assignment — then text, then true/false. A lesson whose title is about types or
 * logic jumps straight to the matching group through `prefer` below, so the new
 * kinds do not have to wait for the pool to be walked that far.
 */
const PUZZLES: Puzzle[] = [
  {
    hint: "Har qatorni yuqoridan pastga bajarib, qutilar ichidagi qiymatni kuzatib boring.",
    vars: ["a", "b"],
    program: [
      { target: "a", kind: "set", value: val(3) },
      { target: "b", kind: "set", value: val(5) },
      { target: "a", kind: "add", value: box("b") },
      { target: "b", kind: "add", value: val(2) },
    ],
    why:
      "a = a + b qatori bajarilganda b ning o'sha paytdagi qiymati (5) qo'shildi. Keyin b o'zgargani a ga ta'sir qilmaydi.",
  },
  {
    hint: "Bir qutiga yangi qiymat solinsa, ichidagi eskisi butunlay o'chadi.",
    vars: ["a", "b"],
    program: [
      { target: "a", kind: "set", value: val(7) },
      { target: "b", kind: "set", value: val(2) },
      { target: "b", kind: "copy", value: box("a") },
      { target: "a", kind: "sub", value: val(4) },
    ],
    why:
      "b = a qatori a ning nusxasini oladi, ikkalasi bog'lanib qolmaydi. Shuning uchun keyin a kamayganda b o'zgarmadi.",
  },
  {
    hint: "Hisoblagich har qadamda o'zining eski qiymatiga tayanadi.",
    vars: ["son"],
    program: [
      { target: "son", kind: "set", value: val(1) },
      { target: "son", kind: "mul", value: val(2) },
      { target: "son", kind: "mul", value: val(2) },
      { target: "son", kind: "add", value: val(3) },
    ],
    why:
      "son = son * 2 ikki marta bajarildi (1 → 2 → 4), so'ng 3 qo'shildi. Har qator oldingi natija ustiga ishlaydi.",
  },
  {
    hint: "Uchinchi qutiga e'tibor bering — u nima uchun kerak bo'lgan?",
    vars: ["a", "b", "vaqt"],
    program: [
      { target: "a", kind: "set", value: val(4) },
      { target: "b", kind: "set", value: val(9) },
      { target: "vaqt", kind: "copy", value: box("a") },
      { target: "a", kind: "copy", value: box("b") },
      { target: "b", kind: "copy", value: box("vaqt") },
    ],
    why:
      "vaqt a ning qiymatini saqlab turdi, shuning uchun a va b muvaffaqiyatli almashdi. Vaqtinchalik quti bo'lmasa, eski qiymat yo'qolardi.",
  },
  {
    hint: "Ayirish ham qutining eski qiymatidan boshlanadi.",
    vars: ["ball", "jarima"],
    program: [
      { target: "ball", kind: "set", value: val(20) },
      { target: "jarima", kind: "set", value: val(3) },
      { target: "ball", kind: "sub", value: box("jarima") },
      { target: "ball", kind: "sub", value: box("jarima") },
    ],
    why:
      "Bitta jarima qiymati ikki marta ayirildi: 20 − 3 − 3. jarima qutisining o'zi esa o'zgarmadi.",
  },
  {
    hint: "Ikki quti bir xil qiymat bilan boshlanadi — keyin yo'llari ajraladi.",
    vars: ["x", "y"],
    program: [
      { target: "x", kind: "set", value: val(6) },
      { target: "y", kind: "copy", value: box("x") },
      { target: "x", kind: "mul", value: val(2) },
      { target: "y", kind: "add", value: val(1) },
    ],
    why:
      "y = x nusxa oldi, keyin ikkisi mustaqil o'zgardi. Nusxa olish — bog'lanish emas.",
  },
  {
    hint: "Uchta quti, ammo faqat bittasi oxirida o'zgaradi.",
    vars: ["a", "b", "c"],
    program: [
      { target: "a", kind: "set", value: val(2) },
      { target: "b", kind: "set", value: val(3) },
      { target: "c", kind: "copy", value: box("b") },
      { target: "c", kind: "mul", value: box("a") },
      { target: "a", kind: "add", value: val(1) },
    ],
    why:
      "c = b * a qatori o'sha paytdagi qiymatlarni oldi (3 * 2). Keyin a ning o'zgarishi c ga yetib bormadi.",
  },
  {
    hint: "Qiymat bir necha marta almashadi — faqat oxirgisi qoladi.",
    vars: ["n"],
    program: [
      { target: "n", kind: "set", value: val(10) },
      { target: "n", kind: "set", value: val(4) },
      { target: "n", kind: "add", value: val(6) },
      { target: "n", kind: "sub", value: val(1) },
    ],
    why:
      "Ikkinchi qator 10 ni butunlay o'chirdi. Qutida faqat oxirgi solingan qiymat ustidagi hisob qoldi: 4 + 6 − 1.",
  },

  /* ── matn qutilari ── */

  {
    hint: "Quti ichida son emas, matn turadi. + belgisi matnlarni ulaydi.",
    vars: ["ism", "salom"],
    program: [
      { target: "ism", kind: "set", value: val("Ali") },
      { target: "salom", kind: "join", left: val("Salom, "), value: box("ism") },
      { target: "salom", kind: "join", value: val("!") },
    ],
    why:
      "Matnda + qo'shmaydi, ulaydi: \"Salom, \" va \"Ali\" birlashib \"Salom, Ali\" bo'ldi, keyin oxiriga \"!\" qo'shildi. Bo'sh joy ham matnning bir qismi.",
  },
  {
    hint: "Matn ham qutida turadi — va yangi matn eskisini xuddi shunday o'chiradi.",
    vars: ["nom", "zaxira"],
    program: [
      { target: "nom", kind: "set", value: val("kitob") },
      { target: "zaxira", kind: "copy", value: box("nom") },
      { target: "nom", kind: "set", value: val("daftar") },
    ],
    why:
      "zaxira = nom qatori matnning nusxasini oldi. Keyin nom qutisiga \"daftar\" solindi va \"kitob\" faqat zaxirada qoldi — nusxa olish bog'lanish emas.",
  },
  {
    hint: "Ikki qutida ham + belgisi bor, lekin ular bir xil ish qilmaydi.",
    vars: ["son", "matn"],
    program: [
      { target: "son", kind: "set", value: val(2) },
      { target: "matn", kind: "set", value: val("2") },
      { target: "matn", kind: "join", value: val("3") },
      { target: "son", kind: "add", value: val(3) },
    ],
    why:
      "2 + 3 = 5, lekin \"2\" + \"3\" = \"23\". Bir xil belgi qiymat turiga qarab boshqa ish bajaradi — shuning uchun 42 va \"42\" bir xil emas.",
  },

  /* ── mantiqiy qutilar ── */

  {
    hint: "Taqqoslash natijasi ham qutida saqlanadi: true yoki false.",
    vars: ["yosh", "katta"],
    program: [
      { target: "yosh", kind: "set", value: val(20) },
      { target: "katta", kind: ">=", left: box("yosh"), value: val(18) },
      { target: "yosh", kind: "set", value: val(10) },
    ],
    why:
      "katta = yosh >= 18 qatori o'sha paytda hisoblandi: 20 >= 18, ya'ni true. Keyin yosh 10 ga o'zgardi, lekin katta qutisi qayta hisoblanmaydi — unda hisob emas, natija turadi.",
  },
  {
    hint: "EMAS qiymatni teskarisiga aylantiradi. Lekin qachon?",
    vars: ["yopiq", "ochiq"],
    program: [
      { target: "yopiq", kind: "set", value: val(false) },
      { target: "ochiq", kind: "not", value: box("yopiq") },
      { target: "yopiq", kind: "set", value: val(true) },
    ],
    why:
      "ochiq = EMAS yopiq qatori bir marta bajarildi: o'sha paytda yopiq false edi, demak ochiq true bo'ldi. Keyin yopiq true ga o'zgardi, ammo ochiq o'zgarmadi — ikkisi ham true qoldi.",
  },
  {
    hint: "Shart tekshirilgan payt muhim — undan keyin son o'zgaradi.",
    vars: ["ball", "otdi"],
    program: [
      { target: "ball", kind: "set", value: val(40) },
      { target: "otdi", kind: ">=", left: box("ball"), value: val(50) },
      { target: "ball", kind: "add", value: val(20) },
    ],
    why:
      "Taqqoslash 40 >= 50 bo'yicha bajarildi va false chiqdi. Keyin ball 60 ga yetdi, lekin otdi qutisidagi false o'zgarmadi — natija saqlanadi, hisob emas.",
  },
  {
    hint: "Nusxa olingan matn, o'zgargan asl nusxa va bitta taqqoslash.",
    vars: ["ism", "taxallus", "tengmi"],
    program: [
      { target: "ism", kind: "set", value: val("Ali") },
      { target: "taxallus", kind: "copy", value: box("ism") },
      { target: "ism", kind: "join", value: val("bek") },
      { target: "tengmi", kind: "==", left: box("ism"), value: box("taxallus") },
    ],
    why:
      "taxallus \"Ali\" ni nusxa qilib oldi. Keyin ism ga \"bek\" ulanib \"Alibek\" bo'ldi — taxallus esa o'zgarmadi. Shuning uchun oxirgi taqqoslash false berdi.",
  },
];

/* ──────────────────────────── running the program ──────────────────────────── */

function typeOf(value: Value | undefined): ValueType {
  if (typeof value === "string") return "text";
  if (typeof value === "boolean") return "bool";
  return "number";
}

function asNumber(value: Value | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asText(value: Value | undefined): string {
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "true" : "false";
  return value === undefined ? "" : String(value);
}

/**
 * One `+` for both jobs. Mixing a number into a join gives text, which is the
 * behaviour the types lesson describes rather than an error the learner would
 * have no way to predict.
 */
function plus(left: Value, right: Value): Value {
  if (typeof left === "string" || typeof right === "string") {
    return asText(left) + asText(right);
  }
  return asNumber(left) + asNumber(right);
}

function compare(kind: Comparison, left: Value, right: Value): boolean {
  // 42 and "42" are not the same value — the types lesson says so explicitly.
  if (kind === "==") return left === right;
  if (kind === "!=") return left !== right;
  const a = asNumber(left);
  const b = asNumber(right);
  if (kind === ">") return a > b;
  if (kind === ">=") return a >= b;
  if (kind === "<") return a < b;
  return a <= b;
}

type Env = Record<string, Value>;

function readOperand(operand: Operand, env: Env): Value {
  if ("lit" in operand) return operand.lit;
  return env[operand.ref] ?? 0;
}

/**
 * Runs the program, returning the environment after each line. `swapJoins` runs
 * the same program with every text join written the other way round; that second
 * run is only used to build plausible wrong options (see `textOptions`).
 */
function trace(puzzle: Puzzle, swapJoins = false): Env[] {
  const frames: Env[] = [];
  let env: Env = {};

  for (const stmt of puzzle.program) {
    const right = readOperand(stmt.value, env);
    const left = stmt.left ? readOperand(stmt.left, env) : env[stmt.target] ?? 0;
    let result: Value;

    switch (stmt.kind) {
      case "set":
      case "copy":
        result = right;
        break;
      case "add":
      case "join":
        result = swapJoins ? plus(right, left) : plus(left, right);
        break;
      case "sub":
        result = asNumber(left) - asNumber(right);
        break;
      case "mul":
        result = asNumber(left) * asNumber(right);
        break;
      case "not":
        result = !right;
        break;
      default:
        result = compare(stmt.kind, left, right);
    }

    env = { ...env, [stmt.target]: result };
    frames.push(env);
  }

  return frames;
}

/* ──────────────────────────── drawing the program ──────────────────────────── */

const SYMBOLS: Record<string, string> = {
  add: "+",
  join: "+",
  sub: "-",
  mul: "*",
};

function showValue(value: Value | undefined): string {
  if (value === undefined) return "—";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function showOperand(operand: Operand): string {
  return "ref" in operand ? operand.ref : showValue(operand.lit);
}

function renderStmt(stmt: Stmt): string {
  if (stmt.kind === "set" || stmt.kind === "copy") {
    return `${stmt.target} = ${showOperand(stmt.value)}`;
  }
  if (stmt.kind === "not") {
    return `${stmt.target} = EMAS ${showOperand(stmt.value)}`;
  }
  const left = stmt.left ? showOperand(stmt.left) : stmt.target;
  const symbol = SYMBOLS[stmt.kind] ?? stmt.kind;
  return `${stmt.target} = ${left} ${symbol} ${showOperand(stmt.value)}`;
}

/* ─────────────────────────── answering the question ─────────────────────────── */

/** The value types a puzzle actually puts in boxes, for `prefer` below. */
function flavours(puzzle: Puzzle): Set<ValueType> {
  const out = new Set<ValueType>();
  for (const stmt of puzzle.program) {
    if (stmt.kind === "join") out.add("text");
    if (stmt.kind === "not" || isComparison(stmt.kind)) out.add("bool");
    for (const operand of [stmt.value, stmt.left]) {
      if (operand && "lit" in operand) out.add(typeOf(operand.lit));
    }
  }
  return out;
}

/**
 * A lesson about types or logic should not be handed a pure-number puzzle just
 * because of where its ordinal landed. Nothing matching leaves the pool whole.
 */
function preferFor(context: string | undefined): ((puzzle: Puzzle) => boolean) | undefined {
  const words = (context ?? "").toLowerCase();
  // Word boundaries are not optional here: "qiymatni" contains "matn", so a
  // loose pattern sent the swap lesson to a text puzzle.
  const wanted: ValueType | undefined = /\bmatn|\bstring|birlashtir|\bulash|\btur/.test(words)
    ? "text"
    : /mantiqiy|boolean|\brost|yolg'on|taqqosla/.test(words)
    ? "bool"
    : undefined;
  if (!wanted) return undefined;
  return (puzzle) => flavours(puzzle).has(wanted);
}

/**
 * The chips a text box offers. Typing the answer would fail on a stray space or a
 * capital letter, so the learner picks — and the pool is built from every value a
 * text box held at any point, which is exactly where the tempting wrong answers
 * live (the value a box carried before the last line overwrote it), plus the
 * joins written the other way round.
 */
function textOptions(puzzle: Puzzle, seed: string | undefined): string[] {
  const real = trace(puzzle);
  const pool = new Set<string>();

  const collect = (frames: Env[]) => {
    for (const env of frames) {
      for (const value of Object.values(env)) {
        if (typeof value === "string") pool.add(value);
      }
    }
  };
  collect(real);
  collect(trace(puzzle, true));

  for (const stmt of puzzle.program) {
    for (const operand of [stmt.value, stmt.left]) {
      // A single-character join operand ("!") reads as a joke option rather than
      // a mistake anybody would make; every longer literal is a real candidate.
      if (operand && "lit" in operand && typeof operand.lit === "string" && operand.lit.length > 1) {
        pool.add(operand.lit);
      }
    }
  }

  // Capping the strip keeps it readable on a phone, so the answers themselves
  // have to be reserved before anything is dropped.
  const answers = Object.values(real[real.length - 1] ?? {}).filter(
    (value): value is string => typeof value === "string"
  );
  const rest = Array.from(pool).filter((option) => !answers.includes(option));
  const reserved = Array.from(new Set(answers));
  return seededShuffle(reserved.concat(rest).slice(0, 8), seed);
}

function sameValue(a: Value | null, b: Value | undefined): boolean {
  return a !== null && b !== undefined && a === b;
}

/* ─────────────────────────── author-supplied puzzle ─────────────────────────── */

/**
 * Reads the right-hand side an author typed. Quotes are how the curriculum itself
 * writes a text value, so they are also how an author tells `"Ali"` the text apart
 * from `Ali` the box that does not exist.
 */
function parseOperand(value: unknown, vars: string[]): Operand | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return { lit: value };
  if (typeof value === "boolean") return { lit: value };

  const raw = str(value);
  if (!raw) return undefined;

  const quoted = raw.match(/^"([\s\S]*)"$/);
  if (quoted) return { lit: quoted[1] };
  if (raw === "true") return { lit: true };
  if (raw === "false") return { lit: false };

  const asNum = num(raw);
  if (asNum !== undefined) return { lit: asNum };

  // A name no box carries would quietly read as 0 and teach the wrong lesson.
  return vars.includes(raw) ? { ref: raw } : undefined;
}

/** Builds the puzzle an author configured in the writer, or null if incomplete. */
function fromConfig(config: unknown): Puzzle | null {
  if (!hasConfig(config)) return null;

  const declared = strList(config.vars);
  if (!declared) return null;
  const vars = unique(declared);

  const program = objList<Stmt>(config.program, (row) => {
    const target = str(row.target);
    const kind = enumValue(row.kind, KINDS);
    if (!target || !kind || !vars.includes(target)) return undefined;

    const value = parseOperand(row.value, vars);
    if (!value) return undefined;

    const hasLeft = row.left !== undefined && row.left !== null && row.left !== "";
    const left = hasLeft ? parseOperand(row.left, vars) : undefined;
    if (hasLeft && !left) return undefined;
    // `katta = katta >= 18` is not a comparison anybody meant to write, so a
    // comparison without a left side is an unfinished row rather than a puzzle.
    if (isComparison(kind) && !left) return undefined;

    return { target, kind, value, left };
  });
  if (!program || program.length < 2) return null;

  // A box nobody ever writes to would read as 0 and offer a stepper for a value
  // the program never mentions.
  if (!vars.every((name) => program.some((stmt) => stmt.target === name))) return null;

  return {
    hint:
      str(config.hint) ??
      "Har qatorni yuqoridan pastga bajarib, qutilar ichidagi qiymatni kuzatib boring.",
    vars,
    program,
    why:
      str(config.why) ??
      "Har qator o'zidan oldingi natija ustiga ishlaydi — qutida faqat oxirgi qiymat qoladi.",
  };
}

/* ──────────────────────────────── the board ──────────────────────────────── */

export function VariableTraceGame(props: GameProps) {
  const { config, context, seed, variant } = props;

  const puzzle = useMemo(
    () =>
      (hasConfig(config) ? fromConfig(config) : null) ??
      pickVariant(PUZZLES, seed, { ordinal: variant, prefer: preferFor(context) }),
    [config, context, seed, variant]
  );

  const frames = useMemo(() => trace(puzzle), [puzzle]);
  const final = useMemo(() => frames[frames.length - 1] ?? {}, [frames]);
  const types = useMemo(
    () => Object.fromEntries(puzzle.vars.map((name) => [name, typeOf(final[name])])),
    [puzzle.vars, final]
  ) as Record<string, ValueType>;
  const options = useMemo(() => textOptions(puzzle, seed), [puzzle, seed]);

  const [picked, setPicked] = useState<Record<string, Value | null>>({});
  const [touched, setTouched] = useState(false);

  // A puzzle swapped underneath — the writer editing its config live — must not
  // keep the previous board's answers.
  useEffect(() => {
    setPicked({});
    setTouched(false);
  }, [puzzle]);

  // Read through a normalised view so a number box always has something to show
  // while a text or true/false box starts visibly empty.
  const guess = useMemo(
    () =>
      Object.fromEntries(
        puzzle.vars.map((name) => [
          name,
          picked[name] ?? (types[name] === "number" ? 0 : null),
        ])
      ) as Record<string, Value | null>,
    [picked, puzzle.vars, types]
  );

  const answered = puzzle.vars.every((name) => guess[name] !== null);

  const { status, reset } = useGameCheck(props, {
    ready: touched && answered,
    check: () => puzzle.vars.every((name) => sameValue(guess[name], final[name])),
  });

  const set = (name: string, value: Value) => {
    // The revealed trace is the reward; a stray tap must not clear it.
    if (status === "success") return;
    reset();
    setTouched(true);
    setPicked((prev) => ({ ...prev, [name]: value }));
  };

  const bump = (name: string, delta: number) => {
    const current = typeof guess[name] === "number" ? (guess[name] as number) : 0;
    set(name, Math.max(-40, Math.min(199, current + delta)));
  };

  const wrongVars = puzzle.vars.filter((name) => !sameValue(guess[name], final[name]));
  /**
   * Naming the wrong box helps when there are many values it could hold, but a
   * true/false box has exactly one other value — pointing at it would be the
   * answer. Same for a text box with only a couple of chips on offer.
   */
  const narrow = wrongVars.some(
    (name) => types[name] === "bool" || (types[name] === "text" && options.length <= 3)
  );

  /** The trace is a reward for a correct prediction, not a consolation prize. */
  const solved = status === "success";
  const mixed = puzzle.vars.some((name) => types[name] !== "number");

  return (
    <GameShell
      task="Dastur tugagandan keyin qutilarda qanday qiymat qoladi?"
      hint={puzzle.hint}
      status={status}
      successText={puzzle.why}
      failText={
        narrow || wrongVars.length === puzzle.vars.length
          ? "Hali to'g'ri emas. Birinchi qatordan boshlab, har qatordan keyin quti ichida nima turganini qog'ozga yozib chiqing."
          : `${wrongVars.join(", ")} qutisi to'g'ri emas — shu quti qatnashgan qatorlarni qayta o'qing.`
      }
      footer={
        solved ? undefined : (
          <GameNote>
            Har qator bajarilgach, quti ichidagi qiymat almashadi — son, matn yoki
            true/false bo&apos;lishidan qat&apos;i nazar. Oxirgi holatni oldindan aytib
            bering: to&apos;g&apos;ri javobdan keyin dastur qatorma-qator ochiladi.
          </GameNote>
        )
      }
    >
      <GameBoard label="Dastur">
        <div className="flex flex-col gap-2">
          {puzzle.program.map((stmt, i) => (
            <div
              key={i}
              className="rounded-[12px] border-2 border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] px-3.5 py-2.5"
            >
              <div className="flex items-start gap-3">
                <span className="w-4 shrink-0 text-right font-mono text-[12.5px] leading-6 text-gray-400 dark:text-[#5c5c64]">
                  {i + 1}
                </span>
                <span className="font-mono text-[13.5px] sm:text-[14px] leading-6 break-words text-gray-800 dark:text-[#e4e4e7] min-w-0 flex-1">
                  {renderStmt(stmt)}
                </span>
              </div>

              {/* The trace opens only once the prediction was right */}
              {solved && (
                <div className="mt-1.5 pl-7 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[12px] text-gray-500 dark:text-[#8b8b93]">
                  {puzzle.vars.map((name) => (
                    <span key={name}>
                      {name}={showValue(frames[i][name])}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </GameBoard>

      {mixed && (
        <div className="mt-3">
          <GameHowTo
            steps={[
              "Son qutisida − va + tugmalari bilan qiymatni sozlang.",
              "Matn yoki true/false qutisida to'g'ri variantni bosib tanlang.",
            ]}
          />
        </div>
      )}

      <div className="mt-3">
        <GameBoard label="Sizning javobingiz">
          <div className="flex flex-wrap gap-3">
            {puzzle.vars.map((name) => {
              const type = types[name];
              const bad = status === "fail" && !sameValue(guess[name], final[name]);
              const frame = solved
                ? "border-[#26B54F] bg-[#26B54F]/[0.08]"
                : bad
                ? "border-amber-500 bg-amber-500/[0.08]"
                : "border-gray-200 dark:border-[#2b2b31]";

              return (
                <div
                  key={name}
                  className={`flex flex-col gap-2 rounded-[14px] border-2 px-4 py-3 transition-colors ${
                    type === "number" ? "items-center" : "w-full items-start"
                  } ${frame}`}
                >
                  <span className="font-mono text-[13px] font-bold text-[#7C5CE0] dark:text-[#c4b5fd]">
                    {name}
                  </span>

                  {type === "number" && (
                    <>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => bump(name, -1)}
                          aria-label={`${name} qiymatini kamaytirish`}
                          className="w-7 h-7 rounded-full border-2 border-gray-200 dark:border-[#2b2b31] flex items-center justify-center hover:border-gray-300 dark:hover:border-[#3d3d45] transition-colors cursor-pointer"
                        >
                          <IconMinus size={12} stroke={2.8} />
                        </button>
                        <span className="w-9 text-center font-mono text-[17px] font-bold text-gray-900 dark:text-white">
                          {String(guess[name] ?? 0)}
                        </span>
                        <button
                          type="button"
                          onClick={() => bump(name, 1)}
                          aria-label={`${name} qiymatini oshirish`}
                          className="w-7 h-7 rounded-full border-2 border-gray-200 dark:border-[#2b2b31] flex items-center justify-center hover:border-gray-300 dark:hover:border-[#3d3d45] transition-colors cursor-pointer"
                        >
                          <IconPlus size={12} stroke={2.8} />
                        </button>
                      </div>

                      {/* Bigger jumps, so a large answer is not forty taps away */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => bump(name, -10)}
                          className="rounded-[8px] border border-gray-200 dark:border-[#2b2b31] px-2 py-0.5 font-mono text-[11px] text-gray-500 dark:text-[#8b8b93] hover:border-gray-300 dark:hover:border-[#3d3d45] transition-colors cursor-pointer"
                        >
                          −10
                        </button>
                        <button
                          type="button"
                          onClick={() => bump(name, 10)}
                          className="rounded-[8px] border border-gray-200 dark:border-[#2b2b31] px-2 py-0.5 font-mono text-[11px] text-gray-500 dark:text-[#8b8b93] hover:border-gray-300 dark:hover:border-[#3d3d45] transition-colors cursor-pointer"
                        >
                          +10
                        </button>
                      </div>
                    </>
                  )}

                  {type === "bool" && (
                    <div className="flex flex-wrap gap-2">
                      {[true, false].map((option) => (
                        <GameChip
                          key={String(option)}
                          selected={guess[name] === option}
                          onClick={() => set(name, option)}
                        >
                          {option ? "true" : "false"}
                        </GameChip>
                      ))}
                    </div>
                  )}

                  {type === "text" && (
                    <div className="flex flex-wrap gap-2">
                      {options.map((option) => (
                        <GameChip
                          key={option}
                          selected={guess[name] === option}
                          onClick={() => set(name, option)}
                        >
                          {`"${option}"`}
                        </GameChip>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GameBoard>
      </div>
    </GameShell>
  );
}
