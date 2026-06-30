"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAssetUpload } from "@/hooks/use-asset-upload";
import { cn } from "@/lib/utils";
import {
  RiUploadLine,
  RiCloseLine,
  RiImage2Line,
  RiVideoLine,
  RiMusic2Line,
} from "@remixicon/react";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string | null;
}

function formatBytes(bytes?: number) {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return "";
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function detectFileType(file: File): "image" | "video" | "audio" {
  const mime = file.type.toLowerCase();
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  return "image";
}

function FileTypeIcon({ type }: { type: "image" | "video" | "audio" }) {
  const className = "size-4 text-muted-foreground";
  if (type === "video") return <RiVideoLine className={className} />;
  if (type === "audio") return <RiMusic2Line className={className} />;
  return <RiImage2Line className={className} />;
}

export function UploadModal({ open, onOpenChange, spaceId }: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFiles, isUploading } = useAssetUpload({
    spaceId,
    onComplete: () => {
      setSelectedFiles([]);
      setIsDragging(false);
      onOpenChange(false);
    },
  });

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach((file) => dataTransfer.items.add(file));
    await uploadFiles(dataTransfer.files);
  }, [selectedFiles, uploadFiles]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <Dialog open={open} onOpenChange={(value) => !isUploading && onOpenChange(value)}>
      <DialogContent className="flex flex-col sm:max-w-[380px] min-h-[320px] p-0 rounded-lg overflow-hidden border border-border bg-popover shadow-2xl">
        <DialogHeader className="px-4 py-2.5 border-b border-border">
          <DialogTitle className="text-xs font-semibold text-foreground">Upload assets</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col p-4 gap-3">
          {/* Dropzone or Add more button */}
          {selectedFiles.length === 0 ? (
            <div
              className={cn(
                "flex-1 border border-dashed border-border bg-secondary/10 rounded-lg overflow-hidden flex flex-col transition-all duration-200",
                isUploading && "pointer-events-none opacity-60",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/40 hover:bg-secondary/20",
              )}
            >
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="flex-1 flex flex-col items-center justify-center gap-2 p-4 cursor-pointer"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/25">
                  <RiUploadLine size={16} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-foreground">Drag & drop files to upload</p>
                  <p className="text-[10px] text-muted-foreground/80">or click to browse files</p>
                </div>
                <Button size="sm" className="h-7 text-[11px] px-3 mt-0.5">
                  Browse files
                </Button>
                <p className="text-[9px] text-muted-foreground/60">
                  Supports images, videos, and audio
                </p>
              </div>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "flex items-center justify-center border border-dashed border-border bg-secondary/10 rounded-lg px-3 py-2 transition-all duration-200",
                "hover:bg-secondary/20 hover:border-primary/40",
                isDragging && "border-primary bg-primary/5",
              )}
            >
              <button
                type="button"
                onClick={() => !isUploading && fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-1.5 text-xs font-medium text-foreground disabled:opacity-50 hover:text-primary transition-colors"
              >
                <RiUploadLine size={13} />
                Add more files
              </button>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*,audio/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
          />

          {/* Selected files */}
          {selectedFiles.length > 0 && (
            <div className="border border-border bg-secondary/5 rounded-lg overflow-hidden flex-1 flex flex-col min-h-[120px]">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-secondary/10">
                <span className="text-[11px] font-medium text-foreground">Selected files</span>
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                  onClick={clearFiles}
                  disabled={isUploading}
                >
                  Clear all
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="flex flex-col">
                  {selectedFiles.map((file, index) => {
                    const type = detectFileType(file);
                    return (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-border/40 last:border-b-0 hover:bg-secondary/10 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileTypeIcon type={type} />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-foreground truncate max-w-[220px]">
                              {file.name}
                            </span>
                            <span className="text-[9px] font-mono text-muted-foreground/80">
                              {formatBytes(file.size)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-md"
                          onClick={() => removeFile(index)}
                          disabled={isUploading}
                        >
                          <RiCloseLine size={13} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-border bg-muted/50">
          <Button
            variant="secondary"
            size="sm"
            className="h-7 text-xs px-3"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs px-3"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading
              ? "Uploading..."
              : selectedFiles.length > 0
                ? `Upload ${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"}`
                : "Upload files"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
