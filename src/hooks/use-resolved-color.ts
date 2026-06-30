import { useEffect, useState, RefObject } from "react";

/**
 * A custom React hook that dynamically resolves a CSS variable (e.g. `--card`, `--background`)
 * into a `#RRGGBB` hex string from a given container element.
 *
 * It listens to document theme changes (e.g. dark/light class updates on the document element)
 * to automatically update and return the resolved color.
 *
 * @param ref React ref pointing to the container element
 * @param cssVarName The CSS variable name (e.g. "--card")
 * @param fallbackColor Fallback color to use if resolution fails (defaults to "#000000")
 * @returns Resolved hex color string
 */
export function useResolvedColor(
  ref: RefObject<HTMLElement | null>,
  cssVarName: string,
  fallbackColor: string = "#000000",
): string {
  const [resolvedColor, setResolvedColor] = useState(fallbackColor);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resolveColor = () => {
      const rawValue = window.getComputedStyle(element).getPropertyValue(cssVarName).trim();

      if (!rawValue) {
        setResolvedColor(fallbackColor);
        return;
      }
      try {
        const scratch = document.createElement("canvas");
        scratch.width = 1;
        scratch.height = 1;
        const ctx = scratch.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          setResolvedColor(fallbackColor);
          return;
        }
        ctx.fillStyle = rawValue;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        const toHex = (c: number) => {
          const hex = c.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        };

        setResolvedColor(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
      } catch {
        setResolvedColor(fallbackColor);
      }
    };

    // Resolve initially
    resolveColor();

    // Set up MutationObserver to watch for dark/light class/style changes on documentElement
    const observer = new MutationObserver(() => {
      resolveColor();
    });

    observer.observe(document.documentElement, {
      attributeFilter: ["class", "style"],
      attributes: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [ref, cssVarName, fallbackColor]);

  return resolvedColor;
}
