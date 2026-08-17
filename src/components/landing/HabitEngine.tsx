import React from "react";
import Image from "next/image";
import { Container } from "@/design-system/primitives/Container";
import { Badge } from "@/design-system/primitives/Badge";
import { Button } from "@/design-system/primitives/Button";
import { IconFlame, IconCalendar, IconBolt, IconArrowRight } from "@tabler/icons-react";

export const HabitEngine: React.FC = () => {
  return (
    <section id="habit-engine" className="py-20 md:py-28 relative bg-[#f7f7f5] border-y border-[#e5e7eb] overflow-hidden">
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Description & Habit features */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <Badge variant="warning" size="md" className="mb-4">
              <IconFlame size={16} className="fill-current mr-1 text-amber-600" />
              Kunlik Streak &amp; Odat Mexanizmi
            </Badge>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#121212] tracking-tight mb-5 font-serif">
              Katta natijalar <span className="italic">kunlik 15 daqiqadan</span> boshlanadi
            </h2>

            <p className="text-base sm:text-lg text-[#4b5563] leading-relaxed mb-8 font-normal">
              Katta darsliklarni tugatish shart emas. Har kuni ertalabki qahva yoki tushlik tanaffusida bitta interaktiv konseptni o&apos;zlashtiring.
            </p>

            <div className="space-y-4 w-full mb-8">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#e5e7eb] shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#fef3c7] text-[#b45309] flex items-center justify-center shrink-0 mt-0.5">
                  <IconFlame size={16} className="fill-current" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#121212] mb-0.5">
                    Gamifikatsiyalashgan Streak Tizimi
                  </h4>
                  <p className="text-xs text-[#6b7280]">
                    Kunlik mashg&apos;ulotlarni uzilmasdan bajaring, maxsus nishonlar va darajalar to&apos;plang.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#e5e7eb] shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#e6f4ea] text-[#00872e] flex items-center justify-center shrink-0 mt-0.5">
                  <IconCalendar size={16} stroke={2} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#121212] mb-0.5">
                    Moslashuvchan Eslatmalar
                  </h4>
                  <p className="text-xs text-[#6b7280]">
                    O&apos;zingizga qulay vaqtni tanlang — tizim o&apos;rganish rejangizni avtomatik eslatib turadi.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#e5e7eb] shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#e6f4ea] text-[#00872e] flex items-center justify-center shrink-0 mt-0.5">
                  <IconBolt size={16} stroke={2} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#121212] mb-0.5">
                    Spaced Repetition (Intervalli Qaytarish)
                  </h4>
                  <p className="text-xs text-[#6b7280]">
                    O&apos;rganilgan murakkab formulalar va algoritmlar xotirada uzoq saqlanishi uchun optimal vaqtda takrorlanadi.
                  </p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              variant="primary"
              rightIcon={<IconArrowRight size={20} stroke={2} />}
            >
              Bugungi Mashg&apos;ulotni Boshlash
            </Button>
          </div>

          {/* Right Column: Schedule Graphic & Video Preview */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden border border-[#e5e7eb] bg-white p-4 sm:p-6 shadow-card">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mb-4 border border-[#e5e7eb] bg-black">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/assets/videos/keep-learning-desktop.webm" type="video/webm" />
                </video>
              </div>

              {/* Schedule image overlay / card */}
              <div className="relative aspect-[16/7] w-full rounded-xl overflow-hidden border border-[#e5e7eb]">
                <Image
                  src="/assets/images/schedule-desktop.png"
                  alt="Codegarten Habit Schedule"
                  fill
                  className="object-contain bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
