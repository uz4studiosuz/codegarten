"use client";

import React, { useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { AppNavbar } from "@/components/dashboard/AppNavbar";
import { HomeDashboard } from "@/components/dashboard/HomeDashboard";
import { CoursesCatalog } from "@/components/dashboard/CoursesCatalog";
import { InteractiveLessonModal } from "@/components/dashboard/InteractiveLessonModal";
import { SettingsModal } from "@/components/dashboard/SettingsModal";
import { AboutModal } from "@/components/dashboard/AboutModal";
import { mockUserProfile } from "@/data/mockCourseData";

export default function AppRoot() {
  const [activeTab, setActiveTab] = useState<"home" | "courses">("home");
  const [activeLessonModalOpen, setActiveLessonModalOpen] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState<string>("mod-2");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleStartLesson = (moduleId: string) => {
    setCurrentModuleId(moduleId);
    setActiveLessonModalOpen(true);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-[#ffffff] dark:bg-[#141414] text-[#000000] dark:text-white flex flex-col font-sans transition-colors duration-200 selection:bg-[#22C55E]/20 selection:text-[#22C55E]">
          {/* Auth Dialog */}
          <AuthModal />

          {/* Settings Modal */}
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            user={mockUserProfile}
          />

          {/* About Modal */}
          <AboutModal
            isOpen={isAboutOpen}
            onClose={() => setIsAboutOpen(false)}
          />

          {/* Interactive Lesson Modal / Player */}
          <InteractiveLessonModal
            moduleId={currentModuleId}
            isOpen={activeLessonModalOpen}
            onClose={() => setActiveLessonModalOpen(false)}
          />

          {/* 1. App Top Navigation Bar with Menu Dropdown */}
          <AppNavbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={mockUserProfile}
            onOpenStreakModal={() => handleStartLesson("mod-2")}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAbout={() => setIsAboutOpen(true)}
          />

          {/* 2. Main Body View (Home Dashboard vs Courses Catalog) */}
          <main className="flex-1">
            {activeTab === "home" ? (
              <HomeDashboard
                onStartLesson={handleStartLesson}
                onNavigateToCourses={() => setActiveTab("courses")}
              />
            ) : (
              <CoursesCatalog onSelectModule={handleStartLesson} />
            )}
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
