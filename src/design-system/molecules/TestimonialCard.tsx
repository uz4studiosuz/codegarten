import React from "react";
import Image from "next/image";
import { Star, ShieldCheck } from "lucide-react";
import { Testimonial } from "@/types/testimonial";

export interface TestimonialCardProps {
  testimonial: Testimonial;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-bg-card/80 backdrop-blur-md border border-border-subtle hover:border-brand-electric/40 transition-all duration-300 hover:shadow-glow group">
      <div>
        {/* Star rating */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star
              key={i}
              className="w-4 h-4 fill-accent-amber text-accent-amber"
            />
          ))}
          <span className="text-xs font-semibold text-accent-amber ml-2">
            5.0
          </span>
        </div>

        {/* Quote */}
        <p className="text-text-primary text-sm sm:text-base leading-relaxed mb-6 font-normal">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
      </div>

      {/* Author info */}
      <div className="flex items-center gap-3.5 pt-4 border-t border-border-subtle">
        <div className="relative w-11 h-11 rounded-full overflow-hidden border border-brand-electric/30 shrink-0 bg-bg-elevated">
          <Image
            src={testimonial.avatarUrl}
            alt={testimonial.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-white truncate">
              {testimonial.name}
            </span>
            <ShieldCheck className="w-4 h-4 text-accent-green shrink-0" />
          </div>
          <span className="text-xs text-text-secondary truncate">
            {testimonial.role} &bull; <span className="text-brand-light font-medium">{testimonial.companyOrSchool}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
