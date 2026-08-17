import React from "react";
import Link from "next/link";
import Image from "next/image";
import { footerLinks } from "@/data/navigation";
import {
  IconBrandGithub,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandYoutube,
} from "@tabler/icons-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0c0d0e] text-[#9ca3af] pt-16 pb-12 text-xs sm:text-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="col-span-2 flex flex-col items-start pr-4">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 group-hover:scale-105 transition-transform shrink-0">
                <Image
                  src="/Logo.svg"
                  alt="Codegarten"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Codegarten
              </span>
            </Link>

            <p className="text-xs text-[#6b7280] leading-relaxed max-w-sm mb-6">
              Dasturlash va kompyuter fanlarini interaktiv fikrlash va amaliyot orqali o&apos;rgatuvchi shaxsiy ta&apos;lim platformasi.
            </p>

            <div className="flex items-center gap-4 text-[#6b7280]">
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
                <IconBrandTwitter size={18} stroke={1.5} />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
                <IconBrandLinkedin size={18} stroke={1.5} />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="GitHub">
                <IconBrandGithub size={18} stroke={1.5} />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="YouTube">
                <IconBrandYoutube size={18} stroke={1.5} />
              </a>
            </div>
          </div>

          {/* Col 2: Curriculum */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-sans">
              O&apos;quv Dasturi
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.curriculum.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Features */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-sans">
              Imkoniyatlar
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.features.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Company */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-sans">
              Kompaniya
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-[#1f2937] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6b7280]">
          <p>&copy; 2026 Codegarten Inc. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Maxfiylik siyosati</a>
            <a href="#" className="hover:text-white transition-colors">Foydalanish shartlari</a>
            <a href="#" className="hover:text-white transition-colors">Yordam markazi</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
