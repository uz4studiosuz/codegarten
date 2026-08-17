import type { Metadata, Viewport } from "next";
import { Outfit, Lora, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Codegarten | Your Personal Tutor for Computer Science and Coding",
  description:
    "A personalized, interactive tutor that builds deep intuition for CS, algorithms, React internals, and AI through active problem-solving.",
  icons: {
    icon: "/Logo.svg",
    shortcut: "/Logo.svg",
    apple: "/Logo.svg",
  },
  keywords: [
    "Codegarten",
    "Brilliant style learning",
    "Interactive coding",
    "Computer Science tutor",
    "Algorithms",
    "Data Structures",
    "Learn by doing",
  ],
  authors: [{ name: "Codegarten Team" }],
  openGraph: {
    title: "Codegarten — Your Personal Coding Tutor",
    description:
      "A personalized, interactive tutor that builds deep intuition for STEM and software engineering.",
    type: "website",
    locale: "uz_UZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${outfit.variable} ${lora.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-white text-ink font-sans min-h-screen antialiased selection:bg-brand-light selection:text-brand">
        {children}
      </body>
    </html>
  );
}
