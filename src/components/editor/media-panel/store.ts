import {
  RiClosedCaptioningLine,
  RiClosedCaptioningFill,
  RiGitMergeLine,
  RiGitMergeFill,
  RiShapesLine,
  RiShapesFill,
  RiFolderOpenLine,
  RiFolderOpenFill,
  RiTBoxLine,
  RiTBoxFill,
  RiColorFilterLine,
  RiColorFilterFill,
} from "@remixicon/react";
import { create } from "zustand";

export type Tab = "assets" | "text" | "captions" | "effects" | "transitions" | "elements";

export const tabs: {
  [key in Tab]: {
    icon: React.ComponentType<any> | React.FC<any>;
    activeIcon: React.ComponentType<any> | React.FC<any>;
    label: string;
  };
} = {
  assets: {
    icon: RiFolderOpenLine,
    activeIcon: RiFolderOpenFill,
    label: "Assets",
  },
  text: {
    icon: RiTBoxLine,
    activeIcon: RiTBoxFill,
    label: "Text",
  },
  captions: {
    icon: RiClosedCaptioningLine,
    activeIcon: RiClosedCaptioningFill,
    label: "Captions",
  },
  transitions: {
    icon: RiGitMergeLine,
    activeIcon: RiGitMergeFill,
    label: "Transitions",
  },
  effects: {
    icon: RiColorFilterLine,
    activeIcon: RiColorFilterFill,
    label: "Effects",
  },
  elements: {
    icon: RiShapesLine,
    activeIcon: RiShapesFill,
    label: "Elements",
  },
};

interface MediaPanelStore {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  highlightMediaId: string | null;
  requestRevealMedia: (mediaId: string) => void;
  clearHighlight: () => void;
  showProperties: boolean;
  setShowProperties: (show: boolean) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  showLabels: boolean;
  setShowLabels: (show: boolean) => void;
}

export const useMediaPanelStore = create<MediaPanelStore>((set) => ({
  activeTab: "assets",
  setActiveTab: (tab) => set({ activeTab: tab, showProperties: false, isOpen: true }),
  highlightMediaId: null,
  requestRevealMedia: (mediaId) =>
    set({
      activeTab: "assets",
      highlightMediaId: mediaId,
      showProperties: false,
      isOpen: true,
    }),
  clearHighlight: () => set({ highlightMediaId: null }),
  showProperties: false,
  setShowProperties: (show) => set({ showProperties: show }),
  isOpen: true,
  setIsOpen: (open) => set({ isOpen: open }),
  showLabels: false,
  setShowLabels: (show) => set({ showLabels: show }),
}));
