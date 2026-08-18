"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IconStarFilled,
  IconArrowUp,
  IconRotateClockwise,
  IconRotate,
  IconRotate2,
  IconX,
} from "@tabler/icons-react";

/** The commands a learner can drag into the program. */
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
    tone: "bg-[#26B54F] hover:bg-[#2ac457] shadow-[0_4px_0_0_#177F37]",
  },
  {
    id: "right",
    label: "o'ngga",
    Icon: IconRotateClockwise,
    tone: "bg-[#7C5CE0] hover:bg-[#8a6bea] shadow-[0_4px_0_0_#563DA6]",
  },
  {
    id: "left",
    label: "chapga",
    Icon: IconRotate,
    tone: "bg-[#E0A13C] hover:bg-[#eaad4a] shadow-[0_4px_0_0_#A87526]",
  },
];

const COMMAND_BY_ID = new Map(COMMANDS.map((c) => [c.id, c]));

// ── Puzzle definition ───────────────────────────────────────────────────────

const GRID = 4;
const START = { x: 0, y: 0 };
const TARGET = { x: 2, y: 1 };
const SLOT_COUNT = 4;

type Facing = "up" | "right" | "down" | "left";
const CLOCKWISE: Facing[] = ["up", "right", "down", "left"];

interface RobotState {
  x: number;
  y: number;
  facing: Facing;
}

/** Runs the program and returns the state after each command, for animation. */
function simulate(program: (Command | null)[]): RobotState[] {
  const frames: RobotState[] = [{ ...START, facing: "right" }];
  let current: RobotState = { ...START, facing: "right" };

  for (const command of program) {
    if (!command) continue;
    const next = { ...current };

    if (command === "forward") {
      if (next.facing === "right") next.x = Math.min(GRID - 1, next.x + 1);
      if (next.facing === "left") next.x = Math.max(0, next.x - 1);
      if (next.facing === "down") next.y = Math.min(GRID - 1, next.y + 1);
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

const FACING_ROTATION: Record<Facing, number> = {
  up: 0,
  right: 90,
  down: 180,
  left: 270,
};

interface RobotPuzzleProps {
  /** Fired once, the first time the robot lands on the star. */
  onSolved: () => void;
  /** Tells the runner whether its footer Check button should be active. */
  onReadyChange: (ready: boolean) => void;
  /** Hands the runner the check action so its footer can drive it. */
  registerCheck: (check: () => void) => void;
}

export function RobotPuzzle({
  onSolved,
  onReadyChange,
  registerCheck,
}: RobotPuzzleProps) {
  const [slots, setSlots] = useState<(Command | null)[]>(
    Array(SLOT_COUNT).fill(null)
  );
  const [runFrame, setRunFrame] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<"idle" | "success" | "fail">("idle");

  // Pointer drag state — pointer events cover mouse and touch alike.
  const [drag, setDrag] = useState<{
    command: Command;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);

  const filledCount = slots.filter(Boolean).length;
  const frames = useMemo(() => simulate(slots), [slots]);
  const robot = frames[runFrame ?? 0] ?? frames[0];
  const finalState = frames[frames.length - 1];

  const reported = useRef(false);

  useEffect(() => {
    onReadyChange(filledCount > 0 && runFrame === null);
  }, [filledCount, runFrame, onReadyChange]);

  const runProgram = useCallback(() => {
    if (filledCount === 0) return;
    setVerdict("idle");
    setRunFrame(0);

    // Step through the frames so the learner can see what their program does.
    let frame = 0;
    const timer = setInterval(() => {
      frame += 1;
      if (frame >= frames.length) {
        clearInterval(timer);
        const last = frames[frames.length - 1];
        const won = last.x === TARGET.x && last.y === TARGET.y;
        setVerdict(won ? "success" : "fail");
        setRunFrame(null);
        if (won && !reported.current) {
          reported.current = true;
          onSolved();
        }
        return;
      }
      setRunFrame(frame);
    }, 420);
  }, [frames, filledCount, onSolved]);

  useEffect(() => {
    registerCheck(runProgram);
  }, [registerCheck, runProgram]);

  // ── Slot mutation ────────────────────────────────────────────────────────

  const placeAt = (index: number, command: Command) => {
    setVerdict("idle");
    setSlots((prev) => {
      const next = [...prev];
      next[index] = command;
      return next;
    });
  };

  const appendCommand = (command: Command) => {
    const firstEmpty = slots.findIndex((s) => s === null);
    if (firstEmpty === -1) return;
    placeAt(firstEmpty, command);
  };

  const clearSlot = (index: number) => {
    setVerdict("idle");
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const resetAll = () => {
    setVerdict("idle");
    setRunFrame(null);
    reported.current = false;
    setSlots(Array(SLOT_COUNT).fill(null));
  };

  // ── Drag handlers ────────────────────────────────────────────────────────

  const startDrag = (command: Command) => (e: React.PointerEvent) => {
    if (runFrame !== null) return;
    dragOrigin.current = { x: e.clientX, y: e.clientY };
    setDrag({ command, x: e.clientX, y: e.clientY, moved: false });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const moveDrag = (e: React.PointerEvent) => {
    if (!drag || !dragOrigin.current) return;
    const dx = e.clientX - dragOrigin.current.x;
    const dy = e.clientY - dragOrigin.current.y;
    const moved = drag.moved || Math.hypot(dx, dy) > 6;
    setDrag({ ...drag, x: e.clientX, y: e.clientY, moved });
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!drag) return;

    if (!drag.moved) {
      // Treated as a tap: drop it into the first free slot.
      appendCommand(drag.command);
    } else {
      // Find the slot under the pointer without relying on HTML5 drop events,
      // which never fire on touch devices.
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const slotEl = el?.closest("[data-slot-index]") as HTMLElement | null;
      if (slotEl) placeAt(Number(slotEl.dataset.slotIndex), drag.command);
    }

    dragOrigin.current = null;
    setDrag(null);
  };

  const isRunning = runFrame !== null;
  const cellSize = 100 / GRID;

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-center text-[20px] sm:text-[24px] font-semibold leading-snug text-white">
        Robotni yulduz turgan katakka olib boring.
      </h2>
      <p className="mt-2 text-center text-[14px] text-[#8b8b93] max-w-[420px]">
        Bloklarni pastdan ushlab, qatorlarga tashlang — yoki ustiga bosing.
      </p>

      <div className="mt-7 w-full max-w-[460px] rounded-[20px] border border-[#26262a] bg-[#141416] overflow-hidden">

        {/* ── Grid ── */}
        <div className="p-4 sm:p-6 bg-[#101013]">
          <div className="relative w-full aspect-square max-w-[300px] mx-auto">
            {/* Cells */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1.5">
              {Array.from({ length: GRID * GRID }).map((_, i) => (
                <div key={i} className="rounded-[8px] bg-[#1c1c20]" />
              ))}
            </div>

            {/* Target */}
            <div
              className="absolute flex items-center justify-center transition-all duration-300"
              style={{
                left: `${TARGET.x * cellSize}%`,
                top: `${TARGET.y * cellSize}%`,
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
                  verdict === "success"
                    ? "bg-[#26B54F]"
                    : verdict === "fail"
                    ? "bg-[#E0A13C]"
                    : "bg-[#3B82F6]"
                }`}
                style={{ transform: `rotate(${FACING_ROTATION[robot.facing]}deg)` }}
              >
                <IconArrowUp size={22} stroke={3} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Program slots ── */}
        <div className="px-4 sm:px-5 py-4 border-t border-[#26262a]">
          <div className="flex flex-col gap-2">
            {slots.map((command, index) => {
              const spec = command ? COMMAND_BY_ID.get(command) : undefined;
              const isCurrent = isRunning && runFrame !== null && index < runFrame;

              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-4 shrink-0 text-right font-mono text-[13px] text-[#5c5c64]">
                    {index + 1}
                  </span>

                  <div
                    data-slot-index={index}
                    className={`flex-1 min-w-0 h-[46px] rounded-[12px] flex items-center transition-colors ${
                      spec
                        ? "border-2 border-transparent"
                        : `border-2 border-dashed ${
                            drag?.moved ? "border-[#26B54F]/70 bg-[#26B54F]/[0.06]" : "border-[#3a3a41]"
                          }`
                    }`}
                  >
                    {spec ? (
                      <div
                        className={`w-full h-full rounded-[10px] flex items-center gap-2.5 px-3.5 text-white font-bold text-[14px] ${spec.tone} ${
                          isCurrent ? "ring-2 ring-white/40" : ""
                        }`}
                      >
                        <spec.Icon size={17} stroke={2.6} className="shrink-0" />
                        <span className="font-mono truncate">{spec.label}</span>
                        {!isRunning && (
                          <button
                            type="button"
                            onClick={() => clearSlot(index)}
                            aria-label={`${index + 1}-qatorni tozalash`}
                            className="ml-auto shrink-0 w-6 h-6 rounded-full bg-black/25 hover:bg-black/40 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <IconX size={13} stroke={3} />
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Palette ── */}
        <div className="px-4 sm:px-5 py-4 border-t border-[#26262a] bg-[#17171a]">
          <div className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-[#6d6d74] mb-2.5">
            Bloklar
          </div>

          <div className="flex flex-wrap gap-2.5">
            {COMMANDS.map((spec) => (
              <button
                key={spec.id}
                type="button"
                disabled={isRunning}
                onPointerDown={startDrag(spec.id)}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className={`select-none touch-none rounded-[12px] px-3.5 py-2.5 flex items-center gap-2 text-white font-bold text-[14px] transition-all active:translate-y-[3px] active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed ${spec.tone} ${
                  isRunning ? "" : "cursor-grab"
                }`}
              >
                <spec.Icon size={17} stroke={2.6} />
                <span className="font-mono">{spec.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[12px] text-[#6d6d74]">
              {filledCount}/{SLOT_COUNT} qator to&apos;ldirildi
            </span>
            <button
              type="button"
              onClick={resetAll}
              disabled={isRunning}
              className="flex items-center gap-1.5 font-mono text-[13px] text-[#6f6f77] hover:text-[#a1a1aa] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <IconRotate2 size={14} stroke={2} />
              <span>Start over</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Verdict ── */}
      {verdict !== "idle" && (
        <div className="mt-6 flex flex-col items-center gap-1.5">
          <p
            className={`text-[15px] font-semibold ${
              verdict === "success" ? "text-[#4ADE80]" : "text-amber-400"
            }`}
          >
            {verdict === "success"
              ? "Ajoyib! Yulduz qo'lga kiritildi."
              : "Robot yulduzga yetib bormadi."}
          </p>
          {verdict === "fail" && (
            <p className="max-w-[420px] text-center text-[13px] text-[#8b8b93]">
              Robot {finalState.x + 1}-ustun, {finalState.y + 1}-qatorda to&apos;xtadi.
              Yulduz 3-ustun, 2-qatorda — qadamlarni qayta hisoblang.
            </p>
          )}
        </div>
      )}

      {/* Drag ghost follows the pointer */}
      {drag?.moved && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: drag.x, top: drag.y }}
        >
          {(() => {
            const spec = COMMAND_BY_ID.get(drag.command)!;
            return (
              <div
                className={`rounded-[12px] px-3.5 py-2.5 flex items-center gap-2 text-white font-bold text-[14px] opacity-90 ${spec.tone}`}
              >
                <spec.Icon size={17} stroke={2.6} />
                <span className="font-mono">{spec.label}</span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
