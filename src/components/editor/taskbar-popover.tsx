"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDownloadStore } from "@/stores/download-store";
import { handleDownload, formatBytes } from "@/hooks/use-export";
import {
  RiArchiveDrawerLine,
  RiCloseLine,
  RiDownloadLine,
  RiLoader5Line,
  RiVideoLine,
} from "@remixicon/react";

function formatDate(timestamp: number) {
  return new Date(timestamp)
    .toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(",", "");
}

interface TaskbarPopoverProps {
  children: React.ReactNode;
}

export function TaskbarPopover({ children }: TaskbarPopoverProps) {
  const downloads = useDownloadStore((state) => state.downloads);
  const removeDownload = useDownloadStore((state) => state.removeDownload);
  const clearCompleted = useDownloadStore((state) => state.clearCompleted);
  const markDownloaded = useDownloadStore((state) => state.markDownloaded);

  const activeCount = downloads.filter((d) => d.status === "processing").length;
  const hasCompleted = downloads.some((d) => d.status === "completed" || d.status === "failed");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-7 w-7 rounded-xs flex items-center justify-center text-muted-foreground hover:text-foreground"
        >
          {children}
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-medium text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-md" align="end">
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-xs font-semibold text-foreground">Tasks</span>
            {hasCompleted && (
              <button
                onClick={clearCompleted}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {downloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-3 py-6 gap-2 text-muted-foreground">
              <RiArchiveDrawerLine className="size-5 opacity-50" />
              <span className="text-xs">No recent tasks</span>
            </div>
          ) : (
            <div className="flex flex-col max-h-72 overflow-y-auto">
              {downloads.map((download) => {
                const statusLabel =
                  download.status === "processing"
                    ? "Exporting..."
                    : download.status === "failed"
                      ? "Failed"
                      : download.downloaded
                        ? "Downloaded to browser"
                        : "Exported";

                return (
                  <div
                    key={download.id}
                    className="flex items-start gap-3 px-3 py-2 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors"
                  >
                    <div className="relative shrink-0 h-10 w-10 rounded bg-secondary border flex items-center justify-center overflow-hidden">
                      {download.status === "processing" ? (
                        <RiLoader5Line className="size-5 text-foreground animate-spin" />
                      ) : download.thumbnailUrl ? (
                        <img
                          src={download.thumbnailUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <RiVideoLine className="size-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">
                        {download.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {download.size !== undefined ? formatBytes(download.size) : "—"} ·{" "}
                        {statusLabel}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatDate(download.completedAt || download.createdAt)}
                      </div>

                      {download.status === "processing" && (
                        <div className="mt-1.5">
                          <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="absolute inset-y-0 left-0 rounded-full bg-foreground transition-all duration-300"
                              style={{ width: `${download.progress * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {download.status === "failed" && download.error && (
                        <div className="mt-1 text-[10px] text-destructive truncate">
                          {download.error}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      {download.status === "completed" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          onClick={() => {
                            if (download.url) {
                              handleDownload(download.url, download.format);
                              markDownloaded(download.id);
                            }
                          }}
                        >
                          <RiDownloadLine className="size-3.5" />
                          <span className="sr-only">Download</span>
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => removeDownload(download.id)}
                      >
                        <RiCloseLine className="size-3.5" />
                        <span className="sr-only">Clear</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
