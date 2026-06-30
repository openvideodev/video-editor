"use client";

import { RiDropLine, RiRulerLine } from "@remixicon/react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  ColorPicker,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from "@/components/ui/color-picker";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { NumberInput } from "@/components/ui/number-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SectionHeader } from "./section-header";
import color from "color";

interface DropShadowPropertyProps {
  open: boolean;
  onAdd: () => void;
  onRemove: () => void;
  distance: number;
  angle: number;
  blur: number;
  color: string;
  alpha: number;
  onDistanceChange: (val: number) => void;
  onAngleChange: (val: number) => void;
  onBlurChange: (val: number) => void;
  onColorChange: (val: string) => void;
  onAlphaChange: (val: number) => void;
}

export function DropShadowProperty({
  open,
  onAdd,
  onRemove,
  distance,
  angle,
  blur,
  color: shadowColor,
  alpha,
  onDistanceChange,
  onAngleChange,
  onBlurChange,
  onColorChange,
  onAlphaChange,
}: DropShadowPropertyProps) {
  const hasShadow = blur > 0 || distance > 0;

  return (
    <Collapsible open={open}>
      <SectionHeader title="Shadow" hasContent={hasShadow} onAdd={onAdd} onRemove={onRemove} />
      <CollapsibleContent>
        <div className="pb-2 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <InputGroup className="h-7">
              <InputGroupAddon align="inline-start">
                <RiRulerLine className="size-3.5" />
              </InputGroupAddon>
              <NumberInput value={distance || 0} onChange={onDistanceChange} />
            </InputGroup>

            <InputGroup className="h-7">
              <InputGroupAddon align="inline-start">
                <span className="text-[10px] text-muted-foreground">°</span>
              </InputGroupAddon>
              <NumberInput value={angle || 0} onChange={onAngleChange} />
            </InputGroup>
          </div>

          <div className="flex gap-2">
            <InputGroup className="flex-1 h-7">
              <InputGroupAddon align="inline-start">
                <RiDropLine className="size-3.5" />
              </InputGroupAddon>
              <NumberInput value={blur || 0} onChange={onBlurChange} />
            </InputGroup>

            <Popover>
              <PopoverTrigger asChild>
                <div
                  className="w-10 h-7 border cursor-pointer shrink-0"
                  style={{ backgroundColor: shadowColor || "#000000" }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <ColorPicker
                  value={color(shadowColor || "#000000")
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
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
