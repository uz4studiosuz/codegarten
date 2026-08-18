"use client";

import React, { useCallback, useEffect } from "react";
import { LessonRunner } from "./LessonRunner";
import { getChallenge } from "@/components/engine/sampleChallenges";
import { useProgress } from "@/context/ProgressContext";
import type { LessonContent } from "@/types/lessonContent";

interface LessonScreenProps {
  moduleId: string;
  lessonId: string;
  lessonTitle: string;
  lessonKind: string;
  levelTitle: string;
  xpReward: number;
  /** Loaded on the server and handed over ready to render. */
  content: LessonContent;
  /** Which interactive block challenge to finish with, if any. */
  challengeId?: string;
  nextHref: string;
  nextLabel: string;
}

/**
 * Client half of a lesson: owns progress side effects and hands the runner its
 * challenge. Content arrives as a prop so the JSON never enters the bundle.
 */
export function LessonScreen({
  moduleId,
  lessonId,
  lessonTitle,
  levelTitle,
  xpReward,
  content,
  challengeId,
  nextHref,
  nextLabel,
}: LessonScreenProps) {
  const { completeLesson, visitLesson, hydrated } = useProgress();

  // Waiting for hydration keeps this from racing the provider's storage read.
  useEffect(() => {
    if (hydrated) visitLesson(moduleId, lessonId);
  }, [hydrated, moduleId, lessonId, visitLesson]);

  const handleFinished = useCallback(() => {
    completeLesson(moduleId, lessonId);
  }, [completeLesson, moduleId, lessonId]);

  const isRobotPuzzle = challengeId === "grid-walk";
  const challenge =
    challengeId && !isRobotPuzzle ? getChallenge(challengeId) : undefined;

  return (
    <LessonRunner
      key={lessonId}
      lessonId={lessonId}
      lessonTitle={lessonTitle}
      levelTitle={levelTitle}
      content={content}
      challenge={challenge}
      robotPuzzle={isRobotPuzzle}
      xpReward={xpReward}
      exitHref={`/courses/${moduleId}`}
      nextHref={nextHref}
      nextLabel={nextLabel}
      onFinished={handleFinished}
    />
  );
}
