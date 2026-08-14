"use client";

import React, { useState } from "react";
import { Container } from "@/design-system/primitives/Container";
import { Badge } from "@/design-system/primitives/Badge";
import { Button } from "@/design-system/primitives/Button";
import { Check, Zap, Sparkles, ShieldCheck } from "lucide-react";

export const PricingTeaser: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-20 md:py-28 relative bg-bg-canvas border-t border-border-subtle overflow-hidden">
      {/* Radiant Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      <Container size="xl">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <Badge variant="glow" size="md" className="mb-4">
            <Zap className="w-3.5 h-3.5 mr-1 text-accent-green" />
            Shaffof Tariflar
          </Badge>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Karyerangizga investitsiya{" "}
            <span className="text-gradient-emerald">kiriting</span>
          </h2>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-8">
            Bepul boshlang yoki to&apos;liq interaktiv imkoniyatlarni ochish uchun Pro a&apos;zosi bo&apos;ling.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-bg-card border border-border-medium shadow-card">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                !isAnnual
                  ? "bg-brand text-white shadow-glow"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              Oylik To&apos;lov
            </button>

            <button
              onClick={() => setIsAnnual(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isAnnual
                  ? "bg-brand text-white shadow-glow"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              <span>Yillik To&apos;lov</span>
              <span className="px-2 py-0.5 rounded-full bg-accent-green text-black font-extrabold text-[10px]">
                -40% TEJAMKOR
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Free Tier */}
          <div className="flex flex-col justify-between p-8 rounded-3xl bg-bg-card/80 border border-border-subtle shadow-card">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Free Learner</h3>
                <Badge variant="default" size="sm">Boshlang&apos;ich</Badge>
              </div>

              <p className="text-sm text-text-secondary mb-6">
                Platformani sinab ko&apos;rish va har kuni 1 ta mavzuni o&apos;rganish uchun.
              </p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl sm:text-5xl font-extrabold text-white">$0</span>
                <span className="text-sm text-text-muted">/ umrbod bepul</span>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent-green shrink-0" />
                  <span className="text-sm text-text-primary">Kuniga 3 ta bepul interaktiv dars</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent-green shrink-0" />
                  <span className="text-sm text-text-primary">Asosiy CS va Algoritmlar ko&apos;rinishi</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent-green shrink-0" />
                  <span className="text-sm text-text-primary">Hamjamiyat muhokamalari va forumi</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent-green shrink-0" />
                  <span className="text-sm text-text-primary">Oddiy kunlik streak hisobi</span>
                </div>
              </div>
            </div>

            <Button size="lg" variant="secondary" fullWidth>
              Hozir Bepul Boshlash
            </Button>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="flex flex-col justify-between p-8 rounded-3xl bg-gradient-to-b from-[#182038] via-bg-card to-bg-card border-2 border-brand-electric shadow-glow-lg relative overflow-hidden">
            {/* Top highlight badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-accent-green to-brand-electric text-black font-extrabold text-[10px] tracking-wider uppercase px-4 py-1 rounded-bl-xl">
              Tavsiya Qilinadi
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Codegarten Pro
                  <Sparkles className="w-4 h-4 text-accent-amber" />
                </h3>
                <Badge variant="glow" size="sm">Cheksiz Kirish</Badge>
              </div>

              <p className="text-sm text-text-secondary mb-6">
                Texnik intervyulardan o&apos;tish va haqiqiy muhandislik sezgisini shakllantirish uchun.
              </p>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl sm:text-5xl font-extrabold text-white">
                  {isAnnual ? "$8" : "$14"}
                </span>
                <span className="text-sm text-text-muted">
                  / oy {isAnnual ? "(yillik $96 to'lanadi)" : "(oylik to'lov)"}
                </span>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent-green shrink-0" />
                  <span className="text-sm font-semibold text-white">Barcha 15+ Treklarga 100% cheksiz kirish</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent-green shrink-0" />
                  <span className="text-sm font-semibold text-white">System Design &amp; AI Transformer chuqurlashtirilgan modullari</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent-green shrink-0" />
                  <span className="text-sm text-text-primary">Cheksiz kod sandboxt va real-time simulyatorlar</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent-green shrink-0" />
                  <span className="text-sm text-text-primary">Mobil ilovada oflayn yuklab olish</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent-green shrink-0" />
                  <span className="text-sm text-text-primary">Rasmiy sertifikat va LinkedIn tasdiqlash</span>
                </div>
              </div>
            </div>

            <Button size="lg" variant="gradient" fullWidth className="shadow-glow">
              7 Kun Bepul Pro Sinash
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 text-xs text-text-muted">
          <ShieldCheck className="w-4 h-4 text-accent-green" />
          <span>Istalgan vaqtda obunani bekor qilish mumkin &bull; 14 kunlik to&apos;liq kafolat</span>
        </div>
      </Container>
    </section>
  );
};
