"use client";

import React, { useState } from "react";
import { Container } from "@/design-system/primitives/Container";
import { Badge } from "@/design-system/primitives/Badge";
import { Button } from "@/design-system/primitives/Button";
import { learningTracks } from "@/data/tracks";
import { Clock, BookOpen, ArrowRight, Sparkles, Layers } from "lucide-react";

export const LearningTracks: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredTracks =
    selectedCategory === "all"
      ? learningTracks
      : learningTracks.filter((t) => t.category === selectedCategory);

  const categories = [
    { id: "all", label: "Barcha Treka" },
    { id: "cs", label: "Computer Science" },
    { id: "algorithms", label: "Algoritmlar" },
    { id: "web", label: "React & Next.js" },
    { id: "ai", label: "AI & Transformerlar" },
  ];

  return (
    <section id="tracks" className="py-20 md:py-28 relative bg-bg-secondary/40 border-t border-border-subtle">
      <Container size="xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Badge variant="brand" size="md" className="mb-4">
              <Layers className="w-3.5 h-3.5 mr-1" />
              Tizimli Dastur
            </Badge>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              O&apos;rganish Yo&apos;nalishlari &amp;{" "}
              <span className="text-gradient-brand">Treklari</span>
            </h2>
            <p className="text-base sm:text-lg text-text-secondary mt-3 max-w-xl">
              Noldan boshlab arxitekturagacha. Har bir mavzu o&apos;zaro bog&apos;langan interaktiv darslardan iborat.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  selectedCategory === c.id
                    ? "bg-brand-electric text-white shadow-glow"
                    : "bg-bg-card text-text-secondary hover:text-white border border-border-subtle"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {filteredTracks.map((track) => (
            <div
              key={track.id}
              className="flex flex-col justify-between rounded-2xl bg-bg-card/90 border border-border-subtle hover:border-brand-electric/50 transition-all duration-300 overflow-hidden shadow-card hover:shadow-glow group"
            >
              {/* Card Top: Video / Poster Media */}
              <div className="relative aspect-[16/9] w-full bg-[#0a0c10] overflow-hidden">
                {track.videoPreview ? (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  >
                    <source src={track.videoPreview} type="video/webm" />
                  </video>
                ) : (
                  <div className="w-full h-full bg-bg-elevated flex items-center justify-center text-text-muted">
                    <span>Video Prevyu</span>
                  </div>
                )}

                {/* Badges on video */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="glow" size="sm">
                    {track.tag}
                  </Badge>
                  {track.popular && (
                    <Badge variant="warning" size="sm">
                      {track.accentBadge}
                    </Badge>
                  )}
                </div>

                <div className="absolute bottom-3 right-4">
                  <Badge variant="default" size="sm">
                    {track.difficulty}
                  </Badge>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-brand-light transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-5">
                    {track.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {track.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-bg-secondary text-text-secondary border border-border-subtle"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Info */}
                <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-medium text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-brand-light" />
                      {track.lessonsCount} ta vazifa
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-accent-green" />
                      {track.estimatedHours}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-brand-light hover:text-white font-bold"
                    rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  >
                    Boshlash
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
