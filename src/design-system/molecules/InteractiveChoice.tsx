import React from "react";
import { Check, X, Circle } from "lucide-react";

export interface InteractiveChoiceProps {
  id: string;
  label: string;
  isSelected: boolean;
  isCorrect?: boolean | null;
  isDisabled?: boolean;
  onSelect: (id: string) => void;
  indexKey?: string;
}

export const InteractiveChoice: React.FC<InteractiveChoiceProps> = ({
  id,
  label,
  isSelected,
  isCorrect = null,
  isDisabled = false,
  onSelect,
  indexKey,
}) => {
  let stateClasses = "bg-white border-[#e5e7eb] text-[#121212] hover:border-[#9ca3af] hover:bg-[#f9fafb]";

  if (isCorrect === true) {
    stateClasses = "bg-[#e6f4ea] border-[#00872e] text-[#00872e] ring-1 ring-[#00872e]";
  } else if (isCorrect === false && isSelected) {
    stateClasses = "bg-[#fef2f2] border-[#dc2626] text-[#dc2626] ring-1 ring-[#dc2626]";
  } else if (isSelected) {
    stateClasses = "bg-[#f0fdf4] border-[#00872e] text-[#121212] ring-1 ring-[#00872e]";
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onSelect(id)}
      className={`
        w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl border
        text-left font-medium transition-all duration-150 cursor-pointer
        disabled:cursor-default active:scale-[0.99]
        ${stateClasses}
      `}
    >
      <div className="flex items-center gap-3 pr-2">
        {indexKey && (
          <span
            className={`
              flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-xs font-bold shrink-0
              ${
                isCorrect === true
                  ? "bg-[#00872e] text-white"
                  : isCorrect === false && isSelected
                  ? "bg-[#dc2626] text-white"
                  : isSelected
                  ? "bg-[#00872e] text-white"
                  : "bg-[#f3f4f6] text-[#4b5563] border border-[#e5e7eb]"
              }
            `}
          >
            {indexKey}
          </span>
        )}
        <span className="text-xs sm:text-sm font-medium leading-snug">{label}</span>
      </div>

      <div className="shrink-0 pl-2">
        {isCorrect === true ? (
          <div className="w-5 h-5 rounded-full bg-[#00872e] text-white flex items-center justify-center">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        ) : isCorrect === false && isSelected ? (
          <div className="w-5 h-5 rounded-full bg-[#dc2626] text-white flex items-center justify-center">
            <X className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        ) : isSelected ? (
          <div className="w-5 h-5 rounded-full bg-[#00872e] text-white flex items-center justify-center">
            <Circle className="w-2 h-2 fill-current" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border border-[#d1d5db] bg-white" />
        )}
      </div>
    </button>
  );
};
