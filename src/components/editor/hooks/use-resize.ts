import { useCallback, useEffect, useRef, useState } from "react";

type HorizontalDirection = "right" | "left";
type VerticalDirection = "up" | "down";

interface UseResizeHorizontalOptions {
  initialWidth: number;
  minWidth?: number;
  maxWidth?: number;
  direction?: HorizontalDirection;
}

interface UseResizeVerticalOptions {
  initialHeight: number;
  minHeight?: number;
  maxHeight?: number;
  direction?: VerticalDirection;
}

export function useResize({
  initialWidth,
  minWidth = 180,
  maxWidth = 600,
  direction = "right",
}: UseResizeHorizontalOptions) {
  const [width, setWidth] = useState(initialWidth);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startX.current = e.clientX;
      startWidth.current = width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientX - startX.current;
      const next = direction === "right" ? startWidth.current + delta : startWidth.current - delta;
      setWidth(Math.min(maxWidth, Math.max(minWidth, next)));
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [direction, minWidth, maxWidth]);

  return { width, onMouseDown };
}

export function useResizeHeight({
  initialHeight,
  minHeight = 80,
  maxHeight = 600,
  direction = "up",
}: UseResizeVerticalOptions) {
  const [height, setHeight] = useState(initialHeight);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startY.current = e.clientY;
      startHeight.current = height;
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
    },
    [height],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientY - startY.current;
      const next = direction === "up" ? startHeight.current - delta : startHeight.current + delta;
      setHeight(Math.min(maxHeight, Math.max(minHeight, next)));
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [direction, minHeight, maxHeight]);

  return { height, onMouseDown };
}
