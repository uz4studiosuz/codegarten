"use client";

import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { VocabularyProvider } from "@/context/VocabularyContext";
import { SpeechProvider } from "@/context/SpeechContext";
import { AchievementsProvider } from "@/achievements";
import { AuthModal } from "@/components/auth/AuthModal";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProgressProvider>
          <VocabularyProvider>
            <SpeechProvider>
              {/*
                Achievements read progress and vocabulary, so they mount inside
                both — and own the congratulation dialog for every page.
              */}
              <AchievementsProvider>
                <AuthModal />
                {children}
              </AchievementsProvider>
            </SpeechProvider>
          </VocabularyProvider>
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
