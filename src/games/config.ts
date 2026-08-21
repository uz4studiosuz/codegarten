/**
 * Author-supplied game configuration
 * ==================================
 * A game normally picks a puzzle from its own pool (see shared/seed.ts). That is
 * right for the built-in curriculum but leaves an author with only a choice
 * between pre-written tasks. Passing `config` on a challenge step replaces the
 * pool entirely: the author states the task, the options and the answer, and the
 * game plays that instead.
 *
 * Every game exports `fromConfig(config)` next to its own `Puzzle` type, so the
 * mapping from loose JSON to a strict puzzle lives beside the thing it builds.
 * This file holds only what all of them need:
 *
 *   - readers (`num`, `str`, `strList`, …) that return `undefined` rather than
 *     throwing, so a half-finished config in the writer degrades to the built-in
 *     puzzle instead of crashing the lesson, and
 *   - `Predicate` / `evalPredicate`, because a condition cannot be a function
 *     when it has to survive a round trip through JSON.
 *
 * The writer builds its forms from src/games/configSchema.ts, which describes
 * the same fields these readers accept. Change one, change the other.
 */

/* ────────────────────────────── readers ────────────────────────────── */

export function str(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export function num(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

export function int(value: unknown, min?: number, max?: number): number | undefined {
  const parsed = num(value);
  if (parsed === undefined) return undefined;
  let out = Math.round(parsed);
  if (min !== undefined) out = Math.max(min, out);
  if (max !== undefined) out = Math.min(max, out);
  return out;
}

export function bool(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

/** Non-empty strings only. An author leaving a row blank should not create one. */
export function strList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out = value.map(str).filter((item): item is string => item !== undefined);
  return out.length > 0 ? out : undefined;
}

export function numList(value: unknown): number[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out = value.map(num).filter((item): item is number => item !== undefined);
  return out.length > 0 ? out : undefined;
}

/** Rows of an object list, each mapped by `read`; rows that fail are dropped. */
export function objList<T>(value: unknown, read: (row: any) => T | undefined): T[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out: T[] = [];
  for (const row of value) {
    if (row === null || typeof row !== "object") continue;
    const mapped = read(row);
    if (mapped !== undefined) out.push(mapped);
  }
  return out.length > 0 ? out : undefined;
}

/** Keeps only values the game actually knows, in the author's order. */
export function enumList<T extends string>(value: unknown, allowed: readonly T[]): T[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out = value.filter((item): item is T => typeof item === "string" && (allowed as readonly string[]).includes(item));
  return out.length > 0 ? out : undefined;
}

export function enumValue<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  if (typeof value !== "string") return undefined;
  return (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

/** Author-supplied lists get de-duplicated; a repeated option is never intended. */
export function unique<T>(items: readonly T[]): T[] {
  return items.filter((item, index) => items.indexOf(item) === index);
}

/* ─────────────────────────── predicates ─────────────────────────── */

export type Facts = Record<string, number | boolean | string>;

export type ComparisonOp = "truthy" | "falsy" | "==" | "!=" | ">" | ">=" | "<" | "<=";

/**
 * A condition an author can write down. `and`/`or` nest, so "qorongi VA uyda"
 * is expressible without giving the writer a code editor.
 */
export type Predicate =
  | { op: ComparisonOp; fact: string; value?: number | boolean | string }
  | { op: "and" | "or"; of: Predicate[] }
  | { op: "not"; of: Predicate };

const COMPARISONS: readonly ComparisonOp[] = [
  "truthy",
  "falsy",
  "==",
  "!=",
  ">",
  ">=",
  "<",
  "<=",
];

export function isComparison(op: string): op is ComparisonOp {
  return (COMPARISONS as readonly string[]).includes(op);
}

/** Human-readable operator labels, shared by the writer's condition form. */
export const OP_LABELS: Record<ComparisonOp | "and" | "or" | "not", string> = {
  truthy: "rost (bor / ha)",
  falsy: "yolg'on (yo'q)",
  "==": "teng (==)",
  "!=": "teng emas (!=)",
  ">": "katta (>)",
  ">=": "katta yoki teng (>=)",
  "<": "kichik (<)",
  "<=": "kichik yoki teng (<=)",
  and: "va (ikkisi ham)",
  or: "yoki (bittasi yetarli)",
  not: "emas (teskari)",
};

/** Reads a predicate out of loose JSON. Returns undefined for anything invalid. */
export function toPredicate(value: unknown): Predicate | undefined {
  if (value === null || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  const op = str(raw.op);
  if (!op) return undefined;

  if (op === "and" || op === "or") {
    const of = objList(raw.of, toPredicate);
    return of && of.length > 0 ? { op, of } : undefined;
  }
  if (op === "not") {
    const of = toPredicate(raw.of);
    return of ? { op: "not", of } : undefined;
  }
  if (!isComparison(op)) return undefined;

  const fact = str(raw.fact);
  if (!fact) return undefined;
  if (op === "truthy" || op === "falsy") return { op, fact };

  // A comparison without something to compare against is not a condition yet.
  const value_ = raw.value;
  if (typeof value_ === "number" || typeof value_ === "boolean") return { op, fact, value: value_ };
  const asString = str(value_);
  if (asString === undefined) return undefined;
  const asNumber = num(asString);
  return { op, fact, value: asNumber !== undefined ? asNumber : asString };
}

/** Runs a predicate against one situation. Unknown facts read as falsy. */
export function evalPredicate(predicate: Predicate, facts: Facts): boolean {
  switch (predicate.op) {
    case "and":
      return predicate.of.every((child) => evalPredicate(child, facts));
    case "or":
      return predicate.of.some((child) => evalPredicate(child, facts));
    case "not":
      return !evalPredicate(predicate.of, facts);
    case "truthy":
      return Boolean(facts[predicate.fact]);
    case "falsy":
      return !facts[predicate.fact];
    default:
      break;
  }

  const left = facts[predicate.fact];
  const right = predicate.value;

  // Equality stays loose on purpose: an author typing 18 for a fact stored as
  // "18" means the same thing, and forcing them to match types would only
  // produce puzzles that silently never match.
  if (predicate.op === "==") return String(left) === String(right);
  if (predicate.op === "!=") return String(left) !== String(right);

  const a = Number(left);
  const b = Number(right);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  if (predicate.op === ">") return a > b;
  if (predicate.op === ">=") return a >= b;
  if (predicate.op === "<") return a < b;
  return a <= b;
}

/** Reads the `{ nom: qiymat }` situation table an author fills in. */
export function toFacts(value: unknown): Facts | undefined {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return undefined;
  const out: Facts = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const name = str(key);
    if (!name) continue;
    if (typeof raw === "number" || typeof raw === "boolean") {
      out[name] = raw;
      continue;
    }
    const text = str(raw);
    if (text === undefined) continue;
    const asBool = bool(text);
    if (asBool !== undefined) {
      out[name] = asBool;
      continue;
    }
    const asNumber = num(text);
    out[name] = asNumber !== undefined ? asNumber : text;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/* ───────────────────────── shared colour vocabulary ───────────────────────── */

/**
 * The colour blocks the block-dragging games offer. Kept here rather than in
 * each game so the writer can show one palette picker, and so an author's
 * "yashil" means the same green everywhere.
 */
export const PALETTE = {
  yashil: { label: "yashil", hex: "#26B54F" },
  binafsha: { label: "binafsha", hex: "#7C5CE0" },
  sariq: { label: "sariq", hex: "#E0A13C" },
  kok: { label: "ko'k", hex: "#3B82F6" },
  qizil: { label: "qizil", hex: "#EF4444" },
  pushti: { label: "pushti", hex: "#EC4899" },
} as const;

export type PaletteKey = keyof typeof PALETTE;

export const PALETTE_KEYS = Object.keys(PALETTE) as PaletteKey[];

export function isPaletteKey(value: unknown): value is PaletteKey {
  return typeof value === "string" && value in PALETTE;
}

/**
 * True when an author has actually configured something. An empty object — the
 * state a freshly added custom config starts in — must fall through to the
 * built-in puzzle rather than render a blank board.
 */
export function hasConfig(config: unknown): config is Record<string, any> {
  return (
    config !== null &&
    typeof config === "object" &&
    !Array.isArray(config) &&
    Object.keys(config).length > 0
  );
}
