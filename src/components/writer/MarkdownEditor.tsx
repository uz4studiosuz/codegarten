"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  IconBold,
  IconCode,
  IconEye,
  IconH1,
  IconH2,
  IconH3,
  IconHighlight,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconPencil,
  IconQuote,
  IconStrikethrough,
} from "@tabler/icons-react";
import { renderMarkdown } from "@/lib/markdown";
import { inputClass } from "./fields";

/**
 * Writing a lesson's formatted prose
 * ==================================
 * This replaces a `contenteditable` editor driven by `document.execCommand`.
 * That approach put the browser in charge of the document: the caret jumped on
 * every re-render, pasted text arrived wrapped in whatever tags its source used,
 * and the same keystrokes produced different HTML in different browsers.
 *
 * What an author edits here is a plain textarea holding plain markup, so the
 * caret is the browser's own and paste is just text. The toolbar does one thing
 * — wrap or prefix the current selection — and the preview renders through
 * src/lib/markdown.ts, the same function the lesson itself uses, so what the
 * writer shows and what a learner reads cannot drift apart.
 */

interface Props {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

/** How each toolbar button changes the selection. */
type Action =
  /** Puts `mark` on both sides of the selection, or removes it if already there. */
  | { type: "wrap"; mark: string }
  /** Puts `prefix` at the start of every selected line, or removes it. */
  | { type: "prefix"; prefix: string }
  /** Numbers the selected lines. */
  | { type: "ordered" }
  | { type: "link" };

interface Tool {
  label: string;
  hint: string;
  Icon: typeof IconBold;
  action: Action;
  /** Ctrl/Cmd shortcut, lowercase. */
  key?: string;
}

const TOOLS: Tool[][] = [
  [
    { label: "Qalin", hint: "**qalin**", Icon: IconBold, action: { type: "wrap", mark: "**" }, key: "b" },
    { label: "Kursiv", hint: "*kursiv*", Icon: IconItalic, action: { type: "wrap", mark: "*" }, key: "i" },
    {
      label: "Chizilgan",
      hint: "~~chizilgan~~",
      Icon: IconStrikethrough,
      action: { type: "wrap", mark: "~~" },
    },
    {
      label: "Ajratilgan",
      hint: "==ajratilgan==",
      Icon: IconHighlight,
      action: { type: "wrap", mark: "==" },
    },
    { label: "Kod", hint: "`kod`", Icon: IconCode, action: { type: "wrap", mark: "`" }, key: "e" },
  ],
  [
    { label: "Katta sarlavha", hint: "# sarlavha", Icon: IconH1, action: { type: "prefix", prefix: "# " } },
    { label: "O'rta sarlavha", hint: "## sarlavha", Icon: IconH2, action: { type: "prefix", prefix: "## " } },
    { label: "Kichik sarlavha", hint: "### sarlavha", Icon: IconH3, action: { type: "prefix", prefix: "### " } },
  ],
  [
    { label: "Ro'yxat", hint: "- band", Icon: IconList, action: { type: "prefix", prefix: "- " } },
    { label: "Raqamli ro'yxat", hint: "1. band", Icon: IconListNumbers, action: { type: "ordered" } },
    { label: "Iqtibos", hint: "> iqtibos", Icon: IconQuote, action: { type: "prefix", prefix: "> " } },
  ],
  [{ label: "Havola", hint: "[matn](https://...)", Icon: IconLink, action: { type: "link" }, key: "k" }],
];

export function MarkdownEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);
  const html = useMemo(() => renderMarkdown(value), [value]);

  /** Rewrites the selection and puts the caret back where the author expects. */
  const apply = (action: Action) => {
    const node = ref.current;
    if (!node) return;

    const start = node.selectionStart;
    const end = node.selectionEnd;
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);

    let replacement = selected;
    let caretStart = start;
    let caretEnd = end;

    if (action.type === "wrap") {
      const { mark } = action;
      const already = selected.startsWith(mark) && selected.endsWith(mark) && selected.length > mark.length * 2;
      if (already) {
        replacement = selected.slice(mark.length, -mark.length);
        caretEnd = start + replacement.length;
      } else {
        const body = selected || "matn";
        replacement = `${mark}${body}${mark}`;
        // With nothing selected the author is about to type, so the new caret
        // selects the placeholder rather than sitting after the closing mark.
        caretStart = start + mark.length;
        caretEnd = caretStart + body.length;
      }
    } else if (action.type === "prefix" || action.type === "ordered") {
      // Line prefixes work on whole lines, so the selection is grown outwards to
      // the line boundaries first — otherwise a mid-word caret would insert the
      // prefix mid-word.
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEndRaw = value.indexOf("\n", end);
      const lineEnd = lineEndRaw === -1 ? value.length : lineEndRaw;
      const block = value.slice(lineStart, lineEnd);
      const lines = block.split("\n");

      let next: string[];
      if (action.type === "ordered") {
        const numbered = lines.every((line) => /^\d+[.)]\s/.test(line));
        next = numbered
          ? lines.map((line) => line.replace(/^\d+[.)]\s+/, ""))
          : lines.map((line, index) => `${index + 1}. ${line.replace(/^\d+[.)]\s+/, "")}`);
      } else {
        const { prefix } = action;
        const on = lines.every((line) => line.startsWith(prefix));
        next = on
          ? lines.map((line) => line.slice(prefix.length))
          : lines.map((line) => `${prefix}${stripLinePrefix(line)}`);
      }

      const rewritten = next.join("\n");
      onChange(`${value.slice(0, lineStart)}${rewritten}${value.slice(lineEnd)}`);
      focusAt(node, lineStart, lineStart + rewritten.length);
      return;
    } else {
      const label = selected || "matn";
      replacement = `[${label}](https://)`;
      // Caret lands inside the URL, which is the part still missing.
      caretStart = start + label.length + 3 + 8;
      caretEnd = caretStart;
    }

    onChange(`${before}${replacement}${after}`);
    focusAt(node, caretStart, caretEnd);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!event.ctrlKey && !event.metaKey) return;
    const tool = TOOLS.flat().find((item) => item.key === event.key.toLowerCase());
    if (!tool) return;
    event.preventDefault();
    apply(tool.action);
  };

  return (
    <div className="flex flex-col rounded-[10px] border-2 border-gray-200 dark:border-[#27272a] overflow-hidden focus-within:border-[#26B54F] transition-colors">
      <div className="flex flex-wrap items-center gap-0.5 border-b-2 border-gray-100 dark:border-[#222226] px-1.5 py-1.5">
        {TOOLS.map((group, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="mx-1 h-4 w-px bg-gray-200 dark:bg-[#27272a]" />}
            {group.map((tool) => (
              <button
                key={tool.label}
                type="button"
                disabled={preview}
                onClick={() => apply(tool.action)}
                title={`${tool.label} — ${tool.hint}${tool.key ? `  (Ctrl+${tool.key.toUpperCase()})` : ""}`}
                aria-label={tool.label}
                className="rounded-[6px] p-1.5 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-[#232327] hover:text-[#26B54F] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <tool.Icon size={15} />
              </button>
            ))}
          </React.Fragment>
        ))}

        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          title={preview ? "Tahrirlashga qaytish" : "Natijani ko'rish"}
          className={`ml-auto inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[11.5px] font-bold transition-colors cursor-pointer ${
            preview
              ? "bg-[#26B54F]/15 text-[#177F37] dark:text-[#4ADE80]"
              : "text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-[#232327]"
          }`}
        >
          {preview ? <IconPencil size={13} /> : <IconEye size={13} />}
          {preview ? "Tahrirlash" : "Ko'rish"}
        </button>
      </div>

      {preview ? (
        <div className="px-3 py-2.5 min-h-[8rem]">
          {value.trim() === "" ? (
            <p className="text-sm text-gray-400 dark:text-zinc-600">Hali matn yozilmagan.</p>
          ) : (
            <MarkdownPreview html={html} />
          )}
        </div>
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={8}
          placeholder={placeholder ?? "Matnni yozing. **qalin**, *kursiv*, `kod`, - ro'yxat, # sarlavha."}
          className={`${inputClass} rounded-none border-0 focus:border-0 resize-y leading-relaxed`}
        />
      )}

      <p className="border-t-2 border-gray-100 dark:border-[#222226] px-3 py-1.5 text-[11px] text-gray-400 dark:text-zinc-500">
        <strong className="font-bold">**qalin**</strong> · <em>*kursiv*</em> ·{" "}
        <code className="font-mono">`kod`</code> · # sarlavha · - ro&apos;yxat · &gt; iqtibos ·
        [matn](havola)
      </p>
    </div>
  );
}

/**
 * The rendered result. The classes mirror what LessonRunner puts around the same
 * HTML, so the preview is not a rough approximation of the lesson but the thing
 * itself at a smaller size.
 */
export function MarkdownPreview({ html }: { html: string }) {
  return (
    <div
      className="text-[14px] leading-[1.7] text-gray-700 dark:text-[#c9c9d0] space-y-2.5 [&_h1]:text-[19px] [&_h1]:font-extrabold [&_h1]:text-gray-900 [&_h1]:dark:text-white [&_h2]:text-[16.5px] [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:dark:text-white [&_h3]:text-[15px] [&_h3]:font-bold [&_h3]:text-gray-800 [&_h3]:dark:text-zinc-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_blockquote]:border-l-4 [&_blockquote]:border-[#26B54F] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:dark:text-zinc-300 [&_code]:font-mono [&_code]:text-[12.5px] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-[5px] [&_code]:bg-gray-100 [&_code]:dark:bg-[#232328] [&_code]:text-[#7C5CE0] [&_code]:dark:text-[#A78BFA] [&_a]:text-[#26B54F] [&_a]:underline [&_mark]:bg-amber-500/20 [&_mark]:text-amber-900 [&_mark]:dark:text-amber-200 [&_mark]:px-1 [&_mark]:rounded [&_strong]:font-bold [&_strong]:text-gray-900 [&_strong]:dark:text-white"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Drops whichever line marker is already there, so prefixes do not stack. */
function stripLinePrefix(line: string): string {
  return line.replace(/^(#{1,3}\s+|-\s+|>\s?|\d+[.)]\s+)/, "");
}

/**
 * React has not written the new value to the DOM yet when this runs, so the
 * caret is set on the next frame — setting it now would be overwritten.
 */
function focusAt(node: HTMLTextAreaElement, start: number, end: number) {
  requestAnimationFrame(() => {
    node.focus();
    node.setSelectionRange(start, end);
  });
}
