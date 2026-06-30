"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStudioStore } from "@/stores/studio-store";
import { core } from "@/lib/project";
import {
  RiRefreshLine,
  RiLoader5Line,
  RiTimeLine,
  RiMoreLine,
  RiFile3Line,
  RiFilterLine,
  RiImage2Line,
  RiInformationLine,
  RiLink,
  RiSearchLine,
  RiMusic2Line,
  RiAddLine,
  RiSparkling2Line,
  RiDeleteBinLine,
  RiVideoLine,
} from "@remixicon/react";
import type { MediaType } from "@/types/media";
import { UploadModal } from "../upload-modal";
import Draggable from "@/components/shared/draggable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useProjectStore } from "@/stores/project-store";
import { useAssetsStore, type ProjectFile } from "@/stores/assets-store";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VisualAsset {
  id: string;
  type: MediaType;
  src: string;
  thumbnailSrc?: string | null;
  name: string;
  width?: number;
  height?: number;
  duration?: number;
  size?: number;
  indexingStatus?: "pending" | "processing" | "completed" | "failed" | null;
  indexingProgress?: number | null;
  indexingStage?: string | null;
  indexingError?: string | null;
  uploadProgress?: number | null;
  startMs?: number;
  endMs?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds?: number) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatBytes(bytes?: number) {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return "Unknown size";
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

async function getMediaDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const type = file.type.toLowerCase();
    if (type.startsWith("audio/")) {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
        URL.revokeObjectURL(audio.src);
      };
      audio.onerror = () => resolve(undefined);
    } else if (type.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        resolve(video.duration);
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => resolve(undefined);
    } else {
      resolve(undefined);
    }
  });
}

function buildDraggableData(asset: VisualAsset) {
  const typeMap: Record<MediaType, string> = { image: "Image", video: "Video", audio: "Audio" };
  return {
    type: typeMap[asset.type],
    src: asset.src,
    name: asset.name,
    ...(asset.width && { width: asset.width }),
    ...(asset.height && { height: asset.height }),
    ...(asset.duration && { duration: asset.duration * 1e6 }),
    ...(asset.type === "video" &&
      asset.thumbnailSrc && {
        metadata: {
          previewUrl: asset.thumbnailSrc,
        },
      }),
  };
}

// ─── Asset Card ───────────────────────────────────────────────────────────────

function AssetCard({
  asset,
  onAdd,
  onSelect,
  onDelete,
  onDownload,
}: {
  asset: VisualAsset;
  onAdd: (asset: VisualAsset) => void;
  onSelect: (asset: VisualAsset) => void;
  onDelete: (id: string) => void;
  onDownload: (asset: VisualAsset) => void;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { studio } = useStudioStore();
  const draggableData = buildDraggableData(asset);
  const isInUse = studio?.clips?.some((clip: any) => clip.src === asset.src);

  const preview =
    asset.type === "image" ? (
      <div className="w-20 aspect-square overflow-hidden shadow-xl border-2 border-primary">
        <img src={asset.thumbnailSrc || asset.src} className="w-full h-full object-cover" />
      </div>
    ) : asset.type === "video" ? (
      <div className="w-20 aspect-video overflow-hidden shadow-xl border-2 border-primary bg-background">
        {asset.thumbnailSrc ? (
          <img src={asset.thumbnailSrc} className="w-full h-full object-cover" />
        ) : (
          <video src={asset.src} className="w-full h-full object-cover" muted />
        )}
      </div>
    ) : (
      <div className="w-20 aspect-square overflow-hidden shadow-xl border-2 border-primary bg-secondary flex items-center justify-center">
        <RiMusic2Line size={24} className="text-primary" />
      </div>
    );

  const isTemp = asset.id.startsWith("temp_");
  const isUploading =
    isTemp ||
    (asset.uploadProgress !== undefined &&
      asset.uploadProgress !== null &&
      asset.uploadProgress < 100);
  const showPreview =
    (asset.type === "image" || asset.type === "video") &&
    asset.src &&
    !isTemp &&
    asset.uploadProgress == null; // don't render until bytes are in R2

  const formatStage = (stage: string | null | undefined) => {
    if (!stage) return "Indexing";
    return stage.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <Draggable data={draggableData} renderCustomPreview={preview}>
      <div
        className="flex flex-col gap-1.5 group cursor-pointer"
        onClick={() => !isTemp && onAdd(asset)}
      >
        <div className="relative aspect-square overflow-hidden bg-secondary/15 border border-border/30 group-hover:border-border/60 group-hover:bg-secondary/25 transition-all duration-300 flex items-center justify-center select-none shadow-[0_2px_8px_-3px_rgba(0,0,0,0.3)] group-hover:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.5)] group-hover:scale-[1.02]">
          {/* Media Type Icon & In Use Badge (Top Left) */}
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10">
            <div className="p-1 bg-background/80 backdrop-blur-md text-foreground flex items-center justify-center pointer-events-none border border-border/10 shadow-sm">
              {asset.type === "image" && <RiImage2Line size={11} strokeWidth={2.5} />}
              {asset.type === "video" && <RiVideoLine size={11} strokeWidth={2.5} />}
              {asset.type === "audio" && <RiMusic2Line size={11} strokeWidth={2.5} />}
            </div>
            {isInUse && (
              <div className="px-1.5 py-0.5 bg-primary text-[8px] text-primary-foreground font-semibold shadow-sm">
                In Use
              </div>
            )}
          </div>

          {showPreview ? (
            asset.type === "image" ? (
              <img
                src={asset.thumbnailSrc || asset.src}
                alt={asset.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-background/60">
                {asset.thumbnailSrc ? (
                  <img
                    src={asset.thumbnailSrc}
                    alt={asset.name}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  <video
                    src={asset.src}
                    className="w-full h-full object-cover pointer-events-none"
                    muted
                    onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play()}
                    onMouseOut={(e) => {
                      (e.currentTarget as HTMLVideoElement).pause();
                      (e.currentTarget as HTMLVideoElement).currentTime = 0;
                    }}
                  />
                )}
              </div>
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/20 relative gap-1.5 px-3">
              {asset.type === "audio" && !isTemp && (
                <div className="flex items-center gap-0.5 h-8 px-2 opacity-40">
                  <span className="w-[1.5px] h-2 bg-foreground/45" />
                  <span className="w-[1.5px] h-4 bg-foreground/45" />
                  <span className="w-[1.5px] h-6 bg-foreground/60" />
                  <span className="w-[1.5px] h-3 bg-foreground/50" />
                  <span className="w-[1.5px] h-5 bg-foreground/70" />
                  <span className="w-[1.5px] h-7 bg-foreground" />
                  <span className="w-[1.5px] h-5 bg-foreground/80" />
                  <span className="w-[1.5px] h-6 bg-foreground/60" />
                  <span className="w-[1.5px] h-4 bg-foreground/50" />
                  <span className="w-[1.5px] h-5 bg-foreground/70" />
                  <span className="w-[1.5px] h-2 bg-foreground/45" />
                </div>
              )}

              {/* Uploading Status Overlay */}
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 w-full px-3">
                  <div className="p-2 bg-primary/10 text-primary">
                    <RiLoader5Line className="animate-spin size-4" />
                  </div>
                  <div className="text-[10px] font-semibold text-muted-foreground text-center">
                    {asset.uploadProgress !== undefined && asset.uploadProgress !== null ? (
                      asset.uploadProgress === 100 ? (
                        <span className="animate-pulse">Finalizing...</span>
                      ) : (
                        `Uploading ${asset.uploadProgress}%`
                      )
                    ) : (
                      "Uploading..."
                    )}
                  </div>
                  {asset.uploadProgress !== undefined &&
                    asset.uploadProgress !== null &&
                    asset.uploadProgress < 100 && (
                      <div className="w-full h-1 bg-border/50 overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${asset.uploadProgress}%` }}
                        />
                      </div>
                    )}
                </div>
              ) : asset.indexingStatus === "failed" ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center gap-1.5">
                        <Badge
                          variant="destructive"
                          className="text-[9px] h-5 px-2 gap-1 hover:bg-destructive shadow-sm"
                        >
                          <RiInformationLine size={10} />
                          Failed
                        </Badge>
                        <span className="text-[9px] text-destructive/85 max-w-[80px] truncate text-center font-medium">
                          {asset.indexingError || "Error indexing"}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover border border-border text-foreground p-2 max-w-[200px] text-xs">
                      {asset.indexingError ||
                        "An error occurred during indexing pipeline processing."}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : asset.indexingStatus === "pending" || asset.indexingStatus === "processing" ? (
                /* Simplified to just "Analyzing" for active indexing states */
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <div className="p-2 bg-amber-500/10 text-amber-500 animate-pulse">
                    <RiLoader5Line className="animate-spin size-4" />
                  </div>
                  <div className="text-[10px] font-semibold text-muted-foreground text-center">
                    Analyzing
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Indexing status overlay (on preview) */}
          {showPreview &&
            (asset.indexingStatus === "pending" ||
              asset.indexingStatus === "processing" ||
              asset.indexingStatus === "failed") && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-20 px-3 transition-opacity duration-300">
                {asset.indexingStatus === "failed" ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center gap-1.5">
                          <Badge
                            variant="destructive"
                            className="text-[9px] h-5 px-2 gap-1 hover:bg-destructive"
                          >
                            <RiInformationLine size={10} />
                            Failed
                          </Badge>
                          <span className="text-[9px] text-destructive-foreground/85 max-w-[80px] truncate text-center font-medium">
                            {asset.indexingError || "Error indexing"}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover border border-border text-foreground p-2 max-w-[200px] text-xs">
                        {asset.indexingError ||
                          "An error occurred during indexing pipeline processing."}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  /* Simplified to just "Analyzing" for all indexing states */
                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <div className="p-2 bg-amber-500/20 text-amber-400">
                      <RiLoader5Line className="animate-spin size-4" />
                    </div>
                    <div className="text-[10px] font-semibold text-white/90 text-center">
                      Analyzing
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* Duration Badge & Info Button */}
          {(asset.type === "video" || asset.type === "audio") && asset.duration && (
            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 z-10">
              <span className="px-1.5 py-0.5 bg-background/80 backdrop-blur-md text-[9px] text-foreground font-semibold shadow-sm border border-border/10">
                {formatDuration(asset.duration)}
              </span>
            </div>
          )}

          {/* Hover Action Buttons */}
          {!isTemp && (
            <>
              {/* More Options Dropdown */}
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="absolute top-1.5 right-1.5 p-1 bg-background/80 backdrop-blur-md opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-all duration-200 hover:bg-secondary hover:text-foreground hover:scale-110 z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <RiMoreLine size={12} className="text-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32 py-2">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(asset);
                    }}
                    className="text-sm cursor-pointer"
                  >
                    Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(asset);
                    }}
                    className="text-sm cursor-pointer"
                  >
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(asset.id);
                    }}
                    className="text-sm text-destructive cursor-pointer"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Add/Plus Button (Bottom Right) */}
              <button
                type="button"
                className="absolute bottom-1.5 right-1.5 p-1 bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/90 hover:scale-110 z-20 shadow-md flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(asset);
                }}
              >
                <RiAddLine size={10} strokeWidth={3} />
              </button>
            </>
          )}
        </div>
        {/* Visual label for asset names below cards */}
        <div className="px-1 truncate text-[11px] text-muted-foreground group-hover:text-foreground transition-colors duration-200 font-medium text-center font-sans">
          {asset.name}
        </div>
      </div>
    </Draggable>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface PanelAssetsProps {
  showHeader?: boolean;
  showGenerator?: boolean;
}

export default function PanelAssets({ showHeader = true }: PanelAssetsProps) {
  const spaceId = useProjectStore((state) => state.spaceId);
  const projectId = useProjectStore((state) => state.projectId);
  const activeSpaceId = spaceId || projectId || "guest";

  const files = useAssetsStore((state) => state.files);
  const setFiles = useAssetsStore((state) => state.setFiles);
  const removeFile = useAssetsStore((state) => state.removeFile);
  const isAssetsStoreLoading = useAssetsStore((state) => state.isLoading);
  const setAssetsStoreLoading = useAssetsStore((state) => state.setIsLoading);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "video" | "audio">("all");
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Load files from localStorage
  useEffect(() => {
    if (activeSpaceId) {
      const stored = localStorage.getItem(`ov_assets_${activeSpaceId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setFiles(parsed);
        } catch (e) {
          console.error("Failed to parse local assets", e);
          setFiles([]);
        }
      } else {
        setFiles([]);
      }
      setAssetsStoreLoading(false);
      setIsLoaded(true);
    }
  }, [activeSpaceId, setFiles, setAssetsStoreLoading]);

  // Load uploads on mount
  useEffect(() => {
    if (!activeSpaceId) {
      setAssetsStoreLoading(false);
      setIsLoaded(true);
    }
  }, [activeSpaceId, setAssetsStoreLoading]);

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!activeSpaceId) return;
    try {
      const file = files.find((f) => f.id === id);

      const promises: Promise<any>[] = [
        file?.src && !file.src.startsWith("blob:")
          ? fetch("/api/uploads", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ src: file.src }),
            })
          : Promise.resolve(),
      ];

      // Remove from localStorage
      const localKey = `ov_assets_${activeSpaceId}`;
      const stored = localStorage.getItem(localKey);
      if (stored) {
        try {
          const existingAssets = JSON.parse(stored);
          const filtered = existingAssets.filter((a: any) => a.id !== id);
          localStorage.setItem(localKey, JSON.stringify(filtered));
        } catch (e) {
          console.error(e);
        }
      }

      await Promise.all(promises);
      removeFile(id);
    } catch (error) {
      console.error("Failed to delete upload:", error);
    }
  };

  // Handle download
  const handleDownload = async (asset: VisualAsset) => {
    try {
      const link = document.createElement("a");
      link.href = asset.src;
      link.download = asset.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download asset:", error);
    }
  };

  // Add item to canvas on click
  const addItemToCanvas = async (asset: VisualAsset) => {
    try {
      const typeMap: Record<MediaType, string> = { image: "Image", video: "Video", audio: "Audio" };
      const clipData: any = {
        type: typeMap[asset.type] as any,
        src: asset.src,
        name: asset.name,
      };

      if (asset.type === "video" && asset.thumbnailSrc) {
        clipData.metadata = {
          previewUrl: asset.thumbnailSrc,
        };
      }

      // If this asset has a startMs and endMs from semantic search, trim it!
      if (
        (asset.type === "video" || asset.type === "audio") &&
        asset.startMs !== undefined &&
        asset.endMs !== undefined
      ) {
        const startSec = asset.startMs / 1000;
        const endSec = asset.endMs / 1000;
        clipData.timing = {
          trim: { from: startSec * 1e6, to: endSec * 1e6 },
          duration: (endSec - startSec) * 1e6,
        };
      }

      await core.clip.add(clipData, { objectFit: "contain" });
    } catch (error) {
      console.error("Failed to add clip:", error);
    }
  };

  // Map Zustand files to VisualAsset interface for rendering compatibility
  const mappedAssets: VisualAsset[] = files.map((f) => ({
    id: f.id,
    type: f.type,
    src: f.src,
    thumbnailSrc: f.thumbnailSrc,
    name: f.name,
    duration: f.duration,
    size: f.size,
    indexingStatus: f.indexingStatus,
    indexingProgress: f.indexingProgress,
    indexingStage: f.indexingStage,
    indexingError: f.indexingError,
    uploadProgress: f.uploadProgress,
  }));

  const selectedAsset = mappedAssets.find((a) => a.id === selectedAssetId) || null;

  const filteredAssets = mappedAssets.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || a.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (!isLoaded || isAssetsStoreLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <RiLoader5Line className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      <UploadModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        spaceId={activeSpaceId || ""}
      />

      {/* ── Uploads area (scrollable) ── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Search, Filter, Upload Row (always visible) */}
        <div className="flex flex-col gap-2 px-4 py-3 border-b border-border/40 bg-background/20 backdrop-blur-md">
          {/* Row 1: Search, Filter & Upload */}
          <div className="flex items-center gap-2 w-full">
            {/* Search Input Container using standard shadcn components */}
            <div className="relative flex-1">
              <RiSearchLine
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />
              <Input
                placeholder="Find quotes or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs bg-secondary/30 hover:bg-secondary/40 focus-visible:bg-background border-border/40 placeholder:text-muted-foreground/70 transition-colors rounded-lg"
              />
            </div>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0 shrink-0 bg-secondary/30 hover:bg-secondary border-border/40 text-foreground flex items-center justify-center transition-colors"
                >
                  <RiFilterLine size={15} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="border-border bg-popover text-popover-foreground w-36"
              >
                {[
                  { value: "all", label: "All Assets" },
                  { value: "image", label: "Images" },
                  { value: "video", label: "Videos" },
                  { value: "audio", label: "Audio" },
                ].map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setFilterType(option.value as any)}
                    className="flex items-center justify-between px-3 py-2 text-[13px] font-medium hover:bg-secondary/50 cursor-pointer"
                  >
                    <span>{option.label}</span>
                    {filterType === option.value && <div className="size-1.5 bg-foreground" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Upload Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 p-0 shrink-0 bg-secondary/30 hover:bg-secondary border-border/40 text-foreground flex items-center justify-center transition-colors"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    <RiAddLine size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-popover border border-border text-foreground text-[11px] px-2 py-1">
                  Upload assets
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {files.length === 0 ? (
          /* Empty state - styled like captions.tsx */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
            <div className="flex flex-col items-center justify-center pb-8 max-w-[240px] bg-secondary/10 border border-border/30 rounded-xl p-8 backdrop-blur-xs shadow-sm">
              <div className="size-12 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-full mb-4 text-primary shadow-[0_0_15px_-3px_rgba(var(--primary),0.2)]">
                <RiImage2Line size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-xs font-bold text-foreground mb-1.5">No assets yet</h3>
              <p className="text-[11px] text-muted-foreground/90 leading-relaxed mb-5 text-center">
                Upload your videos, images, or audio files to start building your video project.
              </p>
              <Button
                size="sm"
                className="w-full text-xs font-medium gap-1.5"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <RiAddLine size={14} strokeWidth={2.5} />
                Upload assets
              </Button>
            </div>
          </div>
        ) : (
          /* With assets: grid */
          <ScrollArea className="flex-1 px-4">
            {filteredAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                <RiImage2Line size={28} className="opacity-40" />
                <span className="text-xs">No matches found.</span>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-3 pb-4">
                {filteredAssets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onAdd={addItemToCanvas}
                    onSelect={(asset) => setSelectedAssetId(asset.id)}
                    onDelete={handleDelete}
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </div>
      {/* Asset Preview & Details Dialog Modal */}
      <Dialog
        open={selectedAssetId !== null}
        onOpenChange={(open) => !open && setSelectedAssetId(null)}
      >
        <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden bg-popover">
          <DialogHeader className="sr-only">
            <DialogTitle>Asset Preview: {selectedAsset?.name}</DialogTitle>
            <DialogDescription>Preview and manage asset details</DialogDescription>
          </DialogHeader>

          {selectedAsset && (
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] min-h-[480px] max-h-[680px]">
              {/* Left Column: Preview */}
              <div className="bg-black/40 flex items-center justify-center p-6 min-h-[420px] max-h-[500px]">
                {selectedAsset.type === "image" && (
                  <img
                    src={selectedAsset.src}
                    alt={selectedAsset.name}
                    className="max-w-full max-h-[420px] object-contain shadow-xl"
                  />
                )}
                {selectedAsset.type === "video" && (
                  <video
                    src={selectedAsset.src}
                    controls
                    className="max-w-full max-h-[420px] object-contain shadow-xl"
                  />
                )}
                {selectedAsset.type === "audio" && (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="size-16 bg-primary/10 flex items-center justify-center">
                      <RiMusic2Line size={28} className="text-primary" />
                    </div>
                    <audio src={selectedAsset.src} controls className="w-48" />
                  </div>
                )}
              </div>

              {/* Right Column: Details & Actions */}
              <div className="p-5 flex flex-col gap-4 border-l border-border">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                      {selectedAsset.type}
                    </Badge>
                    {selectedAsset.indexingStatus === "completed" &&
                      selectedAsset.type !== "audio" && (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        >
                          Ready
                        </Badge>
                      )}
                    {selectedAsset.indexingStatus === "failed" && (
                      <Badge variant="destructive" className="text-[10px]">
                        Failed
                      </Badge>
                    )}
                    {(selectedAsset.indexingStatus === "pending" ||
                      selectedAsset.indexingStatus === "processing") && (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20"
                      >
                        {selectedAsset.indexingStatus === "pending" ? "Queued" : "Processing"}
                      </Badge>
                    )}
                  </div>

                  <h2 className="text-lg font-semibold break-all leading-tight">
                    {selectedAsset.name}
                  </h2>
                </div>

                <Separator />

                {/* Metadata */}
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <RiFile3Line size={14} />
                      File Size
                    </span>
                    <span className="font-medium font-mono">{formatBytes(selectedAsset.size)}</span>
                  </div>

                  {selectedAsset.duration && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <RiTimeLine size={14} />
                        Duration
                      </span>
                      <span className="font-medium font-mono">
                        {formatDuration(selectedAsset.duration)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <RiLink size={14} />
                      Source
                    </span>
                    <a
                      href={selectedAsset.src}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline text-xs font-mono truncate max-w-[140px]"
                    >
                      Open Link
                    </a>
                  </div>
                </div>

                {/* Status */}
                {selectedAsset.indexingStatus !== "completed" && (
                  <Alert
                    variant={selectedAsset.indexingStatus === "failed" ? "destructive" : "default"}
                    className={
                      selectedAsset.indexingStatus === "failed"
                        ? ""
                        : "border-amber-500/20 bg-amber-500/5"
                    }
                  >
                    <AlertTitle className="text-xs flex items-center gap-2">
                      {selectedAsset.indexingStatus === "failed" ? (
                        <>
                          <RiInformationLine size={12} />
                          Indexing Failed
                        </>
                      ) : (
                        <>
                          <RiLoader5Line size={12} className="animate-spin" />
                          Indexing
                        </>
                      )}
                    </AlertTitle>
                    <AlertDescription className="text-[11px] mt-1">
                      {selectedAsset.indexingStatus === "failed" ? (
                        <span>
                          {selectedAsset.indexingError || "An error occurred during processing."}
                        </span>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <span>
                            {selectedAsset.indexingStatus === "pending"
                              ? "Queued for indexing"
                              : selectedAsset.indexingStage
                                ? selectedAsset.indexingStage
                                    .replace(/[_-]/g, " ")
                                    .replace(/\b\w/g, (c) => c.toUpperCase())
                                : "Processing..."}
                          </span>
                          {selectedAsset.indexingProgress !== null &&
                            selectedAsset.indexingProgress !== undefined &&
                            selectedAsset.indexingProgress > 0 && (
                              <Progress value={selectedAsset.indexingProgress} className="h-1" />
                            )}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    className="w-full"
                    onClick={async () => {
                      await addItemToCanvas(selectedAsset);
                      setSelectedAssetId(null);
                    }}
                  >
                    <RiAddLine data-icon="inline-start" />
                    Add to Timeline
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={async () => {
                      await handleDelete(selectedAsset.id);
                      setSelectedAssetId(null);
                    }}
                  >
                    <RiDeleteBinLine data-icon="inline-start" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
