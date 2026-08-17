import { CourseRoadmapSkeleton } from "@/components/ui/ShimmerSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col font-sans">
      <div className="h-16 border-b border-zinc-800 bg-[#141416]" />
      <CourseRoadmapSkeleton />
    </div>
  );
}
