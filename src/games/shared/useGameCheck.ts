"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameProps, GameStatus } from "../types";

interface Options {
  /** True once the learner has made enough of a move to be worth checking. */
  ready: boolean;
  /** Called by the runner's footer button. Return whether it is solved. */
  check: () => boolean;
}

/**
 * The wiring every game repeats: enable the footer button, answer its click,
 * report status upward and award XP exactly once. Games keep only their own
 * playfield logic and call this with a predicate.
 */
export function useGameCheck(
  { onSolved, onReadyChange, registerCheck, onStatusChange }: GameProps,
  { ready, check }: Options
) {
  const [status, setStatus] = useState<GameStatus>("idle");
  const [attempts, setAttempts] = useState(0);
  const solved = useRef(false);

  // Read through a ref so `run` stays stable while the predicate closes over
  // fresh state on every render.
  const checkRef = useRef(check);
  checkRef.current = check;

  // Once solved, the button turns into "Davom etish" — nothing left to check.
  useEffect(() => {
    onReadyChange(ready && !solved.current);
  }, [ready, status, onReadyChange]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const run = useCallback(() => {
    const won = checkRef.current();
    setAttempts((n) => n + 1);
    setStatus(won ? "success" : "fail");
    if (won && !solved.current) {
      solved.current = true;
      onSolved();
    }
  }, [onSolved]);

  useEffect(() => {
    registerCheck(run);
  }, [registerCheck, run]);

  /** Back to a clean board after a wrong answer. Never un-awards XP. */
  const reset = useCallback(() => setStatus("idle"), []);

  return { status, attempts, reset, isSolved: status === "success" };
}
