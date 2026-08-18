"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconX,
  IconBolt,
  IconRotate2,
  IconCheck,
  IconChevronDown,
  IconSparkles,
  IconArrowRight,
  IconInfoCircle,
} from "@tabler/icons-react";

interface InteractiveLessonEngineProps {
  moduleId: string;
  lessonId: string;
}

type ColorChoice = "blue" | "yellow" | "green" | "red" | "purple";

interface ShapeState {
  circle: ColorChoice;
  hexagon: ColorChoice;
  triangle: ColorChoice;
}

const COLOR_MAP: Record<ColorChoice, { hex: string; label: string; dot: string }> = {
  blue:   { hex: "#3B82F6", label: '"blue"',   dot: "bg-blue-500" },
  yellow: { hex: "#EAB308", label: '"yellow"', dot: "bg-yellow-400" },
  green:  { hex: "#22C55E", label: '"green"',  dot: "bg-green-500" },
  red:    { hex: "#EF4444", label: '"red"',    dot: "bg-red-500" },
  purple: { hex: "#A855F7", label: '"purple"', dot: "bg-purple-500" },
};

const ALL_COLORS: ColorChoice[] = ["yellow", "blue", "green", "red", "purple"];

const STEPS = [
  {
    prompt: "Set the color of all shapes to",
    highlight: "yellow",
    subtext: "Use the dropdowns to change each color.",
    check: (s: ShapeState) => s.circle === "yellow" && s.hexagon === "yellow" && s.triangle === "yellow",
    hint: 'Change all three dropdowns to "yellow".',
    explanation: 'Each draw command accepts a color string. Setting all three to "yellow" fills every shape with the same color.',
    solutionLabel: 'draw circle · hexagon · triangle all to "yellow"',
  },
  {
    prompt: "Set circle to",
    highlight: "green",
    promptSuffix: "and hexagon to",
    highlight2: "yellow",
    subtext: "Only change the relevant dropdowns.",
    check: (s: ShapeState) => s.circle === "green" && s.hexagon === "yellow",
    hint: 'Circle → "green", Hexagon → "yellow", Triangle stays any.',
    explanation: 'Variables let you control each shape independently. circle = "green" and hexagon = "yellow".',
    solutionLabel: 'circle → "green", hexagon → "yellow"',
  },
  {
    prompt: "Make all shapes the same color. Pick any",
    highlight: "one color",
    subtext: "All three dropdowns must match.",
    check: (s: ShapeState) => s.circle === s.hexagon && s.hexagon === s.triangle,
    hint: "All three must be the same color — any color works.",
    explanation: "Consistency in state means one variable can control all shapes.",
    solutionLabel: "All three set to any matching color",
  },
  {
    prompt: "Set triangle to",
    highlight: "red",
    promptSuffix: "and the rest to",
    highlight2: "blue",
    subtext: "Pay attention to which shape is which.",
    check: (s: ShapeState) => s.triangle === "red" && s.circle === "blue" && s.hexagon === "blue",
    hint: 'Triangle → "red", Circle & Hexagon → "blue".',
    explanation: "Conditional logic lets specific shapes differ from the rest.",
    solutionLabel: 'circle/hexagon → "blue", triangle → "red"',
  },
];

export const InteractiveLessonEngine: React.FC<InteractiveLessonEngineProps> = ({
  moduleId,
  lessonId,
}) => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const totalSteps = STEPS.length;

  const [colors, setColors] = useState<ShapeState>({ circle: "blue", hexagon: "blue", triangle: "blue" });
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);
  const [openDrop, setOpenDrop] = useState<keyof ShapeState | null>(null);
  const [energyXP, setEnergyXP] = useState(0);
  const [xpFlash, setXpFlash] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    const handler = () => setOpenDrop(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const challenge = STEPS[step];

  const resetColors = () => {
    setColors({ circle: "blue", hexagon: "blue", triangle: "blue" });
    setStatus(null);
  };

  const handleColorSelect = (shape: keyof ShapeState, color: ColorChoice) => {
    setColors((p) => ({ ...p, [shape]: color }));
    setStatus(null);
  };

  const handleCheck = async () => {
    const isCorrect = challenge.check(colors);
    setStatus(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      const earned = 15;
      setEnergyXP((p) => p + earned);
      setXpFlash(true);
      setTimeout(() => setXpFlash(false), 1800);

      if (typeof window !== "undefined") {
        try {
          const confetti = (await import("canvas-confetti")).default;
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 }, colors: ["#22C55E", "#EAB308", "#3B82F6"] });
        } catch { /* noop */ }
      }
    }
  };

  const handleContinue = () => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      resetColors();
    } else {
      router.push(`/courses/${moduleId}`);
    }
  };

  // Color Dropdown component
  const ColorDropdown = ({ shape }: { shape: keyof ShapeState }) => (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpenDrop(openDrop === shape ? null : shape)}
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#2a2a2f] hover:bg-[#35353c] border border-white/10 text-[#a78bfa] text-xs font-bold font-mono transition-colors cursor-pointer"
      >
        {COLOR_MAP[colors[shape]].label}
        <IconChevronDown size={11} />
      </button>

      {openDrop === shape && (
        <div className="absolute left-0 top-full mt-1 w-28 bg-[#1c1c22] border border-white/10 rounded-xl shadow-2xl py-1 z-50 overflow-hidden">
          {ALL_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { handleColorSelect(shape, c); setOpenDrop(null); }}
              className="w-full px-3 py-1.5 text-left text-xs font-bold hover:bg-white/5 flex items-center gap-2 text-gray-200 cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-full ${COLOR_MAP[c].dot} shrink-0`} />
              <span className="font-mono">{COLOR_MAP[c].label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col font-sans select-none">

      {/* ── TOP BAR ── */}
      <div className="flex items-center gap-4 px-5 py-3 shrink-0">
        {/* Close */}
        <Link
          href={`/courses/${moduleId}`}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/8 transition-colors shrink-0"
        >
          <IconX size={18} stroke={2} />
        </Link>

        {/* Progress bar — screenshot style: filled segment + dot indicators */}
        <div className="flex-1 flex items-center gap-2">
          {/* Green filled bar */}
          <div className="flex-1 h-[6px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
              style={{ width: `${((step + (status === "correct" ? 1 : 0)) / totalSteps) * 100}%` }}
            />
          </div>
          {/* Step dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            {Array.from({ length: totalSteps - 1 }).map((_, i) => {
              const done = i < step || (i === step - 1 && status === "correct");
              return (
                <div
                  key={i}
                  className={`w-[7px] h-[7px] rounded-full transition-all duration-300 ${
                    done ? "bg-[#22C55E]" : "bg-white/20"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* XP Badge */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold font-mono transition-all duration-300 shrink-0 ${
          xpFlash
            ? "bg-[#22C55E]/15 border-[#22C55E] text-[#22C55E] scale-110"
            : "bg-transparent border-white/10 text-gray-400"
        }`}>
          {xpFlash && <span className="text-[#22C55E]">+15</span>}
          {!xpFlash && <span>{energyXP}</span>}
          <IconBolt size={13} className={xpFlash ? "fill-[#22C55E] text-[#22C55E]" : "fill-amber-400 text-amber-400"} />
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24 pt-6 gap-6">

        {/* Instruction */}
        <p className="text-center text-sm sm:text-[15px] text-gray-200 font-medium leading-snug max-w-md">
          {challenge.prompt}{" "}
          <span className="inline-flex items-center px-2 py-0.5 rounded-[5px] bg-[#1e1e22] border border-white/10 font-bold text-white font-mono text-[13px]">
            {challenge.highlight}
          </span>
          {challenge.promptSuffix && (
            <>
              {" "}{challenge.promptSuffix}{" "}
              <span className="inline-flex items-center px-2 py-0.5 rounded-[5px] bg-[#1e1e22] border border-white/10 font-bold text-white font-mono text-[13px]">
                {challenge.highlight2}
              </span>
            </>
          )}
          {" "}.
        </p>

        {/* Interactive Card */}
        <div className={`w-full max-w-[340px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
          status === "correct"
            ? "ring-2 ring-[#22C55E]/70 shadow-[0_0_32px_rgba(34,197,94,0.2)]"
            : status === "wrong"
            ? "ring-2 ring-amber-500/60 shadow-[0_0_28px_rgba(245,158,11,0.18)]"
            : ""
        }`}>

          {/* Canvas Preview — white background */}
          <div className="relative bg-white flex items-center justify-center" style={{ height: 200 }}>
            {/* Status badge */}
            {status === "wrong" && (
              <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-lg bg-red-500 flex items-center justify-center shadow">
                <IconX size={14} stroke={2.5} className="text-white" />
              </div>
            )}
            {status === "correct" && (
              <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-lg bg-[#22C55E] flex items-center justify-center shadow">
                <IconCheck size={14} stroke={2.5} className="text-white" />
              </div>
            )}

            <svg viewBox="0 0 220 170" className="w-full h-full px-6 py-5">
              <circle
                cx="110" cy="85" r="58"
                fill={COLOR_MAP[colors.circle].hex}
                stroke="#1a1a2e" strokeWidth="1.5"
                style={{ transition: "fill 0.25s" }}
              />
              <polygon
                points="110,30 161,59 161,117 110,146 59,117 59,59"
                fill={COLOR_MAP[colors.hexagon].hex}
                stroke="#1a1a2e" strokeWidth="1.5"
                style={{ transition: "fill 0.25s" }}
              />
              <polygon
                points="110,146 59,59 161,59"
                fill={COLOR_MAP[colors.triangle].hex}
                stroke="#1a1a2e" strokeWidth="1.5"
                style={{ transition: "fill 0.25s" }}
              />
            </svg>
          </div>

          {/* Code Blocks */}
          <div className="bg-[#181820] border-t border-white/5 px-4 pt-3 pb-2 space-y-2.5 font-mono text-xs">
            {(["circle", "hexagon", "triangle"] as const).map((shape, i) => (
              <div key={shape} className="flex items-center gap-2.5">
                <span className="text-white/20 w-3 text-right text-[11px] shrink-0">{i + 1}</span>
                <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#22C55E]/10 text-[#4ade80] border border-[#22C55E]/20 shrink-0">draw</span>
                <span className="text-gray-400 shrink-0">{shape}</span>
                <ColorDropdown shape={shape} />
              </div>
            ))}

            {/* Start over */}
            <div className="flex justify-end pt-0.5 pb-0.5">
              <button
                type="button"
                onClick={resetColors}
                className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-gray-300 transition-colors cursor-pointer"
              >
                <IconRotate2 size={11} />
                Start over
              </button>
            </div>
          </div>
        </div>

        {/* Wrong state hint */}
        {status === "wrong" && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 max-w-[340px] w-full">
            <span className="text-amber-400 text-xs font-bold">{challenge.hint}</span>
          </div>
        )}

        {/* Correct state explanation teaser */}
        {status === "correct" && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/25 max-w-[340px] w-full">
            <IconCheck size={15} className="text-[#22C55E] shrink-0" />
            <span className="text-[#4ade80] text-xs font-bold">That&apos;s it! Well done.</span>
          </div>
        )}
      </div>

      {/* ── FIXED BOTTOM BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-5 pt-3 bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/95 to-transparent flex flex-col items-center gap-2">
        {status === null && (
          <button
            type="button"
            onClick={handleCheck}
            className="w-full max-w-[340px] py-3.5 rounded-full bg-[#2a2a2f] hover:bg-[#33333a] text-gray-300 text-sm font-bold transition-all cursor-pointer"
          >
            Check
          </button>
        )}

        {status === "wrong" && (
          <div className="w-full max-w-[340px] flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowSolution(true)}
              className="flex-1 py-3.5 rounded-full bg-[#1e1e24] hover:bg-[#27272f] text-white text-sm font-bold border border-white/10 cursor-pointer transition-all"
            >
              See answer
            </button>
            <button
              type="button"
              onClick={handleCheck}
              className="flex-1 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold cursor-pointer active:scale-[0.98] transition-all"
            >
              Try again
            </button>
          </div>
        )}

        {status === "correct" && (
          <div className="w-full max-w-[340px] flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowWhy(true)}
              className="px-5 py-3.5 rounded-full bg-[#1e1e24] hover:bg-[#27272f] text-white text-sm font-bold border border-white/10 cursor-pointer transition-all shrink-0"
            >
              Why?
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="flex-1 py-3.5 rounded-full bg-[#22C55E] hover:bg-[#16a34a] text-white text-sm font-bold cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              Continue
              <IconArrowRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* ── WHY? MODAL ── */}
      {showWhy && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWhy(false)} />
          <div className="relative w-full max-w-sm bg-[#19191e] rounded-2xl border border-white/10 p-5 z-10 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#22C55E]">
                <IconSparkles size={17} />
                <span className="font-bold text-sm">Why is this correct?</span>
              </div>
              <button onClick={() => setShowWhy(false)} className="text-gray-500 hover:text-white cursor-pointer">
                <IconX size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{challenge.explanation}</p>
            <button
              type="button"
              onClick={() => setShowWhy(false)}
              className="w-full py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] font-bold text-sm text-white cursor-pointer transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ── SEE ANSWER MODAL ── */}
      {showSolution && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSolution(false)} />
          <div className="relative w-full max-w-sm bg-[#19191e] rounded-2xl border border-white/10 p-5 z-10 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <IconInfoCircle size={17} />
                <span className="font-bold text-sm">Correct solution</span>
              </div>
              <button onClick={() => setShowSolution(false)} className="text-gray-500 hover:text-white cursor-pointer">
                <IconX size={16} />
              </button>
            </div>
            <div className="bg-black/40 rounded-xl px-4 py-3 font-mono text-xs text-amber-300">
              {challenge.solutionLabel}
            </div>
            <button
              type="button"
              onClick={() => setShowSolution(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-sm text-black cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
