"use client";

import React, { useMemo, useState } from "react";
import { IconArrowDown, IconPlus, IconX } from "@tabler/icons-react";
import type { GameProps } from "../types";
import { GameBoard, GameReset, GameShell, useGameCheck } from "../shared";
import { pickVariant, seededShuffle } from "../shared/seed";

/**
 * Order the steps
 * ---------------
 * The sequencing skill in its purest form: a computer runs steps in the order
 * they are written, so a correct set of steps in the wrong order still fails.
 * The learner taps steps into the program; the board shows the program reading
 * top to bottom, the way code does.
 */

interface Puzzle {
  task: string;
  hint: string;
  /** Steps in the one correct order. */
  steps: string[];
}

const PUZZLES: Puzzle[] = [
  {
    task: "Choy damlash algoritmini to'g'ri tartibda tuzing.",
    hint: "Qadamlar to'g'ri, lekin tartib buzilgan. Kompyuter yozilgan tartibda bajaradi.",
    steps: [
      "choynakni yuv",
      "suvni qaynat",
      "choy solib qaynoq suv quy",
      "5 daqiqa kutib turing",
      "piyolaga quy",
    ],
  },
  {
    task: "Robot eshikdan chiqishi uchun qadamlarni tartibga soling.",
    hint: "Har bir buyruq oldingisining natijasiga tayanadi.",
    steps: [
      "eshik oldiga bor",
      "eshikni och",
      "oldinga yur",
      "eshikni yop",
    ],
  },
  {
    task: "Kompyuterga rasm chizishni o'rgatish tartibini tuzing.",
    hint: "Avval tayyorgarlik, keyin chizish, oxirida saqlash.",
    steps: [
      "qalamni tanla",
      "rangni tanla",
      "chiziq chiz",
      "rasmni saqla",
    ],
  },
  {
    task: "Xabar yuborish algoritmini to'g'ri tartibda joylang.",
    hint: "Qabul qiluvchini tanlamasdan xabar yuborilmaydi.",
    steps: [
      "ilovani och",
      "kimga yuborishni tanla",
      "matnni yoz",
      "yuborish tugmasini bos",
    ],
  },
];

export function SequenceOrderGame(props: GameProps) {
  const puzzle = useMemo(() => pickVariant(PUZZLES, props.seed), [props.seed]);
  const pool = useMemo(
    () => seededShuffle(puzzle.steps, `${props.seed ?? ""}-pool`),
    [puzzle, props.seed]
  );

  /** Indices into `pool`, in the order the learner placed them. */
  const [program, setProgram] = useState<number[]>([]);

  const { status, reset } = useGameCheck(props, {
    ready: program.length === puzzle.steps.length,
    check: () => program.every((p, i) => pool[p] === puzzle.steps[i]),
  });

  const place = (poolIndex: number) => {
    reset();
    setProgram((prev) => (prev.includes(poolIndex) ? prev : [...prev, poolIndex]));
  };

  const remove = (position: number) => {
    reset();
    setProgram((prev) => prev.filter((_, i) => i !== position));
  };

  /** After a wrong run, point at the first step that is out of place. */
  const firstWrong = program.findIndex((p, i) => pool[p] !== puzzle.steps[i]);

  return (
    <GameShell
      task={puzzle.task}
      hint={puzzle.hint}
      status={status}
      successText="To'g'ri! Qadamlar shu tartibda bajarilsa, natija chiqadi."
      failText={
        firstWrong === -1
          ? "Hali barcha qadamlar joylashtirilmagan."
          : `${firstWrong + 1}-qadam noto'g'ri joyda. Undan boshlab qaytadan o'ylab ko'ring.`
      }
      footer={
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500 dark:text-[#6d6d74]">
            {program.length}/{puzzle.steps.length} qadam terildi
          </span>
          <GameReset onClick={() => { reset(); setProgram([]); }} disabled={program.length === 0} />
        </div>
      }
    >
      <GameBoard label="Dastur">
        <div className="flex flex-col gap-2">
          {Array.from({ length: puzzle.steps.length }).map((_, position) => {
            const poolIndex = program[position];
            const filled = poolIndex !== undefined;
            const isWrong = status === "fail" && filled && pool[poolIndex] !== puzzle.steps[position];
            const isRight = status === "success";

            return (
              <div key={position} className="flex items-center gap-2.5">
                <span className="w-4 shrink-0 text-right font-mono text-[12.5px] text-gray-400 dark:text-[#5c5c64]">
                  {position + 1}
                </span>

                {filled ? (
                  <div
                    className={`flex-1 min-w-0 flex items-center gap-2 rounded-[12px] border-2 px-3.5 py-2.5 transition-colors ${
                      isRight
                        ? "border-[#26B54F] bg-[#26B54F]/10"
                        : isWrong
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-[#7C5CE0]/60 bg-[#7C5CE0]/[0.08]"
                    }`}
                  >
                    <span className="font-mono text-[13.5px] min-w-0 flex-1 truncate text-gray-800 dark:text-[#e4e4e7]">
                      {pool[poolIndex]}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(position)}
                      aria-label="Qadamni olib tashlash"
                      className="shrink-0 w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <IconX size={12} stroke={3} />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 h-[44px] rounded-[12px] border-2 border-dashed border-gray-300 dark:border-[#3a3a41]" />
                )}
              </div>
            );
          })}
        </div>
      </GameBoard>

      <div className="mt-3 flex justify-center text-gray-300 dark:text-[#3a3a41]">
        <IconArrowDown size={18} />
      </div>

      <GameBoard label="Qadamlar" className="flex flex-wrap gap-2">
        {pool.map((step, i) => {
          const used = program.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={used}
              onClick={() => place(i)}
              className={`inline-flex items-center gap-1.5 rounded-[12px] border-2 px-3 py-2 font-mono text-[13px] transition-all active:translate-y-[2px] ${
                used
                  ? "border-gray-200 dark:border-[#232327] text-gray-300 dark:text-[#3f3f46] cursor-not-allowed"
                  : "border-gray-200 dark:border-[#2b2b31] text-gray-700 dark:text-[#d4d4d8] hover:border-[#7C5CE0] hover:text-[#7C5CE0] cursor-pointer"
              }`}
            >
              <IconPlus size={13} stroke={2.6} className="shrink-0" />
              {step}
            </button>
          );
        })}
      </GameBoard>
    </GameShell>
  );
}
