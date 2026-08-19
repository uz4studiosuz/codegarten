"use client";

import React, { useMemo, useState } from "react";
import { IconGripVertical } from "@tabler/icons-react";
import type { GameProps } from "../types";
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
 * One function, different arguments
 * ---------------------------------
 * The point of a function is not that it shortens code but that one definition
 * serves many cases. The body here is given and fixed; the learner only fills in
 * the calls, so the whole exercise is about what an argument does to the result.
 *
 * The first version asked for arguments through a -/+ stepper and a row of faded
 * colour swatches, and children could not tell there was anything to do. Now each
 * call has two visibly empty argument slots and the arguments are blocks that get
 * dragged (or tapped) into them — the slot *is* the parameter.
 */

type Colour = "g" | "v" | "a" | "b";

const COLOURS: Record<Colour, { label: string; hex: string }> = {
  g: { label: "yashil", hex: "#26B54F" },
  v: { label: "binafsha", hex: "#7C5CE0" },
  a: { label: "sariq", hex: "#E0A13C" },
  b: { label: "ko'k", hex: "#3B82F6" },
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
  /** Lengths offered as argument blocks. */
  lengths: number[];
  targets: Target[];
  why: string;
}

const PUZZLES: Puzzle[] = [
  {
    fnName: "chiz",
    params: ["uzunlik", "rang"],
    hint: "Funksiya tanasi tayyor — sizga faqat har chaqiruvning argumentlarini joylash qoldi.",
    palette: ["g", "v", "a"],
    lengths: [1, 2, 3, 4, 5],
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
    hint: "Argumentni o'zgartirsangiz, natija ham o'zgaradi — funksiya tanasi esa o'zgarmaydi.",
    palette: ["b", "a", "g"],
    lengths: [1, 2, 4, 6],
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
    lengths: [1, 2, 3, 4],
    targets: [
      { length: 3, colour: "v" },
      { length: 3, colour: "g" },
      { length: 2, colour: "b" },
    ],
    why:
      "Birinchi ikki chaqiruvda uzunlik bir xil bo'lsa ham, rang argumenti natijani boshqa qildi.",
  },
  {
    fnName: "chiziq",
    params: ["soni", "rang"],
    hint: "Bir xil argumentlar bilan chaqirsangiz, natija ham bir xil bo'ladi.",
    palette: ["a", "v", "g"],
    lengths: [2, 3, 5, 6],
    targets: [
      { length: 5, colour: "a" },
      { length: 2, colour: "v" },
      { length: 5, colour: "a" },
    ],
    why:
      "Birinchi va uchinchi chaqiruv bir xil argumentlarni oldi va bir xil natija berdi — funksiya har safar bir xil ishlaydi.",
  },
  {
    fnName: "bloklar",
    params: ["nechta", "rang"],
    hint: "Uzunliklar tobora ortib boradi — har chaqiruvda faqat birinchi argument o'zgaradi.",
    palette: ["g", "b", "v"],
    lengths: [1, 2, 3, 4],
    targets: [
      { length: 1, colour: "g" },
      { length: 2, colour: "g" },
      { length: 4, colour: "g" },
    ],
    why:
      "Rang argumenti uchta chaqiruvda ham bir xil qoldi. O'zgargan narsa — faqat birinchi argument.",
  },
  {
    fnName: "polosa",
    params: ["uzunlik", "rang"],
    hint: "To'rt xil rang bor — har chaqiruvga o'zining rangi kerak.",
    palette: ["g", "v", "a", "b"],
    lengths: [2, 3, 4],
    targets: [
      { length: 3, colour: "b" },
      { length: 2, colour: "a" },
      { length: 4, colour: "v" },
    ],
    why:
      "Uch chaqiruvning ikkala argumenti ham har xil, natija ham har xil — funksiya esa bitta.",
  },
  {
    fnName: "qator",
    params: ["katak", "rang"],
    hint: "Eng qisqa va eng uzun namunani solishtiring — farq faqat birinchi argumentda.",
    palette: ["v", "a", "g"],
    lengths: [1, 3, 6],
    targets: [
      { length: 6, colour: "v" },
      { length: 1, colour: "v" },
      { length: 3, colour: "a" },
    ],
    why:
      "Bitta ta'rif 6 katakli ham, 1 katakli ham natija berdi. Funksiyani qayta yozish kerak bo'lmadi.",
  },
];

/** What a drag carries: either a length argument or a colour argument. */
type Argument =
  | { kind: "length"; value: number }
  | { kind: "colour"; value: Colour };

interface Call {
  length: number | null;
  colour: Colour | null;
}

export function FunctionFactoryGame(props: GameProps) {
  const puzzle = useMemo(
    () => pickVariant(PUZZLES, props.seed, { ordinal: props.variant }),
    [props.seed, props.variant]
  );

  const [calls, setCalls] = useState<Call[]>(() =>
    puzzle.targets.map(() => ({ length: null, colour: null }))
  );

  const complete = calls.every((c) => c.length !== null && c.colour !== null);

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

  /** Slot ids encode both the call and which parameter: 2n and 2n+1. */
  const assign = (argument: Argument, slot: number) => {
    const row = Math.floor(slot / 2);
    const wantsColour = slot % 2 === 1;
    // A colour dropped on the number slot is simply ignored — no silent surprise.
    if (wantsColour !== (argument.kind === "colour")) return;

    reset();
    setCalls((prev) =>
      prev.map((call, i) =>
        i !== row
          ? call
          : argument.kind === "colour"
          ? { ...call, colour: argument.value }
          : { ...call, length: argument.value }
      )
    );
  };

  /** The row a tap should fill: the first one still missing this argument. */
  const tapInto = (argument: Argument) => {
    const row = calls.findIndex((call) =>
      argument.kind === "colour" ? call.colour === null : call.length === null
    );
    if (row === -1) return;
    assign(argument, row * 2 + (argument.kind === "colour" ? 1 : 0));
  };

  const drag = useBlockDrag<Argument>({
    onDrop: (argument, slot) => assign(argument, slot),
    onTap: tapInto,
  });

  const wrongCount = matches.filter((m) => !m).length;
  const nextRow = calls.findIndex((c) => c.length === null || c.colour === null);

  return (
    <GameShell
      task="Uchta namunani bitta funksiya bilan chizib bering."
      hint={puzzle.hint}
      status={status}
      successText={puzzle.why}
      failText={
        wrongCount === 1
          ? "Bitta chaqiruv namunaga mos kelmadi — belgilangan qatordagi argumentlarni tekshiring."
          : `${wrongCount} chaqiruv namunaga mos kelmadi. Kataklarni sanab, ranglarni solishtiring.`
      }
      footer={
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500 dark:text-[#6d6d74]">
            {calls.filter((c) => c.length !== null && c.colour !== null).length}/
            {puzzle.targets.length} chaqiruv to&apos;ldirildi
          </span>
          <GameReset
            onClick={() => {
              reset();
              setCalls(puzzle.targets.map(() => ({ length: null, colour: null })));
            }}
          />
        </div>
      }
    >
      <div className="mb-3">
        <GameHowTo
          steps={[
            "Pastdagi son blokini ushlab, chaqiruvning birinchi bo'sh joyiga tashlang.",
            "Rang blokini ikkinchi bo'sh joyga tashlang.",
            "Natija namunaga o'xshaganda «Tekshirish» ni bosing.",
          ]}
        />
      </div>

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
          <div className="flex flex-col gap-3.5">
            {puzzle.targets.map((target, i) => {
              const call = calls[i];
              const ok = matches[i];
              const isNext = status === "idle" && i === nextRow;

              return (
                <div
                  key={i}
                  className={`rounded-[14px] border-2 p-3 transition-colors ${
                    status !== "idle"
                      ? ok
                        ? "border-[#26B54F]/60 bg-[#26B54F]/[0.06]"
                        : "border-amber-500 bg-amber-500/[0.06]"
                      : isNext
                      ? "border-[#7C5CE0]/60 bg-[#7C5CE0]/[0.04]"
                      : "border-gray-200 dark:border-[#2b2b31]"
                  }`}
                >
                  {/* Reference strip the call has to reproduce */}
                  <div className="flex items-center gap-2.5 min-h-[24px]">
                    <span className="w-[54px] shrink-0 text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-[#6d6d74]">
                      namuna
                    </span>
                    <div className="flex gap-1 items-center">
                      {Array.from({ length: target.length }).map((_, k) => (
                        <span
                          key={k}
                          style={{ backgroundColor: COLOURS[target.colour].hex }}
                          className="w-5 h-5 rounded-[5px]"
                        />
                      ))}
                    </div>
                  </div>

                  {/* The call the learner assembles */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-[14px] text-gray-800 dark:text-[#e4e4e7]">
                    <span>
                      {puzzle.fnName}
                      {"("}
                    </span>

                    <DropSlot
                      index={i * 2}
                      filled={call.length !== null}
                      active={drag.overSlot === i * 2}
                      className="w-[52px] h-[38px] justify-center"
                    >
                      {call.length !== null ? (
                        <span className="w-full text-center font-mono text-[15px] font-bold text-[#26B54F] dark:text-[#4ADE80]">
                          {call.length}
                        </span>
                      ) : (
                        <span className="w-full text-center text-[11px] text-gray-400 dark:text-[#5c5c64]">
                          son
                        </span>
                      )}
                    </DropSlot>

                    <span>,</span>

                    <DropSlot
                      index={i * 2 + 1}
                      filled={call.colour !== null}
                      active={drag.overSlot === i * 2 + 1}
                      className="w-[74px] h-[38px] justify-center px-1.5"
                    >
                      {call.colour ? (
                        <span className="flex items-center gap-1.5">
                          <span
                            style={{ backgroundColor: COLOURS[call.colour].hex }}
                            className="w-4 h-4 rounded-[5px] shrink-0"
                          />
                          <span className="text-[11.5px] font-sans text-gray-600 dark:text-[#a1a1aa] truncate">
                            {COLOURS[call.colour].label}
                          </span>
                        </span>
                      ) : (
                        <span className="w-full text-center text-[11px] text-gray-400 dark:text-[#5c5c64]">
                          rang
                        </span>
                      )}
                    </DropSlot>

                    <span>)</span>
                  </div>

                  {/* What the call actually produced */}
                  <div className="mt-2.5 flex items-center gap-2.5 min-h-[24px]">
                    <span className="w-[54px] shrink-0 text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-[#6d6d74]">
                      natija
                    </span>
                    <div className="flex gap-1 min-h-[20px] items-center">
                      {call.colour && call.length !== null ? (
                        Array.from({ length: call.length }).map((_, k) => (
                          <span
                            key={k}
                            style={{ backgroundColor: COLOURS[call.colour!].hex }}
                            className="w-5 h-5 rounded-[5px]"
                          />
                        ))
                      ) : (
                        <span className="text-[12px] text-gray-400 dark:text-[#6d6d74]">
                          argument to&apos;liq emas
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

      {/* ── Argument palette ── */}
      <div className="mt-3">
        <GameBoard label="Argumentlar">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-[54px] shrink-0 text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-[#6d6d74]">
                son
              </span>
              {puzzle.lengths.map((value) => (
                <div
                  key={value}
                  {...drag.bind({ kind: "length", value })}
                  title={`${value} — chaqiruvning son joyiga tashlang`}
                  className={`w-[42px] h-[38px] rounded-[10px] border-2 border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] flex items-center justify-center font-mono text-[15px] font-bold text-gray-700 dark:text-[#d4d4d8] hover:border-[#26B54F] hover:text-[#26B54F] transition-colors ${grabClass}`}
                >
                  {value}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="w-[54px] shrink-0 text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-[#6d6d74]">
                rang
              </span>
              {puzzle.palette.map((colour) => (
                <div
                  key={colour}
                  {...drag.bind({ kind: "colour", value: colour })}
                  title={`${COLOURS[colour].label} — chaqiruvning rang joyiga tashlang`}
                  className={`flex items-center gap-1.5 rounded-[10px] border-2 border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] pl-1.5 pr-2.5 h-[38px] hover:border-[#7C5CE0] transition-colors ${grabClass}`}
                >
                  <IconGripVertical
                    size={13}
                    className="shrink-0 text-gray-300 dark:text-[#3f3f46]"
                  />
                  <span
                    style={{ backgroundColor: COLOURS[colour].hex }}
                    className="w-5 h-5 rounded-[6px] shrink-0"
                  />
                  <span className="text-[12px] text-gray-600 dark:text-[#a1a1aa]">
                    {COLOURS[colour].label}
                  </span>
                </div>
              ))}
            </div>
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

      {drag.isDragging && drag.drag && (
        <DragGhost x={drag.drag.x} y={drag.drag.y}>
          {drag.drag.payload.kind === "colour" ? (
            <span
              style={{ backgroundColor: COLOURS[drag.drag.payload.value].hex }}
              className="block w-[38px] h-[38px] rounded-[9px] shadow-lg"
            />
          ) : (
            <span className="flex w-[42px] h-[38px] rounded-[9px] bg-[#26B54F] items-center justify-center font-mono text-[15px] font-bold text-white shadow-lg">
              {drag.drag.payload.value}
            </span>
          )}
        </DragGhost>
      )}
    </GameShell>
  );
}
