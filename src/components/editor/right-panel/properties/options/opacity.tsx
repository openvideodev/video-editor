"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { NumberInput } from "@/components/ui/number-input";
import { useSliderThrottle } from "../hooks/use-slider-throttle";

interface OpacityPropertyProps {
  value: number;
  onChange: (val: number) => void;
}

export function OpacityProperty({ value, onChange }: OpacityPropertyProps) {
  // Work in 0–100 percentage space internally
  const toPercent = (v: number) => Math.round(v * 100);
  const fromPercent = (v: number) => v / 100;

  const { localValue, handleChange, handleCommit, handleDirectSet } = useSliderThrottle(
    toPercent(value),
    (pct) => onChange(fromPercent(pct)),
  );

  return (
    <div className="flex flex-col">
      {/* Section Header */}
      <div className="flex items-center justify-between py-2">
        <span className="text-xs font-semibold text-foreground">Opacity</span>
      </div>

      <div className="py-1 flex flex-col">
        <div className="flex items-center justify-between py-1 gap-4">
          <span className="text-xs text-muted-foreground">Opacity</span>
          <div className="flex items-center gap-2 w-[160px]">
            <Slider
              value={[localValue]}
              onValueChange={(v) => handleChange(v[0])}
              onValueCommit={(v) => handleCommit(v[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <InputGroup className="w-14 h-7">
              <NumberInput
                value={localValue}
                onChange={(val) => handleDirectSet(val)}
                className="pl-1 bg-transparent text-xs!"
              />
              <InputGroupAddon align="inline-end">
                <span className="text-[10px] text-muted-foreground">%</span>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
