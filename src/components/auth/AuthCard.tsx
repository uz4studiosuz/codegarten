"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  IconMessage,
  IconSend,
  IconEye,
  IconEyeOff,
  IconCircleCheck,
  IconMail,
  IconPhone,
  IconArrowLeft,
  IconCalendar,
  IconMapPin,
  IconChevronDown,
  IconUser,
  IconSparkles,
  IconLock,
} from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";
import { UZBEKISTAN_REGIONS } from "@/data/regionsData";

interface AuthCardProps {
  initialMode?: "login" | "register";
}

export const AuthCard: React.FC<AuthCardProps> = ({ initialMode = "login" }) => {
  const router = useRouter();
  const { login, user } = useAuth();

  const [mode, setMode] = useState<"login" | "register" | "verify" | "profile">(initialMode);
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [method, setMethod] = useState<"sms" | "telegram">("sms");

  // Registration flow tracker
  const [isRegisteringFlow, setIsRegisteringFlow] = useState(initialMode === "register");

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Profile completion states
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [birthDate, setBirthDate] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(45);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If already logged in, redirect to /home
  useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [user, router]);

  // OTP timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === "verify" && timer > 0 && !isVerifiedSuccess) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timer, isVerifiedSuccess]);

  // Find districts for currently selected region
  const currentRegion = UZBEKISTAN_REGIONS.find((r) => r.id === selectedRegionId);

  // Handle Form Submit (Login / Register)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (mode === "register" && !agreedTerms) {
      setErrorMessage("Foydalanish shartlariga rozilik bildirishingiz lozim.");
      return;
    }

    if (mode === "register") {
      setIsRegisteringFlow(true);
    } else {
      setIsRegisteringFlow(false);
    }

    if (tab === "phone") {
      if (!phone || phone.trim().length < 7) {
        setErrorMessage("Iltimos, to'g'ri telefon raqam kiriting.");
        return;
      }
      if (mode === "register" && password && password !== confirmPassword) {
        setErrorMessage("Parollar bir-biriga mos kelmadi.");
        return;
      }

      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setMode("verify");
        setTimer(45);
        setOtpDigits(Array(6).fill(""));
      }, 600);
    } else {
      // Email submit
      if (!email || !email.includes("@")) {
        setErrorMessage("Iltimos, haqiqiy email manzilini kiriting.");
        return;
      }
      if (!password) {
        setErrorMessage("Iltimos, parolingizni kiriting.");
        return;
      }
      if (mode === "register" && password !== confirmPassword) {
        setErrorMessage("Parollar bir-biriga mos kelmadi.");
        return;
      }

      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        if (mode === "register") {
          setMode("profile");
        } else {
          completeAuth(
            firstName ? `${firstName} ${lastName}`.trim() : email.split("@")[0],
            email
          );
        }
      }, 600);
    }
  };

  // OTP Change handler
  const handleOtpChange = (index: number, value: string) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otpDigits];
      newOtp[index] = value.slice(-1);
      setOtpDigits(newOtp);

      if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpDigits(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  // Verify OTP submit
  const handleVerifyOtp = () => {
    const code = otpDigits.join("");
    if (code.length < 6) {
      setErrorMessage("Iltimos, 6 xonali tasdiqlash kodini to'liq kiriting.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      if (isRegisteringFlow) {
        setMode("profile");
      } else {
        setIsVerifiedSuccess(true);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });

        setTimeout(() => {
          completeAuth(
            firstName ? `${firstName} ${lastName}`.trim() : "Abdulloh",
            `+998 ${phone}`
          );
        }, 800);
      }
    }, 600);
  };

  // Complete Profile Onboarding Submit
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!firstName.trim()) {
      setErrorMessage("Iltimos, ismingizni kiriting.");
      return;
    }
    if (!gender) {
      setErrorMessage("Iltimos, jinsingizni tanlang.");
      return;
    }
    if (!selectedRegionId) {
      setErrorMessage("Iltimos, viloyatingizni tanlang.");
      return;
    }
    if (!selectedDistrict) {
      setErrorMessage("Iltimos, tuman yoki shahringizni tanlang.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      const selectedRegionName = currentRegion?.name || "";
      login({
        name: firstName.trim(),
        lastName: lastName.trim(),
        gender: gender as "male" | "female",
        birthDate,
        region: selectedRegionName,
        district: selectedDistrict,
        phoneOrEmail: phone ? `+998 ${phone}` : email || "abdulloh@codegarten.uz",
      });

      setTimeout(() => {
        router.push("/home");
      }, 800);
    }, 600);
  };

  const completeAuth = (name: string, phoneOrEmail: string) => {
    login({
      name: name || "Abdulloh",
      phoneOrEmail,
    });
    router.push("/home");
  };

  const resendCode = () => {
    setTimer(45);
    setOtpDigits(Array(6).fill(""));
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-black dark:text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans transition-colors duration-200">
      {/* Top Bar Back link to Landing */}
      <div className="w-full max-w-[480px] mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <IconArrowLeft size={16} stroke={2} />
          <span>Bosh sahifaga qaytish</span>
        </Link>

        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6">
            <Image
              src="/Logo.svg"
              alt="Codegarten"
              width={24}
              height={24}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-sm font-bold tracking-tight text-black dark:text-white">
            Codegarten
          </span>
        </Link>
      </div>

      {/* Main Minimalist Auth Card */}
      <div className="relative w-full max-w-[480px] bg-white dark:bg-[#1C1C1E] text-black dark:text-white rounded-[28px] sm:rounded-[32px] shadow-xl p-6 sm:p-9 border border-gray-200 dark:border-zinc-800 transition-colors">
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative flex items-center justify-center mb-3">
            <div className="absolute w-16 h-16 bg-[#22C55E]/20 rounded-full blur-xl pointer-events-none" />
            <div className="relative w-12 h-12">
              <Image
                src="/Logo.svg"
                alt="Codegarten Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain drop-shadow-md"
                priority
              />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight text-center">
            {mode === "profile"
              ? "Profilingizni to'ldiring"
              : mode === "login"
              ? "Xush kelibsiz!"
              : mode === "register"
              ? "Ro'yxatdan o'tish"
              : "Tasdiqlash"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 text-center mt-1 max-w-sm">
            {mode === "profile"
              ? "Codegarten imkoniyatlaridan to'liq foydalanish uchun ma'lumotlaringizni to'ldiring"
              : mode === "login"
              ? "Codegarten hisobingizga kiring va darslarni davom ettiring"
              : mode === "register"
              ? "Yangi hisob oching va amaliy ta'limni boshlang"
              : "Telefoningizga yuborilgan 6 xonali kodni kiriting"}
          </p>
        </div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* MODE 1: COMPLETE PROFILE ONBOARDING                       */}
        {/* ────────────────────────────────────────────────────────── */}
        {mode === "profile" ? (
          <form onSubmit={handleProfileSubmit} className="space-y-3.5 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Ismingiz *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ali"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-black dark:text-white outline-none focus:border-[#22C55E] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Familiyangiz
                </label>
                <input
                  type="text"
                  placeholder="Valiyev"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-black dark:text-white outline-none focus:border-[#22C55E] transition-colors"
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Jinsingiz *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gender === "male"
                      ? "border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]"
                      : "border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
                  }`}
                >
                  <span>Erkak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gender === "female"
                      ? "border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]"
                      : "border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
                  }`}
                >
                  <span>Ayol</span>
                </button>
              </div>
            </div>

            {/* Birth date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Tug&apos;ilgan sana
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-black dark:text-white outline-none focus:border-[#22C55E] transition-colors"
              />
            </div>

            {/* Region & District dropdowns */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Viloyat *
                </label>
                <select
                  value={selectedRegionId}
                  onChange={(e) => {
                    setSelectedRegionId(e.target.value);
                    setSelectedDistrict("");
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-black dark:text-white outline-none focus:border-[#22C55E]"
                >
                  <option value="">Tanlang</option>
                  {UZBEKISTAN_REGIONS.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Tuman / Shahar *
                </label>
                <select
                  disabled={!selectedRegionId}
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-black dark:text-white outline-none focus:border-[#22C55E] disabled:opacity-50"
                >
                  <option value="">Tanlang</option>
                  {currentRegion?.districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-500 dark:text-red-400 font-medium">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary-tactile w-full py-3 text-xs sm:text-sm font-bold mt-2"
            >
              {isSubmitting ? "Saqlanmoqda..." : "Tamomlash & Boshlash"}
            </button>
          </form>
        ) : mode === "verify" ? (
          /* ────────────────────────────────────────────────────────── */
          /* MODE 2: OTP VERIFICATION                                  */
          /* ────────────────────────────────────────────────────────── */
          <div className="space-y-5 animate-fadeIn">
            <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-200 dark:border-zinc-700/60 flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-black dark:text-white">
                +998 {phone}
              </span>
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-xs text-[#22C55E] hover:underline font-semibold cursor-pointer"
              >
                O&apos;zgartirish
              </button>
            </div>

            {/* 6 Digit OTP Inputs */}
            <div>
              <div
                className="flex items-center justify-between gap-1.5 sm:gap-2"
                onPaste={handleOtpPaste}
              >
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-bold rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-black dark:text-white outline-none focus:border-[#22C55E] transition-all"
                  />
                ))}
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-500 dark:text-red-400 font-medium text-center">
                {errorMessage}
              </p>
            )}

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isSubmitting}
              className="btn-primary-tactile w-full py-3 text-xs sm:text-sm font-bold"
            >
              {isSubmitting ? "Tekshirilmoqda..." : "Tasdiqlash"}
            </button>

            {/* Timer & Resend */}
            <div className="text-center text-xs text-gray-500 dark:text-zinc-400">
              {timer > 0 ? (
                <span>Qayta yuborish: {timer} soniya</span>
              ) : (
                <button
                  type="button"
                  onClick={resendCode}
                  className="text-[#22C55E] hover:underline font-semibold cursor-pointer"
                >
                  Kodni qayta yuborish
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ────────────────────────────────────────────────────────── */
          /* MODE 3: LOGIN / REGISTER MAIN FORM                        */
          /* ────────────────────────────────────────────────────────── */
          <div className="space-y-4">
            {/* Phone vs Email Switcher */}
            <div className="p-1 rounded-2xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => {
                  setTab("phone");
                  setErrorMessage("");
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === "phone"
                    ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                    : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <IconPhone size={15} stroke={2} />
                <span>Telefon</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab("email");
                  setErrorMessage("");
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === "email"
                    ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                    : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <IconMail size={15} stroke={2} />
                <span>Email</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {tab === "phone" ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Telefon raqamingiz
                  </label>
                  <div className="flex items-center rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 overflow-hidden focus-within:border-[#22C55E] transition-colors">
                    <span className="px-3 py-2.5 text-xs sm:text-sm font-mono font-bold text-gray-500 dark:text-zinc-400 border-r border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800/80 select-none">
                      +998
                    </span>
                    <input
                      type="tel"
                      placeholder="90 123 45 67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs sm:text-sm bg-transparent text-black dark:text-white font-mono outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Email manzilingiz
                  </label>
                  <input
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-black dark:text-white outline-none focus:border-[#22C55E] transition-colors"
                  />
                </div>
              )}

              {/* Password field (for email tab or register mode) */}
              {(tab === "email" || mode === "register") && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Parol
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-black dark:text-white outline-none focus:border-[#22C55E] transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                    >
                      {showPassword ? <IconEyeOff size={16} stroke={1.75} /> : <IconEye size={16} stroke={1.75} />}
                    </button>
                  </div>
                </div>
              )}

              {mode === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Parolni tasdiqlang
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-black dark:text-white outline-none focus:border-[#22C55E] transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <IconEyeOff size={16} stroke={1.75} />
                      ) : (
                        <IconEye size={16} stroke={1.75} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Terms checkbox for registration */}
              {mode === "register" && (
                <label className="flex items-start gap-2 text-xs text-gray-500 dark:text-zinc-400 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 accent-[#22C55E]"
                  />
                  <span>
                    Men <span className="text-[#22C55E] underline">Foydalanish shartlari</span> va{" "}
                    <span className="text-[#22C55E] underline">Maxfiylik siyosati</span>ga roziman.
                  </span>
                </label>
              )}

              {errorMessage && (
                <p className="text-xs text-red-500 dark:text-red-400 font-medium">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary-tactile w-full py-3 text-xs sm:text-sm font-bold mt-2"
              >
                {isSubmitting
                  ? "Yuklanmoqda..."
                  : mode === "login"
                  ? "Kirish"
                  : "Davom etish"}
              </button>
            </form>

            {/* Social Logins */}
            <div className="pt-2">
              <div className="relative flex items-center justify-center mb-3">
                <div className="border-t border-gray-200 dark:border-zinc-800 w-full" />
                <span className="bg-white dark:bg-[#1C1C1E] px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider absolute">
                  yoki
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => completeAuth("Google Foydalanuvchisi", "google_user@gmail.com")}
                  className="py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <span className="font-bold">Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => completeAuth("Apple Foydalanuvchisi", "apple_user@icloud.com")}
                  className="py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <span className="font-bold">Apple</span>
                </button>

                <button
                  type="button"
                  onClick={() => completeAuth("GitHub Dasturchisi", "dev@github.com")}
                  className="py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <span className="font-bold">GitHub</span>
                </button>
              </div>
            </div>

            {/* Toggle Mode: Login <-> Register */}
            <div className="pt-2 text-center text-xs text-gray-500 dark:text-zinc-400">
              {mode === "login" ? (
                <p>
                  Hisobingiz yo&apos;qmi?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setIsRegisteringFlow(true);
                      setErrorMessage("");
                    }}
                    className="text-[#22C55E] hover:underline font-bold cursor-pointer"
                  >
                    Ro&apos;yxatdan o&apos;tish
                  </button>
                </p>
              ) : (
                <p>
                  Hisobingiz bormi?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setIsRegisteringFlow(false);
                      setErrorMessage("");
                    }}
                    className="text-[#22C55E] hover:underline font-bold cursor-pointer"
                  >
                    Kirish
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
