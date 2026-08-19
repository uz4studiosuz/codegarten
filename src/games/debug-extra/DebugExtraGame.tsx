"use client";

import React, { useMemo, useState } from "react";
import { IconBug } from "@tabler/icons-react";
import type { GameProps } from "../types";
import { GameBoard, GameNote, GameShell, useGameCheck } from "../shared";
import { pickVariant } from "../shared/seed";

/**
 * Find the broken line
 * --------------------
 * Debugging is a separate skill from writing: the program looks reasonable and
 * still misbehaves. The learner reads a short program against a stated goal and
 * marks the one line that breaks it — then sees why it did.
 */

interface Puzzle {
  goal: string;
  hint: string;
  lines: string[];
  /** Index of the single line that must go. */
  badIndex: number;
  /** Shown after a correct answer — the teaching moment. */
  why: string;
}

const PUZZLES: Puzzle[] = [
  {
    goal: "Robot 3 katak oldinga yurishi kerak edi. Buyruqlar ichida ortiqcha qadam bor.",
    hint: "Har bir qatorni maqsad bilan solishtirib o'qing.",
    lines: ["oldinga()", "oldinga()", "o'ngga_burl()", "oldinga()"],
    badIndex: 2,
    why: "Burilish robotni yo'nalishdan chiqaradi — 3 marta oldinga yurish uchun faqat oldinga() kerak.",
  },
  {
    goal: "Kvadrat chizilishi kerak edi, lekin shakl yopilmayapti.",
    hint: "Kvadratda 4 tomon va 4 burilish bo'ladi.",
    lines: ["chiz(100)", "burl(90)", "chiz(100)", "burl(90)", "chiz(100)", "burl(45)"],
    badIndex: 5,
    why: "Kvadratning har burchagi 90 daraja. 45 daraja burilish shaklni yopmaydi.",
  },
  {
    goal: "Sikl 5 marta ishlashi kerak, lekin dastur to'xtamayapti.",
    hint: "Hisoblagich o'zgarmasa, shart hech qachon yolg'on bo'lmaydi.",
    lines: ["son = 0", "toki son < 5:", "  chiz(son)", "  son = son", "yakun"],
    badIndex: 3,
    why: "son = son qiymatni o'zgartirmaydi, shuning uchun shart doim to'g'ri qoladi — cheksiz sikl.",
  },
  {
    goal: "Ikki o'zgaruvchining qiymati almashishi kerak edi.",
    hint: "Bir qutiga yangi qiymat solinsa, ichidagi eskisi o'chadi.",
    lines: ["a = 5", "b = 9", "a = b", "b = a"],
    badIndex: 2,
    why: "a = b qatoridan keyin 5 raqami hech qayerda qolmaydi — avval vaqtinchalik qutiga saqlash kerak.",
  },
];

export function DebugExtraGame(props: GameProps) {
  const puzzle = useMemo(() => pickVariant(PUZZLES, props.seed), [props.seed]);
  const [picked, setPicked] = useState<number | null>(null);

  const { status, reset } = useGameCheck(props, {
    ready: picked !== null,
    check: () => picked === puzzle.badIndex,
  });

  return (
    <GameShell
      task="Xatoni keltirib chiqaradigan qatorni toping."
      hint={puzzle.hint}
      status={status}
      successText={puzzle.why}
      failText="Bu qator maqsadga zid emas. Dasturni maqsad bilan qatorma-qator solishtiring."
      footer={
        <GameNote>
          <span className="font-semibold">Maqsad:</span> {puzzle.goal}
        </GameNote>
      }
    >
      <GameBoard label="Dastur">
        <div className="flex flex-col gap-2">
          {puzzle.lines.map((line, i) => {
            const isPicked = picked === i;
            const revealCorrect = status === "success" && i === puzzle.badIndex;
            const revealWrongPick = status === "fail" && isPicked;

            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  reset();
                  setPicked(i);
                }}
                className={`flex items-center gap-3 rounded-[12px] border-2 px-3.5 py-3 text-left transition-colors cursor-pointer ${
                  revealCorrect
                    ? "border-[#26B54F] bg-[#26B54F]/10"
                    : revealWrongPick
                    ? "border-amber-500 bg-amber-500/10"
                    : isPicked
                    ? "border-[#A78BFA] bg-[#A78BFA]/10"
                    : "border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] hover:border-gray-300 dark:hover:border-[#3d3d45]"
                }`}
              >
                <span className="w-4 shrink-0 text-right font-mono text-[12.5px] text-gray-400 dark:text-[#5c5c64]">
                  {i + 1}
                </span>
                <span className="font-mono text-[13.5px] sm:text-[14px] whitespace-pre text-gray-800 dark:text-[#e4e4e7] min-w-0 flex-1">
                  {line}
                </span>
                {(isPicked || revealCorrect) && (
                  <IconBug
                    size={17}
                    className={revealCorrect ? "text-[#26B54F]" : "text-[#A78BFA]"}
                  />
                )}
              </button>
            );
          })}
        </div>
      </GameBoard>
    </GameShell>
  );
}
