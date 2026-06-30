"use client";

import { useResize, useResizeHeight } from "./hooks/use-resize";

interface ResizableHorizontalProps {
  orientation: "horizontal";
  initialSize: number;
  min?: number;
  max?: number;
  direction: "left" | "right";
  className?: string;
  children: React.ReactNode;
}

interface ResizableVerticalProps {
  orientation: "vertical";
  initialSize: number;
  min?: number;
  max?: number;
  direction: "up" | "down";
  className?: string;
  children: React.ReactNode;
}

type ResizableProps = ResizableHorizontalProps | ResizableVerticalProps;

function ResizableHorizontal({
  initialSize,
  min,
  max,
  direction,
  className = "",
  children,
}: Omit<ResizableHorizontalProps, "orientation">) {
  const { width, onMouseDown } = useResize({
    initialWidth: initialSize,
    minWidth: min,
    maxWidth: max,
    direction,
  });

  const handleSide = direction === "right" ? "right-0" : "left-0";

  return (
    <div className={`relative shrink-0 h-full ${className}`} style={{ width }}>
      {children}
      <div
        onMouseDown={onMouseDown}
        className={`absolute top-0 ${handleSide} w-1 h-full z-20 cursor-col-resize group/rhandle flex items-center justify-center`}
      >
        <div className="w-px h-full bg-transparent group-hover/rhandle:bg-border transition-colors duration-150" />
      </div>
    </div>
  );
}

function ResizableVertical({
  initialSize,
  min,
  max,
  direction,
  className = "",
  children,
}: Omit<ResizableVerticalProps, "orientation">) {
  const { height, onMouseDown } = useResizeHeight({
    initialHeight: initialSize,
    minHeight: min,
    maxHeight: max,
    direction,
  });

  const handleSide = direction === "up" ? "top-0" : "bottom-0";

  return (
    <div className={`relative shrink-0 w-full ${className}`} style={{ height }}>
      <div
        onMouseDown={onMouseDown}
        className={`absolute ${handleSide} left-0 right-0 h-1 z-20 cursor-row-resize group/rhandle flex flex-col items-center justify-center`}
      >
        <div className="w-full h-px bg-transparent group-hover/rhandle:bg-border transition-colors duration-150" />
      </div>
      {children}
    </div>
  );
}

export function Resizable(props: ResizableProps) {
  if (props.orientation === "horizontal") {
    const { orientation: _, ...rest } = props;
    return <ResizableHorizontal {...rest} />;
  }
  const { orientation: _, ...rest } = props;
  return <ResizableVertical {...rest} />;
}
