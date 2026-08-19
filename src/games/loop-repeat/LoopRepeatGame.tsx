"use client";

import React, { useMemo, useState } from "react";
import { IconMinus, IconPlus, IconRepeat, IconX } from "@tabler/icons-react";
import type { GameProps } from "../types";
import { GameBoard, GameNote, GameReset, GameShell, useGameCheck } from "../shared";
import { pickVariant } from "../shared/seed";

/**
 * Build the pattern with a loop
 * -----------------------------
 * A loop is worth learning the moment the pattern is longer than the program.
 * The learner sees a target strip, writes the shortest body they can, and sets
 * how many times it repeats — so "bir marta yoz, yuz marta ishlat" is something
 * they do rather than read.
 */

type Tile = "g" | "v" | "a" | "b";

const TILES: Record<Tile, { label: string; className: string }> = {
  g: { label: "yashil", className: "bg-[#26B54F]" },
  v: { label: "binafsha", className: "bg-[#7C5CE0]" },
  a: { label: "sariq", className: "bg-[#E0A13C]" },
  b: { label: "ko'k", className: "bg-[#3B82F6]" },
};

interface Puzzle {
  hint: string;
  /** The strip the learner has to reproduce. */
  target: Tile[];
  /** Colours offered for the loop body. */
  palette: Tile[];
  /** Shown on success — names the pattern that made the loop possible. */
  why: string;
}

const PUZZLES: Puzzle[] = [
  {
    hint: "Naqshni kuzatib, takrorlanadigan eng qisqa bo'lakni sikl ichiga yozing.",
    target: ["g", "v", "g", "v", "g", "v", "g", "v"],
    palette: ["g", "v", "a"],
    why: "Takrorlanadigan bo'lak — yashil + binafsha. 8 katak = 4 x 2 katak.",
  },
  {
    hint: "Uch xil rang ketma-ket kelib, yana boshidan takrorlanadi.",
    target: ["g", "a", "b", "g", "a", "b", "g", "a", "b"],
    palette: ["g", "a", "b", "v"],
    why: "Bo'lak uch katakdan iborat, sikl 3 marta aylandi: 3 x 3 = 9 katak.",
  },
  {
    hint: "Eng qisqa bo'lakni toping — bir katakdan iborat bo'lishi ham mumkin.",
    target: ["v", "v", "v", "v", "v"],
    palette: ["v", "g", "a"],
    why: "Bir katak 5 marta takrorlangan. Sikl aynan shu ish uchun yaratilgan.",
  },
  {
    hint: "Ikki katak bir naqsh hosil qiladi, u esa uch marta qaytariladi.",
    target: ["a", "b", "a", "b", "a", "b"],
    palette: ["a", "b", "g"],
    why: "Sariq + ko'k bo'lagi 3 marta takrorlanadi: 3 x 2 = 6 katak.",
  },
];

const MAX_BODY = 4;
const MAX_COUNT = 9;

export function LoopRepeatGame(props: GameProps) {
  const puzzle = useMemo(() => pickVariant(PUZZLES, props.seed), [props.seed]);
  const [body, setBody] = useState<Tile[]>([]);
  const [count, setCount] = useState(1);

  const output = useMemo<Tile[]>(() => {
    const out: Tile[] = [];
    for (let i = 0; i < count; i++) out.push(...body);
    return out;
  }, [body, count]);

  const { status, reset } = useGameCheck(props, {
    ready: body.length > 0,
    check: () =>
      output.length === puzzle.target.length &&
      output.every((tile, i) => tile === puzzle.target[i]),
  });

  const addTile = (tile: Tile) => {
    if (body.length >= MAX_BODY) return;
    reset();
    setBody((prev) => [...prev, tile]);
  };

  const removeAt = (index: number) => {
    reset();
    setBody((prev) => prev.filter((_, i) => i !== index));
  };

  const setCountSafe = (next: number) => {
    reset();
    setCount(Math.max(1, Math.min(MAX_COUNT, next)));
  };

  /** Says what is off — length or colours — instead of just "wrong". */
  const failText =
    output.length !== puzzle.target.length
      ? "Hozir " +
        output.length +
        " katak chiqdi, kerak " +
        puzzle.target.length +
        ". Bo'lak uzunligini yoki takrorlar sonini o'zgartiring."
      : "Kataklar soni to'g'ri, lekin ranglar tartibi mos emas — bo'lakni qayta ko'rib chiqing.";

  return (
    <GameShell
      task="Sikl yordamida yuqoridagi naqshni aynan takrorlang."
      hint={puzzle.hint}
      status={status}
      successText={puzzle.why}
      failText={failText}
      footer={
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500 dark:text-[#6d6d74]">
            {count} x {body.length} = {output.length} katak
          </span>
          <GameReset
            onClick={() => {
              reset();
              setBody([]);
              setCount(1);
            }}
            disabled={body.length === 0 && count === 1}
          />
        </div>
      }
    >
      <GameBoard label="Kerakli naqsh">
        <div className="flex flex-wrap gap-1.5">
          {puzzle.target.map((tile, i) => (
            <span
              key={i}
              title={TILES[tile].label}
              className={`w-8 h-8 rounded-[8px] ${TILES[tile].className}`}
            />
          ))}
        </div>
      </GameBoard>

      <div className="mt-3">
        <GameBoard label="Sikl">
          {/* Counter row — the loop header, written the way code writes it */}
          <div className="flex items-center gap-3">
            <IconRepeat size={17} className="shrink-0 text-[#7C5CE0]" />
            <span className="font-mono text-[13.5px] text-gray-700 dark:text-[#d4d4d8]">
              takrorla
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCountSafe(count - 1)}
                aria-label="Takrorlar sonini kamaytirish"
                className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-[#2b2b31] flex items-center justify-center hover:border-gray-300 dark:hover:border-[#3d3d45] transition-colors cursor-pointer"
              >
                <IconMinus size={14} stroke={2.6} />
              </button>
              <span className="w-9 text-center font-mono text-[16px] font-bold text-[#7C5CE0] dark:text-[#c4b5fd]">
                {count}
              </span>
              <button
                type="button"
                onClick={() => setCountSafe(count + 1)}
                aria-label="Takrorlar sonini oshirish"
                className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-[#2b2b31] flex items-center justify-center hover:border-gray-300 dark:hover:border-[#3d3d45] transition-colors cursor-pointer"
              >
                <IconPlus size={14} stroke={2.6} />
              </button>
            </div>
            <span className="font-mono text-[13.5px] text-gray-700 dark:text-[#d4d4d8]">
              marta:
            </span>
          </div>

          {/* Loop body — indented, like a block inside a loop */}
          <div className="mt-3 ml-6 pl-4 border-l-2 border-[#7C5CE0]/40 flex flex-col gap-2.5">
            <div className="flex flex-wrap gap-1.5 min-h-[34px]">
              {body.length === 0 ? (
                <span className="text-[12.5px] text-gray-400 dark:text-[#6d6d74] self-center">
                  Bo&apos;lak bo&apos;sh — pastdan rang tanlang
                </span>
              ) : (
                body.map((tile, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => removeAt(i)}
                    aria-label={TILES[tile].label + " katakni olib tashlash"}
                    className={`relative w-8 h-8 rounded-[8px] group cursor-pointer ${TILES[tile].className}`}
                  >
                    <span className="absolute inset-0 rounded-[8px] bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                      <IconX
                        size={13}
                        stroke={3}
                        className="opacity-0 group-hover:opacity-100 text-white"
                      />
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {puzzle.palette.map((tile) => (
                <button
                  key={tile}
                  type="button"
                  disabled={body.length >= MAX_BODY}
                  onClick={() => addTile(tile)}
                  className={`w-9 h-9 rounded-[10px] border-2 border-transparent flex items-center justify-center transition-all active:translate-y-[2px] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${TILES[tile].className}`}
                  title={TILES[tile].label + " qo'shish"}
                >
                  <IconPlus size={15} stroke={3} className="text-white/90" />
                </button>
              ))}
            </div>
          </div>
        </GameBoard>
      </div>

      <div className="mt-3">
        <GameBoard label="Natija">
          <div className="flex flex-wrap gap-1.5 min-h-[32px]">
            {output.length === 0 ? (
              <span className="text-[12.5px] text-gray-400 dark:text-[#6d6d74]">
                Sikl hali hech narsa chizmadi
              </span>
            ) : (
              output.map((tile, i) => {
                const matches = puzzle.target[i] === tile;
                return (
                  <span
                    key={i}
                    className={`w-8 h-8 rounded-[8px] ${TILES[tile].className} ${
                      status === "fail" && !matches
                        ? "ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-[#141416]"
                        : ""
                    }`}
                  />
                );
              })
            )}
          </div>
        </GameBoard>
      </div>

      {status === "idle" && body.length >= MAX_BODY && (
        <div className="mt-3">
          <GameNote>
            Bo&apos;lak qanchalik qisqa bo&apos;lsa, sikl shunchalik foydali. Eng kichik
            takrorlanuvchi bo&apos;lakni topishga harakat qiling.
          </GameNote>
        </div>
      )}
    </GameShell>
  );
}
