import { ExerciseChallenge, InstructionBlock, EvaluationResult } from "./types";
import { ShapeCanvasState } from "./renderers/ShapeRenderer";
import { GridWorldState } from "./renderers/GridWorldRenderer";

// ============================================================================
// CHALLENGE 1: Geometric Shape Coloring (Shape Canvas Plugin)
// ============================================================================
export const sampleShapeChallenge: ExerciseChallenge<ShapeCanvasState> = {
  id: "shape-challenge-1",
  moduleId: "mod-2",
  title: "Sariq Geometriya",
  prompt: "Set the color of all shapes to `yellow`.",
  rendererType: "shape_canvas",
  
  initialState: {
    circleColor: "#3B82F6",
    hexagonColor: "#3B82F6",
    triangleColor: "#3B82F6",
  },

  initialAST: [
    {
      id: "blk-1",
      opcode: "draw_shape",
      category: "action",
      label: "draw",
      icon: "🎨",
      params: {
        shape: { type: "string", value: "circle" },
        color: {
          type: "color",
          value: "blue",
          options: [
            { label: "yellow", value: "yellow", colorHex: "#EAB308" },
            { label: "blue", value: "blue", colorHex: "#3B82F6" },
            { label: "green", value: "green", colorHex: "#22C55E" },
            { label: "red", value: "red", colorHex: "#EF4444" },
          ],
        },
      },
      isLocked: true,
    },
    {
      id: "blk-2",
      opcode: "draw_shape",
      category: "action",
      label: "draw",
      icon: "🎨",
      params: {
        shape: { type: "string", value: "hexagon" },
        color: {
          type: "color",
          value: "blue",
          options: [
            { label: "yellow", value: "yellow", colorHex: "#EAB308" },
            { label: "blue", value: "blue", colorHex: "#3B82F6" },
            { label: "green", value: "green", colorHex: "#22C55E" },
            { label: "red", value: "red", colorHex: "#EF4444" },
          ],
        },
      },
      isLocked: true,
    },
    {
      id: "blk-3",
      opcode: "draw_shape",
      category: "action",
      label: "draw",
      icon: "🎨",
      params: {
        shape: { type: "string", value: "triangle" },
        color: {
          type: "color",
          value: "blue",
          options: [
            { label: "yellow", value: "yellow", colorHex: "#EAB308" },
            { label: "blue", value: "blue", colorHex: "#3B82F6" },
            { label: "green", value: "green", colorHex: "#22C55E" },
            { label: "red", value: "red", colorHex: "#EF4444" },
          ],
        },
      },
      isLocked: true,
    },
  ],

  // Real-time interpreter: maps AST block selections to SVG colors
  interpret: (ast: InstructionBlock[]): ShapeCanvasState => {
    const colorLookup: Record<string, string> = {
      yellow: "#EAB308",
      blue: "#3B82F6",
      green: "#22C55E",
      red: "#EF4444",
    };

    let circle = "#3B82F6";
    let hexagon = "#3B82F6";
    let triangle = "#3B82F6";

    ast.forEach((blk) => {
      const shape = blk.params.shape?.value;
      const colorVal = String(blk.params.color?.value || "blue");
      const hex = colorLookup[colorVal] || "#3B82F6";

      if (shape === "circle") circle = hex;
      if (shape === "hexagon") hexagon = hex;
      if (shape === "triangle") triangle = hex;
    });

    return {
      circleColor: circle,
      hexagonColor: hexagon,
      triangleColor: triangle,
    };
  },

  // Pure goal evaluator
  evaluate: (ast: InstructionBlock[], state: ShapeCanvasState): EvaluationResult => {
    const allYellow =
      state.circleColor === "#EAB308" &&
      state.hexagonColor === "#EAB308" &&
      state.triangleColor === "#EAB308";

    if (allYellow) {
      return {
        isSuccess: true,
        score: 100,
        feedbackMessage: "That's it!",
        mascotMood: "celebrate",
        explanation:
          "Barcha uchta shakl parametrlari 'yellow' ga almashtirildi va geometriyaning barcha qatlamlari sariq rangga bo'yaldi.",
      };
    }

    return {
      isSuccess: false,
      score: 0,
      feedbackMessage: "All shapes should be yellow.",
      mascotMood: "thinking",
      solutionHint: "Har bir 'draw' qatoridagi rangni 'yellow' qilib belgilang.",
    };
  },
};

// ============================================================================
// CHALLENGE 2: Robot Grid Maze Navigation (Grid World Plugin)
// ============================================================================
export const sampleGridChallenge: ExerciseChallenge<GridWorldState> = {
  id: "grid-challenge-1",
  moduleId: "mod-2",
  title: "Yulduzni Yig'ish",
  prompt: "Robotni yulduz turgan katakka olib boring.",
  subPrompt: "Oldinga harakatlanish va burilish buyruqlaridan foydalaning.",
  rendererType: "grid_world",

  initialState: {
    gridSize: 4,
    robotPos: { x: 0, y: 0 },
    robotDirection: "right",
    targetPos: { x: 2, y: 1 },
    coinsCollected: 0,
  },

  initialAST: [
    {
      id: "g-blk-1",
      opcode: "move_forward",
      category: "action",
      label: "oldinga",
      params: { steps: { type: "number", value: 2 } },
    },
    {
      id: "g-blk-2",
      opcode: "turn_direction",
      category: "action",
      label: "o'ngga_buril",
      params: {},
    },
    {
      id: "g-blk-3",
      opcode: "move_forward",
      category: "action",
      label: "oldinga",
      params: { steps: { type: "number", value: 1 } },
    },
  ],

  // Real-time grid movement interpreter
  interpret: (ast: InstructionBlock[], initial: GridWorldState): GridWorldState => {
    let x = initial.robotPos.x;
    let y = initial.robotPos.y;
    let dir = initial.robotDirection;

    const directions = ["up", "right", "down", "left"] as const;

    ast.forEach((blk) => {
      if (blk.opcode === "move_forward") {
        const steps = Number(blk.params.steps?.value || 1);
        if (dir === "right") x = Math.min(initial.gridSize - 1, x + steps);
        if (dir === "down") y = Math.min(initial.gridSize - 1, y + steps);
        if (dir === "left") x = Math.max(0, x - steps);
        if (dir === "up") y = Math.max(0, y - steps);
      } else if (blk.opcode === "turn_direction") {
        const currentIdx = directions.indexOf(dir);
        dir = directions[(currentIdx + 1) % 4];
      }
    });

    const isAtTarget = x === initial.targetPos.x && y === initial.targetPos.y;

    return {
      ...initial,
      robotPos: { x, y },
      robotDirection: dir,
      coinsCollected: isAtTarget ? 1 : 0,
    };
  },

  evaluate: (ast: InstructionBlock[], state: GridWorldState): EvaluationResult => {
    const reachedTarget =
      state.robotPos.x === state.targetPos.x &&
      state.robotPos.y === state.targetPos.y;

    if (reachedTarget) {
      return {
        isSuccess: true,
        score: 100,
        feedbackMessage: "Ajoyib! Yulduz qo'lga kiritildi.",
        mascotMood: "celebrate",
        explanation:
          "Robot 2 qadam o'ngga yurdi, pastga burildi va 1 qadam pastga harakatlanib yulduz koordinatasiga yetib bordi.",
      };
    }

    return {
      isSuccess: false,
      score: 0,
      feedbackMessage: "Robot yulduzga yetib bormadi. Qadamlarni qayta tekshiring.",
      mascotMood: "confused",
      solutionHint: "2 qadam oldinga, keyin o'ngga burilib 1 qadam oldinga yuring.",
    };
  },
};
