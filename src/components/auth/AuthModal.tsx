"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import {
  IconX,
  IconMessage,
  IconSend,
  IconEye,
  IconEyeOff,
  IconCircleCheck,
  IconCircleCheckFilled,
  IconMail,
  IconPhone,
  IconArrowLeft,
  IconCalendar,
  IconMapPin,
  IconChevronDown,
  IconUser,
  IconSparkles,
} from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";
import { UZBEKISTAN_REGIONS } from "@/data/regionsData";
import { useRouter } from "next/navigation";

export const AuthModal: React.FC = () => {
  const router = useRouter();
  const {
    isOpen,
    mode,
    tab,
    method,
    pendingPhone,
    closeAuthModal,
    setMode,
    setTab,
    setMethod,
    setPendingPhone,
    login,
  } = useAuth();

  // Registration flow tracker
  const [isRegisteringFlow, setIsRegisteringFlow] = useState(false);

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

  // ESC key listener & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeAuthModal();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeAuthModal]);

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

  // Reset form when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setErrorMessage("");
      setIsVerifiedSuccess(false);
      setOtpDigits(Array(6).fill(""));
      setTimer(45);
      setIsSubmitting(false);
      setIsRegisteringFlow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

      setPendingPhone(phone);
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
        // Transition to Profile Completion screen
        setMode("profile");
      } else {
        // Direct login
        setIsVerifiedSuccess(true);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });

        setTimeout(() => {
          completeAuth(
            firstName ? `${firstName} ${lastName}`.trim() : "Ziyodulloh",
            `+998 ${pendingPhone || phone}`
          );
        }, 1000);
      }
    }, 700);
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
        phoneOrEmail: pendingPhone ? `+998 ${pendingPhone}` : email || "Ziyodulloh@codegarten.uz",
      });

      setTimeout(() => {
        closeAuthModal();
        router.push("/home");
      }, 900);
    }, 600);
  };

  const completeAuth = (name: string, phoneOrEmail: string) => {
    login({
      name: name || "Ziyodulloh",
      phoneOrEmail,
    });
    closeAuthModal();
    router.push("/home");
  };

  const resendCode = () => {
    setTimer(45);
    setOtpDigits(Array(6).fill(""));
    setErrorMessage("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans selection:bg-[#e6f4ea] selection:text-[#00872e]">
      {/* Ultra-clean backdrop blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={closeAuthModal}
      />

      {/* Main Minimalist Modal Card */}
      <div className="relative w-full max-w-[460px] bg-white dark:bg-[#1C1C1E] text-black dark:text-white rounded-[32px] shadow-2xl p-7 sm:p-9 border border-gray-100 dark:border-zinc-800 z-10 animate-scaleIn max-h-[92vh] overflow-y-auto">
        {/* Close Button (X) */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Yopish"
        >
          <IconX size={16} stroke={2} />
        </button>

        {/* Mascot / Floating Top Badge */}
        <div className="flex flex-col items-center justify-center mb-5">
          <div className="relative flex items-center justify-center mb-2">
            <div className="absolute w-20 h-20 bg-[#29CC57]/20 rounded-full blur-xl pointer-events-none" />

            <div className="relative w-13 h-13 transform hover:scale-105 transition-transform duration-300">
              <Image
                src="/Logo.svg"
                alt="Codegarten Logo"
                width={52}
                height={52}
                className="w-full h-full object-contain filter drop-shadow-md"
                priority
              />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121212] tracking-tight text-center mt-1">
            {mode === "profile"
              ? "Profilingizni to'ldiring"
              : mode === "login"
                ? "Kirish"
                : mode === "register"
                  ? "Ro'yxatdan o'tish"
                  : "Tasdiqlash"}
          </h2>
          <p className="text-xs text-gray-500 text-center mt-1 max-w-sm">
            {mode === "profile"
              ? "Codegarten imkoniyatlaridan to'liq foydalanish uchun profilingiz ma'lumotlarini to'ldiring"
              : mode === "login"
                ? "Codegarten hisobingizga kiring"
                : mode === "register"
                  ? "Yangi hisob oching va ta'limni boshlang"
                  : "Telefoningizga yuborilgan kodni kiriting"}
          </p>
        </div>

        {/* ========================================================= */}
        {/* MODE 1: COMPLETE PROFILE ONBOARDING                       */}
        {/* ========================================================= */}
        {mode === "profile" ? (
          <form onSubmit={handleProfileSubmit} className="space-y-3.5 animate-fadeIn">
            {errorMessage && (
              <div className="p-2.5 rounded-2xl bg-red-50 text-red-600 text-xs font-medium text-center border border-red-100">
                {errorMessage}
              </div>
            )}

            {/* Ism & Familiya */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ism
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ismingiz"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[#29CC57] focus:ring-2 focus:ring-[#29CC57]/20 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Familiya
                </label>
                <input
                  type="text"
                  placeholder="Familiyangiz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[#29CC57] focus:ring-2 focus:ring-[#29CC57]/20 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Jinsi (Gender) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Jinsi
              </label>
              <div className="relative">
                <select
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "male" | "female")}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[#29CC57] focus:ring-2 focus:ring-[#29CC57]/20 outline-none transition-all appearance-none cursor-pointer text-gray-800 pr-10"
                >
                  <option value="" disabled>
                    Iltimos tanlang
                  </option>
                  <option value="male">Erkak</option>
                  <option value="female">Ayol</option>
                </select>
                <IconChevronDown size={16} className="text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Tug'ilgan kun (Birth date) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tug&apos;ilgan kun
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[#29CC57] focus:ring-2 focus:ring-[#29CC57]/20 outline-none transition-all text-gray-800"
                />
              </div>
            </div>

            {/* Manzil: Viloyat > Tuman/Shahar (Cascading Selector) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <IconMapPin size={14} className="text-gray-400" />
                <span>Manzil (Viloyat va Tuman/Shahar)</span>
              </label>

              <div className="space-y-2">
                {/* 1. Viloyat Tanlash */}
                <div className="relative">
                  <select
                    required
                    value={selectedRegionId}
                    onChange={(e) => {
                      setSelectedRegionId(e.target.value);
                      setSelectedDistrict(""); // Reset district when region changes
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[#29CC57] focus:ring-2 focus:ring-[#29CC57]/20 outline-none transition-all appearance-none cursor-pointer text-gray-800 pr-10"
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
                  <IconChevronDown size={16} className="text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* 2. Tuman / Shahar Tanlash */}
                <div className="relative">
                  <select
                    required
                    disabled={!selectedRegionId}
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[#29CC57] focus:ring-2 focus:ring-[#29CC57]/20 outline-none transition-all appearance-none cursor-pointer text-gray-800 pr-10 disabled:opacity-50 disabled:bg-gray-50"
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
                  <IconChevronDown size={16} className="text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-[#29CC57] hover:bg-[#00872e] text-white text-sm font-bold transition-all duration-150 shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  "Saqlanmoqda..."
                ) : (
                  <>
                    <span>Saqlash va Boshlash</span>
                    <IconSparkles size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : mode === "verify" ? (
          /* ========================================================= */
          /* MODE 2: OTP VERIFICATION                                  */
          /* ========================================================= */
          <div className="animate-fadeIn">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage("");
              }}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#121212] mb-4 font-medium"
            >
              <IconArrowLeft size={14} stroke={2} />
              <span>Ortga qaytish</span>
            </button>

            {!isVerifiedSuccess ? (
              <>
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-center mb-5">
                  <span className="text-xs text-gray-500">
                    <strong className="text-gray-900">
                      {method === "telegram" ? "Telegram" : "SMS"}
                    </strong>{" "}
                    orqali{" "}
                    <strong className="font-mono text-gray-900">
                      +998 {pendingPhone}
                    </strong>{" "}
                    raqamiga kod yuborildi
                  </span>
                </div>

                {errorMessage && (
                  <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-600 text-xs font-medium text-center">
                    {errorMessage}
                  </div>
                )}

                {/* 6 Digit Input Boxes */}
                <div
                  className="flex items-center justify-between gap-1.5 sm:gap-2 mb-6"
                  onPaste={handleOtpPaste}
                >
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#29CC57] focus:ring-2 focus:ring-[#29CC57]/20 outline-none transition-all"
                    />
                  ))}
                </div>

                {/* Submit OTP Button */}
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-[#18181b] hover:bg-black text-white text-sm font-semibold transition-all duration-150 shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer mb-4"
                >
                  {isSubmitting ? "Tasdiqlanmoqda..." : "Tasdiqlash"}
                </button>

                {/* Resend Timer */}
                <div className="text-center text-xs text-gray-500">
                  {timer > 0 ? (
                    <span>
                      Kodni qayta yuborish:{" "}
                      <strong className="font-mono text-[#00872e]">
                        00:{timer < 10 ? `0${timer}` : timer}
                      </strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={resendCode}
                      className="text-[#00872e] font-semibold hover:underline cursor-pointer"
                    >
                      Kodni qayta yuborish
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#e6f4ea] text-[#00872e] flex items-center justify-center mb-3">
                  <IconCircleCheckFilled size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#121212]">
                  Muvaffaqiyatli kirdingiz!
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Platformaga yo&apos;naltirilmoqdasiz...
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* MODE 3 & 4: LOGIN & REGISTER                              */
          /* ========================================================= */
          <div>
            {/* Minimalist Pill Switcher */}
            <div className="bg-gray-100 p-1 rounded-full flex items-center mb-5 border border-gray-200/60">
              <button
                type="button"
                onClick={() => {
                  setTab("phone");
                  setErrorMessage("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${tab === "phone"
                    ? "bg-white text-[#121212] shadow-xs font-bold"
                    : "text-gray-500 hover:text-[#121212]"
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
                className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${tab === "email"
                    ? "bg-white text-[#121212] shadow-xs font-bold"
                    : "text-gray-500 hover:text-[#121212]"
                  }`}
              >
                <IconMail size={15} stroke={2} />
                <span>Email</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-2xl bg-red-50 text-red-600 text-xs font-medium text-center border border-red-100">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* PHONE TAB */}
              {tab === "phone" && (
                <>
                  {/* Phone Input with +998 */}
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 flex items-center gap-1 text-xs font-bold text-gray-700 pointer-events-none select-none border-r pr-2.5 border-gray-200">
                      <span>🇺🇿</span>
                      <span>+998</span>
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="90 123 45 67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-24 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[#29CC57] focus:ring-2 focus:ring-[#29CC57]/20 outline-none transition-all font-mono placeholder:text-gray-400"
                    />
                  </div>

                  {/* Minimalist SMS / Telegram Method Toggle */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setMethod("sms")}
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${method === "sms"
                          ? "bg-[#e6f4ea] border-[#00872e] text-[#00872e]"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                    >
                      <IconMessage size={15} stroke={2} />
                      <span>SMS orqali</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("telegram")}
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${method === "telegram"
                          ? "bg-[#e6f4ea] border-[#00872e] text-[#00872e]"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                    >
                      <IconSend size={15} stroke={2} />
                      <span>Telegram orqali</span>
                    </button>
                  </div>
                </>
              )}

              {/* EMAIL TAB */}
              {tab === "email" && (
                <input
                  type="email"
                  required
                  placeholder="Email manzil"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[#29CC57] focus:ring-2 focus:ring-[#29CC57]/20 outline-none transition-all placeholder:text-gray-400"
                />
              )}

              {/* PASSWORD (for Email or Register) */}
              {(tab === "email" || mode === "register") && (
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Parol"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-11 py-3 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[#29CC57] focus:ring-2 focus:ring-[#29CC57]/20 outline-none transition-all placeholder:text-gray-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPassword((prev) => !prev);
                    }}
                    className="absolute right-2.5 p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer z-10 select-none flex items-center justify-center"
                  >
                    {showPassword ? (
                      <IconEyeOff size={18} stroke={1.75} />
                    ) : (
                      <IconEye size={18} stroke={1.75} />
                    )}
                  </button>
                </div>
              )}

              {/* CONFIRM PASSWORD (for Register) */}
              {mode === "register" && (
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Parolni tasdiqlang"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-4 pr-11 py-3 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[#29CC57] focus:ring-2 focus:ring-[#29CC57]/20 outline-none transition-all placeholder:text-gray-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowConfirmPassword((prev) => !prev);
                    }}
                    className="absolute right-2.5 p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer z-10 select-none flex items-center justify-center"
                  >
                    {showConfirmPassword ? (
                      <IconEyeOff size={18} stroke={1.75} />
                    ) : (
                      <IconEye size={18} stroke={1.75} />
                    )}
                  </button>
                </div>
              )}

              {/* TERMS (for Register) */}
              {mode === "register" && (
                <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-[#00872e] focus:ring-[#00872e]"
                  />
                  <span className="text-[11px] text-gray-500 leading-tight">
                    <a href="#terms" className="text-[#121212] underline font-medium">
                      Foydalanish shartlari
                    </a>{" "}
                    va{" "}
                    <a href="#privacy" className="text-[#121212] underline font-medium">
                      Maxfiylik siyosati
                    </a>
                    ga roziman.
                  </span>
                </label>
              )}

              {/* MAIN ACTION BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-[#18181b] hover:bg-black text-white text-sm font-semibold transition-all duration-150 shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting
                    ? "Yuklanmoqda..."
                    : mode === "login"
                      ? tab === "phone"
                        ? "Kodni olish va Kirish"
                        : "Kirish"
                      : "Ro'yxatdan o'tish"}
                </button>
              </div>
            </form>

            {/* Bottom Toggle Text */}
            <div className="mt-5 text-center text-xs text-gray-500">
              {mode === "login" ? (
                <>
                  Yangi foydalanuvchimisiz?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setErrorMessage("");
                    }}
                    className="text-[#121212] font-bold underline hover:text-[#00872e] cursor-pointer ml-1"
                  >
                    Ro&apos;yxatdan o&apos;tish
                  </button>
                </>
              ) : (
                <>
                  Hisobingiz bormi?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrorMessage("");
                    }}
                    className="text-[#121212] font-bold underline hover:text-[#00872e] cursor-pointer ml-1"
                  >
                    Kirish
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
