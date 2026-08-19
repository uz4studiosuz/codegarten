"use client";

import React, { useMemo, useState } from "react";
import { IconGripVertical, IconX } from "@tabler/icons-react";
import type { GameProps } from "../types";
import {
  DragGhost,
  DropSlot,
  GameBoard,
  GameHowTo,
  GameReset,
  GameShell,
  grabClass,
  pickVariant,
  seededShuffle,
  useBlockDrag,
  useGameCheck,
} from "../shared";

/**
 * Order the steps
 * ---------------
 * The sequencing skill in its purest form: a computer runs steps in the order
 * they are written, so a correct set of steps in the wrong order still fails.
 *
 * Steps are dragged into the program and can be dragged between rows to swap
 * them — reordering is the whole point of the exercise, and doing it by removing
 * and re-adding made that invisible. Tapping still works for whoever tries it.
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
      "5 daqiqa kutib tur",
      "piyolaga quy",
    ],
  },
  {
    task: "Robot eshikdan chiqishi uchun qadamlarni tartibga soling.",
    hint: "Har bir buyruq oldingisining natijasiga tayanadi.",
    steps: ["eshik oldiga bor", "eshikni och", "oldinga yur", "eshikni yop"],
  },
  {
    task: "Kompyuterga rasm chizishni o'rgatish tartibini tuzing.",
    hint: "Avval tayyorgarlik, keyin chizish, oxirida saqlash.",
    steps: ["qalamni tanla", "rangni tanla", "chiziq chiz", "rasmni saqla"],
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
  {
    task: "Non yopish algoritmini tartibga soling.",
    hint: "Xamir tayyor bo'lmasa, tandirga solib bo'lmaydi.",
    steps: ["unni elab ol", "xamir qor", "xamirni tindir", "tandirga sol", "nonni ol"],
  },
  {
    task: "Velosipedda yo'lga chiqish qadamlarini joylang.",
    hint: "Xavfsizlik qadamlari yurishdan oldin keladi.",
    steps: ["shlemni kiy", "shinani tekshir", "velosipedga min", "pedalni bos"],
  },
  {
    task: "Fayl saqlash algoritmini to'g'ri tartibda tuzing.",
    hint: "Papka tanlanmasa, fayl qayerga saqlanishi noaniq.",
    steps: [
      "faylni tahrirla",
      "saqlash tugmasini bos",
      "papkani tanla",
      "nom ber",
      "tasdiqla",
    ],
  },
  {
    task: "Kalkulyatorda ikki sonni qo'shish tartibini tuzing.",
    hint: "Amal belgisi ikki sonning orasida turadi.",
    steps: [
      "birinchi sonni kirit",
      "qo'shish belgisini bos",
      "ikkinchi sonni kirit",
      "natijani ko'r",
    ],
  },
];

export function SequenceOrderGame(props: GameProps) {
  const puzzle = useMemo(
    () => pickVariant(PUZZLES, props.seed, { ordinal: props.variant }),
    [props.seed, props.variant]
  );

  /** The steps as offered, shuffled out of their correct order. */
  const pool = useMemo(
    () => seededShuffle(puzzle.steps, `${props.seed ?? ""}-pool`),
    [puzzle, props.seed]
  );

  /**
   * One entry per program row, holding an index into `pool`. Fixed-length rather
   * than a compact list, because a drag has to be able to target row 4 while
   * rows 2 and 3 are still empty.
   */
  const [slots, setSlots] = useState<(number | null)[]>(() =>
    Array(puzzle.steps.length).fill(null)
  );

  const placedCount = slots.filter((s) => s !== null).length;

  const { status, reset } = useGameCheck(props, {
    ready: placedCount === puzzle.steps.length,
    check: () =>
      slots.every(
        (poolIndex, i) => poolIndex !== null && pool[poolIndex] === puzzle.steps[i]
      ),
  });

  const place = (poolIndex: number, slot: number, from?: number) => {
    reset();
    setSlots((prev) => {
      const next = [...prev];
      if (from !== undefined) {
        // Moving between rows swaps whatever was there, so nothing is lost.
        next[from] = next[slot];
        next[slot] = poolIndex;
      } else {
        // Coming from the palette: if it already sits somewhere, move it.
        const existing = next.indexOf(poolIndex);
        if (existing !== -1) next[existing] = null;
        next[slot] = poolIndex;
      }
      return next;
    });
  };

  const appendFirstFree = (poolIndex: number, from?: number) => {
    if (from !== undefined) return; // a tap on a placed block does nothing
    const free = slots.indexOf(null);
    if (free === -1) return;
    place(poolIndex, free);
  };

  const clearSlot = (slot: number) => {
    reset();
    setSlots((prev) => prev.map((value, i) => (i === slot ? null : value)));
  };

  const drag = useBlockDrag<number>({
    onDrop: place,
    onDropOutside: (_poolIndex, from) => {
      if (from !== undefined) clearSlot(from);
    },
    onTap: appendFirstFree,
  });

  /** After a wrong run, point at the first row that is out of place. */
  const firstWrong = slots.findIndex(
    (poolIndex, i) => poolIndex === null || pool[poolIndex] !== puzzle.steps[i]
  );

  return (
    <GameShell
      task={puzzle.task}
      hint={puzzle.hint}
      status={status}
      successText="To'g'ri! Qadamlar shu tartibda bajarilsa, natija chiqadi."
      failText={
        firstWrong === -1
          ? "Hali barcha qadamlar joylashtirilmagan."
          : `${firstWrong + 1}-qator noto'g'ri. Shu qatordan boshlab qayta o'ylab ko'ring — qadamni ushlab boshqa qatorga tashlasa, joyi almashadi.`
      }
      footer={
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500 dark:text-[#6d6d74]">
            {placedCount}/{puzzle.steps.length} qadam terildi
          </span>
          <GameReset
            onClick={() => {
              reset();
              setSlots(Array(puzzle.steps.length).fill(null));
            }}
            disabled={placedCount === 0}
          />
        </div>
      }
    >
      <div className="mb-3">
        <GameHowTo
          steps={[
            "Pastdagi qadamni ushlab, yuqoridagi bo'sh qatorga tashlang.",
            "Qatordagi qadamni boshqa qatorga tashlasangiz, ikkisi joy almashadi.",
          ]}
        />
      </div>

      <GameBoard label="Dastur">
        <div className="flex flex-col gap-2">
          {slots.map((poolIndex, row) => {
            const filled = poolIndex !== null;
            const isWrong =
              status === "fail" && filled && pool[poolIndex] !== puzzle.steps[row];
            const isRight = status === "success";

            return (
              <div key={row} className="flex items-center gap-2.5">
                <span className="w-4 shrink-0 text-right font-mono text-[12.5px] text-gray-400 dark:text-[#5c5c64]">
                  {row + 1}
                </span>

                <DropSlot
                  index={row}
                  active={drag.overSlot === row}
                  filled={filled}
                  className="flex-1 min-w-0"
                >
                  {poolIndex !== null && (
                    <div
                      {...drag.bind(poolIndex, row)}
                      className={`w-full flex items-center gap-2 rounded-[10px] border-2 px-3 py-2.5 ${grabClass} ${
                        isRight
                          ? "border-[#26B54F] bg-[#26B54F]/10"
                          : isWrong
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-[#7C5CE0]/60 bg-[#7C5CE0]/[0.08]"
                      }`}
                    >
                      <IconGripVertical
                        size={15}
                        className="shrink-0 text-gray-400 dark:text-[#5c5c64]"
                      />
                      <span className="font-mono text-[13.5px] min-w-0 flex-1 truncate text-gray-800 dark:text-[#e4e4e7]">
                        {pool[poolIndex]}
                      </span>
                      <button
                        type="button"
                        data-no-drag
                        onClick={() => clearSlot(row)}
                        aria-label="Qadamni olib tashlash"
                        className="shrink-0 w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <IconX size={12} stroke={3} />
                      </button>
                    </div>
                  )}
                </DropSlot>
              </div>
            );
          })}
        </div>
      </GameBoard>

      <div className="mt-3">
        <GameBoard label="Qadamlar" className="flex flex-wrap gap-2">
          {pool.map((step, i) =>
            slots.includes(i) ? (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-[12px] border-2 border-dashed border-gray-200 dark:border-[#232327] px-3 py-2 font-mono text-[13px] text-gray-300 dark:text-[#3f3f46]"
              >
                {step}
              </span>
            ) : (
              <div
                key={i}
                {...drag.bind(i)}
                className={`inline-flex items-center gap-1.5 rounded-[12px] border-2 border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] px-3 py-2 font-mono text-[13px] text-gray-700 dark:text-[#d4d4d8] hover:border-[#7C5CE0] hover:text-[#7C5CE0] transition-colors ${grabClass}`}
              >
                <IconGripVertical
                  size={14}
                  className="shrink-0 text-gray-400 dark:text-[#5c5c64]"
                />
                {step}
              </div>
            )
          )}
        </GameBoard>
      </div>

      {drag.isDragging && drag.drag && (
        <DragGhost x={drag.drag.x} y={drag.drag.y}>
          <div className="rounded-[12px] bg-[#7C5CE0] px-3 py-2 font-mono text-[13px] font-bold text-white shadow-lg">
            {pool[drag.drag.payload]}
          </div>
        </DragGhost>
      )}
    </GameShell>
  );
}
