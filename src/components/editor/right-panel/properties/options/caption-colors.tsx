"use client";

import { useState } from "react";
import {
  RiSubtractLine,
  RiArrowUpDownLine,
  RiEqualizerLine,
  RiContrastDropLine,
  RiCloseLine,
} from "@remixicon/react";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { SectionHeader } from "./section-header";
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
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import color from "color";

export interface CaptionWordStyle {
  color?: string;
  border?: { color?: string; width?: number };
  background?: string;
}

export interface CaptionColorsValue {
  active?: CaptionWordStyle | null;
  future?: CaptionWordStyle | null;
  keyword?: { color?: string; preserveAfterSpoken?: boolean } | null;
}

interface CaptionColorsPropertyProps {
  captionColors: CaptionColorsValue;
  setColors: (colors: CaptionColorsValue) => void;
}

/** Simplified color row: swatch + hex input. Shows empty state when no value. */
function ColorRow({
  label,
  value,
  fallback,
  onChange,
  onClear,
}: {
  label: string;
  value?: string;
  fallback: string;
  onChange: (hex: string) => void;
  onClear?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasValue = value !== undefined && value !== "";
  const display = value || fallback;

  return (
    <div className="flex items-center justify-between py-1 gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <InputGroup className="w-[160px] h-7">
        <InputGroupAddon align="inline-start" className="relative p-0">
          <Popover
            modal
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (o && !hasValue) onChange(fallback);
            }}
          >
            <PopoverTrigger asChild>
              <InputGroupButton variant="ghost" size="icon-xs" className="h-full w-8 pl-2">
                {hasValue ? (
                  <div
                    className="h-4 w-4 border border-input shadow-sm"
                    style={{ backgroundColor: display }}
                  />
                ) : (
                  <RiContrastDropLine className="size-3.5 text-muted-foreground" />
                )}
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <ColorPicker
                value={value || fallback}
                onChange={(cv) => onChange(color.rgb(cv as number[]).hex())}
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
          value={hasValue ? display.toUpperCase() : ""}
          placeholder="None"
          onChange={(e) => onChange(e.target.value)}
          className="text-xs p-0 font-mono"
        />
        {hasValue && onClear && (
          <InputGroupAddon align="inline-end" className="p-0 pr-1">
            <InputGroupButton
              variant="ghost"
              size="icon-xs"
              className="h-full w-6 text-muted-foreground hover:text-foreground"
              onClick={onClear}
            >
              <RiCloseLine className="size-3.5" />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </div>
  );
}

/** Brand-consistent number + color row for border */
function BorderRow({
  border,
  onChange,
}: {
  border?: { color?: string; width?: number };
  onChange: (patch: { color?: string; width?: number } | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasBorderColor = border?.color !== undefined && border?.color !== "";
  const borderColor = border?.color || "#FFFFFF";
  const borderWidth = border?.width ?? 0;

  return (
    <>
      <div className="flex items-center justify-between py-1 gap-4">
        <span className="text-xs text-muted-foreground">Border width</span>
        <InputGroup className="w-[160px] h-7">
          <InputGroupAddon align="inline-start">
            <RiArrowUpDownLine className="size-3.5" />
          </InputGroupAddon>
          <NumberInput
            value={borderWidth}
            min={0}
            max={20}
            onChange={(v) => onChange({ ...border, width: v })}
            className="pl-1 bg-transparent text-xs!"
          />
        </InputGroup>
      </div>

      <div className="flex items-center justify-between py-1 gap-4">
        <span className="text-xs text-muted-foreground">Border color</span>
        <InputGroup className="w-[160px] h-7">
          <InputGroupAddon align="inline-start" className="relative p-0">
            <Popover
              modal
              open={open}
              onOpenChange={(o) => {
                setOpen(o);
                if (o && !hasBorderColor) onChange({ ...border, color: "#FFFFFF" });
              }}
            >
              <PopoverTrigger asChild>
                <InputGroupButton variant="ghost" size="icon-xs" className="h-full w-8 pl-2">
                  {hasBorderColor ? (
                    <div
                      className="h-4 w-4 border border-input shadow-sm"
                      style={{ backgroundColor: borderColor }}
                    />
                  ) : (
                    <RiContrastDropLine className="size-3.5 text-muted-foreground" />
                  )}
                </InputGroupButton>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <ColorPicker
                  value={border?.color || "#FFFFFF"}
                  onChange={(cv) => onChange({ ...border, color: color.rgb(cv as number[]).hex() })}
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
            value={hasBorderColor ? borderColor.toUpperCase() : ""}
            placeholder="None"
            onChange={(e) =>
              onChange({ ...border, color: e.target.value === "" ? undefined : e.target.value })
            }
            className="text-xs p-0 font-mono"
          />
          {hasBorderColor && (
            <InputGroupAddon align="inline-end" className="p-0 pr-1">
              <InputGroupButton
                variant="ghost"
                size="icon-xs"
                className="h-full w-6 text-muted-foreground hover:text-foreground"
                onClick={() => onChange({ ...border, color: undefined })}
              >
                <RiCloseLine className="size-3.5" />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>
    </>
  );
}

/** Keyword section with plus/minus header (consistent with other sections) */
function KeywordSection({
  keyword,
  onChange,
}: {
  keyword?: { color?: string; preserveAfterSpoken?: boolean } | null;
  onChange: (keyword?: { color?: string; preserveAfterSpoken?: boolean } | null) => void;
}) {
  const isEnabled = keyword != null;
  const preserveAfterSpoken = keyword?.preserveAfterSpoken ?? false;

  const handleAdd = () => {
    onChange({ color: "#FFFFFF", preserveAfterSpoken: false });
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <Collapsible open={isEnabled}>
      <SectionHeader
        title="Keyword"
        hasContent={isEnabled}
        onAdd={handleAdd}
        onRemove={handleRemove}
      />
      <CollapsibleContent>
        <div className="flex flex-col gap-3 py-1">
          <ColorRow
            label="Fill"
            value={keyword?.color}
            fallback="#FFFFFF"
            onChange={(hex) => onChange({ ...keyword, color: hex === "" ? undefined : hex })}
            onClear={() => onChange({ ...keyword, color: undefined })}
          />

          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-muted-foreground">Preserve after spoken</span>
            <Switch
              checked={preserveAfterSpoken}
              onCheckedChange={(checked) => onChange({ ...keyword, preserveAfterSpoken: checked })}
              className="scale-75 origin-right"
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function WordStyleSection({
  title,
  style,
  showBackground,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  style?: CaptionWordStyle | null;
  showBackground: boolean;
  onChange: (patch: Partial<CaptionWordStyle>) => void;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const isEnabled = style !== undefined && style !== null;

  return (
    <Collapsible open={isEnabled}>
      <SectionHeader title={title} hasContent={isEnabled} onAdd={onAdd} onRemove={onRemove} />
      <CollapsibleContent>
        <div className="py-1 flex flex-col">
          <ColorRow
            label="Fill"
            value={style?.color}
            fallback="#FFFFFF"
            onChange={(hex) => onChange({ color: hex === "" ? undefined : hex })}
            onClear={() => onChange({ color: undefined })}
          />

          {showBackground && (
            <ColorRow
              label="Background"
              value={style?.background}
              fallback="#000000"
              onChange={(hex) => onChange({ background: hex === "" ? undefined : hex })}
              onClear={() => onChange({ background: undefined })}
            />
          )}

          <BorderRow border={style?.border} onChange={(patch) => onChange({ border: patch })} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function CaptionColorsProperty({ captionColors, setColors }: CaptionColorsPropertyProps) {
  const active = captionColors.active;
  const future = captionColors.future;

  const hasAnyColors = active != null || future != null;

  const handleAdd = () => {
    setColors({
      ...captionColors,
      active: { color: "#FFFFFF", background: "#000000" },
      future: { color: "#999999" },
    });
  };

  const handleRemove = () => {
    setColors({ active: null, future: null, keyword: null });
  };

  return (
    <Collapsible open={hasAnyColors}>
      <div className="flex items-center justify-between py-2">
        <span className="text-xs font-semibold text-foreground">Caption Colors</span>
        <div className="flex items-center gap-1">
          {hasAnyColors && (
            <Popover modal>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 rounded-sm text-muted-foreground"
                >
                  <RiEqualizerLine className="size-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0 bg-card" align="end" side="left" sideOffset={8}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-xs font-semibold">Caption Colors</span>
                </div>
                <div className="px-4 pb-3 overflow-y-auto max-h-[70vh] divide-y divide-border/60">
                  <WordStyleSection
                    title="Active word"
                    style={active}
                    showBackground
                    onChange={(patch) =>
                      setColors({ ...captionColors, active: { ...active, ...patch } })
                    }
                    onAdd={() =>
                      setColors({
                        ...captionColors,
                        active: { color: "#FFFFFF", background: "#000000" },
                      })
                    }
                    onRemove={() => setColors({ ...captionColors, active: null })}
                  />
                  <WordStyleSection
                    title="Future words"
                    style={future}
                    showBackground={false}
                    onChange={(patch) =>
                      setColors({ ...captionColors, future: { ...future, ...patch } })
                    }
                    onAdd={() => setColors({ ...captionColors, future: { color: "#999999" } })}
                    onRemove={() => setColors({ ...captionColors, future: null })}
                  />
                  <KeywordSection
                    keyword={captionColors.keyword}
                    onChange={(keyword) => setColors({ ...captionColors, keyword })}
                  />
                </div>
              </PopoverContent>
            </Popover>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-6 rounded-sm text-muted-foreground"
            onClick={hasAnyColors ? handleRemove : handleAdd}
          >
            {hasAnyColors ? (
              <RiSubtractLine className="size-4" />
            ) : (
              <RiSubtractLine className="size-4 rotate-90" />
            )}
          </Button>
        </div>
      </div>
      <CollapsibleContent>
        <div className="py-1 flex flex-col">
          <ColorRow
            label="Active"
            value={active?.color}
            fallback="#FFFFFF"
            onChange={(hex) =>
              setColors({ ...captionColors, active: { ...active, color: hex || undefined } })
            }
            onClear={() => setColors({ ...captionColors, active: null })}
          />
          <ColorRow
            label="Future"
            value={future?.color}
            fallback="#999999"
            onChange={(hex) =>
              setColors({ ...captionColors, future: { ...future, color: hex || undefined } })
            }
            onClear={() => setColors({ ...captionColors, future: null })}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
