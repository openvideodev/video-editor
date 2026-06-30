import { create } from "zustand";

type EditorMode = "editor" | "agent" | "playground";

interface PanelState {
  toolsPanel: number;
  copilotPanel: number;
  previewPanel: number;
  propertiesPanel: number;
  mainContent: number;
  timeline: number;
  isCopilotVisible: boolean;
  editorMode: EditorMode;
  showLeftPanel: boolean;
  showRightPanel: boolean;
  showTimeline: boolean;

  setToolsPanel: (size: number) => void;
  setCopilotPanel: (size: number) => void;
  setPreviewPanel: (size: number) => void;
  setPropertiesPanel: (size: number) => void;
  setMainContent: (size: number) => void;
  setTimeline: (size: number) => void;
  toggleCopilot: () => void;
  setEditorMode: (mode: EditorMode) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleTimeline: () => void;
  resetLayout: () => void;
}

export const usePanelStore = create<PanelState>((set) => ({
  toolsPanel: 21,
  copilotPanel: 21,
  previewPanel: 50,
  propertiesPanel: 25,
  mainContent: 70,
  timeline: 30,
  isCopilotVisible: true,
  editorMode: "editor",
  showLeftPanel: true,
  showRightPanel: true,
  showTimeline: true,

  setToolsPanel: (size) => set({ toolsPanel: size }),
  setPreviewPanel: (size) => set({ previewPanel: size }),
  setPropertiesPanel: (size) => set({ propertiesPanel: size }),
  setMainContent: (size) => set({ mainContent: size }),
  setTimeline: (size) => set({ timeline: size }),
  setCopilotPanel: (size) => set({ copilotPanel: size }),
  toggleCopilot: () => set((state) => ({ isCopilotVisible: !state.isCopilotVisible })),
  setEditorMode: (mode) => set({ editorMode: mode }),
  toggleLeftPanel: () => set((state) => ({ showLeftPanel: !state.showLeftPanel })),
  toggleRightPanel: () => set((state) => ({ showRightPanel: !state.showRightPanel })),
  toggleTimeline: () => set((state) => ({ showTimeline: !state.showTimeline })),
  resetLayout: () => set({ showLeftPanel: true, showRightPanel: true, showTimeline: true }),
}));

