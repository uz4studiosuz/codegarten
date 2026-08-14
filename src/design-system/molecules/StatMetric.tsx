import React from "react";

export interface StatMetricProps {
  value: string;
  label: string;
  subtext?: string;
  icon?: React.ReactNode;
  gradient?: "brand" | "emerald" | "amber";
}

export const StatMetric: React.FC<StatMetricProps> = ({
  value,
  label,
  subtext,
  icon,
  gradient = "brand",
}) => {
  const gradientStyles = {
    brand: "from-white via-white to-brand-electric",
    emerald: "from-white via-white to-accent-green",
    amber: "from-white via-white to-accent-amber",
  }[gradient];

  return (
    <div className="flex flex-col p-4 rounded-xl bg-bg-card/60 border border-border-subtle hover:border-border-medium transition-all">
      <div className="flex items-center gap-3 mb-1">
        {icon && <div className="text-brand-light">{icon}</div>}
        <span className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r ${gradientStyles} bg-clip-text text-transparent`}>
          {value}
        </span>
      </div>
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      {subtext && <span className="text-xs text-text-muted mt-0.5">{subtext}</span>}
    </div>
  );
};
