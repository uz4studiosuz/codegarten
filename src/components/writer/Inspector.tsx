"use client";

import React, { useRef, useState } from "react";
import {
  IconChevronDown,
  IconChevronUp,
  IconInfoCircle,
  IconLink,
  IconPhoto,
  IconPlus,
  IconTrash,
  IconUpload,
  IconWand,
  IconX,
} from "@tabler/icons-react";
import { ALL_TOPICS, TOPIC_LABELS, type GameTopic } from "@/games/topics";
import { listGames } from "@/games/registry";
import { resolveGame } from "@/games/resolve";
import {
  BLOCK_HINTS,
  BLOCK_LABELS,
  type BlockKind,
  DraftIssue,
  DraftLesson,
  DraftModule,
  DraftTrack,
  KIND_HINTS,
  KIND_LABELS,
  LARGE_IMAGE_BYTES,
  LessonKind,
  MAX_IMAGE_BYTES,
  MINUTES_BY_KIND,
  STEP_LABELS,
  XP_BY_KIND,
  dataUriBytes,
  draftBlocks,
  draftSteps,
  emptyBlock,
  emptyStep,
  emptyTerm,
  idsAreStale,
  isUploadedImage,
  issuesFor,
  kindHasGame,
} from "@/lib/writerDraft";
import type {
  ContentSection,
  KeyTerm,
  LessonContent,
  LessonImage,
  LessonStep,
  QuizQuestion,
  SectionBlock,
} from "@/types/lessonContent";
import type { Selection } from "./selection";
import { AddButton, Field, Section, Select, SubCard, TextArea, TextInput } from "./fields";

const KINDS: LessonKind[] = ["concept", "exercise", "challenge", "review"];

export interface InspectorActions {
  patchModule: (patch: Partial<DraftModule>) => void;
  patchNewTrack: (patch: Partial<DraftTrack>) => void;
  chooseTrack: (trackId: string) => void;
  startNewTrack: () => void;
  patchLevel: (levelIndex: number, patch: Partial<DraftModule["levels"][number]>) => void;
  patchLesson: (levelIndex: number, lessonIndex: number, patch: Partial<DraftLesson>) => void;
  patchContent: (
    levelIndex: number,
    lessonIndex: number,
    patch: Partial<LessonContent>
  ) => void;
  regenerateIds: () => void;
}

/** Which group holds the worst issue, so a folded group still shows a dot. */
function badgeFor(issues: DraftIssue[], match: (message: string) => boolean) {
  const relevant = issues.filter((i) => match(i.message));
  if (relevant.length === 0) return undefined;
  return relevant.some((i) => i.level === "error") ? "error" : "warning";
}

export function Inspector({
  draft,
  selection,
  issues,
  tracks,
  actions,
}: {
  draft: DraftModule;
  selection: Selection;
  issues: DraftIssue[];
  /** Tracks already in the project. */
  tracks: readonly { id: string; title: string }[];
  actions: InspectorActions;
}) {
  if (selection.kind === "module") {
    return <ModuleForm draft={draft} issues={issues} tracks={tracks} actions={actions} />;
  }

  if (selection.kind === "level") {
    return (
      <LevelForm
        draft={draft}
        levelIndex={selection.levelIndex}
        issues={issues}
        actions={actions}
      />
    );
  }

  return (
    <LessonForm
      draft={draft}
      levelIndex={selection.levelIndex}
      lessonIndex={selection.lessonIndex}
      issues={issues}
      actions={actions}
    />
  );
}

// ── Module ──────────────────────────────────────────────────────────────────

function ModuleForm({
  draft,
  issues,
  tracks,
  actions,
}: {
  draft: DraftModule;
  issues: DraftIssue[];
  tracks: readonly { id: string; title: string }[];
  actions: InspectorActions;
}) {
  const moduleIssues = issuesFor(issues, { kind: "module" });
  const trackIssues = issuesFor(issues, { kind: "track" });
  const stale = idsAreStale(draft);
  const isNewTrack = Boolean(draft.newTrack && draft.newTrack.id === draft.trackId);

  const toggleTopic = (topic: GameTopic) => {
    const has = draft.topics.includes(topic);
    actions.patchModule({
      topics: has ? draft.topics.filter((t) => t !== topic) : [...draft.topics, topic],
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Section
        title="Modul"
        badge={
          moduleIssues.length
            ? moduleIssues.some((i) => i.level === "error")
              ? "error"
              : "warning"
            : undefined
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Modul id" hint="fayl nomi bo'ladi">
            <TextInput
              value={draft.id}
              onChange={(e) => actions.patchModule({ id: e.target.value.trim() })}
              placeholder="mod-7"
            />
          </Field>
          <Field label="Tartib raqami" hint="katalogdagi o'rni">
            <TextInput
              type="number"
              min={1}
              value={draft.num}
              onChange={(e) => actions.patchModule({ num: Number(e.target.value) })}
            />
          </Field>
        </div>

        {stale && (
          <button
            type="button"
            onClick={actions.regenerateIds}
            className="self-start inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1.5 text-[12px] font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 transition-colors cursor-pointer"
          >
            <IconWand size={14} />
            Bosqich va dars id larini modul id ga moslash
          </button>
        )}

        <Field label="Nomi" hint="o'quvchi ko'radigan nom">
          <TextInput
            value={draft.title}
            onChange={(e) => actions.patchModule({ title: e.target.value })}
            placeholder="Rekursiya"
          />
        </Field>

        <Field label="Inglizcha nomi">
          <TextInput
            value={draft.titleEn}
            onChange={(e) => actions.patchModule({ titleEn: e.target.value })}
            placeholder="Recursion"
          />
        </Field>

        <Field label="Qisqa shior" hint="katalog kartasidagi bir qatorli izoh">
          <TextInput
            value={draft.tagline}
            onChange={(e) => actions.patchModule({ tagline: e.target.value })}
            placeholder="Funksiya o'zini chaqirganda nima bo'ladi"
          />
        </Field>

        <Field label="Tavsif">
          <TextArea
            rows={3}
            value={draft.description}
            onChange={(e) => actions.patchModule({ description: e.target.value })}
          />
        </Field>

        <Field label="Rasm yo'li" hint="public/ ichidagi fayl">
          <TextInput
            value={draft.imageSrc}
            onChange={(e) => actions.patchModule({ imageSrc: e.target.value })}
          />
        </Field>
      </Section>

      {/* Topics drive which interactive game each lesson ends with. */}
      <Section title="Mavzular" count={draft.topics.length}>
        <p className="text-[12px] leading-relaxed text-gray-500 dark:text-zinc-400 flex items-start gap-2">
          <IconInfoCircle size={15} className="shrink-0 mt-0.5 text-[#A78BFA]" />
          Mavzu tanlansa, mashq va sinov darslari shu mavzuga mos interaktiv o&apos;yin bilan
          yakunlanadi. Masalan &quot;Sikllar&quot; tanlansa — sikl o&apos;yini chiqadi.
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_TOPICS.map((topic) => {
            const active = draft.topics.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                onClick={() => toggleTopic(topic)}
                className={`rounded-full border-2 px-3 py-1.5 text-[12px] font-bold transition-colors cursor-pointer ${
                  active
                    ? "border-[#26B54F] bg-[#26B54F]/15 text-[#1a8a3c] dark:text-[#4ADE80]"
                    : "border-gray-200 dark:border-[#27272a] text-gray-500 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-600"
                }`}
              >
                {TOPIC_LABELS[topic]}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Track: pick an existing direction, or define a new one inline. */}
      <Section
        title="Yo'nalish"
        badge={
          trackIssues.length
            ? trackIssues.some((i) => i.level === "error")
              ? "error"
              : "warning"
            : undefined
        }
      >
        <Field label="Qaysi yo'nalishga tegishli">
          <Select
            value={isNewTrack ? "__new__" : draft.trackId}
            onChange={(e) => {
              if (e.target.value === "__new__") actions.startNewTrack();
              else actions.chooseTrack(e.target.value);
            }}
          >
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
            <option value="__new__">+ Yangi yo&apos;nalish yaratish</option>
          </Select>
        </Field>

        {isNewTrack && draft.newTrack && (
          <div className="rounded-[12px] border-2 border-[#A78BFA]/40 bg-[#A78BFA]/[0.06] p-3.5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C5CE0] dark:text-[#c4b5fd]">
                Yangi yo&apos;nalish
              </span>
              <button
                type="button"
                onClick={() => actions.chooseTrack(tracks[0]?.id ?? "")}
                aria-label="Yangi yo'nalishdan voz kechish"
                className="p-1 rounded-full text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <IconX size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Yo'nalish id" hint="masalan: web-development">
                <TextInput
                  value={draft.newTrack.id}
                  onChange={(e) => actions.patchNewTrack({ id: e.target.value.trim() })}
                  placeholder="web-development"
                />
              </Field>
              <Field label="Bosqich yorlig'i">
                <TextInput
                  value={draft.newTrack.category}
                  onChange={(e) => actions.patchNewTrack({ category: e.target.value })}
                  placeholder="O'RTA BOSQICH"
                />
              </Field>
            </div>

            <Field label="Nomi">
              <TextInput
                value={draft.newTrack.title}
                onChange={(e) => actions.patchNewTrack({ title: e.target.value })}
                placeholder="Veb dasturlash asoslari"
              />
            </Field>

            <Field label="Inglizcha nomi">
              <TextInput
                value={draft.newTrack.titleEn}
                onChange={(e) => actions.patchNewTrack({ titleEn: e.target.value })}
                placeholder="Web Development Foundations"
              />
            </Field>

            <Field label="Tavsif">
              <TextArea
                rows={2}
                value={draft.newTrack.description}
                onChange={(e) => actions.patchNewTrack({ description: e.target.value })}
              />
            </Field>

            <Field label="Rang" hint="katalogdagi yo'nalish rangi">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={
                    /^#[0-9a-fA-F]{6}$/.test(draft.newTrack.colorTheme)
                      ? draft.newTrack.colorTheme
                      : "#22C55E"
                  }
                  onChange={(e) => actions.patchNewTrack({ colorTheme: e.target.value })}
                  className="w-10 h-10 rounded-[10px] border-2 border-gray-200 dark:border-[#27272a] bg-transparent cursor-pointer"
                  aria-label="Yo'nalish rangi"
                />
                <TextInput
                  value={draft.newTrack.colorTheme}
                  onChange={(e) => actions.patchNewTrack({ colorTheme: e.target.value })}
                />
              </div>
            </Field>

            <label className="flex items-center gap-2.5 cursor-pointer select-none text-[13px] text-gray-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={Boolean(draft.newTrack.isSoon)}
                onChange={(e) => actions.patchNewTrack({ isSoon: e.target.checked })}
                className="w-4 h-4 rounded text-[#26B54F] focus:ring-0 cursor-pointer"
              />
              <span>Tez kunda (Locked / Yaqinda chiqadi)</span>
            </label>

            <p className="text-[11.5px] leading-relaxed text-gray-500 dark:text-zinc-400">
              Eksportda <span className="font-mono">content/tracks.json</span> fayli ham
              chiqadi — u mavjud yo&apos;nalishlar bilan birga yangisini o&apos;z ichiga oladi.
            </p>
          </div>
        )}
      </Section>
    </div>
  );
}

// ── Level ───────────────────────────────────────────────────────────────────

function LevelForm({
  draft,
  levelIndex,
  issues,
  actions,
}: {
  draft: DraftModule;
  levelIndex: number;
  issues: DraftIssue[];
  actions: InspectorActions;
}) {
  const level = draft.levels[levelIndex];
  if (!level) return null;
  const levelIssues = issuesFor(issues, { kind: "level", levelIndex });

  return (
    <div className="flex flex-col gap-4">
      <Section
        title={`${levelIndex + 1}-bosqich`}
        badge={
          levelIssues.length
            ? levelIssues.some((i) => i.level === "error")
              ? "error"
              : "warning"
            : undefined
        }
      >
        <Field label="Bosqich nomi">
          <TextInput
            value={level.title}
            onChange={(e) => actions.patchLevel(levelIndex, { title: e.target.value })}
            placeholder="Birinchi buyruqlar"
          />
        </Field>

        <Field label="Bir qatorli izoh" hint="yo'l ustidagi kartada ko'rinadi">
          <TextInput
            value={level.summary}
            onChange={(e) => actions.patchLevel(levelIndex, { summary: e.target.value })}
            placeholder="Kompyuter buyruqni qanday tushunadi"
          />
        </Field>

        <div className="rounded-[10px] bg-gray-50 dark:bg-[#1c1c20] px-3 py-2.5 flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            Bosqich id
          </span>
          <span className="font-mono text-[12px] text-gray-600 dark:text-zinc-300 truncate">
            {level.id}
          </span>
        </div>

        <p className="text-[12px] text-gray-500 dark:text-zinc-400">
          {level.lessons.length} dars · id lar modul id dan avtomatik hosil bo&apos;ladi.
        </p>
      </Section>
    </div>
  );
}

// ── Lesson ──────────────────────────────────────────────────────────────────

function LessonForm({
  draft,
  levelIndex,
  lessonIndex,
  issues,
  actions,
}: {
  draft: DraftModule;
  levelIndex: number;
  lessonIndex: number;
  issues: DraftIssue[];
  actions: InspectorActions;
}) {
  const level = draft.levels[levelIndex];
  const lesson = level?.lessons[lessonIndex];
  if (!level || !lesson) return null;

  const games = listGames();
  const lessonIssues = issuesFor(issues, { kind: "lesson", levelIndex, lessonIndex });
  const content = lesson.content;
  const steps = draftSteps(content);

  const patch = (p: Partial<DraftLesson>) => actions.patchLesson(levelIndex, lessonIndex, p);
  const patchContent = (p: Partial<LessonContent>) =>
    actions.patchContent(levelIndex, lessonIndex, p);

  const setSteps = (next: LessonStep[]) => patchContent({ steps: next });

  const replaceStep = (index: number, step: LessonStep) =>
    setSteps(steps.map((s, i) => (i === index ? step : s)));

  const addStep = (kind: Exclude<LessonStep["kind"], "goal">) =>
    setSteps([...steps, emptyStep(kind)]);

  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));

  const moveStep = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[index], next[target]] = [next[target], next[index]];
    setSteps(next);
  };

  /** What the app would actually run if no game is pinned. */
  const autoGame = resolveGame({
    kind: lesson.kind,
    lessonTitle: lesson.title,
    levelTitle: level.title,
    moduleTopics: draft.topics,
    seed: lesson.id,
  });

  const hasChallengeStep = steps.some((s) => s.kind === "challenge");
  const quizNumbers = new Map<number, number>();
  let quizSeen = 0;
  steps.forEach((step, i) => {
    if (step.kind === "quiz") {
      quizSeen += 1;
      quizNumbers.set(i, quizSeen);
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <Section
        title="Dars"
        badge={badgeFor(lessonIssues, (m) => /nomi|id|XP|daqiqa/.test(m))}
      >
        <Field label="Dars nomi">
          <TextInput
            value={lesson.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="Sikl ichida sikl"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Turi" hint={KIND_HINTS[lesson.kind]}>
            <Select
              value={lesson.kind}
              onChange={(e) => {
                const kind = e.target.value as LessonKind;
                // Defaults follow the kind unless the author already tuned them.
                const keepXp = lesson.xp !== XP_BY_KIND[lesson.kind];
                const keepMinutes = lesson.estMinutes !== MINUTES_BY_KIND[lesson.kind];
                patch({
                  kind,
                  ...(keepXp ? {} : { xp: XP_BY_KIND[kind] }),
                  ...(keepMinutes ? {} : { estMinutes: MINUTES_BY_KIND[kind] }),
                });
              }}
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {KIND_LABELS[k]}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="XP">
              <TextInput
                type="number"
                min={1}
                value={lesson.xp}
                onChange={(e) => patch({ xp: Number(e.target.value) })}
              />
            </Field>
            <Field label="Daqiqa">
              <TextInput
                type="number"
                min={1}
                value={lesson.estMinutes}
                onChange={(e) => patch({ estMinutes: Number(e.target.value) })}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-[10px] bg-gray-50 dark:bg-[#1c1c20] px-3 py-2.5 flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            Dars id
          </span>
          <span className="font-mono text-[12px] text-gray-600 dark:text-zinc-300 truncate">
            {lesson.id}
          </span>
        </div>

        <Field
          label="Interaktiv o'yin"
          hint={
            kindHasGame(lesson.kind)
              ? "Bo'sh qoldirilsa, mavzuga qarab avtomatik tanlanadi"
              : "Bu turdagi darsda o'yin ishlatilmaydi"
          }
        >
          <Select
            value={lesson.gameId}
            onChange={(e) => patch({ gameId: e.target.value })}
            disabled={!kindHasGame(lesson.kind)}
          >
            <option value="">— avtomatik (mavzuga qarab) —</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </Field>

        {kindHasGame(lesson.kind) && (
          <p className="text-[12px] leading-relaxed text-gray-500 dark:text-zinc-400 -mt-1">
            {lesson.gameId ? (
              games.find((g) => g.id === lesson.gameId)?.description
            ) : autoGame ? (
              <>
                Avtomatik tanlanadi:{" "}
                <span className="font-semibold text-[#26B54F] dark:text-[#4ADE80]">
                  {autoGame.name}
                </span>{" "}
                — {autoGame.description}
              </>
            ) : (
              "Mos o'yin topilmadi — modul mavzusini tanlang."
            )}
          </p>
        )}
      </Section>

      <Section title="Maqsad" badge={badgeFor(lessonIssues, (m) => /maqsad/.test(m))}>
        <Field label="Maqsad" hint="O'quvchi nimani o'rganadi — bir gap">
          <TextArea
            rows={2}
            value={content.goal}
            onChange={(e) => patchContent({ goal: e.target.value })}
          />
        </Field>
        <p className="text-[12px] text-gray-500 dark:text-zinc-400">
          Maqsad har doim darsning birinchi ekrani bo&apos;ladi.
        </p>
      </Section>

      {/* ── The run: the author decides which screens follow, in what order ── */}
      <Section
        title="Qadamlar"
        count={steps.length}
        badge={badgeFor(lessonIssues, (m) => /qadam|blok|bo'lim|savol|variant|javob|atama|rasm/.test(m))}
      >
        <p className="text-[12px] leading-relaxed text-gray-500 dark:text-zinc-400 flex items-start gap-2">
          <IconInfoCircle size={15} className="shrink-0 mt-0.5 text-[#A78BFA]" />
          Dars shu tartibda ochiladi. Bo&apos;lim, savol va kalit so&apos;zlarni xohlagan
          joyga qo&apos;yish mumkin — masalan tushuntirishdan keyin darrov savol.
        </p>

        {steps.map((step, index) => (
          <StepCard
            key={index}
            index={index}
            total={steps.length}
            step={step}
            quizNumber={quizNumbers.get(index)}
            onMove={(direction) => moveStep(index, direction)}
            onRemove={() => removeStep(index)}
          >
            {step.kind === "section" && (
              <SectionStepEditor
                section={step.section}
                onChange={(section) => replaceStep(index, { kind: "section", section })}
              />
            )}
            {step.kind === "terms" && (
              <TermsStepEditor
                terms={step.terms}
                onChange={(terms) => replaceStep(index, { kind: "terms", terms })}
              />
            )}
            {step.kind === "quiz" && (
              <QuizStepEditor
                question={step.question}
                onChange={(question) => replaceStep(index, { kind: "quiz", question })}
              />
            )}
            {step.kind === "challenge" && (
              <p className="text-[12.5px] leading-relaxed text-gray-500 dark:text-zinc-400">
                Shu joyda interaktiv o&apos;yin ochiladi
                {lesson.gameId
                  ? `: ${games.find((g) => g.id === lesson.gameId)?.name ?? lesson.gameId}`
                  : autoGame
                  ? `: ${autoGame.name} (avtomatik)`
                  : ""}
                . O&apos;yinni tanlash yuqoridagi «Dars» bo&apos;limida.
              </p>
            )}
          </StepCard>
        ))}

        <div className="flex flex-wrap gap-2">
          <AddButton label={STEP_LABELS.section} onClick={() => addStep("section")} />
          <AddButton label={STEP_LABELS.quiz} onClick={() => addStep("quiz")} />
          <AddButton label={STEP_LABELS.terms} onClick={() => addStep("terms")} />
          {kindHasGame(lesson.kind) && !hasChallengeStep && (
            <AddButton label={STEP_LABELS.challenge} onClick={() => addStep("challenge")} />
          )}
        </div>

        {kindHasGame(lesson.kind) && !hasChallengeStep && (
          <p className="text-[12px] text-gray-400 dark:text-zinc-500">
            O&apos;yin qadami qo&apos;yilmasa, o&apos;yin darsning eng oxirida ochiladi.
          </p>
        )}
      </Section>
    </div>
  );
}

/** One step in the run: its header, order controls and its own editor. */
/**
 * Reorder and delete, identical for a step in a lesson and a block in a screen.
 * Both lists are "the author decides the order", so they must not look different.
 */
function MoveControls({
  index,
  total,
  onMove,
  onRemove,
  removeLabel,
}: {
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={index === 0}
        aria-label="Yuqoriga ko'chirish"
        className="p-1 rounded-full text-gray-300 dark:text-zinc-600 enabled:hover:text-[#26B54F] disabled:opacity-30 transition-colors cursor-pointer"
      >
        <IconChevronUp size={15} />
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={index === total - 1}
        aria-label="Pastga ko'chirish"
        className="p-1 rounded-full text-gray-300 dark:text-zinc-600 enabled:hover:text-[#26B54F] disabled:opacity-30 transition-colors cursor-pointer"
      >
        <IconChevronDown size={15} />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="p-1 rounded-full text-gray-300 dark:text-zinc-600 hover:text-red-500 transition-colors cursor-pointer"
      >
        <IconTrash size={14} />
      </button>
    </>
  );
}

function StepCard({
  index,
  total,
  step,
  quizNumber,
  onMove,
  onRemove,
  children,
}: {
  index: number;
  total: number;
  step: LessonStep;
  /** "2-savol", so a question keeps its own numbering inside the run. */
  quizNumber?: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const label =
    step.kind === "goal"
      ? "Maqsad"
      : step.kind === "quiz" && quizNumber
      ? `${quizNumber}-savol`
      : STEP_LABELS[step.kind as Exclude<LessonStep["kind"], "goal">];

  const tone =
    step.kind === "quiz"
      ? "border-[#A78BFA]/40"
      : step.kind === "challenge"
      ? "border-[#26B54F]/40"
      : step.kind === "terms"
      ? "border-amber-500/40"
      : "border-gray-100 dark:border-[#222226]";

  return (
    <div className={`rounded-[12px] border-2 ${tone} p-3.5 flex flex-col gap-3`}>
      <div className="flex items-center gap-1.5">
        <span className="shrink-0 w-[22px] h-[22px] rounded-full bg-gray-100 dark:bg-[#232327] text-[11px] font-mono font-bold text-gray-500 dark:text-zinc-400 flex items-center justify-center">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 truncate">
          {label}
        </span>

        <MoveControls
          index={index}
          total={total}
          onMove={onMove}
          onRemove={onRemove}
          removeLabel="Qadamni o'chirish"
        />
      </div>
      {children}
    </div>
  );
}

// ── Step editors ────────────────────────────────────────────────────────────

const BLOCK_ORDER: BlockKind[] = ["text", "code", "image", "callout"];

const BLOCK_TONES: Record<BlockKind, string> = {
  text: "border-gray-100 dark:border-[#222226]",
  code: "border-[#A78BFA]/40",
  image: "border-[#3B82F6]/40",
  callout: "border-[#26B54F]/40",
};

/**
 * One screen, built block by block
 * --------------------------------
 * A teaching screen used to have a fixed shape: paragraphs, then the picture,
 * then the code, then the takeaway. That made some material impossible to lay out
 * — a code sample that belongs directly under the picture it explains, for one.
 * The screen is now an ordered list, and this is where the author arranges it.
 */
function SectionStepEditor({
  section,
  onChange,
}: {
  section: ContentSection;
  onChange: (section: ContentSection) => void;
}) {
  const blocks = draftBlocks(section);
  const setBlocks = (next: SectionBlock[]) => onChange({ ...section, blocks: next });
  const replace = (index: number, block: SectionBlock) =>
    setBlocks(blocks.map((b, i) => (i === index ? block : b)));

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    setBlocks(next);
  };

  return (
    <>
      <Field label="Sarlavha" hint="Ekranning yuqorisidagi nom">
        <TextInput
          value={section.heading}
          placeholder="Sikl nima uchun kerak"
          onChange={(e) => onChange({ ...section, heading: e.target.value })}
        />
      </Field>

      <p className="text-[12px] leading-relaxed text-gray-500 dark:text-zinc-400 flex items-start gap-2">
        <IconInfoCircle size={15} className="shrink-0 mt-0.5 text-[#A78BFA]" />
        Ekran shu tartibda chiziladi — masalan rasmni qo&apos;yib, uning ostiga kod
        blokini qo&apos;shsangiz, o&apos;quvchi ham aynan shunday ko&apos;radi.
      </p>

      {blocks.map((block, i) => (
        <div
          key={i}
          className={`rounded-[12px] border-2 ${BLOCK_TONES[block.kind]} p-3 flex flex-col gap-3`}
        >
          <div className="flex items-center gap-1.5">
            <span className="shrink-0 w-[20px] h-[20px] rounded-[6px] bg-gray-100 dark:bg-[#232327] text-[10.5px] font-mono font-bold text-gray-500 dark:text-zinc-400 flex items-center justify-center">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 truncate">
              {BLOCK_LABELS[block.kind]}
            </span>
            <MoveControls
              index={i}
              total={blocks.length}
              onMove={(direction) => move(i, direction)}
              onRemove={() => setBlocks(blocks.filter((_, k) => k !== i))}
              removeLabel="Blokni o'chirish"
            />
          </div>

          {block.kind === "text" && (
            <Field label="Matn" hint="Har xatboshi — alohida qator">
              <TextArea
                rows={4}
                value={block.text}
                placeholder="Sikl bir xil ishni takrorlash uchun kerak."
                onChange={(e) => replace(i, { kind: "text", text: e.target.value })}
              />
            </Field>
          )}

          {block.kind === "callout" && (
            <Field label="Xulosa" hint="Eng muhim fikr bir gapda">
              <TextInput
                value={block.text}
                placeholder="Bir marta yoz, yuz marta ishlat."
                onChange={(e) => replace(i, { kind: "callout", text: e.target.value })}
              />
            </Field>
          )}

          {block.kind === "code" && (
            <>
              <Field label="Kod sarlavhasi (ixtiyoriy)">
                <TextInput
                  value={block.caption ?? ""}
                  placeholder="oldinga.uz"
                  onChange={(e) =>
                    replace(i, { ...block, caption: e.target.value })
                  }
                />
              </Field>
              <Field label="Kod" hint="Har buyruq — alohida qator">
                <TextArea
                  rows={4}
                  value={block.lines.join("\n")}
                  placeholder="oldinga(100)"
                  onChange={(e) =>
                    replace(i, { ...block, lines: e.target.value.split("\n") })
                  }
                  style={{ fontFamily: "var(--font-mono)" }}
                />
              </Field>
            </>
          )}

          {block.kind === "image" && (
            <ImageField
              compact
              image={block.image}
              onChange={(image) =>
                replace(i, { kind: "image", image: image ?? { src: "", alt: "" } })
              }
            />
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        {BLOCK_ORDER.map((kind) => (
          <AddButton
            key={kind}
            label={BLOCK_LABELS[kind]}
            onClick={() => setBlocks([...blocks, emptyBlock(kind)])}
          />
        ))}
      </div>

      <p className="text-[11.5px] text-gray-400 dark:text-zinc-500">
        {BLOCK_ORDER.map((kind) => `${BLOCK_LABELS[kind]} — ${BLOCK_HINTS[kind]}`).join(
          " · "
        )}
      </p>
    </>
  );
}

/**
 * A picture either lives in the project already (a path or a URL) or gets
 * uploaded here. Uploads are held inline as a data URI while the draft is being
 * written and become real files under public/images/lessons/ on export, so the
 * author never has to copy a file by hand.
 */
function ImageField({
  image,
  onChange,
  compact = false,
}: {
  image: LessonImage | undefined;
  onChange: (image: LessonImage | undefined) => void;
  /** Inside a block card the surrounding frame and title would be repeated. */
  compact?: boolean;
}) {
  const uploaded = Boolean(image?.src && isUploadedImage(image.src));
  const [mode, setMode] = useState<"url" | "upload">(uploaded ? "upload" : "url");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const bytes = image?.src && uploaded ? dataUriBytes(image.src) : 0;

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Bu rasm fayli emas");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(
        `Rasm ${Math.round(file.size / 1024)} KB — 2 MB dan kichik fayl tanlang (rasmni siqib oling)`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setError(null);
      onChange({
        src: String(reader.result),
        alt: image?.alt ?? "",
        ...(image?.caption ? { caption: image.caption } : {}),
      });
    };
    reader.onerror = () => setError("Faylni o'qib bo'lmadi");
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={
        compact
          ? "flex flex-col gap-3"
          : "rounded-[12px] border-2 border-gray-100 dark:border-[#222226] p-3 flex flex-col gap-3"
      }
    >
      <div className={`items-center gap-2 ${compact ? "hidden" : "flex"}`}>
        <IconPhoto size={15} className="shrink-0 text-gray-400" />
        <span className="min-w-0 flex-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
          Rasm (ixtiyoriy)
        </span>
        {image?.src && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              onChange(undefined);
            }}
            aria-label="Rasmni olib tashlash"
            className="p-1 rounded-full text-gray-300 dark:text-zinc-600 hover:text-red-500 transition-colors cursor-pointer"
          >
            <IconTrash size={14} />
          </button>
        )}
      </div>

      <div className="flex gap-1.5">
        {(
          [
            { key: "url", label: "Havola", Icon: IconLink },
            { key: "upload", label: "Yuklash", Icon: IconUpload },
          ] as const
        ).map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-[12px] font-bold transition-colors cursor-pointer ${
              mode === key
                ? "border-[#26B54F] bg-[#26B54F]/10 text-[#1a8a3c] dark:text-[#4ADE80]"
                : "border-gray-200 dark:border-[#27272a] text-gray-500 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-600"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {mode === "url" ? (
        <Field
          label="Manzil"
          hint="public/ ichidagi yo'l (/images/...) yoki to'liq https havola"
        >
          <TextInput
            value={uploaded ? "" : image?.src ?? ""}
            placeholder="/images/lessons/sikl.png"
            onChange={(e) =>
              onChange(
                e.target.value.trim()
                  ? { src: e.target.value, alt: image?.alt ?? "", ...(image?.caption ? { caption: image.caption } : {}) }
                  : undefined
              )
            }
          />
        </Field>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="self-start inline-flex items-center gap-1.5 rounded-full border-2 border-gray-200 dark:border-[#27272a] px-3.5 py-2 text-[12.5px] font-bold hover:border-gray-300 dark:hover:border-zinc-600 transition-colors cursor-pointer"
          >
            <IconUpload size={14} />
            {uploaded ? "Boshqa rasm tanlash" : "Rasm tanlash"}
          </button>
          <p className="text-[11px] text-gray-400 dark:text-zinc-500">
            Rasm qoralamada saqlanadi va ZIP ichida{" "}
            <span className="font-mono">public/images/lessons/</span> ga chiqadi.
          </p>
        </div>
      )}

      {error && <p className="text-[11.5px] text-red-500">{error}</p>}

      {image?.src && (
        <>
          <div className="rounded-[10px] border border-gray-200 dark:border-[#27272a] overflow-hidden bg-white dark:bg-[#0d0d0f]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt || "Rasm ko'rinishi"}
              className="w-full max-h-[160px] object-contain"
            />
          </div>

          {uploaded && (
            <p
              className={`text-[11px] ${
                bytes > LARGE_IMAGE_BYTES
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-gray-400 dark:text-zinc-500"
              }`}
            >
              Yuklangan rasm · {Math.round(bytes / 1024)} KB
              {bytes > LARGE_IMAGE_BYTES ? " — brauzer qoralamasi uchun kattaroq" : ""}
            </p>
          )}

          <Field label="Izohli nomi (alt)" hint="Rasm ko'rinmasa shu matn o'qiladi">
            <TextInput
              value={image.alt}
              placeholder="Sikl ichida takrorlanayotgan naqsh"
              onChange={(e) => onChange({ ...image, alt: e.target.value })}
            />
          </Field>

          <Field label="Rasm ostidagi izoh (ixtiyoriy)">
            <TextInput
              value={image.caption ?? ""}
              onChange={(e) => onChange({ ...image, caption: e.target.value })}
            />
          </Field>
        </>
      )}
    </div>
  );
}

function TermsStepEditor({
  terms,
  onChange,
}: {
  terms: KeyTerm[];
  onChange: (terms: KeyTerm[]) => void;
}) {
  return (
    <>
      <p className="text-[12px] text-gray-500 dark:text-zinc-400">
        Atamalar o&apos;quvchining Lug&apos;atiga saqlanadi — bir qadamda 1-3 ta atama
        tavsiya etiladi.
      </p>

      {terms.map((term, ti) => (
        <SubCard
          key={ti}
          title={`${ti + 1}-atama`}
          onRemove={
            terms.length > 1 ? () => onChange(terms.filter((_, i) => i !== ti)) : undefined
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Inglizcha">
              <TextInput
                value={term.en}
                placeholder="loop"
                onChange={(e) =>
                  onChange(terms.map((t, i) => (i === ti ? { ...t, en: e.target.value } : t)))
                }
              />
            </Field>
            <Field label="O'zbekcha">
              <TextInput
                value={term.uz}
                placeholder="sikl"
                onChange={(e) =>
                  onChange(terms.map((t, i) => (i === ti ? { ...t, uz: e.target.value } : t)))
                }
              />
            </Field>
          </div>
          <Field label="Qisqa izoh">
            <TextInput
              value={term.note}
              onChange={(e) =>
                onChange(terms.map((t, i) => (i === ti ? { ...t, note: e.target.value } : t)))
              }
            />
          </Field>
        </SubCard>
      ))}

      <button
        type="button"
        onClick={() => onChange([...terms, emptyTerm()])}
        className="self-start inline-flex items-center gap-1 text-[12px] font-bold text-[#26B54F] hover:underline cursor-pointer"
      >
        <IconPlus size={12} /> Atama
      </button>
    </>
  );
}

function QuizStepEditor({
  question,
  onChange,
}: {
  question: QuizQuestion;
  onChange: (question: QuizQuestion) => void;
}) {
  const trimmed = question.options.map((o) => o.trim()).filter(Boolean);
  const answer = question.options[question.correctIndex]?.trim() ?? "";
  const others = trimmed.filter((o) => o !== answer);
  /**
   * Testers cracked the quiz by picking the longest option, so the writer says so
   * while the question is being written rather than after it ships.
   */
  const answerTooLong =
    Boolean(answer) &&
    others.length > 0 &&
    answer.length === Math.max(...trimmed.map((o) => o.length)) &&
    answer.length > (others.reduce((sum, o) => sum + o.length, 0) / others.length) * 1.4;

  return (
    <>
      <Field label="Savol matni">
        <TextArea
          rows={2}
          value={question.question}
          onChange={(e) => onChange({ ...question, question: e.target.value })}
        />
      </Field>

      <Field label="Variantlar" hint="To'g'ri javobni yonidagi doiracha bilan belgilang">
        <div className="flex flex-col gap-2">
          {question.options.map((option, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...question, correctIndex: oi })}
                aria-label={`${oi + 1}-variantni to'g'ri javob deb belgilash`}
                title="To'g'ri javob"
                className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                  question.correctIndex === oi
                    ? "border-[#26B54F] bg-[#26B54F]"
                    : "border-gray-300 dark:border-zinc-600 hover:border-[#26B54F]"
                }`}
              >
                {question.correctIndex === oi && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>

              <TextInput
                value={option}
                placeholder={`${oi + 1}-variant`}
                onChange={(e) =>
                  onChange({
                    ...question,
                    options: question.options.map((o, k) => (k === oi ? e.target.value : o)),
                  })
                }
              />

              <span className="shrink-0 w-7 text-right font-mono text-[11px] text-gray-400 dark:text-zinc-500">
                {option.trim().length || ""}
              </span>

              <button
                type="button"
                disabled={question.options.length <= 2}
                onClick={() => {
                  const options = question.options.filter((_, k) => k !== oi);
                  // Keep the marked answer on the same option it was on.
                  const correctIndex =
                    question.correctIndex === oi
                      ? 0
                      : question.correctIndex > oi
                      ? question.correctIndex - 1
                      : question.correctIndex;
                  onChange({ ...question, options, correctIndex });
                }}
                aria-label="Variantni o'chirish"
                className="shrink-0 p-1 rounded-full text-gray-300 dark:text-zinc-600 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <IconX size={14} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => onChange({ ...question, options: [...question.options, ""] })}
            className="self-start inline-flex items-center gap-1 text-[12px] font-bold text-[#26B54F] hover:underline cursor-pointer"
          >
            <IconPlus size={12} /> Variant
          </button>
        </div>
      </Field>

      {answerTooLong && (
        <p className="text-[11.5px] leading-relaxed text-amber-600 dark:text-amber-400">
          To&apos;g&apos;ri javob boshqa variantlardan ancha uzun. O&apos;quvchilar buni
          payqab, mazmunni o&apos;qimasdan eng uzunini tanlashni o&apos;rganib qoladi —
          variantlarni bir-biriga yaqin uzunlikda yozing (o&apos;ngdagi raqamlar belgilar
          sonini ko&apos;rsatadi).
        </p>
      )}

      <Field label="Izoh" hint="Nega bu javob to'g'ri — faqat to'g'ri javobdan keyin ko'rsatiladi">
        <TextArea
          rows={2}
          value={question.explanation}
          onChange={(e) => onChange({ ...question, explanation: e.target.value })}
        />
      </Field>
    </>
  );
}
