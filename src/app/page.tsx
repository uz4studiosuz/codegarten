"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LandingPage } from "@/components/landing/LandingPage";

export default function RootPage() {
  const { user } = useAuth();
  const router = useRouter();

  // If user is already logged in, redirect to /home
  useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [user, router]);

  // If not logged in, render the full Landing Page
  return <LandingPage />;
}
