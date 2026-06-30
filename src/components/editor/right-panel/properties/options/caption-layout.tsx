"use client";

import { RiAlignCenter, RiAlignJustify, RiAlignLeft, RiAlignRight } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CaptionLayoutPropertyProps {
  textAlign: "left" | "center" | "right";
  verticalPosition: "top" | "center" | "bottom";
  wordsPerLine: number;
  maxLines: number;
  onTextAlignChange: (val: "left" | "center" | "right") => void;
  onVerticalPositionChange: (val: "top" | "center" | "bottom") => void;
  onWordsPerLineChange: (val: number) => void;
  onMaxLinesChange: (val: number) => void;
}

export function CaptionLayoutProperty({
  textAlign,
  verticalPosition,
  wordsPerLine,
  maxLines,
  onTextAlignChange,
  onVerticalPositionChange,
  onWordsPerLineChange,
  onMaxLinesChange,
}: CaptionLayoutPropertyProps) {
  const alignments = [
    { value: "left" as const, icon: RiAlignLeft },
    { value: "center" as const, icon: RiAlignCenter },
    { value: "right" as const, icon: RiAlignRight },
  ];

  return (
    <div className="flex flex-col gap-3">
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        Layout
      </label>

      {/* Text Align */}
      <div className="flex items-center gap-1">
        {alignments.map(({ value, icon: Icon }) => (
          <Button
            key={value}
            variant={textAlign === value ? "default" : "outline"}
            size="icon"
            className={cn("size-7", textAlign === value && "bg-primary text-primary-foreground")}
            onClick={() => onTextAlignChange(value)}
          >
            <Icon className="size-4" />
          </Button>
        ))}
      </div>

      {/* Vertical Position */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-muted-foreground">Vertical Position</span>
        <Select value={verticalPosition} onValueChange={(v) => onVerticalPositionChange(v as any)}>
          <SelectTrigger className="h-7 bg-secondary border text-xs!">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="top">Top</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="bottom">Bottom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Words Per Line */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-muted-foreground">Words Per Line</span>
        <Select value={String(wordsPerLine)} onValueChange={(v) => onWordsPerLineChange(Number(v))}>
          <SelectTrigger className="h-7 bg-secondary border text-xs!">
            <SelectValue placeholder="Words per line" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 words</SelectItem>
            <SelectItem value="4">4 words</SelectItem>
            <SelectItem value="5">5 words</SelectItem>
            <SelectItem value="6">6 words</SelectItem>
            <SelectItem value="8">8 words</SelectItem>
            <SelectItem value="10">10 words</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Max Lines */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-muted-foreground">Max Lines</span>
        <Select value={String(maxLines)} onValueChange={(v) => onMaxLinesChange(Number(v))}>
          <SelectTrigger className="h-7 bg-secondary border text-xs!">
            <SelectValue placeholder="Max lines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 line</SelectItem>
            <SelectItem value="2">2 lines</SelectItem>
            <SelectItem value="3">3 lines</SelectItem>
            <SelectItem value="4">4 lines</SelectItem>
            <SelectItem value="5">5 lines</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
