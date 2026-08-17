"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/dashboard/AppNavbar";
import { SettingsView } from "@/components/settings/SettingsView";
import { AboutModal } from "@/components/dashboard/AboutModal";
import { mockUserProfile } from "@/data/mockCourseData";

export default function SettingsPage() {
  const router = useRouter();
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-[#141414] text-black dark:text-white flex flex-col font-sans transition-colors duration-200 selection:bg-[#22C55E]/20 selection:text-[#22C55E]">
      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Top Navigation Bar with activeTab="settings" */}
      <AppNavbar
        activeTab="settings"
        user={mockUserProfile}
        onOpenStreakModal={() => router.push("/learn/mod-2/step-1")}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Settings Body */}
      <main className="flex-1">
        <SettingsView />
      </main>
    </div>
  );
}
