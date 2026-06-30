"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { Compositor, Log } from "@openvideo/engine-pixi";
import { useStudioStore } from "@/stores/studio-store";
import { useDownloadStore } from "@/stores/download-store";
import { generateThumbnail } from "@/lib/thumbnail-generator";
import { RESOLUTION_PRESETS, type ResolutionPreset } from "@/components/editor/export-modal";

export interface ExportSettings {
  includeVideo: boolean;
  videoCodec: string;
  quality: string;
  format: string;
  fps: string;
  resolution: string;
  includeAudio: boolean;
  audioCodec: string;
  audioSampleRate: string;
}

export function formatBytes(bytes?: number) {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return "—";
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

function exportFileName(format: string) {
  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
  return `${stamp}.${format}`;
}

function suppressRenderLoop(): () => void {
  const originalRAF = window.requestAnimationFrame.bind(window);
  const originalCAF = window.cancelAnimationFrame.bind(window);
  const queued = new Map<number, FrameRequestCallback>();
  let idCounter = 0x70000000;

  const win = window as Window & {
    requestAnimationFrame: (cb: FrameRequestCallback) => number;
    cancelAnimationFrame: (id: number) => void;
  };

  win.requestAnimationFrame = (cb) => {
    const id = ++idCounter;
    queued.set(id, cb);
    return id;
  };
  win.cancelAnimationFrame = (id) => {
    if (id >= 0x70000000) {
      queued.delete(id);
    }
  };

  return () => {
    win.requestAnimationFrame = originalRAF;
    win.cancelAnimationFrame = originalCAF;
    queued.forEach((cb) => originalRAF(cb));
    queued.clear();
  };
}

export function handleDownload(url: string, format: string) {
  const aEl = document.createElement("a");
  document.body.appendChild(aEl);
  aEl.setAttribute("href", url);
  aEl.setAttribute("download", `openvideo-export-${Date.now()}.${format}`);
  aEl.setAttribute("target", "_self");
  aEl.click();
  setTimeout(() => {
    if (document.body.contains(aEl)) document.body.removeChild(aEl);
  }, 100);
}

export function useExport() {
  const studio = useStudioStore((state) => state.studio);
  const addDownload = useDownloadStore((state) => state.addDownload);
  const updateDownload = useDownloadStore((state) => state.updateDownload);
  const markDownloaded = useDownloadStore((state) => state.markDownloaded);

  const startExport = useCallback(
    async (settings: ExportSettings, targetPreset?: ResolutionPreset) => {
      if (!studio) return;

      const activeFormat = targetPreset ? targetPreset.format : settings.format;
      const downloadId = addDownload({
        type: "export",
        name: exportFileName(activeFormat),
        format: activeFormat,
      });

      toast.info("Download has started");
      updateDownload(downloadId, { status: "processing" });

      const wasPlaying = studio.getIsPlaying();
      const restoreRAF = suppressRenderLoop();
      let compositor: Compositor | null = null;

      try {
        if (wasPlaying) studio.pause();
        studio.suspendRendering();

        const json = studio.exportToJSON();
        if (!json.clips || Object.keys(json.clips).length === 0) {
          throw new Error("No clips to export");
        }

        const studioOpts = studio.getOptions() || {
          width: 1920,
          height: 1080,
          fps: 30,
        };
        const projectSettings = json.settings || {};
        const resolvedPreset =
          targetPreset || RESOLUTION_PRESETS.find((r) => r.label === settings.resolution);

        const activeQuality = targetPreset ? String(targetPreset.bitrate) : settings.quality;
        const activeFps = targetPreset ? String(targetPreset.fps) : settings.fps;
        const activeCodec = targetPreset ? targetPreset.codec : settings.videoCodec;

        const projectWidth = projectSettings.width || studioOpts.width || 1920;
        const projectHeight = projectSettings.height || studioOpts.height || 1080;
        const isProjectPortrait = projectHeight > projectWidth;

        let exportWidth: number;
        let exportHeight: number;

        if (resolvedPreset?.value?.includes("x")) {
          const [presetW, presetH] = resolvedPreset.value.split("x").map(Number);
          const isPresetPortrait = presetH > presetW;
          if (isProjectPortrait !== isPresetPortrait) {
            exportWidth = presetH;
            exportHeight = presetW;
          } else {
            exportWidth = presetW;
            exportHeight = presetH;
          }
        } else {
          exportWidth = projectWidth;
          exportHeight = projectHeight;
        }

        const compositorOptions: any = {
          width: settings.includeVideo ? exportWidth : 0,
          height: settings.includeVideo ? exportHeight : 0,
          fps: Number(activeFps),
          backgroundColor: projectSettings.backgroundColor || "#000000",
          format: activeFormat,
          videoCodec: settings.includeVideo ? activeCodec : undefined,
          bitrate: Number(activeQuality),
          audio: settings.includeAudio ? true : false,
          audioCodec: settings.includeAudio ? settings.audioCodec : undefined,
          audioSampleRate: settings.includeAudio ? Number(settings.audioSampleRate) : undefined,
          prioritizeSpeed: true,
        };

        compositor = new Compositor(compositorOptions);
        if (settings.includeVideo) await compositor.initPixiApp();

        compositor.on("export:progress", (v: number) => {
          updateDownload(downloadId, { progress: v });
        });

        await compositor.loadFromJSON(json);
        const stream = compositor.output();
        const blob = await new Response(stream).blob();
        const blobUrl = URL.createObjectURL(blob);

        updateDownload(downloadId, {
          status: "completed",
          progress: 1,
          url: blobUrl,
          completedAt: Date.now(),
          name: exportFileName(activeFormat),
          size: blob.size,
        });

        handleDownload(blobUrl, activeFormat);
        markDownloaded(downloadId);
        toast.success("Rendering complete! Your download has started.");

        // Generate thumbnail in the background once the export is done
        const exportFile = new File([blob], exportFileName(activeFormat), { type: blob.type });
        generateThumbnail(exportFile)
          .then((thumbnailBlob) => {
            if (thumbnailBlob) {
              updateDownload(downloadId, {
                thumbnailUrl: URL.createObjectURL(thumbnailBlob),
              });
            }
          })
          .catch(() => undefined);
      } catch (error) {
        Log.error("Export error:", error);
        const message = (error as Error).message || "Unknown error";
        updateDownload(downloadId, { status: "failed", error: message });
        toast.error(`Export failed: ${message}`);
      } finally {
        restoreRAF();
        studio.resumeRendering();
        if (wasPlaying) studio.play().catch(() => undefined);
        if (compositor) {
          compositor.destroy();
        }
      }
    },
    [studio, addDownload, updateDownload, markDownloaded],
  );

  return { startExport };
}
