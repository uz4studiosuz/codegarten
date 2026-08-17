"use client";

import React, { useState } from "react";
import {
  IconX,
  IconMoon,
  IconSun,
  IconUser,
  IconBell,
  IconShield,
  IconCheck,
} from "@tabler/icons-react";
import { useTheme } from "@/context/ThemeContext";
import { UserProfileMock } from "@/data/mockCourseData";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfileMock;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const { theme, setTheme } = useTheme();
  const [userName, setUserName] = useState(user.name);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] text-[#000000] dark:text-white rounded-[32px] shadow-2xl p-6 sm:p-8 border border-gray-100 dark:border-zinc-800 z-10 animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <IconX size={16} stroke={2} />
        </button>

        <h3 className="text-xl font-extrabold mb-5">Sozlamalar</h3>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Tizim ko&apos;rinishi (Mavzu)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`py-3 px-4 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  theme === "light"
                    ? "border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]"
                    : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                <IconSun size={16} stroke={2} className="text-amber-500" />
                <span>Kunduzgi (Light)</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`py-3 px-4 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  theme === "dark"
                    ? "border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]"
                    : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                <IconMoon size={16} stroke={2} className="text-purple-400" />
                <span>Tungi (Dark)</span>
              </button>
            </div>
          </div>

          {/* Profile Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              Ism
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-2xl outline-none focus:border-[#22C55E]"
            />
          </div>

          {/* Audio toggle */}
          <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <IconBell size={16} stroke={2} className="text-gray-400" />
              <span>Ovozli effektlar</span>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                soundEnabled ? "bg-[#22C55E]" : "bg-gray-300 dark:bg-zinc-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  soundEnabled ? "left-5" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#22C55E] hover:bg-[#16a34a] text-white text-sm font-bold shadow-md transition-all active:scale-[0.99] cursor-pointer mt-2"
          >
            {isSaved ? "Saqlandi!" : "Saqlash"}
          </button>
        </form>
      </div>
    </div>
  );
};

