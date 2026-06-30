"use client";

import { useState } from "react";
import { RiArrowUpDownLine } from "@remixicon/react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
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
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { NumberInput } from "@/components/ui/number-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SectionHeader } from "./section-header";
import color from "color";

interface StrokePropertyProps {
  open: boolean;
  onAdd: () => void;
  onRemove: () => void;
  color: string;
  width: number;
  onColorChange: (val: string) => void;
  onWidthChange: (val: number) => void;
}

export function StrokeProperty({
  open,
  onAdd,
  onRemove,
  color: strokeColor,
  width,
  onColorChange,
  onWidthChange,
}: StrokePropertyProps) {
  const [colorOpen, setColorOpen] = useState(false);

  return (
    <Collapsible open={open}>
      <SectionHeader title="Stroke" hasContent={open} onAdd={onAdd} onRemove={onRemove} />
      <CollapsibleContent>
        <div className="py-1 flex flex-col">
          {/* Color */}
          <div className="flex items-center justify-between py-1 gap-4">
            <span className="text-xs text-muted-foreground">Color</span>
            <InputGroup className="w-[160px] h-7">
              <InputGroupAddon align="inline-start" className="relative p-0">
                <Popover modal={true} open={colorOpen} onOpenChange={setColorOpen}>
                  <PopoverTrigger asChild>
                    <InputGroupButton variant="ghost" size="icon-xs" className="h-full w-8 pl-2">
                      <div
                        className="h-4 w-4 border border-input shadow-sm"
                        style={{ backgroundColor: strokeColor || "#FFFFFF" }}
                      />
                    </InputGroupButton>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="start">
                    <ColorPicker
                      onChange={(colorValue) => {
                        const hexColor = color.rgb(colorValue as number[]).hex();
                        onColorChange(hexColor);
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
                value={(strokeColor || "#FFFFFF").toUpperCase()}
                onChange={(e) => onColorChange(e.target.value)}
                className="text-xs p-0 font-mono"
              />
            </InputGroup>
          </div>

          {/* Width */}
          <div className="flex items-center justify-between py-1 gap-4">
            <span className="text-xs text-muted-foreground">Width</span>
            <InputGroup className="w-[160px]">
              <InputGroupAddon align="inline-start">
                <RiArrowUpDownLine className="size-3.5" />
              </InputGroupAddon>
              <NumberInput
                value={width || 0}
                onChange={onWidthChange}
                className="pl-1 bg-transparent text-xs!"
              />
            </InputGroup>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
