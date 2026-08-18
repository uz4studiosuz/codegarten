"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/dashboard/AppNavbar";
import { HomeDashboard } from "@/components/dashboard/HomeDashboard";
import { AboutModal } from "@/components/dashboard/AboutModal";
import { mockUserProfile } from "@/data/mockCourseData";

export default function HomePage() {
  const router = useRouter();
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleStartLesson = (moduleId: string, lessonId?: string) => {
    router.push(lessonId ? `/learn/${moduleId}/${lessonId}` : `/courses/${moduleId}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#141414] text-black dark:text-white flex flex-col font-sans transition-colors duration-200 selection:bg-[#22C55E]/20 selection:text-[#22C55E]">
      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* App Top Navigation Bar with activeTab="home" */}
      <AppNavbar
        activeTab="home"
        user={mockUserProfile}
        onOpenStreakModal={() => router.push("/learn/mod-2/step-1")}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Body View (Home Dashboard) */}
      <main className="flex-1">
        <HomeDashboard
          onStartLesson={handleStartLesson}
          onNavigateToCourses={() => router.push("/courses")}
        />
      </main>
    </div>
  );
}
