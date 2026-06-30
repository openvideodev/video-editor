import { useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import Header from "./header";
import Ruler from "./ruler";
import {
  timeUsToUnits,
  unitsToTimeUs,
  TimelineBridge,
  TimelineScrollbars,
} from "@openvideo/timeline";
import CanvasTimeline from "./items/timeline";
import { useStudioStore } from "@/stores/studio-store";
import { projectStore, core } from "@/lib/project";
import Playhead from "./playhead";
import { useEditorHotkeys } from "@/hooks/use-editor-hotkeys";
import { Audio, Image, Text, Video, Caption, Helper, Track, Transition, Backdrop } from "./items";
import PreviewTrackItem from "./items/preview-drag-item";
import { useTimelineOffsetX } from "../hooks/use-timeline-offset";
import { addStudioSync } from "./studio-to-store-sync";
import { TIMELINE_SCALE_CHANGED } from "@openvideo/timeline";
import Effect from "./items/effect";
import { useTimelineContextMenu, TimelineContextMenuProvider } from "./timeline-context-menu";
import Shape from "./items/shape";

CanvasTimeline.registerItems({
  Text,
  Image,
  Audio,
  Video,
  Caption,
  Helper,
  Track,
  PreviewTrackItem,
  Effect,
  Transition,
  Shape,
  Backdrop,
});

const EMPTY_SIZE = { width: 0, height: 0 };

const Timeline = () => {
  // prevent duplicate scroll events
  const [scrollLeft, setScrollLeft] = useState(0);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<CanvasTimeline | null>(null);
  const horizontalScrollbarVpRef = useRef<HTMLDivElement>(null);
  const currentTimeUs = useStore(projectStore, (s) => s.currentTime);
  const durationUs = useStore(projectStore, (s) => s.settings.duration);
  const { studio } = useStudioStore();
  const scale = useStore(projectStore, (s) => s.scale);
  const setScale = projectStore.getState().setScale;

  const timelineOffsetX = useTimelineOffsetX();
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const onMouseDown = () => {};
  const onMouseMove = () => {};
  const onMouseOut = () => {};

  const [timeline, setTimeline] = useState<CanvasTimeline | null>(null);

  // Context menu state
  const { state: contextMenuState, openContextMenu, closeContextMenu } = useTimelineContextMenu();

  // Keyboard shortcuts
  useEditorHotkeys({
    timelineCanvas: timeline,
    setZoomLevel: (zoomLevel) => {
      if (typeof zoomLevel === "function") {
        setScale((prev) => ({ ...prev, zoom: zoomLevel(prev.zoom) }));
      } else {
        setScale((prev) => ({ ...prev, zoom: zoomLevel }));
      }
    },
  });
  useEffect(() => {
    const position = timeUsToUnits(currentTimeUs, scale.zoom);
    const canvasEl = canvasElRef.current;
    const horizontalScrollbar = horizontalScrollbarVpRef.current;

    if (!canvasEl || !horizontalScrollbar) return;

    const canvasBoudingX = canvasEl.getBoundingClientRect().x + canvasEl.clientWidth;
    const playHeadPos = position - scrollLeft + 40;
    if (playHeadPos >= canvasBoudingX) {
      const scrollDivWidth = horizontalScrollbar.clientWidth;
      const totalScrollWidth = horizontalScrollbar.scrollWidth;
      const currentPosScroll = horizontalScrollbar.scrollLeft;
      const availableScroll = totalScrollWidth - (scrollDivWidth + currentPosScroll);
      const scaleScroll = availableScroll / scrollDivWidth;
      if (scaleScroll >= 0) {
        if (scaleScroll > 1)
          horizontalScrollbar.scrollTo({
            left: currentPosScroll + scrollDivWidth,
          });
        else
          horizontalScrollbar.scrollTo({
            left: totalScrollWidth - scrollDivWidth,
          });
      }
    }
  }, [currentTimeUs]);
  const onResizeCanvas = (payload: { width: number; height: number }) => {};

  useEffect(() => {
    const timelineContainerEl = timelineContainerRef.current;
    if (!timelineContainerEl) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !canvasRef.current) return;

      const { height, width } = entry.contentRect;
      // Dynamically calculate available height for the canvas
      // Header is 50px, Ruler is 24px + 1px border = 25px.
      // Total UI offset = 75px.
      const containerWidth = width - timelineOffsetX;
      const containerHeight = height - 75;

      canvasRef.current.resize(
        {
          width: containerWidth,
          height: containerHeight,
        },
        { force: true },
      );
    });

    resizeObserver.observe(timelineContainerEl);
    return () => resizeObserver.disconnect();
  }, [timelineOffsetX]);

  useEffect(() => {
    const canvasEl = canvasElRef.current;
    const timelineContainerEl = timelineContainerRef.current;

    if (!canvasEl || !timelineContainerEl) return;

    const containerWidth =
      (document.getElementById("timeline-header")?.clientWidth || 0) - timelineOffsetX;
    const containerHeight = (timelineContainerEl.clientHeight || 320) - 75;
    const canvas = new CanvasTimeline(canvasEl, {
      width: containerWidth,
      height: containerHeight,
      bounding: {
        width: containerWidth,
        height: 0,
      },
      selectionColor: "rgba(0, 216, 214,0.1)",
      selectionBorderColor: "rgba(0, 216, 214,1.0)",
      onResizeCanvas,
      scale: scale,
      duration: durationUs,
      spacing: {
        left: 16,
        right: 40,
      },
      sizesMap: {
        caption: 32,
        shape: 32,
        text: 30,
        effect: 32,
        audio: 36,
        video: 48,
        image: 48,
        transition: 40,
        main: 48,
      },
      itemTypes: [
        "text",
        "image",
        "audio",
        "video",
        "caption",
        "helper",
        "effect",
        "track",
        "transition",
        "shape",
      ],
      acceptsMap: {
        text: ["text", "caption"],
        effect: ["effect"],
        image: ["image", "video"],
        main: ["image", "video"],
        video: ["video", "image"],
        audio: ["audio"],
        caption: ["caption", "text"],
        shape: ["shape"],
      },
      guideLineColor: "#ffffff",
      withTransitions: ["image", "video"],
    });

    const scrollbars = new TimelineScrollbars({
      canvas,
      offsetX: 16,
      offsetY: 0,
      extraMarginX: 100,
      extraMarginY: 50,
      scrollbarWidth: 6,
      scrollbarColor: "rgba(42, 42, 42, 0.85)",
      stroke: "rgba(255, 255, 255, 0.013)",
      lineWidth: 1,
      cornerRadius: 0,
      onViewportChange: (left: number) => {
        setScrollLeft(left + 16);
      },
    });

    canvas.emitter.on(TIMELINE_SCALE_CHANGED, (data) => {
      const newScale = data.payload.scale;
      if (newScale.zoom !== scale.zoom) {
        setScale(newScale);
      }
    });

    canvasRef.current = canvas;

    const bridge = new TimelineBridge(core, canvas);

    setTimeline(canvas);

    const observer = new MutationObserver(() => {
      canvas.requestRenderAll();
    });
    observer.observe(document.documentElement, {
      attributeFilter: ["class", "style"],
      attributes: true,
    });

    return () => {
      observer.disconnect();
      bridge.dispose();
      scrollbars.dispose();
      canvas.purge();
    };
  }, []);

  useEffect(() => {
    if (!studio || !timeline) return;

    const disposeStudioSync = addStudioSync(studio, timeline);

    return () => {
      disposeStudioSync();
    };
  }, [studio, timeline]);

  // Separate effect for context menu - attach to container to avoid Fabric.js interception
  useEffect(() => {
    const container = timelineContainerRef.current;
    if (!container || !timeline) return;

    const handleContextMenu = (e: MouseEvent) => {
      // Only handle if clicking on canvas area (not header/ruler)
      const target = e.target as HTMLElement;
      if (!target.closest("canvas")) return;

      e.preventDefault();
      e.stopPropagation();

      console.log("Container context menu triggered at:", e.clientX, e.clientY);

      // Get objects at click position using canvas
      const pointer = timeline.getScenePoint(e);
      const trackItems = timeline.itemsManager.getTrackItems();

      // Check if clicking on a track item
      const clickedItem = trackItems.find((item: any) => {
        const bounds = item.getBoundingRect();
        return (
          pointer.x >= bounds.left &&
          pointer.x <= bounds.left + bounds.width &&
          pointer.y >= bounds.top &&
          pointer.y <= bounds.top + bounds.height
        );
      });

      if (clickedItem) {
        // Select the item if not already selected
        const itemId = (clickedItem as any).id as string;
        const selectedIds = projectStore.getState().selectedIds;
        if (!selectedIds.includes(itemId)) {
          timeline.setActiveIds([itemId]);
          projectStore.getState().select([itemId]);
        }

        openContextMenu({ x: e.clientX, y: e.clientY }, "clip", itemId);
      } else {
        // Timeline background context menu
        openContextMenu({ x: e.clientX, y: e.clientY }, "timeline");
      }
    };

    // Attach to container with capture to intercept before anything else
    container.addEventListener("contextmenu", handleContextMenu, { capture: true });

    return () => {
      container.removeEventListener("contextmenu", handleContextMenu, { capture: true });
    };
  }, [timeline, openContextMenu]);

  const onClickRuler = (units: number) => {
    const timeUs = unitsToTimeUs(units, scale.zoom);
    projectStore.getState().seek(timeUs);
  };

  const onRulerScroll = (newScrollLeft: number) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.scrollTo({ scrollLeft: newScrollLeft });
    }

    if (horizontalScrollbarVpRef.current) {
      horizontalScrollbarVpRef.current.scrollLeft = newScrollLeft;
    }

    setScrollLeft(newScrollLeft);
  };

  useEffect(() => {
    const availableScroll = horizontalScrollbarVpRef.current?.scrollWidth;
    if (!availableScroll || !canvasRef.current) return;

    canvasRef.current.syncScale({ scale });

    const canvasWidth = canvasRef.current.width;
    if (availableScroll < canvasWidth + scrollLeft) {
      canvasRef.current.scrollTo({ scrollLeft: availableScroll - canvasWidth });
    }
  }, [scale]);

  useEffect(() => {
    const container = timelineContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Skip events from the fabric canvas area — those are handled by the canvas's own wheel handler
      const canvasEl = canvasElRef.current;
      const canvasWrapper = canvasEl?.closest(".canvas-container") ?? canvasEl?.parentElement;
      if (canvasWrapper && canvasWrapper.contains(e.target as Node)) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const isTouchScale = Math.floor(e.deltaY) !== Math.ceil(e.deltaY);
        const speed = isTouchScale ? 0.99 : 0.998;
        const oldZoom = scale.zoom;
        let newZoom = oldZoom * speed ** e.deltaY;

        const clampedZoom = Math.max(0.1, Math.min(10, newZoom));

        if (oldZoom !== clampedZoom) {
          // Zoom-to-point: keep the content under the cursor at the same screen position
          const cursorX =
            e.clientX -
            (timelineContainerRef.current?.getBoundingClientRect().left ?? 0) -
            timelineOffsetX;
          const newScrollLeft = (scrollLeft + cursorX) * (clampedZoom / oldZoom) - cursorX;
          setScale((prev) => ({ ...prev, zoom: clampedZoom }));
          onRulerScroll(Math.max(0, newScrollLeft));
        }
      } else {
        // Horizontal scroll only (timeline doesn't vertically scroll from ruler)
        const delta = e.shiftKey ? e.deltaY : e.deltaX;
        if (delta !== 0) {
          e.preventDefault();
          onRulerScroll(Math.max(0, scrollLeft + delta));
        }
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [scale, timelineContainerRef, scrollLeft, onRulerScroll]);

  return (
    <TimelineContextMenuProvider state={contextMenuState} onClose={closeContextMenu}>
      <div
        ref={timelineContainerRef}
        id="timeline-container"
        data-timeline="true"
        className="flex border-t flex-col relative w-full h-full overflow-hidden bg-background"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseOut={onMouseOut}
      >
        <Header scale={scale} setScale={setScale} />
        <Ruler
          scale={scale}
          onClick={onClickRuler}
          scrollLeft={scrollLeft}
          onScroll={onRulerScroll}
        />
        <Playhead scale={scale} scrollLeft={scrollLeft} />

        {/* Container for Tracks and Canvas */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div style={{ width: timelineOffsetX }} className="relative flex-none" />
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <canvas id="designcombo-timeline-canvas" ref={canvasElRef} />
          </div>
        </div>
      </div>
    </TimelineContextMenuProvider>
  );
};

export default Timeline;
