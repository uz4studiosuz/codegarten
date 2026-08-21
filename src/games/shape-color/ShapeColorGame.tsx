"use client";

import React, { useMemo, useState } from "react";
import { IconArrowRight, IconGripVertical } from "@tabler/icons-react";
import type { GameProps } from "../types";
import {
  enumList,
  enumValue,
  hasConfig,
  str,
  unique,
  PALETTE,
  PALETTE_KEYS,
  type PaletteKey,
} from "../config";
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
 * Colour by parameter
 * -------------------
 * Three `chiz` calls draw one picture; only their colour argument is missing.
 * Changing an argument changes the picture, and the order of the calls decides
 * what ends up on top — the two ideas this game exists for.
 *
 * Rewritten from an adapter over the old block engine: that version showed an
 * English prompt, English verdicts and a fixed-width block row whose colour
 * choices were clipped on narrow screens. Everything here wraps, and the goal is
 * shown as a picture rather than described in words.
 */

const SHAPES = ["doira", "olti_burchak", "uchburchak"] as const;
type Shape = (typeof SHAPES)[number];

const SHAPE_LABELS: Record<Shape, string> = {
  doira: "doira",
  olti_burchak: "olti burchak",
  uchburchak: "uchburchak",
};

type Palette = Record<Shape, PaletteKey>;

interface Puzzle {
  hint: string;
  /** The picture the learner has to reproduce. */
  target: Palette;
  /** Colours offered — always at least the ones the target needs. */
  choices: PaletteKey[];
  why: string;
}

const PUZZLES: Puzzle[] = [
  {
    hint: "Uchta chaqiruvning ham rang argumenti bir xil bo'ladi.",
    target: { doira: "sariq", olti_burchak: "sariq", uchburchak: "sariq" },
    choices: ["sariq", "kok", "yashil", "qizil"],
    why:
      "Uch chaqiruvga bir xil argument berildi va butun rasm bir rangga bo'yaldi. Funksiya o'zgarmadi — faqat argument o'zgardi.",
  },
  {
    hint: "Har shaklga o'z rangi kerak. Qaysi qator qaysi shaklni chizishiga qarang.",
    target: { doira: "kok", olti_burchak: "sariq", uchburchak: "yashil" },
    choices: ["sariq", "kok", "yashil", "qizil"],
    why:
      "Har chaqiruv o'zining argumentini oldi. Shuning uchun bitta funksiya uch xil rangli qatlam chizdi.",
  },
  {
    hint: "Ikki shakl bir xil rangda, bittasi boshqacha.",
    target: { doira: "yashil", olti_burchak: "yashil", uchburchak: "qizil" },
    choices: ["yashil", "qizil", "kok", "sariq"],
    why:
      "Bir xil argument bir xil natija beradi. Faqat oxirgi chaqiruv boshqa argument olgani uchun ustidagi uchburchak ajralib turdi.",
  },
  {
    hint: "Eng katta shakl birinchi chiziladi va orqada qoladi.",
    target: { doira: "qizil", olti_burchak: "sariq", uchburchak: "kok" },
    choices: ["qizil", "sariq", "kok", "yashil"],
    why:
      "Doira birinchi chizilgani uchun eng orqada turadi, uchburchak esa oxirgi bo'lib eng ustida. Chaqiruvlar tartibi rasmni ham belgilaydi.",
  },
  {
    hint: "Faqat eng katta shakl boshqa rangda bo'ladi.",
    target: { doira: "kok", olti_burchak: "sariq", uchburchak: "sariq" },
    choices: ["kok", "sariq", "yashil"],
    why:
      "Ikki chaqiruv bir xil argument oldi, shuning uchun olti burchak bilan uchburchak bir rangga qo'shilib ketdi.",
  },
  {
    hint: "Uch xil rang, uch xil shakl — har biriga mos argumentni toping.",
    target: { doira: "sariq", olti_burchak: "qizil", uchburchak: "yashil" },
    choices: ["sariq", "qizil", "yashil", "kok"],
    why:
      "Funksiya bitta, natija esa argumentlar sonicha xil bo'ladi — kodni uch marta yozishning hojati yo'q.",
  },
];

/** Builds the puzzle an author configured in the writer, or null if incomplete. */
function fromConfig(config: unknown): Puzzle | null {
  const raw = config as Record<string, unknown>;
  const targetRaw = (raw.target ?? {}) as Record<string, unknown>;

  // Every shape needs a colour: a half-filled target draws a grey shape the
  // learner can never match.
  const target = {} as Palette;
  for (const shape of SHAPES) {
    const colour = enumValue(targetRaw[shape], PALETTE_KEYS);
    if (!colour) return null;
    target[shape] = colour;
  }

  // A target colour the author forgot to offer would leave the picture
  // unreachable, so the offered set always absorbs it.
  const offered = unique([
    ...(enumList(raw.choices, PALETTE_KEYS) ?? []),
    ...SHAPES.map((shape) => target[shape]),
  ]);
  // One colour is not a choice — a single-colour target would otherwise fill
  // itself in.
  for (const key of PALETTE_KEYS) {
    if (offered.length >= 2) break;
    if (!offered.includes(key)) offered.push(key);
  }

  return {
    hint: str(raw.hint) ?? "Har shaklga o'z rangini bering va namuna bilan solishtiring.",
    target,
    choices: PALETTE_KEYS.filter((key) => offered.includes(key)),
    why: str(raw.why) ?? "",
  };
}

/** Circle with a hexagon and an inverted triangle inscribed in it. */
function Drawing({
  colours,
  size = 148,
}: {
  colours: Partial<Palette>;
  size?: number;
}) {
  const fill = (shape: Shape) =>
    colours[shape] ? PALETTE[colours[shape]!].hex : "#E5E7EB";

  return (
    <svg viewBox="-3 -3 136 136" width={size} height={size} className="max-w-full">
      <circle
        cx="65"
        cy="65"
        r="60"
        fill={fill("doira")}
        stroke="#0A0A0A"
        strokeWidth="2.5"
        className="transition-colors duration-300"
      />
      <polygon
        points="65,5 116.9,35 116.9,95 65,125 13.1,95 13.1,35"
        fill={fill("olti_burchak")}
        stroke="#0A0A0A"
        strokeWidth="2.5"
        className="transition-colors duration-300"
      />
      <polygon
        points="65,125 13.1,35 116.9,35"
        fill={fill("uchburchak")}
        stroke="#0A0A0A"
        strokeWidth="2.5"
        className="transition-colors duration-300"
      />
    </svg>
  );
}

export function ShapeColorGame(props: GameProps) {
  const { config, seed, variant } = props;

  const puzzle = useMemo(
    () =>
      (hasConfig(config) ? fromConfig(config) : null) ??
      pickVariant(PUZZLES, seed, { ordinal: variant }),
    [config, seed, variant]
  );

  const [picked, setPicked] = useState<Partial<Palette>>({});

  const complete = SHAPES.every((shape) => picked[shape]);

  const { status, reset } = useGameCheck(props, {
    ready: complete,
    check: () => SHAPES.every((shape) => picked[shape] === puzzle.target[shape]),
  });

  const assign = (colour: PaletteKey, slot: number) => {
    const shape = SHAPES[slot];
    if (!shape) return;
    reset();
    setPicked((prev) => ({ ...prev, [shape]: colour }));
  };

  const drag = useBlockDrag<PaletteKey>({
    onDrop: (colour, slot) => assign(colour, slot),
    onTap: (colour) => {
      // A tap fills the first line still missing a colour.
      const slot = SHAPES.findIndex((shape) => !picked[shape]);
      if (slot !== -1) assign(colour, slot);
    },
  });

  const wrongCount = SHAPES.filter(
    (shape) => picked[shape] !== puzzle.target[shape]
  ).length;

  return (
    <GameShell
      task="Rasmni namunadagi ko'rinishga keltiring."
      hint={puzzle.hint}
      status={status}
      successText={puzzle.why}
      failText={
        wrongCount === 1
          ? "Bitta shaklning rangi mos emas — namuna bilan yonma-yon solishtirib ko'ring."
          : `${wrongCount} shaklning rangi mos emas. Qaysi qator qaysi shaklni chizishiga e'tibor bering.`
      }
      footer={
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500 dark:text-[#6d6d74]">
            {SHAPES.filter((s) => picked[s]).length}/3 rang tanlandi
          </span>
          <GameReset
            onClick={() => {
              reset();
              setPicked({});
            }}
            disabled={Object.keys(picked).length === 0}
          />
        </div>
      }
    >
      <div className="mb-3">
        <GameHowTo
          steps={[
            "Pastdagi rangni ushlab, kodning bo'sh rang joyiga tashlang.",
            "Rasm o'ng tomonda darrov o'zgaradi — namuna bilan solishtiring.",
          ]}
        />
      </div>

      {/* Goal and result, side by side: the goal is a picture, not a sentence. */}
      <GameBoard label="Namuna va natija">
        <div className="flex items-center justify-center gap-3 sm:gap-5">
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-[14px] bg-white p-2.5">
              <Drawing colours={puzzle.target} size={120} />
            </div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-[#6d6d74]">
              namuna
            </span>
          </div>

          <IconArrowRight
            size={18}
            className="shrink-0 text-gray-300 dark:text-[#3a3a41]"
          />

          <div className="flex flex-col items-center gap-2">
            <div
              className={`rounded-[14px] bg-white p-2.5 transition-shadow ${
                status === "success"
                  ? "ring-2 ring-[#26B54F]"
                  : status === "fail"
                  ? "ring-2 ring-amber-500"
                  : ""
              }`}
            >
              <Drawing colours={picked} size={120} />
            </div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-[#6d6d74]">
              sizning kodingiz
            </span>
          </div>
        </div>
      </GameBoard>

      {/* ── The program ── */}
      <div className="mt-3">
        <GameBoard label="Kod">
          <div className="flex flex-col gap-2.5">
            {SHAPES.map((shape, i) => {
              const colour = picked[shape];
              const isWrong = status !== "idle" && colour !== puzzle.target[shape];

              return (
                <div
                  key={shape}
                  className={`flex flex-wrap items-center gap-x-1.5 gap-y-2 rounded-[12px] border-2 px-3 py-2.5 font-mono text-[13.5px] transition-colors ${
                    status === "idle"
                      ? "border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013]"
                      : isWrong
                      ? "border-amber-500 bg-amber-500/[0.06]"
                      : "border-[#26B54F]/60 bg-[#26B54F]/[0.06]"
                  }`}
                >
                  <span className="w-4 shrink-0 text-right text-[12.5px] text-gray-400 dark:text-[#5c5c64]">
                    {i + 1}
                  </span>
                  <span className="text-gray-800 dark:text-[#e4e4e7]">
                    chiz({SHAPE_LABELS[shape]},
                  </span>

                  <DropSlot
                    index={i}
                    filled={Boolean(colour)}
                    active={drag.overSlot === i}
                    className="w-[92px] h-[34px] justify-center px-1.5"
                  >
                    {colour ? (
                      <span className="flex items-center gap-1.5">
                        <span
                          style={{ backgroundColor: PALETTE[colour].hex }}
                          className="w-4 h-4 rounded-[5px] shrink-0 border border-black/20"
                        />
                        <span className="text-[12px] text-gray-700 dark:text-[#d4d4d8]">
                          {PALETTE[colour].label}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400 dark:text-[#5c5c64]">
                        rang
                      </span>
                    )}
                  </DropSlot>

                  <span className="text-gray-800 dark:text-[#e4e4e7]">)</span>
                </div>
              );
            })}
          </div>
        </GameBoard>
      </div>

      {/* ── Palette: wraps, so nothing is ever cut off ── */}
      <div className="mt-3">
        <GameBoard label="Ranglar" className="flex flex-wrap gap-2.5">
          {puzzle.choices.map((colour) => (
            <div
              key={colour}
              {...drag.bind(colour)}
              title={`${PALETTE[colour].label} — kodning rang joyiga tashlang`}
              className={`flex items-center gap-2 rounded-[12px] border-2 border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#101013] pl-2 pr-3 py-2 hover:border-[#7C5CE0] transition-colors ${grabClass}`}
            >
              <IconGripVertical
                size={14}
                className="shrink-0 text-gray-300 dark:text-[#3f3f46]"
              />
              <span
                style={{ backgroundColor: PALETTE[colour].hex }}
                className="w-6 h-6 rounded-[7px] shrink-0 border border-black/20"
              />
              <span className="text-[12.5px] font-medium text-gray-600 dark:text-[#a1a1aa]">
                {PALETTE[colour].label}
              </span>
            </div>
          ))}
        </GameBoard>
      </div>

      {status === "idle" && (
        <div className="mt-3">
          <GameNote>
            Birinchi qator eng katta shaklni chizadi, keyingilari uning ustiga tushadi —
            shuning uchun chaqiruvlar tartibi ham natijaga ta&apos;sir qiladi.
          </GameNote>
        </div>
      )}

      {drag.isDragging && drag.drag && (
        <DragGhost x={drag.drag.x} y={drag.drag.y}>
          <span
            style={{ backgroundColor: PALETTE[drag.drag.payload].hex }}
            className="block w-[38px] h-[38px] rounded-[9px] border border-black/20 shadow-lg"
          />
        </DragGhost>
      )}
    </GameShell>
  );
}
