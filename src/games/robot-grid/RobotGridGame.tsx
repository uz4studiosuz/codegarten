"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IconArrowUp,
  IconGripVertical,
  IconRotate,
  IconRotateClockwise,
  IconStarFilled,
  IconX,
} from "@tabler/icons-react";
import type { GameProps, GameStatus } from "../types";
import {
  DragGhost,
  DropSlot,
  GameBoard,
  GameHowTo,
  GameReset,
  GameShell,
  grabClass,
  pickVariant,
  useBlockDrag,
} from "../shared";

/**
 * Drive the robot
 * ---------------
 * A program is written before it runs, and then it runs exactly as written. The
 * learner assembles the whole program, presses check once, and watches the robot
 * walk it step by step — which is where the difference between what they meant
 * and what they wrote becomes visible.
 *
 * Checking is not `useGameCheck`, because the verdict only arrives after the walk
 * animation; the status is driven by hand instead.
 */

type Command = "forward" | "right" | "left";

interface CommandSpec {
  id: Command;
  label: string;
  Icon: typeof IconArrowUp;
  tone: string;
}

const COMMANDS: CommandSpec[] = [
  {
    id: "forward",
    label: "oldinga",
    Icon: IconArrowUp,
    tone: "bg-[#26B54F] shadow-[0_4px_0_0_#177F37]",
  },
  {
    id: "right",
    label: "o'ngga",
    Icon: IconRotateClockwise,
    tone: "bg-[#7C5CE0] shadow-[0_4px_0_0_#563DA6]",
  },
  {
    id: "left",
    label: "chapga",
    Icon: IconRotate,
    tone: "bg-[#E0A13C] shadow-[0_4px_0_0_#A87526]",
  },
];

const COMMAND_BY_ID = new Map(COMMANDS.map((c) => [c.id, c]));

type Facing = "up" | "right" | "down" | "left";
const CLOCKWISE: Facing[] = ["up", "right", "down", "left"];

const FACING_ROTATION: Record<Facing, number> = {
  up: 0,
  right: 90,
  down: 180,
  left: 270,
};

interface Cell {
  x: number;
  y: number;
}

interface Puzzle {
  grid: number;
  start: Cell;
  facing: Facing;
  target: Cell;
  /** How many program rows the learner gets — part of the puzzle. */
  slots: number;
  hint: string;
}

const PUZZLES: Puzzle[] = [
  {
    grid: 4,
    start: { x: 0, y: 0 },
    facing: "right",
    target: { x: 2, y: 1 },
    slots: 4,
    hint: "Robot o'ngga qarab turadi. Burilish uni faqat aylantiradi, joyidan qo'zg'atmaydi.",
  },
  {
    grid: 4,
    start: { x: 0, y: 0 },
    facing: "right",
    target: { x: 3, y: 0 },
    slots: 3,
    hint: "Bu safar burilish kerak emas — qadamlarni sanash yetarli.",
  },
  {
    grid: 4,
    start: { x: 3, y: 3 },
    facing: "up",
    target: { x: 1, y: 2 },
    slots: 4,
    hint: "Robot yuqoriga qarab turadi. Chapga burilsa, qaysi tomonga yuradi?",
  },
  {
    grid: 5,
    start: { x: 0, y: 2 },
    facing: "right",
    target: { x: 3, y: 4 },
    slots: 5,
    hint: "Katta maydonda ham qoida bir xil: avval yo'nalish, keyin qadam.",
  },
  {
    grid: 4,
    start: { x: 0, y: 3 },
    facing: "up",
    target: { x: 2, y: 0 },
    slots: 5,
    hint: "Ikki tomonga yurish kerak — orada bir marta burilish bo'ladi.",
  },
  {
    grid: 5,
    start: { x: 2, y: 2 },
    facing: "down",
    target: { x: 0, y: 3 },
    slots: 4,
    hint: "Robot pastga qarab turadi. Kerakli tomonga qaysi burilish olib boradi?",
  },
];

interface RobotState extends Cell {
  facing: Facing;
}

/** Runs the program and returns the state after each command, for animation. */
function simulate(puzzle: Puzzle, program: (Command | null)[]): RobotState[] {
  let current: RobotState = { ...puzzle.start, facing: puzzle.facing };
  const frames: RobotState[] = [current];

  for (const command of program) {
    if (!command) continue;
    const next = { ...current };

    if (command === "forward") {
      if (next.facing === "right") next.x = Math.min(puzzle.grid - 1, next.x + 1);
      if (next.facing === "left") next.x = Math.max(0, next.x - 1);
      if (next.facing === "down") next.y = Math.min(puzzle.grid - 1, next.y + 1);
      if (next.facing === "up") next.y = Math.max(0, next.y - 1);
    } else {
      const turn = command === "right" ? 1 : 3;
      next.facing = CLOCKWISE[(CLOCKWISE.indexOf(next.facing) + turn) % 4];
    }

    current = next;
    frames.push(next);
  }

  return frames;
}

export function RobotGridGame({
  onSolved,
  onReadyChange,
  registerCheck,
  onStatusChange,
  seed,
  variant,
  config,
}: GameProps) {
  const puzzle = useMemo(() => {
    if (config) {
      // Validate or fallback to default if missing fields
      return {
        grid: config.grid ?? 5,
        start: config.start ?? { x: 0, y: 0 },
        facing: config.facing ?? "right",
        target: config.target ?? { x: 4, y: 4 },
        slots: config.slots ?? 5,
        hint: config.hint ?? "Maqsaddagi joyga yetib boring.",
      } as Puzzle;
    }
    return pickVariant(PUZZLES, seed, { ordinal: variant });
  }, [seed, variant, config]);

  const [slots, setSlots] = useState<(Command | null)[]>(() =>
    Array(puzzle.slots).fill(null)
  );
  const [runFrame, setRunFrame] = useState<number | null>(null);
  const [status, setStatus] = useState<GameStatus>("idle");

  const filledCount = slots.filter(Boolean).length;
  const frames = useMemo(() => simulate(puzzle, slots), [puzzle, slots]);
  const robot = frames[runFrame ?? 0] ?? frames[0];
  const finalState = frames[frames.length - 1];
  const isRunning = runFrame !== null;

  const solved = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    onReadyChange(filledCount > 0 && !isRunning && !solved.current);
  }, [filledCount, isRunning, onReadyChange]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  // A run left half-finished must not keep ticking after the step changes.
  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const runProgram = useCallback(() => {
    if (filledCount === 0 || isRunning) return;
    setStatus("idle");
    setRunFrame(0);

    let frame = 0;
    timer.current = setInterval(() => {
      frame += 1;
      if (frame >= frames.length) {
        if (timer.current) clearInterval(timer.current);
        const last = frames[frames.length - 1];
        const won = last.x === puzzle.target.x && last.y === puzzle.target.y;
        setStatus(won ? "success" : "fail");
        setRunFrame(null);
        if (won && !solved.current) {
          solved.current = true;
          onSolved();
        }
        return;
      }
      setRunFrame(frame);
    }, 420);
  }, [frames, filledCount, isRunning, onSolved, puzzle.target]);

  useEffect(() => {
    registerCheck(runProgram);
  }, [registerCheck, runProgram]);

  // ── Program edits ────────────────────────────────────────────────────────

  const drop = (command: Command, slot: number, from?: number) => {
    if (isRunning) return;
    setStatus("idle");
    setSlots((prev) => {
      const next = [...prev];
      if (from !== undefined) {
        next[from] = next[slot];
        next[slot] = command;
      } else {
        next[slot] = command;
      }
      return next;
    });
  };

  const append = (command: Command, from?: number) => {
    if (from !== undefined || isRunning) return;
    const free = slots.indexOf(null);
    if (free === -1) return;
    drop(command, free);
  };

  const clearSlot = (slot: number) => {
    setStatus("idle");
    setSlots((prev) => prev.map((value, i) => (i === slot ? null : value)));
  };

  const drag = useBlockDrag<Command>({
    onDrop: drop,
    onDropOutside: (_command, from) => {
      if (from !== undefined) clearSlot(from);
    },
    onTap: append,
    disabled: isRunning,
  });

  const resetAll = () => {
    setStatus("idle");
    setRunFrame(null);
    solved.current = false;
    setSlots(Array(puzzle.slots).fill(null));
  };

  const cellSize = 100 / puzzle.grid;

  return (
    <GameShell
      task="Robotni yulduz turgan katakka olib boring."
      hint={puzzle.hint}
      status={status}
      successText="Ajoyib! Dastur aynan yozilganidek bajarildi va robot yulduzga yetdi."
      failText={`Robot ${finalState.x + 1}-ustun, ${
        finalState.y + 1
      }-qatorda to'xtadi. Har buyruqni birma-bir barmoq bilan kuzatib, qaysi qadamda yo'ldan chiqqanini toping.`}
      footer={
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500 dark:text-[#6d6d74]">
            {filledCount}/{puzzle.slots} qator to&apos;ldirildi
          </span>
          <GameReset onClick={resetAll} disabled={isRunning || filledCount === 0} />
        </div>
      }
    >
      <div className="mb-3">
        <GameHowTo
          steps={[
            "Pastdagi buyruqni ushlab, dastur qatoriga tashlang.",
            "Qatordagi buyruqni maydondan tashqariga tashlab, olib tashlaysiz.",
            "«Tekshirish» ni bosganda robot dasturni qatorma-qator bajaradi.",
          ]}
        />
      </div>

      {/* ── Grid ── */}
      <GameBoard label="Maydon">
        <div className="relative w-full aspect-square max-w-[300px] mx-auto">
          <div
            className="absolute inset-0 grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${puzzle.grid}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${puzzle.grid}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: puzzle.grid * puzzle.grid }).map((_, i) => (
              <div key={i} className="rounded-[8px] bg-gray-100 dark:bg-[#1c1c20]" />
            ))}
          </div>

          {/* Target */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: `${puzzle.target.x * cellSize}%`,
              top: `${puzzle.target.y * cellSize}%`,
              width: `${cellSize}%`,
              height: `${cellSize}%`,
            }}
          >
            <IconStarFilled size={26} className="text-[#E0A13C]" />
          </div>

          {/* Robot */}
          <div
            className="absolute p-1.5 transition-all duration-[380ms] ease-out"
            style={{
              left: `${robot.x * cellSize}%`,
              top: `${robot.y * cellSize}%`,
              width: `${cellSize}%`,
              height: `${cellSize}%`,
            }}
          >
            <div
              className={`w-full h-full rounded-[8px] flex items-center justify-center transition-[transform,background-color] duration-300 ${
                status === "success"
                  ? "bg-[#26B54F]"
                  : status === "fail"
                  ? "bg-[#E0A13C]"
                  : "bg-[#3B82F6]"
              }`}
              style={{ transform: `rotate(${FACING_ROTATION[robot.facing]}deg)` }}
            >
              <IconArrowUp size={22} stroke={3} className="text-white" />
            </div>
          </div>
        </div>
      </GameBoard>

      {/* ── Program ── */}
      <div className="mt-3">
        <GameBoard label="Dastur">
          <div className="flex flex-col gap-2">
            {slots.map((command, index) => {
              const spec = command ? COMMAND_BY_ID.get(command) : undefined;
              const alreadyRun = isRunning && runFrame !== null && index < runFrame;

              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-4 shrink-0 text-right font-mono text-[13px] text-gray-400 dark:text-[#5c5c64]">
                    {index + 1}
                  </span>

                  <DropSlot
                    index={index}
                    filled={Boolean(spec)}
                    active={drag.overSlot === index}
                    tone="green"
                    className="flex-1 min-w-0 h-[46px]"
                  >
                    {spec && command && (
                      <div
                        {...drag.bind(command, index)}
                        className={`w-full h-full rounded-[10px] flex items-center gap-2.5 px-3 text-white font-bold text-[14px] ${
                          spec.tone
                        } ${alreadyRun ? "ring-2 ring-white/40" : ""} ${
                          isRunning ? "" : grabClass
                        }`}
                      >
                        <IconGripVertical
                          size={15}
                          className="shrink-0 text-white/60 pointer-events-none"
                        />
                        <spec.Icon
                          size={17}
                          stroke={2.6}
                          className="shrink-0 pointer-events-none"
                        />
                        <span className="font-mono truncate pointer-events-none">
                          {spec.label}
                        </span>
                        {!isRunning && (
                          <button
                            type="button"
                            data-no-drag
                            onClick={() => clearSlot(index)}
                            aria-label={`${index + 1}-qatorni tozalash`}
                            className="ml-auto shrink-0 w-6 h-6 rounded-full bg-black/25 hover:bg-black/40 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <IconX size={13} stroke={3} />
                          </button>
                        )}
                      </div>
                    )}
                  </DropSlot>
                </div>
              );
            })}
          </div>
        </GameBoard>
      </div>

      {/* ── Palette ── */}
      <div className="mt-3">
        <GameBoard label="Buyruqlar" className="flex flex-wrap gap-2.5">
          {COMMANDS.map((spec) => (
            <div
              key={spec.id}
              {...drag.bind(spec.id)}
              title={`${spec.label} — dastur qatoriga tashlang`}
              className={`rounded-[12px] pl-2 pr-3.5 py-2.5 flex items-center gap-1.5 text-white font-bold text-[14px] ${
                spec.tone
              } ${isRunning ? "opacity-40" : grabClass}`}
            >
              <IconGripVertical size={14} className="shrink-0 text-white/60" />
              <spec.Icon size={17} stroke={2.6} />
              <span className="font-mono">{spec.label}</span>
            </div>
          ))}
        </GameBoard>
      </div>

      {drag.isDragging && drag.drag && (
        <DragGhost x={drag.drag.x} y={drag.drag.y}>
          {(() => {
            const spec = COMMAND_BY_ID.get(drag.drag.payload)!;
            return (
              <div
                className={`rounded-[12px] px-3.5 py-2.5 flex items-center gap-2 text-white font-bold text-[14px] shadow-lg ${spec.tone}`}
              >
                <spec.Icon size={17} stroke={2.6} />
                <span className="font-mono">{spec.label}</span>
              </div>
            );
          })()}
        </DragGhost>
      )}
    </GameShell>
  );
}
