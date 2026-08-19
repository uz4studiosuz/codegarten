"use client";

import React, { useState } from "react";
import { IconChevronDown, IconTrash } from "@tabler/icons-react";

/**
 * Writer form primitives. Kept in one place so every editor pane in the writer
 * looks and behaves identically — the old page grew three slightly different
 * label styles, which is what made long forms feel arbitrary.
 */

export const inputClass =
  "rounded-[10px] border-2 border-gray-200 dark:border-[#27272a] bg-transparent px-3 py-2 text-sm outline-none focus:border-[#26B54F] transition-colors w-full";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  /** Shown in place of the hint when this field is what's broken. */
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
        {label}
      </span>
      {children}
      {error ? (
        <span className="text-[11px] text-red-500">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-gray-400 dark:text-zinc-500">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`${inputClass} ${className}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea {...rest} className={`${inputClass} font-sans leading-relaxed ${className}`} />
  );
}

export function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={`${inputClass} appearance-none pr-9 cursor-pointer`}>
        {children}
      </select>
      <IconChevronDown
        size={15}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
      />
    </div>
  );
}

/** A removable block inside a form (one section, term or question). */
export function SubCard({
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

/**
 * Collapsible group. Lesson editing has four distinct jobs (meta, text, terms,
 * questions); showing all of them at once was the main reason the writer felt
 * overwhelming, so each one folds away.
 */
export function Section({
  title,
  count,
  badge,
  defaultOpen = true,
  action,
  children,
}: {
  title: string;
  /** Small "3" next to the title, so a folded group still says how full it is. */
  count?: number;
  /** Red/amber dot when this group holds the problem. */
  badge?: "error" | "warning";
  defaultOpen?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
        >
          <IconChevronDown
            size={15}
            className={`shrink-0 text-gray-400 transition-transform ${open ? "" : "-rotate-90"}`}
          />
          <span className="text-sm font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400 truncate">
            {title}
          </span>
          {count !== undefined && (
            <span className="shrink-0 rounded-full bg-gray-100 dark:bg-[#232327] px-2 py-0.5 text-[11px] font-mono font-bold text-gray-500 dark:text-zinc-400">
              {count}
            </span>
          )}
          {badge && (
            <span
              className={`shrink-0 w-2 h-2 rounded-full ${
                badge === "error" ? "bg-red-500" : "bg-amber-500"
              }`}
            />
          )}
        </button>
        {action}
      </div>
      {open && <div className="px-4 pb-4 flex flex-col gap-3.5">{children}</div>}
    </section>
  );
}

/** "+ Nimadir" link used as a Section action. */
export function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 inline-flex items-center gap-1 rounded-full border-2 border-[#26B54F]/40 px-2.5 py-1 text-[12px] font-bold text-[#26B54F] hover:bg-[#26B54F]/10 transition-colors cursor-pointer"
    >
      + {label}
    </button>
  );
}
