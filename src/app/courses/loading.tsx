import { ShimmerBox, CourseCardSkeleton } from "@/components/ui/ShimmerSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#141414] text-black dark:text-white flex flex-col font-sans">
      <div className="h-16 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#1F1F1F]" />
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mb-7 space-y-2">
          <ShimmerBox className="w-60 h-8" rounded="rounded-[10px]" />
          <ShimmerBox className="w-80 h-4" rounded="rounded-[8px]" />
        </div>
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <ShimmerBox className="w-72 h-6" rounded="rounded-[8px]" />
            <ShimmerBox className="w-28 h-8" rounded="rounded-full" />
          </div>
          <div className="bg-[#F8F9FA] dark:bg-[#1F1F1F] rounded-[15px] border border-gray-200/80 dark:border-zinc-800 p-4 sm:p-5 flex gap-3 overflow-hidden">
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
