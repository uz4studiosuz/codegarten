import React from "react";
import { RendererComponent } from "../types";
import { ShapeRenderer, ShapeCanvasState } from "./ShapeRenderer";
import { GridWorldRenderer, GridWorldState } from "./GridWorldRenderer";

export const rendererRegistry: Record<string, RendererComponent<any>> = {
  shape_canvas: ShapeRenderer,
  grid_world: GridWorldRenderer,
};

export function getRenderer(type: string): RendererComponent<any> {
  const Renderer = rendererRegistry[type];
  if (!Renderer) {
    return () => (
      <div className="p-6 text-center text-xs text-gray-500 font-mono">
        Renderer plugin &quot;{type}&quot; not found in registry.
      </div>
    );
  }
  return Renderer;
}
