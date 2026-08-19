"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Drag a block into a slot
 * ------------------------
 * Children testing the games kept staring at palettes of "+" buttons without
 * realising they were meant to press them. Blocks that can be picked up and
 * dropped read as blocks; a tap still works for anyone who tries that first.
 *
 * Pointer events rather than HTML5 drag-and-drop, because the latter never fires
 * on touch screens. The slot under the finger is found with `elementFromPoint`
 * against a `data-drop-index` attribute, so a game only has to mark its slots.
 *
 * A control *inside* a draggable block (a remove button, say) must not start a
 * drag: mark it `data-no-drag` and it keeps its own clicks. Getting this wrong is
 * exactly why robot-grid's remove button did nothing — the block captured the
 * pointer and the button never saw the release.
 */

export interface DragState<T> {
  payload: T;
  x: number;
  y: number;
  /** False until the pointer has actually travelled — that is what makes it a tap. */
  moved: boolean;
  /** Slot the block was picked up from; undefined when it came from the palette. */
  from?: number;
}

interface Options<T> {
  /** Dropped onto a slot. `from` is set when the block came out of another slot. */
  onDrop: (payload: T, slot: number, from?: number) => void;
  /** Released with no slot underneath. Used to throw a placed block away. */
  onDropOutside?: (payload: T, from?: number) => void;
  /** Pressed without moving. Usually "append to the first free slot". */
  onTap?: (payload: T, from?: number) => void;
  disabled?: boolean;
}

const TAP_SLOP = 6;

function slotUnder(x: number, y: number): number | undefined {
  const element = document.elementFromPoint(x, y);
  const slot = element?.closest("[data-drop-index]") as HTMLElement | null;
  if (!slot) return undefined;
  const index = Number(slot.dataset.dropIndex);
  return Number.isFinite(index) ? index : undefined;
}

export function useBlockDrag<T>({ onDrop, onDropOutside, onTap, disabled }: Options<T>) {
  // The ref is the source of truth for the gesture; state exists only so the
  // ghost and the highlighted slot re-render. Deciding anything from state
  // inside an event would lag a frame behind the pointer.
  const active = useRef<DragState<T> | null>(null);
  const [drag, setDrag] = useState<DragState<T> | null>(null);
  const [overSlot, setOverSlot] = useState<number | undefined>(undefined);

  const finish = useCallback(() => {
    active.current = null;
    setDrag(null);
    setOverSlot(undefined);
  }, []);

  /**
   * Spread onto anything draggable: `{...bind(payload)}` for a palette block,
   * `{...bind(payload, index)}` for one already sitting in a slot.
   */
  const bind = useCallback(
    (payload: T, from?: number) => ({
      onPointerDown: (event: React.PointerEvent) => {
        if (disabled) return;
        // A control inside the block keeps its own clicks.
        if ((event.target as HTMLElement).closest("[data-no-drag]")) return;
        const state: DragState<T> = {
          payload,
          x: event.clientX,
          y: event.clientY,
          moved: false,
          from,
        };
        active.current = state;
        setDrag(state);
        try {
          // Capture keeps move/up coming to this element even when the finger
          // leaves it. It throws if the pointer is already gone, which must not
          // take the gesture down with it.
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Without capture the drag still works while the pointer stays inside.
        }
      },

      onPointerMove: (event: React.PointerEvent) => {
        const state = active.current;
        if (!state) return;
        const moved =
          state.moved ||
          Math.hypot(event.clientX - state.x, event.clientY - state.y) > TAP_SLOP;
        // x/y stay at the press point until the gesture counts as a drag, so the
        // slop is measured from where the finger landed.
        const next: DragState<T> = moved
          ? { ...state, x: event.clientX, y: event.clientY, moved: true }
          : state;
        active.current = next;
        if (moved) {
          setDrag(next);
          setOverSlot(slotUnder(event.clientX, event.clientY));
        }
      },

      onPointerUp: (event: React.PointerEvent) => {
        const state = active.current;
        if (!state) return;
        finish();
        if (!state.moved) {
          onTap?.(state.payload, state.from);
          return;
        }
        const slot = slotUnder(event.clientX, event.clientY);
        if (slot !== undefined) onDrop(state.payload, slot, state.from);
        else onDropOutside?.(state.payload, state.from);
      },

      onPointerCancel: finish,
      style: { touchAction: "none" as const },
    }),
    [disabled, finish, onDrop, onDropOutside, onTap]
  );

  return {
    drag,
    /** True once the pointer has travelled — the moment to show drop targets. */
    isDragging: Boolean(drag?.moved),
    /** Slot under the pointer right now, so only that one lights up. */
    overSlot,
    bind,
  };
}
