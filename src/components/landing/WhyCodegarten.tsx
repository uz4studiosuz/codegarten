import React from "react";
import { Container } from "@/design-system/primitives/Container";
import { Badge } from "@/design-system/primitives/Badge";
import { Check, X, Brain, Cpu, Compass } from "lucide-react";

export const WhyCodegarten: React.FC = () => {
  const comparisonItems = [
    {
      feature: "O'rganish uslubi",
      passive: "Passiv 40 daqiqalik ma'ruzani ko'rish",
      codegarten: "Har 30 soniyada interaktiv qaror qabul qilish",
    },
    {
      feature: "Eslab qolish darajasi",
      passive: "20% (1 haftadan so'ng unutiladi)",
      codegarten: "85%+ (faol sinov va mustahkamlash)",
    },
    {
      feature: "Xatoliklar bilan ishlash",
      passive: "Videoda faqat tayyor to'g'ri kod ko'rsatiladi",
      codegarten: "Xatolikni o'zingiz keltirib chiqarib, sababini tahlil qilasiz",
    },
    {
      feature: "Vaqt samaradorligi",
      passive: "Soatlab konspekt qilish",
      codegarten: "Kuniga 15 daqiqa maqsadli amaliyot",
    },
  ];

  const featureCards = [
    {
      title: "Har bir konsepsiya bitta bosishda oydinlashadi",
      description: "Murakkab mavzular qismlarga ajratilib, intuitiv vizual elementlar orqali ko'rsatiladi.",
      video: "/assets/videos/concepts-click-desktop.webm",
      icon: <Brain className="w-5 h-5 text-[#00872e]" />,
    },
    {
      title: "Fikrlashga undovchi arxitektura",
      description: "Tayyor kodni ko'chirib olish emas, balki nima uchun shunday yozilishini anglab yetish.",
      video: "/assets/videos/built-to-think-desktop.webm",
      icon: <Cpu className="w-5 h-5 text-[#213c9e]" />,
    },
    {
      title: "Darajangizga moslashuvchan algoritm",
      description: "Sizning bilmingizga qarab topshiriqlar murakkabligi avtomatik moslashadi.",
      video: "/assets/videos/adapts-desktop.webm",
      icon: <Compass className="w-5 h-5 text-[#8a5cf6]" />,
    },
  ];

  return (
    <section id="why-codegarten" className="py-20 md:py-28 relative bg-white border-t border-[#e5e7eb]">
      <Container size="xl">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <Badge variant="brand" size="md" className="mb-4">
            Ilmiy Asoslangan Metodika
          </Badge>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#121212] tracking-tight mb-4 font-serif">
            Nima uchun Codegarten <span className="italic">videolardan ustun?</span>
          </h2>

          <p className="text-base sm:text-lg text-[#4b5563] leading-relaxed font-normal">
            Inson miyasi passiv ma&apos;lumotni tez unutadi. Codegarten sizni har bir daqiqada faol fikrlashga va sinovdan o&apos;tkazishga undaydi.
          </p>
        </div>

        {/* Comparison Table / Matrix */}
        <div className="max-w-4xl mx-auto mb-20 rounded-3xl bg-[#f7f7f5] border border-[#e5e5e2] overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 bg-[#ebebea] p-4 sm:p-5 border-b border-[#e5e5e2] text-xs sm:text-sm font-bold text-[#121212]">
            <div className="col-span-4 text-[#6b7280]">XUSUSIYAT</div>
            <div className="col-span-4 text-[#dc2626] flex items-center gap-1.5">
              <X className="w-4 h-4" /> Passiv Video Kurslar
            </div>
            <div className="col-span-4 text-[#00872e] flex items-center gap-1.5 font-extrabold">
              <Check className="w-4 h-4" /> Codegarten Usuli
            </div>
          </div>

          <div className="divide-y divide-[#e5e5e2]">
            {comparisonItems.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 p-4 sm:p-5 text-xs sm:text-sm items-center hover:bg-white transition-colors"
              >
                <div className="col-span-4 font-semibold text-[#121212]">
                  {item.feature}
                </div>
                <div className="col-span-4 text-[#6b7280] pr-2">
                  {item.passive}
                </div>
                <div className="col-span-4 text-[#00872e] font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00872e] shrink-0" />
                  <span>{item.codegarten}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Cards with Looping Videos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {featureCards.map((feat, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-3xl bg-white border border-[#e5e7eb] overflow-hidden hover:border-[#d1d5db] transition-all duration-200 shadow-card hover:shadow-float group"
            >
              <div className="relative aspect-[4/3] w-full bg-[#f9fafb] overflow-hidden">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src={feat.video} type="video/webm" />
                </video>
              </div>

              <div className="p-6 flex flex-col justify-between flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#f3f4f6] border border-[#e5e7eb] flex items-center justify-center">
                    {feat.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#121212] leading-snug font-sans">
                    {feat.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#4b5563] leading-relaxed font-normal">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
