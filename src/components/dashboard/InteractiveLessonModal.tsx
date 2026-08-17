"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  IconX,
  IconCircleCheckFilled,
  IconAlertCircle,
  IconArrowRight,
  IconRotate2,
  IconSparkles,
  IconBolt,
  IconCheck,
  IconCode,
  IconRepeat,
} from "@tabler/icons-react";

interface InteractiveLessonModalProps {
  moduleId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveLessonModal: React.FC<InteractiveLessonModalProps> = ({
  moduleId,
  isOpen,
  onClose,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const correctAnswer = 1; // Option B

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerChecked(true);

    if (selectedOption === correctAnswer) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsAnswerChecked(false);
  };

  const handleFinish = () => {
    setIsCompleted(true);
    setTimeout(() => {
      onClose();
      setIsCompleted(false);
      handleReset();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* Main Lesson Window */}
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-gray-100 p-6 sm:p-8 z-10 animate-scaleIn flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Top Header: Progress & Close */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              <IconRepeat className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#121212]">
                Modul 2: Sikllar va Naqshlar
              </span>
              <span className="text-[10px] text-gray-400 block">
                1-bosqich: Naqshlarni aniqlash
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress pills */}
            <div className="flex items-center gap-1">
              <div className="w-6 h-1.5 rounded-full bg-purple-600" />
              <div className="w-6 h-1.5 rounded-full bg-gray-200" />
              <div className="w-6 h-1.5 rounded-full bg-gray-200" />
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <IconX size={16} stroke={2} />
            </button>
          </div>
        </div>

        {/* Puzzle Content */}
        {!isCompleted ? (
          <div>
            {/* Question Text */}
            <h3 className="text-lg sm:text-xl font-bold text-[#121212] mb-3 leading-snug">
              Robot 4 marta oldinga yurib, har safar o&apos;ngga burilishi kerak.
              Ushbu takroriy harakatni eng qisqa qaysi kod ifodalaydi?
            </h3>

            {/* Visual Code Pattern Canvas */}
            <div className="bg-[#FAF5FF] rounded-2xl border border-purple-100 p-4 mb-6 font-mono text-xs text-purple-950 flex flex-col items-center justify-center">
              <div className="text-[11px] text-gray-500 font-sans mb-2 flex items-center gap-1.5">
                <IconSparkles size={14} className="text-purple-600" />
                <span>Kutilayotgan harakat: 4 ta to&apos;rtburchak qirrasi</span>
              </div>
              <div className="bg-white rounded-xl border border-purple-200 p-3 shadow-xs w-full max-w-sm">
                <span className="text-gray-400">1. oldinga(); o&apos;ngga();</span><br />
                <span className="text-gray-400">2. oldinga(); o&apos;ngga();</span><br />
                <span className="text-gray-400">3. oldinga(); o&apos;ngga();</span><br />
                <span className="text-gray-400">4. oldinga(); o&apos;ngga();</span>
              </div>
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-3 mb-6">
              {[
                {
                  id: 0,
                  code: "repeat (2) { oldinga(); o'ngga(); }",
                  label: "A) Faqat 2 marta takrorlash",
                },
                {
                  id: 1,
                  code: "repeat (4) { oldinga(); o'ngga(); }",
                  label: "B) 4 marta takrorlash (Tavsiya)",
                },
                {
                  id: 2,
                  code: "repeat (8) { oldinga(); o'ngga(); }",
                  label: "C) 8 marta takrorlash",
                },
              ].map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isCorrect = opt.id === correctAnswer;

                return (
                  <button
                    key={opt.id}
                    onClick={() => !isAnswerChecked && setSelectedOption(opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isAnswerChecked
                        ? isCorrect
                          ? "bg-[#eaf6ed] border-[#29CC57] text-[#00872e]"
                          : isSelected
                          ? "bg-red-50 border-red-300 text-red-700"
                          : "bg-gray-50 border-gray-200 opacity-50"
                        : isSelected
                        ? "bg-purple-50 border-purple-500 shadow-xs ring-2 ring-purple-400/20 text-purple-950 font-semibold"
                        : "bg-white border-gray-200 hover:border-gray-300 text-gray-800"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold mb-1">{opt.label}</div>
                      <div className="font-mono text-xs bg-black/5 px-2.5 py-1 rounded-md inline-block">
                        {opt.code}
                      </div>
                    </div>

                    {isAnswerChecked && isCorrect && (
                      <IconCircleCheckFilled size={20} className="text-[#29CC57] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback Message */}
            {isAnswerChecked && (
              <div
                className={`p-4 rounded-2xl mb-5 flex items-start gap-3 ${
                  selectedOption === correctAnswer
                    ? "bg-[#eaf6ed] border border-[#29CC57]/40 text-[#00872e]"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {selectedOption === correctAnswer ? (
                  <IconCircleCheckFilled size={20} className="text-[#29CC57] shrink-0 mt-0.5" />
                ) : (
                  <IconAlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold">
                    {selectedOption === correctAnswer
                      ? "Ajoyib! To'g'ri javob."
                      : "Xato! Qaytadan urinib ko'ring."}
                  </h4>
                  <p className="text-xs mt-0.5">
                    {selectedOption === correctAnswer
                      ? "4 marta bir xil buyruqlarni qo'lda yozmasdan, `repeat(4)` sikli orqali kod hajmini 4 barobarga qisqartirdik."
                      : "Har bir to'rtburchak 4 ta qirra va 4 ta burilishdan iborat. Sikl sonini qayta hisoblang."}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-2">
              {isAnswerChecked && selectedOption !== correctAnswer ? (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-full border border-gray-300 hover:border-gray-900 text-xs font-bold text-[#121212] flex items-center gap-1.5 cursor-pointer"
                >
                  <IconRotate2 size={14} stroke={2} />
                  <span>Qaytadan urinish</span>
                </button>
              ) : <div />}

              {!isAnswerChecked ? (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleCheckAnswer}
                  className="px-8 py-3 rounded-full bg-[#18181b] hover:bg-black text-white text-xs sm:text-sm font-bold transition-all shadow-md active:scale-[0.99] disabled:opacity-40 cursor-pointer ml-auto"
                >
                  Javobni tekshirish
                </button>
              ) : selectedOption === correctAnswer ? (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-8 py-3 rounded-full bg-[#29CC57] hover:bg-[#00872e] text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer ml-auto"
                >
                  <span>Keyingi qadam</span>
                  <IconArrowRight size={16} stroke={2} />
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          /* Completion State */
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#eaf6ed] text-[#29CC57] flex items-center justify-center mb-4 shadow-sm animate-bounce">
              <IconCheck size={32} stroke={3} />
            </div>
            <h3 className="text-2xl font-extrabold text-[#121212] tracking-tight">
              Topshiriq bajarildi! +20 XP 🔥
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Kundalik strike davom etmoqda...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

