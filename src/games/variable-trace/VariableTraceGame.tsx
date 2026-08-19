"use client";

import React, { useMemo, useState } from "react";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import type { GameProps } from "../types";
import { GameBoard, GameNote, GameShell, useGameCheck } from "../shared";
import { pickVariant } from "../shared/seed";

/**
 * Trace the boxes
 * ---------------
 * A variable is a box whose old value is gone the moment a new one goes in.
 * The learner predicts the final contents before running anything; only after
 * checking does the board reveal the value of every box after every line, so a
 * wrong prediction turns into a readable explanation rather than a red cross.
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
];

const OPS: Record<Kind, (current: number, operand: number) => number> = {
  set: (_current, operand) => operand,
  copy: (_current, operand) => operand,
  add: (current, operand) => current + operand,
  sub: (current, operand) => current - operand,
  mul: (current, operand) => current * operand,
};

function renderStmt(stmt: Stmt): string {
  const right =
    stmt.kind === "set" || stmt.kind === "copy"
      ? String(stmt.value)
      : `${stmt.target} ${stmt.kind === "add" ? "+" : stmt.kind === "sub" ? "-" : "*"} ${stmt.value}`;
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
  const puzzle = useMemo(() => pickVariant(PUZZLES, props.seed), [props.seed]);
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
    setGuess((prev) => ({ ...prev, [name]: Math.max(-20, Math.min(99, prev[name] + delta)) }));
  };

  const wrongVars = puzzle.vars.filter((name) => guess[name] !== final[name]);
  const revealed = status !== "idle";

  return (
    <GameShell
      task="Dastur tugagandan keyin qutilarda qanday qiymat qoladi?"
      hint={puzzle.hint}
      status={status}
      successText={puzzle.why}
      failText={
        "Hozircha " +
        wrongVars.join(", ") +
        " qutisi to'g'ri emas. Pastdagi jadvalda har qatordan keyingi qiymatlarni kuzatib chiqing."
      }
      footer={
        revealed ? undefined : (
          <GameNote>
            Har qator bajarilgach, quti ichidagi qiymat almashadi. Oxirgi holatni oldindan
            aytib bering — keyin dastur qatorma-qator ko&apos;rsatiladi.
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

              {/* Values appear only after the learner has committed to an answer */}
              {revealed && (
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
              const ok = revealed && guess[name] === final[name];
              const bad = revealed && guess[name] !== final[name];

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
                      aria-label={name + " qiymatini kamaytirish"}
                      className="w-7 h-7 rounded-full border-2 border-gray-200 dark:border-[#2b2b31] flex items-center justify-center hover:border-gray-300 dark:hover:border-[#3d3d45] transition-colors cursor-pointer"
                    >
                      <IconMinus size={12} stroke={2.8} />
                    </button>
                    <span className="w-8 text-center font-mono text-[17px] font-bold text-gray-900 dark:text-white">
                      {guess[name]}
                    </span>
                    <button
                      type="button"
                      onClick={() => bump(name, 1)}
                      aria-label={name + " qiymatini oshirish"}
                      className="w-7 h-7 rounded-full border-2 border-gray-200 dark:border-[#2b2b31] flex items-center justify-center hover:border-gray-300 dark:hover:border-[#3d3d45] transition-colors cursor-pointer"
                    >
                      <IconPlus size={12} stroke={2.8} />
                    </button>
                  </div>

                  {bad && (
                    <span className="font-mono text-[11.5px] text-amber-600 dark:text-amber-400">
                      to&apos;g&apos;risi: {final[name]}
                    </span>
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
