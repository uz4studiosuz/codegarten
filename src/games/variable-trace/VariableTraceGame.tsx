"use client";

import React, { useMemo, useState } from "react";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import type { GameProps } from "../types";
import { GameBoard, GameNote, GameShell, pickVariant, useGameCheck } from "../shared";

/**
 * Trace the boxes
 * ---------------
 * A variable is a box whose old value is gone the moment a new one goes in.
 * The learner predicts the final contents before running anything.
 *
 * Only a correct answer opens the line-by-line trace. Showing it after a wrong
 * guess — and printing the right number under the box, as the first version did —
 * handed over the answer and left nothing to think about on the second attempt.
 */

type Kind = "set" | "copy" | "add" | "sub" | "mul";

interface Stmt {
  target: string;
  kind: Kind;
  /** A number, or another variable's name for copy/add/sub. */
  value: number | string;
}

interface Puzzle {
  hint: string;
  vars: string[];
  program: Stmt[];
  why: string;
}

const PUZZLES: Puzzle[] = [
  {
    hint: "Har qatorni yuqoridan pastga bajarib, qutilar ichidagi qiymatni kuzatib boring.",
    vars: ["a", "b"],
    program: [
      { target: "a", kind: "set", value: 3 },
      { target: "b", kind: "set", value: 5 },
      { target: "a", kind: "add", value: "b" },
      { target: "b", kind: "add", value: 2 },
    ],
    why:
      "a = a + b qatori bajarilganda b ning o'sha paytdagi qiymati (5) qo'shildi. Keyin b o'zgargani a ga ta'sir qilmaydi.",
  },
  {
    hint: "Bir qutiga yangi qiymat solinsa, ichidagi eskisi butunlay o'chadi.",
    vars: ["a", "b"],
    program: [
      { target: "a", kind: "set", value: 7 },
      { target: "b", kind: "set", value: 2 },
      { target: "b", kind: "copy", value: "a" },
      { target: "a", kind: "sub", value: 4 },
    ],
    why:
      "b = a qatori a ning nusxasini oladi, ikkalasi bog'lanib qolmaydi. Shuning uchun keyin a kamayganda b o'zgarmadi.",
  },
  {
    hint: "Hisoblagich har qadamda o'zining eski qiymatiga tayanadi.",
    vars: ["son"],
    program: [
      { target: "son", kind: "set", value: 1 },
      { target: "son", kind: "mul", value: 2 },
      { target: "son", kind: "mul", value: 2 },
      { target: "son", kind: "add", value: 3 },
    ],
    why:
      "son = son * 2 ikki marta bajarildi (1 → 2 → 4), so'ng 3 qo'shildi. Har qator oldingi natija ustiga ishlaydi.",
  },
  {
    hint: "Uchinchi qutiga e'tibor bering — u nima uchun kerak bo'lgan?",
    vars: ["a", "b", "vaqt"],
    program: [
      { target: "a", kind: "set", value: 4 },
      { target: "b", kind: "set", value: 9 },
      { target: "vaqt", kind: "copy", value: "a" },
      { target: "a", kind: "copy", value: "b" },
      { target: "b", kind: "copy", value: "vaqt" },
    ],
    why:
      "vaqt a ning qiymatini saqlab turdi, shuning uchun a va b muvaffaqiyatli almashdi. Vaqtinchalik quti bo'lmasa, eski qiymat yo'qolardi.",
  },
  {
    hint: "Ayirish ham qutining eski qiymatidan boshlanadi.",
    vars: ["ball", "jarima"],
    program: [
      { target: "ball", kind: "set", value: 20 },
      { target: "jarima", kind: "set", value: 3 },
      { target: "ball", kind: "sub", value: "jarima" },
      { target: "ball", kind: "sub", value: "jarima" },
    ],
    why:
      "Bitta jarima qiymati ikki marta ayirildi: 20 − 3 − 3. jarima qutisining o'zi esa o'zgarmadi.",
  },
  {
    hint: "Ikki quti bir xil qiymat bilan boshlanadi — keyin yo'llari ajraladi.",
    vars: ["x", "y"],
    program: [
      { target: "x", kind: "set", value: 6 },
      { target: "y", kind: "copy", value: "x" },
      { target: "x", kind: "mul", value: 2 },
      { target: "y", kind: "add", value: 1 },
    ],
    why:
      "y = x nusxa oldi, keyin ikkisi mustaqil o'zgardi. Nusxa olish — bog'lanish emas.",
  },
  {
    hint: "Uchta quti, ammo faqat bittasi oxirida o'zgaradi.",
    vars: ["a", "b", "c"],
    program: [
      { target: "a", kind: "set", value: 2 },
      { target: "b", kind: "set", value: 3 },
      { target: "c", kind: "copy", value: "b" },
      { target: "c", kind: "mul", value: "a" },
      { target: "a", kind: "add", value: 1 },
    ],
    why:
      "c = b * a qatori o'sha paytdagi qiymatlarni oldi (3 * 2). Keyin a ning o'zgarishi c ga yetib bormadi.",
  },
  {
    hint: "Qiymat bir necha marta almashadi — faqat oxirgisi qoladi.",
    vars: ["n"],
    program: [
      { target: "n", kind: "set", value: 10 },
      { target: "n", kind: "set", value: 4 },
      { target: "n", kind: "add", value: 6 },
      { target: "n", kind: "sub", value: 1 },
    ],
    why:
      "Ikkinchi qator 10 ni butunlay o'chirdi. Qutida faqat oxirgi solingan qiymat ustidagi hisob qoldi: 4 + 6 − 1.",
  },
];

const OPS: Record<Kind, (current: number, operand: number) => number> = {
  set: (_current, operand) => operand,
  copy: (_current, operand) => operand,
  add: (current, operand) => current + operand,
  sub: (current, operand) => current - operand,
  mul: (current, operand) => current * operand,
};

const SYMBOLS: Record<Kind, string> = {
  set: "=",
  copy: "=",
  add: "+",
  sub: "-",
  mul: "*",
};

function renderStmt(stmt: Stmt): string {
  const right =
    stmt.kind === "set" || stmt.kind === "copy"
      ? String(stmt.value)
      : `${stmt.target} ${SYMBOLS[stmt.kind]} ${stmt.value}`;
  return `${stmt.target} = ${right}`;
}

/** Runs the program, returning the environment after each line. */
function trace(puzzle: Puzzle): Record<string, number>[] {
  const frames: Record<string, number>[] = [];
  let env: Record<string, number> = {};
  puzzle.vars.forEach((name) => (env[name] = 0));

  for (const stmt of puzzle.program) {
    const operand = typeof stmt.value === "number" ? stmt.value : env[stmt.value] ?? 0;
    env = { ...env, [stmt.target]: OPS[stmt.kind](env[stmt.target] ?? 0, operand) };
    frames.push(env);
  }
  return frames;
}

export function VariableTraceGame(props: GameProps) {
  const puzzle = useMemo(
    () => pickVariant(PUZZLES, props.seed, { ordinal: props.variant }),
    [props.seed, props.variant]
  );
  const frames = useMemo(() => trace(puzzle), [puzzle]);
  const final = frames[frames.length - 1];

  const [guess, setGuess] = useState<Record<string, number>>(() =>
    Object.fromEntries(puzzle.vars.map((name) => [name, 0]))
  );
  const [touched, setTouched] = useState(false);

  const { status, reset } = useGameCheck(props, {
    ready: touched,
    check: () => puzzle.vars.every((name) => guess[name] === final[name]),
  });

  const bump = (name: string, delta: number) => {
    reset();
    setTouched(true);
    setGuess((prev) => ({
      ...prev,
      [name]: Math.max(-40, Math.min(199, prev[name] + delta)),
    }));
  };

  const wrongVars = puzzle.vars.filter((name) => guess[name] !== final[name]);
  /** The trace is a reward for a correct prediction, not a consolation prize. */
  const solved = status === "success";

  return (
    <GameShell
      task="Dastur tugagandan keyin qutilarda qanday qiymat qoladi?"
      hint={puzzle.hint}
      status={status}
      successText={puzzle.why}
      failText={
        wrongVars.length === puzzle.vars.length
          ? "Hali to'g'ri emas. Birinchi qatordan boshlab, har qatordan keyin quti ichida nima turganini qog'ozga yozib chiqing."
          : `${wrongVars.join(", ")} qutisi to'g'ri emas — shu quti qatnashgan qatorlarni qayta o'qing.`
      }
      footer={
        solved ? undefined : (
          <GameNote>
            Har qator bajarilgach, quti ichidagi qiymat almashadi. Oxirgi holatni oldindan
            aytib bering — to&apos;g&apos;ri javobdan keyin dastur qatorma-qator ochiladi.
          </GameNote>
        )
      }
    >
      <GameBoard label="Dastur">
        <div className="flex flex-col gap-2">
          {puzzle.program.map((stmt, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-[12px] border-2 border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] px-3.5 py-2.5"
            >
              <span className="w-4 shrink-0 text-right font-mono text-[12.5px] text-gray-400 dark:text-[#5c5c64]">
                {i + 1}
              </span>
              <span className="font-mono text-[13.5px] sm:text-[14px] text-gray-800 dark:text-[#e4e4e7] min-w-0 flex-1">
                {renderStmt(stmt)}
              </span>

              {/* The trace opens only once the prediction was right */}
              {solved && (
                <span className="shrink-0 font-mono text-[12px] text-gray-500 dark:text-[#8b8b93]">
                  {puzzle.vars.map((name) => `${name}=${frames[i][name]}`).join("  ")}
                </span>
              )}
            </div>
          ))}
        </div>
      </GameBoard>

      <div className="mt-3">
        <GameBoard label="Sizning javobingiz">
          <div className="flex flex-wrap gap-3">
            {puzzle.vars.map((name) => {
              const ok = solved;
              const bad = status === "fail" && guess[name] !== final[name];

              return (
                <div
                  key={name}
                  className={`flex flex-col items-center gap-2 rounded-[14px] border-2 px-4 py-3 transition-colors ${
                    ok
                      ? "border-[#26B54F] bg-[#26B54F]/[0.08]"
                      : bad
                      ? "border-amber-500 bg-amber-500/[0.08]"
                      : "border-gray-200 dark:border-[#2b2b31]"
                  }`}
                >
                  <span className="font-mono text-[13px] font-bold text-[#7C5CE0] dark:text-[#c4b5fd]">
                    {name}
                  </span>

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
                      {guess[name]}
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
                </div>
              );
            })}
          </div>
        </GameBoard>
      </div>
    </GameShell>
  );
}
