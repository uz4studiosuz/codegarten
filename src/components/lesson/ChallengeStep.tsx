"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { ExerciseChallenge } from "@/components/engine/types";
import { useExerciseEngine } from "@/components/engine/useExerciseEngine";
import { getRenderer } from "@/components/engine/renderers/RendererRegistry";
import { BlockWorkspace } from "@/components/engine/blocks/BlockWorkspace";

interface ChallengeStepProps<TState> {
  challenge: ExerciseChallenge<TState>;
  /** Fired once, the first time the learner solves it. */
  onSolved: () => void;
  /** Lets the runner enable its footer button only when checking is possible. */
  onReadyChange: (ready: boolean) => void;
  /** The runner drives "Check" from its footer, so it needs the handler. */
  registerCheck: (check: () => void) => void;
  /** Reports current evaluation status to the runner */
  onStatusChange?: (status: "idle" | "success" | "fail") => void;
}

/**
 * Renders a prompt with `backtick` spans lifted into inline code chips.
 */
function Prompt({ text }: { text: string }) {
  const segments = text.split("`");
  return (
    <h2 className="text-center text-[20px] sm:text-[24px] font-semibold leading-snug text-gray-900 dark:text-white">
      {segments.map((segment, i) =>
        i % 2 === 1 ? (
          <code
            key={i}
            className="mx-0.5 rounded-[7px] bg-gray-200 dark:bg-[#2b2b31] px-2.5 py-1 font-mono text-[0.82em] align-middle text-gray-800 dark:text-[#e4e4e7]"
          >
            {segment}
          </code>
        ) : (
          <span key={i}>{segment}</span>
        )
      )}
    </h2>
  );
}

export function ChallengeStep<TState>({
  challenge,
  onSolved,
  onReadyChange,
  registerCheck,
  onStatusChange,
}: ChallengeStepProps<TState>) {
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

  // Checking only makes sense once the learner has changed something.
  const isDirty = useMemo(
    () => JSON.stringify(ast) !== JSON.stringify(challenge.initialAST),
    [ast, challenge.initialAST]
  );

  useEffect(() => {
    onReadyChange(isDirty);
  }, [isDirty, onReadyChange]);

  useEffect(() => {
    registerCheck(checkAnswer);
  }, [checkAnswer, registerCheck]);

  useEffect(() => {
    if (evaluation === null) {
      onStatusChange?.("idle");
    } else if (evaluation.isSuccess) {
      onStatusChange?.("success");
    } else {
      onStatusChange?.("fail");
    }
  }, [evaluation, onStatusChange]);

  const reported = useRef(false);
  useEffect(() => {
    if (isSuccess && !reported.current) {
      reported.current = true;
      onSolved();
    }
  }, [isSuccess, onSolved]);

  return (
    <div className="w-full flex flex-col items-center">
      <Prompt text={challenge.prompt} />

      <div className="mt-8 w-full max-w-[532px] rounded-[20px] overflow-hidden">
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

      {evaluation && (
        <div className="mt-6 flex flex-col items-center gap-1.5">
          <p
            className={`text-[15px] font-semibold ${
              isSuccess ? "text-[#4ADE80]" : "text-amber-400"
            }`}
          >
            {evaluation.feedbackMessage}
          </p>
          {isWrong && evaluation.solutionHint && (
            <p className="max-w-[420px] text-center text-[13px] text-gray-500 dark:text-[#8b8b93]">
              {evaluation.solutionHint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
