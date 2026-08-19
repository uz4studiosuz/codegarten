"use client";

import React from "react";
import { ChallengeStep } from "@/components/lesson/ChallengeStep";
import { sampleShapeChallenge } from "@/components/engine/sampleChallenges";
import type { ExerciseChallenge } from "@/components/engine/types";
import type { GameProps } from "../types";

/**
 * Colour the inscribed shapes by changing the block parameters. A thin adapter
 * over the block-editor engine, exposed through the shared game contract.
 */
export function ShapeColorGame(props: GameProps) {
  return (
    <ChallengeStep
      challenge={sampleShapeChallenge as unknown as ExerciseChallenge<unknown>}
      {...props}
    />
  );
}
