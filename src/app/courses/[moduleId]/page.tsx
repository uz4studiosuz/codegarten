"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  IconArrowLeft,
  IconCircleCheckFilled,
  IconBook,
  IconCode,
  IconSparkles,
  IconPlayerPlay,
  IconLock,
  IconBolt,
} from "@tabler/icons-react";
import { AppNavbar } from "@/components/dashboard/AppNavbar";
import { AboutModal } from "@/components/dashboard/AboutModal";
import { foundationalLearningPath, mockUserProfile } from "@/data/mockCourseData";

export default function ModuleRoadmapPage() {
  const router = useRouter();
  const urlParams = useParams();
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const moduleId = (urlParams?.moduleId as string) || "mod-2";
  const path = foundationalLearningPath;
  const currentModule =
    path.modules.find((m) => m.id === moduleId) || path.modules[1] || path.modules[0];

  // Roadmap Nodes matching Screenshot 1 but themed with primary green
  const nodes = [
    {
      id: "step-1",
      title: "Writing Programs",
      titleUz: "Dasturlar yozish",
      description: "Dasturlash muhiti va dastlabki amallar",
      status: "completed" as const,
    },
    {
      id: "step-2",
      title: "Using Variables",
      titleUz: "O'zgaruvchilardan foydalanish",
      description: "Shakllar va ranglarni dinamik boshqarish",
      status: "active" as const,
    },
    {
      id: "step-3",
      title: "Multiple Variables",
      titleUz: "Ko'p o'zgaruvchilar bilan ishlash",
      description: "Murakkab geometrik hisob-kitoblar",
      status: "upcoming" as const,
    },
    {
      id: "step-4",
      title: "Logical Conditions",
      titleUz: "Mantiqiy shartlar",
      description: "Qarorlar qabul qilish algoritmi",
      status: "locked" as const,
    },
  ];

  const handleStartLesson = (stepId: string = "step-2") => {
    router.push(`/learn/${moduleId}/${stepId}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F10] text-black dark:text-white flex flex-col font-sans transition-colors duration-200 selection:bg-[#22C55E]/20 selection:text-[#22C55E]">
      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* App Top Navbar */}
      <AppNavbar
        activeTab="courses"
        user={mockUserProfile}
        onOpenStreakModal={() => handleStartLesson("step-2")}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Sub Header Navigation */}
      <div className="border-b border-gray-200 dark:border-zinc-800/80 bg-gray-50 dark:bg-[#141416] transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <IconArrowLeft size={16} stroke={2} />
            <span>Barcha kurslarga qaytish</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400">
            <span className="text-[#22C55E] font-bold">{currentModule.level}</span>
            <span>•</span>
            <span>{currentModule.progressPercent}% yakunlandi</span>
          </div>
        </div>
      </div>

      {/* Main Roadmap Content matching Screenshot 1 with Primary Green Branding */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Module Summary Card (Theme-adaptive)        */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#19191C] rounded-[15px] border-2 border-gray-200 dark:border-zinc-800 p-6 sm:p-7 shadow-sm relative overflow-hidden transition-colors">
              {/* Subtle top background green glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none" />

              {/* 3D Module Icon / Printer Visual */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[14px] bg-gray-50 dark:bg-[#24242A] border border-gray-200 dark:border-zinc-700/80 flex items-center justify-center p-3 mb-5 shadow-xs">
                <Image
                  src={currentModule.imageSrc || "/images/loops.png"}
                  alt={currentModule.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title & Description */}
              <h1 className="text-xl sm:text-2xl font-extrabold text-black dark:text-white tracking-tight mb-2">
                {currentModule.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                {currentModule.description ||
                  "Supercharge your programming skills with variables, sequences, and logic loops."}
              </p>

              {/* Badges / Stats Row */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100 dark:border-zinc-800 text-xs font-semibold text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-1.5">
                  <IconBook size={16} className="text-[#22C55E]" />
                  <span>15 Darslar</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconCode size={16} className="text-[#22C55E]" />
                  <span>150 Mashqlar</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Interactive Nodes Roadmap (Green Primary)   */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            {/* Level Banner Pill (Primary Green Theme) */}
            <div className="w-full max-w-md bg-green-50/80 dark:bg-[#121c16] border-2 border-green-500/50 rounded-[15px] p-3 text-center mb-10 shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-colors">
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#22C55E] uppercase block">
                BOSQICH 1
              </span>
              <span className="text-sm font-bold text-black dark:text-white tracking-tight">
                {currentModule.titleEn || "Variables & Logic"}
              </span>
            </div>

            {/* Vertical Path of Interactive Nodes */}
            <div className="flex flex-col items-center gap-12 w-full max-w-md relative my-2">
              
              {/* Connecting dashed line behind nodes */}
              <div className="absolute left-1/2 top-8 bottom-8 -translate-x-1/2 w-0.5 border-l-2 border-dashed border-gray-300 dark:border-zinc-800 pointer-events-none z-0" />

              {/* Node 1: Completed (Green checkmark pedestal) */}
              <div
                onClick={() => handleStartLesson("step-1")}
                className="relative z-10 flex items-center justify-between w-full p-2 group cursor-pointer"
              >
                <div className="flex items-center gap-5 mx-auto">
                  {/* 3D Circular Pedestal (Completed - Green) */}
                  <div className="relative w-16 h-12 flex items-center justify-center">
                    {/* Shadow disc */}
                    <div className="absolute inset-0 rounded-full bg-green-900/40 blur-xs translate-y-2" />
                    {/* Disc base */}
                    <div className="relative w-14 h-10 rounded-full bg-gradient-to-b from-[#4ade80] to-[#15803d] border-2 border-green-300 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shadow-xs">
                        <IconCircleCheckFilled size={18} className="text-[#15803d]" />
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#22C55E] transition-colors">
                    {nodes[0].title}
                  </span>
                </div>
              </div>

              {/* Node 2: Active (Screenshot 1 center with glowing pedestal and green cube mascot) */}
              <div
                onClick={() => handleStartLesson("step-2")}
                className="relative z-10 flex items-center justify-between w-full p-2 group cursor-pointer"
              >
                <div className="flex items-center gap-5 mx-auto">
                  {/* Glowing 3D Pedestal + Floating Mascot */}
                  <div className="relative w-20 h-20 flex flex-col items-center justify-center">
                    {/* Ambient Glow */}
                    <div className="absolute inset-0 rounded-full bg-[#22C55E]/30 blur-md translate-y-3" />
                    
                    {/* Floating Green Cube / Diamond Mascot */}
                    <div className="relative z-20 -mb-2 animate-bounce">
                      <div className="w-8 h-8 rounded-[8px] bg-gradient-to-tr from-[#15803d] to-[#22C55E] border border-[#86efac] shadow-lg flex items-center justify-center rotate-45">
                        <div className="w-3 h-3 bg-black rounded-[2px] -rotate-45" />
                      </div>
                    </div>

                    {/* Disc Pedestal Base (Green gradient) */}
                    <div className="relative z-10 w-16 h-10 rounded-full bg-gradient-to-b from-[#22C55E] to-[#14532d] border-2 border-green-300/80 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <div className="w-10 h-6 rounded-full bg-white/90 shadow-inner flex items-center justify-center" />
                    </div>
                  </div>

                  <span className="text-sm font-extrabold text-black dark:text-white group-hover:text-[#22C55E] transition-colors">
                    {nodes[1].title}
                  </span>
                </div>
              </div>

              {/* Node 3: Upcoming (Screenshot 1 lower) */}
              <div
                onClick={() => handleStartLesson("step-3")}
                className="relative z-10 flex items-center justify-between w-full p-2 group cursor-pointer"
              >
                <div className="flex items-center gap-5 mx-auto">
                  {/* Gray Metallic Disc Base */}
                  <div className="relative w-16 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gray-400/30 dark:bg-zinc-900/60 blur-xs translate-y-2" />
                    <div className="relative w-14 h-10 rounded-full bg-gradient-to-b from-gray-200 to-gray-400 dark:from-zinc-600 dark:to-zinc-800 border-2 border-gray-300 dark:border-zinc-500/80 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <div className="w-8 h-5 rounded-full bg-gray-100 dark:bg-zinc-400/80 shadow-inner" />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-400 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    {nodes[2].title}
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom Action Card (Theme-adaptive + Green Primary Button) */}
            <div className="w-full max-w-md bg-white dark:bg-[#19191C] rounded-[15px] border-2 border-gray-200 dark:border-zinc-800 p-5 mt-6 shadow-sm text-center space-y-4 transition-colors">
              <h3 className="text-base font-extrabold text-black dark:text-white">
                {nodes[1].title}
              </h3>

              <button
                type="button"
                onClick={() => handleStartLesson("step-2")}
                className="w-full py-3.5 rounded-[15px] bg-[#22C55E] hover:bg-[#16a34a] text-white text-sm sm:text-base font-extrabold shadow-[0_4px_0_0_#15803d] active:shadow-none active:translate-y-1 transition-all cursor-pointer select-none flex items-center justify-center gap-2"
              >
                <IconPlayerPlay size={18} fill="white" />
                <span>Boshlash (Start)</span>
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
