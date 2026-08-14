import React from "react";
import Image from "next/image";
import { testimonialsData } from "@/data/testimonials";

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-[#fafafa] border-t border-[#e5e7eb]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Heading */}
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#121212] tracking-tight font-serif">
            Talabalar, muhandislar va ustozlar bizni sevadilar
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {testimonialsData.slice(0, 4).map((test) => (
            <div
              key={test.id}
              className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border border-[#e5e7eb] shadow-card hover:border-[#d1d5db] transition-all"
            >
              {/* Quote */}
              <p className="text-sm text-[#374151] leading-relaxed mb-6 font-normal">
                &ldquo;{test.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#f3f4f6]">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#e5e7eb] shrink-0 bg-[#f3f4f6]">
                  <Image
                    src={test.avatarUrl}
                    alt={test.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-[#121212] truncate">
                    {test.name}
                  </span>
                  <span className="text-xs text-[#6b7280] truncate">
                    {test.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Minimal pagination indicator dots */}
        <div className="flex justify-center items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#121212]" />
          <span className="w-2 h-2 rounded-full bg-[#d1d5db]" />
          <span className="w-2 h-2 rounded-full bg-[#d1d5db]" />
        </div>
      </div>
    </section>
  );
};
