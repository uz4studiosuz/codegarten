import React from "react";
import Link from "next/link";
import { LessonScreen } from "@/components/lesson/LessonScreen";
import { gameIdFor, findLesson, nextLessonAfter } from "@/data/curriculum";
import { getLessonContent } from "@/lib/lessonContent.server";

interface PageProps {
  params: { moduleId: string; lessonId: string };
}

/**
 * Server half of a lesson: resolves the curriculum entry and reads the lesson's
 * JSON, so the client only ever receives the one lesson it is about to render.
 */
export default async function LearnLessonPage({ params }: PageProps) {
  const { moduleId, lessonId } = params;

  const location = findLesson(moduleId, lessonId);
  const content = location ? await getLessonContent(lessonId) : null;

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

  // Concept and review lessons teach and quiz; the rest end hands-on.
  const wantsChallenge = lesson.kind === "exercise" || lesson.kind === "challenge";

  return (
    <LessonScreen
      moduleId={moduleId}
      lessonId={lessonId}
      lessonTitle={lesson.title}
      lessonKind={lesson.kind}
      levelTitle={`Level ${level.num} - ${level.title}`}
      xpReward={lesson.xp}
      content={content}
      gameId={wantsChallenge ? gameIdFor(lesson, moduleIndex) : undefined}
      nextHref={
        following ? `/learn/${moduleId}/${following.lesson.id}` : `/courses/${moduleId}`
      }
      nextLabel={following ? "Keyingi dars" : "Modulga qaytish"}
    />
  );
}
