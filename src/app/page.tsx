"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LandingPage } from "@/components/landing/LandingPage";

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // If user is already logged in, redirect to /home immediately
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/home");
    }
  }, [user, isLoading, router]);

  // While checking auth status or if user is logged in, show blank/smooth dark background
  if (isLoading || user) {
    return (
      <div className="min-h-screen bg-[#0E0E10] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-[#26B54F] border-t-transparent animate-spin" />
      </div>
    );
  }

  // If confirmed guest/unauthenticated, render the Landing Page
  return <LandingPage />;
}
