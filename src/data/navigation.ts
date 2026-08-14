export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export const navItems: NavItem[] = [
  { label: "O'quv Treklar", href: "#tracks" },
  { label: "Interaktiv Vidjet", href: "#interactive-demo" },
  { label: "Nima uchun Codegarten?", href: "#why-codegarten" },
  { label: "Natijalar", href: "#testimonials" },
  { label: "Tariflar", href: "#pricing" },
];

export const footerLinks = {
  curriculum: [
    { label: "Computer Science", href: "#tracks" },
    { label: "Algoritmik Fikrlash", href: "#tracks" },
    { label: "React & Next.js Internals", href: "#tracks" },
    { label: "AI & Transformerlar", href: "#tracks" },
    { label: "System Design", href: "#tracks" },
  ],
  features: [
    { label: "Interaktiv Sandbox", href: "#interactive-demo" },
    { label: "Kunlik Streaklar", href: "#habit-engine" },
    { label: "Mobil Ilova", href: "#mobile-app" },
    { label: "Yechimlar Tahlili", href: "#interactive-demo" },
    { label: "Sertifikatlash", href: "#pricing" },
  ],
  company: [
    { label: "Biz Haqimizda", href: "#" },
    { label: "Karyera", href: "#" },
    { label: "Blog & Texnik Maqolalar", href: "#" },
    { label: "Aloqa", href: "#" },
    { label: "Maxfiylik Siyosati", href: "#" },
  ],
};
