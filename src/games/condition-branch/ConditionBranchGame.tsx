"use client";

import React, { useMemo, useState } from "react";
import { IconArrowRight, IconCheck, IconX } from "@tabler/icons-react";
import type { GameProps } from "../types";
import { GameBoard, GameNote, GameShell, useGameCheck } from "../shared";
import { pickVariant } from "../shared/seed";

/**
 * Build the decision rule
 * -----------------------
 * A conditional is only understood once the learner watches one rule handle
 * several different situations. They assemble `agar <shart> ... aks holda ...`
 * and the board runs it against every case at once, so a rule that happens to
 * fit one situation but breaks another is visibly wrong.
 *
 * Checking is by simulation, not by comparing to one authored answer: an
 * inverted condition with swapped branches is also correct, and is accepted.
 */

type Facts = Record<string, number | boolean>;

interface Condition {
  id: string;
  label: string;
  test: (facts: Facts) => boolean;
}

interface Case {
  /** How the situation reads to a learner. */
  label: string;
  facts: Facts;
  /** Which action id this situation must produce. */
  expected: string;
}

interface Puzzle {
  scenario: string;
  hint: string;
  conditions: Condition[];
  actions: { id: string; label: string }[];
  cases: Case[];
  why: string;
}

const PUZZLES: Puzzle[] = [
  {
    scenario:
      "Robot yo'lda ketmoqda. Old tomonda to'siq bo'lsa aylanib o'tishi, bo'lmasa oldinga yurishi kerak.",
    hint: "Bitta qoida to'rt holatda ham to'g'ri ishlashi shart.",
    conditions: [
      { id: "obstacle", label: "to'siq_bormi()", test: (f) => Boolean(f.obstacle) },
      { id: "coin", label: "tanga_bormi()", test: (f) => Boolean(f.coin) },
      { id: "noObstacle", label: "to'siq_yo'qmi()", test: (f) => !f.obstacle },
    ],
    actions: [
      { id: "around", label: "aylanib_o't()" },
      { id: "forward", label: "oldinga()" },
      { id: "stop", label: "to'xta()" },
    ],
    cases: [
      { label: "Oldinda to'siq bor", facts: { obstacle: true, coin: false }, expected: "around" },
      { label: "Yo'l bo'sh", facts: { obstacle: false, coin: false }, expected: "forward" },
      { label: "To'siq bor, yonida tanga", facts: { obstacle: true, coin: true }, expected: "around" },
      { label: "Yo'l bo'sh, tanga bor", facts: { obstacle: false, coin: true }, expected: "forward" },
    ],
    why:
      "Qoida faqat to'siqqa qaraydi — tanga qarorga ta'sir qilmaydi. Shuning uchun bitta shart to'rt holatni ham hal qiladi.",
  },
  {
    scenario:
      "O'quvchi imtihondan 50 va undan yuqori ball olsa o'tadi, aks holda qayta topshiradi.",
    hint: "Chegarani aniq belgilang: 50 balni ham o'tgan hisoblanadi.",
    conditions: [
      { id: "ge50", label: "ball >= 50", test: (f) => Number(f.ball) >= 50 },
      { id: "gt50", label: "ball > 50", test: (f) => Number(f.ball) > 50 },
      { id: "lt50", label: "ball < 50", test: (f) => Number(f.ball) < 50 },
    ],
    actions: [
      { id: "pass", label: "o'tdi()" },
      { id: "retry", label: "qayta_topshiradi()" },
    ],
    cases: [
      { label: "Ball = 82", facts: { ball: 82 }, expected: "pass" },
      { label: "Ball = 50", facts: { ball: 50 }, expected: "pass" },
      { label: "Ball = 49", facts: { ball: 49 }, expected: "retry" },
      { label: "Ball = 12", facts: { ball: 12 }, expected: "retry" },
    ],
    why:
      "\"Katta yoki teng\" (>=) chegaraning o'zini ham qamrab oladi. Faqat \"katta\" (>) bo'lsa, 50 ball noto'g'ri baholanardi.",
  },
  {
    scenario:
      "Chiroq faqat qorong'i bo'lganda va uyda odam bor bo'lganda yonishi kerak.",
    hint: "Ikki shart birga bajarilishi kerak — VA mantiqi.",
    conditions: [
      {
        id: "darkAndHome",
        label: "qorongi VA odam_bor",
        test: (f) => Boolean(f.dark) && Boolean(f.home),
      },
      {
        id: "darkOrHome",
        label: "qorongi YOKI odam_bor",
        test: (f) => Boolean(f.dark) || Boolean(f.home),
      },
      { id: "dark", label: "qorongi", test: (f) => Boolean(f.dark) },
    ],
    actions: [
      { id: "on", label: "chiroqni_yoq()" },
      { id: "off", label: "chiroqni_ochir()" },
    ],
    cases: [
      { label: "Qorong'i, odam bor", facts: { dark: true, home: true }, expected: "on" },
      { label: "Qorong'i, uy bo'sh", facts: { dark: true, home: false }, expected: "off" },
      { label: "Yorug', odam bor", facts: { dark: false, home: true }, expected: "off" },
      { label: "Yorug', uy bo'sh", facts: { dark: false, home: false }, expected: "off" },
    ],
    why:
      "VA mantiqi ikki shart ham to'g'ri bo'lgandagina to'g'ri bo'ladi — shuning uchun chiroq faqat bitta holatda yonadi.",
  },
];

export function ConditionBranchGame(props: GameProps) {
  const puzzle = useMemo(() => pickVariant(PUZZLES, props.seed), [props.seed]);

  const [conditionId, setConditionId] = useState<string | null>(null);
  const [thenId, setThenId] = useState<string | null>(null);
  const [elseId, setElseId] = useState<string | null>(null);

  const complete = Boolean(conditionId && thenId && elseId);
  const condition = puzzle.conditions.find((c) => c.id === conditionId);

  /** Runs the assembled rule over every case. */
  const results = useMemo(() => {
    if (!condition || !thenId || !elseId) return null;
    return puzzle.cases.map((testCase) => {
      const actionId = condition.test(testCase.facts) ? thenId : elseId;
      return { testCase, actionId, ok: actionId === testCase.expected };
    });
  }, [condition, thenId, elseId, puzzle.cases]);

  const { status, reset } = useGameCheck(props, {
    ready: complete,
    check: () => Boolean(results && results.every((r) => r.ok)),
  });

  const pick = (setter: (v: string) => void) => (value: string) => {
    reset();
    setter(value);
  };

  const labelFor = (actionId: string | null) =>
    puzzle.actions.find((a) => a.id === actionId)?.label ?? "...";

  const failCount = results ? results.filter((r) => !r.ok).length : 0;

  return (
    <GameShell
      task="Barcha holatlarda to'g'ri ishlaydigan qoidani tuzing."
      hint={puzzle.hint}
      status={status}
      successText={puzzle.why}
      failText={
        failCount === 1
          ? "Bitta holat qoidaga bo'ysunmadi — pastdagi jadvalda belgilangan qatorga qarang."
          : failCount + " holat noto'g'ri hal bo'ldi. Shartni yoki tarmoqlarni almashtirib ko'ring."
      }
      footer={
        <GameNote>
          <span className="font-semibold">Vaziyat:</span> {puzzle.scenario}
        </GameNote>
      }
    >
      <GameBoard label="Qoida">
        <div className="flex flex-col gap-3">
          {/* agar <shart> */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[13.5px] text-gray-700 dark:text-[#d4d4d8]">
              agar{" "}
              <span
                className={`${
                  conditionId
                    ? "text-[#7C5CE0] dark:text-[#c4b5fd] font-bold"
                    : "text-gray-400 dark:text-[#6d6d74]"
                }`}
              >
                {condition?.label ?? "( shartni tanlang )"}
              </span>{" "}
              bo&apos;lsa:
            </span>
            <div className="flex flex-wrap gap-2">
              {puzzle.conditions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pick(setConditionId)(c.id)}
                  className={`rounded-[10px] border-2 px-3 py-1.5 font-mono text-[12.5px] transition-colors cursor-pointer ${
                    conditionId === c.id
                      ? "border-[#7C5CE0] bg-[#7C5CE0]/10 text-[#7C5CE0] dark:text-[#c4b5fd] font-bold"
                      : "border-gray-200 dark:border-[#2b2b31] text-gray-600 dark:text-[#a1a1aa] hover:border-gray-300 dark:hover:border-[#3d3d45]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* then / else branches, indented like real blocks */}
          {(["then", "else"] as const).map((branch) => {
            const selected = branch === "then" ? thenId : elseId;
            const setter = branch === "then" ? setThenId : setElseId;
            const tone = branch === "then" ? "#26B54F" : "#E0A13C";

            return (
              <div key={branch} className="flex flex-col gap-2">
                <span className="font-mono text-[13.5px] text-gray-700 dark:text-[#d4d4d8]">
                  {branch === "then" ? "→ bajar:" : "aks holda bajar:"}{" "}
                  <span
                    className="font-bold"
                    style={{ color: selected ? tone : undefined }}
                  >
                    {selected ? labelFor(selected) : "( amalni tanlang )"}
                  </span>
                </span>
                <div className="ml-4 pl-3 border-l-2 flex flex-wrap gap-2" style={{ borderColor: tone + "66" }}>
                  {puzzle.actions.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => pick(setter)(a.id)}
                      className={`rounded-[10px] border-2 px-3 py-1.5 font-mono text-[12.5px] transition-colors cursor-pointer ${
                        selected === a.id
                          ? "font-bold"
                          : "border-gray-200 dark:border-[#2b2b31] text-gray-600 dark:text-[#a1a1aa] hover:border-gray-300 dark:hover:border-[#3d3d45]"
                      }`}
                      style={
                        selected === a.id
                          ? { borderColor: tone, color: tone, background: tone + "1A" }
                          : undefined
                      }
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </GameBoard>

      <div className="mt-3">
        <GameBoard label="Sinov holatlari">
          <div className="flex flex-col gap-2">
            {puzzle.cases.map((testCase, i) => {
              const result = results?.[i];
              const showVerdict = status !== "idle" && result;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 sm:gap-3 rounded-[12px] border-2 px-3 py-2.5 transition-colors ${
                    showVerdict
                      ? result!.ok
                        ? "border-[#26B54F]/60 bg-[#26B54F]/[0.07]"
                        : "border-amber-500 bg-amber-500/[0.08]"
                      : "border-gray-200 dark:border-[#2b2b31]"
                  }`}
                >
                  <span className="text-[13px] text-gray-700 dark:text-[#c9c9d0] min-w-0 flex-1 truncate">
                    {testCase.label}
                  </span>
                  <IconArrowRight size={14} className="shrink-0 text-gray-300 dark:text-[#3a3a41]" />
                  <span
                    className={`font-mono text-[12.5px] shrink-0 ${
                      result
                        ? "text-gray-800 dark:text-[#e4e4e7]"
                        : "text-gray-300 dark:text-[#3f3f46]"
                    }`}
                  >
                    {result ? labelFor(result.actionId) : "?"}
                  </span>
                  {showVerdict && (
                    <span className="shrink-0">
                      {result!.ok ? (
                        <IconCheck size={15} stroke={3} className="text-[#26B54F]" />
                      ) : (
                        <IconX size={15} stroke={3} className="text-amber-500" />
                      )}
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
