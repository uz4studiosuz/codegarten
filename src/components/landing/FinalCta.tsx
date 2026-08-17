"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/design-system/primitives/Container";
import { Button } from "@/design-system/primitives/Button";
import { Badge } from "@/design-system/primitives/Badge";
import { IconArrowRight, IconSparkles, IconCode, IconFlame } from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";

export const FinalCta: React.FC = () => {
  const { openAuthModal } = useAuth();

  return (
    <section className="py-20 md:py-28 relative bg-bg-canvas overflow-hidden">
      <Container size="xl">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#17224d] via-[#101422] to-[#122824] border border-brand-electric/40 p-8 sm:p-14 lg:p-20 text-center shadow-deep overflow-hidden">
          {/* Ambient center flare */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-brand-electric/25 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <Badge variant="glow" size="md" className="mb-6">
              <IconSparkles size={14} className="mr-1.5 text-accent-green" />
              Bugundan O&apos;rganishni Boshlang
            </Badge>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
              Kelajak dasturchilari video tomosha qilmaydi.{" "}
              <span className="text-gradient-emerald block mt-2">
                Ular amalda yaratadi.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-10 max-w-2xl">
              250,000 dan ortiq muhandislarga qo&apos;shiling va kompyuter fanlarining fundamental modellarini interaktiv kashf qiling.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
              <Link href="/register">
                <Button
                  size="xl"
                  variant="gradient"
                  className="w-full sm:w-auto px-10 py-5 text-lg shadow-glow-lg"
                  rightIcon={<IconArrowRight size={20} stroke={2} />}
                >
                  Bepul Hisob Yaratish
                </Button>
              </Link>
            </div>

            <p className="text-xs text-text-muted mt-6">
              Kredit karta talab etilmaydi &bull; 1 daqiqada boshlash mumkin
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};
