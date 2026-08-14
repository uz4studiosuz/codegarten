"use client";

import React, { useState } from "react";
import { Container } from "@/design-system/primitives/Container";
import { Badge } from "@/design-system/primitives/Badge";
import { Button } from "@/design-system/primitives/Button";
import { Map, CheckCircle2, ChevronRight, Sparkles, Terminal, Code2, Server, Brain } from "lucide-react";

export const CurriculumRoadmap: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: "01",
      title: "Muhandislik Asoslari (CS Foundations)",
      tag: "1-bosqich",
      icon: <Terminal className="w-5 h-5 text-accent-green" />,
      topics: [
        "Xotira strukturasi: Stack vs Heap",
        "Ikkilik sanoq va Bitwise amallar",
        "Ko'rsatkichlar (Pointers) va Xotirani boshqarish",
        "Algoritmik vaqt va xotira murakkabligi (Big-O)",
      ],
      description: "Dasturlash tillaridan qat'i nazar, kompyuter nima qilayotganini chuqur tushunish asosi.",
    },
    {
      step: "02",
      title: "Algoritmlar & Ma'lumotlar Tuzilmasi",
      tag: "2-bosqich",
      icon: <Code2 className="w-5 h-5 text-brand-light" />,
      topics: [
        "Binary Search va Two Pointers texnikalari",
        "Bog'langan ro'yxatlar (Linked Lists) va Hash jadvallar",
        "Daraxtlar (BST, AVL, Trie) va Graph (BFS, DFS)",
        "Dynamic Programming va Rekursiv fikrlash",
      ],
      description: "Intervyu savollarini yodlash emas, balki optimal yechim topish intuitiv sezgisini rivojlantirish.",
    },
    {
      step: "03",
      title: "Zamonaviy Fullstack & React Internals",
      tag: "3-bosqich",
      icon: <Server className="w-5 h-5 text-accent-purple" />,
      topics: [
        "React Fiber va Virtual DOM rekonsilyatsiyasi",
        "Server Components va Edge Rendering oqimi",
        "Asinxron Event Loop va Concurrency",
        "State Management va Performans optimizatsiyasi",
      ],
      description: "Kutubxonalardan qanday foydalanish emas, ular kapot ostida qanday ishlashini bilish.",
    },
    {
      step: "04",
      title: "Taqsimlangan Tizimlar & AI Muhandisligi",
      tag: "4-bosqich",
      icon: <Brain className="w-5 h-5 text-accent-amber" />,
      topics: [
        "Taqsimlangan Kesh (Redis, Memcached) va Sharding",
        "Xabarlar navbati (Kafka, RabbitMQ) va Event-Driven",
        "Transformerlar va Self-Attention mexanikasi",
        "Vektor ma'lumotlar bazalari va RAG arxitekturasi",
      ],
      description: "Katta yuklamaga chidamli global servislar va AI agentlarini loyihalash darajasi.",
    },
  ];

  return (
    <section className="py-20 md:py-28 relative bg-bg-canvas border-t border-border-subtle">
      <Container size="xl">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <Badge variant="glow" size="md" className="mb-4">
            <Map className="w-3.5 h-3.5 mr-1" />
            Karyera Xaritasi
          </Badge>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Junior darajadan{" "}
            <span className="text-gradient-brand">Tizim Arxitektorigacha</span>
          </h2>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Codegarten o&apos;quv yo&apos;li tartibli va bosqichma-bosqich tuzilgan. Har bir daraja yangi super-kuch bag&apos;ishlaydi.
          </p>
        </div>

        {/* Roadmap Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {steps.map((st, idx) => (
            <div
              key={st.step}
              onClick={() => setActiveStep(idx)}
              className={`
                p-5 sm:p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between
                ${
                  activeStep === idx
                    ? "bg-bg-card border-brand-electric shadow-glow ring-1 ring-brand-electric/50"
                    : "bg-bg-card/50 border-border-subtle hover:border-border-medium hover:bg-bg-card"
                }
              `}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-text-muted">
                    {st.step}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center">
                    {st.icon}
                  </div>
                </div>

                <Badge variant={activeStep === idx ? "glow" : "default"} size="sm" className="mb-2">
                  {st.tag}
                </Badge>

                <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                  {st.title}
                </h3>
              </div>

              <span className="text-xs text-brand-light font-semibold flex items-center gap-1 mt-4">
                Mavzularni ko&apos;rish <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </div>

        {/* Active Step Details Container */}
        <div className="p-6 sm:p-8 rounded-2xl bg-bg-card border border-border-medium shadow-deep">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 pb-6 border-b border-border-subtle">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="brand" size="sm">{steps[activeStep].tag}</Badge>
                <span className="text-xs font-mono text-text-muted">{steps[activeStep].step} / 04</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {steps[activeStep].title}
              </h3>
              <p className="text-sm sm:text-base text-text-secondary mt-1">
                {steps[activeStep].description}
              </p>
            </div>

            <Button size="md" variant="gradient">
              Ushbu Bosqichni Boshlash
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps[activeStep].topics.map((t, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-bg-secondary border border-border-subtle"
              >
                <CheckCircle2 className="w-5 h-5 text-accent-green shrink-0" />
                <span className="text-sm font-medium text-text-primary">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
