import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

export interface CodePreviewProps {
  code: string;
  language?: string;
  filename?: string;
  highlightLines?: number[];
  showLineNumbers?: boolean;
}

export const CodePreview: React.FC<CodePreviewProps> = ({
  code,
  language = "typescript",
  filename,
  highlightLines = [],
  showLineNumbers = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API fails
    }
  };

  const lines = code.trim().split("\n");

  return (
    <div className="rounded-xl overflow-hidden bg-[#0d0f14] border border-border-subtle shadow-deep font-mono text-xs sm:text-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#14171f] border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]/80" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]/80" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f]/80" />
          </div>
          {filename ? (
            <span className="text-xs text-text-secondary font-sans font-medium ml-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-brand-light" />
              {filename}
            </span>
          ) : (
            <span className="text-xs text-text-muted font-sans uppercase tracking-wider ml-2">
              {language}
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
          title="Kodni nusxalash"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-accent-green" />
              <span className="text-accent-green font-sans">Nusxalandi</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans">Nusxa</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div className="p-4 overflow-x-auto">
        <pre className="leading-relaxed">
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isHighlighted = highlightLines.includes(lineNum);

            return (
              <div
                key={idx}
                className={`table-row ${
                  isHighlighted ? "bg-brand/20 -mx-4 px-4 block rounded" : ""
                }`}
              >
                {showLineNumbers && (
                  <span className="table-cell pr-4 text-text-dim text-right select-none w-8">
                    {lineNum}
                  </span>
                )}
                <span className="table-cell text-[#e2e8f0]">
                  {line || " "}
                </span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
};
