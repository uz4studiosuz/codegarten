import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustBar } from "@/components/landing/TrustBar";
import { InteractiveStorySection } from "@/components/landing/InteractiveStorySection";
import { CurriculumSection } from "@/components/landing/CurriculumSection";
import { LifestylePedagogySections } from "@/components/landing/LifestylePedagogySections";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { HeroPhotoBanner } from "@/components/landing/HeroPhotoBanner";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-[#121212] flex flex-col font-sans">
      {/* 1. Clean Minimalist Navbar */}
      <Navbar />

      {/* 2. Hero Section with Interactive Card */}
      <HeroSection />

      {/* 3. 3-Column Trust Bar (Award, 150K Reviews, 10M Learners) */}
      <TrustBar />

      {/* 4. Meet Koji (Tutor) & 4 Zig-Zag Interactive Story Sections */}
      <InteractiveStorySection />

      {/* 5. Curriculum Directory ("From grade 5 to college and beyond") */}
      <CurriculumSection />

      {/* 6. Lifestyle & Expert Pedagogy Sections */}
      <LifestylePedagogySections />

      {/* 7. Testimonials Carousel ("Students, parents, and teachers love us") */}
      <TestimonialsSection />

      {/* 8. Full-Width Photo Banner with CTAs & App Store Badges */}
      <HeroPhotoBanner />

      {/* 9. Clean Charcoal Footer */}
      <Footer />
    </main>
  );
}
