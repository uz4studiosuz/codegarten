import React from "react";
import Image from "next/image";

export const LifestylePedagogySections: React.FC = () => {
  return (
    <div className="bg-white">
      {/* 1. Always on your schedule */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Photo */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] relative border border-[#e5e7eb] shadow-card">
                <Image
                  src="/assets/photo-desktop-wide.jpg"
                  alt="Learning on schedule"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right: Text */}
            <div className="lg:col-span-6 flex flex-col items-start text-left lg:pl-6">
              <h3 className="text-3xl sm:text-4xl font-normal text-[#121212] tracking-tight mb-4 font-serif">
                Doim sizning jadvalingizga mos
              </h3>
              <p className="text-base sm:text-lg text-[#4b5563] leading-relaxed font-normal">
                15 daqiqalik ixcham darslar o&apos;qishni o&apos;z rejangiz bo&apos;yicha olib borish imkonini beradi. Sizda 5 daqiqa yoki 50 daqiqa bo&apos;lishidan qat&apos;i nazar, har kuni aniq natijaga erishasiz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Built by top learning experts */}
      <section className="py-20 sm:py-28 border-t border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Text & Partner Badges */}
            <div className="lg:col-span-6 flex flex-col items-start text-left lg:pr-6">
              <h3 className="text-3xl sm:text-4xl font-normal text-[#121212] tracking-tight mb-4 font-serif">
                Yetakchi ta&apos;lim mutaxassislari tomonidan yaratilgan
              </h3>
              <p className="text-base sm:text-lg text-[#4b5563] leading-relaxed mb-8 font-normal">
                MIT, Stanford, Garvard, Google va Meta universitetlari hamda kompaniyalarining professorlari, tadqiqotchilari va muhandislari tajribasi asosida ishlab chiqilgan.
              </p>

              {/* Logos / Text Badges */}
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-[#6b7280]">
                <span>MIT</span>
                <span>&bull;</span>
                <span>STANFORD</span>
                <span>&bull;</span>
                <span>HARVARD</span>
                <span>&bull;</span>
                <span>GOOGLE</span>
                <span>&bull;</span>
                <span>META</span>
              </div>
            </div>

            {/* Right: Campus Photo */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] relative border border-[#e5e7eb] shadow-card">
                <Image
                  src="/assets/experts-desktop.png"
                  alt="Top University Experts"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
