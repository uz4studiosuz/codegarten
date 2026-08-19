"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  IconBookmarks,
  IconPlus,
  IconTrash,
  IconSearch,
  IconArrowRight,
} from "@tabler/icons-react";
import { AppNavbar } from "@/components/dashboard/AppNavbar";
import { useVocabulary } from "@/context/VocabularyContext";

export default function VocabularyPage() {
  const { terms, count, addCustomTerm, removeTerm, hydrated } = useVocabulary();

  const [query, setQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [en, setEn] = useState("");
  const [uz, setUz] = useState("");
  const [note, setNote] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter(
      (t) =>
        t.en.toLowerCase().includes(q) ||
        t.uz.toLowerCase().includes(q) ||
        (t.note ?? "").toLowerCase().includes(q)
    );
  }, [terms, query]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!en.trim()) return;
    addCustomTerm(en, uz, note);
    setEn("");
    setUz("");
    setNote("");
    setIsAdding(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#141414] text-black dark:text-white flex flex-col font-sans pb-[92px] sm:pb-0 transition-colors duration-200">
      <AppNavbar activeTab="vocabulary" />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight leading-tight">
              Lug&apos;at
            </h1>
            <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">
              Darslarda uchragan atamalarni saqlab, o&apos;zingiz ham qo&apos;shib
              boring.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAdding((v) => !v)}
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#26B54F] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1ea94f] transition-colors cursor-pointer"
          >
            <IconPlus size={16} stroke={2.5} />
            So&apos;z qo&apos;shish
          </button>
        </div>

        {/* ── Add form ── */}
        {isAdding && (
          <form
            onSubmit={handleAdd}
            className="mb-6 rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-5 flex flex-col gap-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Inglizcha atama
                </span>
                <input
                  value={en}
                  onChange={(e) => setEn(e.target.value)}
                  placeholder="recursion"
                  autoFocus
                  className="rounded-[10px] border-2 border-gray-200 dark:border-[#27272a] bg-transparent px-3 py-2.5 text-sm font-mono outline-none focus:border-[#26B54F] transition-colors"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  O&apos;zbekcha
                </span>
                <input
                  value={uz}
                  onChange={(e) => setUz(e.target.value)}
                  placeholder="rekursiya"
                  className="rounded-[10px] border-2 border-gray-200 dark:border-[#27272a] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#26B54F] transition-colors"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Izoh (ixtiyoriy)
              </span>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Funksiyaning o'zini chaqirishi"
                className="rounded-[10px] border-2 border-gray-200 dark:border-[#27272a] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#26B54F] transition-colors"
              />
            </label>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="submit"
                disabled={!en.trim()}
                className="rounded-full bg-[#26B54F] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1ea94f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Saqlash
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded-full border-2 border-gray-200 dark:border-[#27272a] px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-600 transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        )}

        {/* ── Search ── */}
        {count > 0 && (
          <div className="relative mb-5">
            <IconSearch
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`${count} ta atama ichidan qidirish...`}
              className="w-full rounded-[12px] border-2 border-gray-200 dark:border-[#27272a] bg-transparent pl-10 pr-4 py-3 text-sm outline-none focus:border-[#26B54F] transition-colors"
            />
          </div>
        )}

        {/* ── List ── */}
        {!hydrated ? (
          <div className="flex flex-col gap-2.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[76px] rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] animate-pulse"
              />
            ))}
          </div>
        ) : count === 0 ? (
          /* Empty state — explain where terms come from */
          <div className="rounded-[15px] border-2 border-dashed border-gray-200 dark:border-[#27272a] p-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#26B54F]/15 flex items-center justify-center mb-4">
              <IconBookmarks size={24} className="text-[#26B54F]" />
            </div>
            <p className="text-base font-bold">Lug&apos;at hozircha bo&apos;sh</p>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-zinc-400 leading-relaxed max-w-[420px] mx-auto">
              Dars ichidagi <span className="font-semibold">Kalit so&apos;zlar</span>{" "}
              bosqichida atama yonidagi belgini bossangiz, u shu yerga saqlanadi.
              Yoki yuqoridagi tugma bilan o&apos;zingiz qo&apos;shing.
            </p>
            <Link
              href="/courses"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#26B54F] hover:underline"
            >
              Darslarga o&apos;tish
              <IconArrowRight size={15} />
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500 dark:text-zinc-400">
            &quot;{query}&quot; bo&apos;yicha hech narsa topilmadi.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((term) => (
              <div
                key={term.id}
                className="group rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] px-4 py-3.5 flex items-start gap-3 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-mono text-[15px] font-bold text-[#7C3AED] dark:text-[#A78BFA]">
                      {term.en}
                    </span>
                    {term.uz && (
                      <span className="text-[15px] font-semibold">({term.uz})</span>
                    )}
                    {term.custom && (
                      <span className="rounded-full bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        o&apos;zim
                      </span>
                    )}
                  </div>

                  {term.note && (
                    <p className="mt-1 text-[13.5px] leading-relaxed text-gray-500 dark:text-zinc-400">
                      {term.note}
                    </p>
                  )}

                  {term.sourceLessonTitle && (
                    <p className="mt-1.5 text-[12px] text-gray-400 dark:text-zinc-500">
                      {term.sourceLessonTitle}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeTerm(term.id)}
                  title="O'chirish"
                  aria-label={`${term.en} atamasini o'chirish`}
                  className="shrink-0 p-1.5 rounded-full text-gray-300 dark:text-zinc-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
