"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IconArrowUp,
  IconGripVertical,
  IconRotate,
  IconRotateClockwise,
  IconStarFilled,
  IconWall,
  IconX,
} from "@tabler/icons-react";
import type { GameProps, GameStatus } from "../types";
import { enumValue, hasConfig, int, str } from "../config";
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
} from "../shared";

/**
 * Drive the robot
 * ---------------
 * A program is written before it runs, and then it runs exactly as written. The
 * learner assembles the whole program, presses check once, and watches the robot
 * walk it step by step — which is where the difference between what they meant
 * and what they wrote becomes visible.
 *
 * The board used to be an empty grid, so every task was "count the steps" and a
 * straight line solved most of them. Walls fixed that: they are part of the
 * puzzle, and the route has to go around them. Walking into one halts the program
 * where it happened and says so, because the earlier simulation quietly clamped
 * the robot at the edge of the grid — a step that did nothing, reported as if it
 * had worked, is the one kind of failure a learner cannot debug. Leaving the
 * board is now the same kind of visible stop.
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

const AHEAD: Record<Facing, Cell> = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

interface Cell {
  x: number;
  y: number;
}

const cellKey = (cell: Cell): string => `${cell.x},${cell.y}`;
const sameCell = (a: Cell, b: Cell): boolean => a.x === b.x && a.y === b.y;

interface Puzzle {
  grid: number;
  start: Cell;
  facing: Facing;
  target: Cell;
  /** Cells the robot cannot enter. Walking into one ends the run. */
  obstacles: Cell[];
  /** How many program rows the learner gets — part of the puzzle. */
  slots: number;
  hint: string;
}

/**
 * Ordered so the first boards are still an empty grid — a first program should be
 * about counting steps — and the walls arrive from the third puzzle on, early
 * enough that the lessons which reach this game actually meet one.
 */
const PUZZLES: Puzzle[] = [
  {
    grid: 4,
    start: { x: 0, y: 0 },
    facing: "right",
    target: { x: 3, y: 0 },
    obstacles: [],
    slots: 3,
    hint: "Bu safar burilish kerak emas — qadamlarni sanash yetarli.",
  },
  {
    grid: 4,
    start: { x: 0, y: 0 },
    facing: "right",
    target: { x: 2, y: 1 },
    obstacles: [],
    slots: 4,
    hint: "Robot o'ngga qarab turadi. Burilish uni faqat aylantiradi, joyidan qo'zg'atmaydi.",
  },
  {
    grid: 4,
    start: { x: 0, y: 0 },
    facing: "right",
    target: { x: 1, y: 2 },
    obstacles: [{ x: 1, y: 0 }],
    slots: 5,
    hint: "Robot oldida devor turadi. Unga urilsa dastur to'xtaydi — avval yo'lni chetlab o'tish kerak.",
  },
  {
    grid: 4,
    start: { x: 3, y: 3 },
    facing: "up",
    target: { x: 1, y: 3 },
    obstacles: [{ x: 2, y: 3 }],
    slots: 6,
    hint: "Nishon yonma-yon turgandek ko'rinadi, lekin orada devor bor. Aylanib o'tish uchun ikki marta burilish kerak.",
  },
  {
    grid: 4,
    start: { x: 0, y: 3 },
    facing: "up",
    target: { x: 2, y: 0 },
    obstacles: [],
    // Three steps up, a turn, then two more: six rows, not the five this board
    // used to offer. It was simply unsolvable.
    slots: 6,
    hint: "Ikki tomonga yurish kerak — orada bir marta burilish bo'ladi.",
  },
  {
    grid: 5,
    start: { x: 0, y: 0 },
    facing: "right",
    target: { x: 2, y: 2 },
    obstacles: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ],
    slots: 6,
    hint: "Ikki devor o'ng tomonni to'sib turadi. Boshqa tomondan aylanib chiqing.",
  },
  {
    grid: 4,
    start: { x: 3, y: 3 },
    facing: "up",
    target: { x: 1, y: 2 },
    obstacles: [],
    slots: 4,
    hint: "Robot yuqoriga qarab turadi. Chapga burilsa, qaysi tomonga yuradi?",
  },
  {
    grid: 5,
    start: { x: 0, y: 4 },
    facing: "up",
    target: { x: 2, y: 1 },
    obstacles: [
      { x: 0, y: 2 },
      { x: 1, y: 1 },
    ],
    slots: 7,
    hint: "Devorlar to'g'ri yo'lni ham, qisqa aylanma yo'lni ham to'sib qo'ygan. Yo'lni oldin ko'z bilan chizib chiqing.",
  },
  {
    grid: 5,
    start: { x: 0, y: 2 },
    facing: "right",
    target: { x: 3, y: 4 },
    obstacles: [],
    /** Also six: three across, turn, two down. */
    slots: 6,
    hint: "Katta maydonda ham qoida bir xil: avval yo'nalish, keyin qadam.",
  },
  {
    grid: 5,
    start: { x: 2, y: 2 },
    facing: "down",
    target: { x: 0, y: 3 },
    obstacles: [],
    slots: 4,
    hint: "Robot pastga qarab turadi. Kerakli tomonga qaysi burilish olib boradi?",
  },
];

/* ──────────────────────────── running the program ──────────────────────────── */

interface RobotState extends Cell {
  facing: Facing;
}

/** Why the robot stopped early. `cell` is the cell it tried to enter. */
interface Halt {
  cell: Cell;
  kind: "wall" | "edge";
  /** Which program row did it, so the learner is pointed at a line, not a mood. */
  row: number;
}

interface Run {
  /** State after each executed command, for the animation. */
  frames: RobotState[];
  halt?: Halt;
}

/**
 * Runs the program. A blocked step stops the whole program rather than being
 * silently ignored: the earlier version clamped at the grid edge, so a step that
 * did nothing looked exactly like a step that worked.
 */
function simulate(puzzle: Puzzle, program: (Command | null)[]): Run {
  const walls = new Set(puzzle.obstacles.map(cellKey));
  let current: RobotState = { ...puzzle.start, facing: puzzle.facing };
  const frames: RobotState[] = [current];

  for (let row = 0; row < program.length; row++) {
    const command = program[row];
    if (!command) continue;

    if (command === "forward") {
      const step = AHEAD[current.facing];
      const next: RobotState = {
        x: current.x + step.x,
        y: current.y + step.y,
        facing: current.facing,
      };
      const outside =
        next.x < 0 || next.y < 0 || next.x >= puzzle.grid || next.y >= puzzle.grid;
      if (outside || walls.has(cellKey(next))) {
        return {
          frames,
          halt: { cell: { x: next.x, y: next.y }, kind: outside ? "edge" : "wall", row },
        };
      }
      current = next;
    } else {
      const turn = command === "right" ? 1 : 3;
      current = {
        ...current,
        facing: CLOCKWISE[(CLOCKWISE.indexOf(current.facing) + turn) % 4],
      };
    }

    frames.push(current);
  }

  return { frames };
}

/**
 * Shortest program that reaches the target, in commands, or undefined when no
 * program does. Turning costs a row too, which is why this is a search over
 * (cell, facing) rather than a distance on the grid.
 */
function shortestProgram(puzzle: Puzzle): number | undefined {
  const walls = new Set(puzzle.obstacles.map(cellKey));
  if (walls.has(cellKey(puzzle.start)) || walls.has(cellKey(puzzle.target))) return undefined;

  const key = (state: RobotState) => `${state.x},${state.y},${state.facing}`;
  const first: RobotState = { ...puzzle.start, facing: puzzle.facing };
  const seen = new Set([key(first)]);
  let frontier: RobotState[] = [first];
  let steps = 0;

  while (frontier.length > 0) {
    if (frontier.some((state) => sameCell(state, puzzle.target))) return steps;
    const next: RobotState[] = [];

    for (const state of frontier) {
      const ahead = AHEAD[state.facing];
      const moved: RobotState = {
        x: state.x + ahead.x,
        y: state.y + ahead.y,
        facing: state.facing,
      };
      const inside =
        moved.x >= 0 && moved.y >= 0 && moved.x < puzzle.grid && moved.y < puzzle.grid;

      const options: RobotState[] = [
        ...(inside && !walls.has(cellKey(moved)) ? [moved] : []),
        { ...state, facing: CLOCKWISE[(CLOCKWISE.indexOf(state.facing) + 1) % 4] },
        { ...state, facing: CLOCKWISE[(CLOCKWISE.indexOf(state.facing) + 3) % 4] },
      ];

      for (const option of options) {
        if (seen.has(key(option))) continue;
        seen.add(key(option));
        next.push(option);
      }
    }

    frontier = next;
    steps += 1;
  }

  return undefined;
}

/* ─────────────────────────── author-supplied puzzle ─────────────────────────── */

/** Reads the obstacle list: `[{ x, y }]`, or `[{ cell: { x, y } }]` from a rows field. */
function parseObstacles(value: unknown, grid: number): Cell[] | undefined {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return undefined;

  const out: Cell[] = [];
  const seen = new Set<string>();
  for (const raw of value) {
    if (raw === null || typeof raw !== "object") continue;
    const source = (raw as any).cell ?? raw;
    if (source === null || typeof source !== "object") continue;
    // Out of range is refused rather than clamped: a wall nudged onto the start
    // or the star would quietly turn a good board into an unplayable one.
    const x = (source as any).x;
    const y = (source as any).y;
    const cx = int(x, 0, grid - 1);
    const cy = int(y, 0, grid - 1);
    if (cx === undefined || cy === undefined) continue;
    if (cx !== Math.round(Number(x)) || cy !== Math.round(Number(y))) return undefined;
    const cell = { x: cx, y: cy };
    if (seen.has(cellKey(cell))) continue;
    seen.add(cellKey(cell));
    out.push(cell);
  }
  return out;
}

/**
 * Builds the puzzle an author configured in the writer, or null if incomplete.
 *
 * Every coordinate is clamped into the board the author actually asked for: a
 * grid shrunk after the target was placed would otherwise strand the star off
 * the edge, where it can never be reached. A start that lands on the target is
 * refused outright rather than clamped — it is already solved, so there is no
 * puzzle left to play.
 *
 * Walls are held to the same standard. A wall on the robot or on the star, a star
 * with no route to it, or a route longer than the program has rows for, all fall
 * back to a built-in puzzle: an unplayable board is worse than the wrong one.
 */
function fromConfig(config: unknown): Puzzle | null {
  if (!hasConfig(config)) return null;

  const grid = int(config.grid, 3, 8);
  if (grid === undefined) return null;

  const cell = (value: unknown): Cell | undefined => {
    if (value === null || typeof value !== "object") return undefined;
    const x = int((value as any).x, 0, grid - 1);
    const y = int((value as any).y, 0, grid - 1);
    return x === undefined || y === undefined ? undefined : { x, y };
  };

  const start = cell(config.start);
  const target = cell(config.target);
  if (!start || !target) return null;
  if (start.x === target.x && start.y === target.y) return null;

  const facing = enumValue(config.facing, CLOCKWISE);
  const slots = int(config.slots, 2, 12);
  if (!facing || slots === undefined) return null;

  const obstacles = parseObstacles(config.obstacles, grid);
  if (!obstacles) return null;
  if (obstacles.some((wall) => sameCell(wall, start) || sameCell(wall, target))) return null;

  const puzzle: Puzzle = {
    grid,
    start,
    target,
    facing,
    obstacles,
    slots,
    hint: str(config.hint) ?? "Robotni nishondagi yulduzga olib boring.",
  };

  const shortest = shortestProgram(puzzle);
  if (shortest === undefined || shortest > slots) return null;

  return puzzle;
}

/* ──────────────────────────────── the board ──────────────────────────────── */

export function RobotGridGame({
  onSolved,
  onReadyChange,
  registerCheck,
  onStatusChange,
  seed,
  context,
  variant,
  config,
}: GameProps) {
  /**
   * Only a couple of lessons resolve to this game, so the ordinal alone never
   * walks far enough to reach a walled board. A lesson that says it is about a
   * maze asks for one directly.
   */
  const puzzle = useMemo(() => {
    const wantsWalls = /labirint|devor|to'siq|aylanib/.test(context ?? "");
    return (
      (hasConfig(config) ? fromConfig(config) : null) ??
      pickVariant(PUZZLES, seed, {
        prefer: wantsWalls ? (p) => p.obstacles.length > 0 : undefined,
        ordinal: variant,
      })
    );
  }, [config, context, seed, variant]);

  const [slots, setSlots] = useState<(Command | null)[]>(() =>
    Array(puzzle.slots).fill(null)
  );
  const [runFrame, setRunFrame] = useState<number | null>(null);
  const [status, setStatus] = useState<GameStatus>("idle");

  const filledCount = slots.filter(Boolean).length;
  const run = useMemo(() => simulate(puzzle, slots), [puzzle, slots]);
  const frames = run.frames;
  const robot = frames[runFrame ?? 0] ?? frames[0];
  const finalState = frames[frames.length - 1];
  const isRunning = runFrame !== null;

  const walls = useMemo(
    () => new Set(puzzle.obstacles.map(cellKey)),
    [puzzle.obstacles]
  );

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
        // A program that crashed into a wall has not solved anything, even if the
        // crash happened while standing on the star.
        const won = !run.halt && last.x === puzzle.target.x && last.y === puzzle.target.y;
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
  }, [frames, run.halt, filledCount, isRunning, onSolved, puzzle.target]);

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
  const hasWalls = puzzle.obstacles.length > 0;

  /** Names where it went wrong. Never which command would have been right. */
  const failText = run.halt
    ? run.halt.kind === "wall"
      ? `${run.halt.row + 1}-qatordagi «oldinga» robotni ${run.halt.cell.x + 1}-ustun, ${
          run.halt.cell.y + 1
        }-qatordagi devorga olib bordi va dastur shu yerda to'xtadi. Devorni aylanib o'tadigan yo'l kerak.`
      : `${
          run.halt.row + 1
        }-qatordagi «oldinga» robotni maydondan tashqariga olib chiqmoqchi bo'ldi va dastur to'xtadi. Qadamlarni maydon ichida qoladigan qilib sanang.`
    : `Robot ${finalState.x + 1}-ustun, ${
        finalState.y + 1
      }-qatorda to'xtadi. Har buyruqni birma-bir barmoq bilan kuzatib, qaysi qadamda yo'ldan chiqqanini toping.`;

  return (
    <GameShell
      task="Robotni yulduz turgan katakka olib boring."
      hint={puzzle.hint}
      status={status}
      successText={
        hasWalls
          ? "Ajoyib! Dastur aynan yozilganidek bajarildi va robot devorlarni aylanib yulduzga yetdi."
          : "Ajoyib! Dastur aynan yozilganidek bajarildi va robot yulduzga yetdi."
      }
      failText={failText}
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
            hasWalls
              ? "Devor turgan katakka yurib bo'lmaydi — unga urilsa dastur to'xtaydi."
              : "Qatordagi buyruqni maydondan tashqariga tashlab, olib tashlaysiz.",
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
            {Array.from({ length: puzzle.grid * puzzle.grid }).map((_, i) => {
              const cell = { x: i % puzzle.grid, y: Math.floor(i / puzzle.grid) };
              const wall = walls.has(cellKey(cell));
              // The wall that stopped the run is marked only once the run is over,
              // and only the one that was actually hit.
              const struck =
                status === "fail" &&
                run.halt?.kind === "wall" &&
                sameCell(run.halt.cell, cell);

              return (
                <div
                  key={i}
                  className={`rounded-[8px] flex items-center justify-center ${
                    wall
                      ? "bg-gray-300 dark:bg-[#3a3a41]"
                      : "bg-gray-100 dark:bg-[#1c1c20]"
                  } ${struck ? "ring-2 ring-amber-500" : ""}`}
                >
                  {wall && (
                    <IconWall
                      size={20}
                      stroke={2}
                      className={
                        struck
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-gray-500 dark:text-[#8b8b93]"
                      }
                    />
                  )}
                </div>
              );
            })}
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
              const blamed = status === "fail" && run.halt?.row === index;

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
                    className={`flex-1 min-w-0 h-[46px] ${
                      blamed ? "ring-2 ring-amber-500 rounded-[12px]" : ""
                    }`}
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

      {hasWalls && status === "idle" && (
        <div className="mt-3">
          <GameNote>
            Devor turgan katakdan o&apos;tib bo&apos;lmaydi. Yo&apos;lni barmoq bilan
            oldindan chizib chiqing: qaysi katakda burilish kerak?
          </GameNote>
        </div>
      )}

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
