"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "codegarten_vocab_v1";

export interface VocabEntry {
  /** Slug of the English term — also the dedupe key. */
  id: string;
  en: string;
  uz: string;
  note?: string;
  /** Lesson the term was saved from; absent for hand-added entries. */
  sourceLessonId?: string;
  sourceLessonTitle?: string;
  addedAt: string;
  /** True when the learner typed it in themselves. */
  custom: boolean;
}

export function termId(en: string): string {
  return en.trim().toLowerCase().replace(/\s+/g, "-");
}

interface VocabularyContextValue {
  hydrated: boolean;
  /** Newest first. */
  terms: VocabEntry[];
  count: number;
  isSaved: (en: string) => boolean;
  saveTerm: (entry: Omit<VocabEntry, "id" | "addedAt" | "custom">) => void;
  addCustomTerm: (en: string, uz: string, note?: string) => void;
  removeTerm: (id: string) => void;
  /** Save if missing, remove if present — for the in-lesson toggle. */
  toggleTerm: (entry: Omit<VocabEntry, "id" | "addedAt" | "custom">) => void;
  clearAll: () => void;
}

const VocabularyContext = createContext<VocabularyContextValue | undefined>(undefined);

export const VocabularyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [terms, setTerms] = useState<VocabEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  /** Guards writes until storage has been read, so nothing clobbers saved terms. */
  const hydratedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setTerms(parsed as VocabEntry[]);
      }
    } catch {
      // Corrupt storage — start with an empty list rather than crash.
    }
    hydratedRef.current = true;
    setHydrated(true);
  }, []);

  const commit = useCallback((next: VocabEntry[]) => {
    if (!hydratedRef.current) return;
    setTerms(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable; the list stays in memory for this session.
    }
  }, []);

  const savedIds = useMemo(() => new Set(terms.map((t) => t.id)), [terms]);

  const isSaved = useCallback((en: string) => savedIds.has(termId(en)), [savedIds]);

  const saveTerm = useCallback(
    (entry: Omit<VocabEntry, "id" | "addedAt" | "custom">) => {
      const id = termId(entry.en);
      if (savedIds.has(id)) return;
      commit([
        { ...entry, id, addedAt: new Date().toISOString(), custom: false },
        ...terms,
      ]);
    },
    [commit, savedIds, terms]
  );

  const addCustomTerm = useCallback(
    (en: string, uz: string, note?: string) => {
      const trimmed = en.trim();
      if (!trimmed) return;
      const id = termId(trimmed);
      // Re-adding an existing term updates it rather than creating a duplicate.
      const rest = terms.filter((t) => t.id !== id);
      commit([
        {
          id,
          en: trimmed,
          uz: uz.trim(),
          note: note?.trim() || undefined,
          addedAt: new Date().toISOString(),
          custom: true,
        },
        ...rest,
      ]);
    },
    [commit, terms]
  );

  const removeTerm = useCallback(
    (id: string) => commit(terms.filter((t) => t.id !== id)),
    [commit, terms]
  );

  const toggleTerm = useCallback(
    (entry: Omit<VocabEntry, "id" | "addedAt" | "custom">) => {
      const id = termId(entry.en);
      if (savedIds.has(id)) removeTerm(id);
      else saveTerm(entry);
    },
    [savedIds, removeTerm, saveTerm]
  );

  const clearAll = useCallback(() => commit([]), [commit]);

  const value = useMemo<VocabularyContextValue>(
    () => ({
      hydrated,
      terms,
      count: terms.length,
      isSaved,
      saveTerm,
      addCustomTerm,
      removeTerm,
      toggleTerm,
      clearAll,
    }),
    [hydrated, terms, isSaved, saveTerm, addCustomTerm, removeTerm, toggleTerm, clearAll]
  );

  return (
    <VocabularyContext.Provider value={value}>{children}</VocabularyContext.Provider>
  );
};

export const useVocabulary = (): VocabularyContextValue => {
  const ctx = useContext(VocabularyContext);
  if (!ctx) throw new Error("useVocabulary must be used within a VocabularyProvider");
  return ctx;
};
