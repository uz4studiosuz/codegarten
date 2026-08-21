"use client";

import React, { useMemo, useState } from "react";
import { IconBug } from "@tabler/icons-react";
import type { GameProps } from "../types";
import { hasConfig, int, str } from "../config";
import { GameBoard, GameNote, GameShell, pickVariant, useGameCheck } from "../shared";

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
  {
    goal: "Uchburchak chizilishi kerak edi, lekin shakl noto'g'ri chiqdi.",
    hint: "Uchburchakda uchta tomon bo'ladi.",
    lines: ["chiz(80)", "burl(120)", "chiz(80)", "burl(120)", "chiz(80)", "chiz(80)"],
    badIndex: 5,
    why: "Oxirgi chiz(80) ortiqcha — uch tomon allaqachon chizilgan va shakl yopilgan edi.",
  },
  {
    goal: "Ro'yxatdagi har bir sonni ekranga chiqarish kerak edi, lekin faqat bittasi chiqdi.",
    hint: "Chiqarish buyrug'i sikl ichida turishi kerak.",
    lines: ["sonlar = [4, 7, 9]", "har son uchun:", "  hisobla(son)", "chiqar(son)"],
    badIndex: 3,
    why: "chiqar(son) sikldan tashqarida — shuning uchun u faqat bir marta, oxirgi qiymat bilan ishladi.",
  },
  {
    goal: "Foydalanuvchi 18 yoshdan katta bo'lsa ruxsat berilishi kerak edi.",
    hint: "Tenglikni tekshirish va solishtirish — ikki xil amal.",
    lines: ["yosh = 25", "agar yosh = 18:", "  ruxsat_ber()", "aks holda:", "  rad_et()"],
    badIndex: 1,
    why: "Shart faqat aynan 18 yoshni tekshiradi. \"Katta yoki teng\" (>=) kerak edi, aks holda 25 yosh ham rad etiladi.",
  },
  {
    goal: "Kvadratning yuzini hisoblash kerak edi.",
    hint: "Yuza — tomonni tomonga ko'paytirish.",
    lines: ["tomon = 5", "yuza = tomon + tomon", "chiqar(yuza)"],
    badIndex: 1,
    why: "Qo'shish perimetrning yarmini beradi. Yuza uchun ko'paytirish kerak: tomon * tomon.",
  },
  {
    goal: "Robot to'rt marta signal berishi kerak edi, lekin jim qoldi.",
    hint: "Sikl necha marta aylanishini boshlang'ich qiymat belgilaydi.",
    lines: ["son = 4", "toki son > 4:", "  signal()", "  son = son - 1"],
    badIndex: 1,
    why: "son 4 ga teng bo'lgani uchun \"son > 4\" birinchi tekshiruvda yolg'on chiqdi va sikl umuman ishlamadi.",
  },
];

/** Builds the puzzle an author configured in the writer, or null if incomplete. */
function fromConfig(config: unknown): Puzzle | null {
  const raw = config as Record<string, unknown>;

  // Read the lines by hand instead of through `strList`: these programs use
  // leading spaces to show what sits inside a loop or a condition, and trimming
  // them would erase the very structure the bug hides in.
  if (!Array.isArray(raw.lines)) return null;
  const lines = raw.lines.filter(
    (line): line is string => typeof line === "string" && line.trim() !== ""
  );
  if (lines.length < 2) return null;

  // Clamping an out-of-range answer would mark some innocent line as the bug,
  // so a config pointing nowhere falls back to the built-in pool instead.
  const badIndex = int(raw.badIndex);
  if (badIndex === undefined || badIndex < 0 || badIndex >= lines.length) return null;

  return {
    goal: str(raw.goal) ?? "Dastur maqsadiga yetmayapti — sabab bitta qatorda.",
    hint: str(raw.hint) ?? "Har bir qatorni maqsad bilan solishtirib o'qing.",
    lines,
    badIndex,
    why: str(raw.why) ?? "",
  };
}

export function DebugExtraGame(props: GameProps) {
  const { config, seed, variant } = props;

  const puzzle = useMemo(
    () =>
      (hasConfig(config) ? fromConfig(config) : null) ??
      pickVariant(PUZZLES, seed, { ordinal: variant }),
    [config, seed, variant]
  );
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
