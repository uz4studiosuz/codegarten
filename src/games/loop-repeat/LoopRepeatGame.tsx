"use client";

import React, { useMemo, useState } from "react";
import { IconGripVertical, IconRepeat, IconX } from "@tabler/icons-react";
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
 * Build the pattern with a loop
 * -----------------------------
 * A loop is worth learning the moment the pattern is longer than the program.
 * The learner drags colours into the loop body and says how many times it
 * repeats, so "bir marta yoz, yuz marta ishlat" is something they do.
 *
 * Two things came out of watching children use the first version: a palette of
 * "+" buttons did not read as something to press, so the colours are now blocks
 * that get dragged into visible empty cells; and the result strip updating live
 * turned the puzzle into fiddling until the shapes matched, so the result stays
 * hidden until they commit to an answer.
 */

type Tile = "g" | "v" | "a" | "b";

const TILES: Record<Tile, { label: string; hex: string }> = {
  g: { label: "yashil", hex: "#26B54F" },
  v: { label: "binafsha", hex: "#7C5CE0" },
  a: { label: "sariq", hex: "#E0A13C" },
  b: { label: "ko'k", hex: "#3B82F6" },
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
  {
    hint: "Bo'lak uzunligini ham, takrorlar sonini ham o'zingiz tanlaysiz.",
    target: ["b", "b", "g", "b", "b", "g"],
    palette: ["b", "g", "v"],
    why: "Bo'lak uch katak: ko'k, ko'k, yashil. U ikki marta takrorlanib 6 katak berdi.",
  },
  {
    hint: "To'rtta rang ketma-ket kelib, ikki marta qaytariladi.",
    target: ["g", "v", "a", "b", "g", "v", "a", "b"],
    palette: ["g", "v", "a", "b"],
    why: "To'rt katakli bo'lak 2 marta aylandi: 4 x 2 = 8 katak.",
  },
  {
    hint: "Naqsh qisqa — lekin necha marta takrorlanganini sanashga to'g'ri keladi.",
    target: ["a", "g", "a", "g", "a", "g", "a", "g", "a", "g"],
    palette: ["a", "g", "b"],
    why: "Sariq + yashil bo'lagi 5 marta takrorlanadi: 5 x 2 = 10 katak.",
  },
  {
    hint: "Bir xil rangli uzun zanjir ham sikl bilan yasaladi.",
    target: ["b", "b", "b", "b", "b", "b", "b"],
    palette: ["b", "v", "g"],
    why: "Bitta ko'k katak 7 marta takrorlandi — sikl bir qatorlik ishni ham qisqartiradi.",
  },
  {
    hint: "Bo'lak uchta katakdan iborat, lekin ikkitasi bir xil rangda.",
    target: ["v", "v", "a", "v", "v", "a", "v", "v", "a"],
    palette: ["v", "a", "g"],
    why: "Bo'lak — binafsha, binafsha, sariq. U 3 marta takrorlanib 9 katak berdi.",
  },
  {
    hint: "Naqsh to'rt katakdan iborat va uch marta qaytariladi.",
    target: ["g", "b", "b", "g", "g", "b", "b", "g", "g", "b", "b", "g"],
    palette: ["g", "b", "a"],
    why: "To'rt katakli bo'lak 3 marta aylandi: 4 x 3 = 12 katak. Naqsh uzun bo'lgani bilan sikl qisqa qoldi.",
  },
];

const MAX_BODY = 4;
const MAX_COUNT = 10;

export function LoopRepeatGame(props: GameProps) {
  const puzzle = useMemo(
    () => pickVariant(PUZZLES, props.seed, { ordinal: props.variant }),
    [props.seed, props.variant]
  );

  const [body, setBody] = useState<Tile[]>([]);
  const [count, setCount] = useState<number | null>(null);

  const output = useMemo<Tile[]>(() => {
    const out: Tile[] = [];
    for (let i = 0; i < (count ?? 0); i++) out.push(...body);
    return out;
  }, [body, count]);

  const { status, reset } = useGameCheck(props, {
    ready: body.length > 0 && count !== null,
    check: () =>
      output.length === puzzle.target.length &&
      output.every((tile, i) => tile === puzzle.target[i]),
  });

  // ── Body edits ──────────────────────────────────────────────────────────

  const drop = (tile: Tile, slot: number, from?: number) => {
    reset();
    setBody((prev) => {
      const next = [...prev];
      if (from !== undefined) {
        if (slot >= next.length) {
          // Dragged onto the trailing placeholder: move it to the end.
          next.splice(from, 1);
          next.push(tile);
        } else {
          [next[from], next[slot]] = [next[slot], next[from]];
        }
        return next;
      }
      if (slot >= next.length) {
        return next.length >= MAX_BODY ? next : [...next, tile];
      }
      next[slot] = tile;
      return next;
    });
  };

  const append = (tile: Tile, from?: number) => {
    if (from !== undefined) return;
    reset();
    setBody((prev) => (prev.length >= MAX_BODY ? prev : [...prev, tile]));
  };

  const removeAt = (index: number) => {
    reset();
    setBody((prev) => prev.filter((_, i) => i !== index));
  };

  const drag = useBlockDrag<Tile>({
    onDrop: drop,
    onDropOutside: (_tile, from) => {
      if (from !== undefined) removeAt(from);
    },
    onTap: append,
  });

  const pickCount = (value: number) => {
    reset();
    setCount(value);
  };

  /** Says what is off — length or colours — without showing the answer. */
  const failText =
    output.length !== puzzle.target.length
      ? `Sizning siklingiz ${output.length} katak chizdi, kerak ${puzzle.target.length}. Bo'lak uzunligini yoki takrorlar sonini o'zgartiring.`
      : "Kataklar soni to'g'ri, lekin ranglar tartibi mos emas — bo'lak ichidagi tartibni qayta ko'rib chiqing.";

  const revealed = status !== "idle";

  return (
    <GameShell
      task="Sikl yordamida yuqoridagi naqshni aynan takrorlang."
      hint={puzzle.hint}
      status={status}
      successText={puzzle.why}
      failText={failText}
      footer={
        <div className="flex items-center justify-between">
          <span className="font-mono text-[12px] text-gray-500 dark:text-[#6d6d74]">
            {count ?? "?"} x {body.length} ={" "}
            {count === null ? "?" : output.length} katak
          </span>
          <GameReset
            onClick={() => {
              reset();
              setBody([]);
              setCount(null);
            }}
            disabled={body.length === 0 && count === null}
          />
        </div>
      }
    >
      <div className="mb-3">
        <GameHowTo
          steps={[
            "Pastdagi rangli blokni ushlab, sikl ichidagi bo'sh katakka tashlang.",
            "Sikl necha marta aylanishini tanlang.",
            "«Tekshirish» ni bosing — natija shundan keyin ko'rinadi.",
          ]}
        />
      </div>

      <GameBoard label="Kerakli naqsh">
        <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
          {puzzle.target.map((tile, i) => (
            <span
              key={i}
              title={TILES[tile].label}
              style={{ backgroundColor: TILES[tile].hex }}
              className="w-8 h-8 rounded-[8px]"
            />
          ))}
          <span className="ml-1.5 font-mono text-[12px] text-gray-400 dark:text-[#6d6d74]">
            {puzzle.target.length} katak
          </span>
        </div>
      </GameBoard>

      <div className="mt-3">
        <GameBoard label="Sikl">
          {/* Loop header — the repeat count, chosen in one tap */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <IconRepeat size={17} className="shrink-0 text-[#7C5CE0]" />
            <span className="font-mono text-[13.5px] text-gray-700 dark:text-[#d4d4d8]">
              takrorla
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: MAX_COUNT }).map((_, i) => {
                const value = i + 1;
                const active = count === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => pickCount(value)}
                    aria-pressed={active}
                    className={`w-8 h-8 rounded-[9px] border-2 font-mono text-[13px] font-bold transition-colors cursor-pointer ${
                      active
                        ? "border-[#7C5CE0] bg-[#7C5CE0] text-white"
                        : "border-gray-200 dark:border-[#2b2b31] text-gray-500 dark:text-[#8b8b93] hover:border-[#7C5CE0] hover:text-[#7C5CE0]"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            <span className="font-mono text-[13.5px] text-gray-700 dark:text-[#d4d4d8]">
              marta:
            </span>
          </div>

          {/* Loop body — indented, like a block inside a loop */}
          <div className="mt-3.5 ml-5 pl-4 border-l-2 border-[#7C5CE0]/40 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {body.map((tile, i) => (
                <DropSlot
                  key={i}
                  index={i}
                  filled
                  active={drag.overSlot === i}
                  className="w-[46px] h-[46px] justify-center"
                >
                  <div
                    {...drag.bind(tile, i)}
                    style={{ backgroundColor: TILES[tile].hex }}
                    title={TILES[tile].label}
                    className={`relative w-[42px] h-[42px] rounded-[9px] group ${grabClass}`}
                  >
                    <button
                      type="button"
                      data-no-drag
                      onClick={() => removeAt(i)}
                      aria-label={`${TILES[tile].label} katakni olib tashlash`}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-900/80 dark:bg-black/70 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                    >
                      <IconX size={11} stroke={3} />
                    </button>
                  </div>
                </DropSlot>
              ))}

              {body.length < MAX_BODY && (
                <DropSlot
                  index={body.length}
                  active={drag.overSlot === body.length}
                  className="w-[46px] h-[46px] justify-center"
                >
                  <span className="text-[11px] font-mono text-gray-400 dark:text-[#5c5c64]">
                    bu&nbsp;yerga
                  </span>
                </DropSlot>
              )}

              {body.length === 0 && (
                <span className="text-[12.5px] text-gray-400 dark:text-[#6d6d74]">
                  Bo&apos;lak bo&apos;sh
                </span>
              )}
            </div>
          </div>
        </GameBoard>
      </div>

      {/* ── Palette ── */}
      <div className="mt-3">
        <GameBoard label="Ranglar" className="flex flex-wrap gap-2.5">
          {puzzle.palette.map((tile) => (
            <div
              key={tile}
              {...drag.bind(tile)}
              title={`${TILES[tile].label} — ushlab sikl ichiga tashlang`}
              className={`flex items-center gap-2 rounded-[12px] border-2 border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] pl-2 pr-3 py-2 ${grabClass} ${
                body.length >= MAX_BODY ? "opacity-40" : ""
              }`}
            >
              <IconGripVertical
                size={14}
                className="shrink-0 text-gray-300 dark:text-[#3f3f46]"
              />
              <span
                style={{ backgroundColor: TILES[tile].hex }}
                className="w-6 h-6 rounded-[7px] shrink-0"
              />
              <span className="text-[12.5px] font-medium text-gray-600 dark:text-[#a1a1aa]">
                {TILES[tile].label}
              </span>
            </div>
          ))}
        </GameBoard>
      </div>

      {/* Result stays hidden until the learner commits — otherwise the puzzle
          turns into nudging blocks until the two strips look the same. */}
      {revealed && (
        <div className="mt-3">
          <GameBoard label="Sikl nima chizdi">
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {output.map((tile, i) => (
                <span
                  key={i}
                  style={{ backgroundColor: TILES[tile].hex }}
                  className={`w-8 h-8 rounded-[8px] ${
                    status === "fail" && puzzle.target[i] !== tile
                      ? "ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-[#141416]"
                      : ""
                  }`}
                />
              ))}
            </div>
          </GameBoard>
        </div>
      )}

      {!revealed && body.length >= MAX_BODY && (
        <div className="mt-3">
          <GameNote>
            Bo&apos;lak qanchalik qisqa bo&apos;lsa, sikl shunchalik foydali. Eng kichik
            takrorlanuvchi bo&apos;lakni topishga harakat qiling.
          </GameNote>
        </div>
      )}

      {drag.isDragging && drag.drag && (
        <DragGhost x={drag.drag.x} y={drag.drag.y}>
          <span
            style={{ backgroundColor: TILES[drag.drag.payload].hex }}
            className="block w-[42px] h-[42px] rounded-[9px] shadow-lg"
          />
        </DragGhost>
      )}
    </GameShell>
  );
}
