"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  IconBold,
  IconClearFormatting,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconHighlight,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconQuote,
  IconStrikethrough,
  IconUnderline,
  IconEye,
  IconCode as IconCodeTag,
} from "@tabler/icons-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Formatlangan matnni bu yerga yozing...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [isFocused, setIsFocused] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // Function to inspect current selection and update active toolbar buttons
  const updateActiveFormats = useCallback(() => {
    if (typeof window === "undefined" || !editorRef.current) return;
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) {
      setActiveFormats(new Set());
      return;
    }

    let node: Node | null = sel.anchorNode;
    if (node && node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode;
    }

    const formats = new Set<string>();

    try {
      if (document.queryCommandState("bold")) formats.add("bold");
      if (document.queryCommandState("italic")) formats.add("italic");
      if (document.queryCommandState("underline")) formats.add("underline");
      if (document.queryCommandState("strikeThrough")) formats.add("strikeThrough");
      if (document.queryCommandState("insertUnorderedList")) formats.add("ul");
      if (document.queryCommandState("insertOrderedList")) formats.add("ol");
    } catch {
      // Some browsers may throw on unsupported command states
    }

    // Traverse up to find semantic tags inside editor
    let curr = node;
    while (curr && curr !== editorRef.current && curr !== document.body) {
      const tag = curr.nodeName.toLowerCase();
      if (tag === "h1") formats.add("h1");
      if (tag === "h2") formats.add("h2");
      if (tag === "h3") formats.add("h3");
      if (tag === "blockquote") formats.add("blockquote");
      if (tag === "code" || tag === "pre") formats.add("code");
      if (tag === "mark") formats.add("mark");
      if (tag === "a") formats.add("link");
      curr = curr.parentNode;
    }

    setActiveFormats(formats);
  }, []);

  // Listen to selection changes across the document
  useEffect(() => {
    const handleSelectionChange = () => {
      if (isFocused) {
        updateActiveFormats();
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [isFocused, updateActiveFormats]);

  // Sync internal editor HTML when value prop changes from outside
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (!isFocused || editorRef.current.innerHTML === "" || editorRef.current.innerHTML === "<br>") {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, isFocused]);

  const emitChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      if (html === "<br>" || html === "<p><br></p>" || html === "<p></p>") {
        onChange("");
      } else {
        onChange(html);
      }
      updateActiveFormats();
    }
  };

  const exec = (command: string, arg?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    emitChange();
  };

  // Toggle heading or block format
  const toggleBlock = (tag: string, formatKey: string) => {
    if (activeFormats.has(formatKey)) {
      exec("formatBlock", "<p>");
    } else {
      exec("formatBlock", `<${tag}>`);
    }
  };

  // Toggle Highlight (unwrap <mark> or wrap selection with <mark>)
  const toggleHighlight = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    if (activeFormats.has("mark")) {
      // Find the parent mark tag and unwrap it
      let node: Node | null = sel.anchorNode;
      if (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode;

      while (node && node !== editorRef.current && node !== document.body) {
        if (node.nodeName.toLowerCase() === "mark") {
          const parent = node.parentNode;
          if (parent) {
            while (node.firstChild) {
              parent.insertBefore(node.firstChild, node);
            }
            parent.removeChild(node);
            emitChange();
            return;
          }
        }
        node = node.parentNode;
      }
      // Fallback
      exec("removeFormat");
    } else {
      if (!sel.isCollapsed) {
        const text = sel.toString();
        exec("insertHTML", `<mark>${text}</mark>`);
      } else {
        exec("insertHTML", `<mark>&#8203;</mark>`);
      }
    }
  };

  const handleLink = () => {
    const url = prompt("Havola manzilini kiriting (URL):", "https://");
    if (url && url !== "https://") {
      exec("createLink", url);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Shortcuts Ctrl+B, Ctrl+I, Ctrl+U
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        exec("bold");
        return;
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        exec("italic");
        return;
      } else if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        exec("underline");
        return;
      }
    }

    // Down Arrow Key: when at the bottom of content, create a new paragraph line
    if (e.key === "ArrowDown" && editorRef.current) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        const editor = editorRef.current;
        const isAtEnd =
          range.endOffset >= (range.endContainer.textContent?.length ?? 0) &&
          (editor.lastElementChild === range.endContainer ||
            editor.lastChild === range.endContainer ||
            range.endContainer.parentElement === editor.lastElementChild ||
            range.endContainer === editor);

        if (isAtEnd) {
          const p = document.createElement("p");
          p.innerHTML = "<br>";
          editor.appendChild(p);

          const newRange = document.createRange();
          newRange.setStart(p, 0);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);

          emitChange();
          e.preventDefault();
        }
      }
    }
  };

  const isEmpty =
    !value ||
    value.trim() === "" ||
    value === "<p></p>" ||
    value === "<br>" ||
    value === "<p><br></p>";

  const toolbarButtons = [
    {
      id: "bold",
      title: "Qalin (Ctrl+B)",
      icon: <IconBold size={15} stroke={2.5} />,
      isActive: activeFormats.has("bold"),
      action: () => exec("bold"),
    },
    {
      id: "italic",
      title: "Kursiv (Ctrl+I)",
      icon: <IconItalic size={15} stroke={2.5} />,
      isActive: activeFormats.has("italic"),
      action: () => exec("italic"),
    },
    {
      id: "underline",
      title: "Tagiga chizilgan (Ctrl+U)",
      icon: <IconUnderline size={15} stroke={2.5} />,
      isActive: activeFormats.has("underline"),
      action: () => exec("underline"),
    },
    {
      id: "strikeThrough",
      title: "Chizilgan",
      icon: <IconStrikethrough size={15} stroke={2.5} />,
      isActive: activeFormats.has("strikeThrough"),
      action: () => exec("strikeThrough"),
    },
    { type: "divider" as const },
    {
      id: "h1",
      title: "1-darajali sarlavha (Katta)",
      icon: <IconH1 size={16} stroke={2.5} />,
      isActive: activeFormats.has("h1"),
      action: () => toggleBlock("h1", "h1"),
    },
    {
      id: "h2",
      title: "2-darajali sarlavha (O'rtacha)",
      icon: <IconH2 size={16} stroke={2.5} />,
      isActive: activeFormats.has("h2"),
      action: () => toggleBlock("h2", "h2"),
    },
    {
      id: "h3",
      title: "3-darajali sarlavha (Kichik)",
      icon: <IconH3 size={16} stroke={2.5} />,
      isActive: activeFormats.has("h3"),
      action: () => toggleBlock("h3", "h3"),
    },
    { type: "divider" as const },
    {
      id: "ul",
      title: "Belgili ro'yxat",
      icon: <IconList size={15} stroke={2.5} />,
      isActive: activeFormats.has("ul"),
      action: () => exec("insertUnorderedList"),
    },
    {
      id: "ol",
      title: "Raqamli ro'yxat",
      icon: <IconListNumbers size={15} stroke={2.5} />,
      isActive: activeFormats.has("ol"),
      action: () => exec("insertOrderedList"),
    },
    {
      id: "blockquote",
      title: "Iqtibos (Quote)",
      icon: <IconQuote size={15} stroke={2.5} />,
      isActive: activeFormats.has("blockquote"),
      action: () => toggleBlock("blockquote", "blockquote"),
    },
    {
      id: "code",
      title: "Kod bloki / Inline kod",
      icon: <IconCode size={15} stroke={2.5} />,
      isActive: activeFormats.has("code"),
      action: () => {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed) {
          const text = sel.toString();
          exec("insertHTML", `<code>${text}</code>`);
        } else {
          toggleBlock("pre", "code");
        }
      },
    },
    {
      id: "mark",
      title: "Ajratib ko'rsatish (Highlight)",
      icon: <IconHighlight size={15} stroke={2.5} />,
      isActive: activeFormats.has("mark"),
      action: toggleHighlight,
    },
    {
      id: "link",
      title: "Havola qo'shish",
      icon: <IconLink size={15} stroke={2.5} />,
      isActive: activeFormats.has("link"),
      action: handleLink,
    },
    {
      id: "clear",
      title: "Formatni tozalash",
      icon: <IconClearFormatting size={15} stroke={2.5} />,
      isActive: false,
      action: () => {
        exec("removeFormat");
        exec("formatBlock", "<p>");
      },
    },
  ];

  return (
    <div className="rounded-[12px] border-2 border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#141416] overflow-hidden flex flex-col focus-within:border-[#26B54F] transition-all">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-1 px-2 py-1.5 bg-gray-50/90 dark:bg-[#1c1c20] border-b border-gray-200 dark:border-[#27272a] select-none">
        <div className="flex flex-wrap items-center gap-0.5">
          {toolbarButtons.map((btn, idx) => {
            if ("type" in btn && btn.type === "divider") {
              return (
                <div
                  key={idx}
                  className="w-px h-4 bg-gray-200 dark:bg-[#2e2e34] mx-1 shrink-0"
                />
              );
            }
            const isActive = "isActive" in btn && Boolean(btn.isActive);
            return (
              <button
                key={idx}
                type="button"
                title={btn.title}
                onMouseDown={(e) => {
                  // Keep focus in contentEditable
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  btn.action();
                }}
                className={`w-7 h-7 rounded-[6px] flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#26B54F]/20 text-[#177F37] dark:text-[#4ADE80] border border-[#26B54F]/40 font-bold shadow-2xs scale-105"
                    : "text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-gray-200/80 dark:hover:bg-[#28282e] active:scale-95"
                }`}
              >
                {btn.icon}
              </button>
            );
          })}
        </div>

        {/* Mode switcher */}
        <div className="flex items-center gap-1 ml-auto shrink-0 bg-gray-200/60 dark:bg-[#24242a] p-0.5 rounded-[7px]">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setMode("visual")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-bold transition-colors cursor-pointer ${
              mode === "visual"
                ? "bg-white dark:bg-[#121214] text-gray-900 dark:text-white shadow-2xs"
                : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <IconEye size={12} />
            Vizual
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setMode("html")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-bold transition-colors cursor-pointer ${
              mode === "html"
                ? "bg-white dark:bg-[#121214] text-gray-900 dark:text-white shadow-2xs"
                : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <IconCodeTag size={12} />
            HTML
          </button>
        </div>
      </div>

      {/* ── Editor Body ── */}
      {mode === "visual" ? (
        <div className="relative min-h-[140px] max-h-[420px] overflow-y-auto px-3.5 py-3 cursor-text bg-transparent">
          {/* Overlay Placeholder when empty */}
          {isEmpty && !isFocused && (
            <div className="absolute top-3 left-3.5 text-[14px] text-gray-400 dark:text-zinc-500 pointer-events-none select-none">
              {placeholder}
            </div>
          )}

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={emitChange}
            onFocus={() => {
              setIsFocused(true);
              updateActiveFormats();
            }}
            onBlur={() => {
              setIsFocused(false);
              emitChange();
            }}
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            onKeyDown={handleKeyDown}
            className="w-full min-h-[116px] text-[14.5px] leading-[1.7] text-gray-800 dark:text-zinc-200 outline-none cursor-text space-y-2 select-text [&_h1]:text-[20px] [&_h1]:font-extrabold [&_h1]:text-gray-900 [&_h1]:dark:text-white [&_h2]:text-[17px] [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:dark:text-white [&_h3]:text-[15.5px] [&_h3]:font-bold [&_h3]:text-gray-800 [&_h3]:dark:text-zinc-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-3 [&_blockquote]:border-[#26B54F] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:dark:text-zinc-300 [&_blockquote]:bg-[#26B54F]/[0.05] [&_blockquote]:py-1 [&_blockquote]:rounded-r [&_code]:font-mono [&_code]:text-[13px] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-[5px] [&_code]:bg-gray-100 [&_code]:dark:bg-[#232328] [&_code]:text-[#7C5CE0] [&_code]:dark:text-[#A78BFA] [&_a]:text-[#26B54F] [&_a]:underline [&_mark]:bg-amber-500/25 [&_mark]:text-amber-900 [&_mark]:dark:text-amber-200 [&_mark]:px-1 [&_mark]:rounded"
          />
        </div>
      ) : (
        <textarea
          rows={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<p>Formatlangan HTML...</p>"
          className="w-full min-h-[140px] px-3.5 py-3 font-mono text-[13px] leading-relaxed text-gray-800 dark:text-zinc-200 bg-transparent outline-none resize-y cursor-text"
        />
      )}
    </div>
  );
}
