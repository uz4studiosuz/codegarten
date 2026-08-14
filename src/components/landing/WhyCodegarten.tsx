import React from "react";
import { Container } from "@/design-system/primitives/Container";
import { Badge } from "@/design-system/primitives/Badge";
import { Check, X, Sparkles, Brain, Cpu, Compass, Flame } from "lucide-react";

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
      video: "/assets/concepts-click-desktop.webm",
      icon: <Brain className="w-5 h-5 text-accent-green" />,
    },
    {
      title: "Fikrlashga undovchi arxitektura",
      description: "Tayyor kodni ko'chirib olish emas, balki nima uchun shunday yozilishini anglab yetish.",
      video: "/assets/built-to-think-desktop.webm",
      icon: <Cpu className="w-5 h-5 text-brand-light" />,
    },
    {
      title: "Darajangizga moslashuvchan algoritm",
      description: "Sizning bilmingizga qarab topshiriqlar murakkabligi avtomatik moslashadi.",
      video: "/assets/adapts-desktop.webm",
      icon: <Compass className="w-5 h-5 text-accent-purple" />,
    },
  ];

  return (
    <section id="why-codegarten" className="py-20 md:py-28 relative bg-bg-canvas">
      <Container size="xl">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <Badge variant="glow" size="md" className="mb-4">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Ilmiy Asoslangan Metodika
          </Badge>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Nima uchun Codegarten{" "}
            <span className="text-gradient-rainbow">videolardan ustun?</span>
          </h2>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Inson miyasi passiv ma&apos;lumotni tez unutadi. Codegarten sizni har bir daqiqada faol fikrlashga va sinovdan o&apos;tkazishga undaydi.
          </p>
        </div>

        {/* Comparison Table / Matrix */}
        <div className="max-w-4xl mx-auto mb-20 rounded-2xl bg-bg-card border border-border-medium overflow-hidden shadow-deep">
          <div className="grid grid-cols-12 bg-[#121620] p-4 sm:p-5 border-b border-border-subtle text-xs sm:text-sm font-bold">
            <div className="col-span-4 text-text-muted">XUSUSIYAT</div>
            <div className="col-span-4 text-accent-red flex items-center gap-1.5">
              <X className="w-4 h-4" /> Passiv Video Kurslar
            </div>
            <div className="col-span-4 text-accent-green flex items-center gap-1.5 font-extrabold">
              <Check className="w-4 h-4" /> Codegarten Usuli
            </div>
          </div>

          <div className="divide-y divide-border-subtle">
            {comparisonItems.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 p-4 sm:p-5 text-xs sm:text-sm items-center hover:bg-bg-elevated/40 transition-colors"
              >
                <div className="col-span-4 font-semibold text-white">
                  {item.feature}
                </div>
                <div className="col-span-4 text-text-muted pr-2">
                  {item.passive}
                </div>
                <div className="col-span-4 text-brand-light font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent-green shrink-0" />
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
              className="flex flex-col rounded-2xl bg-bg-card/90 border border-border-subtle overflow-hidden hover:border-brand-electric/40 transition-all duration-300 shadow-card hover:shadow-glow group"
            >
              <div className="relative aspect-[4/3] w-full bg-[#0a0c10] overflow-hidden">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                >
                  <source src={feat.video} type="video/webm" />
                </video>
              </div>

              <div className="p-6 flex flex-col justify-between flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center">
                    {feat.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {feat.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
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
