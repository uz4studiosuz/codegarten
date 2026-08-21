"use client";

import React, { useRef, useState } from "react";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconArticle,
  IconBookmarks,
  IconChevronDown,
  IconChevronUp,
  IconDeviceGamepad2,
  IconFileText,
  IconGripVertical,
  IconHelpCircle,
  IconInfoCircle,
  IconLink,
  IconPhoto,
  IconPlus,
  IconTrash,
  IconUpload,
  IconWand,
  IconX,
} from "@tabler/icons-react";
import { GameConfigForm } from "./GameConfigForm";
import { MarkdownEditor } from "./MarkdownEditor";
import { ALL_TOPICS, TOPIC_LABELS, type GameTopic } from "@/games/topics";
import { getGame, listGames } from "@/games/registry";
import { getGamePuzzles } from "@/games/puzzles";
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

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [draggedTabIdx, setDraggedTabIdx] = useState<number | null>(null);
  const [dragOverTabIdx, setDragOverTabIdx] = useState<number | null>(null);

  // Keep active index within valid bounds
  const safeActiveIndex = Math.min(Math.max(0, activeStepIndex), Math.max(0, steps.length - 1));
  const activeStep = steps[safeActiveIndex];

  const handleTabDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTabIdx(index);
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleTabDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedTabIdx !== null && draggedTabIdx !== index) {
      setDragOverTabIdx(index);
    }
  };

  const handleTabDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedTabIdx !== null && draggedTabIdx !== dropIndex) {
      const next = [...steps];
      const [dragged] = next.splice(draggedTabIdx, 1);
      next.splice(dropIndex, 0, dragged);
      setSteps(next);
      setActiveStepIndex(dropIndex);
    }
    setDraggedTabIdx(null);
    setDragOverTabIdx(null);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmIndex !== null) {
      const nextSteps = steps.filter((_, i) => i !== deleteConfirmIndex);
      setSteps(nextSteps);
      if (safeActiveIndex >= nextSteps.length) {
        setActiveStepIndex(Math.max(0, nextSteps.length - 1));
      }
      setDeleteConfirmIndex(null);
    }
  };

  const handleAddStep = (kind: Exclude<LessonStep["kind"], "goal">) => {
    const nextSteps = [...steps, emptyStep(kind)];
    setSteps(nextSteps);
    setActiveStepIndex(nextSteps.length - 1);
    setShowAddMenu(false);
  };

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

      {/* ── Steps Section with Drag-and-Drop Tabs ── */}
      <Section
        title="Qadamlar"
        count={steps.length}
        badge={badgeFor(lessonIssues, (m) => /qadam|blok|bo'lim|savol|variant|javob|atama|rasm/.test(m))}
      >
        <div className="flex flex-col gap-3">
          {/* Tabs Bar Header */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11.5px] font-bold text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
              <IconInfoCircle size={14} className="text-[#A78BFA]" />
              Tabni surib o&apos;rnini almashtirishingiz mumkin:
            </span>
          </div>

          {/* Horizontal Drag-and-Drop Tabs Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-[#2a2a30]">
            {steps.map((st, idx) => {
              const isActive = idx === safeActiveIndex;
              const isDragOver = idx === dragOverTabIdx;
              const isBeingDragged = idx === draggedTabIdx;
              const quizNum = quizNumbers.get(idx);

              let TabIcon = IconFileText;
              let toneColor = "text-blue-500";
              let shortTitle = "Bo'lim";

              if (st.kind === "section") {
                TabIcon = IconFileText;
                toneColor = "text-blue-500";
                shortTitle = st.section.heading.trim() || `${idx + 1}-bo'lim`;
              } else if (st.kind === "quiz") {
                TabIcon = IconHelpCircle;
                toneColor = "text-purple-500";
                shortTitle = st.question.question.trim() ? (st.question.question.slice(0, 18) + (st.question.question.length > 18 ? "..." : "")) : `${quizNum || idx + 1}-savol`;
              } else if (st.kind === "terms") {
                TabIcon = IconBookmarks;
                toneColor = "text-amber-500";
                shortTitle = "Kalit so'zlar";
              } else if (st.kind === "challenge") {
                TabIcon = IconDeviceGamepad2;
                toneColor = "text-green-500";
                shortTitle = "O'yin";
              }

              return (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => handleTabDragStart(e, idx)}
                  onDragOver={(e) => handleTabDragOver(e, idx)}
                  onDragLeave={() => setDragOverTabIdx(null)}
                  onDrop={(e) => handleTabDrop(e, idx)}
                  onDragEnd={() => {
                    setDraggedTabIdx(null);
                    setDragOverTabIdx(null);
                  }}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`group relative shrink-0 flex items-center gap-2 px-3 py-2 rounded-[11px] border-2 cursor-pointer select-none transition-all ${
                    isBeingDragged
                      ? "opacity-40 border-dashed border-gray-400 dark:border-zinc-600"
                      : isDragOver
                      ? "border-[#26B54F] bg-[#26B54F]/15 scale-105 shadow-md"
                      : isActive
                      ? "border-[#26B54F] bg-white dark:bg-[#1a1a1f] shadow-sm text-gray-900 dark:text-white ring-2 ring-[#26B54F]/20 font-bold"
                      : "border-gray-200 dark:border-[#26262a] bg-gray-50/70 dark:bg-[#151518] hover:border-gray-300 dark:hover:border-zinc-700 text-gray-600 dark:text-zinc-400 font-medium"
                  }`}
                  title="Surib o'rnini almashtirish uchun bosing va torting"
                >
                  <span className="shrink-0 w-4 h-4 rounded-full bg-gray-200/80 dark:bg-[#25252b] text-[10px] font-mono font-extrabold flex items-center justify-center text-gray-700 dark:text-zinc-300">
                    {idx + 1}
                  </span>

                  <TabIcon size={14} className={`shrink-0 ${toneColor}`} />

                  <span className="max-w-[110px] truncate text-[12px]">
                    {shortTitle}
                  </span>

                  {/* Close / Delete Tab button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmIndex(idx);
                    }}
                    title="Qadamni o'chirish"
                    className="shrink-0 p-0.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <IconX size={13} stroke={2.5} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Add Step Buttons Strip */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 pb-1 border-b border-gray-100 dark:border-[#222226]">
            <span className="text-[11.5px] font-bold text-gray-500 dark:text-zinc-400">
              Qadam qo&apos;shish:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleAddStep("section")}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] border-2 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[11.5px] font-bold transition-all cursor-pointer shadow-2xs"
              >
                <IconPlus size={13} stroke={2.5} />
                <span>+ Bo&apos;lim</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddStep("quiz")}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] border-2 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[11.5px] font-bold transition-all cursor-pointer shadow-2xs"
              >
                <IconPlus size={13} stroke={2.5} />
                <span>+ Savol</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddStep("terms")}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] border-2 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11.5px] font-bold transition-all cursor-pointer shadow-2xs"
              >
                <IconPlus size={13} stroke={2.5} />
                <span>+ Kalit so&apos;zlar</span>
              </button>
              {kindHasGame(lesson.kind) && !hasChallengeStep && (
                <button
                  type="button"
                  onClick={() => handleAddStep("challenge")}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] border-2 border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 text-[11.5px] font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <IconPlus size={13} stroke={2.5} />
                  <span>+ O&apos;yin</span>
                </button>
              )}
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {deleteConfirmIndex !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="w-full max-w-sm rounded-[18px] border-2 border-red-500/40 bg-white dark:bg-[#18181c] p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center shrink-0">
                    <IconAlertTriangle size={22} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-[15px] font-bold text-gray-900 dark:text-white">
                      Qadamni o&apos;chirishni tasdiqlang
                    </h4>
                    <p className="text-[12.5px] text-gray-500 dark:text-zinc-400 leading-relaxed">
                      {deleteConfirmIndex + 1}-qadamni (
                      {getStepSummary(steps[deleteConfirmIndex], autoGame?.name, games) || "Qadam"}
                      ) o&apos;chirmoqchimisiz? Bu amalni bekor qilib bo&apos;lmaydi.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-[#26262a]">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmIndex(null)}
                    className="px-3.5 py-1.5 rounded-[9px] text-[12.5px] font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-[#25252a] transition-colors cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-4 py-1.5 rounded-[9px] text-[12.5px] font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                  >
                    Ha, o&apos;chirish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active Step Dedicated Editor Card */}
          {activeStep && (
            <div className="rounded-[14px] border-2 border-gray-200 dark:border-[#26262a] bg-gray-50/40 dark:bg-[#141417]/40 p-4 flex flex-col gap-4 mt-1 shadow-xs">
              {/* Active Step Top Bar Controls */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200/70 dark:border-[#26262a]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 px-2 py-0.5 rounded-[6px] bg-[#26B54F]/15 text-[#177F37] dark:text-[#4ADE80] font-mono text-[11px] font-bold">
                    {safeActiveIndex + 1} / {steps.length}
                  </span>
                  <span className="text-[13.5px] font-extrabold text-gray-800 dark:text-zinc-200 truncate">
                    {STEP_LABELS[activeStep.kind as Exclude<LessonStep["kind"], "goal">]}
                  </span>
                </div>

                {/* Move Left / Right & Delete */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => moveStep(safeActiveIndex, -1)}
                    disabled={safeActiveIndex === 0}
                    title="Chapga / Oldinga surish"
                    className="flex items-center gap-1 px-2 py-1 rounded-[7px] text-[11px] font-bold text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#25252a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <IconArrowLeft size={13} />
                    <span>Oldinga</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(safeActiveIndex, 1)}
                    disabled={safeActiveIndex === steps.length - 1}
                    title="O'ngga / Keyinga surish"
                    className="flex items-center gap-1 px-2 py-1 rounded-[7px] text-[11px] font-bold text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#25252a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <span>Keyinga</span>
                    <IconArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Step Form Body */}
              {activeStep.kind === "section" && (
                <SectionStepEditor
                  section={activeStep.section}
                  onChange={(section) => replaceStep(safeActiveIndex, { kind: "section", section })}
                />
              )}
              {activeStep.kind === "terms" && (
                <TermsStepEditor
                  terms={activeStep.terms}
                  onChange={(terms) => replaceStep(safeActiveIndex, { kind: "terms", terms })}
                />
              )}
              {activeStep.kind === "quiz" && (
                <QuizStepEditor
                  question={activeStep.question}
                  onChange={(question) => replaceStep(safeActiveIndex, { kind: "quiz", question })}
                />
              )}
              {activeStep.kind === "challenge" && (
                <ChallengeStepEditor
                  step={activeStep}
                  lessonKind={lesson.kind}
                  moduleTopics={draft.topics}
                  lessonTitle={lesson.title}
                  levelTitle={level.title}
                  lessonId={lesson.id}
                  onChange={(updated) => {
                    replaceStep(safeActiveIndex, updated);
                    if (updated.gameId !== undefined) {
                      patch({ gameId: updated.gameId });
                    }
                  }}
                />
              )}

              {/* Step Navigation Bottom Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200/70 dark:border-[#26262a]">
                <button
                  type="button"
                  onClick={() => setActiveStepIndex(Math.max(0, safeActiveIndex - 1))}
                  disabled={safeActiveIndex === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-[#25252a] disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <IconArrowLeft size={14} />
                  <span>Oldingi qadam</span>
                </button>

                <span className="text-[11.5px] font-medium text-gray-400 dark:text-zinc-500">
                  {safeActiveIndex + 1} / {steps.length}
                </span>

                <button
                  type="button"
                  onClick={() => setActiveStepIndex(Math.min(steps.length - 1, safeActiveIndex + 1))}
                  disabled={safeActiveIndex === steps.length - 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-[#25252a] disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <span>Keyingi qadam</span>
                  <IconArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {kindHasGame(lesson.kind) && !hasChallengeStep && (
            <p className="text-[11.5px] text-gray-400 dark:text-zinc-500">
              O&apos;yin qadami qo&apos;shilmasa, o&apos;yin darsning eng oxirida ochiladi.
            </p>
          )}
        </div>
      </Section>
    </div>
  );
}

function getStepSummary(
  step: LessonStep,
  autoGameName?: string,
  gamesList: readonly { id: string; name: string }[] = []
): string {
  if (step.kind === "section") {
    const blocksCount = draftBlocks(step.section).length;
    return `${step.section.heading || "(Sarlavhasiz bo'lim)"} · ${blocksCount} ta blok`;
  }
  if (step.kind === "quiz") {
    const count = step.question.options.filter((o) => o.trim()).length;
    return `${step.question.question || "(Savol yozilmagan)"} · ${count} variant`;
  }
  if (step.kind === "terms") {
    const valid = step.terms.filter((t) => t.en.trim());
    const count = valid.length || step.terms.length;
    const names = valid.map((t) => t.en).slice(0, 3).join(", ");
    return `${count} ta atama${names ? ` (${names})` : ""}`;
  }
  if (step.kind === "challenge") {
    const gName = step.gameId ? gamesList.find((g) => g.id === step.gameId)?.name : autoGameName;
    const vText = step.variant !== undefined ? ` (${step.variant + 1}-masala)` : "";
    return `${gName ?? "Interaktiv o'yin"}${vText}`;
  }
  return "";
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
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={index === 0}
        aria-label="Yuqoriga ko'chirish"
        className="p-1 rounded-full text-gray-400 dark:text-zinc-500 enabled:hover:text-[#26B54F] enabled:hover:bg-gray-100 enabled:dark:hover:bg-[#25252a] disabled:opacity-20 transition-colors cursor-pointer"
      >
        <IconChevronUp size={15} />
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={index === total - 1}
        aria-label="Pastga ko'chirish"
        className="p-1 rounded-full text-gray-400 dark:text-zinc-500 enabled:hover:text-[#26B54F] enabled:hover:bg-gray-100 enabled:dark:hover:bg-[#25252a] disabled:opacity-20 transition-colors cursor-pointer"
      >
        <IconChevronDown size={15} />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="p-1 rounded-full text-gray-400 dark:text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
      >
        <IconTrash size={14} />
      </button>
    </div>
  );
}

// ── Step editors ────────────────────────────────────────────────────────────

const BLOCK_ORDER: BlockKind[] = ["text", "richtext", "code", "choice", "image", "callout"];

const BLOCK_TONES: Record<BlockKind, string> = {
  text: "border-gray-200 dark:border-[#222226]",
  richtext: "border-[#7C5CE0]/40 bg-[#7C5CE0]/[0.02]",
  code: "border-[#A78BFA]/40 bg-[#A78BFA]/[0.02]",
  choice: "border-[#3B82F6]/40 bg-[#3B82F6]/[0.02]",
  image: "border-[#3B82F6]/40 bg-[#3B82F6]/[0.02]",
  callout: "border-[#26B54F]/40 bg-[#26B54F]/[0.02]",
};

function getBlockSummary(block: SectionBlock): string {
  if (block.kind === "text") {
    return block.text ? block.text.slice(0, 45) + (block.text.length > 45 ? "..." : "") : "(Bo'sh matn)";
  }
  if (block.kind === "richtext") {
    const stripped = block.content.replace(/<[^>]*>?/gm, " ").trim();
    return stripped ? stripped.slice(0, 45) + (stripped.length > 45 ? "..." : "") : "(Bo'sh rich matn)";
  }
  if (block.kind === "code") {
    if (block.caption?.trim()) return block.caption;
    const firstLine = block.lines.find((l) => l.trim());
    return firstLine ? firstLine.slice(0, 40) : "(Bo'sh kod)";
  }
  if (block.kind === "choice") {
    const q = block.question?.trim();
    const count = block.options.filter((o) => o.trim()).length;
    return `${q ? `${q.slice(0, 30)}: ` : ""}${count} ta variant`;
  }
  if (block.kind === "image") {
    return block.image.caption || block.image.alt || block.image.src || "(Rasm)";
  }
  if (block.kind === "callout") {
    return block.text ? block.text.slice(0, 45) : "(Bo'sh xulosa)";
  }
  return "";
}

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
  const [collapsedBlocks, setCollapsedBlocks] = useState<Record<number, boolean>>({});
  const [deleteBlockIndex, setDeleteBlockIndex] = useState<number | null>(null);

  const setBlocks = (next: SectionBlock[]) => onChange({ ...section, blocks: next });
  const replace = (index: number, block: SectionBlock) =>
    setBlocks(blocks.map((b, i) => (i === index ? block : b)));

  const toggleBlockCollapse = (index: number) => {
    setCollapsedBlocks((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    setBlocks(next);
    setCollapsedBlocks((prev) => ({
      ...prev,
      [index]: prev[target],
      [target]: prev[index],
    }));
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
        Ekran shu tartibda chiziladi. Bloklarni ochish yoki yopish uchun sarlavhasini bosing.
      </p>

      {blocks.map((block, i) => {
        const isCollapsed = Boolean(collapsedBlocks[i]);
        const summary = getBlockSummary(block);

        return (
          <div
            key={i}
            className={`rounded-[12px] border-2 ${BLOCK_TONES[block.kind]} overflow-hidden flex flex-col transition-all`}
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/70 dark:bg-[#1c1c20]/70 border-b border-gray-100 dark:border-[#222226]/80 select-none">
              <button
                type="button"
                onClick={() => toggleBlockCollapse(i)}
                className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer group"
              >
                <IconChevronDown
                  size={15}
                  className={`shrink-0 text-gray-400 dark:text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-transform duration-200 ${
                    isCollapsed ? "-rotate-90" : ""
                  }`}
                />
                <span className="shrink-0 w-[20px] h-[20px] rounded-[5px] bg-white dark:bg-[#232327] border border-gray-200 dark:border-[#2a2a30] text-[10.5px] font-mono font-bold text-gray-600 dark:text-zinc-300 flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="shrink-0 text-[11px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                  {BLOCK_LABELS[block.kind]}
                </span>
                {summary && (
                  <span className="min-w-0 flex-1 text-[11.5px] text-gray-400 dark:text-zinc-500 truncate font-normal">
                    — {summary}
                  </span>
                )}
              </button>

              <MoveControls
                index={i}
                total={blocks.length}
                onMove={(direction) => move(i, direction)}
                onRemove={() => setDeleteBlockIndex(i)}
                removeLabel="Blokni o'chirish"
              />
            </div>

            {!isCollapsed && (
              <div className="p-3 flex flex-col gap-3">
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

                {block.kind === "richtext" && (
                  <Field
                    label="Formatlangan matn"
                    hint="Qalin, kursiv, sarlavha, ro'yxat, iqtibos va havola"
                  >
                    <MarkdownEditor
                      value={block.content}
                      onChange={(content) => replace(i, { kind: "richtext", content })}
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

                {block.kind === "choice" && (
                  <ChoiceBlockEditor
                    block={block}
                    onChange={(updated) => replace(i, updated)}
                  />
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
                      replace(i, { kind: "image", image: image ?? { src: "", alt: "", size: "full" } })
                    }
                  />
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap gap-2 pt-1">
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

      {/* ── Block Delete Confirmation Modal ── */}
      {deleteBlockIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-sm rounded-[18px] border-2 border-red-500/40 bg-white dark:bg-[#18181c] p-5 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center shrink-0">
                <IconTrash size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
                  Blokni o&apos;chirish
                </h3>
                <p className="text-[12.5px] text-gray-500 dark:text-zinc-400 mt-1">
                  <strong>{deleteBlockIndex + 1}-blok ({blocks[deleteBlockIndex] ? BLOCK_LABELS[blocks[deleteBlockIndex].kind] : "blok"})</strong>ni o&apos;chirishni tasdiqlaysizmi?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-[#27272a]">
              <button
                type="button"
                onClick={() => setDeleteBlockIndex(null)}
                className="px-3.5 py-1.5 rounded-[10px] border border-gray-200 dark:border-[#333339] text-[12.5px] font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-[#25252a] transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => {
                  setBlocks(blocks.filter((_, k) => k !== deleteBlockIndex));
                  setDeleteBlockIndex(null);
                }}
                className="px-3.5 py-1.5 rounded-[10px] bg-red-500 hover:bg-red-600 text-white text-[12.5px] font-bold shadow-xs transition-colors cursor-pointer"
              >
                Ha, o&apos;chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Editor for the inline Choice block */
function ChoiceBlockEditor({
  block,
  onChange,
}: {
  block: Extract<SectionBlock, { kind: "choice" }>;
  onChange: (block: Extract<SectionBlock, { kind: "choice" }>) => void;
}) {
  const isShort = block.options.every((opt) => opt.trim().length <= 16);

  return (
    <div className="flex flex-col gap-3">
      <Field label="Savol yoki ko'rsatma (ixtiyoriy)">
        <TextInput
          value={block.question ?? ""}
          placeholder="To'g'ri variantni tanlang"
          onChange={(e) => onChange({ ...block, question: e.target.value })}
        />
      </Field>

      <Field
        label="Variantlar"
        hint="To'g'ri javobni chapdagi doiracha orqali belgilang"
      >
        <div className="flex flex-col gap-2">
          {block.options.map((option, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...block, correctIndex: oi })}
                aria-label={`${oi + 1}-variantni to'g'ri javob deb belgilash`}
                title="To'g'ri javob"
                className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                  block.correctIndex === oi
                    ? "border-[#26B54F] bg-[#26B54F]"
                    : "border-gray-300 dark:border-zinc-600 hover:border-[#26B54F]"
                }`}
              >
                {block.correctIndex === oi && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>

              <TextInput
                value={option}
                placeholder={`${oi + 1}-variant`}
                onChange={(e) =>
                  onChange({
                    ...block,
                    options: block.options.map((o, k) => (k === oi ? e.target.value : o)),
                  })
                }
              />

              <span className="shrink-0 w-7 text-right font-mono text-[11px] text-gray-400 dark:text-zinc-500">
                {option.trim().length || ""}
              </span>

              <button
                type="button"
                disabled={block.options.length <= 2}
                onClick={() => {
                  const options = block.options.filter((_, k) => k !== oi);
                  const correctIndex =
                    block.correctIndex === oi
                      ? 0
                      : block.correctIndex > oi
                      ? block.correctIndex - 1
                      : block.correctIndex;
                  onChange({ ...block, options, correctIndex });
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
            onClick={() => onChange({ ...block, options: [...block.options, ""] })}
            className="self-start inline-flex items-center gap-1 text-[12px] font-bold text-[#26B54F] hover:underline cursor-pointer mt-1"
          >
            <IconPlus size={12} /> Variant qo&apos;shish
          </button>
        </div>
      </Field>

      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11.5px]">
        <IconInfoCircle size={14} className="shrink-0" />
        <span>
          {isShort
            ? "Moslashuvchan ko'rinish: variantlar qisqa bo'lgani uchun 2 ustunda chiqadi."
            : "Moslashuvchan ko'rinish: variantlar uzunligi sababli 1 ustunli ro'yxat bo'lib chiqadi."}
        </span>
      </div>

      <Field
        label="Izoh (ixtiyoriy)"
        hint="To'g'ri javob tanlanganda o'quvchiga ko'rinadigan qisqa tushuntirish"
      >
        <TextInput
          value={block.explanation ?? ""}
          placeholder="Barakalla! Aynan shunday."
          onChange={(e) => onChange({ ...block, explanation: e.target.value })}
        />
      </Field>
    </div>
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
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const bytes = image?.src && uploaded ? dataUriBytes(image.src) : 0;

  // Determine current width percentage
  const currentWidth = image?.customWidth ?? (
    image?.size === "small"
      ? 35
      : image?.size === "medium"
      ? 60
      : image?.size === "large"
      ? 85
      : 100
  );

  const handleStartDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX;
    const initialW = currentWidth;
    const containerWidth = containerRef.current?.getBoundingClientRect().width ?? 350;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Since drag handle is on the right side of centered image, delta * 2 gives balanced width delta
      const deltaPercent = (deltaX / containerWidth) * 100 * 2;
      const newWidth = Math.round(Math.min(100, Math.max(20, initialW + deltaPercent)));
      onChange({
        ...image!,
        customWidth: newWidth,
        size: "custom",
      });
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

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
        size: image?.size ?? "full",
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
                  ? {
                      src: e.target.value,
                      alt: image?.alt ?? "",
                      size: image?.size ?? "full",
                      ...(image?.caption ? { caption: image.caption } : {}),
                    }
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
          {/* Interactive Resizable Preview Container */}
          <div
            ref={containerRef}
            className="relative rounded-[12px] border-2 border-gray-200 dark:border-[#27272a] bg-gray-100/70 dark:bg-[#0a0a0c] p-3 flex flex-col items-center justify-center select-none overflow-hidden"
          >
            <div
              className="relative group transition-all duration-75 flex items-center justify-center bg-white dark:bg-[#141416] rounded-[10px] border border-gray-300 dark:border-[#2f2f36] shadow-sm overflow-hidden"
              style={{
                width: `${currentWidth}%`,
                maxWidth: "100%",
                minWidth: "100px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt || "Rasm ko'rinishi"}
                className="w-full max-h-[190px] object-contain pointer-events-none"
              />

              {/* Drag Handle on the right edge */}
              <div
                onPointerDown={handleStartDrag}
                title="Rasmni tortib o'lchamini o'zgartiring"
                className={`absolute right-0 top-0 bottom-0 w-4.5 bg-[#26B54F]/20 hover:bg-[#26B54F] group-hover:bg-[#26B54F]/40 cursor-ew-resize flex items-center justify-center transition-all ${
                  isDragging ? "bg-[#26B54F] shadow-lg" : ""
                }`}
              >
                <div className="w-1 h-6 rounded-full bg-white shadow-xs" />
              </div>

              {/* Live width badge overlay */}
              <div className="absolute left-2 bottom-2 px-2 py-0.5 rounded-[6px] bg-black/70 backdrop-blur-xs text-white font-mono text-[10.5px] font-bold pointer-events-none">
                {currentWidth}%
              </div>
            </div>

            <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-2 flex items-center gap-1">
              <IconInfoCircle size={13} className="text-[#26B54F]" />
              Rasmning o&apos;ng chetidan ushlab torting yoki pastdagi slayderdan foydalaning.
            </p>
          </div>

          {/* Interactive Width Slider */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-zinc-400">
              <span className="uppercase tracking-wider">O&apos;lcham foizi</span>
              <span className="font-mono text-[#26B54F] font-extrabold">{currentWidth}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={1}
              value={currentWidth}
              onChange={(e) => {
                const w = Number(e.target.value);
                onChange({
                  ...image,
                  customWidth: w,
                  size: "custom",
                });
              }}
              className="w-full accent-[#26B54F] cursor-pointer"
            />
          </div>

          {/* Image Size Preset Buttons */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
              Tezkor shablonlar
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { key: "small", label: "Kichik", width: 35, hint: "35%" },
                  { key: "medium", label: "O'rtacha", width: 60, hint: "60%" },
                  { key: "large", label: "Katta", width: 85, hint: "85%" },
                  { key: "full", label: "To'liq", width: 100, hint: "100%" },
                ] as const
              ).map(({ key, label, width, hint }) => {
                const active = currentWidth === width;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...image,
                        size: key,
                        customWidth: width,
                      })
                    }
                    className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-[10px] border-2 text-[11.5px] font-bold transition-all cursor-pointer ${
                      active
                        ? "border-[#26B54F] bg-[#26B54F]/10 text-[#1a8a3c] dark:text-[#4ADE80]"
                        : "border-gray-200 dark:border-[#27272a] text-gray-500 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    <span>{label}</span>
                    <span className="text-[9.5px] font-normal opacity-70">{hint}</span>
                  </button>
                );
              })}
            </div>
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

function ChallengeStepEditor({
  step,
  lessonKind,
  moduleTopics,
  lessonTitle,
  levelTitle,
  lessonId,
  onChange,
}: {
  step: Extract<LessonStep, { kind: "challenge" }>;
  lessonKind: LessonKind;
  moduleTopics: string[];
  lessonTitle: string;
  levelTitle: string;
  lessonId: string;
  onChange: (step: Extract<LessonStep, { kind: "challenge" }>) => void;
}) {
  const games = listGames();
  const autoGame = resolveGame({
    kind: lessonKind,
    lessonTitle,
    levelTitle,
    moduleTopics,
    seed: lessonId,
  });

  const activeGameId = step.gameId || autoGame?.id || "";
  const activeGame = getGame(activeGameId) || autoGame;
  const puzzles = getGamePuzzles(activeGameId);

  return (
    <div className="flex flex-col gap-3.5">
      <Field
        label="O'yin turi"
        hint={
          step.gameId
            ? "O'zingiz tanlagan o'yin"
            : autoGame
            ? `Avtomatik tanlangan: ${autoGame.name}`
            : "Avtomatik tanlanadi"
        }
      >
        <Select
          value={step.gameId ?? ""}
          onChange={(e) => {
            const newGameId = e.target.value;
            onChange({
              ...step,
              gameId: newGameId,
              variant: undefined,
            });
          }}
        >
          <option value="">
            — Avtomatik tanlash {autoGame ? `(${autoGame.name})` : ""} —
          </option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </Field>

      {activeGame && (
        <div className="rounded-[10px] bg-gray-50 dark:bg-[#1c1c20] p-3 flex flex-col gap-1.5 border border-gray-200/70 dark:border-[#2a2a30]">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-bold text-gray-800 dark:text-zinc-200">
              {activeGame.name}
            </span>
            {!step.gameId ? (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#26B54F]/15 text-[#177F37] dark:text-[#4ADE80] px-2 py-0.5 rounded-full">
                Avtomatik
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#3B82F6]/15 text-[#2563EB] dark:text-[#60A5FA] px-2 py-0.5 rounded-full">
                Qo&apos;lda tanlangan
              </span>
            )}
          </div>
          <p className="text-[12px] leading-relaxed text-gray-500 dark:text-zinc-400">
            {activeGame.description}
          </p>
        </div>
      )}

      {/* ── Puzzle / Variant selector ── */}
      {puzzles.length > 0 && (
        <div className="flex flex-col gap-2 pt-1 border-t border-gray-200 dark:border-[#26262a]">
          <Field
            label="Masala / Qiyinchilik darajasi (Variant)"
            hint="Darsda o'quvchiga tushadigan aniq topshiriqni tanlang"
          >
            <Select
              value={step.variant !== undefined ? String(step.variant) : ""}
              onChange={(e) => {
                const val = e.target.value;
                onChange({
                  ...step,
                  variant: val === "" ? undefined : Number(val),
                });
              }}
            >
              <option value="">
                — Avtomatik (tavsiya etiladi — dars tartibi bo&apos;yicha) —
              </option>
              {puzzles.map((p) => (
                <option key={p.variant} value={p.variant}>
                  {p.variant + 1}-masala: {p.title} ({p.difficulty ?? "O'rta"})
                </option>
              ))}
            </Select>
          </Field>

          {step.variant !== undefined && puzzles[step.variant] && (
            <div className="rounded-[10px] border border-[#26B54F]/30 bg-[#26B54F]/[0.06] p-3 flex flex-col gap-1 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-green-900 dark:text-[#4ADE80]">
                  {step.variant + 1}-masala: {puzzles[step.variant].title}
                </span>
                {puzzles[step.variant].difficulty && (
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#1a1a1e] border border-gray-200 dark:border-[#2a2a30] text-gray-700 dark:text-zinc-200">
                    {puzzles[step.variant].difficulty}
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-zinc-300">
                {puzzles[step.variant].hint}
              </p>
            </div>
          )}

          <p className="text-[11.5px] text-gray-400 dark:text-zinc-500">
            Tanlangan o&apos;yin va masala o&apos;ng tomondagi jonli ko&apos;rinishda (Preview) darhol aks etadi.
          </p>
        </div>
      )}

      {/* -- The game's own task -- */}
      <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-[#26262a]">
        <span className="text-[12px] font-bold text-gray-700 dark:text-zinc-300">
          Topshiriqni o&apos;zingiz yozish
        </span>
        <GameConfigForm
          gameId={activeGameId}
          value={step.customConfig}
          onChange={(config) => onChange({ ...step, customConfig: config })}
        />
      </div>
    </div>
  );
}

