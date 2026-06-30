import { create } from "zustand";

export type DownloadStatus = "pending" | "processing" | "completed" | "failed";

export interface DownloadItem {
  id: string;
  type: "export";
  name: string;
  status: DownloadStatus;
  progress: number;
  format: string;
  size?: number;
  createdAt: number;
  completedAt?: number;
  url?: string;
  thumbnailUrl?: string;
  downloaded?: boolean;
  error?: string;
}

interface DownloadState {
  downloads: DownloadItem[];
  addDownload: (item: Omit<DownloadItem, "id" | "createdAt" | "status" | "progress">) => string;
  updateDownload: (id: string, patch: Partial<DownloadItem>) => void;
  removeDownload: (id: string) => void;
  clearCompleted: () => void;
  markDownloaded: (id: string) => void;
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  downloads: [],
  addDownload: (item) => {
    const id = Math.random().toString(36).slice(2);
    const download: DownloadItem = {
      ...item,
      id,
      status: "pending",
      progress: 0,
      createdAt: Date.now(),
    };
    set({ downloads: [download, ...get().downloads] });
    return id;
  },
  updateDownload: (id, patch) => {
    set((state) => ({
      downloads: state.downloads.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }));
  },
  removeDownload: (id) => {
    set((state) => {
      const item = state.downloads.find((d) => d.id === id);
      if (item?.url) URL.revokeObjectURL(item.url);
      if (item?.thumbnailUrl) URL.revokeObjectURL(item.thumbnailUrl);
      return { downloads: state.downloads.filter((d) => d.id !== id) };
    });
  },
  clearCompleted: () => {
    set((state) => {
      const completed = state.downloads.filter(
        (d) => d.status === "completed" || d.status === "failed",
      );
      completed.forEach((d) => {
        if (d.url) URL.revokeObjectURL(d.url);
        if (d.thumbnailUrl) URL.revokeObjectURL(d.thumbnailUrl);
      });
      return {
        downloads: state.downloads.filter((d) => d.status !== "completed" && d.status !== "failed"),
      };
    });
  },
  markDownloaded: (id) => {
    set((state) => ({
      downloads: state.downloads.map((d) => (d.id === id ? { ...d, downloaded: true } : d)),
    }));
  },
}));
