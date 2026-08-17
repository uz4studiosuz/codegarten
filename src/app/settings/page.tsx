"use client";

import React, { useState } from "react";
import { AppNavbar } from "@/components/dashboard/AppNavbar";
import { SettingsView } from "@/components/settings/SettingsView";
import { AboutModal } from "@/components/dashboard/AboutModal";
import { InteractiveLessonModal } from "@/components/dashboard/InteractiveLessonModal";
import { mockUserProfile } from "@/data/mockCourseData";

export default function SettingsPage() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [activeLessonModalOpen, setActiveLessonModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-[#141414] text-black dark:text-white flex flex-col font-sans transition-colors duration-200 selection:bg-[#22C55E]/20 selection:text-[#22C55E]">
      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Interactive Lesson Modal */}
      <InteractiveLessonModal
        moduleId="mod-2"
        isOpen={activeLessonModalOpen}
        onClose={() => setActiveLessonModalOpen(false)}
      />

      {/* Top Navigation Bar with activeTab="settings" */}
      <AppNavbar
        activeTab="settings"
        user={mockUserProfile}
        onOpenStreakModal={() => setActiveLessonModalOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Settings Body */}
      <main className="flex-1">
        <SettingsView />
      </main>
    </div>
  );
}
