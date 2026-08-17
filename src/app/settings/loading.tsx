import { SettingsSkeleton } from "@/components/ui/ShimmerSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#141414] text-black dark:text-white flex flex-col font-sans">
      <div className="h-16 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#1F1F1F]" />
      <SettingsSkeleton />
    </div>
  );
}
