"use client";

import React, { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerOutput,
} from "@/components/ui/color-picker";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { NumberInput } from "@/components/ui/number-input";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { SectionHeader } from "./section-header";
import color from "color";

interface TextBackgroundPropertyProps {
  backgroundColor?: string;
  backgroundOpacity?: number;
  backgroundBorderRadius?: number;
  backgroundPaddingX?: number;
  backgroundPaddingY?: number;
  onBackgroundColorChange?: (val: string) => void;
  onBackgroundOpacityChange?: (val: number) => void;
  onBackgroundBorderRadiusChange?: (val: number) => void;
  onBackgroundPaddingXChange?: (val: number) => void;
  onBackgroundPaddingYChange?: (val: number) => void;
}

export function TextBackgroundProperty({
  backgroundColor,
  backgroundOpacity,
  backgroundBorderRadius,
  backgroundPaddingX,
  backgroundPaddingY,
  onBackgroundColorChange,
  onBackgroundOpacityChange,
  onBackgroundBorderRadiusChange,
  onBackgroundPaddingXChange,
  onBackgroundPaddingYChange,
}: TextBackgroundPropertyProps) {
  const [bgColorOpen, setBgColorOpen] = useState(false);
  const bgEnabled =
    !!backgroundColor && backgroundColor !== "" && backgroundColor !== "transparent";
  const [localBgColor, setLocalBgColor] = useState(backgroundColor || "#000000");

  useEffect(() => {
    setLocalBgColor(backgroundColor || "#000000");
  }, [backgroundColor]);

  return (
    <Collapsible open={bgEnabled}>
      <SectionHeader
        title="Text Background"
        hasContent={bgEnabled}
        onAdd={() => onBackgroundColorChange?.(backgroundColor || "#000000")}
        onRemove={() => onBackgroundColorChange?.("")}
      />
      <CollapsibleContent>
        <div className="py-1 flex flex-col gap-1">
          {/* Bg Color */}
          <div className="flex items-center justify-between py-1 gap-4">
            <span className="text-xs text-muted-foreground">Color</span>
            <InputGroup className="w-[160px] h-7">
              <InputGroupAddon align="inline-start" className="relative p-0">
                <Popover modal={true} open={bgColorOpen} onOpenChange={setBgColorOpen}>
                  <PopoverTrigger asChild>
                    <InputGroupButton variant="ghost" size="icon-xs" className="h-full w-8 pl-2">
                      <div
                        className="h-5 w-5 border border-input shadow-sm"
                        style={{ backgroundColor: localBgColor }}
                      />
                    </InputGroupButton>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="start">
                    <ColorPicker
                      value={localBgColor}
                      onChange={(colorValue: any) => {
                        const hexColor = color.rgb((colorValue as number[]).slice(0, 3)).hex();
                        setLocalBgColor(hexColor);
                        onBackgroundColorChange?.(hexColor);
                      }}
                      className="w-72 h-72 border bg-background p-4 shadow-sm"
                    >
                      <ColorPickerSelection />
                      <div className="flex items-center gap-4">
                        <ColorPickerEyeDropper />
                        <div className="grid w-full gap-1">
                          <ColorPickerHue />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ColorPickerOutput />
                        <ColorPickerFormat />
                      </div>
                    </ColorPicker>
                  </PopoverContent>
                </Popover>
              </InputGroupAddon>
              <InputGroupInput
                value={localBgColor.toUpperCase()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setLocalBgColor(e.target.value);
                  onBackgroundColorChange?.(e.target.value);
                }}
                className="text-xs! p-0"
              />
            </InputGroup>
          </div>

          {/* Bg Opacity */}
          <div className="flex items-center justify-between py-1 gap-4">
            <span className="text-xs text-muted-foreground">Opacity</span>
            <div className="flex items-center gap-2 w-[160px]">
              <Slider
                value={[backgroundOpacity ?? 1]}
                onValueChange={([v]) => onBackgroundOpacityChange?.(v)}
                min={0}
                max={1}
                step={0.05}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-7 text-right tabular-nums">
                {Math.round((backgroundOpacity ?? 1) * 100)}%
              </span>
            </div>
          </div>

          {/* Bg Border Radius */}
          <div className="flex items-center justify-between py-1 gap-4">
            <span className="text-xs text-muted-foreground">Radius</span>
            <InputGroup className="w-[160px]">
              <NumberInput
                value={backgroundBorderRadius ?? 4}
                onChange={(v) => onBackgroundBorderRadiusChange?.(v)}
                min={0}
                className="pl-2 bg-transparent text-xs!"
              />
              <InputGroupAddon align="inline-end">
                <span className="text-xs text-muted-foreground">px</span>
              </InputGroupAddon>
            </InputGroup>
          </div>

          {/* Bg Horizontal Padding */}
          <div className="flex items-center justify-between py-1 gap-4">
            <span className="text-xs text-muted-foreground">Pad X</span>
            <InputGroup className="w-[160px]">
              <NumberInput
                value={backgroundPaddingX ?? 8}
                onChange={(v) => onBackgroundPaddingXChange?.(v)}
                min={0}
                className="pl-2 bg-transparent text-xs!"
              />
              <InputGroupAddon align="inline-end">
                <span className="text-xs text-muted-foreground">px</span>
              </InputGroupAddon>
            </InputGroup>
          </div>

          {/* Bg Vertical Padding */}
          <div className="flex items-center justify-between py-1 gap-4">
            <span className="text-xs text-muted-foreground">Pad Y</span>
            <InputGroup className="w-[160px]">
              <NumberInput
                value={backgroundPaddingY ?? 4}
                onChange={(v) => onBackgroundPaddingYChange?.(v)}
                min={0}
                className="pl-2 bg-transparent text-xs!"
              />
              <InputGroupAddon align="inline-end">
                <span className="text-xs text-muted-foreground">px</span>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
