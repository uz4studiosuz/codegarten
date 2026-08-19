"use client";

import React from "react";
import { IconInfoCircle, IconPlus, IconWand, IconX } from "@tabler/icons-react";
import { ALL_TOPICS, TOPIC_LABELS, type GameTopic } from "@/games/topics";
import { listGames } from "@/games/registry";
import { resolveGame } from "@/games/resolve";
import {
  DraftIssue,
  DraftLesson,
  DraftModule,
  DraftTrack,
  KIND_HINTS,
  KIND_LABELS,
  LessonKind,
  MINUTES_BY_KIND,
  XP_BY_KIND,
  idsAreStale,
  issuesFor,
} from "@/lib/writerDraft";
import type { LessonContent } from "@/types/lessonContent";
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
      <Section title="Modul" badge={moduleIssues.length ? (moduleIssues.some((i) => i.level === "error") ? "error" : "warning") : undefined}>
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

        <div className="grid grid-cols-2 gap-3">
          <Field label="Rasm yo'li" hint="public/ ichidagi fayl">
            <TextInput
              value={draft.imageSrc}
              onChange={(e) => actions.patchModule({ imageSrc: e.target.value })}
            />
          </Field>
          <Field label="Asosiy rang">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(draft.accent) ? draft.accent : "#22C55E"}
                onChange={(e) => actions.patchModule({ accent: e.target.value })}
                className="w-10 h-10 rounded-[10px] border-2 border-gray-200 dark:border-[#27272a] bg-transparent cursor-pointer"
                aria-label="Asosiy rang"
              />
              <TextInput
                value={draft.accent}
                onChange={(e) => actions.patchModule({ accent: e.target.value })}
              />
            </div>
          </Field>
        </div>
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
                    ? "border-[#26B54F] bg-[#26B54F]/12 text-[#1a8a3c] dark:text-[#4ADE80]"
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
        badge={trackIssues.length ? (trackIssues.some((i) => i.level === "error") ? "error" : "warning") : undefined}
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
        badge={levelIssues.length ? (levelIssues.some((i) => i.level === "error") ? "error" : "warning") : undefined}
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

  const patch = (p: Partial<DraftLesson>) => actions.patchLesson(levelIndex, lessonIndex, p);
  const patchContent = (p: Partial<LessonContent>) =>
    actions.patchContent(levelIndex, lessonIndex, p);

  /** What the app would actually run if no game is pinned. */
  const autoGame = resolveGame({
    kind: lesson.kind,
    lessonTitle: lesson.title,
    levelTitle: level.title,
    moduleTopics: draft.topics,
    seed: lesson.id,
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
            lesson.kind === "concept" || lesson.kind === "review"
              ? "Bu turdagi darsda o'yin ishlatilmaydi"
              : "Bo'sh qoldirilsa, mavzuga qarab avtomatik tanlanadi"
          }
        >
          <Select
            value={lesson.gameId}
            onChange={(e) => patch({ gameId: e.target.value })}
            disabled={lesson.kind === "concept" || lesson.kind === "review"}
          >
            <option value="">— avtomatik (mavzuga qarab) —</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </Field>

        {(lesson.kind === "exercise" || lesson.kind === "challenge") && (
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

      {/* ── Goal & sections ── */}
      <Section
        title="Matn"
        count={content.sections.length}
        badge={badgeFor(lessonIssues, (m) => /maqsad|bo'lim/.test(m))}
        action={
          <AddButton
            label="Bo'lim"
            onClick={() =>
              patchContent({
                sections: [...content.sections, { heading: "", body: [""] }],
              })
            }
          />
        }
      >
        <Field label="Maqsad" hint="O'quvchi nimani o'rganadi — bir gap">
          <TextArea
            rows={2}
            value={content.goal}
            onChange={(e) => patchContent({ goal: e.target.value })}
          />
        </Field>

        {content.sections.map((section, si) => (
          <SubCard
            key={si}
            title={`${si + 1}-bo'lim`}
            onRemove={
              content.sections.length > 1
                ? () =>
                    patchContent({
                      sections: content.sections.filter((_, i) => i !== si),
                    })
                : undefined
            }
          >
            <Field label="Sarlavha">
              <TextInput
                value={section.heading}
                placeholder="Sikl nima uchun kerak"
                onChange={(e) =>
                  patchContent({
                    sections: content.sections.map((s, i) =>
                      i === si ? { ...s, heading: e.target.value } : s
                    ),
                  })
                }
              />
            </Field>

            <Field label="Matn" hint="Har xatboshi — alohida qator">
              <TextArea
                rows={4}
                value={section.body.join("\n")}
                onChange={(e) =>
                  patchContent({
                    sections: content.sections.map((s, i) =>
                      i === si ? { ...s, body: e.target.value.split("\n") } : s
                    ),
                  })
                }
              />
            </Field>

            <Field label="Kod sarlavhasi (ixtiyoriy)">
              <TextInput
                value={section.code?.caption ?? ""}
                placeholder="oldinga.uz"
                onChange={(e) =>
                  patchContent({
                    sections: content.sections.map((s, i) =>
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

            <Field label="Kod (ixtiyoriy)" hint="Har buyruq — alohida qator">
              <TextArea
                rows={3}
                value={(section.code?.lines ?? []).join("\n")}
                placeholder="oldinga(100)"
                onChange={(e) =>
                  patchContent({
                    sections: content.sections.map((s, i) =>
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
            </Field>

            <Field label="Xulosa (ixtiyoriy)" hint="Eng muhim fikr bir gapda">
              <TextInput
                value={section.callout ?? ""}
                onChange={(e) =>
                  patchContent({
                    sections: content.sections.map((s, i) =>
                      i === si ? { ...s, callout: e.target.value } : s
                    ),
                  })
                }
              />
            </Field>
          </SubCard>
        ))}
      </Section>

      {/* ── Key terms ── */}
      <Section
        title="Kalit so'zlar"
        count={content.terms.length}
        defaultOpen={false}
        badge={badgeFor(lessonIssues, (m) => /atama|kalit/.test(m))}
        action={
          <AddButton
            label="Atama"
            onClick={() =>
              patchContent({ terms: [...content.terms, { en: "", uz: "", note: "" }] })
            }
          />
        }
      >
        {content.terms.length === 0 && (
          <p className="text-[12px] text-gray-500 dark:text-zinc-400">
            Atamalar o&apos;quvchining Lug&apos;atiga saqlanadi — har darsda 1-3 ta atama
            qo&apos;shish tavsiya etiladi.
          </p>
        )}

        {content.terms.map((term, ti) => (
          <SubCard
            key={ti}
            title={`${ti + 1}-atama`}
            onRemove={() =>
              patchContent({ terms: content.terms.filter((_, i) => i !== ti) })
            }
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Inglizcha">
                <TextInput
                  value={term.en}
                  placeholder="loop"
                  onChange={(e) =>
                    patchContent({
                      terms: content.terms.map((t, i) =>
                        i === ti ? { ...t, en: e.target.value } : t
                      ),
                    })
                  }
                />
              </Field>
              <Field label="O'zbekcha">
                <TextInput
                  value={term.uz}
                  placeholder="sikl"
                  onChange={(e) =>
                    patchContent({
                      terms: content.terms.map((t, i) =>
                        i === ti ? { ...t, uz: e.target.value } : t
                      ),
                    })
                  }
                />
              </Field>
            </div>
            <Field label="Qisqa izoh">
              <TextInput
                value={term.note}
                onChange={(e) =>
                  patchContent({
                    terms: content.terms.map((t, i) =>
                      i === ti ? { ...t, note: e.target.value } : t
                    ),
                  })
                }
              />
            </Field>
          </SubCard>
        ))}
      </Section>

      {/* ── Quiz ── */}
      <Section
        title="Savollar"
        count={content.quiz.length}
        defaultOpen={false}
        badge={badgeFor(lessonIssues, (m) => /savol|variant|javob/.test(m))}
        action={
          <AddButton
            label="Savol"
            onClick={() =>
              patchContent({
                quiz: [
                  ...content.quiz,
                  {
                    question: "",
                    options: ["", "", ""],
                    correctIndex: 0,
                    explanation: "",
                  },
                ],
              })
            }
          />
        }
      >
        {content.quiz.length === 0 && (
          <p className="text-[12px] text-gray-500 dark:text-zinc-400">
            Har darsda kamida bitta savol bo&apos;lishi shart.
          </p>
        )}

        {content.quiz.map((question, qi) => (
          <SubCard
            key={qi}
            title={`${qi + 1}-savol`}
            onRemove={() =>
              patchContent({ quiz: content.quiz.filter((_, i) => i !== qi) })
            }
          >
            <Field label="Savol matni">
              <TextArea
                rows={2}
                value={question.question}
                onChange={(e) =>
                  patchContent({
                    quiz: content.quiz.map((q, i) =>
                      i === qi ? { ...q, question: e.target.value } : q
                    ),
                  })
                }
              />
            </Field>

            <Field label="Variantlar" hint="To'g'ri javobni yonidagi doiracha bilan belgilang">
              <div className="flex flex-col gap-2">
                {question.options.map((option, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        patchContent({
                          quiz: content.quiz.map((q, i) =>
                            i === qi ? { ...q, correctIndex: oi } : q
                          ),
                        })
                      }
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
                        patchContent({
                          quiz: content.quiz.map((q, i) =>
                            i === qi
                              ? {
                                  ...q,
                                  options: q.options.map((o, k) =>
                                    k === oi ? e.target.value : o
                                  ),
                                }
                              : q
                          ),
                        })
                      }
                    />

                    <button
                      type="button"
                      disabled={question.options.length <= 2}
                      onClick={() =>
                        patchContent({
                          quiz: content.quiz.map((q, i) => {
                            if (i !== qi) return q;
                            const options = q.options.filter((_, k) => k !== oi);
                            // Keep the marked answer on the same option it was on.
                            const correctIndex =
                              q.correctIndex === oi
                                ? 0
                                : q.correctIndex > oi
                                ? q.correctIndex - 1
                                : q.correctIndex;
                            return { ...q, options, correctIndex };
                          }),
                        })
                      }
                      aria-label="Variantni o'chirish"
                      className="shrink-0 p-1 rounded-full text-gray-300 dark:text-zinc-600 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <IconX size={14} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    patchContent({
                      quiz: content.quiz.map((q, i) =>
                        i === qi ? { ...q, options: [...q.options, ""] } : q
                      ),
                    })
                  }
                  className="self-start inline-flex items-center gap-1 text-[12px] font-bold text-[#26B54F] hover:underline cursor-pointer"
                >
                  <IconPlus size={12} /> Variant
                </button>
              </div>
            </Field>

            <Field label="Izoh" hint="Nega bu javob to'g'ri">
              <TextArea
                rows={2}
                value={question.explanation}
                onChange={(e) =>
                  patchContent({
                    quiz: content.quiz.map((q, i) =>
                      i === qi ? { ...q, explanation: e.target.value } : q
                    ),
                  })
                }
              />
            </Field>
          </SubCard>
        ))}
      </Section>
    </div>
  );
}
