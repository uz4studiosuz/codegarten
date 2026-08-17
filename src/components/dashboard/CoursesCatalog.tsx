"use client";

import React from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Lock,
  Layers,
  BarChart2,
  Cpu,
} from "lucide-react";
import {
  foundationalLearningPath,
  secondaryLearningPaths,
} from "@/data/mockCourseData";

interface CoursesCatalogProps {
  onSelectModule: (moduleId: string) => void;
}

export const CoursesCatalog: React.FC<CoursesCatalogProps> = ({
  onSelectModule,
}) => {
  const mainPath = foundationalLearningPath;
  const secondaryPaths = secondaryLearningPaths;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 font-sans transition-colors duration-200">
      {/* ========================================================= */}
      {/* HEADER SECTION: Title & Subtitle                          */}
      {/* ========================================================= */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#000000] dark:text-white tracking-tight">
          O&apos;quv Yo&apos;nalishlari
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Dasturlash va kompyuter fanlarini amaliy fikrlash orqali o&apos;rganing.
        </p>
      </div>

      {/* ========================================================= */}
      {/* 1. PRIMARY LEARNING PATH (Dasturiy Tafakkur & Algoritmlar) */}
      {/* ========================================================= */}
      <section className="mb-8">
        <div className="bg-white dark:bg-[#1b1c20] rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-6 shadow-xs transition-colors">
          {/* Path Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b-2 border-gray-100 dark:border-zinc-800">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-[15px] bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center shrink-0 p-2.5">
                <Layers className="w-full h-full object-contain" />
              </div>

              <div>
                <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-0.5 rounded-md">
                  {mainPath.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#000000] dark:text-white tracking-tight mt-1">
                  {mainPath.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                  {mainPath.description}
                </p>
              </div>
            </div>

            {/* Progress Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 self-start sm:self-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
              <span>{mainPath.overallProgressPercent}% bajarildi</span>
            </div>
          </div>

          {/* MODULE NODES GRID (6 Cards with Uploaded Images) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            {mainPath.modules.map((mod, idx) => {
              const isCompleted = mod.status === "completed";
              const isActive = mod.status === "active";
              const isLocked = mod.status === "locked";

              return (
                <div
                  key={mod.id}
                  onClick={() => !isLocked && onSelectModule(mod.id)}
                  className={`group relative bg-white dark:bg-[#222328] rounded-[15px] border-2 p-4 flex flex-col justify-between transition-all duration-150 ${
                    isCompleted
                      ? "border-gray-200 dark:border-zinc-700 hover:border-[#22C55E] cursor-pointer"
                      : isActive
                      ? "border-2 border-[#22C55E] ring-2 ring-[#22C55E]/20 shadow-xs cursor-pointer"
                      : "border-gray-200/70 dark:border-zinc-800 opacity-60 bg-gray-50/50 dark:bg-zinc-900/30 cursor-not-allowed"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono font-bold text-gray-400">
                        0{idx + 1}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                      ) : isActive ? (
                        <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>

                    <div className="w-full aspect-[4/3] rounded-lg flex items-center justify-center mb-2.5 p-2">
                      <Image
                        src={mod.imageSrc || "/images/loops.png"}
                        alt={mod.title}
                        width={52}
                        height={52}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-[#000000] dark:text-white group-hover:text-[#22C55E] transition-colors leading-tight line-clamp-2">
                      {mod.title}
                    </h3>
                  </div>

                  {/* Progress Line */}
                  <div className="mt-3 pt-2.5 border-t-2 border-gray-100 dark:border-zinc-800">
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full ${
                          isCompleted || isActive ? "bg-[#22C55E]" : "bg-gray-300 dark:bg-zinc-700"
                        }`}
                        style={{ width: `${mod.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">
                      {mod.progressPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SECONDARY PATHS                                        */}
      {/* ========================================================= */}
      <div className="space-y-4">
        {secondaryPaths.map((path) => (
          <div
            key={path.id}
            className="bg-white dark:bg-[#1b1c20] rounded-[15px] border-2 border-gray-200 dark:border-[#27272a] p-5 sm:p-6 shadow-xs transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className="w-10 h-10 rounded-[15px] text-white flex items-center justify-center shrink-0 p-2 shadow-xs"
                  style={{ backgroundColor: path.colorTheme }}
                >
                  {path.id === "data-analysis-path" ? (
                    <BarChart2 className="w-full h-full object-contain" />
                  ) : (
                    <Cpu className="w-full h-full object-contain" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-gray-400">
                    {path.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#000000] dark:text-white tracking-tight">
                    {path.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">{path.description}</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-xs font-semibold text-gray-500 dark:text-zinc-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Yaqinda</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
