import React from "react";
import Image from "next/image";
import { Container } from "@/design-system/primitives/Container";
import { Badge } from "@/design-system/primitives/Badge";
import { IconDeviceMobile, IconCheck } from "@tabler/icons-react";

export const MobileAppTeaser: React.FC = () => {
  return (
    <section id="mobile-app" className="py-20 md:py-28 relative bg-[#f7f7f5] border-t border-[#e5e7eb] overflow-hidden">
      <Container size="xl">
        <div className="rounded-3xl bg-white border border-[#e5e7eb] p-8 sm:p-12 lg:p-16 shadow-card relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Info */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <Badge variant="brand" size="md" className="mb-4">
                <IconDeviceMobile size={16} className="mr-1" />
                iOS &amp; Android Mobil Ilovasi
              </Badge>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#121212] tracking-tight mb-5 font-serif">
                Xohlagan joyda,{" "}
                <span className="italic">cho&apos;ntagingizda o&apos;rganing</span>
              </h2>

              <p className="text-base sm:text-lg text-[#4b5563] leading-relaxed mb-8">
                Metroda, navbatda yoki sayrda — mobil ilovamiz to&apos;liq oflayn rejimni va sensorli qulay interaktiv vazifalarni qo&apos;llab-quvvatlaydi.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#e6f4ea] text-[#00872e] flex items-center justify-center shrink-0">
                    <IconCheck size={14} stroke={3} />
                  </div>
                  <span className="text-sm font-medium text-[#121212]">Oflayn rejimda ishlash</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#e6f4ea] text-[#00872e] flex items-center justify-center shrink-0">
                    <IconCheck size={14} stroke={3} />
                  </div>
                  <span className="text-sm font-medium text-[#121212]">Tezkor sensorli fikr-mulohaza</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#e6f4ea] text-[#00872e] flex items-center justify-center shrink-0">
                    <IconCheck size={14} stroke={3} />
                  </div>
                  <span className="text-sm font-medium text-[#121212]">Kompyuter bilan sinxronizatsiya</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#e6f4ea] text-[#00872e] flex items-center justify-center shrink-0">
                    <IconCheck size={14} stroke={3} />
                  </div>
                  <span className="text-sm font-medium text-[#121212]">Kunlik vidjetlar va streak</span>
                </div>
              </div>

              {/* App Store / Google Play Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <a href="#" className="hover:opacity-90 transition-opacity">
                  <div className="relative w-40 h-12">
                    <Image
                      src="/assets/icons/download-on-the-app-store.svg"
                      alt="Download on App Store"
                      fill
                      className="object-contain"
                    />
                  </div>
                </a>

                <a href="#" className="hover:opacity-90 transition-opacity">
                  <div className="relative w-40 h-12">
                    <Image
                      src="/assets/icons/get-it-on-google-play.svg"
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
              <div className="relative w-full max-w-sm aspect-[4/5] rounded-3xl overflow-hidden border border-[#e5e7eb] shadow-card bg-white">
                <Image
                  src="/assets/images/experts-desktop.png"
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
