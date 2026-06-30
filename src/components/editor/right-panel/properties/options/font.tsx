"use client";

import { useState, useMemo } from "react";
import { RiArrowDownSLine, RiCheckLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getGroupedFonts } from "@/utils/font-utils";

const GROUPED_FONTS = getGroupedFonts();

interface FontPropertyProps {
  currentFamily: string;
  onChange: (postScriptName: string) => void;
}

export function FontProperty({ currentFamily, onChange }: FontPropertyProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentFontFamily = useMemo(() => {
    return GROUPED_FONTS.find((f) => f.family === currentFamily) ?? GROUPED_FONTS[0];
  }, [currentFamily]);

  const fontItems = useMemo(() => {
    return GROUPED_FONTS.map((family) => (
      <button
        key={family.family}
        className={cn(
          "flex w-full items-center px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
          currentFontFamily?.family === family.family && "bg-accent/50 text-accent-foreground",
        )}
        onClick={() => {
          onChange(family.mainFont.postScriptName);
          setIsOpen(false);
        }}
      >
        <span className="flex-1 text-left">{family.family}</span>
        {currentFontFamily?.family === family.family && <RiCheckLine className="size-4 ml-2" />}
      </button>
    ));
  }, [currentFontFamily?.family, onChange]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        Font
      </label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full h-7 justify-between px-3 border-input text-xs relative"
          >
            <span className="truncate">{currentFontFamily?.family ?? "Select font"}</span>
            <RiArrowDownSLine className="size-4 opacity-50 shrink-0 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 gap-0" align="start">
          <ScrollArea className="h-72 w-full">
            <div className="flex flex-col p-1 gap-px">{fontItems}</div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
