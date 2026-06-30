"use client";

import {
  ColorPicker,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from "@/components/ui/color-picker";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { NumberInput } from "@/components/ui/number-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import color from "color";
import { useSliderThrottle } from "../hooks/use-slider-throttle";
import { SectionHeader } from "./section-header";

interface ChromaKeyPropertyProps {
  enabled: boolean;
  color: string;
  similarity: number;
  spill: number;
  onEnabledChange: (enabled: boolean) => void;
  onColorChange: (color: string) => void;
  onSimilarityChange: (val: number) => void;
  onSpillChange: (val: number) => void;
}

export function ChromaKeyProperty({
  enabled,
  color: chromaColor,
  similarity,
  spill,
  onEnabledChange,
  onColorChange,
  onSimilarityChange,
  onSpillChange,
}: ChromaKeyPropertyProps) {
  const toPercent = (v: number) => Math.round((v ?? 0) * 100);
  const fromPercent = (v: number) => v / 100;

  const sim = useSliderThrottle(toPercent(similarity ?? 0.1), (pct) =>
    onSimilarityChange(fromPercent(pct)),
  );
  const sp = useSliderThrottle(toPercent(spill ?? 0.05), (pct) => onSpillChange(fromPercent(pct)));

  return (
    <Collapsible open={enabled}>
      <SectionHeader
        title="Chroma Key"
        hasContent={enabled}
        onAdd={() => onEnabledChange(true)}
        onRemove={() => onEnabledChange(false)}
      />
      <CollapsibleContent>
        <div className="py-1 flex flex-col">
          {/* Key Color */}
          <div className="flex items-center justify-between py-1 gap-4">
            <span className="text-xs text-muted-foreground">Key Color</span>
            <InputGroup className="w-[160px] h-7">
              <InputGroupAddon align="inline-start" className="relative p-0">
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <InputGroupButton variant="ghost" size="icon-xs" className="h-full w-8 pl-2">
                      <div
                        className="h-5 w-5 border border-input shadow-sm"
                        style={{ backgroundColor: chromaColor || "#FFFFFF" }}
                      />
                    </InputGroupButton>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="start">
                    <ColorPicker
                      value={color(chromaColor || "#FFFFFF")
                        .hsv()
                        .array()}
                      onChange={(val) => {
                        const [h, s, v] = val as number[];
                        const rgb = color({ h, s, v }).rgb().array();
                        onColorChange(
                          `rgb(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])})`,
                        );
                      }}
                      className="w-full"
                    >
                      <div className="flex flex-col gap-3">
                        <ColorPickerSelection className="min-h-32 w-full shadow-sm" />
                        <div className="flex flex-col gap-2">
                          <ColorPickerHue />
                          <ColorPickerEyeDropper />
                        </div>
                        <div className="flex gap-1">
                          <ColorPickerFormat />
                          <ColorPickerFormat />
                          <ColorPickerFormat />
                        </div>
                        <ColorPickerOutput className="text-center" />
                      </div>
                    </ColorPicker>
                  </PopoverContent>
                </Popover>
              </InputGroupAddon>
              <InputGroupInput
                value={chromaColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="text-xs! p-0 font-mono"
              />
            </InputGroup>
          </div>

          {/* Similarity */}
          <div className="flex items-center justify-between py-1 gap-4">
            <span className="text-xs text-muted-foreground">Similarity</span>
            <div className="flex items-center gap-2 w-[160px]">
              <Slider
                value={[sim.localValue]}
                onValueChange={(v) => sim.handleChange(v[0])}
                onValueCommit={(v) => sim.handleCommit(v[0])}
                max={100}
                step={1}
                className="flex-1"
              />
              <InputGroup className="w-14 h-7">
                <NumberInput
                  value={sim.localValue}
                  onChange={(val) => sim.handleDirectSet(val || 0)}
                  className="pl-1 bg-transparent text-xs!"
                />
                <InputGroupAddon align="inline-end">
                  <span className="text-[10px] text-muted-foreground">%</span>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>

          {/* Spill */}
          <div className="flex items-center justify-between py-1 gap-4">
            <span className="text-xs text-muted-foreground">Spill</span>
            <div className="flex items-center gap-2 w-[160px]">
              <Slider
                value={[sp.localValue]}
                onValueChange={(v) => sp.handleChange(v[0])}
                onValueCommit={(v) => sp.handleCommit(v[0])}
                max={100}
                step={1}
                className="flex-1"
              />
              <InputGroup className="w-14 h-7">
                <NumberInput
                  value={sp.localValue}
                  onChange={(val) => sp.handleDirectSet(val || 0)}
                  className="pl-1 bg-transparent text-xs!"
                />
                <InputGroupAddon align="inline-end">
                  <span className="text-[10px] text-muted-foreground">%</span>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
