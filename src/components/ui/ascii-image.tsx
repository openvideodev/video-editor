"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import {
  type CSSProperties,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

// Built-in character sets sorted by visual density (dense to sparse)
export const ASCII_CHARACTER_PALETTES = {
  balanced: "@#%*+:. ",
  contrast: "@%#*+=-:;  ",
  minimal: "@#*+:. ",
  detailed: "$@B%8&WM#*oahkbdpqwmZ0OQLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
} as const;

export type AsciiCharacterPalette = keyof typeof ASCII_CHARACTER_PALETTES;

type AsciiImageProps = {
  src: string;
  alt: string;
  className?: string;
  asciiOpacity?: number;
  /**
   * Opacity of the base image layer (0-1).
   */
  imageOpacity?: number;
  /**
   * Render the base image in monochrome (grayscale).
   */
  imageMonochrome?: boolean;
  /**
   * Built-in palette name (dense to sparse).
   * Use `characters` for a fully custom palette.
   */
  characterPalette?: AsciiCharacterPalette;
  /**
   * Custom character palette sorted by visual density (dense to sparse).
   * Overrides `characterPalette` when provided.
   */
  characters?: string;
  resolution?: number;
  /**
   * Contrast multiplier for luminance before mapping to characters.
   * 1 = neutral, >1 = stronger definition, <1 = softer.
   */
  strength?: number;
  /**
   * Reverse luminance mapping (light areas get dense characters).
   */
  reverse?: boolean;
  /**
   * Enable subtle per-cell shimmer animation.
   */
  motionEnabled?: boolean;
  /**
   * Controls how many cells participate in shimmer (0-1).
   */
  motionIntensity?: number;
  /**
   * Speed multiplier for shimmer animation.
   */
  motionSpeed?: number;
  /**
   * Tint strength for shimmer accent color (0-1).
   */
  shimmerTintStrength?: number;
  /**
   * CSS color used for shimmer accent.
   */
  shimmerTintColor?: string;
  /**
   * Blend mode for ASCII overlay.
   */
  asciiBlendMode?: CSSProperties["mixBlendMode"];
  priority?: boolean;
};

// Default character set sorted by visual density (dense to sparse)
const DEFAULT_CHARACTERS = ASCII_CHARACTER_PALETTES.balanced;

// Luminance weights for RGB to grayscale conversion (ITU-R BT.601)
const LUMINANCE_R = 0.299;
const LUMINANCE_G = 0.587;
const LUMINANCE_B = 0.114;

// Debounce delay for resize
const RESIZE_DEBOUNCE_MS = 150;
const ANIMATION_FRAME_INTERVAL_MS = 125;
const MAX_ANIMATED_CELLS = 20_000;

type CharacterGrid = {
  chars: string[];
  indices: number[];
  characterSet: string;
  cols: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
};

type SampleOptions = {
  img: HTMLImageElement;
  containerWidth: number;
  containerHeight: number;
  resolution: number;
  characters: string;
  strength: number;
  reverse: boolean;
  motionEnabled: boolean;
};

function clampUnit(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function clampCharacterIndex(index: number, characterCount: number) {
  if (characterCount <= 0) {
    return 0;
  }

  return Math.min(characterCount - 1, Math.max(0, index));
}

type GridDimensions = {
  cols: number;
  rows: number;
  cellSize: number;
};

type GridDimensionOptions = {
  containerWidth: number;
  containerHeight: number;
  resolution: number;
  motionEnabled: boolean;
  maxAnimatedCells?: number;
};

export function computeAsciiGridDimensions({
  containerWidth,
  containerHeight,
  resolution,
  motionEnabled,
  maxAnimatedCells = MAX_ANIMATED_CELLS,
}: GridDimensionOptions): GridDimensions | null {
  const normalizedResolution = Number.isFinite(resolution) && resolution > 0 ? resolution : 0.15;
  let cellSize = Math.max(4, Math.round(normalizedResolution * 60));
  let cols = Math.floor(containerWidth / cellSize);
  let rows = Math.floor(containerHeight / (cellSize * 2));

  if (cols <= 0 || rows <= 0) {
    return null;
  }

  if (motionEnabled) {
    const totalCells = cols * rows;
    if (totalCells > maxAnimatedCells) {
      const scale = Math.sqrt(totalCells / maxAnimatedCells);
      cellSize = Math.ceil(cellSize * scale);
      cols = Math.floor(containerWidth / cellSize);
      rows = Math.floor(containerHeight / (cellSize * 2));
    }
  }

  if (cols <= 0 || rows <= 0) {
    return null;
  }

  return { cols, rows, cellSize };
}

type ShimmerStateInput = {
  cellIndex: number;
  characterIndex: number;
  phase: number;
  motionIntensity: number;
};

type ShimmerState = {
  isActive: boolean;
  indexShift: -1 | 0 | 1;
};

type MotionGateInput = {
  motionEnabled: boolean;
  isVisible: boolean;
  prefersReducedMotion: boolean;
};

type ShimmerTintInput = {
  shimmerActive: boolean;
  shimmerTintStrength: number;
  shimmerTintColor?: string;
};

function pseudoRandom(seedA: number, seedB: number) {
  const value = Math.sin(seedA * 12.9898 + seedB * 78.233) * 43_758.5453;
  return value - Math.floor(value);
}

export function getShimmerState({
  cellIndex,
  characterIndex,
  phase,
  motionIntensity,
}: ShimmerStateInput): ShimmerState {
  const normalizedIntensity = clampUnit(motionIntensity);
  if (normalizedIntensity <= 0 || characterIndex < 0) {
    return { isActive: false, indexShift: 0 };
  }

  const activationNoise = pseudoRandom(cellIndex + characterIndex * 131, phase * 0.025 + 17.13);
  const activationThreshold = 0.92 - normalizedIntensity * 0.6;
  if (activationNoise < activationThreshold) {
    return { isActive: false, indexShift: 0 };
  }

  const shiftNoise = pseudoRandom(cellIndex * 7 + characterIndex * 17, phase * 0.06 + 3.33);
  return {
    isActive: true,
    indexShift: shiftNoise < 0.5 ? -1 : 1,
  };
}

export function shouldAnimateAsciiMotion({
  motionEnabled,
  isVisible,
  prefersReducedMotion,
}: MotionGateInput) {
  return motionEnabled && isVisible && !prefersReducedMotion;
}

export function shouldApplyShimmerTint({
  shimmerActive,
  shimmerTintStrength,
  shimmerTintColor,
}: ShimmerTintInput) {
  return shimmerActive && Boolean(shimmerTintColor) && clampUnit(shimmerTintStrength) > 0;
}

function resolveCharacters({
  characterPalette,
  characters,
}: {
  characterPalette?: AsciiCharacterPalette;
  characters?: string;
}) {
  if (characters && characters.trim().length > 0) {
    return characters;
  }

  if (characterPalette) {
    return ASCII_CHARACTER_PALETTES[characterPalette];
  }

  return DEFAULT_CHARACTERS;
}

/**
 * Samples pixels from an image and creates a grid of ASCII characters
 * based on luminance values
 */
function sampleImageToAscii({
  img,
  containerWidth,
  containerHeight,
  resolution,
  characters,
  strength,
  reverse,
  motionEnabled,
}: SampleOptions): CharacterGrid | null {
  if (!img.complete || img.naturalWidth === 0) {
    return null;
  }

  // Calculate grid dimensions based on resolution
  // resolution controls character density:
  // - 0.05 -> very fine detail, tiny chars (~200 cols per 800px)
  // - 0.1 -> fine detail (~130 cols per 800px)
  // - 0.15 -> medium detail (~90 cols per 800px)
  // - 0.3 -> coarse, larger chars (~45 cols per 800px)
  const dimensions = computeAsciiGridDimensions({
    containerWidth,
    containerHeight,
    resolution,
    motionEnabled,
  });
  if (!dimensions) {
    return null;
  }

  const { cols, rows } = dimensions; // chars are roughly 2x taller than wide

  // Create an offscreen canvas to sample the image
  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return null;
  }

  // Draw the image scaled down to our grid size
  ctx.drawImage(img, 0, 0, cols, rows);

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, cols, rows);
  const pixels = imageData.data;

  const chars: string[] = [];
  const indices: number[] = [];
  const charCount = characters.length;
  if (charCount === 0) {
    return null;
  }

  // Sample each pixel and map to a character
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const r = pixels[i] ?? 0;
      const g = pixels[i + 1] ?? 0;
      const b = pixels[i + 2] ?? 0;
      const a = pixels[i + 3] ?? 255;

      // Calculate luminance (0-255)
      const luminance = LUMINANCE_R * r + LUMINANCE_G * g + LUMINANCE_B * b;

      // Adjust for alpha
      const adjustedLuminance = (luminance * a) / 255;

      // Map luminance to character index
      const normalizedLuminance = adjustedLuminance / 255;
      const contrast = Number.isFinite(strength) ? Math.max(0, strength) : 1;
      const contrastedLuminance = clampUnit((normalizedLuminance - 0.5) * contrast + 0.5);
      const mappedLuminance = reverse ? contrastedLuminance : 1 - contrastedLuminance;
      const rawIndex = Math.floor(mappedLuminance * charCount);
      const charIndex = clampCharacterIndex(rawIndex, charCount);

      indices.push(charIndex);
      chars.push(characters[charIndex] ?? " ");
    }
  }

  return {
    chars,
    indices,
    characterSet: characters,
    cols,
    rows,
    cellWidth: containerWidth / cols,
    cellHeight: containerHeight / rows,
  };
}

/**
 * Canvas 2D ASCII renderer
 */
function AsciiCanvas({
  grid,
  color,
  isVisible,
  motionEnabled,
  motionIntensity,
  motionSpeed,
  shimmerTintStrength,
  shimmerTintColor,
  prefersReducedMotion,
}: {
  grid: CharacterGrid;
  color: string;
  isVisible: boolean;
  motionEnabled: boolean;
  motionIntensity: number;
  motionSpeed: number;
  shimmerTintStrength: number;
  shimmerTintColor?: string;
  prefersReducedMotion: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const phaseRef = useRef(0);

  const shouldAnimate = shouldAnimateAsciiMotion({
    motionEnabled,
    isVisible,
    prefersReducedMotion,
  });

  const render = useCallback(
    (phase: number, animate: boolean) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

      const { chars, indices, characterSet, cols, rows, cellWidth, cellHeight } = grid;
      const characterCount = characterSet.length;
      const tintAlpha = clampUnit(shimmerTintStrength);
      const normalizedIntensity = clampUnit(motionIntensity);
      const normalizedSpeed = Number.isFinite(motionSpeed) && motionSpeed > 0 ? motionSpeed : 1;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Scale for retina (canvas is 2x the CSS size)
      ctx.save();
      ctx.scale(2, 2);

      // Set font - scale to fit cell while maintaining readability
      const fontSize = Math.max(4, Math.min(cellWidth * 0.9, cellHeight * 0.6));
      ctx.font = `${fontSize}px "SF Mono", "Fira Code", "Monaco", "Consolas", monospace`;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Render each character
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cellIndex = y * cols + x;
          const baseChar = chars[cellIndex];
          const baseIndex = indices[cellIndex] ?? characterCount - 1;

          if (!baseChar || baseChar === " ") {
            continue;
          }

          let renderedIndex = baseIndex;
          let shimmerActive = false;

          if (animate && characterCount > 0) {
            const shimmerState = getShimmerState({
              cellIndex,
              characterIndex: baseIndex,
              phase: phase * normalizedSpeed,
              motionIntensity: normalizedIntensity,
            });

            shimmerActive = shimmerState.isActive;
            renderedIndex = clampCharacterIndex(
              baseIndex + shimmerState.indexShift,
              characterCount,
            );
          }

          const char = characterSet[renderedIndex] ?? " ";
          if (!char || char === " ") {
            continue;
          }

          // Calculate position (center of cell)
          const px = x * cellWidth + cellWidth / 2;
          const py = y * cellHeight + cellHeight / 2;

          ctx.fillText(char, px, py);

          if (
            animate &&
            shouldApplyShimmerTint({
              shimmerActive,
              shimmerTintStrength: tintAlpha,
              shimmerTintColor,
            })
          ) {
            ctx.fillStyle = shimmerTintColor ?? color;
            ctx.globalAlpha = tintAlpha;
            ctx.fillText(char, px, py);
            ctx.fillStyle = color;
            ctx.globalAlpha = 1;
          }
        }
      }

      // Restore canvas state (undo scale)
      ctx.restore();
    },
    [grid, color, shimmerTintStrength, shimmerTintColor, motionIntensity, motionSpeed],
  );

  useLayoutEffect(() => {
    if (!isVisible) {
      return;
    }

    render(0, false);
  }, [render, isVisible]);

  useEffect(() => {
    if (!shouldAnimate) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    lastTickRef.current = 0;
    phaseRef.current = 0;

    const tick = (timestamp: number) => {
      if (timestamp - lastTickRef.current >= ANIMATION_FRAME_INTERVAL_MS) {
        lastTickRef.current = timestamp;
        phaseRef.current += 1;
        render(phaseRef.current, true);
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [render, shouldAnimate]);

  // Set canvas size
  const width = grid.cols * grid.cellWidth;
  const height = grid.rows * grid.cellHeight;

  return (
    <canvas
      height={height * 2} // 2x for retina
      ref={canvasRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
      width={width * 2} // 2x for retina
    />
  );
}

export function AsciiImage({
  src,
  alt,
  className,
  asciiOpacity = 0.35,
  imageOpacity = 1,
  imageMonochrome = false,
  characterPalette,
  characters,
  resolution = 0.15,
  strength = 1.3,
  reverse = false,
  motionEnabled = false,
  motionIntensity = 0.1,
  motionSpeed = 1,
  shimmerTintStrength = 0,
  shimmerTintColor,
  asciiBlendMode,
  priority = false,
}: AsciiImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [grid, setGrid] = useState<CharacterGrid | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { resolvedTheme } = useTheme();

  // Ensure we're on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reduce/disable shimmer for users that opt out of motion
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => {
      setPrefersReducedMotion(query.matches);
    };

    handleChange();

    if (query.addEventListener) {
      query.addEventListener("change", handleChange);
      return () => query.removeEventListener("change", handleChange);
    }

    query.addListener(handleChange);
    return () => query.removeListener(handleChange);
  }, []);

  // Intersection Observer for visibility detection
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Debounced resize handler
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.floor(width),
          height: Math.floor(height),
        });
      }
    };

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, RESIZE_DEBOUNCE_MS);
    };

    updateDimensions();
    window.addEventListener("resize", debouncedUpdate);

    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, []);

  const resolvedCharacters = useMemo(
    () => resolveCharacters({ characterPalette, characters }),
    [characterPalette, characters],
  );

  // Generate ASCII grid when image loads or dimensions change
  const regenerateGrid = useCallback(() => {
    if (!imgRef.current || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    const newGrid = sampleImageToAscii({
      img: imgRef.current,
      containerWidth: dimensions.width,
      containerHeight: dimensions.height,
      resolution,
      characters: resolvedCharacters,
      strength,
      reverse,
      motionEnabled,
    });

    if (newGrid) {
      setGrid(newGrid);
    }
  }, [
    dimensions.width,
    dimensions.height,
    resolution,
    resolvedCharacters,
    strength,
    reverse,
    motionEnabled,
  ]);

  // Regenerate on dimension changes
  useLayoutEffect(() => {
    regenerateGrid();
  }, [regenerateGrid]);

  // Handle image load
  const handleImageLoad = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      imgRef.current = event.currentTarget;
      regenerateGrid();
    },
    [regenerateGrid],
  );

  // Determine text color based on theme
  const textColor = useMemo(
    () => (resolvedTheme === "dark" ? "#ffffff" : "#000000"),
    [resolvedTheme],
  );
  const resolvedBlendMode = asciiBlendMode ?? (resolvedTheme === "dark" ? "screen" : "multiply");

  const canRenderAscii = isClient && grid && dimensions.width > 0 && dimensions.height > 0;

  return (
    <div className={cn("relative overflow-hidden", className)} ref={containerRef}>
      {/* Base Image (Layer 0) */}
      <Image
        alt={alt}
        className={cn(
          "absolute inset-0 h-full w-full object-cover",
          imageMonochrome ? "grayscale" : null,
        )}
        crossOrigin="anonymous"
        fill
        onLoad={handleImageLoad}
        priority={priority}
        src={src}
        style={{ opacity: imageOpacity }}
      />

      {/* ASCII Overlay (Layer 1) */}
      {canRenderAscii && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{
            opacity: asciiOpacity,
            mixBlendMode: resolvedBlendMode,
          }}
        >
          <AsciiCanvas
            color={textColor}
            grid={grid}
            isVisible={isVisible}
            motionEnabled={motionEnabled}
            motionIntensity={motionIntensity}
            motionSpeed={motionSpeed}
            prefersReducedMotion={prefersReducedMotion}
            shimmerTintColor={shimmerTintColor}
            shimmerTintStrength={shimmerTintStrength}
          />
        </div>
      )}
    </div>
  );
}
