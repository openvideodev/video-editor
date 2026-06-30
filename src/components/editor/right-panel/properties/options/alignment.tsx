"use client";

import { RiAlignCenter, RiAlignLeft, RiAlignRight } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Alignment = "left" | "center" | "right";

interface AlignmentPropertyProps {
  value: Alignment;
  onChange: (val: Alignment) => void;
}

export function AlignmentProperty({ value, onChange }: AlignmentPropertyProps) {
  const alignments: { value: Alignment; icon: typeof RiAlignLeft }[] = [
    { value: "left", icon: RiAlignLeft },
    { value: "center", icon: RiAlignCenter },
    { value: "right", icon: RiAlignRight },
  ];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        Alignment
      </label>
      <div className="flex items-center gap-1">
        {alignments.map(({ value: alignValue, icon: Icon }) => (
          <Button
            key={alignValue}
            variant={value === alignValue ? "default" : "outline"}
            size="icon"
            className={cn("size-7", value === alignValue && "bg-primary text-primary-foreground")}
            onClick={() => onChange(alignValue)}
          >
            <Icon className="size-4" />
          </Button>
        ))}
      </div>
    </div>
  );
}
