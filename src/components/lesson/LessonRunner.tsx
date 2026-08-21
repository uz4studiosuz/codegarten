"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconX,
  IconBolt,
  IconArrowLeft,
  IconArrowRight,
  IconCircleCheckFilled,
  IconAlertCircle,
  IconBulb,
  IconLanguage,
  IconTargetArrow,
  IconBookmark,
  IconBookmarkFilled,
  IconVolume,
  IconVolumeOff,
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconCheck,
} from "@tabler/icons-react";
import type { GameDefinition } from "@/games/types";
import { getGame } from "@/games/registry";
import { useVocabulary } from "@/context/VocabularyContext";
import { useSpeech } from "@/context/SpeechContext";
import { lessonSteps, sectionBlocks } from "@/lib/lessonSteps";
import { renderMarkdown } from "@/lib/markdown";
import { hashSeed } from "@/games/shared/seed";
import type {
  LessonContent,
  LessonStep,
  QuizQuestion,
  SectionBlock,
} from "@/types/lessonContent";

interface LessonRunnerProps {
  lessonId: string;
  lessonTitle: string;
  levelTitle: string;
  content: LessonContent;
  /** Interactive game the lesson ends (or breaks) on. */
  game?: GameDefinition;
  /** Which puzzle of that game this lesson gets. See src/games/ordinal.ts. */
  gameVariant?: number;
  xpReward: number;
  /** Where the exit dialog sends the learner. */
  exitHref: string;
  /** Where the final Continue lands. */
  nextHref: string;
  nextLabel: string;
  /** Fired once the whole lesson is finished. */
  onFinished: () => void;
  /**
   * Render inside a container instead of filling the viewport, and drop the exit
   * button — used by the writer's live preview.
   */
  embedded?: boolean;
  /**
   * Embedded previews have nowhere to navigate to, so the final button replays
   * the lesson instead of routing. When absent, the button routes as usual.
   */
  onRestart?: () => void;
}

/**
 * Options are reordered on every visit
 * ------------------------------------
 * Authored content parks the right answer in the same slot, which teaches
 * position rather than the concept — and testers noticed the longest option was
 * usually right, so a fresh order per visit is only half the fix (the other half
 * is balanced option lengths in the content itself).
 *
 * The order is seeded from a salt drawn once per mount rather than rolled inline,
 * so editing a question in the writer's preview does not shuffle the options under
 * the author's cursor on every keystroke.
 */
function shuffleQuestion(question: QuizQuestion, salt: string): QuizQuestion {
  let state = hashSeed(`${salt}:${question.question}`);
  const order = question.options.map((_, i) => i);

  for (let i = order.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) >>> 0;
    // High bits: an LCG's low bits cycle badly and skew short shuffles.
    const j = (state >>> 16) % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }

  return {
    ...question,
    options: order.map((i) => question.options[i]),
    correctIndex: order.indexOf(question.correctIndex),
  };
}

/** Interactive inline choice block embedded directly in teaching screens. */
function InlineChoiceBlockView({
  block,
  selected,
  isRevealed,
  onSelect,
}: {
  block: Extract<SectionBlock, { kind: "choice" }>;
  selected: number | null;
  isRevealed: boolean;
  onSelect: (index: number) => void;
}) {
  // If all options are short (<= 16 chars), use 2 columns grid; otherwise 1 column list
  const isCompact = useMemo(() => {
    return block.options.every((opt) => opt.trim().length <= 16);
  }, [block.options]);

  const isCorrect = selected === block.correctIndex;

  return (
    <div className="flex flex-col gap-3 my-1">
      {block.question && (
        <p className="text-[15px] font-semibold text-gray-800 dark:text-[#d4d4d8] leading-relaxed">
          {block.question}
        </p>
      )}

      <div
        className={
          isCompact
            ? "grid grid-cols-2 gap-2.5"
            : "flex flex-col gap-2.5"
        }
      >
        {block.options.map((option, idx) => {
          const isSelected = selected === idx;
          const isRightAnswer = idx === block.correctIndex;
          const showSuccess = isRevealed && isSelected && isRightAnswer;
          const showWrong = isRevealed && isSelected && !isRightAnswer;

          let tone =
            "border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#141416] hover:border-gray-300 dark:hover:border-[#3d3d45] text-gray-800 dark:text-[#d4d4d8]";

          if (showSuccess) {
            tone =
              "border-[#26B54F] bg-[#26B54F]/10 text-[#177F37] dark:text-[#4ADE80]";
          } else if (showWrong) {
            tone =
              "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300";
          } else if (isSelected) {
            tone =
              "border-[#3B82F6] bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#60A5FA]";
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(idx)}
              className={`relative rounded-[12px] border-2 px-4 py-3 text-left transition-all duration-150 cursor-pointer ${
                isCompact ? "text-center font-mono font-bold text-[14.5px]" : "text-[14.5px] font-medium"
              } ${tone}`}
            >
              <span>{option}</span>

              {showSuccess && (
                <span className="absolute -top-2.5 -right-2 bg-[#26B54F] text-black w-5 h-5 rounded-[5px] flex items-center justify-center shadow-md">
                  <IconCheck size={13} strokeWidth={3.5} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isRevealed && !isCorrect && (
        <p className="text-[12.5px] text-amber-600 dark:text-amber-400 font-medium">
          Qaytadan urinib ko&apos;ring.
        </p>
      )}

      {isRevealed && isCorrect && block.explanation && (
        <p className="text-[13px] text-green-700 dark:text-[#4ADE80] bg-[#26B54F]/10 border border-[#26B54F]/30 rounded-[10px] px-3 py-2 leading-relaxed">
          {block.explanation}
        </p>
      )}
    </div>
  );
}

/** One authored block of a teaching screen. */
function SectionBlockView({
  block,
  blockIndex,
  choiceSelected,
  choiceRevealed,
  onChoiceSelect,
}: {
  block: SectionBlock;
  blockIndex: number;
  choiceSelected?: number | null;
  choiceRevealed?: boolean;
  onChoiceSelect?: (optionIndex: number) => void;
}) {
  if (block.kind === "text") {
    return (
      <p className="text-[16px] leading-[1.75] text-gray-700 dark:text-[#c9c9d0]">
        {block.text}
      </p>
    );
  }

  if (block.kind === "richtext") {
    return (
      <div
        className="text-[16px] leading-[1.75] text-gray-700 dark:text-[#c9c9d0] space-y-3.5 [&_h1]:text-[22px] [&_h1]:font-extrabold [&_h1]:text-gray-900 [&_h1]:dark:text-white [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-[19px] [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:dark:text-white [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:text-[17px] [&_h3]:font-bold [&_h3]:text-gray-800 [&_h3]:dark:text-zinc-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_li]:leading-[1.65] [&_blockquote]:border-l-4 [&_blockquote]:border-[#26B54F] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:dark:text-zinc-300 [&_blockquote]:bg-[#26B54F]/[0.05] [&_blockquote]:py-1.5 [&_blockquote]:rounded-r-lg [&_code]:font-mono [&_code]:text-[13.5px] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-[6px] [&_code]:bg-gray-100 [&_code]:dark:bg-[#232328] [&_code]:text-[#7C5CE0] [&_code]:dark:text-[#A78BFA] [&_a]:text-[#26B54F] [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-medium [&_mark]:bg-amber-500/20 [&_mark]:text-amber-900 [&_mark]:dark:text-amber-200 [&_mark]:px-1 [&_mark]:rounded [&_strong]:font-bold [&_strong]:text-gray-900 [&_strong]:dark:text-white"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }}
      />
    );
  }

  if (block.kind === "choice") {
    return (
      <InlineChoiceBlockView
        block={block}
        selected={choiceSelected ?? null}
        isRevealed={choiceRevealed ?? false}
        onSelect={(optIdx) => onChoiceSelect?.(optIdx)}
      />
    );
  }

  if (block.kind === "image") {
    const customWidth = block.image.customWidth;
    const size = block.image.size ?? "full";
    const sizeClasses = customWidth
      ? "w-full"
      : {
          small: "max-w-[280px] max-h-[220px]",
          medium: "max-w-[440px] max-h-[320px]",
          large: "max-w-[620px] max-h-[420px]",
          full: "w-full max-h-[380px]",
          custom: "w-full",
        }[size];

    return (
      <figure
        className={`rounded-[16px] border border-gray-200 dark:border-[#26262a] bg-gray-50 dark:bg-[#141416] overflow-hidden mx-auto transition-all ${
          customWidth ? "" : size !== "full" ? "w-fit" : "w-full"
        }`}
        style={customWidth ? { width: `${customWidth}%`, maxWidth: "100%" } : undefined}
      >
        {/* Plain <img>: sources are authored freely — a path in public/, a remote
            URL, or a data: URI from the writer — and next/image would need every
            host configured. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.image.src}
          alt={block.image.alt}
          className={`${sizeClasses} object-contain bg-white dark:bg-[#0d0d0f] block mx-auto`}
        />
        {block.image.caption && (
          <figcaption className="px-4 py-2.5 border-t border-gray-200 dark:border-[#26262a] text-[13px] text-gray-500 dark:text-[#8b8b93] text-center">
            {block.image.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.kind === "code") {
    return (
      <div className="rounded-[16px] border border-gray-200 dark:border-[#26262a] bg-gray-50 dark:bg-[#141416] overflow-hidden">
        {block.caption && (
          <div className="px-4 py-2.5 border-b border-gray-200 dark:border-[#26262a] text-[12px] font-mono text-gray-500 dark:text-[#8b8b93]">
            {block.caption}
          </div>
        )}
        <pre className="px-4 py-3.5 overflow-x-auto">
          <code className="font-mono text-[13.5px] leading-[1.7] text-gray-800 dark:text-[#d4d4d8]">
            {block.lines.join("\n")}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-[16px] border border-[#26B54F]/30 bg-[#26B54F]/[0.08] px-4 py-3.5">
      <IconBulb size={19} className="shrink-0 mt-0.5 text-[#4ADE80]" />
      <p className="text-[15px] leading-relaxed font-medium text-green-900 dark:text-[#d4f7dd]">
        {block.text}
      </p>
    </div>
  );
}

export function LessonRunner({
  lessonId,
  lessonTitle,
  levelTitle,
  content,
  game,
  gameVariant,
  xpReward,
  exitHref,
  nextHref,
  nextLabel,
  onFinished,
  embedded = false,
  onRestart,
}: LessonRunnerProps) {
  const router = useRouter();
  const { isSaved, toggleTerm } = useVocabulary();
  const speech = useSpeech();
  // Pulled out so the narration effect below does not re-run every time
  // `speaking` toggles and narrate the same step twice.
  const { speakAuto, stop: stopSpeech } = speech;

  /** Drawn once per visit, so every visit orders the options differently. */
  const [shuffleSalt] = useState(() => Math.random().toString(36).slice(2));

  const steps = useMemo<LessonStep[]>(
    () =>
      lessonSteps(content, Boolean(game)).map((step) =>
        step.kind === "quiz"
          ? { ...step, question: shuffleQuestion(step.question, shuffleSalt) }
          : step
      ),
    [content, game, shuffleSalt]
  );

  /** Question numbering ("Savol 2 / 3") counts only the quiz steps. */
  const quizSteps = useMemo(() => steps.filter((s) => s.kind === "quiz"), [steps]);

  const [stepIndex, setStepIndex] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Quiz state for the current question
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Choice state for section step
  const [choiceSelections, setChoiceSelections] = useState<Record<number, number | null>>({});
  const [choiceRevealed, setChoiceRevealed] = useState(false);

  // Challenge state, driven from the footer button
  const [challengeReady, setChallengeReady] = useState(false);
  const [challengeSolved, setChallengeSolved] = useState(false);
  const [challengeStatus, setChallengeStatus] = useState<"idle" | "success" | "fail">(
    "idle"
  );
  const checkRef = useRef<(() => void) | null>(null);
  /**
   * Going back re-mounts the game with a clean slate, so it can report a solve a
   * second time. XP is awarded for the lesson, not per solve.
   */
  const xpAwarded = useRef(false);

  const [embeddedMuted, setEmbeddedMuted] = useState(true);
  const muted = embedded ? embeddedMuted : !speech.settings.enabled;

  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const canGoBack = stepIndex > 0 && !isFinished;
  const progressPercent = Math.round(
    ((stepIndex + (isFinished ? 1 : 0)) / steps.length) * 100
  );

  /**
   * What the narrator reads for the current step. Code samples are skipped —
   * reading punctuation aloud is noise rather than help.
   */
  const narration = useMemo(() => {
    if (!step) return "";
    if (step.kind === "goal") return `${lessonTitle}. ${content.goal}`;
    if (step.kind === "section") {
      // Code blocks are skipped: reading punctuation aloud is noise, not help.
      const spoken = sectionBlocks(step.section).flatMap((block) =>
        block.kind === "text" || block.kind === "callout"
          ? [block.text]
          : block.kind === "richtext"
          ? [block.content.replace(/<[^>]*>?/gm, " ")]
          : block.kind === "choice"
          ? ([block.question, ...block.options].filter(Boolean) as string[])
          : block.kind === "image"
          ? [block.image.caption ?? block.image.alt]
          : []
      );
      return [step.section.heading, ...spoken].filter(Boolean).join(". ");
    }
    if (step.kind === "terms") {
      return [
        "Kalit so'zlar.",
        ...step.terms.map((t) => `${t.en}, ya'ni ${t.uz}. ${t.note}`),
      ].join(" ");
    }
    if (step.kind === "quiz") {
      return [step.question.question, ...step.question.options].join(". ");
    }
    return "";
  }, [step, lessonTitle, content.goal]);

  // Narrate each step as it opens, when the learner has autoplay on (and not muted).
  useEffect(() => {
    if (narration && !muted) speakAuto(narration);
  }, [narration, speakAuto, muted]);

  // Never let narration continue after the lesson screen goes away.
  useEffect(() => () => stopSpeech(), [stopSpeech]);

  const registerCheck = useCallback((fn: () => void) => {
    checkRef.current = fn;
  }, []);

  const handleChallengeSolved = useCallback(() => {
    setChallengeSolved(true);
    setChallengeStatus("success");
    if (xpAwarded.current) return;
    xpAwarded.current = true;
    setEarnedXp((prev) => prev + xpReward);
  }, [xpReward]);

  /** Everything that belongs to one screen and must not leak into the next. */
  const clearStepState = () => {
    setPicked(null);
    setRevealed(false);
    setChoiceSelections({});
    setChoiceRevealed(false);
    setChallengeStatus("idle");
    setChallengeSolved(false);
    setChallengeReady(false);
  };

  const goNext = () => {
    if (isLastStep) {
      // Non-challenge lessons award their XP on completion.
      if (!game && !xpAwarded.current) {
        xpAwarded.current = true;
        setEarnedXp(xpReward);
      }
      setIsFinished(true);
      onFinished();
      return;
    }
    clearStepState();
    setStepIndex((i) => i + 1);
  };

  /**
   * Stepping back is not undo: the previous screen opens fresh. XP already
   * earned stays earned, which is why `xpAwarded` is a ref and not state.
   */
  const goBack = () => {
    if (!canGoBack) return;
    stopSpeech();
    clearStepState();
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const sectionChoiceEntries = useMemo(() => {
    if (step?.kind !== "section") return [];
    return sectionBlocks(step.section)
      .map((block, index) => ({ block, index }))
      .filter(
        (entry): entry is { block: Extract<SectionBlock, { kind: "choice" }>; index: number } =>
          entry.block.kind === "choice"
      );
  }, [step]);

  const hasChoiceInStep = sectionChoiceEntries.length > 0;
  const allChoicesSelected =
    hasChoiceInStep &&
    sectionChoiceEntries.every(
      ({ index }) => choiceSelections[index] !== null && choiceSelections[index] !== undefined
    );
  const allChoicesCorrect =
    hasChoiceInStep &&
    sectionChoiceEntries.every(
      ({ block, index }) => choiceSelections[index] === block.correctIndex
    );

  // ── Footer button state per step kind ────────────────────────────────────
  let footerLabel = "Davom etish";
  let footerEnabled = true;
  let footerAction: () => void = goNext;

  if (step?.kind === "quiz") {
    if (!revealed) {
      footerLabel = "Tekshirish";
      footerEnabled = picked !== null;
      footerAction = () => setRevealed(true);
    } else {
      const isCorrect = picked === step.question.correctIndex;
      footerLabel = isCorrect ? "Davom etish" : "Qaytadan urinish";
      footerAction = isCorrect
        ? goNext
        : () => {
            setPicked(null);
            setRevealed(false);
          };
    }
  } else if (step?.kind === "section" && hasChoiceInStep) {
    if (!choiceRevealed) {
      footerLabel = "Tekshirish";
      footerEnabled = allChoicesSelected;
      footerAction = () => setChoiceRevealed(true);
    } else {
      if (allChoicesCorrect) {
        footerLabel = "Davom etish";
        footerEnabled = true;
        footerAction = goNext;
      } else {
        footerLabel = "Qaytadan tekshirish";
        footerEnabled = allChoicesSelected;
        footerAction = () => setChoiceRevealed(true);
      }
    }
  } else if (step?.kind === "challenge") {
    if (challengeSolved) {
      footerLabel = "Davom etish";
      footerAction = goNext;
    } else {
      footerLabel = "Tekshirish";
      footerEnabled = challengeReady;
      footerAction = () => checkRef.current?.();
    }
  }

  // ── Compute dynamic frame border & drop shadow ──────────────────────────
  let frameTone = "border-gray-200 dark:border-[#26262a]";

  if (step?.kind === "quiz" && revealed) {
    frameTone =
      picked === step.question.correctIndex
        ? "border-[#26B54F] shadow-[0_6px_0_0_#26B54F]"
        : "border-amber-500 shadow-[0_6px_0_0_#F59E0B]";
  } else if (step?.kind === "section" && hasChoiceInStep && choiceRevealed) {
    frameTone = allChoicesCorrect
      ? "border-[#26B54F] shadow-[0_6px_0_0_#26B54F]"
      : "border-amber-500 shadow-[0_6px_0_0_#F59E0B]";
  } else if (step?.kind === "challenge") {
    if (challengeSolved || challengeStatus === "success") {
      frameTone = "border-[#26B54F] shadow-[0_6px_0_0_#26B54F]";
    } else if (challengeStatus === "fail") {
      frameTone = "border-amber-500 shadow-[0_6px_0_0_#F59E0B]";
    }
  }

  return (
    <div
      className={`bg-white dark:bg-[#0d0d0f] text-gray-900 dark:text-white flex flex-col font-sans ${
        embedded ? "h-full" : "min-h-screen"
      }`}
    >

      {/* ═══ Top bar ═══ */}
      <header className="flex items-center gap-2.5 sm:gap-5 px-4 sm:px-10 py-5">
        <button
          type="button"
          onClick={() => setShowExitDialog(true)}
          aria-label="Darsdan chiqish"
          hidden={embedded}
          className="shrink-0 text-gray-500 dark:text-[#8b8b93] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
        >
          <IconX size={24} stroke={2} />
        </button>

        {/* Sound: one control mutes the lesson outright, the other plays or stops
            the current screen. */}
        {speech.supported && (
          <div className="shrink-0 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (embedded) {
                  setEmbeddedMuted((m) => {
                    if (!m) stopSpeech();
                    return !m;
                  });
                } else {
                  speech.setEnabled(muted);
                }
              }}
              aria-pressed={muted}
              aria-label={muted ? "Ovozni yoqish" : "Ovozni o'chirish"}
              title={muted ? "Ovoz o'chirilgan — yoqish" : "Ovozni o'chirish"}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
                muted
                  ? "border-amber-500/60 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-gray-200 dark:border-[#3a3a41] text-gray-500 dark:text-[#8b8b93] hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-[#55555f]"
              }`}
            >
              {muted ? <IconVolumeOff size={17} /> : <IconVolume size={17} />}
            </button>

            {!muted && narration && (
              <button
                type="button"
                onClick={() => speech.toggle(narration)}
                aria-label={speech.speaking ? "O'qishni to'xtatish" : "Matnni o'qib berish"}
                title={speech.speaking ? "To'xtatish" : "Matnni o'qib berish"}
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
                  speech.speaking
                    ? "border-[#26B54F] bg-[#26B54F]/15 text-[#26B54F] dark:text-[#4ADE80]"
                    : "border-gray-200 dark:border-[#3a3a41] text-gray-500 dark:text-[#8b8b93] hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-[#55555f]"
                }`}
              >
                {speech.speaking ? (
                  <IconPlayerStopFilled size={13} />
                ) : (
                  <IconPlayerPlayFilled size={13} />
                )}
              </button>
            )}
          </div>
        )}

        <div className="flex-1 flex items-center justify-center gap-3 sm:gap-4 min-w-0">
          <div className="w-full max-w-[834px] h-2.5 rounded-full bg-gray-200 dark:bg-[#2e2e34] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#26B54F] transition-[width] duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {steps.slice(stepIndex + 1).slice(0, 3).map((_, i) => (
              <span key={i} className="w-3.5 h-3.5 rounded-full bg-gray-300 dark:bg-[#3a3a41]" />
            ))}
          </div>
        </div>

        <div
          className={`shrink-0 flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 transition-colors duration-300 ${
            earnedXp > 0
              ? "border-[#26B54F] bg-[#26B54F]/15"
              : "border-gray-200 dark:border-[#3a3a41] bg-gray-50 dark:bg-[#16161a]"
          }`}
        >
          <span className="font-mono text-[15px] font-bold text-gray-900 dark:text-white">
            {earnedXp}
          </span>
          <IconBolt
            size={16}
            className={
              earnedXp > 0
                ? "text-[#4ADE80] fill-[#4ADE80]"
                : "text-amber-400 fill-amber-400"
            }
          />
        </div>
      </header>

      {/* ═══ Lesson frame ═══ */}
      <main
        className={`flex-1 flex flex-col items-center rounded-[26px] border-2 mx-4 sm:mx-8 lg:mx-[68px] mb-8 px-5 sm:px-8 py-10 transition-all duration-300 ${frameTone}`}
      >
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-[680px]">

            {isFinished ? (
              /* ── Completion ── */
              <div className="flex flex-col items-center text-center gap-4 py-10">
                <div className="w-16 h-16 rounded-full bg-[#26B54F]/15 flex items-center justify-center">
                  <IconCircleCheckFilled size={40} className="text-[#26B54F]" />
                </div>
                <h2 className="text-[24px] font-extrabold">Dars yakunlandi!</h2>
                <p className="text-[15px] text-gray-500 dark:text-[#8b8b93]">
                  {lessonTitle} · +{xpReward} XP
                </p>
              </div>
            ) : step?.kind === "goal" ? (
              /* ── Objective ── */
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#26B54F]/15 flex items-center justify-center">
                  <IconTargetArrow size={24} className="text-[#26B54F]" />
                </div>
                <div className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#6d6d74]">
                  {levelTitle}
                </div>
                <h1 className="text-[26px] sm:text-[30px] font-extrabold leading-tight">
                  {lessonTitle}
                </h1>
                <p className="max-w-[520px] text-[16px] leading-relaxed text-gray-600 dark:text-[#a1a1aa]">
                  {content.goal}
                </p>
              </div>
            ) : step?.kind === "section" ? (
              /* ── Teaching page: blocks in the order they were authored ── */
              <div className="flex flex-col gap-5">
                <h2 className="text-[22px] sm:text-[26px] font-bold leading-tight">
                  {step.section.heading}
                </h2>

                {sectionBlocks(step.section).map((block, i) => (
                  <SectionBlockView
                    key={i}
                    block={block}
                    blockIndex={i}
                    choiceSelected={choiceSelections[i]}
                    choiceRevealed={choiceRevealed}
                    onChoiceSelect={(optIdx) => {
                      setChoiceSelections((prev) => ({ ...prev, [i]: optIdx }));
                      if (choiceRevealed) setChoiceRevealed(false);
                    }}
                  />
                ))}
              </div>
            ) : step?.kind === "terms" ? (
              /* ── Key terms: English keyword + Uzbek in parentheses ── */
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-2.5">
                  <IconLanguage size={22} className="text-[#26B54F]" />
                  <h2 className="text-[22px] sm:text-[26px] font-bold">Kalit so&apos;zlar</h2>
                </div>
                <p className="text-[15px] text-gray-500 dark:text-[#8b8b93]">
                  Bu atamalar haqiqiy kodda va hujjatlarda inglizcha uchraydi — shuning
                  uchun ikkala shaklini ham bilish kerak.
                </p>

                <div className="flex flex-col gap-3">
                  {step.terms.map((term) => {
                    const saved = isSaved(term.en);
                    return (
                      <div
                        key={term.en}
                        className="rounded-[16px] border border-gray-200 dark:border-[#26262a] bg-gray-50 dark:bg-[#141416] px-4 py-3.5 flex items-start gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="font-mono text-[15px] font-bold text-[#A78BFA]">
                              {term.en}
                            </span>
                            <span className="text-[15px] font-semibold text-black dark:text-white">
                              ({term.uz})
                            </span>
                          </div>
                          <p className="mt-1.5 text-[14px] leading-relaxed text-gray-500 dark:text-[#9a9aa2]">
                            {term.note}
                          </p>
                        </div>

                        {/* One tap files the term away in the learner's Lug'at */}
                        <button
                          type="button"
                          onClick={() =>
                            toggleTerm({
                              en: term.en,
                              uz: term.uz,
                              note: term.note,
                              sourceLessonId: lessonId,
                              sourceLessonTitle: lessonTitle,
                            })
                          }
                          aria-pressed={saved}
                          title={saved ? "Lug'atdan olib tashlash" : "Lug'atga saqlash"}
                          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
                            saved
                              ? "border-[#26B54F] bg-[#26B54F]/15 text-[#4ADE80]"
                              : "border-gray-300 dark:border-[#3a3a41] text-gray-400 dark:text-[#8b8b93] hover:text-gray-600 dark:hover:text-white hover:border-gray-400 dark:hover:border-[#55555f]"
                          }`}
                        >
                          {saved ? (
                            <IconBookmarkFilled size={17} />
                          ) : (
                            <IconBookmark size={17} />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[13px] text-gray-500 dark:text-[#6d6d74]">
                  Saqlangan atamalar{" "}
                  <span className="text-gray-700 dark:text-[#8b8b93] font-semibold">
                    Lug&apos;at
                  </span>{" "}
                  bo&apos;limida to&apos;planadi.
                </p>
              </div>
            ) : step?.kind === "quiz" ? (
              /* ── Quiz ── */
              <div className="flex flex-col gap-5">
                <div className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-[#6d6d74]">
                  Savol {quizSteps.indexOf(step) + 1} / {quizSteps.length}
                </div>
                <h2 className="text-[20px] sm:text-[24px] font-bold leading-snug">
                  {step.question.question}
                </h2>

                <div className="flex flex-col gap-2.5">
                  {step.question.options.map((option, i) => {
                    const isPicked = picked === i;
                    const isCorrect = i === step.question.correctIndex;
                    /*
                     * A wrong attempt marks only what the learner chose. Lighting
                     * up the right answer next to it ended the thinking: the
                     * second attempt was a copy, not a reconsideration.
                     */
                    const gotItRight = revealed && picked === step.question.correctIndex;

                    let tone =
                      "border-gray-300 dark:border-[#2b2b31] bg-white dark:bg-[#141416] hover:border-gray-400 dark:hover:border-[#3d3d45] text-gray-800 dark:text-[#d4d4d8]";
                    if (revealed && isPicked && isCorrect) {
                      tone =
                        "border-[#26B54F] bg-[#26B54F]/10 text-[#177F37] dark:text-white shadow-[0_4px_0_0_#26B54F]";
                    } else if (revealed && isPicked) {
                      tone =
                        "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-white shadow-[0_4px_0_0_#F59E0B]";
                    } else if (revealed) {
                      tone =
                        "border-gray-200 dark:border-[#2b2b31] bg-gray-50 dark:bg-[#141416] text-gray-400 dark:text-[#6d6d74]";
                    } else if (isPicked) {
                      tone = "border-[#A78BFA] bg-[#A78BFA]/10 text-[#A78BFA]";
                    }

                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={revealed}
                        onClick={() => setPicked(i)}
                        className={`flex items-center justify-between gap-3 rounded-[14px] border-2 px-4 py-3.5 text-left text-[15px] font-medium transition-colors ${tone} ${
                          revealed ? "cursor-default" : "cursor-pointer"
                        }`}
                      >
                        <span>{option}</span>
                        {gotItRight && isPicked && (
                          <IconCircleCheckFilled
                            size={20}
                            className="shrink-0 text-[#26B54F]"
                          />
                        )}
                        {revealed && isPicked && !isCorrect && (
                          <IconAlertCircle size={20} className="shrink-0 text-amber-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {revealed &&
                  (picked === step.question.correctIndex ? (
                    <div className="flex items-start gap-3 rounded-[16px] border border-[#26B54F]/30 bg-[#26B54F]/[0.08] px-4 py-3.5">
                      <IconBulb size={19} className="shrink-0 mt-0.5 text-[#4ADE80]" />
                      <p className="text-[15px] leading-relaxed text-gray-700 dark:text-[#d4d4d8]">
                        {step.question.explanation}
                      </p>
                    </div>
                  ) : (
                    /* The explanation states the answer, so it waits until the
                       learner has actually found it. */
                    <div className="flex items-start gap-3 rounded-[16px] border border-amber-500/30 bg-amber-500/[0.08] px-4 py-3.5">
                      <IconAlertCircle size={19} className="shrink-0 mt-0.5 text-amber-400" />
                      <p className="text-[15px] leading-relaxed text-gray-700 dark:text-[#d4d4d8]">
                        Bu javob to&apos;g&apos;ri emas. Savolni yana bir marta o&apos;qib,
                        boshqa variantni tanlab ko&apos;ring — kerak bo&apos;lsa orqaga
                        qaytib, tushuntirishni qayta ko&apos;rish mumkin.
                      </p>
                    </div>
                  ))}
              </div>
            ) : step?.kind === "challenge" && (step.gameId ? getGame(step.gameId) : game) ? (
              /* ── Interactive game, resolved from the registry or step ── */
              (() => {
                const activeGame = (step.gameId ? getGame(step.gameId) : game)!;
                const activeVariant = step.variant !== undefined ? step.variant : gameVariant;
                return (
                  <activeGame.Component
                    key={`${activeGame.id}:${activeVariant ?? "auto"}`}
                    seed={lessonId}
                    context={`${lessonTitle} ${levelTitle}`.toLowerCase()}
                    variant={activeVariant}
                    config={step.customConfig}
                    onSolved={handleChallengeSolved}
                    onReadyChange={setChallengeReady}
                    registerCheck={registerCheck}
                    onStatusChange={setChallengeStatus}
                  />
                );
              })()
            ) : null}

          </div>
        </div>

        {/* ═══ Footer actions (Duolingo 3D Pressable style) ═══ */}
        <div className="w-full max-w-[500px] mt-8 flex items-center gap-3 sm:gap-4">
          {!isFinished && (
            <button
              type="button"
              onClick={goBack}
              disabled={!canGoBack}
              aria-label="Orqaga qaytish"
              className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-5 sm:px-6 py-3.5 sm:py-4 rounded-full text-[15px] sm:text-[16px] font-bold border-2 transition-all ${
                canGoBack
                  ? "border-gray-200 dark:border-[#33333c] bg-white dark:bg-[#16161a] text-gray-700 dark:text-[#c9c9d0] shadow-[0_4px_0_0_#d1d5db] dark:shadow-[0_4px_0_0_#26262f] hover:bg-gray-50 dark:hover:bg-[#1c1c22] active:translate-y-[4px] active:shadow-none cursor-pointer"
                  : "border-gray-100 dark:border-white/[0.05] bg-gray-100 dark:bg-white/[0.03] text-gray-400 dark:text-[#55555d] opacity-40 cursor-not-allowed"
              }`}
            >
              <IconArrowLeft size={18} stroke={2.5} />
              <span>Orqaga</span>
            </button>
          )}

          {isFinished ? (
            <button
              type="button"
              onClick={() => (onRestart ? onRestart() : router.push(nextHref))}
              className="flex-1 flex items-center justify-center gap-2 rounded-full py-3.5 sm:py-4 text-[16px] sm:text-[17px] font-bold bg-[#26B54F] text-white shadow-[0_4px_0_0_#1A8038] hover:bg-[#22a849] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer"
            >
              <span>{nextLabel}</span>
              <IconArrowRight size={19} stroke={2.4} />
            </button>
          ) : (
            <button
              type="button"
              disabled={!footerEnabled}
              onClick={footerAction}
              className={`flex-1 flex items-center justify-center gap-2 rounded-full py-3.5 sm:py-4 text-[16px] sm:text-[17px] font-bold transition-all ${
                footerEnabled
                  ? "bg-[#26B54F] text-white shadow-[0_4px_0_0_#1A8038] hover:bg-[#22a849] active:translate-y-[4px] active:shadow-none cursor-pointer"
                  : "bg-gray-200 dark:bg-[#202024] text-gray-400 dark:text-[#6f6f77] shadow-[0_4px_0_0_#d1d5db] dark:shadow-[0_4px_0_0_#151517] cursor-not-allowed"
              }`}
            >
              <span>{footerLabel}</span>
            </button>
          )}
        </div>
      </main>

      {/* ═══ Exit confirmation ═══ */}
      {showExitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowExitDialog(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-title"
            className="relative z-10 w-full max-w-[420px] rounded-[20px] border border-gray-200 dark:border-[#2b2b31] bg-white dark:bg-[#16161a] p-6 shadow-2xl animate-scaleIn"
          >
            <h2 id="exit-title" className="text-[20px] font-extrabold text-black dark:text-white">
              Darsni tark etasizmi?
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-gray-500 dark:text-[#9a9aa2]">
              Hozir chiqib ketsangiz, shu darsdagi jarayon saqlanmaydi va XP
              berilmaydi. Keyinroq boshidan boshlashingiz kerak bo&apos;ladi.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setShowExitDialog(false)}
                className="w-full rounded-full bg-[#26B54F] py-3.5 text-[16px] font-bold text-white hover:bg-[#1ea94f] transition-colors cursor-pointer"
              >
                Qolish
              </button>
              <button
                type="button"
                onClick={() => router.push(exitHref)}
                className="w-full rounded-full border-2 border-gray-200 dark:border-[#3a3a41] py-3.5 text-[16px] font-bold text-gray-700 dark:text-[#c9c9d0] hover:border-gray-300 dark:hover:border-[#55555f] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                Chiqib ketish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
