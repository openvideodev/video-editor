"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { RiLoader5Line } from "@remixicon/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IClip, getTransitionOptions, registerCustomTransition } from "@openvideo/engine-pixi";
import { Icons } from "@/components/shared/icons";

interface TransitionOption {
  key: string;
  label: string;
  previewStatic?: string;
  previewDynamic?: string;
}

interface CustomPreset {
  id: string;
  name: string;
  data: { label: string; fragment: string };
}

interface TransitionSelectorPropertyProps {
  currentKey: string;
  customPresets?: CustomPreset[];
  onSelect: (key: string) => void;
  onDragStart?: (key: string) => void;
}

const LOADED_CACHE: Record<string, { static: boolean; dynamic: boolean }> = {};

export function TransitionSelectorProperty({
  currentKey,
  customPresets = [],
  onSelect,
  onDragStart,
}: TransitionSelectorPropertyProps) {
  const [loaded, setLoaded] = useState(LOADED_CACHE);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]");
    if (viewport) {
      // Restore scroll position if needed
    }
  }, []);

  const markLoaded = (key: string, type: "static" | "dynamic") => {
    if (LOADED_CACHE[key]?.[type]) return;
    LOADED_CACHE[key] = { ...LOADED_CACHE[key], [type]: true };
    setLoaded({ ...LOADED_CACHE });
  };

  const allTransitions = getTransitionOptions();

  const DraggableItem = ({ effect }: { effect: TransitionOption }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragState, setDragState] = useState<{ x: number; y: number } | null>(null);
    const ghostRef = useRef<HTMLDivElement>(null);

    const isReady = loaded[effect.key]?.static && loaded[effect.key]?.dynamic;

    return (
      <>
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", effect.key);
            e.dataTransfer.setData("type", "transition");
            const img = new Image();
            img.src =
              "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            e.dataTransfer.setDragImage(img, 0, 0);
            onDragStart?.(effect.key);
            setIsDragging(true);
            setDragState({ x: e.clientX, y: e.clientY });
          }}
          onDragEnd={() => {
            setIsDragging(false);
            setDragState(null);
          }}
          className="flex w-full items-center gap-2 flex-col group cursor-pointer relative select-none"
          onClick={() => onSelect(effect.key)}
        >
          <div className="relative w-full aspect-video bg-input/30 border overflow-hidden">
            {!isReady && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <RiLoader5Line className="animate-spin text-muted-foreground" />
              </div>
            )}
            {effect.previewStatic && (
              <img
                src={effect.previewStatic}
                onLoad={() => markLoaded(effect.key, "static")}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-150 opacity-100 group-hover:opacity-0"
              />
            )}
            {effect.previewDynamic && (
              <img
                src={effect.previewDynamic}
                onLoad={() => markLoaded(effect.key, "dynamic")}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-150 opacity-0 group-hover:opacity-100"
              />
            )}
            <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs font-medium truncate text-center transition-opacity duration-150 group-hover:opacity-0">
              {effect.label}
            </div>
          </div>
        </div>

        {dragState &&
          isDragging &&
          createPortal(
            <div
              ref={ghostRef}
              style={{
                position: "fixed",
                left: dragState.x + 15,
                top: dragState.y + 15,
                zIndex: 99999,
                pointerEvents: "none",
              }}
              className="w-20 aspect-video bg-input/80 border overflow-hidden shadow-xl"
            >
              {effect.previewStatic && (
                <img src={effect.previewStatic} className="w-full h-full object-cover" />
              )}
            </div>,
            document.body,
          )}
      </>
    );
  };

  const renderTransitionList = (list: TransitionOption[]) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-2.5 justify-items-center p-2">
      {list.map((effect) => (
        <DraggableItem key={effect.key} effect={effect} />
      ))}
    </div>
  );

  return (
    <Tabs defaultValue="default" className="flex flex-col flex-1 min-h-0">
      <TabsList className="w-full shrink-0">
        <TabsTrigger value="default" className="flex-1">
          Default
        </TabsTrigger>
        <TabsTrigger value="custom" className="flex-1">
          Custom
        </TabsTrigger>
      </TabsList>

      <TabsContent value="default" className="flex-1 min-h-0 mt-2">
        <ScrollArea ref={scrollRef} className="h-full">
          {renderTransitionList(allTransitions)}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="custom" className="flex-1 min-h-0 mt-2">
        <ScrollArea className="h-full">
          {customPresets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <span className="text-xs">No custom transitions yet.</span>
              <span className="text-[10px]">Create one from the Gallery to see it here.</span>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-2.5 justify-items-center">
              {customPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex w-full items-center gap-2 flex-col group cursor-pointer relative select-none"
                  onClick={() => onSelect(`custom_transition_${preset.id}`)}
                >
                  <div className="relative w-full aspect-video bg-primary/40 border overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs font-medium truncate text-center">
                      {preset.data.label || preset.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
