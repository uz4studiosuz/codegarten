"use client";

import React, { useMemo, useState } from "react";
import { IconMinus, IconPlus, IconSearch } from "@tabler/icons-react";
import type { GameProps } from "../types";
import { GameBoard, GameNote, GameShell, pickVariant, useGameCheck } from "../shared";
import { enumValue, hasConfig, num, numList, str } from "../config";

/**
 * Count the steps
 * ---------------
 * Efficiency only becomes real when a learner counts the work themselves. They
 * predict how many checks a strategy needs on a concrete list; after answering,
 * the board replays the exact cells the algorithm looked at, in order, so the
 * number stops being abstract.
 */

type Strategy = "linear" | "binary";

interface Puzzle {
  strategy: Strategy;
  items: number[];
  target: number;
  hint: string;
  why: string;
}

const PUZZLES: Puzzle[] = [
  {
    strategy: "linear",
    items: [3, 8, 12, 17, 21, 30, 41, 55],
    target: 21,
    hint: "Chiziqli qidiruv birinchi elementdan boshlab birma-bir tekshiradi.",
    why:
      "Chiziqli qidiruv 5-o'rindagi elementga yetish uchun 5 marta tekshirdi. Ro'yxat 2 barobar uzaysa, qadam ham 2 barobar oshadi — bu O(N).",
  },
  {
    strategy: "binary",
    items: [3, 8, 12, 17, 21, 30, 41, 55],
    target: 21,
    hint: "Binary search har qadamda ro'yxatning o'rtasiga qaraydi va yarmini tashlab yuboradi.",
    why:
      "Har tekshiruv qolgan variantlar sonini yarmiga qisqartirdi: 8 → 4 → 2 → 1. Shuning uchun qadam soni O(log N).",
  },
  {
    strategy: "binary",
    items: [1, 4, 6, 9, 13, 18, 22, 27, 31, 40, 44, 51, 58, 60, 71, 88],
    target: 58,
    hint: "16 element bor. Har qadam nechta variantni yo'q qiladi?",
    why:
      "16 elementli ro'yxatda binary search 4 qadamdan oshmaydi: 16 → 8 → 4 → 2 → 1. Chiziqli qidiruvda esa 13 qadam ketardi.",
  },
  {
    strategy: "linear",
    items: [5, 9, 14, 20, 26, 33],
    target: 33,
    hint: "Eng yomon holat — kerakli element eng oxirida turganda.",
    why:
      "Element oxirida bo'lsa, chiziqli qidiruv butun ro'yxatni ko'rib chiqadi — 6 elementga 6 qadam. Bu O(N) ning eng yomon holati.",
  },
  {
    strategy: "linear",
    items: [2, 6, 11, 15, 19, 24, 28],
    target: 6,
    hint: "Eng yaxshi holat — kerakli element boshida turganda.",
    why:
      "Element boshida bo'lsa, chiziqli qidiruv 2 qadamda topadi. O(N) — bu eng yomon holat bahosi, har doimgi qadam soni emas.",
  },
  {
    strategy: "binary",
    items: [3, 7, 10, 14, 18, 23, 29, 35],
    target: 14,
    hint: "8 element bor. O'rtadagi katak birinchi tekshiriladi.",
    why:
      "Birinchi tekshiruv o'rtaga tushdi va darrov topdi. Binary search ba'zan omadli bo'ladi, lekin kafolati 3 qadam: 8 → 4 → 2 → 1.",
  },
  {
    strategy: "binary",
    items: [1, 2, 5, 8, 12, 16, 20, 25, 30, 36, 42, 49],
    target: 1,
    hint: "Kerakli element eng chapda — binary search esa o'rtadan boshlaydi.",
    why:
      "Chetdagi elementga yetish uchun binary search har qadamda yarmini tashlab bordi. Chetda turishi ham qadam sonini ko'paytirmaydi — u faqat log N ga bog'liq.",
  },
  {
    strategy: "linear",
    items: [8, 13, 17, 22],
    target: 17,
    hint: "Qisqa ro'yxatda ham qadamlarni sanash mumkin.",
    why:
      "Qisqa ro'yxatda chiziqli qidiruv ham tez ishlaydi — 4 elementga ko'pi bilan 4 qadam. Farq ro'yxat uzayganda seziladi.",
  },
];

/** Builds the puzzle an author configured in the writer, or null if incomplete. */
function fromConfig(config: unknown): Puzzle | null {
  if (!hasConfig(config)) return null;

  const strategy = enumValue(config.strategy, ["linear", "binary"] as const);
  const items = numList(config.items);
  const target = num(config.target);
  if (!strategy || !items || items.length < 2 || target === undefined) return null;
  // The whole answer is the step count, and the count only means something if
  // the search actually ends on the target.
  if (!items.includes(target)) return null;

  // Binary search reads a list as sorted. An author typing the values out of
  // order meant this list, not an unsolvable one.
  const list = strategy === "binary" ? [...items].sort((a, b) => a - b) : items;

  return {
    strategy,
    items: list,
    target,
    hint:
      str(config.hint) ??
      (strategy === "binary"
        ? "Binary search har qadamda ro'yxatning o'rtasiga qaraydi va yarmini tashlab yuboradi."
        : "Chiziqli qidiruv birinchi elementdan boshlab birma-bir tekshiradi."),
    why:
      str(config.why) ??
      (strategy === "binary"
        ? "Har tekshiruv qolgan variantlar sonini yarmiga qisqartiradi — shuning uchun qadam soni O(log N)."
        : "Chiziqli qidiruv elementlarni birma-bir ko'rdi. Ro'yxat uzaysa, qadam ham shuncha ko'payadi — bu O(N)."),
  };
}

/** The cells the strategy actually inspects, in order. */
function visitOrder(puzzle: Puzzle): number[] {
  const visits: number[] = [];

  if (puzzle.strategy === "linear") {
    for (let i = 0; i < puzzle.items.length; i++) {
      visits.push(i);
      if (puzzle.items[i] === puzzle.target) break;
    }
    return visits;
  }

  let low = 0;
  let high = puzzle.items.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    visits.push(mid);
    if (puzzle.items[mid] === puzzle.target) break;
    if (puzzle.items[mid] < puzzle.target) low = mid + 1;
    else high = mid - 1;
  }
  return visits;
}

const STRATEGY_LABELS: Record<Strategy, string> = {
  linear: "Chiziqli qidiruv",
  binary: "Binary search",
};

export function AlgoRaceGame(props: GameProps) {
  const { config, seed, context, variant } = props;
  /**
   * A lesson about binary search must not be handed the linear-search puzzle, so
   * the lesson's own title picks the strategy when it names one.
   */
  const puzzle = useMemo(() => {
    const title = context ?? "";
    const wanted: Strategy | undefined = /binary|ikkil/.test(title)
      ? "binary"
      : /chiziqli|linear/.test(title)
      ? "linear"
      : undefined;
    return (
      (hasConfig(config) ? fromConfig(config) : null) ??
      pickVariant(PUZZLES, seed, {
        prefer: wanted ? (p) => p.strategy === wanted : undefined,
        ordinal: variant,
      })
    );
  }, [config, seed, context, variant]);
  const visits = useMemo(() => visitOrder(puzzle), [puzzle]);

  const [guess, setGuess] = useState(1);
  const [touched, setTouched] = useState(false);

  const { status, reset } = useGameCheck(props, {
    ready: touched,
    check: () => guess === visits.length,
  });

  const bump = (delta: number) => {
    reset();
    setTouched(true);
    setGuess((prev) => Math.max(1, Math.min(puzzle.items.length, prev + delta)));
  };

  // The replay is what makes the number concrete, so it is the reward for
  // getting the number right — showing it after a wrong guess would hand over
  // the answer and leave nothing to work out on the next attempt.
  const revealed = status === "success";
  const visitIndexOf = (index: number) => visits.indexOf(index);

  return (
    <GameShell
      task={STRATEGY_LABELS[puzzle.strategy] + " nechta tekshiruvda " + puzzle.target + " ni topadi?"}
      hint={puzzle.hint}
      status={status}
      successText={puzzle.why}
      failText={
        guess < visits.length
          ? "Bundan ko'proq tekshiruv kerak bo'ldi. Algoritm qaysi katakdan boshlashini o'ylab, qadamlarni barmoq bilan sanab chiqing."
          : "Algoritm bundan kamroq tekshiruvda topdi. Har qadam nechta variantni chetga surib qo'yishini hisobga oling."
      }
      footer={
        revealed ? (
          <GameNote>
            Algoritm {visits.length} marta tekshirdi. Kataklardagi raqamlar — tekshiruv
            tartibi.
          </GameNote>
        ) : undefined
      }
    >
      <GameBoard label={"Ro'yxat (" + puzzle.items.length + " element)"}>
        <div className="flex flex-wrap gap-2">
          {puzzle.items.map((value, index) => {
            const order = revealed ? visitIndexOf(index) : -1;
            const isVisited = order !== -1;
            const isTarget = value === puzzle.target;

            return (
              <div key={index} className="relative">
                <div
                  className={`w-11 h-11 rounded-[10px] border-2 flex items-center justify-center font-mono text-[13.5px] font-bold transition-colors ${
                    revealed && isTarget
                      ? "border-[#26B54F] bg-[#26B54F]/15 text-[#177F37] dark:text-[#4ADE80]"
                      : isVisited
                      ? "border-[#7C5CE0] bg-[#7C5CE0]/10 text-[#7C5CE0] dark:text-[#c4b5fd]"
                      : "border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] text-gray-500 dark:text-[#8b8b93]"
                  }`}
                >
                  {value}
                </div>
                {isVisited && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#7C5CE0] text-white text-[10.5px] font-bold flex items-center justify-center">
                    {order + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 text-[13px] text-gray-500 dark:text-[#8b8b93]">
          <IconSearch size={15} className="text-[#E0A13C]" />
          Qidirilayotgan qiymat:{" "}
          <span className="font-mono font-bold text-gray-800 dark:text-white">
            {puzzle.target}
          </span>
        </div>
      </GameBoard>

      <div className="mt-3">
        <GameBoard label="Sizning taxminingiz">
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => bump(-1)}
              aria-label="Kamaytirish"
              className="w-9 h-9 rounded-full border-2 border-gray-200 dark:border-[#2b2b31] flex items-center justify-center hover:border-gray-300 dark:hover:border-[#3d3d45] transition-colors cursor-pointer"
            >
              <IconMinus size={15} stroke={2.6} />
            </button>
            <div className="flex flex-col items-center">
              <span className="font-mono text-[28px] font-extrabold leading-none text-gray-900 dark:text-white">
                {guess}
              </span>
              <span className="mt-1 text-[11px] font-mono uppercase tracking-wider text-gray-400 dark:text-[#6d6d74]">
                tekshiruv
              </span>
            </div>
            <button
              type="button"
              onClick={() => bump(1)}
              aria-label="Oshirish"
              className="w-9 h-9 rounded-full border-2 border-gray-200 dark:border-[#2b2b31] flex items-center justify-center hover:border-gray-300 dark:hover:border-[#3d3d45] transition-colors cursor-pointer"
            >
              <IconPlus size={15} stroke={2.6} />
            </button>
          </div>
        </GameBoard>
      </div>
    </GameShell>
  );
}
