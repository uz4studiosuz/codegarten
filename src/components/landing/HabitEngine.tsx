import React from "react";
import Image from "next/image";
import { Container } from "@/design-system/primitives/Container";
import { Badge } from "@/design-system/primitives/Badge";
import { Button } from "@/design-system/primitives/Button";
import { Flame, Trophy, Calendar, Zap, Bell, CheckCircle2, ArrowRight } from "lucide-react";

export const HabitEngine: React.FC = () => {
  return (
    <section id="habit-engine" className="py-20 md:py-28 relative bg-bg-secondary/30 border-y border-border-subtle overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-accent-amber/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Description & Habit features */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <Badge variant="warning" size="md" className="mb-4">
              <Flame className="w-4 h-4 fill-current mr-1 text-accent-amber" />
              Kunlik Streak &amp; Odat Mexanizmi
            </Badge>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5 leading-tight">
              Katta natijalar{" "}
              <span className="text-gradient-emerald">kunlik 15 daqiqadan</span> boshlanadi
            </h2>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-8">
              Katta darsliklarni tugatish shart emas. Har kuni ertalabki qahva yoki tushlik tanaffusida bitta interaktiv konseptni o&apos;zlashtiring.
            </p>

            <div className="space-y-4 w-full mb-8">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-bg-card border border-border-subtle">
                <div className="w-8 h-8 rounded-lg bg-accent-amber/20 border border-accent-amber/40 flex items-center justify-center text-accent-amber shrink-0 mt-0.5">
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">
                    Gamifikatsiyalashgan Streak Tizimi
                  </h4>
                  <p className="text-xs text-text-secondary">
                    Kunlik mashg&apos;ulotlarni uzilmasdan bajaring, maxsus nishonlar va darajalar to&apos;plang.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-bg-card border border-border-subtle">
                <div className="w-8 h-8 rounded-lg bg-brand/30 border border-brand-electric/40 flex items-center justify-center text-brand-light shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">
                    Moslashuvchan Eslatmalar
                  </h4>
                  <p className="text-xs text-text-secondary">
                    O&apos;zingizga qulay vaqtni tanlang — tizim o&apos;rganish rejangizni avtomatik eslatib turadi.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-bg-card border border-border-subtle">
                <div className="w-8 h-8 rounded-lg bg-accent-green/20 border border-accent-green/40 flex items-center justify-center text-accent-green shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">
                    Spaced Repetition (Intervalli Qaytarish)
                  </h4>
                  <p className="text-xs text-text-secondary">
                    O&apos;rganilgan murakkab formulalar va algoritmlar xotirada uzoq saqlanishi uchun optimal vaqtda takrorlanadi.
                  </p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              variant="primary"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Bugungi Mashg&apos;ulotni Boshlash
            </Button>
          </div>

          {/* Right Column: Schedule Graphic & Video Preview */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden border border-border-medium bg-bg-card p-4 sm:p-6 shadow-deep">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mb-4 border border-border-subtle bg-black">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/assets/keep-learning-desktop.webm" type="video/webm" />
                </video>
              </div>

              {/* Schedule image overlay / card */}
              <div className="relative aspect-[16/7] w-full rounded-xl overflow-hidden border border-border-subtle">
                <Image
                  src="/assets/schedule-desktop.png"
                  alt="Codegarten Habit Schedule"
                  fill
                  className="object-contain bg-[#151922]"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
