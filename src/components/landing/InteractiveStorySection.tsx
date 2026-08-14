import React from "react";
import Image from "next/image";

export const InteractiveStorySection: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tutor Intro Header */}
        <div className="flex flex-col items-center text-center mb-24 sm:mb-32">
          {/* Diamond Mascot Mark */}
          <div className="w-10 h-10 rounded-xl bg-[#00872e] flex items-center justify-center text-white mb-6 shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-5 h-5"
            >
              <path d="M12 2L2 12l10 10 10-10L12 2z" />
            </svg>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#121212] tracking-tight">
            Tanishishing: <span className="italic font-serif">Koji</span>, sizning shaxsiy repetitoringiz
          </h2>
        </div>

        {/* Zig-Zag 1: Concepts that stick */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-24 sm:mb-32">
          {/* Left: Soft Sky Card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-[#edf4fb] border border-[#d7e6f6] p-6 sm:p-10 flex items-center justify-center overflow-hidden aspect-[4/3] relative">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              >
                <source src="/assets/videos/concepts-click-desktop.webm" type="video/webm" />
                <source src="/assets/videos/concepts-click-desktop.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          {/* Right: Text */}
          <div className="lg:col-span-6 flex flex-col items-start text-left lg:pl-6">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#121212] tracking-tight mb-4 font-serif">
              Xotirada muhrlanuvchi tushunchalar
            </h3>
            <p className="text-base sm:text-lg text-[#4b5563] leading-relaxed font-normal">
              Formulalarni shunchaki yodlash o&apos;rniga, interaktiv masalalarni o&apos;zingiz yechib, nima uchun aynan shunday ishlashini his qilasiz. Bu bilim uzoq yillar xotirangizda qoladi.
            </p>
          </div>
        </div>

        {/* Zig-Zag 2: Built to make you think */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-24 sm:mb-32">
          {/* Left: Text */}
          <div className="lg:col-span-6 order-2 lg:order-1 flex flex-col items-start text-left lg:pr-6">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#121212] tracking-tight mb-4 font-serif">
              Fikrlashga undovchi tuzilma
            </h3>
            <p className="text-base sm:text-lg text-[#4b5563] leading-relaxed font-normal">
              Tayyor javobni ko&apos;rsatadigan passiv videoma&apos;ruzalar emas. Har bir bosqichda sizga fikrlash, taxmin qilish va tajriba o&apos;tkazish imkonini beruvchi mini-vazifalar beriladi.
            </p>
          </div>

          {/* Right: Soft Peach Card */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="rounded-3xl bg-[#fbf3ea] border border-[#f2e2cf] p-6 sm:p-10 flex items-center justify-center overflow-hidden aspect-[4/3] relative">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              >
                <source src="/assets/videos/built-to-think-desktop.webm" type="video/webm" />
                <source src="/assets/videos/built-to-think-desktop.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>

        {/* Zig-Zag 3: Adapts to exactly where you are */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-24 sm:mb-32">
          {/* Left: Soft Mint Card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-[#eaf6ed] border border-[#d4edd9] p-6 sm:p-10 flex items-center justify-center overflow-hidden aspect-[4/3] relative">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              >
                <source src="/assets/videos/adapts-desktop.webm" type="video/webm" />
                <source src="/assets/videos/adapts-desktop.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          {/* Right: Text */}
          <div className="lg:col-span-6 flex flex-col items-start text-left lg:pl-6">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#121212] tracking-tight mb-4 font-serif">
              Aynan sizning darajangizga moslashadi
            </h3>
            <p className="text-base sm:text-lg text-[#4b5563] leading-relaxed font-normal">
              Sun&apos;iy intellektual repetitoringiz qaysi mavzularda qiynalayotganingizni aniqlaydi va sizga mos tushuntirishlar hamda yangi topshiriqlarni taqdim etadi.
            </p>
          </div>
        </div>

        {/* Zig-Zag 4: Designed to keep you learning */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left: Text */}
          <div className="lg:col-span-6 order-2 lg:order-1 flex flex-col items-start text-left lg:pr-6">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#121212] tracking-tight mb-4 font-serif">
              Davomiy o&apos;rganish odati
            </h3>
            <p className="text-base sm:text-lg text-[#4b5563] leading-relaxed font-normal">
              Kuniga atigi 15 daqiqa. Qisqa, qiziqarli va gamifikatsiyalashgan mashg&apos;ulotlar orqali odat shakllantirib, yillar davomida uzluksiz o&apos;sasiz.
            </p>
          </div>

          {/* Right: Soft Neutral Card */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="rounded-3xl bg-[#f7f7f5] border border-[#e5e5e2] p-6 sm:p-10 flex items-center justify-center overflow-hidden aspect-[4/3] relative">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              >
                <source src="/assets/videos/keep-learning-desktop.webm" type="video/webm" />
                <source src="/assets/videos/keep-learning-desktop.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
