"use client";

import React, { useState, useEffect } from "react";
import { Play, RotateCcw, ChevronRight, CheckCircle2, Search, Zap } from "lucide-react";
import { Button } from "@/design-system/primitives/Button";
import { Badge } from "@/design-system/primitives/Badge";

const INITIAL_ARRAY = [4, 9, 15, 23, 38, 45, 54, 67, 79, 92];

export const AlgorithmVisualizer: React.FC = () => {
  const [target, setTarget] = useState<number>(54);
  const [left, setLeft] = useState<number>(0);
  const [right, setRight] = useState<number>(INITIAL_ARRAY.length - 1);
  const [mid, setMid] = useState<number | null>(null);
  const [step, setStep] = useState<number>(0);
  const [isFound, setIsFound] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stepLog, setStepLog] = useState<string>(
    "Qidirilayotgan sonni tanlang va 'Qadam tashlash' tugmasini bosing."
  );

  const resetSearch = (newTarget: number = target) => {
    setTarget(newTarget);
    setLeft(0);
    setRight(INITIAL_ARRAY.length - 1);
    setMid(null);
    setStep(0);
    setIsFound(false);
    setIsPlaying(false);
    setStepLog(`Nishon: ${newTarget}. Qidiruvni boshlash uchun 'Keyingi qadam'ni bosing.`);
  };

  const nextStep = () => {
    if (isFound || left > right) return;

    const currentMid = Math.floor((left + right) / 2);
    setMid(currentMid);
    const newStep = step + 1;
    setStep(newStep);

    const midVal = INITIAL_ARRAY[currentMid];

    if (midVal === target) {
      setIsFound(true);
      setIsPlaying(false);
      setStepLog(
        `Topildi! Index [${currentMid}] da qiymat ${midVal} ga teng. Binary Search bu nishonni atigi ${newStep} ta qadamda topdi (O(log N))!`
      );
    } else if (midVal < target) {
      setStepLog(
        `Qadam ${newStep}: O'rtadagi element (${midVal}) < ${target}. Chap tomondagi barcha elementlar chetlatildi. Left = ${
          currentMid + 1
        }`
      );
      setLeft(currentMid + 1);
    } else {
      setStepLog(
        `Qadam ${newStep}: O'rtadagi element (${midVal}) > ${target}. O'ng tomondagi barcha elementlar chetlatildi. Right = ${
          currentMid - 1
        }`
      );
      setRight(currentMid - 1);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isFound && left <= right) {
      timer = setTimeout(() => {
        nextStep();
      }, 1200);
    } else if (isPlaying && (isFound || left > right)) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, left, right, isFound, mid]);

  return (
    <div className="w-full rounded-2xl bg-[#0f1218] border border-border-subtle p-5 sm:p-7 shadow-deep">
      {/* Visualizer header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand/30 border border-brand-electric/40 flex items-center justify-center text-brand-light">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              Binary Search Interaktiv Simulyatori
              <Badge variant="success" size="sm">O(log N)</Badge>
            </h4>
            <p className="text-xs text-text-muted">
              Elementlar soni: {INITIAL_ARRAY.length} ta &bull; Saralangan massiv
            </p>
          </div>
        </div>

        {/* Target picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary font-medium">Nishon:</span>
          <div className="flex gap-1.5 bg-bg-card p-1 rounded-lg border border-border-subtle">
            {[15, 54, 79, 92].map((num) => (
              <button
                key={num}
                onClick={() => resetSearch(num)}
                className={`px-2.5 py-1 text-xs rounded font-semibold transition-colors ${
                  target === num
                    ? "bg-brand-electric text-white shadow-glow"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Array visualization bar */}
      <div className="my-6 overflow-x-auto pb-4">
        <div className="flex items-center justify-center gap-2 sm:gap-3 min-w-[500px]">
          {INITIAL_ARRAY.map((val, idx) => {
            const isEliminated = idx < left || idx > right;
            const isMid = idx === mid;
            const isTarget = isFound && val === target;

            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                {/* Pointer tags */}
                <div className="h-5 flex items-center justify-center text-[10px] font-bold">
                  {idx === left && idx === right && (
                    <span className="text-amber-400 font-extrabold">L=R</span>
                  )}
                  {idx === left && idx !== right && (
                    <span className="text-blue-400">Left ({left})</span>
                  )}
                  {idx === right && idx !== left && (
                    <span className="text-purple-400">Right ({right})</span>
                  )}
                </div>

                {/* Array Cell */}
                <div
                  className={`
                    w-11 h-13 sm:w-13 sm:h-15 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-sm sm:text-base
                    border transition-all duration-300 relative
                    ${
                      isTarget
                        ? "bg-accent-green text-black border-white shadow-glow-green scale-110 z-10"
                        : isMid
                        ? "bg-brand-electric text-white border-brand-light shadow-glow scale-105"
                        : isEliminated
                        ? "bg-bg-elevated/30 text-text-dim border-transparent opacity-30 line-through"
                        : "bg-bg-card text-white border-border-medium hover:border-brand-electric/40"
                    }
                  `}
                >
                  <span>{val}</span>
                  <span className="text-[9px] font-sans font-normal text-text-dim block mt-0.5">
                    [{idx}]
                  </span>
                </div>

                {/* Mid pointer indicator */}
                <div className="h-4 flex items-center justify-center">
                  {isMid && (
                    <span className="text-[10px] font-bold text-brand-light animate-pulse">
                      MID
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time explanation log */}
      <div className="p-4 rounded-xl bg-[#141822] border border-border-subtle flex items-start gap-3 mb-5">
        {isFound ? (
          <CheckCircle2 className="w-5 h-5 text-accent-green shrink-0 mt-0.5" />
        ) : (
          <Zap className="w-5 h-5 text-brand-light shrink-0 mt-0.5 animate-pulse" />
        )}
        <div className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          <span className="font-semibold text-white block mb-0.5">
            {isFound ? "Muvaffaqiyatli yakunlandi!" : `Qadam ${step} / Maks 4`}
          </span>
          {stepLog}
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            disabled={isFound || left > right}
            onClick={nextStep}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Keyingi Qadam
          </Button>

          <Button
            size="sm"
            variant="secondary"
            disabled={isFound || left > right}
            onClick={() => setIsPlaying(!isPlaying)}
            leftIcon={<Play className={`w-3.5 h-3.5 ${isPlaying ? "text-accent-green" : ""}`} />}
          >
            {isPlaying ? "To'xtatish" : "Avto Ijro"}
          </Button>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => resetSearch(target)}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Qayta Boshlash
        </Button>
      </div>
    </div>
  );
};
