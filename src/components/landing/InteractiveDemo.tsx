"use client";

import React, { useState } from "react";
import { Container } from "@/design-system/primitives/Container";
import { Badge } from "@/design-system/primitives/Badge";
import { AlgorithmVisualizer } from "@/components/widgets/AlgorithmVisualizer";
import { LogicChallenge } from "@/components/widgets/LogicChallenge";
import { InteractiveStateDemo } from "@/components/widgets/InteractiveStateDemo";
import { IconSearch, IconBrain, IconCpu, IconSparkles } from "@tabler/icons-react";

export const InteractiveDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"binary-search" | "logic" | "system">("binary-search");

  return (
    <section id="interactive-demo" className="py-20 md:py-28 relative bg-bg-canvas overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-10 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-accent-green/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      <Container size="xl">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <Badge variant="glow" size="md" className="mb-4">
            <IconSparkles size={14} className="mr-1" />
            Amaliy Sinov Maydoni
          </Badge>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5 leading-tight">
            Interaktiv Ta&apos;lim Kuchini{" "}
            <span className="text-gradient-emerald">O&apos;zingiz Sinab Ko&apos;ring</span>
          </h2>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Quyidagi vidjetlarni to&apos;g&apos;ridan-to&apos;g&apos;ri boshqaring. Hech qanday ro&apos;yxatdan o&apos;tish shart emas — shunchaki bosing va natijani ko&apos;ring.
          </p>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-bg-card border border-border-medium shadow-card overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab("binary-search")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "binary-search"
                  ? "bg-brand text-white shadow-glow border border-brand-electric/50"
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              }`}
            >
              <IconSearch size={16} stroke={2} className="text-accent-green" />
              <span>1. Algoritm Visualizer</span>
            </button>

            <button
              onClick={() => setActiveTab("logic")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "logic"
                  ? "bg-brand text-white shadow-glow border border-brand-electric/50"
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              }`}
            >
              <IconBrain size={16} stroke={2} className="text-accent-amber" />
              <span>2. Mini-Kod Savoli</span>
            </button>

            <button
              onClick={() => setActiveTab("system")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "system"
                  ? "bg-brand text-white shadow-glow border border-brand-electric/50"
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              }`}
            >
              <IconCpu size={16} stroke={2} className="text-accent-purple" />
              <span>3. Cache & Latency</span>
            </button>
          </div>
        </div>

        {/* Interactive Widget Display Box */}
        <div className="max-w-4xl mx-auto transition-all duration-300">
          {activeTab === "binary-search" && <AlgorithmVisualizer />}
          {activeTab === "logic" && <LogicChallenge />}
          {activeTab === "system" && <InteractiveStateDemo />}
        </div>
      </Container>
    </section>
  );
};
