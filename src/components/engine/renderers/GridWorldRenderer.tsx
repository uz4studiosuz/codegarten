"use client";

import React from "react";
import { ExerciseRendererProps } from "../types";
import { IconSparkles } from "@tabler/icons-react";

export interface GridWorldState {
  gridSize: number; // e.g. 5 for 5x5
  robotPos: { x: number; y: number };
  robotDirection: "up" | "right" | "down" | "left";
  targetPos: { x: number; y: number };
  coinsCollected: number;
}

export const GridWorldRenderer: React.FC<ExerciseRendererProps<GridWorldState>> = ({
  state,
}) => {
  const { gridSize = 4, robotPos, robotDirection, targetPos } = state;
  const cells = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const isRobot = robotPos.x === x && robotPos.y === y;
      const isTarget = targetPos.x === x && targetPos.y === y;

      cells.push(
        <div
          key={`${x}-${y}`}
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-[10px] bg-gray-100 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/60 flex items-center justify-center transition-all"
        >
          {/* Target Star / Coin */}
          {isTarget && (
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-400 flex items-center justify-center text-amber-500 animate-pulse shadow-xs">
              <IconSparkles size={18} />
            </div>
          )}

          {/* Robot / Mascot Character */}
          {isRobot && (
            <div
              className={`w-9 h-9 rounded-[8px] bg-gradient-to-tr from-[#15803d] to-[#22C55E] border-2 border-white dark:border-[#86efac] shadow-md flex items-center justify-center transition-all duration-300 ${
                robotDirection === "right"
                  ? "rotate-90"
                  : robotDirection === "down"
                  ? "rotate-180"
                  : robotDirection === "left"
                  ? "-rotate-90"
                  : "rotate-0"
              }`}
            >
              <div className="w-3.5 h-3.5 bg-black rounded-[2px]" />
            </div>
          )}
        </div>
      );
    }
  }

  return (
    <div className="w-full h-[230px] bg-white dark:bg-[#18181B] rounded-[14px] flex items-center justify-center p-3 transition-colors">
      <div
        className="grid gap-2 select-none"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {cells}
      </div>
    </div>
  );
};
