"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  RiArrowUpDownLine,
  RiCheckLine,
  RiAlignCenter,
  RiAlignLeft,
  RiAlignRight,
  RiStrikethrough,
  RiText,
  RiUnderline,
} from "@remixicon/react";
import { TextOverline } from "@/components/shared/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { getGroupedFonts, getFontByPostScriptName } from "@/utils/font-utils";

const GROUPED_FONTS = getGroupedFonts();

const FontPicker = React.memo(
  ({
    currentFamily,
    handleFontChange,
  }: {
    currentFamily: { family: string };
    handleFontChange: (postScriptName: string) => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (isOpen) {
        setSearchQuery("");
        // Focus the search input after the popover opens.
        const id = requestAnimationFrame(() => {
          searchWrapperRef.current?.querySelector("input")?.focus();
        });
        return () => cancelAnimationFrame(id);
      }
    }, [isOpen]);

    const fontItems = useMemo(() => {
      const query = searchQuery.trim().toLowerCase();
      const filtered = GROUPED_FONTS.filter((family) =>
        family.family.toLowerCase().includes(query),
      ).sort((a, b) => a.family.localeCompare(b.family));

      return filtered.map((family) => (
        <button
          key={family.family}
          className={cn(
            "flex w-full items-center px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
            currentFamily.family === family.family && "bg-accent/50 text-accent-foreground",
          )}
          onClick={() => {
            handleFontChange(family.mainFont.postScriptName);
            setIsOpen(false);
          }}
        >
          <span className="flex-1 text-left">{family.family}</span>
          {currentFamily.family === family.family && <RiCheckLine className="size-4 ml-2" />}
        </button>
      ));
    }, [currentFamily.family, handleFontChange, searchQuery]);

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full h-7 justify-between px-3 border-input text-xs relative"
          >
            <span className="truncate">{currentFamily.family}</span>
            <RiArrowUpDownLine className="size-4 opacity-50 shrink-0 absolute right-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 gap-0" align="end">
          <div ref={searchWrapperRef} className="p-2 border-b border-border">
            <Input
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <ScrollArea className="h-72 w-full">
            <div className="flex flex-col p-1 gap-px">
              {fontItems.length === 0 ? (
                <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                  No fonts found
                </div>
              ) : (
                fontItems
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    );
  },
);

interface TextGroupPropertyProps {
  // Content
  text: string;
  onTextChange: (val: string) => void;

  // Font
  currentFamily: string;
  currentFont: {
    postScriptName: string;
    fullName: string;
  };
  fontStyles: Array<{ id: string; postScriptName: string; fullName: string }>;
  fontSize: number;
  onFontChange: (postScriptName: string) => void;
  onFontStyleChange: (postScriptName: string) => void;
  onFontSizeChange: (val: number) => void;

  // Alignment
  textAlign: "left" | "center" | "right";
  onTextAlignChange: (val: "left" | "center" | "right") => void;
  underline: boolean;
  overline: boolean;
  linethrough: boolean;
  onUnderlineChange: (val: boolean) => void;
  onOverlineChange: (val: boolean) => void;
  onLinethroughChange: (val: boolean) => void;

  // Case
  textCase: "none" | "uppercase" | "lowercase";
  onTextCaseChange: (val: "none" | "uppercase" | "lowercase") => void;
}

export function TextGroupProperty({
  text,
  onTextChange,
  currentFamily,
  currentFont,
  fontStyles,
  fontSize,
  onFontChange,
  onFontStyleChange,
  onFontSizeChange,
  textAlign,
  onTextAlignChange,
  underline,
  overline,
  linethrough,
  onUnderlineChange,
  onOverlineChange,
  onLinethroughChange,
  textCase,
  onTextCaseChange,
}: TextGroupPropertyProps) {
  return (
    <div className="flex flex-col">
      {/* Section Header */}
      <div className="flex items-center justify-between py-2">
        <span className="text-xs font-semibold text-foreground">Typography</span>
      </div>

      <div className="py-1 flex flex-col">
        {/* Content */}
        <div className="flex items-center justify-between py-1 gap-4">
          <span className="text-xs text-muted-foreground">Content</span>
          <Input
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            className="w-[160px] h-7 text-xs! bg-secondary border"
            placeholder="Text"
          />
        </div>
        {/* Font */}
        <div className="flex items-center justify-between py-1 gap-4">
          <span className="text-xs text-muted-foreground">Font</span>
          <div className="w-[160px]">
            <FontPicker currentFamily={{ family: currentFamily }} handleFontChange={onFontChange} />
          </div>
        </div>

        {/* Style */}
        <div className="flex items-center justify-between py-1 gap-4">
          <span className="text-xs text-muted-foreground">Style</span>
          <Select value={currentFont.postScriptName} onValueChange={onFontStyleChange}>
            <SelectTrigger className="w-[160px] h-7 bg-secondary border text-xs!">
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent>
              {fontStyles.map((style) => (
                <SelectItem key={style.id} value={style.postScriptName}>
                  {style.fullName.replace(currentFamily, "").trim() || "Regular"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Size */}
        <div className="flex items-center justify-between py-1 gap-4">
          <span className="text-xs text-muted-foreground">Size</span>
          <InputGroup className="w-[160px]">
            <NumberInput
              value={fontSize}
              onChange={onFontSizeChange}
              className="pl-2 bg-transparent text-xs!"
            />
            <InputGroupAddon align="inline-end">
              <RiText className="size-3.5" />
            </InputGroupAddon>
          </InputGroup>
        </div>

        {/* Align */}
        <div className="flex items-center justify-between py-1 gap-4">
          <span className="text-xs text-muted-foreground">Align</span>
          <div className="flex items-center bg-secondary p-0.5 w-[160px]">
            {[
              { icon: RiAlignLeft, value: "left" },
              { icon: RiAlignCenter, value: "center" },
              { icon: RiAlignRight, value: "right" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => onTextAlignChange(item.value as "left" | "center" | "right")}
                className={cn(
                  "flex-1 flex items-center justify-center h-6 transition-colors",
                  textAlign === item.value
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="size-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Decoration */}
        <div className="flex items-center justify-between py-1 gap-4">
          <span className="text-xs text-muted-foreground">Decoration</span>
          <div className="flex items-center bg-secondary p-0.5 w-[160px]">
            {[
              { icon: RiUnderline, value: "underline", active: underline },
              { icon: TextOverline, value: "overline", active: overline },
              { icon: RiStrikethrough, value: "strikethrough", active: linethrough },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  if (item.value === "underline") onUnderlineChange(!underline);
                  if (item.value === "overline") onOverlineChange(!overline);
                  if (item.value === "strikethrough") onLinethroughChange(!linethrough);
                }}
                className={cn(
                  "flex-1 flex items-center justify-center h-6 transition-colors",
                  item.active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="size-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Case */}
        <div className="flex items-center justify-between py-1 gap-4">
          <span className="text-xs text-muted-foreground">Case</span>
          <div className="flex items-center bg-secondary p-0.5 w-[160px]">
            {[
              { label: "aA", value: "none" },
              { label: "AA", value: "uppercase" },
              { label: "aa", value: "lowercase" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => onTextCaseChange(item.value as "none" | "uppercase" | "lowercase")}
                className={cn(
                  "flex-1 h-6 text-[10px] font-medium transition-colors",
                  textCase === item.value
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
