import React from "react";
import Image from "next/image";
import { Button } from "@/design-system/primitives/Button";

export const HeroPhotoBanner: React.FC = () => {
  return (
    <section className="relative w-full min-h-[480px] sm:min-h-[540px] flex items-center justify-center overflow-hidden">
      {/* Background Photography Asset */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/photo-desktop-wide.jpg"
          alt="Student Coding Tutor"
          fill
          className="object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 flex flex-col items-center">
        {/* White Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-white tracking-tight mb-8 font-serif leading-tight">
          Siz orzu qilgan eng yaxshi repetitor{" "}
          <span className="italic">allaqachon shu yerda</span>
        </h2>

        {/* White Pill Button */}
        <a href="#interactive-demo" className="mb-10">
          <button className="px-8 py-3.5 sm:px-10 sm:py-4 rounded-full bg-white text-[#121212] font-semibold text-base sm:text-lg hover:bg-[#f3f4f6] transition-colors shadow-float cursor-pointer active:scale-[0.99]">
            Bepul Boshlash
          </button>
        </a>

        {/* App Store & Google Play Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a href="#" className="hover:opacity-90 transition-opacity">
            <div className="relative w-36 h-11">
              <Image
                src="/assets/download-on-the-app-store.svg"
                alt="Download on App Store"
                fill
                className="object-contain"
              />
            </div>
          </a>
          <a href="#" className="hover:opacity-90 transition-opacity">
            <div className="relative w-36 h-11">
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
    </section>
  );
};
