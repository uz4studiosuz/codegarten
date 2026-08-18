"use client";

import React, { useCallback, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LessonRunner } from "@/components/lesson/LessonRunner";
import { getChallenge } from "@/components/engine/sampleChallenges";
import { challengeIdFor, findLesson, nextLessonAfter } from "@/data/curriculum";
import { getLessonContent } from "@/data/lessonContent";
import { useProgress } from "@/context/ProgressContext";

export default function LearnLessonPage() {
  const urlParams = useParams();
  const moduleId = (urlParams?.moduleId as string) || "mod-1";
  const lessonId = (urlParams?.lessonId as string) || "";

  const { completeLesson, visitLesson, hydrated } = useProgress();

  const location = findLesson(moduleId, lessonId);
  const content = location ? getLessonContent(lessonId) : undefined;

  // Record the visit so the lesson shows up in "Tezkor qaytish". Waiting for
  // hydration keeps this from racing the provider's read of stored progress.
  useEffect(() => {
    if (hydrated && location) visitLesson(moduleId, lessonId);
  }, [hydrated, location, moduleId, lessonId, visitLesson]);

  const handleFinished = useCallback(() => {
    completeLesson(moduleId, lessonId);
  }, [completeLesson, moduleId, lessonId]);

  if (!location || !content) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col items-center justify-center gap-4 px-6 text-center font-sans">
        <p className="text-lg font-bold">Bu dars uchun material topilmadi.</p>
        <Link
          href={`/courses/${moduleId}`}
          className="text-[15px] text-[#26B54F] hover:underline"
        >
          Modulga qaytish
        </Link>
      </div>
    );
  }

  const { lesson, level, moduleIndex } = location;
  const following = nextLessonAfter(moduleId, lessonId);

  // Concept and review lessons teach and quiz; the rest end with a hands-on block.
  const wantsChallenge = lesson.kind === "exercise" || lesson.kind === "challenge";
  const challenge = wantsChallenge
    ? getChallenge(challengeIdFor(lesson, moduleIndex))
    : undefined;

  return (
    <LessonRunner
      key={lessonId}
      lessonTitle={lesson.title}
      levelTitle={`Level ${level.num} · ${level.title}`}
      content={content}
      challenge={challenge}
      xpReward={lesson.xp}
      exitHref={`/courses/${moduleId}`}
      nextHref={
        following ? `/learn/${moduleId}/${following.lesson.id}` : `/courses/${moduleId}`
      }
      nextLabel={following ? "Keyingi dars" : "Modulga qaytish"}
      onFinished={handleFinished}
    />
  );
}
