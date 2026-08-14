import React from "react";
import Image from "next/image";
import { Container } from "@/design-system/primitives/Container";
import { Badge } from "@/design-system/primitives/Badge";
import { Smartphone, Check, Zap, Download } from "lucide-react";

export const MobileAppTeaser: React.FC = () => {
  return (
    <section id="mobile-app" className="py-20 md:py-28 relative bg-bg-secondary/40 border-t border-border-subtle overflow-hidden">
      <Container size="xl">
        <div className="rounded-3xl bg-gradient-to-br from-bg-card via-[#161a24] to-bg-card border border-border-medium p-8 sm:p-12 lg:p-16 shadow-deep relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-electric/15 rounded-full blur-[120px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Info */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <Badge variant="brand" size="md" className="mb-4">
                <Smartphone className="w-4 h-4 mr-1" />
                iOS &amp; Android Mobil Ilovasi
              </Badge>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5 leading-tight">
                Xohlagan joyda,{" "}
                <span className="text-gradient-brand">cho&apos;ntagingizda o&apos;rganing</span>
              </h2>

              <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-8">
                Metroda, navbatda yoki sayrda — mobil ilovamiz to&apos;liq oflayn rejimni va sensorli qulay interaktiv vazifalarni qo&apos;llab-quvvatlaydi.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">Oflayn rejimda ishlash</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">Tezkor haptik fikr-mulohaza</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">Kompyuter bilan sinxronizatsiya</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">Kunlik vidjetlar va streak</span>
                </div>
              </div>

              {/* App Store / Google Play Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#"
                  className="hover:opacity-90 transition-opacity hover:scale-105 transition-transform"
                >
                  <div className="relative w-40 h-12">
                    <Image
                      src="/assets/download-on-the-app-store.svg"
                      alt="Download on App Store"
                      fill
                      className="object-contain"
                    />
                  </div>
                </a>

                <a
                  href="#"
                  className="hover:opacity-90 transition-opacity hover:scale-105 transition-transform"
                >
                  <div className="relative w-40 h-12">
                    <Image
                      src="/assets/get-it-on-google-play.svg"
                      alt="Get it on Google Play"
                      fill
                      className="object-contain"
                    />
                  </div>
                </a>
              </div>
            </div>

            {/* Right: Graphic Media */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm aspect-[4/5] rounded-3xl overflow-hidden border border-border-bright shadow-deep bg-bg-card">
                <Image
                  src="/assets/experts-desktop.png"
                  alt="Mobile App Preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
