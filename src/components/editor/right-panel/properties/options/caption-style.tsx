"use client";

import { RiArrowUpDownLine, RiBold, RiItalic, RiText } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { NumberInput } from "@/components/ui/number-input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSliderThrottle } from "../hooks/use-slider-throttle";

interface CaptionStylePropertyProps {
  fontSize: number;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textTransform: "none" | "uppercase" | "lowercase";
  lineHeight: number;
  onFontSizeChange: (val: number) => void;
  onFontWeightChange: (val: "normal" | "bold") => void;
  onFontStyleChange: (val: "normal" | "italic") => void;
  onTextTransformChange: (val: "none" | "uppercase" | "lowercase") => void;
  onLineHeightChange: (val: number) => void;
}

export function CaptionStyleProperty({
  fontSize,
  fontWeight,
  fontStyle,
  textTransform,
  lineHeight,
  onFontSizeChange,
  onFontWeightChange,
  onFontStyleChange,
  onTextTransformChange,
  onLineHeightChange,
}: CaptionStylePropertyProps) {
  const fs = useSliderThrottle(fontSize || 24, onFontSizeChange);
  const lh = useSliderThrottle(lineHeight || 1.4, onLineHeightChange);

  return (
    <div className="flex flex-col gap-3">
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        Style
      </label>

      {/* Font Size */}
      <div className="flex items-center gap-4">
        <RiText className="size-4 text-muted-foreground" />
        <Slider
          value={[fs.localValue]}
          onValueChange={(v) => fs.handleChange(v[0])}
          onValueCommit={(v) => fs.handleCommit(v[0])}
          min={12}
          max={72}
          step={1}
          className="flex-1"
        />
        <InputGroup className="w-20 h-7">
          <NumberInput
            value={fs.localValue}
            onChange={(val) => fs.handleDirectSet(val)}
            className="p-0 text-center"
          />
          <InputGroupAddon align="inline-end" className="p-0 pr-2">
            <span className="text-[10px] text-muted-foreground">px</span>
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Line Height */}
      <div className="flex items-center gap-4">
        <RiArrowUpDownLine className="size-4 text-muted-foreground" />
        <Slider
          value={[lh.localValue]}
          onValueChange={(v) => lh.handleChange(v[0])}
          onValueCommit={(v) => lh.handleCommit(v[0])}
          min={1}
          max={2}
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

      {/* Style Toggles */}
      <div className="flex items-center gap-1">
        <Button
          variant={fontWeight === "bold" ? "default" : "outline"}
          size="icon"
          className="size-8"
          onClick={() => onFontWeightChange(fontWeight === "bold" ? "normal" : "bold")}
        >
          <RiBold className="size-4" />
        </Button>
        <Button
          variant={fontStyle === "italic" ? "default" : "outline"}
          size="icon"
          className="size-8"
          onClick={() => onFontStyleChange(fontStyle === "italic" ? "normal" : "italic")}
        >
          <RiItalic className="size-4" />
        </Button>
      </div>

      {/* Text Transform */}
      <Select value={textTransform} onValueChange={(v) => onTextTransformChange(v as any)}>
        <SelectTrigger className="h-7 bg-secondary border text-xs!">
          <SelectValue placeholder="Text transform" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Transform</SelectItem>
          <SelectItem value="uppercase">Uppercase</SelectItem>
          <SelectItem value="lowercase">Lowercase</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
