"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowRight,
  IconCircleCheckFilled,
  IconFlagFilled,
  IconTrophyFilled,
} from "@tabler/icons-react";
import { moduleStats, nextModuleAfter, type CourseModule } from "@/data/curriculum";
import { useProgress } from "@/context/ProgressContext";

/**
 * End of a module
 * ---------------
 * Finishing the last lesson used to drop the learner back on a path where every
 * disc was green and nothing said what came next. This closes the module out —
 * confetti when they have just earned it — and offers the next module as a card
 * they can step straight into.
 */
export function ModuleCompleteCard({
  module,
  /** True when the learner arrived here by finishing the final lesson. */
  justCompleted,
  themeColor,
}: {
  module: CourseModule;
  justCompleted: boolean;
  themeColor: string;
}) {
  const next = nextModuleAfter(module.id);
  const { nextLessonIn, moduleProgress } = useProgress();
  const nextLesson = next ? nextLessonIn(next.id) : undefined;
  const nextProgress = next ? moduleProgress(next.id) : undefined;
  const stats = moduleStats(module);

  const celebrated = useRef(false);

  useEffect(() => {
    if (!justCompleted || celebrated.current) return;
    celebrated.current = true;

    let cancelled = false;
    // Loaded on demand: nothing else on the path page needs the library.
    import("canvas-confetti")
      .then(({ default: confetti }) => {
        if (cancelled) return;
        const common = { spread: 70, ticks: 220, gravity: 0.9, disableForReducedMotion: true };
        confetti({ ...common, particleCount: 90, origin: { x: 0.5, y: 0.7 } });
        setTimeout(
          () => confetti({ ...common, particleCount: 55, origin: { x: 0.2, y: 0.8 } }),
          220
        );
        setTimeout(
          () => confetti({ ...common, particleCount: 55, origin: { x: 0.8, y: 0.8 } }),
          380
        );
      })
      .catch(() => {
        // Confetti is decoration; the card itself is the message.
      });

    return () => {
      cancelled = true;
    };
  }, [justCompleted]);

  return (
    <section
      id="module-complete"
      className="scroll-mt-32 mt-2 mb-10 rounded-[26px] border-2 bg-white dark:bg-[#101013] p-6 sm:p-7"
      style={{ borderColor: themeColor }}
    >
      {/* ── The module they just closed out ── */}
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${themeColor}22` }}
        >
          <IconTrophyFilled size={24} style={{ color: themeColor }} />
        </div>
        <div className="min-w-0">
          <h2 className="text-[20px] sm:text-[22px] font-extrabold leading-tight text-black dark:text-white">
            {justCompleted ? "Tabriklaymiz — modul yakunlandi!" : "Bu modul yakunlangan"}
          </h2>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-gray-600 dark:text-[#9a9aa2]">
            {module.title} — {stats.lessonCount} dars, {stats.totalXp} XP. Endi keyingi
            qadamga o&apos;tishga tayyorsiz.
          </p>
        </div>
      </div>

      {/* ── What comes next ── */}
      {next ? (
        <div className="mt-6">
          <div className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-[#6d6d74]">
            Keyingi modul
          </div>

          <div className="mt-3 rounded-[20px] border border-gray-200 dark:border-[#2b2b31] bg-[#F8F9FA] dark:bg-[#16161a] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <Image
              src={next.imageSrc}
              alt={next.title}
              width={56}
              height={56}
              className="w-14 h-14 object-contain shrink-0"
            />

            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-[#6d6d74]">
                {next.num}-modul
              </div>
              <h3 className="mt-0.5 text-[17px] font-bold leading-snug text-black dark:text-white">
                {next.title}
              </h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-gray-500 dark:text-[#8b8b93] line-clamp-2">
                {next.tagline || next.description}
              </p>
            </div>

            <div className="shrink-0 flex flex-col gap-2 sm:items-end">
              <Link
                href={
                  nextLesson
                    ? `/learn/${next.id}/${nextLesson.lesson.id}`
                    : `/courses/${next.id}`
                }
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: next.accent || themeColor }}
              >
                {nextProgress?.isStarted ? "Davom ettirish" : "Boshlash"}
                <IconArrowRight size={16} stroke={2.4} />
              </Link>
              <Link
                href={`/courses/${next.id}`}
                className="text-center text-[13px] font-semibold text-gray-500 dark:text-[#8b8b93] hover:text-black dark:hover:text-white transition-colors"
              >
                Modul yo&apos;lini ko&apos;rish
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex items-center gap-3 rounded-[20px] border border-gray-200 dark:border-[#2b2b31] bg-[#F8F9FA] dark:bg-[#16161a] px-4 py-4">
          <IconFlagFilled size={20} style={{ color: themeColor }} className="shrink-0" />
          <p className="text-[14px] leading-relaxed text-gray-600 dark:text-[#9a9aa2]">
            Bu — yo&apos;nalishdagi oxirgi modul. Yangi modullar qo&apos;shilishi bilan
            kurslar bo&apos;limida ko&apos;rinadi.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-gray-500 dark:text-[#8b8b93]">
        <span className="inline-flex items-center gap-1.5">
          <IconCircleCheckFilled size={15} style={{ color: themeColor }} />
          {stats.lessonCount}/{stats.lessonCount} dars bajarildi
        </span>
        <Link
          href="/courses"
          className="hover:text-black dark:hover:text-white transition-colors"
        >
          Barcha kurslar
        </Link>
      </div>
    </section>
  );
}
