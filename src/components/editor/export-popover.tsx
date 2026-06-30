"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Row,
  RESOLUTION_GROUPS,
  RESOLUTION_PRESETS,
  VIDEO_CODECS,
  AUDIO_CODECS,
  VIDEO_FORMATS,
  AUDIO_FORMATS,
  FRAME_RATES,
  SAMPLE_RATES,
  type ResolutionPreset,
} from "./export-modal";
import { useExport, type ExportSettings } from "@/hooks/use-export";
import { useStudioStore } from "@/stores/studio-store";
import { RiSettings3Line, RiVideoLine, RiMusic2Line } from "@remixicon/react";

interface ExportPopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function ExportPopover({ open, onOpenChange, children }: ExportPopoverProps) {
  const studio = useStudioStore((state) => state.studio);
  const studioOpts = studio?.getOptions() || { width: 1920, height: 1080, fps: 30 };
  const maxDuration = studio?.getMaxDuration() || 0;

  const [step, setStep] = useState<"preset" | "advanced">("preset");
  const [settings, setSettings] = useState<ExportSettings>({
    includeVideo: true,
    videoCodec: "avc1.640033",
    quality: "12000000",
    format: "mp4",
    fps: String(studioOpts.fps || 30),
    resolution: "Full HD",
    includeAudio: true,
    audioCodec: "aac",
    audioSampleRate: "48000",
  });

  const { startExport } = useExport();

  // Keep default FPS in sync when studio changes
  useEffect(() => {
    setSettings((s) => ({
      ...s,
      fps: String(studioOpts.fps || 30),
    }));
  }, [studioOpts.fps]);

  // Format compatibility auto-switch
  useEffect(() => {
    if (!settings.includeVideo && settings.format === "mp4") {
      setSettings((s) => ({ ...s, format: "mp3" }));
    } else if (settings.includeVideo && ["mp3", "wav", "flac", "ogg"].includes(settings.format)) {
      setSettings((s) => ({ ...s, format: "mp4" }));
    }
  }, [settings.includeVideo]);

  useEffect(() => {
    if (settings.includeVideo) {
      const f = VIDEO_FORMATS.find((x) => x.value === settings.format);
      if (f && !f.codecs.includes(settings.videoCodec)) {
        setSettings((s) => ({ ...s, videoCodec: f.codecs[0] }));
      }
    }
    if (settings.format === "webm") {
      if (!["opus", "vorbis"].includes(settings.audioCodec)) {
        setSettings((s) => ({ ...s, audioCodec: "opus" }));
      }
    } else {
      if (["opus", "vorbis"].includes(settings.audioCodec)) {
        setSettings((s) => ({ ...s, audioCodec: "aac" }));
      }
    }
  }, [settings.format]);

  useEffect(() => {
    if (!settings.includeVideo) return;
    const preset = RESOLUTION_PRESETS.find((r) => r.label === settings.resolution);
    if (!preset) return;
    setSettings((s) => ({ ...s, quality: String(preset.bitrate) }));
    const height = Number(preset.value.split("x")[1]);
    if (height > 1080) {
      setSettings((s) => ({ ...s, videoCodec: "vp09.00.51.08" }));
      if (settings.format === "mov") {
        setSettings((s) => ({ ...s, format: "mp4" }));
      }
    }
  }, [settings.resolution, settings.includeVideo]);

  const applyPreset = (preset: ResolutionPreset) => {
    setSettings((s) => ({
      ...s,
      resolution: preset.label,
      quality: String(preset.bitrate),
      fps: String(preset.fps),
      videoCodec: preset.codec,
      format: preset.format,
      includeVideo: true,
    }));
  };

  const handlePresetExport = (preset: ResolutionPreset) => {
    applyPreset(preset);
    onOpenChange?.(false);
    setStep("preset");
    startExport(
      {
        ...settings,
        resolution: preset.label,
        quality: String(preset.bitrate),
        fps: String(preset.fps),
        videoCodec: preset.codec,
        format: preset.format,
      },
      preset,
    );
  };

  const handleCustomExport = () => {
    onOpenChange?.(false);
    setStep("preset");
    startExport(settings);
  };

  const selectCls =
    "h-7 w-36 text-xs bg-secondary border-border text-foreground hover:bg-muted rounded";
  const selectContentCls = "bg-popover border-border text-popover-foreground text-xs";

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-xs" align="end">
        {step === "preset" && (
          <div className="flex flex-col">
            <div className="px-3 py-2 border-b border-border">
              <h3 className="text-xs font-semibold text-foreground">Export</h3>
              <p className="text-xs text-muted-foreground">
                {(maxDuration / 1e6).toFixed(1)}s · {studioOpts.width}×{studioOpts.height}
              </p>
            </div>

            <div className="flex flex-col p-3 gap-3">
              {RESOLUTION_GROUPS.map((group) => (
                <div key={group.group} className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">{group.group}</span>
                  <div className="rounded-md border border-border bg-secondary overflow-hidden divide-y divide-border">
                    {group.items.map((preset) => (
                      <button
                        key={group.group + preset.label}
                        onClick={() => handlePresetExport(preset)}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent/50 transition-colors text-left group"
                      >
                        <span className="text-xs font-medium text-foreground">{preset.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {preset.badge}
                          </span>
                          <span className="text-[10px] text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                            {preset.format.toUpperCase()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Advanced</span>
                <div className="rounded-md border border-border bg-secondary overflow-hidden">
                  <button
                    onClick={() => setStep("advanced")}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent/50 transition-colors text-left"
                  >
                    <span className="text-xs font-medium text-foreground">Custom</span>
                    <RiSettings3Line className="size-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "advanced" && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <div>
                <h3 className="text-xs font-semibold text-foreground">Custom Export</h3>
                <p className="text-xs text-muted-foreground">
                  {studioOpts.width}×{studioOpts.height} · {(maxDuration / 1e6).toFixed(1)}s
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setStep("preset")}
                className="h-7 px-2 text-xs rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                ← Back
              </Button>
            </div>

            <div className="flex flex-col p-3 gap-3 max-h-[70vh] overflow-y-auto">
              {/* Video Section */}
              <div className="rounded-md border border-border bg-secondary overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <RiVideoLine className="size-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Video</span>
                  </div>
                  <Switch
                    checked={settings.includeVideo}
                    onCheckedChange={(v) => setSettings((s) => ({ ...s, includeVideo: v }))}
                  />
                </div>
                <div
                  className={`px-3 py-2 flex flex-col gap-2 transition-opacity ${
                    !settings.includeVideo ? "opacity-30 pointer-events-none" : ""
                  }`}
                >
                  <Row label="Resolution">
                    <Select
                      value={settings.resolution}
                      onValueChange={(v) => setSettings((s) => ({ ...s, resolution: v }))}
                    >
                      <SelectTrigger className={selectCls}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={selectContentCls}>
                        <SelectItem value="HD">720p</SelectItem>
                        <SelectItem value="Full HD">1080p</SelectItem>
                        <SelectItem value="2K Quad HD">1440p</SelectItem>
                        <SelectItem value="4K Ultra HD">2160p</SelectItem>
                      </SelectContent>
                    </Select>
                  </Row>
                  <Row label="Bitrate (Mbps)">
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={Math.round(Number(settings.quality) / 1_000_000)}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          quality: String(Number(e.target.value) * 1_000_000),
                        }))
                      }
                      className="h-7 w-36 rounded bg-secondary border border-border px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring tabular-nums"
                    />
                  </Row>
                  <Row label="Codec">
                    <Select
                      value={settings.videoCodec}
                      onValueChange={(v) => setSettings((s) => ({ ...s, videoCodec: v }))}
                    >
                      <SelectTrigger className={selectCls}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={selectContentCls}>
                        {VIDEO_CODECS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Row>
                  <Row label="Format">
                    <Select
                      value={settings.format}
                      onValueChange={(v) => setSettings((s) => ({ ...s, format: v }))}
                    >
                      <SelectTrigger className={selectCls}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={selectContentCls}>
                        {VIDEO_FORMATS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Row>
                  <Row label="Frame Rate">
                    <Select
                      value={settings.fps}
                      onValueChange={(v) => setSettings((s) => ({ ...s, fps: v }))}
                    >
                      <SelectTrigger className={selectCls}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={selectContentCls}>
                        {FRAME_RATES.map((fr) => (
                          <SelectItem key={fr.value} value={fr.value}>
                            {fr.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Row>
                </div>
              </div>

              {/* Audio Section */}
              <div className="rounded-md border border-border bg-secondary overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <RiMusic2Line className="size-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Audio</span>
                  </div>
                  <Switch
                    checked={settings.includeAudio}
                    onCheckedChange={(v) => setSettings((s) => ({ ...s, includeAudio: v }))}
                  />
                </div>
                <div
                  className={`px-3 py-2 flex flex-col gap-2 transition-opacity ${
                    !settings.includeAudio ? "opacity-30 pointer-events-none" : ""
                  }`}
                >
                  {!settings.includeVideo && (
                    <Row label="Format">
                      <Select
                        value={settings.format}
                        onValueChange={(v) => setSettings((s) => ({ ...s, format: v }))}
                      >
                        <SelectTrigger className={selectCls}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={selectContentCls}>
                          {AUDIO_FORMATS.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Row>
                  )}
                  <Row label="Codec">
                    <Select
                      value={settings.audioCodec}
                      onValueChange={(v) => setSettings((s) => ({ ...s, audioCodec: v }))}
                    >
                      <SelectTrigger className={selectCls}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={selectContentCls}>
                        {AUDIO_CODECS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Row>
                  <Row label="Sample Rate">
                    <Select
                      value={settings.audioSampleRate}
                      onValueChange={(v) => setSettings((s) => ({ ...s, audioSampleRate: v }))}
                    >
                      <SelectTrigger className={selectCls}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={selectContentCls}>
                        {SAMPLE_RATES.map((sr) => (
                          <SelectItem key={sr.value} value={sr.value}>
                            {sr.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Row>
                </div>
              </div>

              <Button
                onClick={handleCustomExport}
                className="h-7 w-full rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold"
              >
                Export
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
