"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/design-system/primitives/Button";
import { IconArrowRight, IconPlayerPlay } from "@tabler/icons-react";

interface CategoryData {
  id: string;
  label: string;
  courses: string[];
  videoSrc: string;
  title: string;
  description: string;
}

const curriculumCategories: CategoryData[] = [
  {
    id: "cs",
    label: "Computer Science",
    courses: [
      "Computer Science Fundamentals",
      "Memory & Stack vs Heap",
      "Bitwise Operations & Binary",
      "CPU Architecture & Assembly Basics",
      "Operating System Processes",
    ],
    videoSrc: "/assets/videos/cs-refresh.webm",
    title: "Computer Science & Xotira Arxitekturasi",
    description: "Kompyuter xotirasidagi har bir bayt va protsessor amallari vizual animatsiyalar orqali oydinlashadi.",
  },
  {
    id: "algorithms",
    label: "Algoritmlar",
    courses: [
      "Binary Search & Two Pointers",
      "Linked Lists & Hash Tables",
      "Binary Search Trees & Traversal",
      "Dynamic Programming Patterns",
      "Graph Algorithms (BFS & DFS)",
    ],
    videoSrc: "/assets/videos/math-refresh.webm",
    title: "Algoritmik Fikrlash & Interaktiv Mantiq",
    description: "Formulalarni yodlamasdan, har bir algoritmning vaqt va xotira samaradorligini amalda tushuning.",
  },
  {
    id: "web",
    label: "React & Web",
    courses: [
      "React Fiber & Virtual DOM",
      "Server Components & Streaming",
      "State Reconciliation",
      "Browser Event Loop & Concurrency",
    ],
    videoSrc: "/assets/videos/data-refresh.webm",
    title: "Modern Fullstack & React Internals",
    description: "Virtual DOM diffing hamda Server Componentlar kapot ostida qanday ishlashini interaktiv kuzating.",
  },
  {
    id: "ai",
    label: "AI & Data",
    courses: [
      "Neural Network Foundations",
      "Transformer & Self-Attention",
      "Vector Search & Embeddings",
      "Prompt Architecture & LLMs",
    ],
    videoSrc: "/assets/videos/science-refresh.webm",
    title: "AI Systems & Neural Networks",
    description: "Transformerlar, Attention matrikslari va neyron tarmoqlar oqimini vizual modellar orqali o'rganing.",
  },
];

export const CurriculumSection: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<string>("cs");

  const activeCategory =
    curriculumCategories.find((c) => c.id === selectedCat) || curriculumCategories[0];

  return (
    <section id="curriculum" className="py-20 sm:py-28 bg-white border-t border-[#e5e7eb]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#121212] tracking-tight mb-8 font-serif">
            Boshlang&apos;ichdan yuqori darajagacha
          </h2>

          {/* Category Filter Pills */}
          <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-[#f3f4f6] border border-[#e5e7eb]">
            {curriculumCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  selectedCat === cat.id
                    ? "bg-[#121212] text-white shadow-sm"
                    : "text-[#4b5563] hover:text-[#121212]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Large Rounded Container Featuring Video Previews */}
        <div className="rounded-3xl bg-[#f7f7f5] border border-[#e5e5e2] p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Course Directory List */}
            <div className="lg:col-span-5 flex flex-col items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#00872e] mb-2 font-mono">
                {activeCategory.label} yo&apos;nalishi
              </span>

              <h3 className="text-xl sm:text-2xl font-bold text-[#121212] mb-3 font-sans">
                {activeCategory.title}
              </h3>

              <p className="text-sm text-[#4b5563] leading-relaxed mb-6 font-normal">
                {activeCategory.description}
              </p>

              <ul className="space-y-3 w-full mb-8">
                {activeCategory.courses.map((course) => (
                  <li
                    key={course}
                    className="flex items-center gap-3 text-sm font-medium text-[#121212] hover:text-[#00872e] transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00872e] shrink-0" />
                    <span>{course}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register">
                <Button size="md" variant="primary" rightIcon={<IconArrowRight size={16} stroke={2} />}>
                  Darslarni Boshlash
                </Button>
              </Link>
            </div>

            {/* Right: Looping Video Preview Card (-refresh.webm) */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl overflow-hidden bg-white border border-[#e5e7eb] shadow-card aspect-[4/3] relative flex items-center justify-center">
                <video
                  key={activeCategory.videoSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src={activeCategory.videoSrc} type="video/webm" />
                  Brauzeringiz video tegini qo&apos;llab-quvvatlamaydi.
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
