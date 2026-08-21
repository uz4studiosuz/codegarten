"use client";

import React, { useMemo, useState } from "react";
import { IconGripVertical, IconRepeat, IconX } from "@tabler/icons-react";
import type { GameProps } from "../types";
import {
  PALETTE,
  PALETTE_KEYS,
  enumList,
  enumValue,
  hasConfig,
  int,
  num,
  str,
  strList,
  type PaletteKey,
} from "../config";
import {
  DragGhost,
  DropSlot,
  GameBoard,
  GameHowTo,
  GameNote,
  GameReset,
  GameShell,
  grabClass,
  pickVariant,
  useBlockDrag,
  useGameCheck,
} from "../shared";

/**
 * Build the pattern with a loop
 * -----------------------------
 * A loop is worth learning the moment the pattern is longer than the program.
 * The learner drags colours into the loop body and says how many times it
 * repeats, so "bir marta yoz, yuz marta ishlat" is something they do.
 *
 * Two things came out of watching children use the first version: a palette of
 * "+" buttons did not read as something to press, so the colours are now blocks
 * that get dragged into visible empty cells; and the result strip updating live
 * turned the puzzle into fiddling until the shapes matched, so the result stays
 * hidden until they commit to an answer.
 *
 * The colour strips alone, though, were only pattern-spotting: a review pointed
 * out that nothing on the board ever counted, so a learner could finish and still
 * not picture a loop running. The counter is now part of the board. The loop is
 * written in the curriculum's own notation with the counter named
 * (`har i uchun 1 dan 4 gacha:`), pressing check replays every pass with the
 * value the counter held on it, and a body row can read that counter:
 * `chiz_chiziq(i)` draws a staircase that no repetition of a fixed body can
 * produce, which is the shortest route to seeing what a counter is for.
 *
 * `toki` puzzles turn it around — the body is given and the stopping condition is
 * the blank. A condition that never turns false is the lesson of those puzzles
 * rather than a bug in them, so a run gives up after STEP_CAP passes and says so;
 * hanging the page would teach nothing.
 *
 * The pool is ordered simplest-first because the lesson ordinal walks it in
 * order, and `prefer` sends a lesson whose title names the counter or an infinite
 * loop straight to the rung it is actually about.
 */

/** Body rows have room for this many statements, so a body stays readable. */
const MAX_BODY = 4;
/** Repeat counts on offer. Ten buttons already wrap at 375px. */
const MAX_COUNT = 10;
/** One pass cannot draw an endless row, however the counter is used. */
const MAX_CELLS = 12;
/**
 * A `toki` loop whose condition never turns false must stop being a hung page and
 * start being the lesson. Twelve passes is past every built-in answer.
 */
const STEP_CAP = 12;

/** The condition slot of a `toki` puzzle. Those puzzles have no body slots. */
const COND_SLOT = 0;

/* ─────────────────────────────── the program ─────────────────────────────── */

/** What a body row is handed. `counter` is what makes one pass differ from another. */
type Expr =
  | { kind: "number"; value: number }
  | { kind: "counter" }
  | { kind: "op"; op: "+" | "-" | "*"; left: Expr; right: Expr };

type Statement =
  /** One cell of a fixed colour — the colour-strip puzzles' whole vocabulary. */
  | { op: "cell"; colour: PaletteKey }
  /** A row of however many cells the expression works out to, in the pen colour. */
  | { op: "line"; arg: Expr }
  /** Moves the pen. Outlives the pass it runs in, exactly as a real one would. */
  | { op: "paint"; colour: PaletteKey };

interface Block {
  id: string;
  statement: Statement;
}

/** A stopping condition a `toki` puzzle offers. */
interface Condition {
  id: string;
  op: "<" | "<=" | ">" | ">=" | "!=";
  value: number;
}

interface Puzzle {
  /**
   * "count" gives a counted loop and the learner sets its upper bound; "while"
   * hands over the body and makes the stopping condition the blank instead.
   */
  kind: "count" | "while";
  /** The counter's name, as it appears in the code the learner reads. */
  counter: string;
  /**
   * "strip" reads the passes as one continuous strip, so any body/count pair
   * adding up to it is right. "rows" keeps one row per pass, which is what makes
   * a staircase impossible to fake with a fixed body.
   */
  shape: "strip" | "rows";
  /** What has to come out, one entry per row. A strip puzzle holds a single row. */
  target: PaletteKey[][];
  /** Where the pen starts, before any `rangla` in the body moves it. */
  pen: PaletteKey;
  /** Blocks offered for the body. Empty when the puzzle hands the body over. */
  blocks: Block[];
  /** How many body rows there is room for. */
  bodyMax: number;
  /** "while" puzzles: the ready-made body. */
  body?: Statement[];
  /** "while" puzzles: the conditions on offer, one of which stops it in time. */
  conditions?: Condition[];
  /** "while" puzzles: where the counter starts. */
  start?: number;
  /** "while" puzzles: what each pass adds to the counter. Negative counts down. */
  step?: number;
  hint: string;
  /** Shown on success only — naming the pattern is the reward, not the nudge. */
  why: string;
}

/* ──────────────────────── authoring the built-in pool ──────────────────────── */

const N = (value: number): Expr => ({ kind: "number", value });
const I: Expr = { kind: "counter" };
const calc = (op: "+" | "-" | "*", left: Expr, right: Expr): Expr => ({
  kind: "op",
  op,
  left,
  right,
});

const cell = (colour: PaletteKey): Statement => ({ op: "cell", colour });
const line = (arg: Expr): Statement => ({ op: "line", arg });
const paint = (colour: PaletteKey): Statement => ({ op: "paint", colour });

const blocks = (...statements: Statement[]): Block[] =>
  statements.map((statement, i) => ({ id: `b${i}`, statement }));

/** The colour-strip vocabulary: one draggable block per colour on offer. */
const colours = (...keys: PaletteKey[]): Block[] => blocks(...keys.map(cell));

const conditions = (...items: Omit<Condition, "id">[]): Condition[] =>
  items.map((item, i) => ({ id: `c${i}`, ...item }));

/** A row of `count` cells, for writing staircase targets without repeating oneself. */
const row = (count: number, colour: PaletteKey): PaletteKey[] =>
  Array.from({ length: count }, () => colour);

/**
 * Ordered simplest-first, because the lesson ordinal walks this list: the colour
 * strips are somebody's first loop, the counter puzzles need the counter to be
 * read, and the `toki` puzzles need the condition to be reasoned about.
 */
const PUZZLES: Puzzle[] = [
  /* ── First rung: find the repeating block, say how many times ── */
  {
    kind: "count",
    counter: "i",
    shape: "strip",
    target: [row(5, "binafsha")],
    pen: "binafsha",
    blocks: colours("binafsha", "yashil", "sariq"),
    bodyMax: MAX_BODY,
    hint: "Eng qisqa bo'lakni toping — bir katakdan iborat bo'lishi ham mumkin.",
    why: "Bir katak 5 marta takrorlangan. Sikl aynan shu ish uchun yaratilgan.",
  },
  {
    kind: "count",
    counter: "i",
    shape: "strip",
    target: [
      [
        "yashil",
        "binafsha",
        "yashil",
        "binafsha",
        "yashil",
        "binafsha",
        "yashil",
        "binafsha",
      ],
    ],
    pen: "yashil",
    blocks: colours("yashil", "binafsha", "sariq"),
    bodyMax: MAX_BODY,
    hint: "Naqshni kuzatib, takrorlanadigan eng qisqa bo'lakni sikl ichiga yozing.",
    why: "Takrorlanadigan bo'lak — yashil + binafsha. 8 katak = 4 x 2 katak.",
  },
  {
    kind: "count",
    counter: "i",
    shape: "strip",
    target: [["sariq", "kok", "sariq", "kok", "sariq", "kok"]],
    pen: "sariq",
    blocks: colours("sariq", "kok", "yashil"),
    bodyMax: MAX_BODY,
    hint: "Ikki katak bir naqsh hosil qiladi, u esa uch marta qaytariladi.",
    why: "Sariq + ko'k bo'lagi 3 marta takrorlanadi: 3 x 2 = 6 katak.",
  },
  {
    kind: "count",
    counter: "i",
    shape: "strip",
    target: [["yashil", "sariq", "kok", "yashil", "sariq", "kok", "yashil", "sariq", "kok"]],
    pen: "yashil",
    blocks: colours("yashil", "sariq", "kok", "binafsha"),
    bodyMax: MAX_BODY,
    hint: "Uch xil rang ketma-ket kelib, yana boshidan takrorlanadi.",
    why: "Bo'lak uch katakdan iborat, sikl 3 marta aylandi: 3 x 3 = 9 katak.",
  },

  /* ── Second rung: the body reads the counter, so every pass differs ── */
  {
    kind: "count",
    counter: "i",
    shape: "rows",
    target: [row(1, "kok"), row(2, "kok"), row(3, "kok"), row(4, "kok")],
    pen: "kok",
    blocks: blocks(line(I), line(N(1)), line(N(2)), line(calc("+", I, N(1)))),
    bodyMax: 1,
    hint: "Har qator boshqa uzunlikda. Aniq son yozilsa, hamma qator bir xil chiqadi — hisoblagichni ishlating.",
    why:
      "chiz_chiziq(i) har aylanishda boshqa uzunlik chizdi, chunki i 1, 2, 3, 4 bo'lib bordi. Hisoblagich aylanishlarni bir-biridan ana shunday farqlaydi.",
  },
  {
    kind: "count",
    counter: "i",
    shape: "rows",
    target: [row(4, "sariq"), row(3, "sariq"), row(2, "sariq"), row(1, "sariq")],
    pen: "sariq",
    blocks: blocks(line(I), line(calc("-", N(5), I)), line(N(4)), line(calc("-", I, N(1)))),
    bodyMax: 1,
    hint: "Hisoblagich hamisha oshib boradi. Qatorlar esa qisqarib boradi — orada hisob kerak.",
    why:
      "i 1, 2, 3, 4 bo'lib oshdi, 5 - i esa 4, 3, 2, 1 bo'lib kamaydi. Hisoblagichni to'g'ridan-to'g'ri emas, hisob orqali ham ishlatish mumkin.",
  },
  {
    kind: "count",
    counter: "i",
    shape: "rows",
    target: [row(1, "sariq"), row(2, "sariq"), row(3, "sariq")],
    pen: "kok",
    blocks: blocks(paint("sariq"), line(I), line(N(2)), paint("binafsha")),
    bodyMax: 2,
    hint: "Qalam boshida ko'k rangda. Qatorlar yuqoridan pastga bajariladi — tartib natijaga ta'sir qiladi.",
    why:
      "Avval rangla, keyin chiz: qalam allaqachon sariq bo'lgani uchun birinchi qator ham sariq chiqdi. Teskari tartibda birinchi qator ko'k rangda qolib ketardi.",
  },
  {
    kind: "count",
    counter: "i",
    shape: "rows",
    target: [row(2, "binafsha"), row(4, "binafsha"), row(6, "binafsha")],
    pen: "binafsha",
    blocks: blocks(line(I), line(calc("*", I, N(2))), line(N(2)), line(calc("+", I, N(1)))),
    bodyMax: 1,
    hint: "Qatorlar 2 talab oshib boradi. Hisoblagich esa bittalab oshadi.",
    why:
      "i 1, 2, 3 bo'ldi, i * 2 esa 2, 4, 6 berdi. Hisoblagichni hisobga qo'shib, aylanishlar orasidagi qadamni o'zgartirish mumkin.",
  },

  /* ── Third rung: the loop runs until the condition turns false ── */
  {
    kind: "while",
    counter: "i",
    shape: "rows",
    target: [row(1, "kok"), row(2, "kok"), row(3, "kok"), row(4, "kok")],
    pen: "kok",
    blocks: [],
    bodyMax: 0,
    body: [line(I)],
    start: 1,
    step: 1,
    conditions: conditions(
      { op: "<=", value: 4 },
      { op: "<", value: 4 },
      { op: ">=", value: 1 },
      { op: "!=", value: 4 }
    ),
    hint: "Sikl shart rost bo'lgan vaqtda aylanadi. Shart yolg'on bo'lishi bilan to'xtaydi.",
    why:
      "i <= 4 sharti i 5 ga yetganda yolg'on bo'ldi va sikl aynan 4 aylanishdan keyin to'xtadi. i >= 1 esa hech qachon yolg'on bo'lmaydi — i faqat oshib boradi.",
  },
  {
    kind: "while",
    counter: "i",
    shape: "rows",
    target: [row(5, "sariq"), row(4, "sariq"), row(3, "sariq"), row(2, "sariq")],
    pen: "sariq",
    blocks: [],
    bodyMax: 0,
    body: [line(I)],
    start: 5,
    step: -1,
    conditions: conditions(
      { op: ">", value: 1 },
      { op: ">", value: 0 },
      { op: "<", value: 10 },
      { op: ">=", value: 5 }
    ),
    hint: "Bu safar hisoblagich kamayib boradi. Shart qaysi qiymatda yolg'on bo'lishi kerak?",
    why:
      "i > 1 sharti i 1 ga tushganda yolg'on bo'ldi, shuning uchun oxirgi qator 2 katak bo'lib qoldi. i < 10 esa kamayuvchi hisoblagich uchun hech qachon yolg'on bo'lmaydi.",
  },
  {
    kind: "while",
    counter: "i",
    shape: "rows",
    target: [row(1, "binafsha"), row(3, "binafsha"), row(5, "binafsha")],
    pen: "binafsha",
    blocks: [],
    bodyMax: 0,
    body: [line(I)],
    start: 1,
    step: 2,
    conditions: conditions(
      { op: "<", value: 6 },
      { op: "<", value: 5 },
      { op: "!=", value: 6 },
      { op: ">", value: 0 }
    ),
    hint: "Hisoblagich ikkitalab oshadi. Shuning uchun ba'zi qiymatlarni umuman bosib o'tmaydi.",
    why:
      "i 1, 3, 5, 7 bo'lib bordi va i < 6 sharti 7 da yolg'on bo'ldi. i != 6 esa cheksiz sikl beradi: hisoblagich 6 ni chetlab o'tgani uchun shart hech qachon buzilmaydi.",
  },
];

/* ─────────────────────────── rendering the code ─────────────────────────── */

function exprText(expr: Expr, counter: string): string {
  switch (expr.kind) {
    case "number":
      return String(expr.value);
    case "counter":
      return counter;
    case "op":
      return `${exprText(expr.left, counter)} ${expr.op} ${exprText(expr.right, counter)}`;
  }
}

function statementText(statement: Statement, counter: string): string {
  switch (statement.op) {
    case "cell":
      return `chiz(${PALETTE[statement.colour].label})`;
    case "line":
      return `chiz_chiziq(${exprText(statement.arg, counter)})`;
    case "paint":
      return `rangla(${PALETTE[statement.colour].label})`;
  }
}

const conditionText = (condition: Condition, counter: string): string =>
  `${counter} ${condition.op} ${condition.value}`;

/** The counter line a `toki` body ends with, written out rather than implied. */
const stepText = (counter: string, step: number): string =>
  step < 0 ? `${counter} = ${counter} - ${-step}` : `${counter} = ${counter} + ${step}`;

/* ──────────────────────────── running the loop ──────────────────────────── */

/** One pass of the loop: the value the counter held, and what got drawn. */
interface Pass {
  i: number;
  cells: PaletteKey[];
}

interface Run {
  passes: Pass[];
  /** What the counter holds once the loop is over — the value that stopped it. */
  endI: number;
  /** The condition never turned false, so the run was cut short at STEP_CAP. */
  overflow: boolean;
}

function evalExpr(expr: Expr, i: number): number {
  switch (expr.kind) {
    case "number":
      return expr.value;
    case "counter":
      return i;
    case "op": {
      const left = evalExpr(expr.left, i);
      const right = evalExpr(expr.right, i);
      if (expr.op === "+") return left + right;
      if (expr.op === "-") return left - right;
      return left * right;
    }
  }
}

function holds(condition: Condition, i: number): boolean {
  switch (condition.op) {
    case "<":
      return i < condition.value;
    case "<=":
      return i <= condition.value;
    case ">":
      return i > condition.value;
    case ">=":
      return i >= condition.value;
    case "!=":
      return i !== condition.value;
  }
}

/**
 * Runs the body for every pass. The pen is set once, before the loop, so a
 * `rangla` inside the body keeps its effect on the passes that follow it — that
 * is what a real program does, and pretending otherwise would hide the mistake
 * of painting after drawing.
 */
function runLoop(
  puzzle: Puzzle,
  body: Statement[],
  bound: number | null,
  condition: Condition | null
): Run {
  const passes: Pass[] = [];
  let ink = puzzle.pen;

  const pass = (i: number) => {
    const cells: PaletteKey[] = [];
    for (const statement of body) {
      if (statement.op === "paint") {
        ink = statement.colour;
        continue;
      }
      if (statement.op === "cell") {
        cells.push(statement.colour);
        continue;
      }
      const count = Math.min(Math.max(evalExpr(statement.arg, i), 0), MAX_CELLS);
      for (let k = 0; k < count; k++) cells.push(ink);
    }
    passes.push({ i, cells });
  };

  if (puzzle.kind === "count") {
    const total = bound ?? 0;
    for (let i = 1; i <= total; i++) pass(i);
    return { passes, endI: total + 1, overflow: false };
  }

  const step = puzzle.step ?? 1;
  let i = puzzle.start ?? 1;
  if (!condition) return { passes, endI: i, overflow: false };

  while (holds(condition, i)) {
    if (passes.length >= STEP_CAP) return { passes, endI: i, overflow: true };
    pass(i);
    i += step;
  }

  return { passes, endI: i, overflow: false };
}

const sameRow = (a: PaletteKey[], b: PaletteKey[]): boolean =>
  a.length === b.length && a.every((cell, i) => cell === b[i]);

function matches(run: Run, puzzle: Puzzle): boolean {
  if (run.overflow || run.passes.length === 0) return false;
  if (puzzle.shape === "strip") {
    return sameRow(
      run.passes.flatMap((p) => p.cells),
      puzzle.target.flat()
    );
  }
  return (
    run.passes.length === puzzle.target.length &&
    run.passes.every((p, i) => sameRow(p.cells, puzzle.target[i]))
  );
}

/* ────────────────────────── author-supplied puzzle ────────────────────────── */

const COND_OPS = ["<=", ">=", "!=", "<", ">"] as const;

/** Reads `i`, a number, or two of those joined by + - * — a text box beats pickers. */
function parseExpr(text: string, counter: string): Expr | undefined {
  const raw = str(text);
  if (!raw) return undefined;

  const split = raw.match(/^(.+?)\s*([+\-*])\s*(.+)$/);
  if (split) {
    const left = parseTerm(split[1], counter);
    const right = parseTerm(split[3], counter);
    if (!left || !right) return undefined;
    return { kind: "op", op: split[2] as "+" | "-" | "*", left, right };
  }
  return parseTerm(raw, counter);
}

function parseTerm(text: string, counter: string): Expr | undefined {
  const token = str(text);
  if (!token) return undefined;
  if (token === counter) return { kind: "counter" };
  const value = num(token);
  return value === undefined ? undefined : { kind: "number", value: Math.round(value) };
}

/** Reads one body row the author typed as pseudo-code. */
function parseStatement(text: string, counter: string): Statement | undefined {
  const raw = str(text);
  if (!raw) return undefined;
  const call = raw.match(/^([a-z_]+)\s*\(\s*(.*?)\s*\)$/i);
  if (!call) return undefined;
  const [, name, arg] = call;

  if (name === "rangla") {
    const colour = enumValue(arg, PALETTE_KEYS);
    return colour ? { op: "paint", colour } : undefined;
  }
  if (name === "chiz") {
    const colour = enumValue(arg, PALETTE_KEYS);
    return colour ? { op: "cell", colour } : undefined;
  }
  if (name === "chiz_chiziq") {
    const parsed = parseExpr(arg, counter);
    return parsed ? { op: "line", arg: parsed } : undefined;
  }
  return undefined;
}

/** Reads `i <= 4`, or just `<= 4` — the counter's name is already known. */
function parseCondition(text: string, counter: string): Omit<Condition, "id"> | undefined {
  const raw = str(text);
  if (!raw) return undefined;
  const trimmed = raw.startsWith(counter) ? raw.slice(counter.length) : raw;
  const parts = trimmed.trim().match(/^(<=|>=|!=|<|>)\s*(-?\d+)$/);
  if (!parts) return undefined;
  const op = enumValue(parts[1], COND_OPS);
  const value = int(parts[2], -99, 99);
  return op && value !== undefined ? { op, value } : undefined;
}

/** Reads the rows of a staircase target: `[[...], [...]]` or `[{ cells: [...] }]`. */
function parseRows(value: unknown): PaletteKey[][] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out: PaletteKey[][] = [];
  for (const raw of value) {
    const cells = enumList(Array.isArray(raw) ? raw : (raw as any)?.cells, PALETTE_KEYS);
    if (cells) out.push(cells);
  }
  return out.length > 0 ? out : undefined;
}

/**
 * Brute-forces every body and repeat count the offered blocks can build. A puzzle
 * with no correct answer at all is worse than falling back to a built-in one, and
 * at these sizes the search costs nothing.
 */
function solvable(puzzle: Puzzle): boolean {
  if (puzzle.kind === "while") {
    return (puzzle.conditions ?? []).some((condition) =>
      matches(runLoop(puzzle, puzzle.body ?? [], null, condition), puzzle)
    );
  }
  if (puzzle.blocks.length === 0) return false;

  for (let length = 1; length <= puzzle.bodyMax; length++) {
    const combinations = puzzle.blocks.length ** length;
    // A pool this wide is beyond what the writer's form can produce; trusting the
    // author beats freezing the page on a search that cannot finish.
    if (combinations > 20000) return true;

    for (let n = 0; n < combinations; n++) {
      const body: Statement[] = [];
      let rest = n;
      for (let slot = 0; slot < length; slot++) {
        body.push(puzzle.blocks[rest % puzzle.blocks.length].statement);
        rest = Math.floor(rest / puzzle.blocks.length);
      }
      for (let bound = 1; bound <= MAX_COUNT; bound++) {
        if (matches(runLoop(puzzle, body, bound, null), puzzle)) return true;
      }
    }
  }
  return false;
}

/** Builds the puzzle an author configured in the writer, or null if incomplete. */
function fromConfig(config: unknown): Puzzle | null {
  if (!hasConfig(config)) return null;

  const counter = str(config.counter) ?? "i";
  const pen = enumValue(config.pen, PALETTE_KEYS) ?? "yashil";
  const kind = enumValue(config.kind, ["count", "while"] as const) ?? "count";

  // Rows make a staircase, a flat strip makes the older pattern puzzle. One
  // block repeated is still a pattern; a single cell is not, so two is the
  // shortest strip worth asking a loop for.
  const rows = parseRows(config.rows);
  const flat = enumList(config.target, PALETTE_KEYS);
  const target = rows ?? (flat && flat.length >= 2 ? [flat] : undefined);
  if (!target) return null;
  const shape: "strip" | "rows" = rows ? "rows" : "strip";

  const authored = strList(config.blocks)
    ?.map((text) => parseStatement(text, counter))
    .filter((statement): statement is Statement => statement !== undefined);

  // With no blocks written out, the offered colours become one-cell blocks — the
  // shape the older colour-strip configs are in. A strip needing a colour the
  // palette withholds cannot be built at all, so the target's own colours are
  // always on offer alongside the author's.
  const offered = new Set<PaletteKey>([
    ...(enumList(config.palette, PALETTE_KEYS) ?? []),
    ...target.flat(),
  ]);
  const pool =
    authored && authored.length > 0
      ? blocks(...authored)
      : colours(...PALETTE_KEYS.filter((key) => offered.has(key)));

  const base = {
    counter,
    shape,
    target,
    pen,
    hint:
      str(config.hint) ??
      (kind === "while"
        ? "Siklni to'xtatadigan shartni tanlang."
        : "Naqshni kuzatib, takrorlanadigan bo'lakni sikl ichiga joylang."),
    why: str(config.why) ?? "",
  };

  if (kind === "while") {
    const body = strList(config.body)
      ?.map((text) => parseStatement(text, counter))
      .filter((statement): statement is Statement => statement !== undefined);
    if (!body || body.length === 0) return null;

    const offeredConditions = strList(config.conditions)
      ?.map((text) => parseCondition(text, counter))
      .filter((item): item is Omit<Condition, "id"> => item !== undefined);
    // One condition is not a choice, and a step of zero cannot ever end the loop.
    if (!offeredConditions || offeredConditions.length < 2) return null;

    const step = int(config.step, -9, 9) ?? 1;
    if (step === 0) return null;

    const puzzle: Puzzle = {
      ...base,
      kind: "while",
      blocks: [],
      bodyMax: 0,
      body,
      conditions: conditions(...offeredConditions),
      start: int(config.start, -99, 99) ?? 1,
      step,
    };
    return solvable(puzzle) ? puzzle : null;
  }

  const puzzle: Puzzle = {
    ...base,
    kind: "count",
    blocks: pool,
    bodyMax: int(config.bodyMax, 1, MAX_BODY) ?? MAX_BODY,
  };
  return solvable(puzzle) ? puzzle : null;
}

/* ────────────────────────────────── board ────────────────────────────────── */

export function LoopRepeatGame(props: GameProps) {
  const { config, context, seed, variant } = props;

  /**
   * A lesson whose level is called "Sikl hisoblagichi" must not be handed a
   * colour strip, and the one about escaping an infinite loop belongs on a `toki`
   * puzzle. The lesson's own words pick the rung when they name one.
   */
  const puzzle = useMemo(() => {
    const title = context ?? "";
    const wanted = /cheksiz|toki\b|to'xta/.test(title)
      ? "while"
      : /hisoblagich|zinapoya|counter|indeks/.test(title)
      ? "counter"
      : undefined;

    return (
      (hasConfig(config) ? fromConfig(config) : null) ??
      pickVariant(PUZZLES, seed, {
        prefer:
          wanted === "while"
            ? (p) => p.kind === "while"
            : wanted === "counter"
            ? (p) => p.kind === "count" && p.shape === "rows"
            : undefined,
        ordinal: variant,
      })
    );
  }, [config, context, seed, variant]);

  const [body, setBody] = useState<string[]>([]);
  const [bound, setBound] = useState<number | null>(null);
  const [conditionId, setConditionId] = useState<string | null>(null);

  const blockById = useMemo(
    () => new Map(puzzle.blocks.map((block) => [block.id, block])),
    [puzzle.blocks]
  );
  const condition = useMemo(
    () => puzzle.conditions?.find((item) => item.id === conditionId) ?? null,
    [puzzle.conditions, conditionId]
  );

  const isWhile = puzzle.kind === "while";
  const counter = puzzle.counter;

  /**
   * The body read through a filter, so a puzzle swapped underneath — the writer
   * editing its config live — cannot leave rows pointing at blocks that the new
   * puzzle no longer offers.
   */
  const rows = useMemo(
    () => body.filter((id) => blockById.has(id)).slice(0, puzzle.bodyMax),
    [body, blockById, puzzle.bodyMax]
  );

  const statements = useMemo(
    () =>
      isWhile
        ? puzzle.body ?? []
        : rows
            .map((id) => blockById.get(id)?.statement)
            .filter((statement): statement is Statement => statement !== undefined),
    [isWhile, puzzle.body, rows, blockById]
  );

  const run = useMemo(
    () => runLoop(puzzle, statements, bound, condition),
    [puzzle, statements, bound, condition]
  );

  const { status, reset } = useGameCheck(props, {
    ready: isWhile ? condition !== null : rows.length > 0 && bound !== null,
    check: () => matches(run, puzzle),
  });

  /** Colour blocks read as blocks; statement rows read as code and stack. */
  const inlineBody = puzzle.blocks.every((block) => block.statement.op === "cell");

  // ── Body edits ──────────────────────────────────────────────────────────

  const edit = (change: (current: string[]) => string[]) => {
    reset();
    setBody((prev) =>
      change(prev.filter((id) => blockById.has(id)).slice(0, puzzle.bodyMax))
    );
  };

  const drop = (id: string, slot: number, from?: number) => {
    if (isWhile) {
      if (slot !== COND_SLOT) return;
      if (!puzzle.conditions?.some((item) => item.id === id)) return;
      reset();
      setConditionId(id);
      return;
    }
    if (!blockById.has(id)) return;
    edit((next) => {
      if (from !== undefined) {
        if (slot >= next.length) {
          // Dragged onto the trailing placeholder: move it to the end.
          next.splice(from, 1);
          next.push(id);
        } else {
          [next[from], next[slot]] = [next[slot], next[from]];
        }
        return next;
      }
      if (slot >= next.length) {
        return next.length >= puzzle.bodyMax ? next : [...next, id];
      }
      next[slot] = id;
      return next;
    });
  };

  const append = (id: string, from?: number) => {
    if (from !== undefined) return;
    if (isWhile) {
      drop(id, COND_SLOT);
      return;
    }
    if (!blockById.has(id)) return;
    edit((next) => (next.length >= puzzle.bodyMax ? next : [...next, id]));
  };

  const removeAt = (index: number) => edit((next) => next.filter((_, i) => i !== index));

  const drag = useBlockDrag<string>({
    onDrop: drop,
    onDropOutside: (_id, from) => {
      if (from === undefined) return;
      if (isWhile) {
        reset();
        setConditionId(null);
        return;
      }
      removeAt(from);
    },
    onTap: append,
  });

  const pickBound = (value: number) => {
    reset();
    setBound(value);
  };

  const clearAll = () => {
    reset();
    setBody([]);
    setBound(null);
    setConditionId(null);
  };

  /* ── What went wrong, without saying what would have been right ── */

  const flat = run.passes.flatMap((p) => p.cells);
  const wantFlat = puzzle.target.flat();

  const failText = run.overflow
    ? `Shart hech qachon yolg'on bo'lmadi: ${STEP_CAP} aylanishdan keyin ham sikl davom etayotgan edi, shuning uchun uni to'xtatdik. Bu — cheksiz sikl.`
    : run.passes.length === 0
    ? isWhile
      ? "Shart birinchi tekshirishda yolg'on bo'ldi, shuning uchun sikl bir marta ham aylanmadi."
      : "Sikl bir marta ham aylanmadi — takrorlar sonini tanlang."
    : puzzle.shape === "strip"
    ? flat.length !== wantFlat.length
      ? `Sizning siklingiz ${flat.length} katak chizdi, kerak ${wantFlat.length}. Bo'lak uzunligini yoki takrorlar sonini o'zgartiring.`
      : "Kataklar soni to'g'ri, lekin ranglar tartibi mos emas — bo'lak ichidagi tartibni qayta ko'rib chiqing."
    : run.passes.length !== puzzle.target.length
    ? `Sikl ${run.passes.length} marta aylandi, naqshda esa ${puzzle.target.length} qator bor. ${
        isWhile ? "Shart qaysi qiymatda yolg'on bo'lishini sanab ko'ring." : "Takrorlar sonini qayta hisoblang."
      }`
    : "Aylanishlar soni to'g'ri, lekin qatorlarning uzunligi yoki rangi mos emas. Belgilangan qatorga qarang: o'sha aylanishda hisoblagich qanday qiymatda edi?";

  const revealed = status !== "idle";
  const bodyFull = !isWhile && rows.length >= puzzle.bodyMax;

  return (
    <GameShell
      task={
        isWhile
          ? "Siklni o'z vaqtida to'xtatadigan shartni tanlang."
          : "Sikl yordamida yuqoridagi naqshni aynan takrorlang."
      }
      hint={puzzle.hint}
      status={status}
      successText={puzzle.why}
      failText={failText}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 truncate font-mono text-[12px] text-gray-500 dark:text-[#6d6d74]">
            {isWhile
              ? condition
                ? `toki ${conditionText(condition, counter)}`
                : "shart tanlanmagan"
              : puzzle.shape === "strip"
              ? `${bound ?? "?"} x ${rows.length} = ${bound === null ? "?" : flat.length} katak`
              : `${bound ?? "?"} aylanish`}
          </span>
          <GameReset
            onClick={clearAll}
            disabled={rows.length === 0 && bound === null && conditionId === null}
          />
        </div>
      }
    >
      <div className="mb-3">
        <GameHowTo
          steps={
            isWhile
              ? [
                  "Pastdagi shartni ushlab, «toki» dan keyingi bo'sh joyga tashlang.",
                  `Sikl shart rost bo'lgan vaqtda aylanadi, har aylanishda ${counter} o'zgaradi.`,
                  "«Tekshirish» ni bosing — har aylanish shundan keyin ko'rinadi.",
                ]
              : [
                  "Pastdagi blokni ushlab, sikl ichidagi bo'sh joyga tashlang.",
                  `Sikl necha marta aylanishini tanlang — ${counter} 1 dan shu songacha boradi.`,
                  "«Tekshirish» ni bosing — natija shundan keyin ko'rinadi.",
                ]
          }
        />
      </div>

      <GameBoard label="Kerakli naqsh">
        {puzzle.shape === "strip" ? (
          <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
            <Cells cells={wantFlat} size={32} />
            <span className="ml-1.5 font-mono text-[12px] text-gray-400 dark:text-[#6d6d74]">
              {wantFlat.length} katak
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {puzzle.target.map((cells, i) => (
              <div key={i} className="flex flex-wrap items-center gap-1.5">
                <Cells cells={cells} size={24} />
              </div>
            ))}
            <span className="mt-1 font-mono text-[12px] text-gray-400 dark:text-[#6d6d74]">
              {puzzle.target.length} qator
            </span>
          </div>
        )}
      </GameBoard>

      {/* ── The loop, in the notation the lessons use ── */}
      <div className="mt-3">
        <GameBoard label="Sikl">
          {isWhile ? (
            <>
              <div className="font-mono text-[13.5px] text-gray-700 dark:text-[#d4d4d8]">
                <span className="font-bold text-[#7C5CE0] dark:text-[#c4b5fd]">{counter}</span> ={" "}
                {puzzle.start ?? 1}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[13.5px] text-gray-700 dark:text-[#d4d4d8]">
                <IconRepeat size={17} className="shrink-0 text-[#7C5CE0]" />
                <span>toki</span>
                <DropSlot
                  index={COND_SLOT}
                  filled={Boolean(condition)}
                  active={drag.overSlot === COND_SLOT}
                  className="min-w-[140px] px-1.5"
                >
                  {condition ? (
                    <div
                      {...drag.bind(condition.id, COND_SLOT)}
                      className={`flex-1 min-w-0 flex items-center gap-2 rounded-[10px] border-2 border-[#7C5CE0]/50 bg-white dark:bg-[#101013] px-2 py-1.5 ${grabClass}`}
                    >
                      <IconGripVertical
                        size={13}
                        className="shrink-0 text-gray-300 dark:text-[#3f3f46]"
                      />
                      <span className="min-w-0 flex-1 font-mono text-[13px] text-gray-800 dark:text-[#e4e4e7]">
                        {conditionText(condition, counter)}
                      </span>
                      <button
                        type="button"
                        data-no-drag
                        onClick={() => {
                          reset();
                          setConditionId(null);
                        }}
                        aria-label="Shartni olib tashlash"
                        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 dark:text-[#6d6d74] opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <IconX size={13} stroke={2.5} />
                      </button>
                    </div>
                  ) : (
                    <span className="px-2 font-mono text-[12px] text-gray-400 dark:text-[#5c5c64]">
                      shart&nbsp;bu&nbsp;yerga
                    </span>
                  )}
                </DropSlot>
                <span>:</span>
              </div>

              {/* The body is given here — the condition is the blank. */}
              <div className="mt-3 ml-5 pl-4 border-l-2 border-[#7C5CE0]/40 flex flex-col gap-1.5">
                {statements.map((statement, i) => (
                  <span
                    key={i}
                    className="font-mono text-[13px] text-gray-700 dark:text-[#d4d4d8]"
                  >
                    {statementText(statement, counter)}
                  </span>
                ))}
                <span className="font-mono text-[13px] text-gray-500 dark:text-[#8b8b93]">
                  {stepText(counter, puzzle.step ?? 1)}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-[13.5px] text-gray-700 dark:text-[#d4d4d8]">
                <IconRepeat size={17} className="shrink-0 text-[#7C5CE0]" />
                <span>
                  har <span className="font-bold text-[#7C5CE0] dark:text-[#c4b5fd]">{counter}</span>{" "}
                  uchun 1 dan
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: MAX_COUNT }).map((_, i) => {
                    const value = i + 1;
                    const active = bound === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => pickBound(value)}
                        aria-pressed={active}
                        className={`w-8 h-8 rounded-[9px] border-2 font-mono text-[13px] font-bold transition-colors cursor-pointer ${
                          active
                            ? "border-[#7C5CE0] bg-[#7C5CE0] text-white"
                            : "border-gray-200 dark:border-[#2b2b31] text-gray-500 dark:text-[#8b8b93] hover:border-[#7C5CE0] hover:text-[#7C5CE0]"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
                <span>gacha:</span>
              </div>

              {/* The counter's own values, not the result — chosen by the learner,
                  so naming them gives nothing away and makes the counter real. */}
              {bound !== null && (
                <p className="mt-2 font-mono text-[12px] text-gray-400 dark:text-[#6d6d74]">
                  {counter}:{" "}
                  {Array.from({ length: bound }, (_, i) => i + 1).join(", ")}
                </p>
              )}

              <div
                className={`mt-3.5 ml-5 pl-4 border-l-2 border-[#7C5CE0]/40 flex ${
                  inlineBody ? "flex-row flex-wrap items-center gap-2" : "flex-col gap-2"
                }`}
              >
                {rows.map((id, i) => {
                  const block = blockById.get(id);
                  if (!block) return null;
                  const statement = block.statement;

                  return (
                    <DropSlot
                      key={i}
                      index={i}
                      filled
                      active={drag.overSlot === i}
                      className={
                        inlineBody ? "w-[46px] h-[46px] justify-center" : "px-1.5"
                      }
                    >
                      {statement.op === "cell" ? (
                        <div
                          {...drag.bind(id, i)}
                          style={{ backgroundColor: PALETTE[statement.colour].hex }}
                          title={PALETTE[statement.colour].label}
                          className={`relative w-[42px] h-[42px] rounded-[9px] ${grabClass}`}
                        >
                          <button
                            type="button"
                            data-no-drag
                            onClick={() => removeAt(i)}
                            aria-label={`${PALETTE[statement.colour].label} katakni olib tashlash`}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-900/80 dark:bg-black/70 text-white flex items-center justify-center cursor-pointer"
                          >
                            <IconX size={11} stroke={3} />
                          </button>
                        </div>
                      ) : (
                        <div
                          {...drag.bind(id, i)}
                          className={`flex-1 min-w-0 flex items-center gap-2 rounded-[10px] border-2 border-[#7C5CE0]/50 bg-white dark:bg-[#101013] px-2 py-2 ${grabClass}`}
                        >
                          <IconGripVertical
                            size={13}
                            className="shrink-0 text-gray-300 dark:text-[#3f3f46]"
                          />
                          <span className="min-w-0 flex-1 font-mono text-[13px] text-gray-800 dark:text-[#e4e4e7]">
                            {statementText(statement, counter)}
                          </span>
                          <button
                            type="button"
                            data-no-drag
                            onClick={() => removeAt(i)}
                            aria-label={`${i + 1}-qatorni olib tashlash`}
                            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 dark:text-[#6d6d74] opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <IconX size={13} stroke={2.5} />
                          </button>
                        </div>
                      )}
                    </DropSlot>
                  );
                })}

                {rows.length < puzzle.bodyMax && (
                  <DropSlot
                    index={rows.length}
                    active={drag.overSlot === rows.length}
                    className={
                      inlineBody ? "w-[46px] h-[46px] justify-center" : "px-1.5 py-2"
                    }
                  >
                    <span className="px-1 text-[11px] font-mono text-gray-400 dark:text-[#5c5c64]">
                      bu&nbsp;yerga
                    </span>
                  </DropSlot>
                )}

                {rows.length === 0 && (
                  <span className="text-[12.5px] text-gray-400 dark:text-[#6d6d74]">
                    Sikl tanasi bo&apos;sh
                  </span>
                )}
              </div>
            </>
          )}
        </GameBoard>
      </div>

      {/* ── Palette ── */}
      <div className="mt-3">
        <GameBoard
          label={isWhile ? "Shartlar" : inlineBody ? "Ranglar" : "Bloklar"}
          className="flex flex-wrap gap-2.5"
        >
          {isWhile
            ? (puzzle.conditions ?? []).map((item) => (
                <div
                  key={item.id}
                  {...drag.bind(item.id)}
                  title="Ushlab, «toki» dan keyin tashlang"
                  className={`flex items-center gap-2 rounded-[12px] border-2 border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] pl-2 pr-3 py-2 hover:border-[#7C5CE0] transition-colors ${grabClass} ${
                    conditionId === item.id ? "opacity-40" : ""
                  }`}
                >
                  <IconGripVertical
                    size={14}
                    className="shrink-0 text-gray-300 dark:text-[#3f3f46]"
                  />
                  <span className="font-mono text-[13px] font-medium text-gray-700 dark:text-[#d4d4d8]">
                    {conditionText(item, counter)}
                  </span>
                </div>
              ))
            : puzzle.blocks.map((block) => (
                <div
                  key={block.id}
                  {...drag.bind(block.id)}
                  title="Ushlab, sikl ichiga tashlang"
                  className={`flex items-center gap-2 rounded-[12px] border-2 border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] pl-2 pr-3 py-2 hover:border-[#7C5CE0] transition-colors ${grabClass} ${
                    bodyFull ? "opacity-40" : ""
                  }`}
                >
                  <IconGripVertical
                    size={14}
                    className="shrink-0 text-gray-300 dark:text-[#3f3f46]"
                  />
                  {block.statement.op === "cell" ? (
                    <>
                      <span
                        style={{ backgroundColor: PALETTE[block.statement.colour].hex }}
                        className="w-6 h-6 rounded-[7px] shrink-0"
                      />
                      <span className="text-[12.5px] font-medium text-gray-600 dark:text-[#a1a1aa]">
                        {PALETTE[block.statement.colour].label}
                      </span>
                    </>
                  ) : (
                    <span className="font-mono text-[12.5px] text-gray-700 dark:text-[#d4d4d8]">
                      {statementText(block.statement, counter)}
                    </span>
                  )}
                </div>
              ))}
        </GameBoard>
      </div>

      {/* Nothing is evaluated until the learner commits — otherwise the puzzle
          turns into nudging blocks until the two strips look the same. */}
      {revealed && (
        <div className="mt-3">
          <GameBoard label="Sikl qanday aylandi">
            {puzzle.shape === "strip" ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                  {flat.map((tile, i) => (
                    <span
                      key={i}
                      style={{ backgroundColor: PALETTE[tile].hex }}
                      className={`w-8 h-8 rounded-[8px] ${
                        status === "fail" && wantFlat[i] !== tile
                          ? "ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-[#141416]"
                          : ""
                      }`}
                    />
                  ))}
                </div>
                <p className="font-mono text-[12px] text-gray-400 dark:text-[#6d6d74]">
                  {run.passes.length} aylanish, jami {flat.length} katak
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {run.passes.map((pass, i) => {
                  const wrong =
                    status === "fail" &&
                    (puzzle.target[i] === undefined || !sameRow(pass.cells, puzzle.target[i]));

                  return (
                    <div
                      key={i}
                      className={`flex flex-wrap items-center gap-2 rounded-[10px] px-2 py-1.5 ${
                        wrong ? "ring-2 ring-amber-500" : ""
                      }`}
                    >
                      <span className="w-[62px] shrink-0 font-mono text-[12px] text-gray-500 dark:text-[#8b8b93]">
                        {counter} = {pass.i}
                      </span>
                      <Cells cells={pass.cells} size={24} />
                      {pass.cells.length === 0 && (
                        <span className="text-[12px] text-gray-400 dark:text-[#6d6d74]">
                          hech narsa chizilmadi
                        </span>
                      )}
                    </div>
                  );
                })}

                <p className="mt-1 font-mono text-[12px] text-gray-400 dark:text-[#6d6d74]">
                  {run.overflow
                    ? `${counter} = ${run.endI} — shart hali ham rost, sikl to'xtamadi`
                    : isWhile
                    ? `${counter} = ${run.endI} — shart yolg'on, sikl tugadi`
                    : `${run.passes.length} aylanish`}
                </p>
              </div>
            )}
          </GameBoard>
        </div>
      )}

      {!revealed && (
        <div className="mt-3">
          <GameNote>
            {isWhile ? (
              <>
                Shart har aylanish boshida tekshiriladi. Agar u hech qachon yolg&apos;on
                bo&apos;lmasa, sikl to&apos;xtamaydi — bu cheksiz sikl.
              </>
            ) : puzzle.shape === "rows" ? (
              <>
                Sikl tanasi bir marta yoziladi, lekin har aylanishda {counter} boshqa
                qiymatda bo&apos;ladi. Shuning uchun bitta qator har xil natija berishi
                mumkin.
              </>
            ) : (
              <>
                Bo&apos;lak qanchalik qisqa bo&apos;lsa, sikl shunchalik foydali. Eng kichik
                takrorlanuvchi bo&apos;lakni topishga harakat qiling.
              </>
            )}
          </GameNote>
        </div>
      )}

      {drag.isDragging && drag.drag && (
        <DragGhost x={drag.drag.x} y={drag.drag.y}>
          <Ghost id={drag.drag.payload} puzzle={puzzle} />
        </DragGhost>
      )}
    </GameShell>
  );
}

/* ──────────────────────────── small pieces ──────────────────────────── */

function Cells({ cells, size }: { cells: PaletteKey[]; size: number }) {
  return (
    <>
      {cells.map((tile, i) => (
        <span
          key={i}
          title={PALETTE[tile].label}
          style={{
            backgroundColor: PALETTE[tile].hex,
            width: size,
            height: size,
            borderRadius: Math.round(size / 4),
          }}
          className="shrink-0"
        />
      ))}
    </>
  );
}

/** What follows the finger: the colour itself, or the line of code. */
function Ghost({ id, puzzle }: { id: string; puzzle: Puzzle }) {
  const block = puzzle.blocks.find((item) => item.id === id);
  if (block?.statement.op === "cell") {
    return (
      <span
        style={{ backgroundColor: PALETTE[block.statement.colour].hex }}
        className="block w-[42px] h-[42px] rounded-[9px] shadow-lg"
      />
    );
  }

  const condition = puzzle.conditions?.find((item) => item.id === id);
  const text = block
    ? statementText(block.statement, puzzle.counter)
    : condition
    ? conditionText(condition, puzzle.counter)
    : "";

  return (
    <span className="block rounded-[10px] bg-[#7C5CE0] px-3 py-2 font-mono text-[12.5px] text-white shadow-lg">
      {text}
    </span>
  );
}
