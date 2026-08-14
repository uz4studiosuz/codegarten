"use client";

import React, { useState } from "react";
import { Button } from "@/design-system/primitives/Button";
import { ArrowRight, Check } from "lucide-react";

interface CategoryData {
  id: string;
  label: string;
  courses: string[];
  puzzleTitle: string;
  puzzleSnippet: string;
  puzzleOptions: string[];
  correctAnswer: string;
  explanation: string;
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
    puzzleTitle: "Bitwise Shift Amali",
    puzzleSnippet: "x = 4 (0100₂)\nx << 1 natijasi qanday bo'ladi?",
    puzzleOptions: ["2 (0010₂)", "8 (1000₂)", "5 (0101₂)"],
    correctAnswer: "8 (1000₂)",
    explanation: "Chapga 1 bit surish (<< 1) sonni 2 ga ko'paytirishga teng: 4 × 2 = 8.",
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
    puzzleTitle: "Binary Search Murakkabligi",
    puzzleSnippet: "1,000,000 ta elementli saralangan massivda nishonni topish uchun ko'pi bilan necha qadam kerak?",
    puzzleOptions: ["~20 qadam (log₂ 10⁶)", "~1,000 qadam", "1,000,000 qadam"],
    correctAnswer: "~20 qadam (log₂ 10⁶)",
    explanation: "2²⁰ = 1,048,576. Binary search millionta elementni atigi 20 ta taqqoslashda topadi!",
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
    puzzleTitle: "Virtual DOM Diffing",
    puzzleSnippet: "React nima uchun to'liq DOM ni emas, faqat o'zgargan qismini qayta chizadi?",
    puzzleOptions: ["Performansni oshirish va qimmat renderlarni kamaytirish uchun", "Xotirani tejash uchun", "CSS stillarini tezroq yuklash uchun"],
    correctAnswer: "Performansni oshirish va qimmat renderlarni kamaytirish uchun",
    explanation: "Haqiqiy DOM amallari brauzer uchun qimmat. Virtual DOM faqat zarur minimal farqni yangilaydi.",
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
    puzzleTitle: "Self-Attention Mexanizmi",
    puzzleSnippet: "Transformer modellarida so'zlar orasidagi munosabat qaysi matritsalar orqali hisoblanadi?",
    puzzleOptions: ["Query, Key, Value (Q, K, V)", "Input va Output", "Faqat Weights va Biases"],
    correctAnswer: "Query, Key, Value (Q, K, V)",
    explanation: "Self-Attention har bir tokenni boshqa barcha tokenlar bilan solishtirish uchun Q, K, V proyeksiyalaridan foydalanadi.",
  },
];

export const CurriculumSection: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<string>("cs");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const activeCategory = curriculumCategories.find((c) => c.id === selectedCat) || curriculumCategories[0];

  const handleCategoryChange = (catId: string) => {
    setSelectedCat(catId);
    setSelectedAnswer(null);
  };

  return (
    <section id="curriculum" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#121212] tracking-tight mb-8 font-serif">
            Boshlang&apos;ichdan yuqori darajagacha
          </h2>

          {/* Clean Pill Category Filter Bar */}
          <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-[#f3f4f6] border border-[#e5e7eb]">
            {curriculumCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
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

        {/* Large Rounded Container Matching Brilliant.org Layout */}
        <div className="rounded-3xl bg-[#f7f7f5] border border-[#e5e5e2] p-8 sm:p-12 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Course Directory List */}
            <div className="lg:col-span-5 flex flex-col items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-4">
                Mavjud Kurslar
              </span>

              <ul className="space-y-3.5 w-full mb-8">
                {activeCategory.courses.map((course, idx) => (
                  <li
                    key={course}
                    className="flex items-center gap-3 text-sm sm:text-base font-medium text-[#121212] hover:text-[#00872e] transition-colors cursor-pointer group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00872e] shrink-0" />
                    <span>{course}</span>
                  </li>
                ))}
              </ul>

              <a href="#interactive-demo">
                <Button size="md" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Trekni O&apos;rganish
                </Button>
              </a>
            </div>

            {/* Right: Clean White Interactive Card */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-white border border-[#e5e7eb] p-6 sm:p-8 shadow-card">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#f3f4f6]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00872e]">
                    Mini-Vazifa
                  </span>
                  <span className="text-xs text-[#9ca3af]">Interaktiv</span>
                </div>

                <h4 className="text-lg font-bold text-[#121212] mb-2 font-sans">
                  {activeCategory.puzzleTitle}
                </h4>

                <div className="p-4 rounded-xl bg-[#f9fafb] border border-[#e5e7eb] font-mono text-xs sm:text-sm text-[#121212] mb-5 whitespace-pre-line leading-relaxed">
                  {activeCategory.puzzleSnippet}
                </div>

                {/* Options */}
                <div className="space-y-2.5 mb-5">
                  {activeCategory.puzzleOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedAnswer(opt)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                        selectedAnswer === opt
                          ? opt === activeCategory.correctAnswer
                            ? "bg-[#e6f4ea] border-[#00872e] text-[#00872e]"
                            : "bg-[#fef2f2] border-[#dc2626] text-[#dc2626]"
                          : "bg-white border-[#e5e7eb] text-[#121212] hover:border-[#9ca3af]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {/* Feedback */}
                {selectedAnswer && (
                  <div
                    className={`p-3 rounded-xl text-xs leading-relaxed ${
                      selectedAnswer === activeCategory.correctAnswer
                        ? "bg-[#e6f4ea] text-[#00872e]"
                        : "bg-[#fef2f2] text-[#dc2626]"
                    }`}
                  >
                    <span className="font-bold block mb-0.5">
                      {selectedAnswer === activeCategory.correctAnswer ? "To'g'ri!" : "Xato javob"}
                    </span>
                    <p>{activeCategory.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
