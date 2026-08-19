"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconDeviceFloppy,
  IconDownload,
  IconEye,
  IconLayoutSidebar,
  IconPencil,
  IconUpload,
} from "@tabler/icons-react";
import { allTracks, moduleLessons } from "@/data/curriculum";
import {
  DraftLesson,
  DraftLevel,
  DraftModule,
  DraftTrack,
  buildExportFiles,
  countLessons,
  emptyLesson,
  emptyLevel,
  emptyModule,
  emptyTrack,
  renumberIds,
  toDraftContent,
  validateDraft,
} from "@/lib/writerDraft";
import type { LessonContent } from "@/types/lessonContent";
import { Inspector, type InspectorActions } from "./Inspector";
import { IssuePanel } from "./IssuePanel";
import { PreviewPane, type PreviewStage } from "./PreviewPane";
import { StructureTree } from "./StructureTree";
import { clampSelection, type Selection } from "./selection";

const STORAGE_KEY = "codegarten_writer_draft_v2";
/** Drafts written by the previous writer, migrated once on first load. */
const LEGACY_STORAGE_KEY = "codegarten_writer_draft_v1";

type Pane = "tree" | "edit" | "preview";

/**
 * Lesson bodies are edited as an ordered step list. A draft saved before that
 * existed still carries the old pools, so it is converted on the way in — the
 * editor never has to handle two shapes.
 */
function normalise(draft: DraftModule): DraftModule {
  return {
    ...draft,
    levels: draft.levels.map((level) => ({
      ...level,
      lessons: level.lessons.map((lesson) => ({
        ...lesson,
        content: toDraftContent(lesson.content),
      })),
    })),
  };
}

/**
 * Writer workspace
 * ----------------
 * Three panes, one selection: the outline says what exists, the middle pane
 * edits the selected thing, the right pane shows what a learner would see. The
 * previous single-column form made it impossible to tell where you were, which
 * is why structure mistakes only surfaced after export.
 */
export function WriterWorkspace() {
  const [draft, setDraft] = useState<DraftModule>(() => emptyModule());
  const [hydrated, setHydrated] = useState(false);
  const [selection, setSelection] = useState<Selection>({ kind: "module" });
  const [stage, setStage] = useState<PreviewStage>("modules");
  const [pane, setPane] = useState<Pane>("edit");
  const [status, setStatus] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── What already exists in the project, for collision checks and preview ──
  const project = useMemo(() => {
    const moduleIds: string[] = [];
    const lessonIds: string[] = [];
    for (const track of allTracks) {
      for (const module of track.modules) {
        moduleIds.push(module.id);
        for (const location of moduleLessons(module)) lessonIds.push(location.lesson.id);
      }
    }
    return {
      moduleIds,
      lessonIds,
      trackIds: allTracks.map((t) => t.id),
      tracks: allTracks.map((t) => ({ id: t.id, title: t.title })),
      /** tracks.json content, needed when the draft adds a new track. */
      trackFiles: allTracks.map<DraftTrack>((t) => ({
        id: t.id,
        category: t.category,
        title: t.title,
        titleEn: t.titleEn,
        description: t.description,
        colorTheme: t.colorTheme,
      })),
    };
  }, []);

  const issues = useMemo(
    () =>
      validateDraft(draft, {
        existingModuleIds: project.moduleIds,
        existingLessonIds: project.lessonIds,
        existingTrackIds: project.trackIds,
      }),
    [draft, project]
  );
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  // ── Autosave: authoring a module is long work to lose to a refresh ──
  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DraftModule>;
        // Older drafts predate topics, the new-track fields and step lists.
        setDraft(normalise({ ...emptyModule(), ...parsed, topics: parsed.topics ?? [] }));
      } else {
        setDraft(emptyModule({ num: project.moduleIds.length + 1 }));
      }
    } catch {
      // Corrupt draft — start from a blank module rather than crash the page.
    }
    setHydrated(true);
    // project is derived from the generated curriculum, so it never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setSaveFailed(false);
    } catch {
      /*
       * Almost always the storage quota, and almost always an uploaded image.
       * Failing silently meant an author could lose a long session to a refresh
       * without ever being told the draft had stopped saving.
       */
      setSaveFailed(true);
    }
  }, [draft, hydrated]);

  // A deleted level or lesson must not leave the selection pointing at nothing.
  useEffect(() => {
    setSelection((prev) => clampSelection(prev, draft.levels));
  }, [draft.levels]);

  // Selecting a lesson takes the preview to that lesson; selecting the module
  // takes it back to the catalog view, so both sides always agree.
  const select = useCallback((next: Selection) => {
    setSelection(next);
    setStage(next.kind === "lesson" ? "lesson" : next.kind === "level" ? "path" : "modules");
    setPane("edit");
  }, []);

  // ── Mutations ────────────────────────────────────────────────────────────

  const mutate = (fn: (draft: DraftModule) => DraftModule) => setDraft((d) => fn(d));

  const actions: InspectorActions = {
    patchModule: (patch) => mutate((d) => ({ ...d, ...patch })),

    patchNewTrack: (patch) =>
      mutate((d) => {
        const newTrack = { ...(d.newTrack ?? emptyTrack()), ...patch };
        // The module follows the track it is defining, so the id stays in sync.
        return { ...d, newTrack, trackId: newTrack.id };
      }),

    chooseTrack: (trackId) =>
      mutate((d) => ({ ...d, trackId, newTrack: undefined })),

    startNewTrack: () =>
      mutate((d) => {
        const newTrack = emptyTrack();
        return { ...d, newTrack, trackId: newTrack.id };
      }),

    patchLevel: (levelIndex, patch) =>
      mutate((d) => ({
        ...d,
        levels: d.levels.map((level, i) =>
          i === levelIndex ? { ...level, ...patch } : level
        ),
      })),

    patchLesson: (levelIndex, lessonIndex, patch) =>
      mutate((d) => ({
        ...d,
        levels: d.levels.map((level, li) =>
          li !== levelIndex
            ? level
            : {
                ...level,
                lessons: level.lessons.map((lesson, i) =>
                  i === lessonIndex ? { ...lesson, ...patch } : lesson
                ),
              }
        ),
      })),

    patchContent: (levelIndex, lessonIndex, patch) =>
      mutate((d) => ({
        ...d,
        levels: d.levels.map((level, li) =>
          li !== levelIndex
            ? level
            : {
                ...level,
                lessons: level.lessons.map((lesson, i) =>
                  i === lessonIndex
                    ? { ...lesson, content: { ...lesson.content, ...patch } as LessonContent }
                    : lesson
                ),
              }
        ),
      })),

    regenerateIds: () => {
      mutate((d) => renumberIds(d));
      setStatus("Id lar modul id ga moslandi");
    },
  };

  const addLevel = () =>
    mutate((d) => ({
      ...d,
      levels: [
        ...d.levels,
        emptyLevel(d.id, d.levels.length + 1, d.levels.map((l) => l.id)),
      ],
    }));

  const removeLevel = (levelIndex: number) =>
    mutate((d) =>
      d.levels.length <= 1
        ? d
        : { ...d, levels: d.levels.filter((_, i) => i !== levelIndex) }
    );

  const moveLevel = (levelIndex: number, direction: -1 | 1) =>
    mutate((d) => {
      const target = levelIndex + direction;
      if (target < 0 || target >= d.levels.length) return d;
      const levels = [...d.levels];
      [levels[levelIndex], levels[target]] = [levels[target], levels[levelIndex]];
      return { ...d, levels };
    });

  const addLesson = (levelIndex: number) => {
    mutate((d) => {
      const level = d.levels[levelIndex];
      if (!level) return d;
      const taken = d.levels.flatMap((l) => l.lessons.map((ls) => ls.id));
      const lesson = emptyLesson(level.id, level.lessons.length, taken);
      return {
        ...d,
        levels: d.levels.map((l, i) =>
          i === levelIndex ? { ...l, lessons: [...l.lessons, lesson] } : l
        ),
      };
    });
    // Land the author on the lesson they just created.
    const lessonIndex = draft.levels[levelIndex]?.lessons.length ?? 0;
    select({ kind: "lesson", levelIndex, lessonIndex });
  };

  const removeLesson = (levelIndex: number, lessonIndex: number) =>
    mutate((d) => ({
      ...d,
      levels: d.levels.map((level, li) =>
        li !== levelIndex
          ? level
          : level.lessons.length <= 1
          ? level
          : { ...level, lessons: level.lessons.filter((_, i) => i !== lessonIndex) }
      ),
    }));

  const moveLesson = (levelIndex: number, lessonIndex: number, direction: -1 | 1) =>
    mutate((d) => ({
      ...d,
      levels: d.levels.map((level, li) => {
        if (li !== levelIndex) return level;
        const target = lessonIndex + direction;
        if (target < 0 || target >= level.lessons.length) return level;
        const lessons: DraftLesson[] = [...level.lessons];
        [lessons[lessonIndex], lessons[target]] = [lessons[target], lessons[lessonIndex]];
        return { ...level, lessons };
      }),
    }));

  // ── Export / import ──────────────────────────────────────────────────────

  const handleDownload = async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const file of buildExportFiles(draft, project.trackFiles)) {
      // Uploaded images arrive base64-encoded and have to enter the ZIP as binary,
      // otherwise the exported PNG is a text file full of base64.
      if (file.base64 !== undefined) zip.file(file.path, file.base64, { base64: true });
      else zip.file(file.path, file.contents ?? "");
    }
    const blob = await zip.generateAsync({ type: "blob" });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${draft.id || "modul"}.zip`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus("ZIP yuklab olindi");
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<DraftModule>;
      if (!parsed.id || !Array.isArray(parsed.levels)) {
        setStatus("Bu modul fayliga o'xshamaydi");
        return;
      }

      // Module files carry structure only, so lesson bodies start empty.
      const restored: DraftModule = {
        ...emptyModule(),
        ...parsed,
        topics: parsed.topics ?? [],
        levels: (parsed.levels as DraftLevel[]).map((level, li) => ({
          ...emptyLevel(parsed.id!, li + 1),
          ...level,
          lessons: level.lessons.map((lesson, i) => ({
            ...emptyLesson(level.id, i),
            ...lesson,
            gameId: (lesson as DraftLesson).gameId ?? "",
            content: toDraftContent((lesson as DraftLesson).content),
          })),
        })),
      };
      setDraft(restored);
      setSelection({ kind: "module" });
      setStage("modules");
      setStatus(`"${parsed.id}" yuklandi — dars matnlarini to'ldiring`);
    } catch {
      setStatus("Faylni o'qib bo'lmadi");
    }
  };

  const resetDraft = () => {
    if (!confirm("Butun qoralamani tozalashni tasdiqlaysizmi?")) return;
    setDraft(emptyModule({ num: project.moduleIds.length + 1 }));
    setSelection({ kind: "module" });
    setStage("modules");
    setStatus("Qoralama tozalandi");
  };

  // Status lines are informational; clear them so they do not pile up.
  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(timer);
  }, [status]);

  const activeTrack = useMemo(
    () => allTracks.find((t) => t.id === draft.trackId),
    [draft.trackId]
  );

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="border-b border-gray-100 dark:border-[#27272a] sticky top-16 z-30 bg-white dark:bg-[#141414]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight truncate">
              {draft.title || "Writer — yangi modul"}
            </h1>
            <p className="text-[12px] text-gray-500 dark:text-zinc-400 truncate">
              {draft.levels.length} bosqich · {countLessons(draft)} dars ·{" "}
              {activeTrack?.title ?? draft.newTrack?.title ?? "yo'nalish tanlanmagan"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {errors.length === 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#26B54F]/15 px-3 py-1.5 text-[12px] font-bold text-[#1a8a3c] dark:text-[#4ADE80]">
                <IconCircleCheck size={14} />
                Tayyor
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1.5 text-[12px] font-bold text-red-600 dark:text-red-400">
                <IconAlertTriangle size={14} />
                {errors.length} xato
              </span>
            )}
            {warnings.length > 0 && (
              <span className="hidden sm:inline text-[12px] text-gray-400 dark:text-zinc-500">
                {warnings.length} ogohlantirish
              </span>
            )}
            {hydrated && !saveFailed && (
              <span
                title="Qoralama brauzerda avtomatik saqlanadi"
                className="hidden md:inline-flex items-center gap-1 text-[12px] text-gray-400 dark:text-zinc-500"
              >
                <IconDeviceFloppy size={14} />
                saqlanmoqda
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImport}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-gray-200 dark:border-[#27272a] px-3.5 py-2 text-[13px] font-bold hover:border-gray-300 dark:hover:border-zinc-600 transition-colors cursor-pointer"
            >
              <IconUpload size={15} />
              <span className="hidden sm:inline">Yuklash</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={errors.length > 0}
              title={
                errors.length > 0
                  ? "Avval xatolarni tuzatish kerak"
                  : "ZIP holatida yuklab olish"
              }
              className="inline-flex items-center gap-1.5 rounded-full bg-[#26B54F] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#1ea94f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <IconDownload size={15} />
              ZIP
            </button>
          </div>
        </div>

        {(status || saveFailed) && (
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pb-2.5">
            {status && (
              <p className="text-[12px] text-[#1a8a3c] dark:text-[#4ADE80]">{status}</p>
            )}
            {saveFailed && (
              <p className="text-[12px] text-red-500">
                Qoralama brauzerda saqlanmadi - joy yetmadi. Katta rasmlarni siqib
                yuklang yoki ZIP holatida yuklab oling.
              </p>
            )}
          </div>
        )}

        {/* Pane switch — three panes do not fit below lg */}
        <div className="xl:hidden border-t border-gray-100 dark:border-[#27272a]">
          <div className="max-w-[1600px] mx-auto px-4 flex">
            {(
              [
                { key: "tree", label: "Tuzilma", Icon: IconLayoutSidebar },
                { key: "edit", label: "Tahrirlash", Icon: IconPencil },
                { key: "preview", label: "Ko'rinishi", Icon: IconEye },
              ] as const
            ).map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setPane(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-bold border-b-2 transition-colors cursor-pointer ${
                  pane === key
                    ? "border-[#26B54F] text-[#26B54F]"
                    : "border-transparent text-gray-500 dark:text-zinc-400"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_460px] gap-5">

          {/* ══ OUTLINE ══ */}
          <aside
            className={`lg:sticky lg:top-[168px] lg:self-start lg:max-h-[calc(100vh-190px)] lg:overflow-y-auto ${
              pane === "tree" ? "" : "hidden lg:block"
            }`}
          >
            <StructureTree
              draft={draft}
              issues={issues}
              selection={selection}
              onSelect={select}
              onAddLevel={addLevel}
              onRemoveLevel={removeLevel}
              onMoveLevel={moveLevel}
              onAddLesson={addLesson}
              onRemoveLesson={removeLesson}
              onMoveLesson={moveLesson}
            />
          </aside>

          {/* ══ EDITOR ══ */}
          <div
            className={`flex-col gap-4 min-w-0 ${
              pane === "edit" ? "flex" : "hidden xl:flex"
            }`}
          >
            <Inspector
              draft={draft}
              selection={selection}
              issues={issues}
              tracks={project.tracks}
              actions={actions}
            />

            <IssuePanel issues={issues} onSelect={select} />

            <button
              type="button"
              onClick={resetDraft}
              className="self-start text-[12px] font-semibold text-gray-400 dark:text-zinc-500 hover:text-red-500 transition-colors cursor-pointer"
            >
              Qoralamani tozalash
            </button>
          </div>

          {/* ══ PREVIEW ══ */}
          <div
            className={`xl:sticky xl:top-[168px] xl:self-start xl:h-[calc(100vh-190px)] min-w-0 ${
              pane === "preview" ? "block" : "hidden xl:block"
            }`}
          >
            <PreviewPane
              draft={draft}
              trackTitle={
                activeTrack?.title ?? draft.newTrack?.title ?? "Yangi yo'nalish"
              }
              trackModules={activeTrack?.modules ?? []}
              selection={selection}
              onSelect={setSelection}
              stage={stage}
              onStageChange={setStage}
            />
          </div>
        </div>
      </main>
    </>
  );
}
