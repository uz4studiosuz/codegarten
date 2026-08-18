"use client";

import React from "react";
import { ExerciseRendererProps } from "../types";

export interface ShapeCanvasState {
  circleColor: string;
  hexagonColor: string;
  triangleColor: string;
}

/**
 * A circle with a regular hexagon and an inverted triangle inscribed in it,
 * drawn on a white plate. Each shape's fill is driven by the AST.
 */
export const ShapeRenderer: React.FC<ExerciseRendererProps<ShapeCanvasState>> = ({
  state,
}) => {
  return (
    <div className="w-full bg-white flex items-center justify-center py-[58px] px-8">
      <svg viewBox="-3 -3 136 136" className="w-[173px] h-[173px] max-w-full">
        {/* Outer circle */}
        <circle
          cx="65"
          cy="65"
          r="60"
          fill={state.circleColor || "#3B82F6"}
          stroke="#0A0A0A"
          strokeWidth="2.5"
          className="transition-colors duration-300"
        />

        {/* Inscribed regular hexagon (pointy top and bottom) */}
        <polygon
          points="65,5 116.9,35 116.9,95 65,125 13.1,95 13.1,35"
          fill={state.hexagonColor || "#3B82F6"}
          stroke="#0A0A0A"
          strokeWidth="2.5"
          className="transition-colors duration-300"
        />

        {/* Inscribed inverted triangle */}
        <polygon
          points="65,125 13.1,35 116.9,35"
          fill={state.triangleColor || "#3B82F6"}
          stroke="#0A0A0A"
          strokeWidth="2.5"
          className="transition-colors duration-300"
        />
      </svg>
    </div>
  );
};
