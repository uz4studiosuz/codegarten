"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustBar } from "@/components/landing/TrustBar";
import { WhyCodegarten } from "@/components/landing/WhyCodegarten";
import { CurriculumSection } from "@/components/landing/CurriculumSection";
import { HabitEngine } from "@/components/landing/HabitEngine";
import { PricingTeaser } from "@/components/landing/PricingTeaser";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  // If user is already authenticated, allow them to easily proceed or redirect
  return (
    <div className="min-h-screen bg-white text-[#121212] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <TrustBar />
        <WhyCodegarten />
        <CurriculumSection />
        <HabitEngine />
        <PricingTeaser />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
};
