"use client";

import React from "react";
import Link from "next/link";
import { useVocabulary } from "@/context/VocabularyContext";
import { NAV_TABS, type NavTabKey } from "./navTabs";

/**
 * Mobile tab bar
 * --------------
 * On a phone the primary tabs used to sit in the header as three unlabelled
 * icons, next to the logo, the streak pill and the menu button — the busiest and
 * least reachable corner of the screen. They move to a floating bar at the bottom
 * instead: thumb-height, labelled, one clearly filled tab.
 *
 * Same source of truth as the header (`navTabs.ts`), so the two can never drift,
 * and the same tokens as the rest of the product: the brand green at 12% for the
 * active pill, the card surface and border, a full-round radius.
 */
export function MobileTabBar({ activeTab }: { activeTab?: NavTabKey | "settings" }) {
  const { count } = useVocabulary();

  return (
    <nav
      aria-label="Asosiy bo'limlar"
      /* Fixed, and hidden from sm up where the header tabs take over. */
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
    >
      <div
        className="pointer-events-auto mx-3 mb-3 rounded-[24px] border border-gray-200/80 dark:border-[#27272a] bg-white/95 dark:bg-[#1F1F1F]/95 backdrop-blur-xl shadow-[0_6px_28px_rgba(0,0,0,0.12)] dark:shadow-[0_6px_28px_rgba(0,0,0,0.5)]"
        /* Keeps the bar clear of the home indicator on notched phones. */
        style={{ marginBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-stretch px-1.5 py-2">
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            /* The learner's saved-word count is the one number worth a badge. */
            const badge = tab.key === "vocabulary" && count > 0 ? count : 0;

            return (
              <Link
                key={tab.key}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className="flex-1 flex flex-col items-center gap-1 rounded-[18px] py-1 select-none active:scale-[0.97] transition-transform"
              >
                <span
                  className={`relative flex items-center justify-center w-[54px] h-[28px] rounded-full transition-colors ${
                    isActive
                      ? "bg-[#26B54F]/15 text-[#1a8a3c] dark:text-[#4ADE80]"
                      : "text-gray-500 dark:text-[#8b8b93]"
                  }`}
                >
                  <tab.Icon size={20} stroke={isActive ? 2.4 : 2} />
                  {badge > 0 && (
                    <span className="absolute -top-0.5 right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-[#26B54F] text-white text-[9.5px] font-bold leading-[15px] text-center">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </span>
                <span
                  className={`text-[10.5px] leading-none tracking-tight ${
                    isActive
                      ? "font-bold text-[#1a8a3c] dark:text-[#4ADE80]"
                      : "font-semibold text-gray-500 dark:text-[#8b8b93]"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
