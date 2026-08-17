"use client";

import React from "react";

interface ShimmerProps {
  className?: string;
  rounded?: string;
}

export const ShimmerBox: React.FC<ShimmerProps> = ({
  className = "w-full h-4",
  rounded = "rounded-lg",
}) => {
  return (
    <div
      className={`shimmer-effect bg-gray-200 dark:bg-zinc-800 ${rounded} ${className}`}
    />
  );
};

export const CourseCardSkeleton: React.FC = () => {
  return (
    <div className="min-w-[148px] w-[148px] shrink-0 bg-white dark:bg-[#141414] rounded-[15px] border border-gray-200 dark:border-zinc-800 p-3.5 flex flex-col justify-between h-[225px] animate-pulse">
      <div>
        <div className="flex items-center justify-between mb-3">
          <ShimmerBox className="w-5 h-3" rounded="rounded" />
          <ShimmerBox className="w-4 h-4" rounded="rounded-full" />
        </div>
        <div className="w-full flex items-center justify-center mb-3">
          <ShimmerBox className="w-14 h-14" rounded="rounded-2xl" />
        </div>
        <ShimmerBox className="w-3/4 h-3.5 mx-auto mb-1.5" />
        <ShimmerBox className="w-1/2 h-3 mx-auto" />
      </div>
      <div className="mt-2 space-y-1">
        <ShimmerBox className="w-full h-1.5" rounded="rounded-full" />
        <ShimmerBox className="w-8 h-2.5" />
      </div>
    </div>
  );
};

export const CourseRoadmapSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left column skeleton */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[15px] border-2 border-gray-200 dark:border-zinc-800 p-6 sm:p-7 space-y-5">
            <ShimmerBox className="w-20 h-20" rounded="rounded-2xl" />
            <div className="space-y-2">
              <ShimmerBox className="w-3/4 h-6" />
              <ShimmerBox className="w-full h-4" />
              <ShimmerBox className="w-5/6 h-4" />
            </div>
            <div className="flex items-center gap-4 pt-2">
              <ShimmerBox className="w-24 h-4" />
              <ShimmerBox className="w-24 h-4" />
            </div>
          </div>
        </div>

        {/* Right column roadmap skeleton */}
        <div className="lg:col-span-7 flex flex-col items-center gap-8">
          <ShimmerBox className="w-3/4 max-w-md h-12" rounded="rounded-[15px]" />
          <div className="flex flex-col items-center gap-10 my-4">
            <ShimmerBox className="w-20 h-14" rounded="rounded-full" />
            <ShimmerBox className="w-24 h-16" rounded="rounded-full" />
            <ShimmerBox className="w-20 h-14" rounded="rounded-full" />
          </div>
          <ShimmerBox className="w-full max-w-md h-24" rounded="rounded-[15px]" />
        </div>
      </div>
    </div>
  );
};

export const InteractiveLessonSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-black dark:text-white flex flex-col justify-between p-4 sm:p-8 font-sans transition-colors">
      {/* Top bar */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto mb-6">
        <ShimmerBox className="w-8 h-8" rounded="rounded-full" />
        <ShimmerBox className="w-48 h-2" rounded="rounded-full" />
        <ShimmerBox className="w-12 h-6" rounded="rounded-full" />
      </div>

      {/* Main card */}
      <div className="w-full max-w-2xl mx-auto space-y-6 flex-1 flex flex-col justify-center">
        <ShimmerBox className="w-3/4 h-6 mx-auto" />
        <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-[15px] border-2 border-gray-200 dark:border-zinc-800 p-6 space-y-4">
          <ShimmerBox className="w-full h-48" rounded="rounded-xl" />
          <div className="space-y-3 pt-2">
            <ShimmerBox className="w-full h-10" rounded="rounded-lg" />
            <ShimmerBox className="w-full h-10" rounded="rounded-lg" />
            <ShimmerBox className="w-full h-10" rounded="rounded-lg" />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="w-full max-w-5xl mx-auto pt-6 flex items-center justify-between">
        <ShimmerBox className="w-12 h-12" rounded="rounded-xl" />
        <ShimmerBox className="w-32 h-12" rounded="rounded-full" />
      </div>
    </div>
  );
};

export const SettingsSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-3 space-y-2">
          <ShimmerBox className="w-full h-10" rounded="rounded-[15px]" />
          <ShimmerBox className="w-full h-10" rounded="rounded-[15px]" />
          <ShimmerBox className="w-full h-10" rounded="rounded-[15px]" />
        </div>
        <div className="md:col-span-9 space-y-6">
          <ShimmerBox className="w-48 h-7" />
          <div className="space-y-4 max-w-xl">
            <ShimmerBox className="w-full h-12" rounded="rounded-[15px]" />
            <ShimmerBox className="w-full h-12" rounded="rounded-[15px]" />
            <ShimmerBox className="w-full h-11" rounded="rounded-[15px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
