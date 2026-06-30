"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Provides throttled slider behaviour:
 * - `localValue`        – instant local copy for a snappy UI
 * - `setDragging`       – call with `true` on drag start, `false` on end
 * - `handleChange`      – throttled parent onChange (call from onValueChange)
 * - `handleCommit`      – immediate parent onChange, cancels pending timer (call from onValueCommit)
 * - `handleDirectSet`   – immediate parent onChange from number-input / direct input
 *
 * @param value      Current value coming from the parent / store
 * @param onChange   Parent onChange handler
 * @param throttleMs Throttle interval in ms (default 50)
 */
export function useSliderThrottle(value: number, onChange: (val: number) => void, throttleMs = 50) {
  const [localValue, setLocalValue] = useState(value);
  const isDragging = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<number | null>(null);

  // Sync from parent only when the user is not holding the slider
  useEffect(() => {
    if (!isDragging.current) {
      setLocalValue(value);
    }
  }, [value]);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  /** Called from Slider onValueChange */
  const handleChange = useCallback(
    (val: number) => {
      isDragging.current = true;
      setLocalValue(val);
      pending.current = val;
      if (!timer.current) {
        timer.current = setTimeout(() => {
          if (pending.current !== null) onChange(pending.current);
          timer.current = null;
          pending.current = null;
        }, throttleMs);
      }
    },
    [onChange, throttleMs],
  );

  /** Called from Slider onValueCommit (pointer-up) */
  const handleCommit = useCallback(
    (val: number) => {
      clearTimer();
      pending.current = null;
      isDragging.current = false;
      setLocalValue(val);
      onChange(val);
    },
    [onChange, clearTimer],
  );

  /** Called from NumberInput / direct input – always immediate */
  const handleDirectSet = useCallback(
    (val: number) => {
      clearTimer();
      setLocalValue(val);
      onChange(val);
    },
    [onChange, clearTimer],
  );

  return { localValue, handleChange, handleCommit, handleDirectSet };
}
