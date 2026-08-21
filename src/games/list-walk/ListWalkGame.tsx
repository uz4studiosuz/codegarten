"use client";

import React, { useEffect, useMemo, useState } from "react";
import { IconArrowRight, IconGripVertical, IconX } from "@tabler/icons-react";
import type { GameProps } from "../types";
import { enumValue, hasConfig, int, num, numList, objList, str, strList } from "../config";
import {
  CodeLine,
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
 * Walk the list
 * -------------
 * One name holding many values, reached by an index that starts at 0 — and a
 * loop that visits each value once. The module teaches those in that order, so
 * the pool runs pointing at a cell → predicting a walk → writing the walk's
 * body → changing the list, and the lesson ordinal walks it in that order.
 *
 * Deliberate choices:
 *
 *  - The index puzzles are answered by *pointing at a cell*, not by typing a
 *    number. Off-by-one is a spatial mistake, and a learner who has to put a
 *    finger on "the cell ro'yxat[0] means" cannot dodge it the way a typed
 *    answer lets them. The strip therefore always ends in a dashed cell for the
 *    position one past the end: that position is a real thing the notation can
 *    name (`ro'yxat[uzunlik(ro'yxat)]`) and the reason it is an error is that
 *    nothing lives there — which only reads if you can see it is empty.
 *
 *  - The walk replay opens only after a correct answer, exactly as
 *    variable-trace does. Replaying the loop after a wrong guess hands over the
 *    answer and turns the retry into copying.
 *
 *  - Nothing is simulated while blocks are being placed. A live accumulator
 *    would let a learner nudge blocks until the number looked right instead of
 *    reasoning about what the loop body does.
 *
 *  - The `agar` line of a counting puzzle is printed, not draggable. Assembling
 *    guard *and* body at once made the board about indentation rather than about
 *    the list, and children lost the thread.
 */

/* ──────────────────────────────── the puzzle ──────────────────────────────── */

/** A list element. Numbers carry the arithmetic puzzles; strings the first ones. */
type Cell = number | string;

/** What a statement or comparison is given: a literal, the loop name, or a var. */
type Ref = number | string;

interface Stmt {
  target: string;
  /** `add` renders as `x = x + v`, `set` as `x = v` — the whole difference in max. */
  op: "add" | "set";
  value: Ref;
}

interface Guard {
  left: Ref;
  cmp: ">" | ">=" | "<" | "<=" | "==";
  right: Ref;
}

interface Block {
  id: string;
  stmt: Stmt;
}

interface Common {
  /** The question, shown as the heading. */
  ask: string;
  hint: string;
  /** Shown on success only. */
  why: string;
  /** Words in a lesson title that mean "this puzzle", so a level lands on it. */
  tags?: string[];
}

interface PickPuzzle extends Common {
  kind: "pick";
  name: string;
  list: Cell[];
  /** The expression being resolved, e.g. `chiqar(sonlar[uzunlik(sonlar)])`. */
  expr?: string;
  /** The cell that answers it. `list.length` is the dashed cell past the end. */
  answer: number;
}

interface ChoicePuzzle extends Common {
  kind: "choice";
  /** The program, verbatim. An empty string renders as a blank line. */
  program: string[];
  options: string[];
  /** Index into `options`. */
  answer: number;
}

interface BuildPuzzle extends Common {
  kind: "build";
  name: string;
  list: Cell[];
  /** Name the loop gives each element: `har ball uchun ballar:`. */
  each: string;
  /** Set up before the loop, in the order shown. */
  vars: { name: string; value: number }[];
  /** Rows directly inside the loop. */
  slots: number;
  /** A printed `agar` line with its own indented rows under it. */
  guard?: Guard;
  guardSlots: number;
  blocks: Block[];
  /** Which variables `chiqar(...)` reports — and so what checking compares. */
  outputs: string[];
  /** One correct body: block ids, loop rows first, then the guard rows. */
  solution: string[];
}

type Puzzle = PickPuzzle | ChoicePuzzle | BuildPuzzle;

/** A list wider than this cannot wrap tidily at 375px. */
const MAX_LIST = 8;

const stmts = (...list: Stmt[]): Block[] => list.map((stmt, i) => ({ id: `b${i}`, stmt }));

/**
 * Ordered simplest first: the lesson ordinal walks this list, so puzzle 0 is
 * somebody's first ever list exercise. Indexes, then a walk to read, then a walk
 * to write, then changing the list underneath it.
 */
const PUZZLES: Puzzle[] = [
  {
    kind: "pick",
    tags: ["murojaat"],
    name: "ranglar",
    list: ["qizil", "yashil", "ko'k"],
    expr: "chiqar(ranglar[0])",
    answer: 0,
    ask: "Bu ifoda qaysi katakni o'qiydi?",
    hint: "Har katak ostida uning indeksi yozilgan. Indeks 0 dan boshlanadi.",
    why:
      "ranglar[0] — birinchi katak. Indekslar 0, 1, 2 tarzida boradi, shuning uchun uchta elementli ro'yxatning oxirgi indeksi 2.",
  },
  {
    kind: "pick",
    tags: ["indeks"],
    name: "sonlar",
    list: [10, 20, 30, 40],
    answer: 3,
    ask: "40 soni qaysi indeksda turadi? Shu katakni bosing.",
    hint: "Sanoq 0 dan boshlanadi — indeks tartib raqamdan bitta kam bo'ladi.",
    why:
      "40 ro'yxatda to'rtinchi turadi, lekin uning indeksi 3. Sanoq 0 dan boshlangani uchun indeks har doim tartib raqamdan bitta kam.",
  },
  {
    kind: "pick",
    tags: ["chegara", "uzunlik"],
    name: "sonlar",
    list: [7, 4, 9],
    expr: "chiqar(sonlar[uzunlik(sonlar)])",
    answer: 3,
    ask: "Bu ifoda qaysi katakni ko'rsatadi?",
    hint:
      "Avval uzunlik(sonlar) qanchaligini hisoblang, keyin o'sha indeksdagi katakni qidiring. Punktir katak — ro'yxat tugagandan keyingi o'rin.",
    why:
      "uzunlik(sonlar) 3 ga teng, lekin indekslar faqat 0, 1, 2. sonlar[3] ro'yxatdan tashqaridagi o'rinni ko'rsatadi — u yerda hech narsa yo'q, shuning uchun dastur xato beradi. To'g'ri indekslar 0 dan uzunlik - 1 gacha.",
  },
  {
    kind: "choice",
    tags: ["aylanib"],
    program: ["sonlar = [2, 5, 3]", "", "har son uchun sonlar:", "  chiqar(son * 2)"],
    options: ["4, 10, 6", "2, 5, 3", "10", "20, 50, 30"],
    answer: 0,
    ask: "Bu dastur nimalarni chiqaradi?",
    hint: "Sikl har elementni navbat bilan son nomi bilan beradi. Ichkaridagi qator har element uchun qayta bajariladi.",
    why:
      "Sikl uch marta aylandi va har aylanishda son boshqa qiymatni oldi: 2·2, 5·2, 3·2. Shuning uchun uchta qator chiqdi.",
  },
  {
    kind: "choice",
    tags: ["qo'sh", "qosh", "o'chir", "ochir"],
    program: [
      "sonlar = [10, 20, 30]",
      "qo'sh(sonlar, 40)",
      "o'chir(sonlar, 0)",
      "",
      "chiqar(sonlar)",
    ],
    options: ["[20, 30, 40]", "[10, 20, 30, 40]", "[10, 20, 30]", "[20, 30]"],
    answer: 0,
    ask: "Oxirgi qator nimani chiqaradi?",
    hint: "Ikki amalni birma-bir bajaring: avval qo'shish, keyin o'chirish.",
    why:
      "qo'sh 40 ni oxiriga yozdi: [10, 20, 30, 40]. o'chir(sonlar, 0) esa 0-indeksdagi 10 ni oldi va qolganlari bir qadam chapga surildi. Uzunlik esa yana 3 bo'lib qoldi.",
  },
  {
    kind: "choice",
    tags: ["uzunlik", "chegara"],
    program: [
      "sonlar = [4, 8, 15, 16]",
      "o'chir(sonlar, 1)",
      "",
      "chiqar(uzunlik(sonlar))",
      "chiqar(sonlar[3])",
    ],
    options: [
      "3 ni chiqaradi, keyin xato beradi",
      "3 ni, keyin 16 ni chiqaradi",
      "4 ni, keyin 16 ni chiqaradi",
      "3 ni, keyin 15 ni chiqaradi",
    ],
    answer: 0,
    ask: "Bu dastur nima qiladi?",
    hint: "O'chirishdan keyin uzunlik qanday bo'ldi? To'g'ri indekslar qaysi oraliqda qoldi?",
    why:
      "o'chir(sonlar, 1) 8 ni oldi va [4, 15, 16] qoldi — uzunlik 3. Endi indekslar faqat 0, 1, 2, shuning uchun sonlar[3] chegaradan chiqadi. Ro'yxat kichraysa, chegara ham torayadi.",
  },
  {
    kind: "build",
    tags: ["yig'indi", "yigindi", "o'rtacha", "ortacha"],
    name: "ballar",
    list: [85, 92, 78],
    each: "ball",
    vars: [{ name: "jami", value: 0 }],
    slots: 1,
    guardSlots: 0,
    blocks: stmts(
      { target: "jami", op: "add", value: "ball" },
      { target: "jami", op: "add", value: 1 },
      { target: "jami", op: "set", value: "ball" }
    ),
    outputs: ["jami"],
    solution: ["b0"],
    ask: "Sikl ichiga qator qo'yib, ballar yig'indisini hisoblang.",
    hint: "jami 0 dan boshlanadi va har aylanishda o'sib borishi kerak.",
    why:
      "jami = jami + ball har elementni yig'uvchining eski qiymati ustiga qo'shadi. jami = ball bo'lganda esa oldingi natija o'chib, faqat oxirgi element qolardi.",
  },
  {
    kind: "build",
    tags: ["sana", "shart"],
    name: "ballar",
    list: [85, 52, 78, 40, 95],
    each: "ball",
    vars: [{ name: "o'tganlar", value: 0 }],
    slots: 0,
    guard: { left: "ball", cmp: ">=", right: 60 },
    guardSlots: 1,
    blocks: stmts(
      { target: "o'tganlar", op: "add", value: 1 },
      { target: "o'tganlar", op: "add", value: "ball" },
      { target: "o'tganlar", op: "set", value: "ball" }
    ),
    outputs: ["o'tganlar"],
    solution: ["b0"],
    ask: "60 dan past bo'lmagan ballar sonini hisoblang.",
    hint: "Shart tekshirilgan qator faqat shart rost bo'lgan aylanishda bajariladi.",
    why:
      "Sanashda hisoblagichga har mos hol uchun 1 qo'shiladi — elementning qiymati emas. Qiymat qo'shilsa, natija son emas, yig'indi bo'lib qolardi.",
  },
  {
    kind: "build",
    tags: ["eng katta", "eng kichik", "katta"],
    name: "sonlar",
    list: [12, 47, 23, 8],
    each: "son",
    vars: [{ name: "eng_katta", value: 0 }],
    slots: 0,
    guard: { left: "son", cmp: ">", right: "eng_katta" },
    guardSlots: 1,
    blocks: stmts(
      { target: "eng_katta", op: "set", value: "son" },
      { target: "eng_katta", op: "add", value: "son" },
      { target: "eng_katta", op: "add", value: 1 }
    ),
    outputs: ["eng_katta"],
    solution: ["b0"],
    ask: "Ro'yxatdagi eng katta sonni toping.",
    hint: "Shart faqat hozirgi element saqlangandan kattaroq bo'lganda rost bo'ladi. Shunda nima qilish kerak?",
    why:
      "eng_katta = son yangi rekordni eskisining ustiga yozadi, shuning uchun oxirida eng katta qiymat qoladi. Qo'shish esa yig'indi berardi — eng kattani emas.",
  },
  {
    kind: "build",
    tags: ["ikki natija", "bir aylanish"],
    name: "ballar",
    list: [70, 45, 90, 55],
    each: "ball",
    vars: [
      { name: "jami", value: 0 },
      { name: "past", value: 0 },
    ],
    slots: 1,
    guard: { left: "ball", cmp: "<", right: 60 },
    guardSlots: 1,
    blocks: stmts(
      { target: "jami", op: "add", value: "ball" },
      { target: "past", op: "add", value: 1 },
      { target: "jami", op: "add", value: 1 },
      { target: "past", op: "add", value: "ball" }
    ),
    outputs: ["jami", "past"],
    solution: ["b0", "b1"],
    ask: "Bitta aylanishda ikki natija: barcha ballar yig'indisi va 60 dan past ballar soni.",
    hint: "Siklning o'zidagi qator har element uchun bajariladi, agar ichidagisi esa faqat shart rost bo'lganda.",
    why:
      "Bitta aylanish ikki ishni birga bajardi: yig'uvchi har elementni oldi, hisoblagich esa faqat shartga mos elementlarni sanadi. Ro'yxat bir marta aylanib chiqilsa yetadi.",
  },
];

/* ─────────────────────────── author-supplied puzzle ─────────────────────────── */

const CMPS = [">", ">=", "<", "<=", "=="] as const;

/** A list an author typed: numbers stay numbers, everything else is text. */
function cellList(value: unknown): Cell[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out: Cell[] = [];
  for (const raw of value) {
    const asNumber = num(raw);
    if (asNumber !== undefined) {
      out.push(asNumber);
      continue;
    }
    const text = str(raw);
    if (text !== undefined) out.push(text);
  }
  return out.length > 0 ? out.slice(0, MAX_LIST) : undefined;
}

/** A name the program actually declares, or a literal. Anything else reads as 0. */
function refOf(value: unknown, known: string[]): Ref | undefined {
  const asNumber = num(value);
  if (asNumber !== undefined) return asNumber;
  const name = str(value);
  return name && known.includes(name) ? name : undefined;
}

/** Builds the puzzle an author configured in the writer, or null if incomplete. */
function fromConfig(config: unknown): Puzzle | null {
  if (!hasConfig(config)) return null;

  const kind = enumValue(config.kind, ["pick", "choice", "build"] as const);
  const ask = str(config.ask);
  if (!kind || !ask) return null;

  const common = {
    ask,
    why:
      str(config.why) ??
      "Indeks 0 dan boshlanadi, sikl esa har elementni bir marta ko'rib chiqadi.",
    tags: strList(config.tags),
  };

  if (kind === "pick") {
    const list = cellList(config.list);
    if (!list) return null;
    // The dashed cell past the end is a legal answer, so the range is inclusive.
    const answer = int(config.answer, 0, list.length);
    if (answer === undefined) return null;
    return {
      kind,
      ...common,
      hint: str(config.hint) ?? "Har katak ostida uning indeksi yozilgan. Indeks 0 dan boshlanadi.",
      name: str(config.name) ?? "ro'yxat",
      list,
      expr: str(config.expr),
      answer,
    };
  }

  if (kind === "choice") {
    // Blank lines are meaningful here, so the program is not filtered.
    const program = Array.isArray(config.program)
      ? config.program.map((line: unknown) => (typeof line === "string" ? line : "")).slice(0, 12)
      : undefined;
    const options = strList(config.options);
    if (!program || program.length === 0 || !options || options.length < 2) return null;
    const answer = int(config.answer, 0, options.length - 1);
    if (answer === undefined) return null;
    return {
      kind,
      ...common,
      hint: str(config.hint) ?? "Dasturni qatorma-qator, element-element bajarib chiqing.",
      program,
      options,
      answer,
    };
  }

  const list = cellList(config.list);
  const vars = objList<{ name: string; value: number }>(config.vars, (row) => {
    const name = str(row.name);
    const value = num(row.value);
    return name && value !== undefined ? { name, value } : undefined;
  });
  if (!list || !vars) return null;

  const each = str(config.each) ?? "element";
  const names = [each, ...vars.map((v) => v.name)];
  // A loop name that shadows a variable would make one of the two unreachable.
  if (new Set(names).size !== names.length) return null;

  const varNames = vars.map((v) => v.name);
  const blocks = objList<Stmt>(config.blocks, (row) => {
    const target = str(row.target);
    const op = enumValue(row.op, ["add", "set"] as const);
    const value = refOf(row.value, names);
    if (!target || !op || value === undefined || !varNames.includes(target)) return undefined;
    return { target, op, value };
  });
  // With nothing to choose between, dropping the only block in is not a decision.
  if (!blocks || blocks.length < 2) return null;

  let guard: Guard | undefined;
  const rawGuard = config.guard;
  if (rawGuard !== null && typeof rawGuard === "object" && !Array.isArray(rawGuard)) {
    const row = rawGuard as Record<string, unknown>;
    const left = refOf(row.left, names);
    const cmp = enumValue(row.cmp, CMPS);
    const right = refOf(row.right, names);
    if (left !== undefined && cmp && right !== undefined) guard = { left, cmp, right };
  }

  const slots = int(config.slots, 0, 3) ?? 1;
  const guardSlots = guard ? int(config.guardSlots, 0, 2) ?? 1 : 0;
  if (slots + guardSlots < 1) return null;

  const outputs = strList(config.outputs)?.filter((name) => varNames.includes(name));
  if (!outputs || outputs.length === 0) return null;

  // Positions, 1-based, in body order. Checking runs this body to learn what the
  // right answer produces, so a puzzle with no stated solution has no answer.
  const picked = numList(config.solution);
  if (!picked || picked.length !== slots + guardSlots) return null;
  const solution: string[] = [];
  for (const position of picked) {
    const index = Math.round(position) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= blocks.length) return null;
    solution.push(`b${index}`);
  }

  return {
    kind,
    ...common,
    hint:
      str(config.hint) ??
      "Blokni ushlab, sikl ichidagi bo'sh qatorga tashlang. Qator har element uchun bir marta bajariladi.",
    name: str(config.name) ?? "ro'yxat",
    list,
    each,
    vars,
    slots,
    guard,
    guardSlots,
    blocks: stmts(...blocks),
    outputs,
    solution,
  };
}

/* ──────────────────────────────── the machine ──────────────────────────────── */

function stmtText(stmt: Stmt): string {
  return stmt.op === "add"
    ? `${stmt.target} = ${stmt.target} + ${stmt.value}`
    : `${stmt.target} = ${stmt.value}`;
}

function guardText(guard: Guard): string {
  return `agar ${guard.left} ${guard.cmp} ${guard.right}:`;
}

function cellText(cell: Cell): string {
  return typeof cell === "number" ? String(cell) : `"${cell}"`;
}

function listText(name: string, list: Cell[]): string {
  return `${name} = [${list.map(cellText).join(", ")}]`;
}

function compare(a: number, cmp: Guard["cmp"], b: number): boolean {
  if (cmp === ">") return a > b;
  if (cmp === ">=") return a >= b;
  if (cmp === "<") return a < b;
  if (cmp === "<=") return a <= b;
  return a === b;
}

interface Frame {
  element: Cell;
  /** null when the puzzle has no `agar` line at all. */
  passed: boolean | null;
  vars: Record<string, number>;
}

/** Runs the loop once per element, keeping the environment after each pass. */
function walk(puzzle: BuildPuzzle, loopBody: Stmt[], guardBody: Stmt[]): Frame[] {
  const env: Record<string, number> = {};
  puzzle.vars.forEach((v) => (env[v.name] = v.value));

  const read = (ref: Ref, element: number): number =>
    typeof ref === "number" ? ref : ref === puzzle.each ? element : env[ref] ?? 0;

  const apply = (stmt: Stmt, element: number) => {
    const operand = read(stmt.value, element);
    env[stmt.target] = stmt.op === "add" ? (env[stmt.target] ?? 0) + operand : operand;
  };

  return puzzle.list.map((cell) => {
    const element = typeof cell === "number" ? cell : 0;
    loopBody.forEach((stmt) => apply(stmt, element));

    let passed: boolean | null = null;
    if (puzzle.guard) {
      passed = compare(
        read(puzzle.guard.left, element),
        puzzle.guard.cmp,
        read(puzzle.guard.right, element)
      );
      if (passed) guardBody.forEach((stmt) => apply(stmt, element));
    }
    return { element: cell, passed, vars: { ...env } };
  });
}

function finalVars(puzzle: BuildPuzzle, frames: Frame[]): Record<string, number> {
  if (frames.length > 0) return frames[frames.length - 1].vars;
  return Object.fromEntries(puzzle.vars.map((v) => [v.name, v.value]));
}

/* ──────────────────────────────── the board ──────────────────────────────── */

export function ListWalkGame(props: GameProps) {
  const { config, context, seed, variant } = props;

  const puzzle = useMemo(() => {
    const title = context ?? "";
    return (
      (hasConfig(config) ? fromConfig(config) : null) ??
      pickVariant(PUZZLES, seed, {
        prefer: title
          ? (p) => Boolean(p.tags?.some((tag) => title.includes(tag)))
          : undefined,
        ordinal: variant,
      })
    );
  }, [config, context, seed, variant]);

  /* Both interactions are always declared: hooks cannot be conditional, and the
     board is remounted per lesson anyway. */
  const [picked, setPicked] = useState<number | null>(null);
  const [body, setBody] = useState<(string | null)[]>([]);
  const [shown, setShown] = useState(0);

  const build = puzzle.kind === "build" ? puzzle : null;
  const rows = build ? build.slots + build.guardSlots : 0;

  const blockById = useMemo(
    () => new Map((build?.blocks ?? []).map((block) => [block.id, block])),
    [build]
  );

  // Normalised view, so a puzzle swapped underneath (the writer editing its
  // config live) cannot leave the board holding the wrong number of rows.
  const slots = useMemo(
    () => Array.from({ length: rows }, (_, i) => body[i] ?? null),
    [body, rows]
  );

  const statementsOf = (ids: (string | null)[]) => {
    const loopBody: Stmt[] = [];
    const guardBody: Stmt[] = [];
    ids.forEach((id, i) => {
      const stmt = id ? blockById.get(id)?.stmt : undefined;
      if (!stmt || !build) return;
      if (i < build.slots) loopBody.push(stmt);
      else guardBody.push(stmt);
    });
    return { loopBody, guardBody };
  };

  const frames = useMemo(() => {
    if (!build) return [];
    const { loopBody, guardBody } = statementsOf(slots);
    return walk(build, loopBody, guardBody);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [build, slots, blockById]);

  const expected = useMemo(() => {
    if (!build) return [];
    const { loopBody, guardBody } = statementsOf(build.solution);
    return walk(build, loopBody, guardBody);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [build, blockById]);

  const ready =
    puzzle.kind === "build" ? slots.every((id) => id !== null) : picked !== null;

  const { status, reset } = useGameCheck(props, {
    ready,
    check: () => {
      if (puzzle.kind !== "build") return picked === puzzle.answer;
      // Compared against a run of the authored body rather than a stored number,
      // so a puzzle cannot claim an answer its own blocks never produce — and so
      // two bodies that reach the same result are both accepted.
      const mine = finalVars(puzzle, frames);
      const theirs = finalVars(puzzle, expected);
      return puzzle.outputs.every((name) => mine[name] === theirs[name]);
    },
  });

  const solved = status === "success";

  /** The replay is the reward for a right answer, so it only starts after one. */
  useEffect(() => {
    if (!solved) {
      setShown(0);
      return;
    }
    if (shown >= frames.length) return;
    const timer = setTimeout(() => setShown((n) => n + 1), 460);
    return () => clearTimeout(timer);
  }, [solved, shown, frames.length]);

  const choose = (index: number) => {
    reset();
    setPicked(index);
  };

  const edit = (change: (current: (string | null)[]) => (string | null)[]) => {
    reset();
    setBody((prev) => change(Array.from({ length: rows }, (_, i) => prev[i] ?? null)));
  };

  const place = (blockId: string, slot: number, from?: number) => {
    if (slot < 0 || slot >= rows) return;
    edit((current) => {
      // Dragging one row onto another swaps them, so reordering never silently
      // drops a statement.
      if (from !== undefined && from < current.length) {
        const moved = current[from];
        current[from] = current[slot];
        current[slot] = moved;
        return current;
      }
      current[slot] = blockId;
      return current;
    });
  };

  const clearAt = (slot: number) =>
    edit((current) => {
      current[slot] = null;
      return current;
    });

  const drag = useBlockDrag<string>({
    disabled: solved,
    onDrop: place,
    onDropOutside: (_blockId, from) => {
      if (from !== undefined) clearAt(from);
    },
    onTap: (blockId, from) => {
      // A tap on a placed row does nothing: its own × removes it, and a tap that
      // emptied the row would look like the block had vanished.
      if (from !== undefined) return;
      const slot = slots.findIndex((id) => id === null);
      if (slot !== -1) place(blockId, slot);
    },
  });

  const failText = useMemo(() => {
    if (puzzle.kind === "pick")
      return "Bu katak mos kelmadi. Katak ostidagi indeksni ifoda bilan solishtirib chiqing — sanoq 0 dan boshlanadi.";
    if (puzzle.kind === "choice")
      return "Bu javob to'g'ri kelmadi. Dasturni birinchi qatordan boshlab, element-element bajarib ko'ring.";
    const mine = finalVars(puzzle, frames);
    const stuck = puzzle.vars.filter((v) => mine[v.name] === v.value).map((v) => v.name);
    return stuck.length > 0
      ? `${stuck.join(", ")} boshlang'ich qiymatida qoldi — sikl ichidagi qator uni o'zgartirmadi.`
      : "Bu tana kutilgan natijani bermadi. Har qator sikl ichida, har element uchun bir marta bajarilishini eslang.";
  }, [puzzle, frames]);

  return (
    <GameShell
      task={puzzle.ask}
      hint={puzzle.hint}
      status={status}
      successText={puzzle.why}
      failText={failText}
      footer={
        build ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] text-gray-500 dark:text-[#6d6d74]">
              {slots.filter(Boolean).length}/{rows} qator to&apos;ldirildi
            </span>
            <GameReset onClick={() => edit(() => Array(rows).fill(null))} disabled={solved} />
          </div>
        ) : solved ? undefined : (
          <GameNote>
            Ro&apos;yxatdagi har elementning o&apos;z o&apos;rni — indeksi bor, va u 0 dan
            boshlanadi.
          </GameNote>
        )
      }
    >
      {puzzle.kind === "pick" && (
        <PickBoard puzzle={puzzle} picked={picked} status={status} onPick={choose} />
      )}

      {puzzle.kind === "choice" && (
        <ChoiceBoard puzzle={puzzle} picked={picked} status={status} onPick={choose} />
      )}

      {build && (
        <>
          <div className="mb-3">
            <GameHowTo
              steps={[
                "Pastdagi blokni ushlab, sikl ichidagi bo'sh qatorga tashlang.",
                "Sikl ichidagi qator ro'yxatdagi har element uchun bir marta bajariladi.",
                "«Tekshirish» ni bosing — to'g'ri javobdan keyin aylanish ochiladi.",
              ]}
            />
          </div>

          <GameBoard label="Dastur">
            <div className="flex flex-col gap-2">
              <Line text={listText(build.name, build.list)} />
              {build.vars.map((v) => (
                <Line key={v.name} text={`${v.name} = ${v.value}`} />
              ))}
            </div>

            <div className="mt-2.5 flex flex-col gap-2">
              <Line text={`har ${build.each} uchun ${build.name}:`} accent />

              <div className="ml-1.5 sm:ml-3 pl-3 border-l-2 border-[#7C5CE0]/40 flex flex-col gap-2">
                {slots.slice(0, build.slots).map((id, i) => (
                  <BodyRow
                    key={i}
                    index={i}
                    id={id}
                    blockById={blockById}
                    drag={drag}
                    onClear={clearAt}
                    locked={solved}
                  />
                ))}

                {build.guard && (
                  <>
                    <Line text={guardText(build.guard)} accent="amber" />
                    <div className="ml-1.5 pl-3 border-l-2 border-[#E0A13C]/40 flex flex-col gap-2">
                      {slots.slice(build.slots).map((id, i) => (
                        <BodyRow
                          key={i}
                          index={build.slots + i}
                          id={id}
                          blockById={blockById}
                          drag={drag}
                          onClear={clearAt}
                          locked={solved}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-2.5 flex flex-col gap-2">
              {build.outputs.map((name) => (
                <Line key={name} text={`chiqar(${name})`} />
              ))}
            </div>
          </GameBoard>

          {!solved && (
            <div className="mt-3">
              <GameBoard label="Bloklar" className="flex flex-wrap gap-2">
                {build.blocks.map((block) => (
                  <div
                    key={block.id}
                    {...drag.bind(block.id)}
                    title="Ushlab, sikl ichidagi bo'sh qatorga tashlang"
                    className={`max-w-full flex items-center gap-2 rounded-[11px] border-2 border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] pl-2 pr-3 py-2 hover:border-[#7C5CE0] transition-colors ${grabClass}`}
                  >
                    <IconGripVertical
                      size={13}
                      className="shrink-0 text-gray-300 dark:text-[#3f3f46]"
                    />
                    <span className="min-w-0 font-mono text-[12.5px] leading-snug text-gray-700 dark:text-[#d4d4d8]">
                      {stmtText(block.stmt)}
                    </span>
                  </div>
                ))}
              </GameBoard>
            </div>
          )}

          {/* Nothing is evaluated until the learner commits: a live accumulator
              turns the puzzle into nudging blocks until the number looks right. */}
          {solved ? (
            <div className="mt-3">
              <GameBoard label="Aylanish">
                <div className="flex flex-col gap-2">
                  {frames.slice(0, shown).map((frame, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-[12px] border-2 border-[#26B54F]/40 bg-white dark:bg-[#101013] px-3 py-2"
                    >
                      <span className="font-mono text-[12.5px] text-gray-500 dark:text-[#8b8b93]">
                        {build.each} = {cellText(frame.element)}
                      </span>
                      {frame.passed !== null && (
                        <span
                          className={`rounded-[6px] px-1.5 py-0.5 font-mono text-[11px] font-bold ${
                            frame.passed
                              ? "bg-[#26B54F]/15 text-[#177F37] dark:text-[#4ADE80]"
                              : "bg-gray-200/70 dark:bg-[#26262a] text-gray-500 dark:text-[#8b8b93]"
                          }`}
                        >
                          {frame.passed ? "shart rost" : "shart yolg'on"}
                        </span>
                      )}
                      <IconArrowRight
                        size={13}
                        className="shrink-0 text-gray-300 dark:text-[#3f3f46]"
                      />
                      <span className="font-mono text-[12.5px] font-bold text-gray-800 dark:text-[#e4e4e7]">
                        {build.vars.map((v) => `${v.name}=${frame.vars[v.name]}`).join("  ")}
                      </span>
                    </div>
                  ))}

                  {shown >= frames.length &&
                    build.outputs.map((name) => (
                      <Line
                        key={name}
                        text={`chiqar(${name})   // ${finalVars(build, frames)[name]}`}
                      />
                    ))}
                </div>
              </GameBoard>
            </div>
          ) : (
            <div className="mt-3">
              <GameNote>
                Sikl ro&apos;yxatni bir marta aylanib chiqadi va har elementni{" "}
                {build.each} nomi bilan beradi. Tanani yig&apos;ib bo&apos;lgach tekshiring —
                aylanish qadamma-qadam ochiladi.
              </GameNote>
            </div>
          )}
        </>
      )}

      {drag.isDragging && drag.drag && (
        <DragGhost x={drag.drag.x} y={drag.drag.y}>
          <span className="block rounded-[10px] bg-[#7C5CE0] px-3 py-2 font-mono text-[12.5px] text-white shadow-lg">
            {stmtText(
              blockById.get(drag.drag.payload)?.stmt ?? { target: "x", op: "add", value: 1 }
            )}
          </span>
        </DragGhost>
      )}
    </GameShell>
  );
}

/* ──────────────────────────────── the pieces ──────────────────────────────── */

/** A read-only program line. `accent` marks the lines that open a block. */
function Line({ text, accent }: { text: string; accent?: true | "amber" }) {
  const colour =
    accent === "amber"
      ? "text-[#B37A22] dark:text-[#f0c079]"
      : accent
      ? "text-[#7C5CE0] dark:text-[#c4b5fd]"
      : "text-gray-800 dark:text-[#e4e4e7]";
  return (
    <div className={`font-mono text-[13px] sm:text-[13.5px] leading-snug ${colour}`}>{text}</div>
  );
}

/** One row of the loop body: either a placed block or a visibly empty slot. */
function BodyRow({
  index,
  id,
  blockById,
  drag,
  onClear,
  locked,
}: {
  index: number;
  id: string | null;
  blockById: Map<string, Block>;
  drag: ReturnType<typeof useBlockDrag<string>>;
  onClear: (slot: number) => void;
  locked: boolean;
}) {
  const block = id ? blockById.get(id) : undefined;

  return (
    <DropSlot index={index} filled={Boolean(block)} active={drag.overSlot === index} className="px-1.5">
      {block ? (
        <div
          {...drag.bind(block.id, index)}
          className={`flex-1 min-w-0 flex items-center gap-2 rounded-[10px] border-2 px-2 py-2 ${
            locked
              ? "border-[#26B54F]/50 bg-[#26B54F]/[0.06]"
              : "border-[#7C5CE0]/50 bg-white dark:bg-[#101013]"
          } ${locked ? "" : grabClass}`}
        >
          {!locked && (
            <IconGripVertical size={13} className="shrink-0 text-gray-300 dark:text-[#3f3f46]" />
          )}
          <span className="min-w-0 flex-1 font-mono text-[13px] leading-snug text-gray-800 dark:text-[#e4e4e7]">
            {stmtText(block.stmt)}
          </span>
          {/* Always visible: a hover-only × never appears on a touch screen. */}
          {!locked && (
            <button
              type="button"
              data-no-drag
              onClick={() => onClear(index)}
              aria-label={`${index + 1}-qatorni bo'shatish`}
              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 dark:text-[#6d6d74] opacity-70 hover:opacity-100 hover:text-gray-700 dark:hover:text-[#d4d4d8] transition-opacity cursor-pointer"
            >
              <IconX size={13} stroke={2.5} />
            </button>
          )}
        </div>
      ) : (
        <span className="px-2 font-mono text-[12px] text-gray-400 dark:text-[#5c5c64]">
          bo&apos;sh qator
        </span>
      )}
    </DropSlot>
  );
}

/**
 * The list as cells, each labelled with its index, plus one dashed cell for the
 * position past the end. That last cell is why the strip exists: `uzunlik` is a
 * count, and the place it names as an index is visibly empty.
 */
function PickBoard({
  puzzle,
  picked,
  status,
  onPick,
}: {
  puzzle: PickPuzzle;
  picked: number | null;
  status: string;
  onPick: (index: number) => void;
}) {
  return (
    <>
      <GameBoard label="Ro'yxat">
        <Line text={listText(puzzle.name, puzzle.list)} />

        {puzzle.expr && (
          <div className="mt-3">
            <CodeLine tone="picked">{puzzle.expr}</CodeLine>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {[...puzzle.list.map((cell) => cellText(cell)), null].map((label, i) => {
            const isPicked = picked === i;
            const wrongPick = status === "fail" && isPicked;
            const rightPick = status === "success" && isPicked;
            const ghost = label === null;

            return (
              <button
                key={i}
                type="button"
                onClick={() => onPick(i)}
                className="flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <span
                  className={`min-w-[48px] max-w-full h-[46px] px-2.5 rounded-[12px] border-2 flex items-center justify-center font-mono text-[13px] font-bold transition-colors ${
                    ghost ? "border-dashed" : ""
                  } ${
                    rightPick
                      ? "border-[#26B54F] bg-[#26B54F]/10 text-[#177F37] dark:text-[#4ADE80]"
                      : wrongPick
                      ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      : isPicked
                      ? "border-[#A78BFA] bg-[#A78BFA]/10 text-[#7C5CE0] dark:text-[#c4b5fd]"
                      : ghost
                      ? "border-gray-300 dark:border-[#3a3a41] text-gray-400 dark:text-[#5c5c64]"
                      : "border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] text-gray-800 dark:text-[#e4e4e7] hover:border-gray-300 dark:hover:border-[#3d3d45]"
                  }`}
                >
                  {ghost ? "?" : label}
                </span>
                <span
                  className={`font-mono text-[11px] ${
                    isPicked
                      ? "text-[#7C5CE0] dark:text-[#c4b5fd] font-bold"
                      : "text-gray-400 dark:text-[#6d6d74]"
                  }`}
                >
                  {i}
                </span>
              </button>
            );
          })}
        </div>
      </GameBoard>

      <div className="mt-3">
        <GameHowTo
          steps={[
            "Katak ostidagi kichik raqam — o'sha katakning indeksi.",
            "Oxirgi punktir katak — ro'yxat tugagandan keyingi o'rin.",
            "Javob bo'lgan katakni bosing va «Tekshirish» ni bosing.",
          ]}
        />
      </div>
    </>
  );
}

/** A program to read, and one answer to pick out of several. */
function ChoiceBoard({
  puzzle,
  picked,
  status,
  onPick,
}: {
  puzzle: ChoicePuzzle;
  picked: number | null;
  status: string;
  onPick: (index: number) => void;
}) {
  return (
    <>
      <GameBoard label="Dastur">
        <div className="flex flex-col gap-1">
          {puzzle.program.map((line, i) =>
            line === "" ? (
              <div key={i} className="h-2.5" />
            ) : (
              <div
                key={i}
                className="font-mono text-[13px] sm:text-[13.5px] leading-snug whitespace-pre text-gray-800 dark:text-[#e4e4e7]"
              >
                {line}
              </div>
            )
          )}
        </div>
      </GameBoard>

      <div className="mt-3">
        <GameBoard label="Javob variantlari">
          <div className="flex flex-col gap-2">
            {puzzle.options.map((option, i) => {
              const isPicked = picked === i;
              const wrongPick = status === "fail" && isPicked;
              const rightPick = status === "success" && isPicked;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onPick(i)}
                  className={`flex items-center gap-3 rounded-[12px] border-2 px-3.5 py-3 text-left transition-colors cursor-pointer ${
                    rightPick
                      ? "border-[#26B54F] bg-[#26B54F]/10"
                      : wrongPick
                      ? "border-amber-500 bg-amber-500/10"
                      : isPicked
                      ? "border-[#A78BFA] bg-[#A78BFA]/10"
                      : "border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] hover:border-gray-300 dark:hover:border-[#3d3d45]"
                  }`}
                >
                  <span
                    className={`shrink-0 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center text-[11px] font-bold ${
                      isPicked
                        ? "border-[#A78BFA] text-[#7C5CE0] dark:text-[#c4b5fd]"
                        : "border-gray-200 dark:border-[#2b2b31] text-gray-400 dark:text-[#6d6d74]"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="min-w-0 flex-1 font-mono text-[13px] sm:text-[13.5px] leading-snug text-gray-800 dark:text-[#e4e4e7]">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </GameBoard>
      </div>
    </>
  );
}
