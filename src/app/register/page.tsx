import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = {
  title: "Ro'yxatdan o'tish | Codegarten",
  description: "Codegarten platformasida yangi hisob oching va amaliy CS ta'limini boshlang.",
};

export default function RegisterPage() {
  return <AuthCard initialMode="register" />;
}
