import React from "react";

// ============================================================================
// 1. ABSTRACT SYNTAX TREE (AST) & INSTRUCTION REPRESENTATION
// ============================================================================

export type BlockCategory = "action" | "variable" | "control" | "condition";

export interface BlockParamValue {
  type: "string" | "number" | "boolean" | "color";
  value: string | number | boolean;
  options?: Array<{ label: string; value: string | number | boolean; colorHex?: string }>;
}

export interface InstructionBlock {
  id: string;
  opcode: string; // e.g. 'draw_shape', 'move_forward', 'turn_right', 'set_var', 'repeat'
  category: BlockCategory;
  label: string;
  icon?: string;
  params: Record<string, BlockParamValue>;
  body?: InstructionBlock[]; // Nested blocks for loops and conditionals
  isLocked?: boolean; // If true, kids cannot delete or change this structural block
}

// ============================================================================
// 2. EXERCISE CHALLENGE & EVALUATION SPECIFICATION
// ============================================================================

export type MascotMood = "idle" | "happy" | "thinking" | "confused" | "celebrate";

export interface EvaluationResult {
  isSuccess: boolean;
  score: number; // e.g. 100
  feedbackMessage: string;
  mascotMood: MascotMood;
  explanation?: string;
  solutionHint?: string;
}

export interface ExerciseChallenge<TState = unknown> {
  id: string;
  moduleId: string;
  title: string;
  prompt: string;
  subPrompt?: string;
  rendererType: "shape_canvas" | "grid_world" | "math_variable";
  initialAST: InstructionBlock[];
  toolboxBlocks?: InstructionBlock[];
  initialState: TState;
  
  // Pure evaluator function: tests if current runtime state/AST satisfies the goal
  evaluate: (ast: InstructionBlock[], runtimeState: TState) => EvaluationResult;
  
  // Interpreter step function: transforms initial state based on the AST
  interpret: (ast: InstructionBlock[], previousState: TState) => TState;
}

// ============================================================================
// 3. MODULAR RENDERER PLUGIN CONTRACT
// ============================================================================

export interface ExerciseRendererProps<TState = unknown> {
  state: TState;
  isEvaluating: boolean;
  isSuccess: boolean | null;
  onActionTrigger?: (action: string, payload?: unknown) => void;
}

export type RendererComponent<TState = unknown> = React.ComponentType<ExerciseRendererProps<TState>>;
