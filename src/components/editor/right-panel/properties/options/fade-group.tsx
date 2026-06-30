"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { NumberInput } from "@/components/ui/number-input";
import { useSliderThrottle } from "../hooks/use-slider-throttle";

interface FadeGroupPropertyProps {
  fadeInDuration: number;
  fadeOutDuration: number;
  onFadeInChange: (val: number) => void;
  onFadeOutChange: (val: number) => void;
  max?: number;
}

export function FadeGroupProperty({
  fadeInDuration,
  fadeOutDuration,
  onFadeInChange,
  onFadeOutChange,
  max = 5000,
}: FadeGroupPropertyProps) {
  const fadeIn = useSliderThrottle(fadeInDuration, onFadeInChange);
  const fadeOut = useSliderThrottle(fadeOutDuration, onFadeOutChange);

  return (
    <div className="flex flex-col">
      {/* Section Header */}
      <div className="flex items-center justify-between py-2">
        <span className="text-xs font-semibold text-foreground">Fade</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-5 text-muted-foreground hover:text-foreground"
        >
          <span className="text-base leading-none">+</span>
        </Button>
      </div>

      <div className="py-1 flex flex-col">
        {/* Fade In */}
        <div className="flex items-center justify-between py-1 gap-4">
          <span className="text-xs text-muted-foreground">Fade-in</span>
          <div className="flex items-center gap-2 w-[160px]">
            <Slider
              value={[fadeIn.localValue]}
              onValueChange={(v) => fadeIn.handleChange(v[0])}
              onValueCommit={(v) => fadeIn.handleCommit(v[0])}
              min={0}
              max={max}
              step={100}
              className="flex-1"
            />
            <InputGroup className="w-16 h-7">
              <NumberInput
                value={fadeIn.localValue}
                onChange={(val) => fadeIn.handleDirectSet(val || 0)}
                className="pl-1 bg-transparent text-xs!"
                step={100}
              />
              <InputGroupAddon align="inline-end">
                <span className="text-[10px] text-muted-foreground">ms</span>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>

        {/* Fade Out */}
        <div className="flex items-center justify-between py-1 gap-4">
          <span className="text-xs text-muted-foreground">Fade-out</span>
          <div className="flex items-center gap-2 w-[160px]">
            <Slider
              value={[fadeOut.localValue]}
              onValueChange={(v) => fadeOut.handleChange(v[0])}
              onValueCommit={(v) => fadeOut.handleCommit(v[0])}
              min={0}
              max={max}
              step={100}
              className="flex-1"
            />
            <InputGroup className="w-16 h-7">
              <NumberInput
                value={fadeOut.localValue}
                onChange={(val) => fadeOut.handleDirectSet(val || 0)}
                className="pl-1 bg-transparent text-xs!"
                step={100}
              />
              <InputGroupAddon align="inline-end">
                <span className="text-[10px] text-muted-foreground">ms</span>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
