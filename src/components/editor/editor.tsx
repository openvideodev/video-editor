"use client";
import { useState, useEffect } from "react";
import { Resizable } from "@/components/editor/resizable-panel";
import { useParams } from "next/navigation";
import { MediaPanel } from "@/components/editor/media-panel";
import { CanvasPanel } from "@/components/editor/canvas-panel";
import Timeline from "@/components/editor/timeline";
import { usePanelStore } from "@/stores/panel-store";
import { Loading } from "@/components/editor/loading";
import FloatingControl from "@/components/editor/floating-controls/floating-control";
import { Compositor } from "@openvideo/engine-pixi";
import { WebCodecsUnsupportedModal } from "@/components/editor/webcodecs-unsupported-modal";
import { RightPanel } from "./right-panel";
import { core } from "@/lib/project";
import { IProject } from "@openvideo/core";
import { useProjectStore } from "@/stores/project-store";
import Header from "./header";
import { data } from "./data";

export default function Editor({
  initialDesign,
}: {
  isDataLoading?: boolean;
  initialDesign?: IProject;
}) {
  const resetProject = useProjectStore((state) => state.resetProject);
  const { editorMode, showLeftPanel, showRightPanel, showTimeline } = usePanelStore();

  const [isReady, setIsReady] = useState(false);
  const [isWebCodecsSupported, setIsWebCodecsSupported] = useState(true);

  // Load default template on mount
  useEffect(() => {
    resetProject();
    core.project.new();
    setTimeout(() => {
      core.project.import(data);
    }, 500);
  }, [resetProject]);

  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = await Compositor.isSupported();
      setIsWebCodecsSupported(isSupported);
    };
    checkSupport();
  }, []);

  // Clear loading screen for non-editor modes (CanvasPanel doesn't mount, onReady never fires)
  useEffect(() => {
    if (editorMode !== "editor") {
      setIsReady(true);
    }
  }, [editorMode]);

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {!isReady && (
        <div className="absolute inset-0 z-100">
          <Loading />
        </div>
      )}

      {/* Header — full width */}
      <Header />

      {/* Main content row: left sidebar + center + right sidebar */}
      <div className="flex-1 min-h-0 flex flex-row overflow-hidden">
        {/* Left Sidebar: Media Panel */}
        {showLeftPanel && (
          <Resizable orientation="horizontal" initialSize={300} min={180} max={520} direction="right">
            <MediaPanel />
          </Resizable>
        )}

        {/* Center: Canvas (top) + Timeline (bottom) */}
        <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-visible">
            <CanvasPanel onReady={() => setIsReady(true)} />
          </div>
          {showTimeline && (
            <Resizable orientation="vertical" initialSize={260} min={200} max={500} direction="up">
              <Timeline />
            </Resizable>
          )}
        </div>

        {showRightPanel && (
          <Resizable
            orientation="horizontal"
            initialSize={280}
            min={180}
            max={520}
            direction="left"
            className="right-resizable-panel"
          >
            <RightPanel />
          </Resizable>
        )}
      </div>


      {/* Floating Controls like Caption / Animation pickers */}
      <FloatingControl />

      {/* WebCodecs Support Check Modal */}
      <WebCodecsUnsupportedModal open={!isWebCodecsSupported} />
    </div>
  );
}
