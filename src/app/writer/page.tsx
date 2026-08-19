"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IconDownload,
  IconPlus,
  IconTrash,
  IconUpload,
  IconAlertTriangle,
  IconCircleCheck,
  IconEye,
  IconPencil,
  IconChevronDown,
} from "@tabler/icons-react";
import { AppNavbar } from "@/components/dashboard/AppNavbar";
import { LessonRunner } from "@/components/lesson/LessonRunner";
import { listGames } from "@/games/registry";
import { getGame } from "@/games/registry";
import { allTracks } from "@/data/curriculum";
import {
  DraftLesson,
  DraftModule,
  KIND_LABELS,
  LessonKind,
  MINUTES_BY_KIND,
  XP_BY_KIND,
  buildExportFiles,
  emptyLesson,
  emptyLevel,
  emptyModule,
  validateDraft,
} from "@/lib/writerDraft";

const STORAGE_KEY = "codegarten_writer_draft_v1";
const KINDS: LessonKind[] = ["concept", "exercise", "challenge", "review"];

// ── Small form primitives, so the editor below stays readable ───────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-[11px] text-gray-400 dark:text-zinc-500">{hint}</span>
      )}
    </label>
  );
}

const inputClass =
  "rounded-[10px] border-2 border-gray-200 dark:border-[#27272a] bg-transparent px-3 py-2 text-sm outline-none focus:border-[#26B54F] transition-colors w-full";

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} font-sans leading-relaxed`} />;
}

function SubCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[12px] border-2 border-gray-100 dark:border-[#222226] p-3.5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
          {title}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded-full text-gray-300 dark:text-zinc-600 hover:text-red-500 transition-colors cursor-pointer"
            aria-label={`${title}ni o'chirish`}
          >
            <IconTrash size={14} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function WriterPage() {
  const [draft, setDraft] = useState<DraftModule>(() => emptyModule());
  const [hydrated, setHydrated] = useState(false);
  const [selected, setSelected] = useState<{ level: number; lesson: number }>({
    level: 0,
    lesson: 0,
  });
  const [mobilePane, setMobilePane] = useState<"edit" | "preview">("edit");
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const games = useMemo(() => listGames(), []);
  const issues = useMemo(() => validateDraft(draft), [draft]);
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  // Autosave: authoring a module is long work to lose to a refresh.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDraft(JSON.parse(raw));
    } catch {
      // Corrupt draft — start from a blank module.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Draft too large or storage blocked — editing still works in-session.
    }
  }, [draft, hydrated]);

  const level = draft.levels[Math.min(selected.level, draft.levels.length - 1)];
  const lesson =
    level?.lessons[Math.min(selected.lesson, (level?.lessons.length ?? 1) - 1)];

  // ── Mutation helpers ─────────────────────────────────────────────────────

  const patchModule = (patch: Partial<DraftModule>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const patchLesson = useCallback(
    (patch: Partial<DraftLesson>) => {
      setDraft((d) => {
        const levels = d.levels.map((lv, li) =>
          li !== selected.level
            ? lv
            : {
                ...lv,
                lessons: lv.lessons.map((ls, i) =>
                  i !== selected.lesson ? ls : { ...ls, ...patch }
                ),
              }
        );
        return { ...d, levels };
      });
    },
    [selected]
  );

  const patchContent = useCallback(
    (patch: Partial<DraftLesson["content"]>) => {
      if (!lesson) return;
      patchLesson({ content: { ...lesson.content, ...patch } });
    },
    [lesson, patchLesson]
  );

  const addLevel = () =>
    setDraft((d) => ({
      ...d,
      levels: [...d.levels, emptyLevel(d.id, d.levels.length + 1)],
    }));

  const removeLevel = (index: number) =>
    setDraft((d) => ({
      ...d,
      levels: d.levels.filter((_, i) => i !== index),
    }));

  const addLesson = (levelIndex: number) =>
    setDraft((d) => ({
      ...d,
      levels: d.levels.map((lv, i) =>
        i !== levelIndex
          ? lv
          : { ...lv, lessons: [...lv.lessons, emptyLesson(lv.id, lv.lessons.length)] }
      ),
    }));

  const removeLesson = (levelIndex: number, lessonIndex: number) =>
    setDraft((d) => ({
      ...d,
      levels: d.levels.map((lv, i) =>
        i !== levelIndex
          ? lv
          : { ...lv, lessons: lv.lessons.filter((_, j) => j !== lessonIndex) }
      ),
    }));

  // ── Export / import ──────────────────────────────────────────────────────

  const handleDownload = async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const file of buildExportFiles(draft)) {
      zip.file(file.path, file.contents);
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
      const parsed = JSON.parse(text);
      if (!parsed.id || !Array.isArray(parsed.levels)) {
        setStatus("Bu modul fayliga o'xshamaydi");
        return;
      }
      // Imported module files carry no lesson content, so seed empty bodies.
      const restored: DraftModule = {
        ...emptyModule(),
        ...parsed,
        levels: parsed.levels.map((lv: DraftModule["levels"][number]) => ({
          ...lv,
          lessons: lv.lessons.map((ls, i) => ({
            ...emptyLesson(lv.id, i),
            ...ls,
            gameId: (ls as DraftLesson).gameId ?? "",
          })),
        })),
      };
      setDraft(restored);
      setSelected({ level: 0, lesson: 0 });
      setStatus(`"${parsed.id}" yuklandi — dars matnlarini to'ldiring`);
    } catch {
      setStatus("Faylni o'qib bo'lmadi");
    }
  };

  const resetDraft = () => {
    if (!confirm("Butun qoralamani tozalashni tasdiqlaysizmi?")) return;
    setDraft(emptyModule());
    setSelected({ level: 0, lesson: 0 });
    setStatus("Qoralama tozalandi");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#141414] text-black dark:text-white flex flex-col font-sans">
      <AppNavbar />

      {/* ── Toolbar ── */}
      <div className="border-b border-gray-100 dark:border-[#27272a] sticky top-16 z-30 bg-white dark:bg-[#141414]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight truncate">
              Writer — modul yaratish
            </h1>
            <p className="text-[12px] text-gray-500 dark:text-zinc-400 truncate">
              {draft.levels.length} bosqich ·{" "}
              {draft.levels.reduce((s, l) => s + l.lessons.length, 0)} dars
            </p>
          </div>

          {/* Validation summary */}
          <div className="flex items-center gap-2 shrink-0">
            {errors.length === 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#26B54F]/15 px-3 py-1.5 text-[12px] font-bold text-[#1a8a3c] dark:text-[#4ADE80]">
                <IconCircleCheck size={14} />
                Tayyor
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1.5 text-[12px] font-bold text-amber-600 dark:text-amber-400">
                <IconAlertTriangle size={14} />
                {errors.length} xato
              </span>
            )}
            {warnings.length > 0 && (
              <span className="hidden sm:inline text-[12px] text-gray-400 dark:text-zinc-500">
                {warnings.length} ogohlantirish
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

        {status && (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-2.5">
            <p className="text-[12px] text-[#1a8a3c] dark:text-[#4ADE80]">{status}</p>
          </div>
        )}
      </div>

      {/* ── Mobile pane switch ── */}
      <div className="lg:hidden border-b border-gray-100 dark:border-[#27272a]">
        <div className="max-w-[1400px] mx-auto px-4 flex">
          {(["edit", "preview"] as const).map((pane) => (
            <button
              key={pane}
              type="button"
              onClick={() => setMobilePane(pane)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-bold border-b-2 transition-colors cursor-pointer ${
                mobilePane === pane
                  ? "border-[#26B54F] text-[#26B54F]"
                  : "border-transparent text-gray-500 dark:text-zinc-400"
              }`}
            >
              {pane === "edit" ? <IconPencil size={15} /> : <IconEye size={15} />}
              {pane === "edit" ? "Tahrirlash" : "Ko'rinishi"}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ══ EDITOR ══ */}
          <div className={`flex flex-col gap-5 ${mobilePane === "edit" ? "" : "hidden lg:flex"}`}>

            {/* Module meta */}
            <section className="rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-4 sm:p-5 flex flex-col gap-3.5">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                Modul
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Modul id" hint="fayl nomi bo'ladi">
                  <TextInput
                    value={draft.id}
                    onChange={(e) => patchModule({ id: e.target.value })}
                    placeholder="mod-7"
                  />
                </Field>
                <Field label="Tartib raqami">
                  <TextInput
                    type="number"
                    value={draft.num}
                    onChange={(e) => patchModule({ num: Number(e.target.value) })}
                  />
                </Field>
              </div>

              <Field label="Yo'nalish">
                <select
                  value={draft.trackId}
                  onChange={(e) => patchModule({ trackId: e.target.value })}
                  className={inputClass}
                >
                  {allTracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Nomi">
                <TextInput
                  value={draft.title}
                  onChange={(e) => patchModule({ title: e.target.value })}
                  placeholder="Rekursiya"
                />
              </Field>

              <Field label="Inglizcha nomi">
                <TextInput
                  value={draft.titleEn}
                  onChange={(e) => patchModule({ titleEn: e.target.value })}
                  placeholder="Recursion"
                />
              </Field>

              <Field label="Tavsif">
                <TextArea
                  rows={2}
                  value={draft.description}
                  onChange={(e) => patchModule({ description: e.target.value })}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Rasm yo'li">
                  <TextInput
                    value={draft.imageSrc}
                    onChange={(e) => patchModule({ imageSrc: e.target.value })}
                  />
                </Field>
                <Field label="Asosiy rang">
                  <TextInput
                    value={draft.accent}
                    onChange={(e) => patchModule({ accent: e.target.value })}
                  />
                </Field>
              </div>
            </section>

            {/* Level / lesson tree */}
            <section className="rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Bosqichlar va darslar
                </h2>
                <button
                  type="button"
                  onClick={addLevel}
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-[#26B54F] hover:underline cursor-pointer"
                >
                  <IconPlus size={13} /> Bosqich
                </button>
              </div>

              {draft.levels.map((lv, li) => (
                <div
                  key={`${lv.id}-${li}`}
                  className="rounded-[12px] border-2 border-gray-100 dark:border-[#222226] p-3 flex flex-col gap-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-gray-400 dark:text-zinc-500 shrink-0">
                      L{lv.num}
                    </span>
                    <input
                      value={lv.title}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          levels: d.levels.map((x, i) =>
                            i === li ? { ...x, title: e.target.value } : x
                          ),
                        }))
                      }
                      placeholder="Bosqich nomi"
                      className="flex-1 min-w-0 bg-transparent text-sm font-bold outline-none border-b border-transparent focus:border-[#26B54F] transition-colors"
                    />
                    {draft.levels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLevel(li)}
                        className="p-1 rounded-full text-gray-300 dark:text-zinc-600 hover:text-red-500 transition-colors cursor-pointer"
                        aria-label="Bosqichni o'chirish"
                      >
                        <IconTrash size={14} />
                      </button>
                    )}
                  </div>

                  <input
                    value={lv.summary}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        levels: d.levels.map((x, i) =>
                          i === li ? { ...x, summary: e.target.value } : x
                        ),
                      }))
                    }
                    placeholder="Bir qatorli izoh"
                    className="bg-transparent text-[12px] text-gray-500 dark:text-zinc-400 outline-none"
                  />

                  <div className="flex flex-col gap-1.5">
                    {lv.lessons.map((ls, i) => {
                      const isActive = selected.level === li && selected.lesson === i;
                      return (
                        <div key={`${ls.id}-${i}`} className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelected({ level: li, lesson: i })}
                            className={`flex-1 min-w-0 text-left rounded-[9px] px-2.5 py-2 text-[13px] transition-colors cursor-pointer ${
                              isActive
                                ? "bg-[#26B54F]/15 text-[#1a8a3c] dark:text-[#4ADE80] font-bold"
                                : "hover:bg-gray-50 dark:hover:bg-[#1c1c20]"
                            }`}
                          >
                            <span className="truncate block">
                              {ls.title || (
                                <span className="text-gray-400 dark:text-zinc-500">
                                  (nomsiz dars)
                                </span>
                              )}
                            </span>
                            <span className="text-[10.5px] text-gray-400 dark:text-zinc-500">
                              {KIND_LABELS[ls.kind]} · {ls.xp} XP
                            </span>
                          </button>
                          {lv.lessons.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLesson(li, i)}
                              className="p-1 rounded-full text-gray-300 dark:text-zinc-600 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                              aria-label="Darsni o'chirish"
                            >
                              <IconTrash size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => addLesson(li)}
                      className="self-start inline-flex items-center gap-1 text-[12px] font-bold text-[#26B54F] hover:underline cursor-pointer mt-0.5"
                    >
                      <IconPlus size={12} /> Dars
                    </button>
                  </div>
                </div>
              ))}
            </section>

            {/* Lesson content */}
            {lesson && (
              <section className="rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-4 sm:p-5 flex flex-col gap-4">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Dars matni
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Dars id">
                    <TextInput
                      value={lesson.id}
                      onChange={(e) => patchLesson({ id: e.target.value })}
                    />
                  </Field>
                  <Field label="Turi">
                    <select
                      value={lesson.kind}
                      onChange={(e) => {
                        const kind = e.target.value as LessonKind;
                        patchLesson({
                          kind,
                          xp: XP_BY_KIND[kind],
                          estMinutes: MINUTES_BY_KIND[kind],
                        });
                      }}
                      className={inputClass}
                    >
                      {KINDS.map((k) => (
                        <option key={k} value={k}>
                          {KIND_LABELS[k]}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Dars nomi">
                  <TextInput
                    value={lesson.title}
                    onChange={(e) => patchLesson({ title: e.target.value })}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="XP">
                    <TextInput
                      type="number"
                      value={lesson.xp}
                      onChange={(e) => patchLesson({ xp: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Daqiqa">
                    <TextInput
                      type="number"
                      value={lesson.estMinutes}
                      onChange={(e) =>
                        patchLesson({ estMinutes: Number(e.target.value) })
                      }
                    />
                  </Field>
                </div>

                <Field
                  label="Interaktiv o'yin"
                  hint="Bo'sh qoldirilsa, ilova o'zi tanlaydi"
                >
                  <select
                    value={lesson.gameId}
                    onChange={(e) => patchLesson({ gameId: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">— tanlanmagan —</option>
                    {games.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </Field>

                {lesson.gameId && (
                  <p className="text-[12px] text-gray-500 dark:text-zinc-400 -mt-1">
                    {getGame(lesson.gameId)?.description}
                  </p>
                )}

                <Field label="Maqsad" hint="O'quvchi nimani o'rganadi — bir gap">
                  <TextArea
                    rows={2}
                    value={lesson.content.goal}
                    onChange={(e) => patchContent({ goal: e.target.value })}
                  />
                </Field>

                {/* Sections */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                      Bo&apos;limlar
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        patchContent({
                          sections: [
                            ...lesson.content.sections,
                            { heading: "", body: [""] },
                          ],
                        })
                      }
                      className="inline-flex items-center gap-1 text-[12px] font-bold text-[#26B54F] hover:underline cursor-pointer"
                    >
                      <IconPlus size={12} /> Bo&apos;lim
                    </button>
                  </div>

                  {lesson.content.sections.map((section, si) => (
                    <SubCard
                      key={si}
                      title={`${si + 1}-bo'lim`}
                      onRemove={
                        lesson.content.sections.length > 1
                          ? () =>
                              patchContent({
                                sections: lesson.content.sections.filter(
                                  (_, i) => i !== si
                                ),
                              })
                          : undefined
                      }
                    >
                      <TextInput
                        value={section.heading}
                        placeholder="Sarlavha"
                        onChange={(e) =>
                          patchContent({
                            sections: lesson.content.sections.map((s, i) =>
                              i === si ? { ...s, heading: e.target.value } : s
                            ),
                          })
                        }
                      />
                      <Field label="Matn" hint="Har xatboshi — alohida qator">
                        <TextArea
                          rows={4}
                          value={section.body.join("\n")}
                          onChange={(e) =>
                            patchContent({
                              sections: lesson.content.sections.map((s, i) =>
                                i === si ? { ...s, body: e.target.value.split("\n") } : s
                              ),
                            })
                          }
                        />
                      </Field>
                      <Field label="Kod (ixtiyoriy)" hint="Har buyruq — alohida qator">
                        <TextInput
                          value={section.code?.caption ?? ""}
                          placeholder="Kod sarlavhasi"
                          onChange={(e) =>
                            patchContent({
                              sections: lesson.content.sections.map((s, i) =>
                                i === si
                                  ? {
                                      ...s,
                                      code: {
                                        caption: e.target.value,
                                        lines: s.code?.lines ?? [],
                                      },
                                    }
                                  : s
                              ),
                            })
                          }
                        />
                      </Field>
                      <TextArea
                        rows={3}
                        value={(section.code?.lines ?? []).join("\n")}
                        placeholder="oldinga(100)"
                        onChange={(e) =>
                          patchContent({
                            sections: lesson.content.sections.map((s, i) =>
                              i === si
                                ? {
                                    ...s,
                                    code: {
                                      caption: s.code?.caption,
                                      lines: e.target.value.split("\n"),
                                    },
                                  }
                                : s
                            ),
                          })
                        }
                        style={{ fontFamily: "var(--font-mono)" }}
                      />
                      <Field label="Xulosa (ixtiyoriy)">
                        <TextInput
                          value={section.callout ?? ""}
                          placeholder="Eng muhim fikr bir gapda"
                          onChange={(e) =>
                            patchContent({
                              sections: lesson.content.sections.map((s, i) =>
                                i === si ? { ...s, callout: e.target.value } : s
                              ),
                            })
                          }
                        />
                      </Field>
                    </SubCard>
                  ))}
                </div>

                {/* Terms */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                      Kalit so&apos;zlar
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        patchContent({
                          terms: [...lesson.content.terms, { en: "", uz: "", note: "" }],
                        })
                      }
                      className="inline-flex items-center gap-1 text-[12px] font-bold text-[#26B54F] hover:underline cursor-pointer"
                    >
                      <IconPlus size={12} /> Atama
                    </button>
                  </div>

                  {lesson.content.terms.map((term, ti) => (
                    <SubCard
                      key={ti}
                      title={`${ti + 1}-atama`}
                      onRemove={() =>
                        patchContent({
                          terms: lesson.content.terms.filter((_, i) => i !== ti),
                        })
                      }
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <TextInput
                          value={term.en}
                          placeholder="loop"
                          onChange={(e) =>
                            patchContent({
                              terms: lesson.content.terms.map((t, i) =>
                                i === ti ? { ...t, en: e.target.value } : t
                              ),
                            })
                          }
                        />
                        <TextInput
                          value={term.uz}
                          placeholder="sikl"
                          onChange={(e) =>
                            patchContent({
                              terms: lesson.content.terms.map((t, i) =>
                                i === ti ? { ...t, uz: e.target.value } : t
                              ),
                            })
                          }
                        />
                      </div>
                      <TextInput
                        value={term.note}
                        placeholder="Qisqa izoh"
                        onChange={(e) =>
                          patchContent({
                            terms: lesson.content.terms.map((t, i) =>
                              i === ti ? { ...t, note: e.target.value } : t
                            ),
                          })
                        }
                      />
                    </SubCard>
                  ))}
                </div>

                {/* Quiz */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                      Savollar
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        patchContent({
                          quiz: [
                            ...lesson.content.quiz,
                            {
                              question: "",
                              options: ["", "", ""],
                              correctIndex: 0,
                              explanation: "",
                            },
                          ],
                        })
                      }
                      className="inline-flex items-center gap-1 text-[12px] font-bold text-[#26B54F] hover:underline cursor-pointer"
                    >
                      <IconPlus size={12} /> Savol
                    </button>
                  </div>

                  {lesson.content.quiz.map((question, qi) => (
                    <SubCard
                      key={qi}
                      title={`${qi + 1}-savol`}
                      onRemove={() =>
                        patchContent({
                          quiz: lesson.content.quiz.filter((_, i) => i !== qi),
                        })
                      }
                    >
                      <TextArea
                        rows={2}
                        value={question.question}
                        placeholder="Savol matni"
                        onChange={(e) =>
                          patchContent({
                            quiz: lesson.content.quiz.map((q, i) =>
                              i === qi ? { ...q, question: e.target.value } : q
                            ),
                          })
                        }
                      />

                      <Field
                        label="Variantlar"
                        hint="Har variant — alohida qator. To'g'ri javobni pastda tanlang."
                      >
                        <TextArea
                          rows={3}
                          value={question.options.join("\n")}
                          onChange={(e) =>
                            patchContent({
                              quiz: lesson.content.quiz.map((q, i) =>
                                i === qi
                                  ? { ...q, options: e.target.value.split("\n") }
                                  : q
                              ),
                            })
                          }
                        />
                      </Field>

                      <Field label="To'g'ri javob">
                        <div className="relative">
                          <select
                            value={question.correctIndex}
                            onChange={(e) =>
                              patchContent({
                                quiz: lesson.content.quiz.map((q, i) =>
                                  i === qi
                                    ? { ...q, correctIndex: Number(e.target.value) }
                                    : q
                                ),
                              })
                            }
                            className={inputClass}
                          >
                            {question.options.map((opt, oi) => (
                              <option key={oi} value={oi}>
                                {oi + 1}. {opt.slice(0, 40) || "(bo'sh)"}
                              </option>
                            ))}
                          </select>
                          <IconChevronDown
                            size={15}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                          />
                        </div>
                      </Field>

                      <Field label="Izoh" hint="Nega bu javob to'g'ri">
                        <TextArea
                          rows={2}
                          value={question.explanation}
                          onChange={(e) =>
                            patchContent({
                              quiz: lesson.content.quiz.map((q, i) =>
                                i === qi ? { ...q, explanation: e.target.value } : q
                              ),
                            })
                          }
                        />
                      </Field>
                    </SubCard>
                  ))}
                </div>
              </section>
            )}

            {/* Issues */}
            {issues.length > 0 && (
              <section className="rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-4 sm:p-5">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-3">
                  Tekshiruv
                </h2>
                <ul className="flex flex-col gap-1.5">
                  {issues.map((issue, i) => (
                    <li
                      key={i}
                      className={`text-[12.5px] leading-relaxed flex items-start gap-2 ${
                        issue.level === "error"
                          ? "text-red-600 dark:text-red-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      <IconAlertTriangle size={13} className="shrink-0 mt-0.5" />
                      {issue.message}
                    </li>
                  ))}
                </ul>
              </section>
            )}

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
            className={`lg:sticky lg:top-[152px] ${
              mobilePane === "preview" ? "" : "hidden lg:block"
            }`}
          >
            <div className="rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100 dark:border-[#27272a] flex items-center gap-2">
                <IconEye size={14} className="text-gray-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Jonli ko&apos;rinish
                </span>
              </div>

              {/* Keyed so edits restart the preview from the first step */}
              <div className="h-[calc(100vh-260px)] min-h-[520px] overflow-y-auto">
                {lesson && lesson.content.sections.length > 0 ? (
                  <LessonRunner
                    key={`${lesson.id}-${lesson.content.sections.length}-${lesson.content.quiz.length}`}
                    embedded
                    lessonId={lesson.id || "preview"}
                    lessonTitle={lesson.title || "(nomsiz dars)"}
                    levelTitle={`Level ${level?.num ?? 1} - ${level?.title || ""}`}
                    content={lesson.content}
                    game={getGame(lesson.gameId)}
                    xpReward={lesson.xp}
                    exitHref="#"
                    nextHref="#"
                    nextLabel="Keyingi dars"
                    onFinished={() => {}}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center p-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                      Dars tanlang va matn yozishni boshlang — ko&apos;rinishi shu
                      yerda paydo bo&apos;ladi.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
