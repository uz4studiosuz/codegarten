"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { InstructionBlock, ExerciseChallenge, EvaluationResult } from "./types";

export function useExerciseEngine<TState>(challenge: ExerciseChallenge<TState>) {
  // Abstract Syntax Tree (AST) State
  const [ast, setAst] = useState<InstructionBlock[]>(challenge.initialAST);
  
  // Real-time Runtime State computed via the Challenge Interpreter
  const [runtimeState, setRuntimeState] = useState<TState>(() =>
    challenge.interpret(challenge.initialAST, challenge.initialState)
  );

  // Status & Evaluation State
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [energyXP, setEnergyXP] = useState(0);

  // Re-run interpreter whenever AST changes (Real-Time Reactive Feedback)
  useEffect(() => {
    const nextState = challenge.interpret(ast, challenge.initialState);
    setRuntimeState(nextState);
    // Reset evaluation feedback when user modifies instructions
    setEvaluation(null);
  }, [ast, challenge]);

  // Update a single parameter in a block
  const updateBlockParam = useCallback(
    (blockId: string, paramKey: string, newValue: string | number | boolean) => {
      setAst((prevAst) => {
        const updateRecursive = (blocks: InstructionBlock[]): InstructionBlock[] => {
          return blocks.map((block) => {
            if (block.id === blockId) {
              const currentParam = block.params[paramKey];
              if (!currentParam) return block;
              return {
                ...block,
                params: {
                  ...block.params,
                  [paramKey]: {
                    ...currentParam,
                    value: newValue,
                  },
                },
              };
            }
            if (block.body && block.body.length > 0) {
              return {
                ...block,
                body: updateRecursive(block.body),
              };
            }
            return block;
          });
        };
        return updateRecursive(prevAst);
      });
    },
    []
  );

  // Add block to workspace or nested container
  const addBlock = useCallback((newBlock: InstructionBlock, targetBodyId?: string) => {
    setAst((prevAst) => {
      if (!targetBodyId) {
        return [...prevAst, { ...newBlock, id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` }];
      }
      const insertRecursive = (blocks: InstructionBlock[]): InstructionBlock[] => {
        return blocks.map((block) => {
          if (block.id === targetBodyId) {
            return {
              ...block,
              body: [
                ...(block.body || []),
                { ...newBlock, id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` },
              ],
            };
          }
          if (block.body) {
            return { ...block, body: insertRecursive(block.body) };
          }
          return block;
        });
      };
      return insertRecursive(prevAst);
    });
  }, []);

  // Remove block
  const removeBlock = useCallback((blockId: string) => {
    setAst((prevAst) => {
      const deleteRecursive = (blocks: InstructionBlock[]): InstructionBlock[] => {
        return blocks
          .filter((b) => b.id !== blockId)
          .map((b) => (b.body ? { ...b, body: deleteRecursive(b.body) } : b));
      };
      return deleteRecursive(prevAst);
    });
  }, []);

  // Reset to initial state
  const resetToInitial = useCallback(() => {
    setAst(challenge.initialAST);
    setEvaluation(null);
  }, [challenge.initialAST]);

  // Execute and evaluate goal
  const checkAnswer = useCallback(async () => {
    setIsEvaluating(true);
    // Simulate instantaneous evaluation through pure evaluator function
    const result = challenge.evaluate(ast, runtimeState);
    setEvaluation(result);
    setIsEvaluating(false);

    if (result.isSuccess) {
      setEnergyXP((prev) => prev + 15);
      // Trigger celebration confetti
      if (typeof window !== "undefined") {
        try {
          const confetti = (await import("canvas-confetti")).default;
          confetti({
            particleCount: 75,
            spread: 65,
            origin: { y: 0.65 },
            colors: ["#22C55E", "#EAB308", "#3B82F6", "#A855F7"],
          });
        } catch (e) {
          console.error("Confetti error", e);
        }
      }
    }
  }, [ast, runtimeState, challenge]);

  return {
    ast,
    runtimeState,
    evaluation,
    isEvaluating,
    energyXP,
    updateBlockParam,
    addBlock,
    removeBlock,
    resetToInitial,
    checkAnswer,
  };
}
