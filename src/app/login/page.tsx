import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = {
  title: "Kirish | Codegarten",
  description: "Codegarten hisobingizga kiring va interaktiv dasturlash darslarini davom ettiring.",
};

export default function LoginPage() {
  return <AuthCard initialMode="login" />;
}
