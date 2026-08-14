export interface Testimonial {
  id: string;
  name: string;
  role: string;
  companyOrSchool: string;
  avatarUrl: string;
  quote: string;
  rating: number;
  highlightSkill: string;
}

export interface MetricItem {
  value: string;
  label: string;
  subtext: string;
}
