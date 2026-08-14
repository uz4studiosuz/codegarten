"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Trophy, HelpCircle, CheckCircle2, RotateCcw, ArrowRight } from "lucide-react";
import { interactiveChallenges } from "@/data/challenges";
import { InteractiveChoice } from "@/design-system/molecules/InteractiveChoice";
import { CodePreview } from "@/design-system/molecules/CodePreview";
import { Badge } from "@/design-system/primitives/Badge";
import { Button } from "@/design-system/primitives/Button";

export const LogicChallenge: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [totalXp, setTotalXp] = useState(150);

  const currentChallenge = interactiveChallenges[currentIdx];
  const isCorrect = selectedOptionId === currentChallenge.correctOptionId;

  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return;
    setSelectedOptionId(optionId);
    setIsAnswered(true);

    if (optionId === currentChallenge.correctOptionId) {
      setTotalXp((prev) => prev + currentChallenge.xpReward);
      // Trigger festive confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#5ed981", "#456dff", "#8a5cf6", "#f59e0b"],
        });
      } catch {
        // Ignore in environments where canvas is restricted
      }
    }
  };

  const handleNextChallenge = () => {
    setSelectedOptionId(null);
    setIsAnswered(false);
    setCurrentIdx((prev) => (prev + 1) % interactiveChallenges.length);
  };

  const handleRetry = () => {
    setSelectedOptionId(null);
    setIsAnswered(false);
  };

  return (
    <div className="w-full rounded-2xl bg-[#0f1218] border border-border-subtle p-5 sm:p-7 shadow-deep">
      {/* Quiz Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Badge variant="brand" size="sm">
            {currentChallenge.topic}
          </Badge>
          <Badge
            variant={currentChallenge.difficulty === "Easy" ? "success" : "warning"}
            size="sm"
          >
            {currentChallenge.difficulty}
          </Badge>
        </div>

        {/* Gamified XP pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent-amber/15 border border-accent-amber/30 text-accent-amber text-xs font-bold">
          <Trophy className="w-3.5 h-3.5" />
          <span>+{currentChallenge.xpReward} XP</span>
          <span className="text-white/40">|</span>
          <span className="text-white">Jami: {totalXp} XP</span>
        </div>
      </div>

      {/* Challenge Title & Question */}
      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
        {currentChallenge.title}
      </h3>
      <p className="text-sm text-text-secondary leading-relaxed mb-4">
        {currentChallenge.question}
      </p>

      {/* Optional Code Snippet */}
      {currentChallenge.codeSnippet && (
        <div className="mb-5">
          <CodePreview
            code={currentChallenge.codeSnippet}
            language="typescript"
            showLineNumbers={false}
          />
        </div>
      )}

      {/* Interactive Options */}
      <div className="space-y-2.5 mb-5">
        {currentChallenge.options.map((opt, idx) => {
          const letter = ["A", "B", "C", "D"][idx];
          const isSelected = selectedOptionId === opt.id;
          const optionCorrectState = isAnswered
            ? opt.id === currentChallenge.correctOptionId
              ? true
              : isSelected
              ? false
              : null
            : null;

          return (
            <InteractiveChoice
              key={opt.id}
              id={opt.id}
              indexKey={letter}
              label={opt.label}
              isSelected={isSelected}
              isCorrect={optionCorrectState}
              isDisabled={isAnswered}
              onSelect={handleSelectOption}
            />
          );
        })}
      </div>

      {/* Explanation & Solution Feedback */}
      {isAnswered && (
        <div
          className={`p-4 rounded-xl border mb-5 transition-all duration-300 ${
            isCorrect
              ? "bg-accent-green/10 border-accent-green/30 text-white"
              : "bg-accent-red/10 border-accent-red/30 text-white"
          }`}
        >
          <div className="flex items-start gap-3">
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-accent-green shrink-0 mt-0.5" />
            ) : (
              <HelpCircle className="w-5 h-5 text-accent-red shrink-0 mt-0.5" />
            )}
            <div className="text-xs sm:text-sm leading-relaxed">
              <span className="font-bold block mb-1">
                {isCorrect ? "Ajoyib natija! To'g'ri topdingiz." : "Xato javob. Qayta urinib ko'ring."}
              </span>
              <p className="text-text-secondary">{currentChallenge.detailedSolution}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer controls */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-text-muted">
          Savol {currentIdx + 1} / {interactiveChallenges.length}
        </span>

        <div className="flex items-center gap-2">
          {isAnswered && !isCorrect && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRetry}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Qayta urinish
            </Button>
          )}

          <Button
            size="sm"
            variant="primary"
            onClick={handleNextChallenge}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Keyingi Savol
          </Button>
        </div>
      </div>
    </div>
  );
};
