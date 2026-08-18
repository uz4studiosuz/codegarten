"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ExerciseEngine } from "@/components/engine/ExerciseEngine";
import { sampleShapeChallenge } from "@/components/engine/sampleChallenges";

export default function LearnLessonPage() {
  const urlParams = useParams();

  const moduleId = (urlParams?.moduleId as string) || "mod-2";

  return (
    <ExerciseEngine
      challenge={sampleShapeChallenge}
      backHref={`/courses/${moduleId}`}
      nextHref={`/courses/${moduleId}`}
    />
  );
}
