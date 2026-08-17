"use client";

import React, { useState, useEffect } from "react";
import { IconPlayerPlay, IconRotate2, IconChevronRight, IconCircleCheckFilled, IconSearch, IconBolt } from "@tabler/icons-react";
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

  // Auto-play interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isFound && left <= right) {
      timer = setTimeout(() => {
        nextStep();
      }, 900);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, isFound, left, right, step]);

  return (
    <div className="w-full rounded-2xl bg-[#0f1218] border border-border-subtle p-5 sm:p-7 shadow-deep">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-green/20 border border-accent-green/40 flex items-center justify-center text-accent-green">
            <IconSearch size={16} stroke={2} />
          </div>
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              Algoritmlar Laboratoriyasi: Binary Search Vizualizatori
            </h4>
            <p className="text-xs text-text-muted">
              Har bir qadamda qidiruv maydoni 50% ga qisqaradi — O(log N) murakkablik
            </p>
          </div>
        </div>

        {/* Complexity badge */}
        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm">
            Vaqt: O(log N)
          </Badge>
          <Badge variant="brand" size="sm">
            Xotira: O(1)
          </Badge>
        </div>
      </div>

      {/* Target selector pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs font-semibold text-text-secondary">Nishon qiymat:</span>
        <div className="flex flex-wrap gap-1.5">
          {INITIAL_ARRAY.map((val) => (
            <button
              key={val}
              onClick={() => resetSearch(val)}
              className={`w-9 h-8 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                target === val
                  ? "bg-brand-electric text-white shadow-glow scale-105"
                  : "bg-bg-card border border-border-subtle text-text-secondary hover:text-white hover:border-border-medium"
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Array Canvas */}
      <div className="mb-6 p-4 rounded-xl bg-bg-card border border-border-subtle overflow-x-auto">
        <div className="flex items-center justify-center min-w-[500px] gap-2 sm:gap-2.5 py-4">
          {INITIAL_ARRAY.map((val, idx) => {
            const isMid = mid === idx;
            const isEliminated = idx < left || idx > right;
            const isTarget = isFound && val === target;

            let cardStyles = "bg-bg-elevated border-border-medium text-white";
            if (isTarget) {
              cardStyles = "bg-accent-green text-black border-accent-green shadow-glow-green scale-110";
            } else if (isMid) {
              cardStyles = "bg-brand-electric text-white border-brand-light shadow-glow ring-2 ring-brand-light/50";
            } else if (isEliminated) {
              cardStyles = "bg-bg-base/40 border-border-subtle/40 text-text-dim opacity-30 scale-95";
            }

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 max-w-[52px]">
                {/* Index label */}
                <span className="text-[10px] font-mono text-text-dim">[{idx}]</span>

                {/* Array Node */}
                <div
                  className={`w-full aspect-square rounded-xl border flex items-center justify-center font-mono text-sm sm:text-base font-bold transition-all duration-300 ${cardStyles}`}
                >
                  {val}
                </div>

                {/* Pointer tags */}
                <div className="h-4 flex items-center justify-center gap-1 text-[9px] font-mono font-bold">
                  {idx === left && (
                    <span className="text-accent-amber" title="Left Pointer">
                      L
                    </span>
                  )}
                  {idx === right && (
                    <span className="text-accent-purple" title="Right Pointer">
                      R
                    </span>
                  )}
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
          <IconCircleCheckFilled size={20} className="text-accent-green shrink-0 mt-0.5" />
        ) : (
          <IconBolt size={20} className="text-brand-light shrink-0 mt-0.5 animate-pulse" />
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
            rightIcon={<IconChevronRight size={16} stroke={2} />}
          >
            Keyingi Qadam
          </Button>

          <Button
            size="sm"
            variant="secondary"
            disabled={isFound || left > right}
            onClick={() => setIsPlaying(!isPlaying)}
            leftIcon={<IconPlayerPlay size={14} className={isPlaying ? "text-accent-green" : ""} />}
          >
            {isPlaying ? "To'xtatish" : "Avto Ijro"}
          </Button>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => resetSearch(target)}
          leftIcon={<IconRotate2 size={14} stroke={2} />}
        >
          Qayta Boshlash
        </Button>
      </div>
    </div>
  );
};
