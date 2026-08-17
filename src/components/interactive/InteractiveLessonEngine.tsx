"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconX,
  IconBolt,
  IconRotate2,
  IconPlayerPlay,
  IconSettings,
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

const colorMap: Record<ColorChoice, { hex: string; name: string; bgClass: string }> = {
  blue: { hex: "#3B82F6", name: '"blue"', bgClass: "bg-blue-500" },
  yellow: { hex: "#EAB308", name: '"yellow"', bgClass: "bg-yellow-400" },
  green: { hex: "#22C55E", name: '"green"', bgClass: "bg-green-500" },
  red: { hex: "#EF4444", name: '"red"', bgClass: "bg-red-500" },
  purple: { hex: "#A855F7", name: '"purple"', bgClass: "bg-purple-500" },
};

export const InteractiveLessonEngine: React.FC<InteractiveLessonEngineProps> = ({
  moduleId,
  lessonId,
}) => {
  const router = useRouter();

  // Current Step Index (1 of 4)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Energy / Lightning XP Score
  const [energyScore, setEnergyScore] = useState(0);
  const [energyGlow, setEnergyGlow] = useState(false);

  // Shape color states
  const [shapeColors, setShapeColors] = useState<ShapeState>({
    circle: "blue",
    hexagon: "blue",
    triangle: "blue",
  });

  // Evaluated status: null = neutral, "correct" = all yellow, "wrong" = not all yellow
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);

  // Modals for "Why?" and "See answer"
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);

  // Dropdown open states for each line
  const [openDropdown, setOpenDropdown] = useState<"circle" | "hexagon" | "triangle" | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = () => setOpenDropdown(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleColorSelect = (shape: keyof ShapeState, color: ColorChoice) => {
    setShapeColors((prev) => ({ ...prev, [shape]: color }));
    // Reset status when user changes inputs
    setStatus(null);
  };

  const handleStartOver = () => {
    setShapeColors({
      circle: "blue",
      hexagon: "blue",
      triangle: "blue",
    });
    setStatus(null);
  };

  const handleCheck = async () => {
    const isAllYellow =
      shapeColors.circle === "yellow" &&
      shapeColors.hexagon === "yellow" &&
      shapeColors.triangle === "yellow";

    if (isAllYellow) {
      setStatus("correct");
      setEnergyScore((prev) => prev + 15);
      setEnergyGlow(true);
      setTimeout(() => setEnergyGlow(false), 2000);

      // Trigger celebration confetti dynamically on client
      if (typeof window !== "undefined") {
        try {
          const confetti = (await import("canvas-confetti")).default;
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.65 },
            colors: ["#22C55E", "#EAB308", "#3B82F6", "#A855F7"],
          });
        } catch (e) {
          console.error("Confetti error", e);
        }
      }
    } else {
      setStatus("wrong");
    }
  };

  const handleApplySolution = () => {
    setShapeColors({
      circle: "yellow",
      hexagon: "yellow",
      triangle: "yellow",
    });
    setStatus(null);
    setShowSolutionModal(false);
  };

  const handleContinue = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1);
      handleStartOver();
    } else {
      // Completed all steps -> return to roadmap
      router.push(`/courses/${moduleId}`);
    }
  };

  // Border glow styling based on status
  const frameBorderClass =
    status === "correct"
      ? "border-2 border-[#22C55E] glow-border-green"
      : status === "wrong"
      ? "border-2 border-amber-500 glow-border-amber"
      : "border-2 border-gray-200 dark:border-zinc-800/80";

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F11] text-black dark:text-white flex flex-col font-sans select-none overflow-x-hidden transition-colors duration-200">
      
      {/* ========================================================= */}
      {/* 1. TOP HEADER (Progress, Close, Energy Streak)            */}
      {/* ========================================================= */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between z-20">
        {/* Close ('X') button back to roadmap */}
        <Link
          href={`/courses/${moduleId}`}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-gray-200 dark:border-zinc-800"
          title="Chiqish"
        >
          <IconX size={18} stroke={2} />
        </Link>

        {/* Step Progress Segments */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep || (stepNum === currentStep && status === "correct");
            const isCurrent = stepNum === currentStep;

            return (
              <div
                key={idx}
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? "w-8 sm:w-12 bg-[#22C55E]"
                    : isCurrent
                    ? "w-8 sm:w-12 bg-[#22C55E]/60 animate-pulse"
                    : "w-2.5 sm:w-3 bg-gray-200 dark:bg-zinc-700"
                }`}
              />
            );
          })}
        </div>

        {/* Energy Streak Counter */}
        <div
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 dark:bg-zinc-900 border transition-all duration-300 ${
            energyGlow
              ? "border-[#22C55E] text-[#22C55E] scale-110 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
              : "border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300"
          }`}
        >
          <span className="text-xs sm:text-sm font-mono font-bold">
            {energyScore}
          </span>
          <IconBolt
            size={16}
            className={energyGlow ? "text-[#22C55E] fill-[#22C55E] animate-bounce" : "text-amber-400 fill-amber-400"}
          />
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN INTERACTIVE AREA with Ambient Dynamic Frame       */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col justify-between w-full max-w-5xl mx-auto px-4 sm:px-6 py-2 sm:py-6">
        
        {/* Dynamic Frame Container */}
        <div
          className={`relative w-full rounded-[20px] bg-gray-50 dark:bg-[#141416] p-4 sm:p-8 transition-all duration-300 flex flex-col items-center justify-between min-h-[560px] shadow-xs ${frameBorderClass}`}
        >
          
          {/* Top Instruction Prompt */}
          <div className="text-center mb-6">
            <h2 className="text-base sm:text-xl font-extrabold text-black dark:text-white tracking-tight">
              {currentStep === 1
                ? "Make all the shapes yellow."
                : currentStep === 2
                ? "Set circle to green and triangle to yellow."
                : "Match the required shape geometry."}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Barcha shakllarni mos ranglar bilan belgilang va tekshiring.
            </p>
          </div>

          {/* Center Workspace (Canvas + Code Editor) */}
          <div className="w-full max-w-md bg-white dark:bg-[#09090B] rounded-[15px] border-2 border-gray-200 dark:border-zinc-800 overflow-hidden shadow-xl transition-colors">
            
            {/* Top Preview Canvas */}
            <div className="relative bg-white w-full h-[190px] sm:h-[210px] flex items-center justify-center p-3 border-b border-gray-100 dark:border-zinc-800">
              
              {/* Settings / Gear icon on top right */}
              <div className="absolute top-2 right-2 w-7 h-7 rounded-[8px] bg-red-100 text-red-500 flex items-center justify-center cursor-pointer hover:bg-red-200 transition-colors">
                <IconSettings size={16} />
              </div>

              {/* Status Badge on top left */}
              {status === "wrong" && (
                <div className="absolute top-2 left-2 w-7 h-7 rounded-[8px] bg-red-500 text-white flex items-center justify-center shadow-sm animate-shake">
                  <IconX size={16} stroke={3} />
                </div>
              )}
              {status === "correct" && (
                <div className="absolute top-2 left-2 w-7 h-7 rounded-[8px] bg-[#22C55E] text-white flex items-center justify-center shadow-sm animate-bounce">
                  <IconCheck size={16} stroke={3} />
                </div>
              )}

              {/* Live Rendered Geometric SVG Shapes */}
              <svg
                viewBox="0 0 240 180"
                className="w-full h-full max-h-[170px]"
              >
                {/* 1. Circle */}
                <circle
                  cx="120"
                  cy="90"
                  r="62"
                  fill={colorMap[shapeColors.circle].hex}
                  stroke="#18181B"
                  strokeWidth="2.5"
                  className="transition-colors duration-300"
                />

                {/* 2. Inscribed Regular Hexagon */}
                <polygon
                  points="120,32 173.7,61 173.7,119 120,148 66.3,119 66.3,61"
                  fill={colorMap[shapeColors.hexagon].hex}
                  stroke="#18181B"
                  strokeWidth="2.5"
                  className="transition-colors duration-300"
                />

                {/* 3. Inscribed Inverted Triangle */}
                <polygon
                  points="120,148 66.3,61 173.7,61"
                  fill={colorMap[shapeColors.triangle].hex}
                  stroke="#18181B"
                  strokeWidth="2.5"
                  className="transition-colors duration-300"
                />
              </svg>
            </div>

            {/* Bottom Code Blocks Editor */}
            <div className="bg-[#18181B] text-white p-4 sm:p-5 space-y-3 font-mono text-xs sm:text-sm">
              
              {/* Line 1: Circle */}
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 font-bold w-4 text-right select-none">
                  1
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-[6px] bg-[#22C55E]/15 text-[#22C55E] font-bold border border-[#22C55E]/30">
                    draw
                  </span>
                  <span className="text-white font-medium">circle</span>
                  <span className="text-lg">🎨</span>

                  {/* Dropdown 1 */}
                  <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(openDropdown === "circle" ? null : "circle")
                      }
                      className="px-2.5 py-1 rounded-[8px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-green-300 flex items-center gap-1.5 font-bold cursor-pointer transition-colors"
                    >
                      <span>{colorMap[shapeColors.circle].name}</span>
                      <IconChevronDown size={14} />
                    </button>

                    {openDropdown === "circle" && (
                      <div className="absolute left-0 top-full mt-1 w-28 bg-[#18181B] border border-zinc-700 rounded-[10px] shadow-2xl py-1 z-50">
                        {(["yellow", "blue", "green", "red", "purple"] as ColorChoice[]).map(
                          (c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                handleColorSelect("circle", c);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs font-bold hover:bg-zinc-800 flex items-center gap-2 text-gray-200 cursor-pointer"
                            >
                              <span className={`w-2.5 h-2.5 rounded-full ${colorMap[c].bgClass}`} />
                              <span>{colorMap[c].name}</span>
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Line 2: Hexagon */}
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 font-bold w-4 text-right select-none">
                  2
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-[6px] bg-[#22C55E]/15 text-[#22C55E] font-bold border border-[#22C55E]/30">
                    draw
                  </span>
                  <span className="text-white font-medium">hexagon</span>
                  <span className="text-lg">🎨</span>

                  {/* Dropdown 2 */}
                  <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(openDropdown === "hexagon" ? null : "hexagon")
                      }
                      className="px-2.5 py-1 rounded-[8px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-green-300 flex items-center gap-1.5 font-bold cursor-pointer transition-colors"
                    >
                      <span>{colorMap[shapeColors.hexagon].name}</span>
                      <IconChevronDown size={14} />
                    </button>

                    {openDropdown === "hexagon" && (
                      <div className="absolute left-0 top-full mt-1 w-28 bg-[#18181B] border border-zinc-700 rounded-[10px] shadow-2xl py-1 z-50">
                        {(["yellow", "blue", "green", "red", "purple"] as ColorChoice[]).map(
                          (c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                handleColorSelect("hexagon", c);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs font-bold hover:bg-zinc-800 flex items-center gap-2 text-gray-200 cursor-pointer"
                            >
                              <span className={`w-2.5 h-2.5 rounded-full ${colorMap[c].bgClass}`} />
                              <span>{colorMap[c].name}</span>
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Line 3: Triangle */}
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 font-bold w-4 text-right select-none">
                  3
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-[6px] bg-[#22C55E]/15 text-[#22C55E] font-bold border border-[#22C55E]/30">
                    draw
                  </span>
                  <span className="text-white font-medium">triangle</span>
                  <span className="text-lg">🎨</span>

                  {/* Dropdown 3 */}
                  <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(openDropdown === "triangle" ? null : "triangle")
                      }
                      className="px-2.5 py-1 rounded-[8px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-green-300 flex items-center gap-1.5 font-bold cursor-pointer transition-colors"
                    >
                      <span>{colorMap[shapeColors.triangle].name}</span>
                      <IconChevronDown size={14} />
                    </button>

                    {openDropdown === "triangle" && (
                      <div className="absolute left-0 top-full mt-1 w-28 bg-[#18181B] border border-zinc-700 rounded-[10px] shadow-2xl py-1 z-50">
                        {(["yellow", "blue", "green", "red", "purple"] as ColorChoice[]).map(
                          (c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                handleColorSelect("triangle", c);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs font-bold hover:bg-zinc-800 flex items-center gap-2 text-gray-200 cursor-pointer"
                            >
                              <span className={`w-2.5 h-2.5 rounded-full ${colorMap[c].bgClass}`} />
                              <span>{colorMap[c].name}</span>
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Editor Actions Footer (Reset / Run) */}
            <div className="bg-zinc-900 px-4 py-2.5 border-t border-zinc-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleStartOver}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer font-bold font-sans"
              >
                <IconRotate2 size={15} />
                <span>Start over</span>
              </button>

              <button
                type="button"
                onClick={handleCheck}
                className="flex items-center gap-1.5 text-gray-300 hover:text-[#22C55E] transition-colors cursor-pointer font-bold font-sans"
              >
                <IconPlayerPlay size={15} />
                <span>Run</span>
              </button>
            </div>

          </div>

          {/* ========================================================= */}
          {/* 3. MASCOT & BOTTOM ACTION BUTTONS                         */}
          {/* ========================================================= */}
          <div className="w-full mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Mascot on Bottom Left with Reactive Bubble Banner */}
            <div className="flex items-center gap-3">
              {/* Green Cube / Diamond Mascot */}
              <div className="relative">
                <div className="w-10 h-10 rounded-[10px] bg-gradient-to-tr from-[#15803d] to-[#22C55E] border border-[#86efac] shadow-lg flex items-center justify-center rotate-45 animate-pulse">
                  <div className="w-3.5 h-3.5 bg-black rounded-[2px] -rotate-45" />
                </div>
              </div>

              {/* Reactive Speech Bubble Banner */}
              {status === "wrong" && (
                <div className="bg-amber-500 text-black px-3.5 py-1.5 rounded-[12px] text-xs font-extrabold shadow-md animate-fadeIn">
                  All shapes should be yellow.
                </div>
              )}
              {status === "correct" && (
                <div className="bg-[#22C55E] text-white px-3.5 py-1.5 rounded-[12px] text-xs font-extrabold shadow-md animate-fadeIn">
                  That&apos;s it!
                </div>
              )}
            </div>

            {/* Contextual Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Neutral Initial State: "Check" button */}
              {status === null && (
                <button
                  type="button"
                  onClick={handleCheck}
                  className="px-10 py-3 rounded-[15px] bg-[#18181b] hover:bg-black text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black text-sm font-extrabold shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  Check
                </button>
              )}

              {/* Wrong State: "See answer" + "Try again" (Screenshot 3) */}
              {status === "wrong" && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowSolutionModal(true)}
                    className="px-5 py-3 rounded-[15px] bg-gray-200 hover:bg-gray-300 text-black dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white text-sm font-bold transition-all cursor-pointer"
                  >
                    See answer
                  </button>
                  <button
                    type="button"
                    onClick={handleCheck}
                    className="px-8 py-3 rounded-[15px] bg-amber-400 hover:bg-amber-300 text-black text-sm font-extrabold shadow-md transition-all active:scale-[0.99] cursor-pointer"
                  >
                    Try again
                  </button>
                </>
              )}

              {/* Correct State: "Why?" + "Continue" (Screenshot 4) */}
              {status === "correct" && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowExplanation(true)}
                    className="px-5 py-3 rounded-[15px] bg-gray-200 hover:bg-gray-300 text-black dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white text-sm font-bold transition-all cursor-pointer"
                  >
                    Why?
                  </button>
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="px-8 py-3 rounded-[15px] bg-[#22C55E] hover:bg-[#16a34a] text-white text-sm font-extrabold shadow-md transition-all active:scale-[0.99] flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue</span>
                    <IconArrowRight size={16} stroke={2} />
                  </button>
                </>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* ========================================================= */}
      {/* 4. MODALS: "Why?" Explanation & "See answer" Solution    */}
      {/* ========================================================= */}

      {/* "Why?" Explanation Modal (Theme-adaptive) */}
      {showExplanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setShowExplanation(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#19191C] rounded-[15px] border-2 border-gray-200 dark:border-zinc-700 p-6 z-10 animate-scaleIn text-black dark:text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#22C55E]">
                <IconSparkles size={20} />
                <h3 className="text-base font-extrabold">Nima uchun bu to&apos;g&apos;ri?</h3>
              </div>
              <button
                onClick={() => setShowExplanation(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Dasturda har bir shakl qatlamlari ketma-ket chiziladi. Barcha `draw` funksiyalariga `&quot;yellow&quot;` parametri uzatilganda, butun geometriya yagona sariq rangga ega bo&apos;ladi.
            </p>
            <button
              type="button"
              onClick={() => setShowExplanation(false)}
              className="w-full py-2.5 rounded-[15px] bg-[#22C55E] hover:bg-[#16a34a] font-bold text-sm text-white cursor-pointer"
            >
              Tushundim
            </button>
          </div>
        </div>
      )}

      {/* "See Answer" Solution Modal (Theme-adaptive) */}
      {showSolutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setShowSolutionModal(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#19191C] rounded-[15px] border-2 border-gray-200 dark:border-zinc-700 p-6 z-10 animate-scaleIn text-black dark:text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-500">
                <IconInfoCircle size={20} />
                <h3 className="text-base font-extrabold">To&apos;g&apos;ri yechim</h3>
              </div>
              <button
                onClick={() => setShowSolutionModal(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>
            <div className="bg-gray-900 text-yellow-300 p-3 rounded-[10px] font-mono text-xs space-y-1">
              <div>1  draw circle &quot;yellow&quot;</div>
              <div>2  draw hexagon &quot;yellow&quot;</div>
              <div>3  draw triangle &quot;yellow&quot;</div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Ushbu parametrlar barcha 3 ta shaklni sariq rangga o&apos;zgartiradi.
            </p>
            <button
              type="button"
              onClick={handleApplySolution}
              className="w-full py-2.5 rounded-[15px] bg-amber-400 hover:bg-amber-300 font-extrabold text-sm text-black cursor-pointer"
            >
              Yechimni qo&apos;llash
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
