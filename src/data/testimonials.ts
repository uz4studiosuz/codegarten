import { Testimonial, MetricItem } from "@/types/testimonial";

export const testimonialsData: Testimonial[] = [
  {
    id: "test-1",
    name: "Aaron Miller",
    role: "Senior Software Engineer",
    companyOrSchool: "Google",
    avatarUrl: "/assets/aaron.png",
    quote: "Codegarten menga passiv video ko'rishdan ko'ra 10 barobar tezroq o'rganish imkonini berdi. Algoritmlarni o'z qo'lim bilan boshqarib ko'rish butunlay yangi tushuncha bag'ishladi.",
    rating: 5,
    highlightSkill: "Algorithms & Distributed Systems",
  },
  {
    id: "test-2",
    name: "Arianne Vance",
    role: "Full-Stack Developer",
    companyOrSchool: "Stripe",
    avatarUrl: "/assets/arianne.png",
    quote: "React Internals va Server Componentlarining qanday ishlashini tushunish uchun Codegarten interaktiv modullari eng yaxshi manba bo'ldi. Har kuni 15 daqiqa kifoya qilmoqda.",
    rating: 5,
    highlightSkill: "React Internals & Architecture",
  },
  {
    id: "test-3",
    name: "Noah Chen",
    role: "AI Research Fellow",
    companyOrSchool: "MIT",
    avatarUrl: "/assets/noah.png",
    quote: "Transformerlarning Attention mexanizmini animatsiyalar bilan qatlam-ma-qatlam ko'rish nazariyani hayotga tatbiq etishda eng to'g'ri yondashuvdir. Haqiqiy muhandislar uchun yaratilgan.",
    rating: 5,
    highlightSkill: "Transformers & LLMs",
  },
  {
    id: "test-4",
    name: "Eliza Rostova",
    role: "Frontend Architect",
    companyOrSchool: "Meta",
    avatarUrl: "/assets/eliza.png",
    quote: "Mening jamoamdagi junior va middle dasturchilar uchun Codegarten majburiy mashg'ulotga aylandi. Biz 3 oyda intervyulardan o'tish ko'rsatkichimizni 85% ga oshirdik.",
    rating: 5,
    highlightSkill: "System Design",
  },
  {
    id: "test-5",
    name: "Tyler Jenkins",
    role: "CS Student",
    companyOrSchool: "Stanford University",
    avatarUrl: "/assets/tyler.png",
    quote: "Universitet darsliklarida yuzlab sahifali formulalar o'rniga, bu platformadagi interaktiv tajribalar orqali muammolarni darhol his qildim. Aql bovar qilmas darajada toza dizayn!",
    rating: 5,
    highlightSkill: "CS Foundations",
  },
];

export const platformMetrics: MetricItem[] = [
  {
    value: "250,000+",
    label: "Faol O'rganuvchilar",
    subtext: "Dunyodagi 120 dan ortiq mamlakatda",
  },
  {
    value: "10M+",
    label: "Yechilgan Interaktiv Vazifalar",
    subtext: "Har kuni yangilanib boradigan bazada",
  },
  {
    value: "98.4%",
    label: "Tushunchani Eslab Qolish",
    subtext: "Passiv videolarga nisbatan 6 barobar yuqori",
  },
  {
    value: "4.9 / 5.0",
    label: "Foydalanuvchilar Bahosi",
    subtext: "15,000+ dasturchilar reytingi",
  },
];
