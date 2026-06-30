"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { SectionHeader } from "./section-header";
import color from "color";

interface TextColorPropertyProps {
  color: string;
  onColorChange: (color: string) => void;
}

export function TextColorProperty({ color: textColor, onColorChange }: TextColorPropertyProps) {
  const [colorOpen, setColorOpen] = useState(false);

  const hasColor = textColor && textColor !== "" && textColor !== "transparent";

  const handleAdd = () => {
    onColorChange("#ffffff");
  };

  const handleRemove = () => {
    onColorChange("transparent");
  };

  return (
    <Collapsible open={!!hasColor}>
      <SectionHeader
        title="Text Color"
        hasContent={!!hasColor}
        onAdd={handleAdd}
        onRemove={handleRemove}
      />
      <CollapsibleContent>
        <div className="py-1 flex flex-col">
          <div className="flex items-center justify-between py-1 gap-4">
            <span className="text-xs text-muted-foreground">Color</span>
            <InputGroup className="w-[160px] h-7">
              <InputGroupAddon align="inline-start" className="relative p-0">
                <Popover modal={true} open={colorOpen} onOpenChange={setColorOpen}>
                  <PopoverTrigger asChild>
                    <InputGroupButton variant="ghost" size="icon-xs" className="h-full w-8 pl-2">
                      <div
                        className="h-4 w-4 border border-input shadow-sm"
                        style={{ backgroundColor: textColor || "#ffffff" }}
                      />
                    </InputGroupButton>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="start">
                    <ColorPicker
                      onChange={(colorValue: any) => {
                        const hexColor = color.rgb((colorValue as number[]).slice(0, 3)).hex();
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
                value={(textColor || "#ffffff").toUpperCase()}
                onChange={(e) => onColorChange(e.target.value)}
                className="text-xs p-0 font-mono"
              />
            </InputGroup>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
