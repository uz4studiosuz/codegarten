import React from "react";
import Image from "next/image";

export const TrustBar: React.FC = () => {
  return (
    <section className="py-12 border-y border-[#e5e7eb] bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-[#e5e7eb]">
          {/* Col 1: Award */}
          <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-0">
            <div className="relative w-8 h-8 mb-3">
              <Image
                src="/assets/icons/award-1.svg"
                alt="Award"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#121212] mb-1 font-sans">
              Award-winning
            </h3>
            <p className="text-xs sm:text-sm text-[#6b7280] max-w-xs">
              The New York Times, The Atlantic va Forbes tomonidan e&apos;tirof etilgan
            </p>
          </div>

          {/* Col 2: 150,000+ Reviews */}
          <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-0">
            <div className="relative w-24 h-6 mb-3">
              <Image
                src="/assets/icons/review-stars.svg"
                alt="5 Stars"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#121212] mb-1 font-sans">
              150,000+
            </h3>
            <p className="text-xs sm:text-sm text-[#6b7280] max-w-xs">
              iOS va Android ilovalarida 5 yulduzli baholar
            </p>
          </div>

          {/* Col 3: 10 million+ Learners */}
          <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-0">
            <div className="relative w-8 h-8 mb-3">
              <Image
                src="/assets/icons/learners-1.svg"
                alt="Learners"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#121212] mb-1 font-sans">
              10 million+
            </h3>
            <p className="text-xs sm:text-sm text-[#6b7280] max-w-xs">
              Dunyodagi 120 dan ortiq mamlakatlarda o&apos;rganuvchilar
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
