import React from "react";
import { Container } from "@/design-system/primitives/Container";
import { Badge } from "@/design-system/primitives/Badge";
import { TestimonialCard } from "@/design-system/molecules/TestimonialCard";
import { testimonialsData } from "@/data/testimonials";
import { IconHeartFilled, IconStarFilled } from "@tabler/icons-react";

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 md:py-28 relative bg-bg-canvas border-t border-border-subtle overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-electric/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      <Container size="xl">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <Badge variant="glow" size="md" className="mb-4">
            <IconHeartFilled size={14} className="mr-1 text-accent-red" />
            Hamjamiyat Fikri
          </Badge>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Dunyo muhandislari{" "}
            <span className="text-gradient-emerald">Codegarten haqida</span>
          </h2>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Google, Stripe, Meta va eng nufuzli universitetlar talabalari o&apos;z bilimlari va intervyu tayyorgarligini biz bilan oshirmoqda.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonialsData.map((test) => (
            <TestimonialCard key={test.id} testimonial={test} />
          ))}
        </div>
      </Container>
    </section>
  );
};
