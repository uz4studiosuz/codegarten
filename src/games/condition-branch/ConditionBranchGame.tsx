"use client";

import React, { useMemo, useState } from "react";
import { IconArrowRight, IconCheck, IconX } from "@tabler/icons-react";
import type { GameProps } from "../types";
import { GameBoard, GameHowTo, GameNote, GameShell, pickVariant, useGameCheck } from "../shared";

/**
 * Build the decision rule
 * -----------------------
 * A conditional is only understood once the learner watches one rule handle
 * several different situations. They assemble the rule and the board runs it
 * against every case, so a rule that fits one situation but breaks another is
 * visibly wrong.
 *
 * Two lessons from watching children use it:
 *
 *   - `agar ... aks holda ...` was too much at once. The early puzzles are plain
 *     `agar` only, and the board spells out that a plain `agar` simply does
 *     nothing when the condition is false. `aks holda` arrives later, once the
 *     first shape is solid.
 *   - the case table used to fill in as soon as the rule was complete, which
 *     turned the puzzle into swapping chips until the ticks appeared. It now
 *     stays blank until they commit to an answer.
 *
 * Checking is by simulation, not by comparing to one authored answer: an inverted
 * condition with swapped branches is also correct, and is accepted.
 */

type Facts = Record<string, number | boolean>;

/** The action a plain `agar` takes when its condition is false. */
const NOTHING = "__none__";

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
  /** "if" puzzles have no else branch at all — that is the teaching order. */
  mode: "if" | "if-else";
  scenario: string;
  hint: string;
  conditions: Condition[];
  actions: { id: string; label: string }[];
  cases: Case[];
  why: string;
}

/**
 * Ordered from simplest to hardest: plain `agar` first, then `aks holda`. The
 * lesson ordinal walks this list, so a learner's first conditional lesson gets
 * the first shape rather than a random one.
 */
const PUZZLES: Puzzle[] = [
  {
    mode: "if",
    scenario:
      "Robot yo'lda ketmoqda. Faqat old tomonda to'siq bo'lsa signal berishi kerak — boshqa hollarda hech narsa qilmaydi.",
    hint: "Bu yerda faqat bitta tarmoq bor: shart bajarilsa — amal, bajarilmasa — hech narsa.",
    conditions: [
      { id: "obstacle", label: "to'siq_bormi()", test: (f) => Boolean(f.obstacle) },
      { id: "coin", label: "tanga_bormi()", test: (f) => Boolean(f.coin) },
      { id: "noObstacle", label: "to'siq_yo'qmi()", test: (f) => !f.obstacle },
    ],
    actions: [
      { id: "beep", label: "signal_ber()" },
      { id: "forward", label: "oldinga()" },
    ],
    cases: [
      { label: "Oldinda to'siq bor", facts: { obstacle: true, coin: false }, expected: "beep" },
      { label: "Yo'l bo'sh", facts: { obstacle: false, coin: false }, expected: NOTHING },
      { label: "To'siq bor, yonida tanga", facts: { obstacle: true, coin: true }, expected: "beep" },
      { label: "Yo'l bo'sh, tanga bor", facts: { obstacle: false, coin: true }, expected: NOTHING },
    ],
    why:
      "Qoida faqat to'siqqa qaraydi — tanga qarorga ta'sir qilmaydi. Shart yolg'on bo'lganda esa `agar` hech narsa qilmaydi.",
  },
  {
    mode: "if",
    scenario:
      "Telefon batareyasi 20% dan tushsa, tejash rejimini yoqish kerak. Aks holda hech narsa o'zgarmaydi.",
    hint: "Chegarani aniq tanlang: 20% ning o'zi hali kam emas.",
    conditions: [
      { id: "lt20", label: "quvvat < 20", test: (f) => Number(f.quvvat) < 20 },
      { id: "le20", label: "quvvat <= 20", test: (f) => Number(f.quvvat) <= 20 },
      { id: "gt20", label: "quvvat > 20", test: (f) => Number(f.quvvat) > 20 },
    ],
    actions: [
      { id: "save", label: "tejash_yoq()" },
      { id: "bright", label: "yorqinlikni_oshir()" },
    ],
    cases: [
      { label: "Quvvat = 8%", facts: { quvvat: 8 }, expected: "save" },
      { label: "Quvvat = 20%", facts: { quvvat: 20 }, expected: NOTHING },
      { label: "Quvvat = 19%", facts: { quvvat: 19 }, expected: "save" },
      { label: "Quvvat = 75%", facts: { quvvat: 75 }, expected: NOTHING },
    ],
    why:
      "\"Kichik\" (<) chegaraning o'zini qamramaydi, shuning uchun 20% da hech narsa bo'lmadi. \"Kichik yoki teng\" (<=) bo'lsa, 20% ham tejashga tushib qolardi.",
  },
  {
    mode: "if",
    scenario:
      "Do'kon dasturi: xarid 100 000 so'mdan oshsa chegirma qo'shiladi. Qolgan hollarda narx o'zgarmaydi.",
    hint: "Faqat bitta shart va bitta amal kerak — ikkinchi tarmoq yo'q.",
    conditions: [
      { id: "gt100", label: "summa > 100000", test: (f) => Number(f.summa) > 100000 },
      { id: "lt100", label: "summa < 100000", test: (f) => Number(f.summa) < 100000 },
      { id: "eq100", label: "summa == 100000", test: (f) => Number(f.summa) === 100000 },
    ],
    actions: [
      { id: "discount", label: "chegirma_qosh()" },
      { id: "cancel", label: "xaridni_bekor_qil()" },
    ],
    cases: [
      { label: "Summa = 250 000", facts: { summa: 250000 }, expected: "discount" },
      { label: "Summa = 40 000", facts: { summa: 40000 }, expected: NOTHING },
      { label: "Summa = 100 000", facts: { summa: 100000 }, expected: NOTHING },
      { label: "Summa = 120 000", facts: { summa: 120000 }, expected: "discount" },
    ],
    why:
      "Shart faqat 100 000 dan katta summalarda to'g'ri bo'ldi. Teng bo'lgan holat ham chegirmasiz qoldi — chegara qat'iy.",
  },
  {
    mode: "if-else",
    scenario:
      "O'quvchi imtihondan 50 va undan yuqori ball olsa o'tadi, aks holda qayta topshiradi.",
    hint: "Endi ikkita tarmoq bor. Chegarani aniq belgilang: 50 balni ham o'tgan hisoblanadi.",
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
    mode: "if-else",
    scenario:
      "Robot yo'lda ketmoqda. Old tomonda to'siq bo'lsa aylanib o'tishi, bo'lmasa oldinga yurishi kerak.",
    hint: "Ikkala tarmoq ham to'ldiriladi: shart yolg'on bo'lganda ham robot bir ish qiladi.",
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
    mode: "if-else",
    scenario:
      "Chiroq faqat qorong'i bo'lganda va uyda odam bor bo'lganda yonishi kerak, qolgan hollarda o'chib turadi.",
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
  {
    mode: "if-else",
    scenario:
      "Avtobus eshigi: yo'lovchi kartasida yetarli pul bo'lsa o'tkazadi, aks holda ogohlantiradi.",
    hint: "Chipta narxi 1700 so'm. Aynan 1700 bo'lsa ham o'tkazish kerak.",
    conditions: [
      { id: "ge", label: "pul >= 1700", test: (f) => Number(f.pul) >= 1700 },
      { id: "gt", label: "pul > 1700", test: (f) => Number(f.pul) > 1700 },
      { id: "lt", label: "pul < 1700", test: (f) => Number(f.pul) < 1700 },
    ],
    actions: [
      { id: "open", label: "eshikni_och()" },
      { id: "warn", label: "ogohlantir()" },
    ],
    cases: [
      { label: "Kartada 5 000 so'm", facts: { pul: 5000 }, expected: "open" },
      { label: "Kartada 1 700 so'm", facts: { pul: 1700 }, expected: "open" },
      { label: "Kartada 900 so'm", facts: { pul: 900 }, expected: "warn" },
      { label: "Kartada 0 so'm", facts: { pul: 0 }, expected: "warn" },
    ],
    why:
      "Chegara qiymatining o'zi ham yetarli hisoblanadi, shuning uchun >= kerak bo'ldi. Ikkinchi tarmoq esa qolgan barcha holatlarni qamrab oldi.",
  },
];

export function ConditionBranchGame(props: GameProps) {
  const puzzle = useMemo(
    () => pickVariant(PUZZLES, props.seed, { ordinal: props.variant }),
    [props.seed, props.variant]
  );

  const hasElse = puzzle.mode === "if-else";

  const [conditionId, setConditionId] = useState<string | null>(null);
  const [thenId, setThenId] = useState<string | null>(null);
  const [elseId, setElseId] = useState<string | null>(null);

  const condition = puzzle.conditions.find((c) => c.id === conditionId);
  const complete = Boolean(condition && thenId && (!hasElse || elseId));

  /** Runs the assembled rule over every case. */
  const results = useMemo(() => {
    if (!condition || !thenId || (hasElse && !elseId)) return null;
    return puzzle.cases.map((testCase) => {
      const actionId = condition.test(testCase.facts)
        ? thenId
        : hasElse
        ? elseId!
        : NOTHING;
      return { testCase, actionId, ok: actionId === testCase.expected };
    });
  }, [condition, thenId, elseId, hasElse, puzzle.cases]);

  const { status, reset } = useGameCheck(props, {
    ready: complete,
    check: () => Boolean(results && results.every((r) => r.ok)),
  });

  const pick = (setter: (v: string) => void) => (value: string) => {
    reset();
    setter(value);
  };

  const labelFor = (actionId: string | null) => {
    if (actionId === NOTHING) return "hech narsa";
    return puzzle.actions.find((a) => a.id === actionId)?.label ?? "...";
  };

  const failCount = results ? results.filter((r) => !r.ok).length : 0;
  const revealed = status !== "idle";

  return (
    <GameShell
      task="Barcha holatlarda to'g'ri ishlaydigan qoidani tuzing."
      hint={puzzle.hint}
      status={status}
      successText={puzzle.why}
      failText={
        failCount === 1
          ? "Bitta holat qoidaga bo'ysunmadi — pastdagi jadvalda belgilangan qatorga qarang."
          : `${failCount} holat noto'g'ri hal bo'ldi. Shartni yoki tarmoqni almashtirib ko'ring.`
      }
      footer={
        <GameNote>
          <span className="font-semibold">Vaziyat:</span> {puzzle.scenario}
        </GameNote>
      }
    >
      <div className="mb-3">
        <GameHowTo
          steps={
            hasElse
              ? [
                  "Shartni tanlang — qoida nimaga qarab qaror qiladi.",
                  "Shart to'g'ri bo'lganda bajariladigan amalni tanlang.",
                  "Shart yolg'on bo'lganda bajariladigan amalni tanlang.",
                  "«Tekshirish» ni bosing — qoida to'rt holatda sinaladi.",
                ]
              : [
                  "Shartni tanlang — qoida nimaga qarab qaror qiladi.",
                  "Shart to'g'ri bo'lganda bajariladigan amalni tanlang.",
                  "«Tekshirish» ni bosing — qoida to'rt holatda sinaladi.",
                ]
          }
        />
      </div>

      <GameBoard label="Qoida">
        <div className="flex flex-col gap-3.5">
          {/* agar <shart> */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[13.5px] text-gray-700 dark:text-[#d4d4d8]">
              agar{" "}
              <span
                className={`inline-block rounded-[8px] border-2 px-2 py-0.5 align-middle ${
                  conditionId
                    ? "border-[#7C5CE0] bg-[#7C5CE0]/10 font-bold text-[#7C5CE0] dark:text-[#c4b5fd]"
                    : "border-dashed border-gray-300 dark:border-[#3a3a41] text-gray-400 dark:text-[#6d6d74]"
                }`}
              >
                {condition?.label ?? "shartni tanlang"}
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

          {/* then branch */}
          <Branch
            heading="→ bajar:"
            tone="#26B54F"
            selected={thenId}
            actions={puzzle.actions}
            labelFor={labelFor}
            onPick={pick(setThenId)}
          />

          {/* else branch — only once the learner has met plain `agar` */}
          {hasElse ? (
            <Branch
              heading="aks holda bajar:"
              tone="#E0A13C"
              selected={elseId}
              actions={puzzle.actions}
              labelFor={labelFor}
              onPick={pick(setElseId)}
            />
          ) : (
            <div className="rounded-[12px] border-2 border-dashed border-gray-200 dark:border-[#232327] px-3 py-2.5">
              <span className="font-mono text-[12.5px] text-gray-400 dark:text-[#6d6d74]">
                aks holda: hech narsa qilinmaydi
              </span>
              <p className="mt-1 text-[12px] leading-snug text-gray-400 dark:text-[#6d6d74]">
                Oddiy <span className="font-mono">agar</span> ikkinchi tarmoqsiz ishlaydi —
                shart yolg&apos;on bo&apos;lsa, dastur shunchaki davom etadi.
              </p>
            </div>
          )}
        </div>
      </GameBoard>

      <div className="mt-3">
        <GameBoard label="Sinov holatlari">
          <div className="flex flex-col gap-2">
            {puzzle.cases.map((testCase, i) => {
              const result = revealed ? results?.[i] : undefined;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 sm:gap-3 rounded-[12px] border-2 px-3 py-2.5 transition-colors ${
                    result
                      ? result.ok
                        ? "border-[#26B54F]/60 bg-[#26B54F]/[0.07]"
                        : "border-amber-500 bg-amber-500/[0.08]"
                      : "border-gray-200 dark:border-[#2b2b31]"
                  }`}
                >
                  <span className="text-[13px] text-gray-700 dark:text-[#c9c9d0] min-w-0 flex-1 truncate">
                    {testCase.label}
                  </span>
                  <IconArrowRight
                    size={14}
                    className="shrink-0 text-gray-300 dark:text-[#3a3a41]"
                  />
                  <span
                    className={`font-mono text-[12.5px] shrink-0 ${
                      result
                        ? "text-gray-800 dark:text-[#e4e4e7]"
                        : "text-gray-300 dark:text-[#3f3f46]"
                    }`}
                  >
                    {result ? labelFor(result.actionId) : "?"}
                  </span>
                  {result && (
                    <span className="shrink-0">
                      {result.ok ? (
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
          {!revealed && (
            <p className="mt-3 text-[12px] text-gray-400 dark:text-[#6d6d74]">
              Qoida qanday natija berishini «Tekshirish» dan keyin ko&apos;rasiz.
            </p>
          )}
        </GameBoard>
      </div>
    </GameShell>
  );
}

/** One branch of the rule: its heading, the chosen action and the choices. */
function Branch({
  heading,
  tone,
  selected,
  actions,
  labelFor,
  onPick,
}: {
  heading: string;
  tone: string;
  selected: string | null;
  actions: { id: string; label: string }[];
  labelFor: (id: string | null) => string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[13.5px] text-gray-700 dark:text-[#d4d4d8]">
        {heading}{" "}
        <span
          className="inline-block rounded-[8px] border-2 px-2 py-0.5 align-middle font-bold"
          style={
            selected
              ? { borderColor: tone, color: tone, background: `${tone}1A` }
              : undefined
          }
        >
          {selected ? (
            labelFor(selected)
          ) : (
            <span className="border-dashed font-normal text-gray-400 dark:text-[#6d6d74]">
              amalni tanlang
            </span>
          )}
        </span>
      </span>
      <div
        className="ml-4 pl-3 border-l-2 flex flex-wrap gap-2"
        style={{ borderColor: `${tone}66` }}
      >
        {actions.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onPick(a.id)}
            className={`rounded-[10px] border-2 px-3 py-1.5 font-mono text-[12.5px] transition-colors cursor-pointer ${
              selected === a.id
                ? "font-bold"
                : "border-gray-200 dark:border-[#2b2b31] text-gray-600 dark:text-[#a1a1aa] hover:border-gray-300 dark:hover:border-[#3d3d45]"
            }`}
            style={
              selected === a.id
                ? { borderColor: tone, color: tone, background: `${tone}1A` }
                : undefined
            }
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
