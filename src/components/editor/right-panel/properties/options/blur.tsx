"use client";

import { Slider } from "@/components/ui/slider";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { NumberInput } from "@/components/ui/number-input";
import { useSliderThrottle } from "../hooks/use-slider-throttle";

interface BlurPropertyProps {
  value: number;
  onChange: (val: number) => void;
  max?: number;
}

export function BlurProperty({ value, onChange, max = 20 }: BlurPropertyProps) {
  const { localValue, handleChange, handleCommit, handleDirectSet } = useSliderThrottle(
    value || 0,
    onChange,
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        Blur
      </label>
      <div className="flex items-center gap-4">
        <Slider
          value={[localValue]}
          onValueChange={(v) => handleChange(v[0])}
          onValueCommit={(v) => handleCommit(v[0])}
          max={max}
          step={0.5}
          className="flex-1"
        />
        <InputGroup className="w-20 h-7">
          <NumberInput
            value={localValue}
            onChange={(val) => handleDirectSet(val || 0)}
            step={0.5}
            className="p-0 text-center"
          />
          <InputGroupAddon align="inline-end" className="p-0 pr-2">
            <span className="text-[10px] text-muted-foreground">px</span>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}
