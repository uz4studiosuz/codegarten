"use client";

import React from "react";
import { AppNavbar } from "@/components/dashboard/AppNavbar";
import { WriterWorkspace } from "@/components/writer/WriterWorkspace";

/**
 * Authoring tool. All the state and layout live in WriterWorkspace; this page
 * only supplies the app chrome so the writer feels like part of the product.
 */
export default function WriterPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#141414] text-black dark:text-white flex flex-col font-sans pb-[92px] sm:pb-0">
      <AppNavbar />
      <WriterWorkspace />
    </div>
  );
}
