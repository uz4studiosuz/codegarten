"use client";

import React, { useCallback, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ExerciseEngine } from "@/components/engine/ExerciseEngine";
import { getChallenge } from "@/components/engine/sampleChallenges";
import { challengeIdFor, findLesson, nextLessonAfter } from "@/data/curriculum";
import { useProgress } from "@/context/ProgressContext";

export default function LearnLessonPage() {
  const urlParams = useParams();
  const moduleId = (urlParams?.moduleId as string) || "mod-2";
  const lessonId = (urlParams?.lessonId as string) || "";

  const { completeLesson, visitLesson } = useProgress();

  const location = findLesson(moduleId, lessonId);

  // Record the visit so it shows up in "Tezkor qaytish" even if abandoned.
  useEffect(() => {
    if (location) visitLesson(moduleId, lessonId);
  }, [location, moduleId, lessonId, visitLesson]);

  const handleSolved = useCallback(() => {
    completeLesson(moduleId, lessonId);
  }, [completeLesson, moduleId, lessonId]);

  if (!location) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col items-center justify-center gap-4 px-6 text-center font-sans">
        <p className="text-lg font-bold">Bunday dars topilmadi.</p>
        <Link
          href={`/courses/${moduleId}`}
          className="text-[15px] text-[#26B54F] hover:underline"
        >
          Modulga qaytish
        </Link>
      </div>
    );
  }

  const { lesson, level, levelIndex, moduleIndex } = location;
  const following = nextLessonAfter(moduleId, lessonId);
  const challenge = getChallenge(challengeIdFor(lesson, moduleIndex));

  // The bar fills across the level this lesson belongs to.
  const stepsInLevel = level.lessons.length;
  const progressPercent = Math.round((levelIndex / stepsInLevel) * 100);

  return (
    <ExerciseEngine
      key={lessonId}
      challenge={challenge}
      backHref={`/courses/${moduleId}`}
      nextHref={
        following
          ? `/learn/${moduleId}/${following.lesson.id}`
          : `/courses/${moduleId}`
      }
      nextLabel={following ? "Continue" : "Modulni yakunlash"}
      progressPercent={progressPercent}
      upcomingSections={Math.max(0, stepsInLevel - levelIndex - 1)}
      xpReward={lesson.xp}
      onSolved={handleSolved}
    />
  );
}
