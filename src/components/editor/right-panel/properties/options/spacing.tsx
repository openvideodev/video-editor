"use client";

import { RiArrowUpDownLine } from "@remixicon/react";
import { Slider } from "@/components/ui/slider";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { NumberInput } from "@/components/ui/number-input";
import { useSliderThrottle } from "../hooks/use-slider-throttle";

interface SpacingPropertyProps {
  lineHeight: number;
  letterSpacing?: number;
  onLineHeightChange: (val: number) => void;
  onLetterSpacingChange?: (val: number) => void;
}

export function SpacingProperty({
  lineHeight,
  letterSpacing,
  onLineHeightChange,
  onLetterSpacingChange,
}: SpacingPropertyProps) {
  const lh = useSliderThrottle(lineHeight || 1.2, onLineHeightChange);
  const ls = useSliderThrottle(letterSpacing || 0, onLetterSpacingChange ?? (() => {}));

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        Spacing
      </label>

      {/* Line Height */}
      <div className="flex items-center gap-4">
        <RiArrowUpDownLine className="size-4 text-muted-foreground" />
        <Slider
          value={[lh.localValue]}
          onValueChange={(v) => lh.handleChange(v[0])}
          onValueCommit={(v) => lh.handleCommit(v[0])}
          min={0.5}
          max={3}
          step={0.1}
          className="flex-1"
        />
        <InputGroup className="w-20 h-7">
          <NumberInput
            value={lh.localValue}
            onChange={(val) => lh.handleDirectSet(val)}
            step={0.1}
            className="p-0 text-center"
          />
        </InputGroup>
      </div>

      {/* Letter Spacing */}
      {onLetterSpacingChange && letterSpacing !== undefined && (
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-muted-foreground w-4">A</span>
          <Slider
            value={[ls.localValue]}
            onValueChange={(v) => ls.handleChange(v[0])}
            onValueCommit={(v) => ls.handleCommit(v[0])}
            min={-5}
            max={20}
            step={0.5}
            className="flex-1"
          />
          <InputGroup className="w-20 h-7">
            <NumberInput
              value={ls.localValue}
              onChange={(val) => ls.handleDirectSet(val)}
              step={0.5}
              className="p-0 text-center"
            />
            <InputGroupAddon align="inline-end" className="p-0 pr-2">
              <span className="text-[10px] text-muted-foreground">px</span>
            </InputGroupAddon>
          </InputGroup>
        </div>
      )}
    </div>
  );
}
