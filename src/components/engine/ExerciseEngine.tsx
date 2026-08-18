"use client";

import React, { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { IconX, IconBolt, IconArrowRight } from "@tabler/icons-react";
import { ExerciseChallenge } from "./types";
import { useExerciseEngine } from "./useExerciseEngine";
import { getRenderer } from "./renderers/RendererRegistry";
import { BlockWorkspace } from "./blocks/BlockWorkspace";

interface ExerciseEngineProps<TState> {
  challenge: ExerciseChallenge<TState>;
  /** Where the ✕ in the top-left returns to. */
  backHref: string;
  /** Where "Continue" goes after the exercise is solved. */
  nextHref?: string;
  /** Filled portion of the section bar, before the exercise is solved. */
  progressPercent?: number;
  /** Small dots trailing the bar — the sections still to come. */
  upcomingSections?: number;
  /** XP shown in the energy pill once the exercise is solved. */
  xpReward?: number;
  /** Fired once, the first time the exercise is solved. */
  onSolved?: () => void;
  /** Label for the forward action; defaults to "Continue". */
  nextLabel?: string;
}

/**
 * Renders a prompt with `backtick` spans lifted into inline code chips,
 * e.g. "Set the color of all shapes to `yellow`."
 */
function Prompt({ text }: { text: string }) {
  const segments = text.split("`");

  return (
    <h1 className="text-center text-[22px] sm:text-[26px] font-semibold leading-snug text-white">
      {segments.map((segment, i) =>
        i % 2 === 1 ? (
          <code
            key={i}
            className="mx-0.5 rounded-[7px] bg-[#2b2b31] px-2.5 py-1 font-mono text-[0.82em] align-middle text-[#e4e4e7]"
          >
            {segment}
          </code>
        ) : (
          <span key={i}>{segment}</span>
        )
      )}
    </h1>
  );
}

export function ExerciseEngine<TState>({
  challenge,
  backHref,
  nextHref,
  progressPercent = 34,
  upcomingSections = 3,
  xpReward = 0,
  onSolved,
  nextLabel = "Continue",
}: ExerciseEngineProps<TState>) {
  const {
    ast,
    runtimeState,
    evaluation,
    isEvaluating,
    updateBlockParam,
    resetToInitial,
    checkAnswer,
  } = useExerciseEngine<TState>(challenge);

  const Renderer = getRenderer(challenge.rendererType);

  const isSuccess = evaluation?.isSuccess === true;
  const isWrong = evaluation !== null && !evaluation.isSuccess;

  // Report the solve exactly once, even if the evaluator re-runs.
  const hasReported = useRef(false);
  useEffect(() => {
    if (isSuccess && !hasReported.current) {
      hasReported.current = true;
      onSolved?.();
    }
  }, [isSuccess, onSolved]);

  // Check stays inert until the learner actually changes something.
  const isDirty = useMemo(
    () => JSON.stringify(ast) !== JSON.stringify(challenge.initialAST),
    [ast, challenge.initialAST]
  );

  const barPercent = isSuccess ? 100 : progressPercent;

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col font-sans select-none">

      {/* ═══ Top bar: exit · section progress · energy ═══ */}
      <header className="flex items-center gap-4 sm:gap-8 px-5 sm:px-10 py-5">
        <Link
          href={backHref}
          aria-label="Exit lesson"
          className="shrink-0 text-[#8b8b93] hover:text-white transition-colors"
        >
          <IconX size={24} stroke={2} />
        </Link>

        <div className="flex-1 flex items-center justify-center gap-3 sm:gap-4 min-w-0">
          <div className="w-full max-w-[834px] h-2.5 rounded-full bg-[#2e2e34] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#22C55E] transition-[width] duration-500"
              style={{ width: `${barPercent}%` }}
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {Array.from({ length: upcomingSections }).map((_, i) => (
              <span key={i} className="w-3.5 h-3.5 rounded-full bg-[#3a3a41]" />
            ))}
          </div>
        </div>

        <div
          className={`shrink-0 flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 transition-colors duration-300 ${
            isSuccess
              ? "border-[#26B54F] bg-[#26B54F]/15"
              : "border-[#3a3a41] bg-[#16161a]"
          }`}
        >
          <span className="font-mono text-[15px] font-bold text-white">
            {isSuccess ? xpReward : 0}
          </span>
          <IconBolt
            size={16}
            className={
              isSuccess
                ? "text-[#4ADE80] fill-[#4ADE80]"
                : "text-amber-400 fill-amber-400"
            }
          />
        </div>
      </header>

      {/* ═══ Exercise frame ═══ */}
      <main className="flex-1 flex flex-col items-center rounded-[26px] border border-[#26262a] mx-4 sm:mx-8 lg:mx-[68px] mb-8 px-5 sm:px-8 py-10">

        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <Prompt text={challenge.prompt} />

          {/* Canvas above, block code below — one seamless card */}
          <div className="mt-10 w-full max-w-[532px] rounded-[20px] overflow-hidden">
            <Renderer
              state={runtimeState}
              isEvaluating={isEvaluating}
              isSuccess={evaluation ? evaluation.isSuccess : null}
            />
            <BlockWorkspace
              ast={ast}
              onUpdateParam={updateBlockParam}
              onReset={resetToInitial}
            />
          </div>

          {/* Feedback only appears once an answer has been checked */}
          {evaluation && (
            <div className="mt-6 flex flex-col items-center gap-1.5">
              <p
                className={`text-[15px] font-semibold ${
                  isSuccess ? "text-[#4ADE80]" : "text-amber-400"
                }`}
              >
                {evaluation.feedbackMessage}
              </p>
              {isSuccess && xpReward > 0 && (
                <p className="text-[13px] font-bold text-[#8b8b93]">+{xpReward} XP</p>
              )}
              {isWrong && evaluation.solutionHint && (
                <p className="max-w-[420px] text-center text-[13px] text-[#8b8b93]">
                  {evaluation.solutionHint}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ═══ Primary action ═══ */}
        <div className="w-full max-w-[484px] mt-8">
          {isSuccess && nextHref ? (
            <Link
              href={nextHref}
              className="flex items-center justify-center gap-2 w-full rounded-full py-4 text-[17px] font-bold bg-[#26B54F] text-white hover:bg-[#1ea94f] transition-colors"
            >
              {nextLabel}
              <IconArrowRight size={19} stroke={2.4} />
            </Link>
          ) : (
            <button
              type="button"
              disabled={!isDirty}
              onClick={checkAnswer}
              className={`w-full rounded-full py-4 text-[17px] font-bold transition-colors ${
                isDirty
                  ? "bg-[#22C55E] text-white hover:bg-[#1ea94f] cursor-pointer active:scale-[0.995]"
                  : "bg-[#1e1e21] text-[#6f6f77] cursor-not-allowed"
              }`}
            >
              {isWrong ? "Try again" : "Check"}
            </button>
          )}
        </div>

      </main>
    </div>
  );
}
