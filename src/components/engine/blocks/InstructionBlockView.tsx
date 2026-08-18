"use client";

import React, { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { InstructionBlock } from "../types";

interface InstructionBlockViewProps {
  block: InstructionBlock;
  lineNumber: number;
  onUpdateParam: (blockId: string, paramKey: string, value: string | number | boolean) => void;
}

export const InstructionBlockView: React.FC<InstructionBlockViewProps> = ({
  block,
  lineNumber,
  onUpdateParam,
}) => {
  const [openParamKey, setOpenParamKey] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3 font-mono text-[15px] leading-none">
      {/* Gutter line number */}
      <span className="w-3 shrink-0 text-right text-[#5c5c64]">{lineNumber}</span>

      {/* Opcode chip */}
      <span className="rounded-[6px] bg-[#22C55E]/[0.16] px-2 py-[4px] font-bold text-[#4ADE80]">
        {block.label}
      </span>

      {Object.entries(block.params).map(([paramKey, param]) => {
        const options = param.options ?? [];

        // Fixed arguments read as plain code — only choices get a control.
        if (options.length === 0) {
          return (
            <span key={paramKey} className="text-[#d4d4d8]">
              {String(param.value)}
            </span>
          );
        }

        const isOpen = openParamKey === paramKey;

        return (
          <div key={paramKey} className="relative">
            <button
              type="button"
              onClick={() => setOpenParamKey(isOpen ? null : paramKey)}
              className="flex items-center gap-1.5 rounded-[8px] bg-[#2f2f36] hover:bg-[#3a3a42] px-2.5 py-[4px] font-bold text-[#A78BFA] transition-colors cursor-pointer"
            >
              <span>&quot;{String(param.value)}&quot;</span>
              <IconChevronDown size={14} stroke={2.2} className="text-[#8b8b93]" />
            </button>

            {isOpen && (
              <>
                {/* Click-away catcher */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenParamKey(null)}
                />
                <div className="absolute left-0 top-full mt-1.5 z-50 w-32 rounded-[10px] border border-[#3a3a42] bg-[#212127] py-1 shadow-2xl overflow-hidden">
                  {options.map((opt) => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => {
                        onUpdateParam(block.id, paramKey, opt.value);
                        setOpenParamKey(null);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left font-bold text-[#d4d4d8] hover:bg-[#2f2f36] transition-colors cursor-pointer"
                    >
                      {opt.colorHex && (
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: opt.colorHex }}
                        />
                      )}
                      <span>&quot;{opt.label}&quot;</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
