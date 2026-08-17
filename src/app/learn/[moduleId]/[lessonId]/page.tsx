"use client";

import React from "react";
import { useParams } from "next/navigation";
import { InteractiveLessonEngine } from "@/components/interactive/InteractiveLessonEngine";

export default function LearnLessonPage() {
  const urlParams = useParams();

  const moduleId = (urlParams?.moduleId as string) || "mod-2";
  const lessonId = (urlParams?.lessonId as string) || "step-1";

  return (
    <InteractiveLessonEngine
      moduleId={moduleId}
      lessonId={lessonId}
    />
  );
}
