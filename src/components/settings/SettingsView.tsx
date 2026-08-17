"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconUser,
  IconShield,
  IconAdjustments,
  IconSparkles,
  IconInfoCircle,
  IconCheck,
  IconPlayerPlay,
  IconVolume,
  IconBell,
  IconTrash,
  IconCircleCheck,
  IconExternalLink,
  IconChevronRight,
  IconDeviceLaptop,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { mockUserProfile } from "@/data/mockCourseData";

export type SettingsTab = "account" | "premium" | "preferences";

export const SettingsView: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user: authUser } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  // Account State
  const [firstName, setFirstName] = useState(
    authUser?.name?.split(" ")[0] || "Abdulloh"
  );
  const [lastName, setLastName] = useState(
    authUser?.name?.split(" ")[1] || "Alimov"
  );
  const [email, setEmail] = useState(
    authUser?.phoneOrEmail || "uz4studiosuz@gmail.com"
  );
  const [isSavedPersonal, setIsSavedPersonal] = useState(false);
  const [showAddEmailModal, setShowAddEmailModal] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [connectedAccountSelected, setConnectedAccountSelected] = useState<
    string | null
  >("google");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  // Preferences State
  const [colorMode, setColorMode] = useState<"auto" | "light" | "dark">(
    theme === "dark" ? "dark" : "light"
  );
  const [reduceMotion, setReduceMotion] = useState<"on" | "off" | "auto">("auto");
  const [enableNarration, setEnableNarration] = useState(true);
  const [voiceType, setVoiceType] = useState<"melodic" | "deep">("melodic");
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);

  // Notifications State
  const [streakReminders, setStreakReminders] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [leagueReminders, setLeagueReminders] = useState(true);
  const [leagueAlerts, setLeagueAlerts] = useState(true);
  const [dailyPractice, setDailyPractice] = useState(true);
  const [courseRecommendations, setCourseRecommendations] = useState(true);
  const [monthlyNewsletters, setMonthlyNewsletters] = useState(true);
  const [contentLaunches, setContentLaunches] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [globalMute, setGlobalMute] = useState(false);

  // Sync colorMode with ThemeContext
  const handleColorModeChange = (mode: "auto" | "light" | "dark") => {
    setColorMode(mode);
    if (mode === "auto") {
      const isSystemDark =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(isSystemDark ? "dark" : "light");
    } else {
      setTheme(mode);
    }
  };

  const handleUpdatePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedPersonal(true);
    setTimeout(() => setIsSavedPersonal(false), 2000);
  };

  const handlePlayVoicePreview = () => {
    setIsPlayingVoice(true);
    // Simple mock audio feedback
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        voiceType === "melodic"
          ? "Codegarten platformasiga xush kelibsiz. Bugungi darsni boshlaymizmi?"
          : "Codegarten tizimi faol. Yangi algoritmik topshiriqqa tayyormisiz?"
      );
      utterance.rate = voiceType === "melodic" ? 1.05 : 0.95;
      utterance.pitch = voiceType === "melodic" ? 1.1 : 0.85;
      utterance.onend = () => setIsPlayingVoice(false);
      utterance.onerror = () => setIsPlayingVoice(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingVoice(false), 1500);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans transition-colors duration-200">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* ========================================================= */}
        {/* LEFT SIDEBAR: Tabs (Account, Premium, Preferences)       */}
        {/* ========================================================= */}
        <aside className="md:col-span-3">
          <div className="bg-white dark:bg-[#1F1F1F] rounded-[18px] border border-gray-200 dark:border-zinc-800 p-2 sm:p-2.5 shadow-xs sticky top-24">
            <nav className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("account")}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-left ${
                  activeTab === "account"
                    ? "bg-gray-100 dark:bg-zinc-800 text-black dark:text-white shadow-xs font-bold"
                    : "text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <span>Account</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("premium")}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-left ${
                  activeTab === "premium"
                    ? "bg-gray-100 dark:bg-zinc-800 text-black dark:text-white shadow-xs font-bold"
                    : "text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <span>Premium</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("preferences")}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-left ${
                  activeTab === "preferences"
                    ? "bg-gray-100 dark:bg-zinc-800 text-black dark:text-white shadow-xs font-bold"
                    : "text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <span>Preferences</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* RIGHT CONTENT AREA                                        */}
        {/* ========================================================= */}
        <main className="md:col-span-9 flex flex-col gap-10">
          {/* ────────────────────────────────────────────────────────── */}
          {/* TAB 1: ACCOUNT (Matching Screenshot 1)                    */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeTab === "account" && (
            <div className="space-y-10 animate-fadeIn">
              {/* 1. Personal info */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white tracking-tight">
                  Personal info
                </h2>

                <form
                  onSubmit={handleUpdatePersonalInfo}
                  className="space-y-4 max-w-xl"
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1.5">
                      First name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#161618] border border-gray-200 dark:border-zinc-700/80 rounded-xl text-black dark:text-white outline-none focus:border-[#22C55E] transition-colors"
                      placeholder="First name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1.5">
                      Last name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#161618] border border-gray-200 dark:border-zinc-700/80 rounded-xl text-black dark:text-white outline-none focus:border-[#22C55E] transition-colors"
                      placeholder="Last name"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 text-sm font-semibold transition-all active:scale-[0.99] cursor-pointer"
                  >
                    {isSavedPersonal ? "Saqlandi ✓" : "Update personal info"}
                  </button>
                </form>
              </section>

              {/* 2. Email address */}
              <section className="space-y-4 max-w-xl">
                <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white tracking-tight">
                  Email address
                </h2>

                <div className="relative flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#161618] border border-gray-200 dark:border-zinc-700/80 rounded-xl">
                  <span className="text-sm font-medium text-black dark:text-white font-mono truncate mr-2">
                    {email}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider bg-green-100 dark:bg-green-950/50 text-[#22C55E] dark:text-green-400 uppercase">
                      VERIFIED
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 uppercase">
                      PRIMARY
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddEmailModal(true)}
                  className="w-full py-2.5 rounded-xl bg-white dark:bg-zinc-100 border border-gray-200 dark:border-white text-black dark:text-black text-sm font-bold transition-all shadow-xs hover:bg-gray-50 active:scale-[0.99] cursor-pointer"
                >
                  Add another email
                </button>
              </section>

              {/* 3. Password */}
              <section className="space-y-4 max-w-xl">
                <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white tracking-tight">
                  Password
                </h2>

                <div className="bg-[#1e3a8a]/20 dark:bg-[#1e3a8a]/30 border border-[#3b82f6]/40 dark:border-[#3b82f6]/30 text-blue-900 dark:text-blue-200 rounded-[15px] p-4 flex items-start gap-3">
                  <IconInfoCircle size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    Your account doesn&apos;t have a password set. You sign in using social authentication.
                    If you&apos;d like to set a password, you can do so from your social connections page.
                  </p>
                </div>
              </section>

              {/* 4. Add a third party account */}
              <section className="space-y-3 max-w-xl">
                <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white tracking-tight">
                  Add a third party account
                </h2>

                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-semibold text-black dark:text-white">
                      Google
                    </span>
                    <button
                      type="button"
                      className="px-4 py-1.5 rounded-[12px] border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1F1F1F] text-xs font-bold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      Connect
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-semibold text-black dark:text-white">
                      Apple
                    </span>
                    <button
                      type="button"
                      className="px-4 py-1.5 rounded-[12px] border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1F1F1F] text-xs font-bold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      Connect
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-semibold text-black dark:text-white">
                      GitHub
                    </span>
                    <button
                      type="button"
                      className="px-4 py-1.5 rounded-[12px] border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1F1F1F] text-xs font-bold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </section>

              {/* 5. Connected accounts */}
              <section className="space-y-3 max-w-xl">
                <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white tracking-tight">
                  Connected accounts
                </h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  You can sign into your account using any of the following third party accounts:
                </p>

                <div className="space-y-3 pt-1">
                  <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 block">
                    Select account to remove:
                  </span>
                  <label className="flex items-center gap-2.5 text-xs text-black dark:text-white cursor-pointer select-none">
                    <input
                      type="radio"
                      name="connected_acc"
                      checked={connectedAccountSelected === "google"}
                      onChange={() => setConnectedAccountSelected("google")}
                      className="accent-[#22C55E]"
                    />
                    <span className="font-bold">Google</span>
                    <span className="text-gray-500 dark:text-zinc-400 font-mono">
                      {email}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-bold transition-all cursor-pointer"
                  >
                    Remove selected account
                  </button>
                </div>
              </section>

              {/* 6. Cookie settings */}
              <section className="space-y-3 max-w-xl">
                <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white tracking-tight">
                  Cookie settings
                </h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Manage your cookie preferences and privacy settings.
                </p>
                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-transparent hover:bg-gray-50 dark:hover:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 text-xs font-bold text-black dark:text-white transition-all cursor-pointer"
                >
                  Manage cookie settings
                </button>
              </section>

              {/* 7. Export your data */}
              <section className="space-y-3 max-w-xl">
                <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white tracking-tight">
                  Export your data
                </h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Start exporting your data regarding your usage of Codegarten.
                </p>
                <button
                  type="button"
                  onClick={() => setExportNotice(true)}
                  className="w-full py-2.5 rounded-xl bg-transparent hover:bg-gray-50 dark:hover:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 text-xs font-bold text-black dark:text-white transition-all cursor-pointer"
                >
                  {exportNotice ? "Yuklab olish boshlandi..." : "Start exporting your data"}
                </button>
              </section>

              {/* 8. Account Management */}
              <section className="space-y-2 max-w-xl pt-2 border-t border-gray-100 dark:border-zinc-800">
                <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white tracking-tight">
                  Account Management
                </h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  If you need to take a break or want to permanently delete your account, you can manage these options here.
                </p>
                <button
                  type="button"
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer pt-1"
                >
                  Deactivate or delete your account
                </button>
              </section>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* TAB 2: PREFERENCES (Matching Screenshot 2)                 */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeTab === "preferences" && (
            <div className="space-y-10 animate-fadeIn max-w-2xl">
              {/* 1. Appearance */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white tracking-tight">
                  Appearance
                </h2>

                <div className="space-y-3">
                  {/* Choose your preferred color mode */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
                    <span className="text-xs sm:text-sm font-semibold text-black dark:text-white">
                      Choose your preferred color mode
                    </span>

                    <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 self-start sm:self-auto">
                      {(["auto", "light", "dark"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleColorModeChange(m)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                            colorMode === m
                              ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                              : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reduce motion */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-t border-gray-100 dark:border-zinc-800/80">
                    <span className="text-xs sm:text-sm font-semibold text-black dark:text-white">
                      Reduce motion
                    </span>

                    <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 self-start sm:self-auto">
                      {(["on", "off", "auto"] as const).map((rm) => (
                        <button
                          key={rm}
                          type="button"
                          onClick={() => setReduceMotion(rm)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                            reduceMotion === rm
                              ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                              : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                          }`}
                        >
                          {rm}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Sounds */}
              <section className="space-y-4 pt-2 border-t border-gray-100 dark:border-zinc-800">
                <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white tracking-tight">
                  Sounds
                </h2>

                <div className="space-y-3">
                  {/* Enable Koji narration */}
                  <div className="flex items-center justify-between gap-4 py-2">
                    <span className="text-xs sm:text-sm font-semibold text-black dark:text-white">
                      Enable Koji narration in lessons
                    </span>
                    <button
                      type="button"
                      onClick={() => setEnableNarration(!enableNarration)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        enableNarration
                          ? "bg-[#22C55E]"
                          : "bg-gray-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          enableNarration ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Choose Koji's Voice */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-t border-gray-100 dark:border-zinc-800/80">
                    <span className="text-xs sm:text-sm font-semibold text-black dark:text-white">
                      Choose Koji&apos;s Voice
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePlayVoicePreview}
                        className={`w-8 h-8 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white hover:scale-105 transition-transform cursor-pointer ${
                          isPlayingVoice ? "animate-pulse border-[#22C55E]" : ""
                        }`}
                        title="Ovozni eshitib ko'rish"
                      >
                        <IconPlayerPlay size={15} className="fill-current" />
                      </button>

                      <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                        <button
                          type="button"
                          onClick={() => setVoiceType("melodic")}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            voiceType === "melodic"
                              ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                              : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                          }`}
                        >
                          Melodic
                        </button>
                        <button
                          type="button"
                          onClick={() => setVoiceType("deep")}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            voiceType === "deep"
                              ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                              : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                          }`}
                        >
                          Deep
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Enable sound effects */}
                  <div className="flex items-center justify-between gap-4 py-2 border-t border-gray-100 dark:border-zinc-800/80">
                    <span className="text-xs sm:text-sm font-semibold text-black dark:text-white">
                      Enable sound effects in lessons
                    </span>
                    <button
                      type="button"
                      onClick={() => setSoundEffects(!soundEffects)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        soundEffects
                          ? "bg-[#22C55E]"
                          : "bg-gray-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          soundEffects ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>

              {/* 3. Email notifications */}
              <section className="space-y-6 pt-2 border-t border-gray-100 dark:border-zinc-800">
                <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white tracking-tight">
                  Email notifications
                </h2>

                {/* Streaks */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-500 block">
                    Streaks
                  </span>
                  <div className="flex items-center justify-between gap-4 py-1.5">
                    <span className="text-xs sm:text-sm font-medium text-black dark:text-white">
                      Reminders (during the day)
                    </span>
                    <button
                      type="button"
                      onClick={() => setStreakReminders(!streakReminders)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        streakReminders && !globalMute
                          ? "bg-[#22C55E]"
                          : "bg-gray-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          streakReminders && !globalMute ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-1.5">
                    <span className="text-xs sm:text-sm font-medium text-black dark:text-white">
                      Alerts (warnings when your streak is about to expire)
                    </span>
                    <button
                      type="button"
                      onClick={() => setStreakAlerts(!streakAlerts)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        streakAlerts && !globalMute
                          ? "bg-[#22C55E]"
                          : "bg-gray-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          streakAlerts && !globalMute ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Leagues */}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-500 block">
                    Leagues
                  </span>
                  <div className="flex items-center justify-between gap-4 py-1.5">
                    <span className="text-xs sm:text-sm font-medium text-black dark:text-white">
                      Reminders (throughout the week)
                    </span>
                    <button
                      type="button"
                      onClick={() => setLeagueReminders(!leagueReminders)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        leagueReminders && !globalMute
                          ? "bg-[#22C55E]"
                          : "bg-gray-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          leagueReminders && !globalMute ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-1.5">
                    <span className="text-xs sm:text-sm font-medium text-black dark:text-white">
                      Alerts (sent when Leagues are closing, or you&apos;re at risk of demotion)
                    </span>
                    <button
                      type="button"
                      onClick={() => setLeagueAlerts(!leagueAlerts)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        leagueAlerts && !globalMute
                          ? "bg-[#22C55E]"
                          : "bg-gray-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          leagueAlerts && !globalMute ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Learning Reminders */}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-500 block">
                    Learning Reminders
                  </span>
                  <div className="flex items-center justify-between gap-4 py-1.5">
                    <span className="text-xs sm:text-sm font-medium text-black dark:text-white">
                      Daily practice
                    </span>
                    <button
                      type="button"
                      onClick={() => setDailyPractice(!dailyPractice)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        dailyPractice && !globalMute
                          ? "bg-[#22C55E]"
                          : "bg-gray-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          dailyPractice && !globalMute ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-1.5">
                    <span className="text-xs sm:text-sm font-medium text-black dark:text-white">
                      Personalized course recommendations
                    </span>
                    <button
                      type="button"
                      onClick={() => setCourseRecommendations(!courseRecommendations)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        courseRecommendations && !globalMute
                          ? "bg-[#22C55E]"
                          : "bg-gray-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          courseRecommendations && !globalMute ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* News and Announcements */}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-500 block">
                    News and Announcements
                  </span>
                  <div className="flex items-center justify-between gap-4 py-1.5">
                    <span className="text-xs sm:text-sm font-medium text-black dark:text-white">
                      Monthly newsletters
                    </span>
                    <button
                      type="button"
                      onClick={() => setMonthlyNewsletters(!monthlyNewsletters)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        monthlyNewsletters && !globalMute
                          ? "bg-[#22C55E]"
                          : "bg-gray-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          monthlyNewsletters && !globalMute ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-1.5">
                    <span className="text-xs sm:text-sm font-medium text-black dark:text-white">
                      Content launches
                    </span>
                    <button
                      type="button"
                      onClick={() => setContentLaunches(!contentLaunches)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        contentLaunches && !globalMute
                          ? "bg-[#22C55E]"
                          : "bg-gray-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          contentLaunches && !globalMute ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-1.5">
                    <span className="text-xs sm:text-sm font-medium text-black dark:text-white">
                      Promotions
                    </span>
                    <button
                      type="button"
                      onClick={() => setPromotions(!promotions)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        promotions && !globalMute
                          ? "bg-[#22C55E]"
                          : "bg-gray-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          promotions && !globalMute ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Global Settings */}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-500 block">
                    Global Settings
                  </span>
                  <div className="flex items-start justify-between gap-4 py-1.5">
                    <span className="text-xs sm:text-sm font-medium text-black dark:text-white leading-relaxed">
                      Don&apos;t send me anything (aside from vital account emails such as password reset notifications)
                    </span>
                    <button
                      type="button"
                      onClick={() => setGlobalMute(!globalMute)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-0.5 ${
                        globalMute
                          ? "bg-[#22C55E]"
                          : "bg-gray-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          globalMute ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* TAB 3: PREMIUM                                            */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeTab === "premium" && (
            <div className="space-y-8 animate-fadeIn max-w-2xl">
              <div>
                <span className="text-xs font-extrabold font-mono tracking-widest text-[#22C55E] uppercase block mb-1">
                  CODEGARTEN PRO
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
                  Cheksiz Ta&apos;lim Imkoniyati
                </h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                  Barcha amaliy kurslar, AI repetitor va algoritmlar vizualizatoriga cheksiz kirish.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#1F1F1F] rounded-[15px] border-2 border-[#22C55E] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#22C55E] text-white">
                    TAVSIYA
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white mb-1">
                      Yillik Obuna
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">
                      Eng tejamkor va to&apos;liq yo&apos;l
                    </p>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-extrabold text-black dark:text-white">
                        $7.99
                      </span>
                      <span className="text-xs text-gray-500">/ oyiga</span>
                    </div>
                    <ul className="space-y-2 text-xs text-gray-700 dark:text-zinc-300 mb-6">
                      <li className="flex items-center gap-2">
                        <IconCheck size={16} className="text-[#22C55E]" />
                        <span>Barcha 12+ premium kurslar</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <IconCheck size={16} className="text-[#22C55E]" />
                        <span>Cheksiz AI yordamchi maslahatlari</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <IconCheck size={16} className="text-[#22C55E]" />
                        <span>Offline rejim & sertifikatlar</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    className="w-full py-3 rounded-[15px] bg-[#22C55E] hover:bg-[#16a34a] text-white text-xs font-bold transition-all shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    Yillik tarifni tanlash
                  </button>
                </div>

                <div className="bg-white dark:bg-[#1F1F1F] rounded-[15px] border-2 border-gray-200 dark:border-zinc-800 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white mb-1">
                      Oylik Obuna
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">
                      Istalgan payt bekor qilish mumkin
                    </p>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-extrabold text-black dark:text-white">
                        $14.99
                      </span>
                      <span className="text-xs text-gray-500">/ oyiga</span>
                    </div>
                    <ul className="space-y-2 text-xs text-gray-700 dark:text-zinc-300 mb-6">
                      <li className="flex items-center gap-2">
                        <IconCheck size={16} className="text-[#22C55E]" />
                        <span>Barcha kurslarga to&apos;liq kirish</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <IconCheck size={16} className="text-[#22C55E]" />
                        <span>Interaktiv sinovlar</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    className="w-full py-3 rounded-[15px] border-2 border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-black dark:text-white text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Oylik tarifni tanlash
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FOOTER LINKS (Matching Screenshots bottom)               */}
          {/* ========================================================= */}
          <footer className="pt-8 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap items-center gap-6 text-xs text-gray-500 dark:text-zinc-400">
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
              About us
            </Link>
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
              Careers
            </Link>
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
              Educators
            </Link>
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
              Help
            </Link>
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
              Legal
            </Link>
            <Link
              href="/"
              className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 font-medium"
            >
              <span>Privacy</span>
              <span className="text-[10px]">&nearr;</span>
            </Link>
          </footer>
        </main>
      </div>

      {/* Add Email Modal */}
      {showAddEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddEmailModal(false)}
          />
          <div className="relative bg-white dark:bg-[#1c1c1e] text-black dark:text-white rounded-[15px] p-6 max-w-sm w-full z-10 border-2 border-gray-200 dark:border-zinc-800 shadow-2xl animate-scaleIn">
            <h3 className="text-lg font-bold mb-2">Boshqa email qo&apos;shish</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">
              Hisobingizga qo&apos;shimcha email manzilini biriktiring.
            </p>
            <input
              type="email"
              value={newEmailInput}
              onChange={(e) => setNewEmailInput(e.target.value)}
              placeholder="example@mail.com"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-[12px] mb-4 outline-none focus:border-[#22C55E]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddEmailModal(false)}
                className="flex-1 py-2.5 rounded-[12px] bg-gray-100 dark:bg-zinc-800 text-xs font-bold cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newEmailInput.trim()) {
                    setEmail(newEmailInput.trim());
                    setShowAddEmailModal(false);
                    setNewEmailInput("");
                  }
                }}
                className="flex-1 py-2.5 rounded-[12px] bg-[#22C55E] text-white text-xs font-bold cursor-pointer"
              >
                Qo&apos;shish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Connection Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white dark:bg-[#1c1c1e] text-black dark:text-white rounded-[15px] p-6 max-w-sm w-full z-10 border-2 border-gray-200 dark:border-zinc-800 shadow-2xl animate-scaleIn">
            <h3 className="text-lg font-bold mb-2">Hisobni ajratish</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">
              Haqiqatan ham Google akkauntini ushbu profildan uzmoqchimisiz?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-[12px] bg-gray-100 dark:bg-zinc-800 text-xs font-bold cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => {
                  setConnectedAccountSelected(null);
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-[12px] bg-red-600 text-white text-xs font-bold cursor-pointer"
              >
                O&apos;chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
