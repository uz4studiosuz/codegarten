"use client";

import React, { useMemo, useState } from "react";
import { IconGripVertical, IconX } from "@tabler/icons-react";
import type { GameProps } from "../types";
import {
  PALETTE,
  PALETTE_KEYS,
  enumValue,
  hasConfig,
  int,
  isPaletteKey,
  num,
  objList,
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
 * Write the body once, watch it serve every call
 * ----------------------------------------------
 * The first version of this game handed the learner a finished function and let
 * them drop arguments into three calls. That taught the wrong half: the body was
 * never theirs, so "one definition, many uses" was something the board asserted
 * rather than something they did, and `return` never came up at all.
 *
 * Now the signature is given and the body is empty rows. The learner assembles
 * the body out of statement blocks, and checking runs that one body against
 * every call. That is what makes the instructive mistake possible: a block with a
 * hard-coded value inside it (`katak_chiz(3)`, `rangla(binafsha)`, `return 9`)
 * satisfies the one call it happens to fit and visibly fails the rest. The board
 * never says which block was wrong — it shows what each call produced, which is
 * the same evidence a programmer would have.
 *
 * Checking is by simulation rather than against one authored body, because more
 * than one body can be right: an early `return` makes a later row dead code, and
 * that is still a correct function.
 *
 * Two things carried over from watching children use the earlier games: nothing
 * is evaluated until they press check (a live result strip turns the puzzle into
 * nudging pieces until the two sides match), and the remove button on a placed
 * block stays visible instead of appearing on hover, which never happens on a
 * touch screen.
 */

/** The one local a body may compute into, so `return` has something to hand back. */
const LOCAL = "natija";

/** The board draws one card per call, and three is as many as read on a phone. */
const MAX_CALLS = 3;

/** Long strips wrap rather than clip, but a body cannot ask for an endless one. */
const MAX_CELLS = 14;

/** An argument a call passes in: a number, or a colour from the shared palette. */
type Arg = number | PaletteKey;

interface Param {
  name: string;
  /** Decides how a call renders it and which statements can read it. */
  type: "number" | "colour";
}

/** What a statement is given: a parameter, a hard-coded literal, or the local. */
type Expr =
  | { kind: "param"; name: string }
  | { kind: "number"; value: number }
  | { kind: "colour"; value: PaletteKey }
  | { kind: "local" }
  | { kind: "op"; op: "+" | "-" | "*"; left: Expr; right: Expr };

type Statement =
  | { op: "draw"; arg: Expr }
  | { op: "paint"; arg: Expr }
  | { op: "assign"; arg: Expr }
  | { op: "return"; arg: Expr };

interface Block {
  id: string;
  statement: Statement;
}

type Expected =
  | { kind: "strip"; length: number; colour: PaletteKey }
  | { kind: "value"; value: number };

interface Call {
  /** Already filled in, in the signature's order — this stage is about the body. */
  args: Arg[];
  expect: Expected;
}

interface Puzzle {
  fnName: string;
  params: Param[];
  /** "strip" puzzles draw; "value" puzzles make the result a number, so `return` matters. */
  mode: "strip" | "value";
  /** How many statements the body has room for. Every row must be filled. */
  bodySlots: number;
  /** Strip puzzles: the colour the pen starts at, so a one-row body can draw. */
  pen?: PaletteKey;
  blocks: Block[];
  calls: Call[];
  hint: string;
  why: string;
}

const param = (name: string): Expr => ({ kind: "param", name });
const number = (value: number): Expr => ({ kind: "number", value });
const colour = (value: PaletteKey): Expr => ({ kind: "colour", value });
const times = (left: Expr, right: Expr): Expr => ({ kind: "op", op: "*", left, right });
const plus = (left: Expr, right: Expr): Expr => ({ kind: "op", op: "+", left, right });

const blocks = (...statements: Statement[]): Block[] =>
  statements.map((statement, i) => ({ id: `b${i}`, statement }));

/**
 * Ordered simplest first, because the lesson ordinal walks this list: puzzle 0 is
 * somebody's first ever functions exercise. One parameter, then two, then a
 * hard-coded block that is genuinely tempting, then `return`.
 */
const PUZZLES: Puzzle[] = [
  {
    fnName: "chiz",
    params: [{ name: "uzunlik", type: "number" }],
    mode: "strip",
    bodySlots: 1,
    pen: "yashil",
    hint: "Tana bo'sh. Uchta chaqiruvning hammasida to'g'ri ishlaydigan bitta qatorni tanlang.",
    blocks: blocks(
      { op: "draw", arg: param("uzunlik") },
      { op: "draw", arg: number(3) },
      { op: "draw", arg: number(1) }
    ),
    calls: [
      { args: [2], expect: { kind: "strip", length: 2, colour: "yashil" } },
      { args: [5], expect: { kind: "strip", length: 5, colour: "yashil" } },
      { args: [3], expect: { kind: "strip", length: 3, colour: "yashil" } },
    ],
    why:
      "uzunlik — chaqiruvdan kelgan qiymat, shuning uchun bitta qator uch xil uzunlikni ham chizdi. Aniq son yozilganda esa u faqat bitta chaqiruvga to'g'ri kelardi.",
  },
  {
    fnName: "chiz",
    params: [
      { name: "uzunlik", type: "number" },
      { name: "rang", type: "colour" },
    ],
    mode: "strip",
    bodySlots: 2,
    pen: "yashil",
    hint: "Ikki qator kerak. Qatorlar yuqoridan pastga bajariladi — tartib natijaga ta'sir qiladi.",
    blocks: blocks(
      { op: "paint", arg: param("rang") },
      { op: "draw", arg: param("uzunlik") },
      { op: "draw", arg: number(2) },
      { op: "paint", arg: colour("sariq") }
    ),
    calls: [
      { args: [3, "binafsha"], expect: { kind: "strip", length: 3, colour: "binafsha" } },
      { args: [2, "kok"], expect: { kind: "strip", length: 2, colour: "kok" } },
      { args: [4, "sariq"], expect: { kind: "strip", length: 4, colour: "sariq" } },
    ],
    why:
      "Bitta tana ikkala parametrni ham ishlatdi: rang bo'yashga, uzunlik chizishga. Shuning uchun uchta chaqiruv uch xil natija berdi.",
  },
  {
    fnName: "ustun",
    params: [
      { name: "balandlik", type: "number" },
      { name: "rang", type: "colour" },
    ],
    mode: "strip",
    bodySlots: 2,
    pen: "kok",
    hint: "Ikkita chaqiruvda balandlik bir xil, uchinchisida esa boshqa. Uchtasiga ham yarasin.",
    blocks: blocks(
      { op: "paint", arg: param("rang") },
      { op: "draw", arg: param("balandlik") },
      { op: "draw", arg: number(4) },
      { op: "paint", arg: colour("sariq") }
    ),
    calls: [
      { args: [4, "sariq"], expect: { kind: "strip", length: 4, colour: "sariq" } },
      { args: [4, "binafsha"], expect: { kind: "strip", length: 4, colour: "binafsha" } },
      { args: [2, "yashil"], expect: { kind: "strip", length: 2, colour: "yashil" } },
    ],
    why:
      "Aniq son ikki chaqiruvga to'g'ri kelib, uchinchisida buzildi. balandlik parametri esa uchtasida ham to'g'ri ishladi — funksiya tanasi qiymatni o'zi bilmaydi, chaqiruvdan oladi.",
  },
  {
    fnName: "chizgi",
    params: [
      { name: "uzunlik", type: "number" },
      { name: "rang", type: "colour" },
    ],
    mode: "strip",
    bodySlots: 2,
    pen: "kok",
    hint: "Ikki chaqiruvning rangi bir xil — uchinchisi esa boshqa rang so'raydi.",
    blocks: blocks(
      { op: "paint", arg: param("rang") },
      { op: "paint", arg: colour("binafsha") },
      { op: "draw", arg: param("uzunlik") },
      { op: "draw", arg: number(3) }
    ),
    calls: [
      { args: [3, "binafsha"], expect: { kind: "strip", length: 3, colour: "binafsha" } },
      { args: [5, "binafsha"], expect: { kind: "strip", length: 5, colour: "binafsha" } },
      { args: [2, "sariq"], expect: { kind: "strip", length: 2, colour: "sariq" } },
    ],
    why:
      "Ikki chaqiruv bir xil rang so'ragani uchun aniq rang yozish bir muddat ishlaydi. Uchinchi chaqiruv esa faqat rang parametri bilan o'tadi — shu sinov tanadagi yashirin qiymatni ochib beradi.",
  },
  {
    fnName: "ikkilantir",
    params: [{ name: "son", type: "number" }],
    mode: "value",
    bodySlots: 1,
    hint: "Bu chaqiruv rasm emas, son beradi. Sonni tashqariga return chiqaradi.",
    blocks: blocks(
      { op: "return", arg: times(param("son"), number(2)) },
      { op: "return", arg: param("son") },
      { op: "return", arg: number(6) },
      { op: "assign", arg: times(param("son"), number(2)) }
    ),
    calls: [
      { args: [3], expect: { kind: "value", value: 6 } },
      { args: [5], expect: { kind: "value", value: 10 } },
      { args: [7], expect: { kind: "value", value: 14 } },
    ],
    why:
      "return hisoblangan qiymatni chaqiruvchiga uzatdi. Faqat hisoblab qo'yish yetarli emas: qaytarilmagan qiymat funksiya ichida qolib ketadi va tashqarida ko'rinmaydi.",
  },
  {
    fnName: "jami",
    params: [
      { name: "a", type: "number" },
      { name: "b", type: "number" },
    ],
    mode: "value",
    bodySlots: 1,
    hint: "Ikkita argument keldi — ikkalasi ham natijaga qatnashishi kerak.",
    blocks: blocks(
      { op: "return", arg: plus(param("a"), param("b")) },
      { op: "return", arg: times(param("a"), param("b")) },
      { op: "return", arg: param("a") },
      { op: "assign", arg: plus(param("a"), param("b")) }
    ),
    calls: [
      { args: [2, 2], expect: { kind: "value", value: 4 } },
      { args: [10, 4], expect: { kind: "value", value: 14 } },
      { args: [6, 3], expect: { kind: "value", value: 9 } },
    ],
    why:
      "Birinchi chaqiruvda 2 + 2 va 2 * 2 bir xil javob beradi, shuning uchun bitta sinov yetmaydi. Qolgan ikkitasi to'g'ri amalni ajratib berdi.",
  },
  {
    fnName: "kvadrat",
    params: [{ name: "son", type: "number" }],
    mode: "value",
    bodySlots: 2,
    hint: "Avval natijani hisoblab olish, keyin uni qaytarish kerak. Tartibni o'ylab ko'ring.",
    blocks: blocks(
      { op: "assign", arg: times(param("son"), param("son")) },
      { op: "assign", arg: plus(param("son"), param("son")) },
      { op: "return", arg: { kind: "local" } },
      { op: "return", arg: number(9) }
    ),
    calls: [
      { args: [3], expect: { kind: "value", value: 9 } },
      { args: [5], expect: { kind: "value", value: 25 } },
      { args: [2], expect: { kind: "value", value: 4 } },
    ],
    why:
      "natija faqat funksiya ichida yashaydi — uni return bilan uzatmaguncha chaqiruvchi hech narsa ko'rmaydi. 2 uchun qo'shish ham ko'paytirish ham 4 berdi, boshqa sonlar esa farqni ko'rsatdi.",
  },
  {
    fnName: "narx",
    params: [
      { name: "dona", type: "number" },
      { name: "baho", type: "number" },
    ],
    mode: "value",
    bodySlots: 2,
    hint: "Uchinchi chaqiruvda bir dona olingan, shuning uchun narx bahoga teng. Qolgan ikkitasi-chi?",
    blocks: blocks(
      { op: "assign", arg: times(param("dona"), param("baho")) },
      { op: "assign", arg: param("baho") },
      { op: "return", arg: { kind: "local" } },
      { op: "return", arg: param("baho") }
    ),
    calls: [
      { args: [2, 5], expect: { kind: "value", value: 10 } },
      { args: [3, 4], expect: { kind: "value", value: 12 } },
      { args: [1, 7], expect: { kind: "value", value: 7 } },
    ],
    why:
      "Bir dona olinganda narx bahoga teng bo'lib qoladi — shuning uchun bitta chaqiruv adashtiradi. To'g'ri tana ikkala parametrni ko'paytiradi va natijani return bilan uzatadi.",
  },
];

/* ──────────────────────────── rendering the code ──────────────────────────── */

function exprText(expr: Expr): string {
  switch (expr.kind) {
    case "param":
      return expr.name;
    case "number":
      return String(expr.value);
    case "colour":
      return PALETTE[expr.value].label;
    case "local":
      return LOCAL;
    case "op":
      return `${exprText(expr.left)} ${expr.op} ${exprText(expr.right)}`;
  }
}

function statementText(statement: Statement): string {
  const arg = exprText(statement.arg);
  switch (statement.op) {
    case "draw":
      return `katak_chiz(${arg})`;
    case "paint":
      return `rangla(${arg})`;
    case "assign":
      return `${LOCAL} = ${arg}`;
    case "return":
      return `return ${arg}`;
  }
}

/* ───────────────────────────── running the body ───────────────────────────── */

interface Trace {
  cells: PaletteKey[];
  /** null when the body never reached a `return` — the mistake worth seeing. */
  returned: number | null;
}

type Env = Map<string, Arg>;

function numberOf(expr: Expr, env: Env, local: number | null): number | null {
  switch (expr.kind) {
    case "number":
      return expr.value;
    case "local":
      return local;
    case "param": {
      const value = env.get(expr.name);
      return typeof value === "number" ? value : null;
    }
    case "colour":
      return null;
    case "op": {
      const left = numberOf(expr.left, env, local);
      const right = numberOf(expr.right, env, local);
      if (left === null || right === null) return null;
      if (expr.op === "+") return left + right;
      if (expr.op === "-") return left - right;
      return left * right;
    }
  }
}

function colourOf(expr: Expr, env: Env): PaletteKey | null {
  if (expr.kind === "colour") return expr.value;
  if (expr.kind === "param") {
    const value = env.get(expr.name);
    return isPaletteKey(value) ? value : null;
  }
  return null;
}

/**
 * Runs one body against one call. Statements take effect in the order they sit
 * in, so drawing before painting really does come out in the starting pen colour
 * — a body is a sequence, and pretending otherwise would teach a lie.
 */
function run(statements: Statement[], params: Param[], args: Arg[], pen: PaletteKey): Trace {
  const env: Env = new Map();
  params.forEach((p, i) => {
    if (args[i] !== undefined) env.set(p.name, args[i]);
  });

  let ink = pen;
  let local: number | null = null;
  const cells: PaletteKey[] = [];

  for (const statement of statements) {
    if (statement.op === "paint") {
      const picked = colourOf(statement.arg, env);
      if (picked) ink = picked;
      continue;
    }

    const value = numberOf(statement.arg, env, local);
    if (statement.op === "draw") {
      const count = value === null ? 0 : Math.min(Math.max(value, 0), MAX_CELLS);
      for (let i = 0; i < count; i++) cells.push(ink);
      continue;
    }
    if (statement.op === "assign") {
      local = value;
      continue;
    }
    // `return` hands the value back, and nothing after it runs.
    return { cells, returned: value };
  }

  return { cells, returned: null };
}

function satisfies(trace: Trace, expect: Expected): boolean {
  if (expect.kind === "value") return trace.returned === expect.value;
  return (
    trace.cells.length === expect.length &&
    trace.cells.every((cell) => cell === expect.colour)
  );
}

/* ─────────────────────────── author-supplied puzzle ─────────────────────────── */

const OPS = ["draw", "paint", "assign", "return"] as const;

/**
 * Reads a statement argument the author typed: a parameter name, a number, a
 * colour, `natija`, or two of those joined by + - *. A text box beats five
 * conditional pickers for something this small.
 */
function parseExpr(value: unknown, params: Param[]): Expr | undefined {
  const raw = str(value);
  if (!raw) return undefined;

  const split = raw.match(/^(.+?)\s*([+\-*])\s*(.+)$/);
  if (split) {
    const left = parseTerm(split[1], params);
    const right = parseTerm(split[3], params);
    if (!left || !right) return undefined;
    return { kind: "op", op: split[2] as "+" | "-" | "*", left, right };
  }
  return parseTerm(raw, params);
}

function parseTerm(text: string, params: Param[]): Expr | undefined {
  const token = str(text);
  if (!token) return undefined;
  if (token === LOCAL) return { kind: "local" };
  const asNumber = num(token);
  if (asNumber !== undefined) return { kind: "number", value: asNumber };
  if (params.some((p) => p.name === token)) return { kind: "param", name: token };
  if (isPaletteKey(token)) return { kind: "colour", value: token };
  return undefined;
}

/**
 * Brute-forces every body the offered blocks can build. A puzzle with no correct
 * body at all is worse than falling back to a built-in one, and the search is
 * tiny at these sizes.
 */
function solvable(puzzle: Puzzle, pen: PaletteKey): boolean {
  const total = puzzle.blocks.length ** puzzle.bodySlots;
  if (total > 4096) return true;

  for (let n = 0; n < total; n++) {
    const statements: Statement[] = [];
    let rest = n;
    for (let slot = 0; slot < puzzle.bodySlots; slot++) {
      statements.push(puzzle.blocks[rest % puzzle.blocks.length].statement);
      rest = Math.floor(rest / puzzle.blocks.length);
    }
    const fits = puzzle.calls.every((call) =>
      satisfies(run(statements, puzzle.params, call.args, pen), call.expect)
    );
    if (fits) return true;
  }
  return false;
}

/** Builds the puzzle an author configured in the writer, or null if incomplete. */
function fromConfig(config: unknown): Puzzle | null {
  if (!hasConfig(config)) return null;

  const params = objList<Param>(config.params, (row) => {
    const name = str(row.name);
    const type = enumValue(row.type, ["number", "colour"] as const);
    return name && type ? { name, type } : undefined;
  });
  if (!params) return null;
  // Two parameters sharing a name would make one of them unreachable.
  if (new Set(params.map((p) => p.name)).size !== params.length) return null;

  const mode = enumValue(config.mode, ["strip", "value"] as const) ?? "strip";
  const pen = enumValue(config.pen, PALETTE_KEYS) ?? "yashil";
  const bodySlots = int(config.bodySlots, 1, 3) ?? 1;

  const statements = objList<Statement>(config.blocks, (row) => {
    const op = enumValue(row.op, OPS);
    const arg = parseExpr(row.arg, params);
    if (!op || !arg) return undefined;
    // A `rangla` given a number can never colour anything, so it is not a block.
    if (op === "paint" && !colourOf(arg, new Map(params.map((p) => [p.name, p.type === "colour" ? "yashil" : 0]))))
      return undefined;
    return { op, arg } as Statement;
  });
  if (!statements || statements.length < 2) return null;

  const calls = objList<Call>(config.calls, (row) => {
    const raw = strList(row.args);
    if (!raw || raw.length < params.length) return undefined;

    const args: Arg[] = [];
    for (let i = 0; i < params.length; i++) {
      if (params[i].type === "colour") {
        const key = enumValue(raw[i], PALETTE_KEYS);
        if (!key) return undefined;
        args.push(key);
      } else {
        const value = num(raw[i]);
        if (value === undefined) return undefined;
        args.push(value);
      }
    }

    if (mode === "value") {
      const value = num(row.value);
      return value === undefined ? undefined : { args, expect: { kind: "value", value } };
    }
    const length = int(row.length, 1, MAX_CELLS);
    const shade = enumValue(row.colour, PALETTE_KEYS);
    return length === undefined || shade === undefined
      ? undefined
      : { args, expect: { kind: "strip", length, colour: shade } };
  });
  // One call proves nothing about a function; the whole lesson is the plural.
  if (!calls || calls.length < 2) return null;

  const puzzle: Puzzle = {
    fnName: str(config.fnName) ?? "chiz",
    params,
    mode,
    bodySlots,
    pen,
    blocks: blocks(...statements),
    calls: calls.slice(0, MAX_CALLS),
    hint:
      str(config.hint) ??
      "Funksiya tanasini o'zingiz yig'ing — bitta tana barcha chaqiruvlarda ishlashi kerak.",
    why: str(config.why) ?? "",
  };

  return solvable(puzzle, pen) ? puzzle : null;
}

/* ──────────────────────────────── the board ──────────────────────────────── */

export function FunctionFactoryGame(props: GameProps) {
  const { config, seed, variant } = props;

  const puzzle = useMemo(
    () =>
      (hasConfig(config) ? fromConfig(config) : null) ??
      pickVariant(PUZZLES, seed, { ordinal: variant }),
    [config, seed, variant]
  );

  const pen = puzzle.pen ?? "yashil";
  const [body, setBody] = useState<(string | null)[]>([]);

  const blockById = useMemo(
    () => new Map(puzzle.blocks.map((block) => [block.id, block])),
    [puzzle.blocks]
  );

  // Read through a normalised view, so a puzzle swapped underneath (the writer
  // editing its config live) cannot leave the board with the wrong row count.
  const slots = useMemo(
    () => Array.from({ length: puzzle.bodySlots }, (_, i) => body[i] ?? null),
    [body, puzzle.bodySlots]
  );

  const statements = useMemo(
    () =>
      slots
        .map((id) => (id ? blockById.get(id)?.statement : undefined))
        .filter((statement): statement is Statement => Boolean(statement)),
    [slots, blockById]
  );

  const results = useMemo(
    () =>
      puzzle.calls.map((call) => {
        const trace = run(statements, puzzle.params, call.args, pen);
        return { call, trace, ok: satisfies(trace, call.expect) };
      }),
    [puzzle.calls, puzzle.params, statements, pen]
  );

  const filled = slots.every((id) => id !== null);

  const { status, reset } = useGameCheck(props, {
    ready: filled,
    check: () => results.every((result) => result.ok),
  });

  const edit = (change: (rows: (string | null)[]) => (string | null)[]) => {
    reset();
    setBody((prev) =>
      change(Array.from({ length: puzzle.bodySlots }, (_, i) => prev[i] ?? null))
    );
  };

  const place = (blockId: string, slot: number, from?: number) => {
    if (slot < 0 || slot >= puzzle.bodySlots) return;
    edit((rows) => {
      // Dragging one row onto another swaps them, so reordering never loses a
      // statement — order is half of what these puzzles are about.
      if (from !== undefined && from < rows.length) {
        const moved = rows[from];
        rows[from] = rows[slot];
        rows[slot] = moved;
        return rows;
      }
      rows[slot] = blockId;
      return rows;
    });
  };

  const clearAt = (slot: number) =>
    edit((rows) => {
      rows[slot] = null;
      return rows;
    });

  const drag = useBlockDrag<string>({
    onDrop: place,
    onDropOutside: (_blockId, from) => {
      if (from !== undefined) clearAt(from);
    },
    onTap: (blockId, from) => {
      // Tapping a placed row does nothing: its own × removes it, and a tap that
      // silently emptied a row would look like the block had vanished.
      if (from !== undefined) return;
      const slot = slots.findIndex((id) => id === null);
      if (slot !== -1) place(blockId, slot);
    },
  });

  const revealed = status !== "idle";
  const failing = results.filter((result) => !result.ok).length;
  const passing = results.length - failing;
  const silent = puzzle.mode === "value" && results.some((r) => r.trace.returned === null);

  const failText = silent
    ? "Ba'zi chaqiruvlar hech qanday natija olmadi — hisoblangan qiymat funksiya ichida qolib ketdi."
    : passing === 1
    ? "Tana bitta chaqiruvga to'g'ri keldi, qolganlariga esa yo'q. Demak unda shu chaqiruvga bog'lanib qolgan narsa bor."
    : failing === 1
    ? "Bitta chaqiruv kutilgan natijani bermadi — belgilangan kartaga qarang."
    : `${failing} chaqiruv kutilgan natijani bermadi. Tanadagi qatorlarni qayta ko'rib chiqing.`;

  const signature = `${puzzle.fnName}(${puzzle.params.map((p) => p.name).join(", ")})`;

  return (
    <GameShell
      task="Funksiya tanasini yozing — bitta tana barcha chaqiruvlarda ishlasin."
      hint={puzzle.hint}
      status={status}
      successText={puzzle.why}
      failText={failText}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] text-gray-500 dark:text-[#6d6d74]">
            {slots.filter(Boolean).length}/{puzzle.bodySlots} qator to&apos;ldirildi
          </span>
          <GameReset onClick={() => edit(() => Array(puzzle.bodySlots).fill(null))} />
        </div>
      }
    >
      <div className="mb-3">
        <GameHowTo
          steps={[
            "Pastdagi blokni ushlab, funksiya tanasidagi bo'sh qatorga tashlang.",
            puzzle.mode === "value"
              ? "Chaqiruvning natijasi — son. Uni tashqariga return chiqaradi."
              : "Qatorlar yuqoridan pastga bajariladi — tartibga e'tibor bering.",
            "«Tekshirish» ni bosing: bitta tana barcha chaqiruvlarda sinaladi.",
          ]}
        />
      </div>

      {/* ── Stage 1: the definition the learner writes ── */}
      <GameBoard label="1. Ta'rif — tanani siz yozasiz">
        <div className="font-mono text-[13.5px] text-gray-800 dark:text-[#e4e4e7]">
          <span className="text-[#7C5CE0] dark:text-[#c4b5fd]">funksiya</span> {signature}:
        </div>

        {puzzle.mode === "strip" && (
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-gray-500 dark:text-[#8b8b93]">
            Qalam boshida
            <span
              style={{ backgroundColor: PALETTE[pen].hex }}
              className="w-3.5 h-3.5 rounded-[4px] shrink-0"
            />
            {PALETTE[pen].label} rangda turadi.
          </p>
        )}

        <div className="mt-3 ml-2 sm:ml-4 pl-3 border-l-2 border-[#7C5CE0]/40 flex flex-col gap-2">
          {slots.map((id, i) => {
            const block = id ? blockById.get(id) : undefined;

            return (
              <DropSlot
                key={i}
                index={i}
                filled={Boolean(block)}
                active={drag.overSlot === i}
                className="px-1.5"
              >
                {block ? (
                  <div
                    {...drag.bind(block.id, i)}
                    className={`flex-1 min-w-0 flex items-center gap-2 rounded-[10px] border-2 border-[#7C5CE0]/50 bg-white dark:bg-[#101013] px-2 py-2 ${grabClass}`}
                  >
                    <IconGripVertical
                      size={13}
                      className="shrink-0 text-gray-300 dark:text-[#3f3f46]"
                    />
                    <span className="min-w-0 flex-1 font-mono text-[13px] leading-snug text-gray-800 dark:text-[#e4e4e7]">
                      {statementText(block.statement)}
                    </span>
                    {/* Always visible: a hover-only × never appears on a touch screen. */}
                    <button
                      type="button"
                      data-no-drag
                      onClick={() => clearAt(i)}
                      aria-label={`${i + 1}-qatorni bo'shatish`}
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 dark:text-[#6d6d74] opacity-70 hover:opacity-100 hover:text-gray-700 dark:hover:text-[#d4d4d8] transition-opacity cursor-pointer"
                    >
                      <IconX size={13} stroke={2.5} />
                    </button>
                  </div>
                ) : (
                  <span className="px-2 font-mono text-[12px] text-gray-400 dark:text-[#5c5c64]">
                    {i + 1}-qator bo&apos;sh
                  </span>
                )}
              </DropSlot>
            );
          })}
        </div>
      </GameBoard>

      {/* ── The statement blocks. Templates: placing one does not use it up. ── */}
      <div className="mt-3">
        <GameBoard label="Bloklar" className="flex flex-wrap gap-2">
          {puzzle.blocks.map((block) => (
            <div
              key={block.id}
              {...drag.bind(block.id)}
              title="Ushlab, tanadagi bo'sh qatorga tashlang"
              className={`max-w-full flex items-center gap-2 rounded-[11px] border-2 border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] pl-2 pr-3 py-2 hover:border-[#7C5CE0] transition-colors ${grabClass}`}
            >
              <IconGripVertical
                size={13}
                className="shrink-0 text-gray-300 dark:text-[#3f3f46]"
              />
              <span className="min-w-0 font-mono text-[12.5px] leading-snug text-gray-700 dark:text-[#d4d4d8]">
                {statementText(block.statement)}
              </span>
            </div>
          ))}
        </GameBoard>
      </div>

      {/* ── Stage 2: the calls that same body has to serve ── */}
      <div className="mt-3">
        <GameBoard label={`2. Chaqiruvlar — ${puzzle.calls.length} ta, bitta tana`}>
          <div className="flex flex-col gap-3">
            {results.map((result, i) => {
              // On a wrong attempt only the failing cards are marked. Turning the
              // passing ones green would hand over half the answer.
              const tone =
                !revealed
                  ? "border-gray-200 dark:border-[#2b2b31]"
                  : status === "success"
                  ? "border-[#26B54F]/60 bg-[#26B54F]/[0.06]"
                  : result.ok
                  ? "border-gray-200 dark:border-[#2b2b31]"
                  : "border-amber-500 bg-amber-500/[0.06]";

              return (
                <div key={i} className={`rounded-[14px] border-2 p-3 transition-colors ${tone}`}>
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[13.5px] text-gray-800 dark:text-[#e4e4e7]">
                    <span>
                      {puzzle.fnName}
                      {"("}
                    </span>
                    {result.call.args.map((arg, k) => (
                      <span key={k} className="flex items-center gap-1">
                        {isPaletteKey(arg) ? (
                          <>
                            <span
                              style={{ backgroundColor: PALETTE[arg].hex }}
                              className="w-3.5 h-3.5 rounded-[4px] shrink-0"
                            />
                            <span>{PALETTE[arg].label}</span>
                          </>
                        ) : (
                          <span className="font-bold">{arg}</span>
                        )}
                        {k < result.call.args.length - 1 && <span>,</span>}
                      </span>
                    ))}
                    <span>)</span>
                  </div>

                  <Row label="kutilgan">
                    <Outcome expect={result.call.expect} />
                  </Row>

                  {/* Nothing is evaluated until the learner commits — a live
                      result turns the puzzle into fiddling until it matches. */}
                  {revealed && (
                    <Row label="natija">
                      <Produced trace={result.trace} mode={puzzle.mode} />
                    </Row>
                  )}
                </div>
              );
            })}
          </div>

          {!revealed && (
            <p className="mt-3 text-[12px] text-gray-400 dark:text-[#6d6d74]">
              Tanangiz nima chizganini «Tekshirish» dan keyin ko&apos;rasiz.
            </p>
          )}
        </GameBoard>
      </div>

      {!revealed && (
        <div className="mt-3">
          <GameNote>
            Tana bir marta yoziladi va har chaqiruvda qayta ishlatiladi. Shuning uchun
            unda aniq son yoki aniq rang qolib ketsa, u faqat bitta chaqiruvga to&apos;g&apos;ri
            keladi.
          </GameNote>
        </div>
      )}

      {drag.isDragging && drag.drag && (
        <DragGhost x={drag.drag.x} y={drag.drag.y}>
          <span className="block rounded-[10px] bg-[#7C5CE0] px-3 py-2 font-mono text-[12.5px] text-white shadow-lg">
            {statementText(
              blockById.get(drag.drag.payload)?.statement ?? { op: "draw", arg: number(1) }
            )}
          </span>
        </DragGhost>
      )}
    </GameShell>
  );
}

/** One labelled line inside a call card, so expected and produced line up. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-2 flex items-start gap-2.5">
      <span className="w-[54px] shrink-0 pt-0.5 text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-[#6d6d74]">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function Strip({ cells }: { cells: PaletteKey[] }) {
  return (
    <div className="flex flex-wrap gap-1 items-center">
      {cells.map((cell, i) => (
        <span
          key={i}
          style={{ backgroundColor: PALETTE[cell].hex }}
          className="w-5 h-5 rounded-[5px]"
        />
      ))}
    </div>
  );
}

function Outcome({ expect }: { expect: Expected }) {
  if (expect.kind === "value") {
    return (
      <span className="font-mono text-[15px] font-bold text-gray-800 dark:text-[#e4e4e7]">
        {expect.value}
      </span>
    );
  }
  return <Strip cells={Array<PaletteKey>(expect.length).fill(expect.colour)} />;
}

function Produced({ trace, mode }: { trace: Trace; mode: "strip" | "value" }) {
  if (mode === "value") {
    return trace.returned === null ? (
      <span className="text-[12.5px] text-gray-500 dark:text-[#8b8b93]">
        hech narsa qaytarmadi
      </span>
    ) : (
      <span className="font-mono text-[15px] font-bold text-gray-800 dark:text-[#e4e4e7]">
        {trace.returned}
      </span>
    );
  }
  return trace.cells.length === 0 ? (
    <span className="text-[12.5px] text-gray-500 dark:text-[#8b8b93]">hech narsa chizmadi</span>
  ) : (
    <Strip cells={trace.cells} />
  );
}
