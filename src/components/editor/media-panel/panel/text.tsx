"use client";

import { core } from "@/lib/project";
import { Log } from "@openvideo/engine-pixi";
import Draggable from "@/components/shared/draggable";
import { TEXT_PRESETS } from "@/constants/text-presets";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PanelText() {
  const handleAddText = async (preset?: (typeof TEXT_PRESETS)[number]) => {
    try {
      const activePreset = preset || TEXT_PRESETS[0];
      // Use the new Core API to add a text clip directly with the un-normalized structure
      core.clip.add({
        type: activePreset.type,
        name: activePreset.name,
        text: preset ? activePreset.text : "This is a text clip",
        style: activePreset.style,
        timing: activePreset.timing,
        transform: activePreset.transform,
      });
    } catch (error) {
      Log.error("Failed to add text:", error);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background gap-4 py-4">
      <div className="px-4 border-b border-border/40">
        <Draggable
          data={{
            type: TEXT_PRESETS[0].type,
            name: TEXT_PRESETS[0].name,
            text: "This is a text clip",
            style: TEXT_PRESETS[0].style,
            timing: TEXT_PRESETS[0].timing,
            transform: TEXT_PRESETS[0].transform,
          }}
          renderCustomPreview={
            <div className="px-4 py-2 bg-popover border border-border rounded-md shadow-lg flex items-center justify-center">
              <span className="text-foreground font-semibold text-sm">Add Text</span>
            </div>
          }
        >
          <div
            className="w-full h-9 bg-secondary hover:bg-secondary/85 text-secondary-foreground flex items-center justify-center text-sm font-medium cursor-pointer transition-colors border border-border/20 shadow-sm"
            onClick={() => handleAddText()}
          >
            Add Text
          </div>
        </Draggable>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4 pb-6">
          {TEXT_PRESETS.map((preset, index) => {
            const previewUrl = (preset as any).metadata?.previewUrl;
            return (
              <Draggable
                key={index}
                data={{
                  type: preset.type,
                  name: preset.name,
                  text: preset.text,
                  style: preset.style,
                  timing: preset.timing,
                  transform: preset.transform,
                }}
                renderCustomPreview={
                  <div className="px-4 py-2 bg-popover border border-border rounded-md shadow-lg flex items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={preset.name}
                        className="h-8 object-contain pointer-events-none"
                      />
                    ) : (
                      <span
                        style={{
                          fontFamily: preset.style.fontFamily,
                          fontSize: "14px",
                          fontWeight: preset.style.fontWeight,
                          color: preset.style.color,
                        }}
                      >
                        {preset.text}
                      </span>
                    )}
                  </div>
                }
              >
                <button
                  onClick={() => handleAddText(preset)}
                  className="aspect-[3/2] w-full bg-secondary/15 hover:bg-secondary/25 border hover:border-border/60 transition-all duration-300 flex items-center justify-center p-3 active:scale-[0.98] shadow-sm hover:shadow-md overflow-hidden relative group"
                >
                  {/* Subtle hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {previewUrl ? (
                    <div className="flex-1 w-full flex items-center justify-center min-h-0 transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={previewUrl}
                        alt={preset.name}
                        className="max-h-full max-w-full object-contain pointer-events-none"
                      />
                    </div>
                  ) : (
                    <span
                      style={{
                        fontFamily: preset.style.fontFamily,
                        fontSize: "20px",
                        fontWeight: preset.style.fontWeight,
                        color: preset.style.color,
                        textAlign: "center",
                      }}
                      className="line-clamp-2 break-words transition-transform duration-300 group-hover:scale-105"
                    >
                      {preset.text}
                    </span>
                  )}
                </button>
              </Draggable>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
