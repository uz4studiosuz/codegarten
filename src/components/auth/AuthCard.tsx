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

  // Keep mode in sync if initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
    setIsRegisteringFlow(initialMode === "register");
  }, [initialMode]);

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
            firstName ? `${firstName} ${lastName}`.trim() : "Ziyodulloh",
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
        phoneOrEmail: phone ? `+998 ${phone}` : email || "Ziyodulloh@codegarten.uz",
      });

      setTimeout(() => {
        router.push("/home");
      }, 800);
    }, 600);
  };

  const completeAuth = (name: string, phoneOrEmail: string) => {
    login({
      name: name || "Ziyodulloh",
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
          <span className="text-sm font-bold tracking-tight text-black dark:text-white font-sans">
            Codegarten
          </span>
        </Link>
      </div>

      {/* Main Minimalist Auth Card */}
      <div className="relative w-full max-w-[480px] bg-white dark:bg-[#1C1C1E] text-black dark:text-white rounded-[28px] sm:rounded-[32px] shadow-xl p-6 sm:p-9 border border-gray-200 dark:border-zinc-800 transition-colors font-sans">
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

          <h1 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight text-center font-sans">
            {mode === "profile"
              ? "Profilingizni to'ldiring"
              : mode === "login"
                ? "Xush kelibsiz!"
                : mode === "register"
                  ? "Ro'yxatdan o'tish"
                  : "Tasdiqlash"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 text-center mt-1 max-w-sm font-sans">
            {mode === "profile"
              ? "Codegarten imkoniyatlaridan to'liq foydalanish uchun ma'lumotlaringizni to'ldiring"
              : mode === "login"
                ? "Codegarten hisobingizga kiring va darslarni davom ettiring"
                : mode === "register"
                  ? "Yangi hisob oching va amaliy ta'limni boshlang"
                  : method === "telegram"
                    ? "Telegramingizga yuborilgan 6 xonali kodni kiriting"
                    : "Telefoningizga yuborilgan 6 xonali SMS kodni kiriting"}
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
                  placeholder="Ism"
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
                  placeholder="Familiya"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-black dark:text-white outline-none focus:border-[#22C55E] transition-colors"
                />
              </div>
            </div>

            {/* Jinsi (Gender) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Jinsi *
              </label>
              <div className="relative">
                <select
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "male" | "female")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-black dark:text-white outline-none focus:border-[#22C55E] transition-colors appearance-none pr-10 cursor-pointer"
                >
                  <option value="" disabled>
                    Iltimos tanlang
                  </option>
                  <option value="male">Erkak</option>
                  <option value="female">Ayol</option>
                </select>
                <IconChevronDown
                  size={16}
                  className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>

            {/* Tug'ilgan kun (Birth date) */}
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

            {/* Viloyat */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Viloyat *
              </label>
              <div className="relative">
                <select
                  required
                  value={selectedRegionId}
                  onChange={(e) => {
                    setSelectedRegionId(e.target.value);
                    setSelectedDistrict("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-black dark:text-white outline-none focus:border-[#22C55E] transition-colors appearance-none pr-10 cursor-pointer"
                >
                  <option value="" disabled>
                    Viloyatni tanlang
                  </option>
                  {UZBEKISTAN_REGIONS.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
                <IconChevronDown
                  size={16}
                  className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>

            {/* Tuman / Shahar */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Tuman / Shahar *
              </label>
              <div className="relative">
                <select
                  required
                  disabled={!selectedRegionId}
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-black dark:text-white outline-none focus:border-[#22C55E] transition-colors appearance-none pr-10 cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled>
                    {selectedRegionId ? "Tuman yoki shaharni tanlang" : "Avval viloyatni tanlang"}
                  </option>
                  {currentRegion?.districts.map((district, idx) => (
                    <option key={idx} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                <IconChevronDown
                  size={16}
                  className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
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
              {isSubmitting ? "Saqlanmoqda..." : "Saqlash va Boshlash"}
            </button>
          </form>
        ) : mode === "verify" ? (
          /* ────────────────────────────────────────────────────────── */
          /* MODE 2: OTP VERIFICATION                                  */
          /* ────────────────────────────────────────────────────────── */
          <div className="space-y-4 animate-fadeIn">
            {/* Back button */}
            <button
              type="button"
              onClick={() => {
                setMode(isRegisteringFlow ? "register" : "login");
                setErrorMessage("");
              }}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <IconArrowLeft size={14} stroke={2} />
              <span>Raqamni o&apos;zgartirish</span>
            </button>

            {/* Target Display */}
            <div className="text-center py-2">
              <span className="text-xs text-gray-400">Yuborilgan raqam:</span>
              <p className="text-base sm:text-lg font-mono font-bold text-black dark:text-white">
                +998 {phone || "90 123 45 67"}
              </p>
            </div>

            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-2 sm:gap-2.5 my-4">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={idx === 0 ? handleOtpPaste : undefined}
                  className={`w-10 h-12 sm:w-12 sm:h-14 text-center font-mono font-bold text-lg rounded-2xl border bg-gray-50 dark:bg-zinc-800 text-black dark:text-white outline-none transition-all ${digit
                      ? "border-[#22C55E] ring-2 ring-[#22C55E]/20"
                      : "border-gray-200 dark:border-zinc-700 focus:border-[#22C55E]"
                    }`}
                />
              ))}
            </div>

            {errorMessage && (
              <p className="text-xs text-red-500 dark:text-red-400 text-center font-medium">
                {errorMessage}
              </p>
            )}

            {/* Verify CTA */}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isSubmitting || otpDigits.join("").length < 6}
              className="btn-primary-tactile w-full py-3 text-xs sm:text-sm font-bold disabled:opacity-50"
            >
              {isSubmitting ? "Tekshirilmoqda..." : "Tasdiqlash"}
            </button>

            {/* Timer & Resend */}
            <div className="text-center pt-2">
              {timer > 0 ? (
                <p className="text-xs text-gray-400 font-mono">
                  Kodni qayta yuborish:{" "}
                  <span className="font-bold text-[#22C55E]">
                    00:{timer < 10 ? `0${timer}` : timer}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={resendCode}
                  className="text-xs text-[#22C55E] hover:underline font-bold cursor-pointer"
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
          <div className="space-y-4 animate-fadeIn">
            {/* Phone vs Email Switcher */}
            <div className="p-1 rounded-2xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 grid grid-cols-2 gap-1 relative z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTab("phone");
                  setErrorMessage("");
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${tab === "phone"
                    ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                    : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
              >
                <IconPhone size={15} stroke={2} />
                <span>Telefon</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTab("email");
                  setErrorMessage("");
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${tab === "email"
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
                <div className="space-y-3">
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

                  {/* SMS vs Telegram SMS Delivery Method Choice */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Tasdiqlash kodi turi
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMethod("sms")}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${method === "sms"
                            ? "bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E] font-bold"
                            : "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:border-gray-300"
                          }`}
                      >
                        <IconMessage size={15} stroke={2} />
                        <span>SMS orqali</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMethod("telegram")}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${method === "telegram"
                            ? "bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E] font-bold"
                            : "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:border-gray-300"
                          }`}
                      >
                        <IconSend size={15} stroke={2} />
                        <span>Telegram SMS</span>
                      </button>
                    </div>
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-black dark:text-white outline-none focus:border-[#22C55E] transition-colors pr-11"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPassword((prev) => !prev);
                      }}
                      className="absolute right-2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer z-10 select-none flex items-center justify-center"
                    >
                      {showPassword ? <IconEyeOff size={18} stroke={1.75} /> : <IconEye size={18} stroke={1.75} />}
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-black dark:text-white outline-none focus:border-[#22C55E] transition-colors pr-11"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowConfirmPassword((prev) => !prev);
                      }}
                      className="absolute right-2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer z-10 select-none flex items-center justify-center"
                    >
                      {showConfirmPassword ? (
                        <IconEyeOff size={18} stroke={1.75} />
                      ) : (
                        <IconEye size={18} stroke={1.75} />
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

            {/* Toggle Mode: Login <-> Register */}
            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 text-center text-xs text-gray-500 dark:text-zinc-400">
              {mode === "login" ? (
                <p>
                  Hisobingiz yo&apos;qmi?{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMode("register");
                      setIsRegisteringFlow(true);
                      setErrorMessage("");
                      router.replace("/register");
                    }}
                    className="text-[#22C55E] hover:underline font-bold cursor-pointer inline-block ml-1"
                  >
                    Ro&apos;yxatdan o&apos;tish
                  </button>
                </p>
              ) : (
                <p>
                  Hisobingiz bormi?{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMode("login");
                      setIsRegisteringFlow(false);
                      setErrorMessage("");
                      router.replace("/login");
                    }}
                    className="text-[#22C55E] hover:underline font-bold cursor-pointer inline-block ml-1"
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
