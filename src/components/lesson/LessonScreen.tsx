"use client";

import React, { useCallback, useEffect } from "react";
import { LessonRunner } from "./LessonRunner";
import { getGame } from "@/games/registry";
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
  /** Which interactive game to finish with, if any. */
  gameId?: string;
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
  gameId,
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

  const game = getGame(gameId);

  return (
    <LessonRunner
      key={lessonId}
      lessonId={lessonId}
      lessonTitle={lessonTitle}
      levelTitle={levelTitle}
      content={content}
      game={game}
      xpReward={xpReward}
      exitHref={`/courses/${moduleId}`}
      nextHref={nextHref}
      nextLabel={nextLabel}
      onFinished={handleFinished}
    />
  );
}
