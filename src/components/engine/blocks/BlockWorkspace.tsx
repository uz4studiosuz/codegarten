"use client";

import React from "react";
import { IconRotate2 } from "@tabler/icons-react";
import { InstructionBlock } from "../types";
import { InstructionBlockView } from "./InstructionBlockView";

interface BlockWorkspaceProps {
  ast: InstructionBlock[];
  onUpdateParam: (blockId: string, paramKey: string, value: string | number | boolean) => void;
  onReset: () => void;
}

export const BlockWorkspace: React.FC<BlockWorkspaceProps> = ({
  ast,
  onUpdateParam,
  onReset,
}) => {
  return (
    <div className="bg-gray-100 dark:bg-[#1b1b1f] border-t border-gray-200 dark:border-transparent px-5 pt-4 pb-3 transition-colors">
      <div className="space-y-2.5">
        {ast.map((block, idx) => (
          <InstructionBlockView
            key={block.id}
            block={block}
            lineNumber={idx + 1}
            onUpdateParam={onUpdateParam}
          />
        ))}
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 font-mono text-[13px] text-gray-400 dark:text-[#6f6f77] hover:text-gray-600 dark:hover:text-[#a1a1aa] transition-colors cursor-pointer"
        >
          <IconRotate2 size={14} stroke={2} />
          <span>Start over</span>
        </button>
      </div>
    </div>
  );
};
