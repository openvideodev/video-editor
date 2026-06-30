"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  RiLoader5Line,
  RiKeyboardLine,
  RiPaletteLine,
  RiPlayLine,
  RiSparkling2Line,
  RiDeleteBinLine,
  RiUploadLine,
  RiClosedCaptioningAiLine,
} from "@remixicon/react";
import { fontManager, Log } from "@openvideo/engine-pixi";
import type { AnyClip } from "@openvideo/core";
import { generateCaptionClips } from "@/lib/caption-generator";
import { useStore } from "zustand";
import { projectStore, core } from "@/lib/project";
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";

export default function PanelCaptions() {
  const clips = useStore(projectStore, (s) => s.clips);

  const mediaItems = (Object.values(clips) as AnyClip[]).filter(
    (clip) => clip.type === "Video" || clip.type === "Audio",
  );

  const captionItems = (Object.values(clips) as AnyClip[])
    .filter((clip) => clip.type === "Caption")
    .sort((a, b) => a.timing.display.from - b.timing.display.from);

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCaptionId, setActiveCaptionId] = useState<string | null>(null);

  const captionItemsRef = useRef(captionItems);
  const activeCaptionIdRef = useRef(activeCaptionId);

  useEffect(() => {
    captionItemsRef.current = captionItems;
  }, [captionItems]);

  useEffect(() => {
    activeCaptionIdRef.current = activeCaptionId;
  }, [activeCaptionId]);

  const updateClips = () => {}; // No longer needed but kept empty to avoid breaking other calls if any

  useEffect(() => {
    const handleUpdate = () => updateClips();

    const handleTimeUpdate = (currentTime: number) => {
      // Find the currently active caption
      // We use the Ref because this closure is created once and we don't want to re-bind listener
      const activeItem = captionItemsRef.current.find(
        (item) => currentTime >= item.timing.display.from && currentTime < item.timing.display.to,
      );

      const newActiveId = activeItem ? activeItem.id : null;

      // Only trigger re-render if the active caption actually changes
      if (newActiveId !== activeCaptionIdRef.current) {
        setActiveCaptionId(newActiveId);
        activeCaptionIdRef.current = newActiveId;
      }
    };

    core.on("timeupdate", handleTimeUpdate);

    return () => {
      core.off("timeupdate", handleTimeUpdate);
    };
  }, []);

  const handleGenerateCaptions = async () => {
    if (mediaItems.length === 0) return;

    setIsGenerating(true);
    try {
      const fontName = "Bangers-Regular";
      const fontUrl = "https://fonts.gstatic.com/s/poppins/v15/pxiByp8kv8JHgFVrLCz7V1tvFP-KUEg.ttf";

      await fontManager.addFont({
        name: fontName,
        url: fontUrl,
      });

      const clipsToAdd: any[] = [];

      for (const mediaClip of mediaItems) {
        try {
          // 1. Get transcription
          const audioUrl = (mediaClip as any).src;
          if (!audioUrl) continue;

          const transcribeResponse = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: audioUrl, model: "nova-3" }),
          });

          if (!transcribeResponse.ok) {
            Log.error(`Transcription failed for media ${mediaClip.id}`);
            continue;
          }

          const transcriptionData = await transcribeResponse.json();
          if (!transcriptionData) continue;

          const words = transcriptionData.results?.main?.words || transcriptionData.words || [];

          const settings = core.store.getState().settings;
          const captionClipsJSON = await generateCaptionClips({
            videoWidth: settings.width,
            videoHeight: settings.height,
            words,
          });

          // 3. Prepare clips
          for (const json of captionClipsJSON) {
            const enrichedJson = {
              ...json,
              mediaId: mediaClip.id,
              metadata: {
                ...json.metadata,
                sourceClipId: mediaClip.id,
              },
              timing: {
                display: {
                  from: json.timing.display.from + mediaClip.timing.display.from,
                  to: json.timing.display.to + mediaClip.timing.display.from,
                },
              },
            };
            clipsToAdd.push(enrichedJson);
          }
        } catch (error) {
          Log.error(`Failed to process media ${mediaClip.id}:`, error);
        }
      }

      const trackId = "track_" + nanoid(10);
      const settings = core.store.getState().settings;
      const captionTrackConfig = {
        captions: {
          style: {
            fontSize: 80,
            fontFamily: fontName,
            fontWeight: "700",
            fontStyle: "normal",
            color: "#ffffff",
            align: "center",
            fontUrl: fontUrl,
            stroke: { color: "#000000", width: 4 },
            shadow: { color: "#000000", alpha: 0.5, blur: 4, offsetX: 2, offsetY: 2 },
          },
          colors: {
            active: { color: "#ffffff", background: "#FF5700" },
            future: { color: "#ffffff" },
            keyword: { color: "#ffffff", preserveAfterSpoken: true },
          },
          positioning: {
            videoWidth: settings.width,
            videoHeight: settings.height,
          },
          wordsPerLine: "multiple" as const,
        },
      };
      const trackCommand = {
        id: nanoid(),
        type: "track.add",
        payload: { id: trackId, name: "Captions", type: "caption", config: captionTrackConfig },
      };

      if (clipsToAdd.length > 0) {
        const fullClips = await Promise.all(clipsToAdd.map((c) => core.clip.prepare(c as any)));
        console.log({ fullClips });
        const addCommands = fullClips.map((clip) => ({
          id: nanoid(),
          type: "clip.add",
          payload: { clip, trackId },
        }));

        core.batch([trackCommand, ...addCommands] as any[]);
      } else {
        core.execute(trackCommand as any);
      }
    } catch (error) {
      Log.error("Failed to generate captions:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  function normalizeWordTimings(words: any[]) {
    let currentTime = 0;
    return words.map((word, i) => {
      const duration = word.to - word.from;
      const newWord = {
        ...word,
        from: currentTime,
        to: currentTime + duration,
      };
      currentTime += duration;
      return newWord;
    });
  }

  const handleSplitCaption = async (id: string, cursorPosition: number, fullText: string) => {
    const state = core.store.getState();
    const clip = state.clips[id];
    if (!clip) return;

    const track = state.tracks.find((t) => t.clipIds.includes(id));
    if (!track) return;
    const trackId = track.id;

    const wordsInText: { text: string; start: number; end: number }[] = [];
    const regex = /\S+/g;
    let match;
    while ((match = regex.exec(fullText)) !== null) {
      wordsInText.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    let splitWordIndex = -1;
    for (let i = 0; i < wordsInText.length; i++) {
      if (cursorPosition <= wordsInText[i].start) {
        splitWordIndex = i;
        break;
      }
      if (cursorPosition < wordsInText[i].end) {
        splitWordIndex = i;
        break;
      }
    }

    if (splitWordIndex <= 0) return;

    const part1Text = wordsInText
      .slice(0, splitWordIndex)
      .map((w) => w.text)
      .join(" ");
    const part2Text = wordsInText
      .slice(splitWordIndex)
      .map((w) => w.text)
      .join(" ");

    const clipJson = (clip as any).toJSON ? (clip as any).toJSON() : { ...clip };
    const caption = clipJson.caption || {};
    const words = caption.words || [];

    const part1Words = words.slice(0, splitWordIndex);
    const part2Words = words.slice(splitWordIndex);

    if (part1Words.length === 0 || part2Words.length === 0) return;
    const lastWordPart1 = part1Words[part1Words.length - 1];

    const clip1Json = {
      ...clipJson,
      id: undefined,
      text: part1Text,
      width: 0,
      height: 0,
      wordWrapWidth: 0,
      caption: {
        ...caption,
        words: part1Words,
      },
      timing: {
        display: {
          from: clipJson.timing.display.from,
          to: lastWordPart1.to * 1000 + clipJson.timing.display.from,
        },
        duration: lastWordPart1.to * 1000,
      },
    };

    const clip2Json = {
      ...clipJson,
      id: undefined,
      text: part2Text,
      width: 0,
      height: 0,
      wordWrapWidth: 0,
      caption: {
        ...caption,
        words: normalizeWordTimings(part2Words),
      },
      timing: {
        display: {
          from: lastWordPart1.to * 1000 + clipJson.timing.display.from,
          to: clipJson.timing.display.to,
        },
        duration:
          clipJson.timing.display.to - lastWordPart1.to * 1000 - clipJson.timing.display.from,
      },
    };

    try {
      for (const c of [clip1Json, clip2Json]) {
        await core.clip.add(c as any, { trackId });
      }
      core.clip.remove([id]);
    } catch (error) {
      Log.error("Failed to split caption clip:", error);
    }
  };

  // En PanelCaptions, modifica handleUpdateCaption:
  const handleUpdateCaption = async (id: string, text: string, fullUpdate = false) => {
    const state = core.store.getState();
    const clip = state.clips[id];
    if (!clip) return;

    const track = state.tracks.find((t) => t.clipIds.includes(id));
    if (!track) return;

    if (!fullUpdate) {
      // MODO RÁPIDO: solo actualizar text (para onChange)
      const captionClip = clip as any;
      captionClip.text = text;
      captionClip.emit("propsChange", { text });
      return;
    }

    // MODO COMPLETO: calcular words y timings (solo onBlur)
    const newWordsText = text.trim().split(/\s+/).filter(Boolean);
    const clipJson = (clip as any).toJSON ? (clip as any).toJSON() : { ...clip };
    const caption = clipJson.caption || {};
    const oldWords = caption.words || [];
    const paragraphIndex = oldWords[0]?.paragraphIndex ?? "";

    const isNewWordAdded = newWordsText.length > oldWords.length;
    let updatedWords;

    if (isNewWordAdded) {
      const totalDurationMs = (clipJson.timing.display.to - clipJson.timing.display.from) / 1000;
      const totalChars = newWordsText.reduce((acc, w) => acc + w.length, 0);
      const durationPerChar = totalChars > 0 ? totalDurationMs / totalChars : 0;

      let currentShift = 0;
      updatedWords = newWordsText.map((wordText, index) => {
        const wordDuration = wordText.length * durationPerChar;
        const word = {
          ...(oldWords[index] || { isKeyWord: false, paragraphIndex }),
          text: wordText,
          from: currentShift,
          to: currentShift + wordDuration,
        };
        currentShift += wordDuration;
        return word;
      });
    } else {
      updatedWords = newWordsText.map((wordText, index) => {
        if (oldWords[index]) {
          return {
            ...oldWords[index],
            text: wordText,
          };
        }
        return {
          text: wordText,
          from: 0,
          to: 0,
          isKeyWord: false,
        };
      });
    }

    const newClipJson = {
      ...clipJson,
      text,
      caption: {
        ...caption,
        words: updatedWords,
      },
      id: undefined,
    } as any;

    try {
      await core.clip.add(newClipJson, { trackId: track.id });
      core.clip.remove([id]);
    } catch (error) {
      Log.error("Failed to update caption clip:", error);
    }
  };

  const handleDeleteCaption = (id: string) => {
    core.clip.remove([id]);
  };

  const handleSeek = (time: number) => {
    core.seek(time);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-1 flex-col gap-4 overflow-hidden min-w-0">
        {mediaItems.length === 0 ? (
          <div className="flex flex-1 items-center justify-center gap-4 select-none">
            <div className="flex flex-col items-center justify-center pb-12">
              <div className="size-16 bg-secondary/30 flex items-center justify-center">
                <RiSparkling2Line size={24} strokeWidth={1.5} className="text-muted-foreground" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1.5">No Media Detected</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[210px] mb-5 text-center">
                Add video or audio clips to your timeline first, then auto-generate or write
                captions.
              </p>
            </div>
          </div>
        ) : captionItems.length > 0 ? (
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-3">
              <div className="flex flex-col">
                {captionItems.map((item) => (
                  <CaptionItem
                    key={item.id}
                    item={item}
                    isActive={item.id === activeCaptionId}
                    onUpdate={(text, fullUpdate) => handleUpdateCaption(item.id, text, fullUpdate)}
                    onSplit={(pos, text) => handleSplitCaption(item.id, pos, text)}
                    onDelete={() => handleDeleteCaption(item.id)}
                    onSeek={() => handleSeek(item.timing.display.from)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-2 p-4">
            <Button
              onClick={handleGenerateCaptions}
              disabled={isGenerating}
              variant="outline"
              className="justify-start"
            >
              {isGenerating ? (
                <RiLoader5Line className="size-4 shrink-0 animate-spin" />
              ) : (
                <RiClosedCaptioningAiLine className="size-4 shrink-0" />
              )}
              <span className="text-xs font-medium">
                {isGenerating ? "Generating..." : "Auto Captions"}
              </span>
            </Button>

            <Button variant="outline" disabled className="justify-start">
              <RiKeyboardLine className="size-4 shrink-0" />
              <span className="text-xs font-medium">Manual Captions</span>
            </Button>

            <Button variant="outline" disabled className="justify-start">
              <RiUploadLine className="size-4 shrink-0" />
              <span className="text-xs font-medium">Upload Caption File</span>
            </Button>

            <Button variant="outline" disabled className="justify-start">
              <RiPaletteLine className="size-4 shrink-0" />
              <span className="text-xs font-medium">Auto Lyrics</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CaptionItem({
  item,
  isActive,
  onUpdate,
  onSplit,
  onDelete,
  onSeek,
}: {
  item: AnyClip;
  isActive: boolean;
  onUpdate: (text: string, fullUpdate?: boolean) => void;
  onSplit: (cursorPosition: number, text: string) => void;
  onDelete: () => void;
  onSeek: () => void;
}) {
  const [text, setText] = useState((item as any).text || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText((item as any).text || "");
  }, [(item as any).text]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onUpdate(e.target.value, false);
  };

  const handleBlur = () => {
    if (text !== (item as any).text) {
      onUpdate(text, true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const cursorPosition = textareaRef.current?.selectionStart || 0;
      onSplit(cursorPosition, text);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 px-2 py-1.5 transition-all duration-100",
        isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
      )}
    >
      {/* Timecode */}
      <span
        className={cn(
          "text-xs font-mono select-none cursor-pointer shrink-0 w-9 tabular-nums transition-colors",
          isActive ? "text-white/80" : "text-muted-foreground/50 hover:text-muted-foreground",
        )}
        onClick={onSeek}
      >
        {formatTime(item.timing.display.from / 1_000_000)}
      </span>

      {/* Inline textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        rows={1}
        className={cn(
          "flex-1 min-w-0 resize-none bg-transparent border-0 p-0 text-xs leading-5 outline-none focus:ring-0 focus-visible:ring-0 select-text transition-colors shadow-none overflow-hidden",
          isActive ? "text-white font-medium" : "text-foreground/70 focus:text-foreground",
        )}
      />

      {/* Actions — only visible on hover/active */}
      <div
        className={cn(
          "flex items-center gap-0.5 shrink-0 transition-all duration-100",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 rounded text-muted-foreground hover:text-white hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation();
            onSeek();
          }}
        >
          <RiPlayLine className="h-2.5 w-2.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <RiDeleteBinLine className="h-2.5 w-2.5" />
        </Button>
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const hh = h > 0 ? `${h.toString().padStart(2, "0")}:` : "";
  const mm = m.toString().padStart(2, "0");
  const ss = s.toString().padStart(2, "0");

  return `${hh}${mm}:${ss}`;
}
