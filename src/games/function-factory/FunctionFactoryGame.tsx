"use client";

import React, { useMemo, useState } from "react";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import type { GameProps } from "../types";
import { GameBoard, GameNote, GameReset, GameShell, useGameCheck } from "../shared";
import { pickVariant } from "../shared/seed";

/**
 * One function, different arguments
 * ---------------------------------
 * The point of a function is not that it shortens code but that one definition
 * serves many cases. The body here is given and fixed; the learner only writes
 * the calls, so the whole exercise is about what a parameter does to the result.
 */

type Colour = "g" | "v" | "a" | "b";

const COLOURS: Record<Colour, { label: string; className: string }> = {
  g: { label: "yashil", className: "bg-[#26B54F]" },
  v: { label: "binafsha", className: "bg-[#7C5CE0]" },
  a: { label: "sariq", className: "bg-[#E0A13C]" },
  b: { label: "ko'k", className: "bg-[#3B82F6]" },
};

interface Target {
  length: number;
  colour: Colour;
}

interface Puzzle {
  /** Name and parameter names, so the call reads like the lesson's code. */
  fnName: string;
  params: [string, string];
  hint: string;
  palette: Colour[];
  targets: Target[];
  why: string;
}

const MAX_LENGTH = 6;

const PUZZLES: Puzzle[] = [
  {
    fnName: "chiz",
    params: ["uzunlik", "rang"],
    hint: "Funksiya tanasi tayyor — sizga faqat har chaqiruvning argumentlarini to'g'ri yozish qoldi.",
    palette: ["g", "v", "a"],
    targets: [
      { length: 2, colour: "g" },
      { length: 5, colour: "v" },
      { length: 3, colour: "a" },
    ],
    why:
      "Bitta funksiya uch xil natija berdi — farq faqat argumentlarda. Shuning uchun kodni uch marta yozish kerak bo'lmadi.",
  },
  {
    fnName: "ustun",
    params: ["balandlik", "rang"],
    hint: "Har chaqiruv o'z natijasini beradi: argumentni o'zgartirsangiz, natija ham o'zgaradi.",
    palette: ["b", "a", "g", "v"],
    targets: [
      { length: 4, colour: "b" },
      { length: 1, colour: "a" },
      { length: 6, colour: "b" },
    ],
    why:
      "Ikkinchi va uchinchi chaqiruvda rang bir xil, uzunlik esa boshqa — parametrlar bir-biridan mustaqil.",
  },
  {
    fnName: "chizgi",
    params: ["qadam", "rang"],
    hint: "Namunani sanab chiqing: har chizgida nechta katak bor?",
    palette: ["v", "g", "b"],
    targets: [
      { length: 3, colour: "v" },
      { length: 3, colour: "g" },
      { length: 2, colour: "b" },
    ],
    why:
      "Birinchi ikki chaqiruvda uzunlik bir xil bo'lsa ham, rang argumenti natijani boshqa qildi.",
  },
];

export function FunctionFactoryGame(props: GameProps) {
  const puzzle = useMemo(() => pickVariant(PUZZLES, props.seed), [props.seed]);

  const [calls, setCalls] = useState<{ length: number; colour: Colour | null }[]>(() =>
    puzzle.targets.map(() => ({ length: 1, colour: null }))
  );

  const complete = calls.every((c) => c.colour !== null);

  const matches = useMemo(
    () =>
      calls.map(
        (call, i) =>
          call.colour === puzzle.targets[i].colour &&
          call.length === puzzle.targets[i].length
      ),
    [calls, puzzle.targets]
  );

  const { status, reset } = useGameCheck(props, {
    ready: complete,
    check: () => matches.every(Boolean),
  });

  const patch = (index: number, patchValue: Partial<{ length: number; colour: Colour }>) => {
    reset();
    setCalls((prev) =>
      prev.map((call, i) =>
        i === index
          ? {
              ...call,
              ...patchValue,
              length:
                patchValue.length === undefined
                  ? call.length
                  : Math.max(1, Math.min(MAX_LENGTH, patchValue.length)),
            }
          : call
      )
    );
  };

  const wrongCount = matches.filter((m) => !m).length;

  return (
    <GameShell
      task="Uchta namunani bitta funksiya bilan chizib bering."
      hint={puzzle.hint}
      status={status}
      successText={puzzle.why}
      failText={
        wrongCount === 1
          ? "Bitta chaqiruv namunaga mos kelmadi — belgilangan qatorning argumentlarini tekshiring."
          : wrongCount + " chaqiruv namunaga mos kelmadi. Kataklarni sanab, ranglarni solishtiring."
      }
      footer={
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500 dark:text-[#6d6d74]">
            {matches.filter(Boolean).length}/{puzzle.targets.length} namuna mos
          </span>
          <GameReset
            onClick={() => {
              reset();
              setCalls(puzzle.targets.map(() => ({ length: 1, colour: null })));
            }}
          />
        </div>
      }
    >
      {/* The definition is read-only: this exercise is about the calls. */}
      <GameBoard label="Funksiya (tayyor)">
        <div className="font-mono text-[13px] leading-relaxed text-gray-700 dark:text-[#d4d4d8]">
          <div>
            <span className="text-[#7C5CE0] dark:text-[#c4b5fd]">funksiya</span>{" "}
            {puzzle.fnName}({puzzle.params[0]}, {puzzle.params[1]}):
          </div>
          <div className="ml-5 text-gray-500 dark:text-[#8b8b93]">
            {puzzle.params[0]} marta {puzzle.params[1]} rangli katak chiz
          </div>
        </div>
      </GameBoard>

      <div className="mt-3">
        <GameBoard label="Chaqiruvlar">
          <div className="flex flex-col gap-4">
            {puzzle.targets.map((target, i) => {
              const call = calls[i];
              const ok = matches[i];

              return (
                <div
                  key={i}
                  className={`rounded-[14px] border-2 p-3 transition-colors ${
                    status === "idle"
                      ? "border-gray-200 dark:border-[#2b2b31]"
                      : ok
                      ? "border-[#26B54F]/60 bg-[#26B54F]/[0.06]"
                      : "border-amber-500 bg-amber-500/[0.06]"
                  }`}
                >
                  {/* Reference strip the call has to reproduce */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-[#6d6d74] w-[58px] shrink-0">
                      namuna
                    </span>
                    <div className="flex gap-1">
                      {Array.from({ length: target.length }).map((_, k) => (
                        <span
                          key={k}
                          className={`w-5 h-5 rounded-[5px] ${COLOURS[target.colour].className}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* The call the learner writes */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[13.5px] text-gray-800 dark:text-[#e4e4e7]">
                    <span>{puzzle.fnName}(</span>

                    <span className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => patch(i, { length: call.length - 1 })}
                        aria-label="Uzunlikni kamaytirish"
                        className="w-7 h-7 rounded-full border-2 border-gray-200 dark:border-[#2b2b31] flex items-center justify-center hover:border-gray-300 dark:hover:border-[#3d3d45] transition-colors cursor-pointer"
                      >
                        <IconMinus size={12} stroke={2.8} />
                      </button>
                      <span className="w-6 text-center font-bold text-[#26B54F] dark:text-[#4ADE80]">
                        {call.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => patch(i, { length: call.length + 1 })}
                        aria-label="Uzunlikni oshirish"
                        className="w-7 h-7 rounded-full border-2 border-gray-200 dark:border-[#2b2b31] flex items-center justify-center hover:border-gray-300 dark:hover:border-[#3d3d45] transition-colors cursor-pointer"
                      >
                        <IconPlus size={12} stroke={2.8} />
                      </button>
                    </span>

                    <span>,</span>

                    <span className="inline-flex items-center gap-1.5">
                      {puzzle.palette.map((colour) => (
                        <button
                          key={colour}
                          type="button"
                          onClick={() => patch(i, { colour })}
                          title={COLOURS[colour].label}
                          aria-label={COLOURS[colour].label}
                          className={`w-7 h-7 rounded-[8px] transition-all cursor-pointer ${
                            COLOURS[colour].className
                          } ${
                            call.colour === colour
                              ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-white dark:ring-offset-[#141416] ring-offset-white"
                              : "opacity-45 hover:opacity-80"
                          }`}
                        />
                      ))}
                    </span>

                    <span>)</span>
                  </div>

                  {/* What the call actually produced */}
                  <div className="mt-2.5 flex items-center gap-2.5">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-[#6d6d74] w-[58px] shrink-0">
                      natija
                    </span>
                    <div className="flex gap-1 min-h-[20px]">
                      {call.colour
                        ? Array.from({ length: call.length }).map((_, k) => (
                            <span
                              key={k}
                              className={`w-5 h-5 rounded-[5px] ${COLOURS[call.colour!].className}`}
                            />
                          ))
                        : (
                          <span className="text-[12px] text-gray-400 dark:text-[#6d6d74]">
                            rang tanlanmagan
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GameBoard>
      </div>

      {status === "idle" && (
        <div className="mt-3">
          <GameNote>
            Funksiya tanasi bir marta yozilgan. Har chaqiruvda faqat argumentlar
            o&apos;zgaradi — natija esa boshqa bo&apos;ladi.
          </GameNote>
        </div>
      )}
    </GameShell>
  );
}
