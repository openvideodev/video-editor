"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import {
  RiArrowRightSLine,
  RiClipboardLine,
  RiFileCopyLine,
  RiLockLine,
  RiLockUnlockLine,
  RiScissorsLine,
  RiVolumeUpLine,
  RiVolumeMuteLine,
  RiDeleteBinLine,
} from "@remixicon/react";
import { core, projectStore } from "@/lib/project";
import { nanoid } from "nanoid";
import type { AnyClip } from "@openvideo/core";
import { useStudioStore } from "@/stores/studio-store";

export interface TimelineContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  target: "clip" | "track" | "timeline" | null;
  clipId?: string;
  trackId?: string;
  isOverClip: boolean;
}

export function useTimelineContextMenu() {
  const [state, setState] = React.useState<TimelineContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    target: null,
    isOverClip: false,
  });

  const openContextMenu = useCallback(
    (
      position: { x: number; y: number },
      target: "clip" | "track" | "timeline",
      clipId?: string,
      trackId?: string,
    ) => {
      setState({
        isOpen: true,
        position,
        target,
        clipId,
        trackId,
        isOverClip: target === "clip",
      });
    },
    [],
  );

  const closeContextMenu = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    state,
    openContextMenu,
    closeContextMenu,
  };
}

export function useClipActions(clipId?: string) {
  const selectedIds = useStore(projectStore, (s) => s.selectedIds);
  const clips = useStore(projectStore, (s) => s.clips);
  const clipboard = useStore(projectStore, (s) => s.clipboard);
  const primaryId = clipId || selectedIds[0];
  const selectedClip = primaryId ? clips[primaryId] : null;

  const isLocked = selectedClip?.locked ?? false;
  const isMuted = selectedClip?.muted ?? false;
  const hasClipboard = clipboard.length > 0;

  // Copy all selected clips to core store clipboard
  const handleCopy = useCallback(() => {
    if (selectedIds.length === 0) return;
    const items = selectedIds
      .map((id) => clips[id])
      .filter(Boolean)
      .map((clip) => JSON.parse(JSON.stringify(clip)));
    projectStore.getState().setClipboard(items);
  }, [selectedIds, clips]);

  // Paste at current time with relative offsets
  const handlePaste = useCallback(async () => {
    const items = projectStore.getState().clipboard;
    if (items.length === 0) return;

    const currentTime = core.store.getState().currentTime;
    const earliestFrom = Math.min(...items.map((c: AnyClip) => c.timing?.display?.from ?? 0));

    const newClips = items.map((clip: AnyClip) => {
      const offsetFromStart = (clip.timing?.display?.from ?? 0) - earliestFrom;
      const newFrom = currentTime + offsetFromStart;
      const duration = clip.timing?.duration ?? 0;

      return {
        ...clip,
        id: nanoid(),
        timing: {
          ...clip.timing,
          display: {
            ...clip.timing?.display,
            from: newFrom,
            to: newFrom + duration,
          },
        },
      };
    });

    await Promise.all(newClips.map((clip: AnyClip) => core.clip.add(clip)));
    projectStore.getState().select(newClips.map((c: AnyClip) => c.id));
  }, []);

  // Duplicate = copy selected then paste
  const handleDuplicate = useCallback(async () => {
    if (selectedIds.length === 0) return;
    // Copy selected clips to clipboard
    const clipsToDuplicate = selectedIds
      .map((id) => clips[id])
      .filter(Boolean)
      .map((clip) => JSON.parse(JSON.stringify(clip)));

    if (clipsToDuplicate.length === 0) return;

    const currentTime = core.store.getState().currentTime;
    const earliestFrom = Math.min(...clipsToDuplicate.map((c) => c.timing?.display?.from ?? 0));

    const newClips = clipsToDuplicate.map((clip) => {
      const offsetFromStart = (clip.timing?.display?.from ?? 0) - earliestFrom;
      const newFrom = currentTime + offsetFromStart;
      const duration = clip.timing?.duration ?? 0;

      return {
        ...clip,
        id: nanoid(),
        timing: {
          ...clip.timing,
          display: {
            ...clip.timing?.display,
            from: newFrom,
            to: newFrom + duration,
          },
        },
      };
    });

    await Promise.all(newClips.map((clip) => core.clip.add(clip as AnyClip)));
    projectStore.getState().select(newClips.map((c) => c.id));
  }, [selectedIds, clips]);

  // Delete the specific clicked clip
  const handleDelete = useCallback(async () => {
    if (!clipId) return;
    core.clip.remove([clipId]);
  }, [clipId]);

  const handleToggleLock = useCallback(async () => {
    if (!selectedClip) return;
    core.clip.update(selectedClip.id, { locked: !isLocked });
  }, [selectedClip, isLocked]);

  const handleToggleMute = useCallback(async () => {
    if (!selectedClip) return;
    core.clip.update(selectedClip.id, { muted: !isMuted });
  }, [selectedClip, isMuted]);

  const handleSplit = useCallback(() => {
    const currentTime = core.store.getState().currentTime;
    if (!selectedClip) return;
    const clipStart = selectedClip.timing.display.from;
    const clipEnd = selectedClip.timing.display.to;
    if (currentTime <= clipStart || currentTime >= clipEnd) return;
    core.clip.split(currentTime);
  }, [selectedClip]);

  return {
    selectedClip,
    isLocked,
    isMuted,
    hasClipboard,
    handleCopy,
    handlePaste,
    handleDuplicate,
    handleDelete,
    handleToggleLock,
    handleToggleMute,
    handleSplit,
    clipId,
  };
}

// Menu Item Component
function MenuItem({
  onClick,
  children,
  disabled = false,
  destructive = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none
        ${
          disabled
            ? "pointer-events-none opacity-50"
            : "hover:bg-accent hover:text-accent-foreground"
        }
        ${destructive && !disabled ? "text-destructive hover:bg-destructive/10" : ""}
      `}
    >
      {children}
    </button>
  );
}

// Menu Separator Component
function MenuSeparator() {
  return <div className="-mx-1 my-1 h-px bg-border" />;
}

// Shortcut Display Component
function Shortcut({ children }: { children: React.ReactNode }) {
  return <span className="ml-auto text-xs tracking-widest text-muted-foreground">{children}</span>;
}

// Submenu Component
function MenuSub({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, 150); // Small delay to allow moving from trigger to content
  };

  const handleOpen = () => {
    clearCloseTimer();
    setOpen(true);
  };

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  return (
    <div ref={triggerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={handleOpen}
        onMouseLeave={scheduleClose}
        className="group relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground"
      >
        {trigger}
        <RiArrowRightSLine className="ml-auto w-4 h-4" />
      </button>
      {open && (
        <div
          ref={contentRef}
          className="absolute left-full top-0 ml-1 w-44 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 z-[10000]"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface TimelineContextMenuContentProps {
  state: TimelineContextMenuState;
  onClose: () => void;
}

export function TimelineContextMenuContent({ state, onClose }: TimelineContextMenuContentProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(state.position);

  const {
    selectedClip,
    isLocked,
    isMuted,
    hasClipboard,
    handleCopy,
    handlePaste,
    handleDuplicate,
    handleDelete,
    handleToggleLock,
    handleToggleMute,
    handleSplit,
  } = useClipActions(state.clipId);

  // Calculate position to avoid going off-screen
  useEffect(() => {
    if (!menuRef.current) {
      setPosition(state.position);
      return;
    }

    const menuHeight = menuRef.current.offsetHeight;
    const menuWidth = menuRef.current.offsetWidth;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let newX = state.position.x;
    let newY = state.position.y;

    // Check if menu would go off bottom of screen - flip upward
    if (state.position.y + menuHeight > viewportHeight - 10) {
      newY = state.position.y - menuHeight;
      // Ensure it doesn't go off top
      if (newY < 10) newY = 10;
    }

    // Check if menu would go off right edge
    if (state.position.x + menuWidth > viewportWidth - 10) {
      newX = state.position.x - menuWidth;
      if (newX < 10) newX = 10;
    }

    setPosition({ x: newX, y: newY });
  }, [state.position, state.isOpen]);

  // Close on escape key and click outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const wrapWithClose = (fn: () => void) => {
    return () => {
      fn();
      onClose();
    };
  };

  if (!state.isOpen) return null;

  // Stop propagation on menu container so clicks don't bubble to backdrop
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Clip-specific menu
  if (state.target === "clip" && selectedClip) {
    return (
      <div
        ref={menuRef}
        onClick={handleMenuClick}
        className="fixed z-[9999] w-56 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 pointer-events-auto"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {!isLocked && (
          <>
            <MenuItem onClick={wrapWithClose(handleCopy)}>
              <RiFileCopyLine className="w-4 h-4" />
              Copy
              <Shortcut>⌘ C</Shortcut>
            </MenuItem>

            <MenuItem onClick={wrapWithClose(handlePaste)} disabled={!hasClipboard}>
              <RiClipboardLine className="w-4 h-4" />
              Paste
              <Shortcut>⌘ V</Shortcut>
            </MenuItem>

            <MenuItem onClick={wrapWithClose(handleDuplicate)}>
              <RiFileCopyLine className="w-4 h-4" />
              Duplicate
              <Shortcut>⌘ D</Shortcut>
            </MenuItem>

            <MenuSeparator />
          </>
        )}

        {!isLocked && (
          <MenuItem onClick={wrapWithClose(handleSplit)}>
            <RiScissorsLine className="w-4 h-4" />
            Split at Playhead
            <Shortcut>⌘ K</Shortcut>
          </MenuItem>
        )}

        <MenuSeparator />

        <MenuItem onClick={wrapWithClose(handleToggleMute)}>
          {isMuted ? (
            <RiVolumeUpLine className="w-4 h-4" />
          ) : (
            <RiVolumeMuteLine className="w-4 h-4" />
          )}
          {isMuted ? "Unmute" : "Mute"}
          <Shortcut>⌘ ⇧ M</Shortcut>
        </MenuItem>

        <MenuItem onClick={wrapWithClose(handleToggleLock)}>
          {isLocked ? <RiLockUnlockLine className="w-4 h-4" /> : <RiLockLine className="w-4 h-4" />}
          {isLocked ? "Unlock" : "Lock"}
          <Shortcut>⌘ L</Shortcut>
        </MenuItem>

        {!isLocked && (
          <>
            <MenuSeparator />
            <MenuItem onClick={wrapWithClose(handleDelete)} destructive>
              <RiDeleteBinLine className="w-4 h-4" />
              Delete
              <Shortcut>⌫</Shortcut>
            </MenuItem>
          </>
        )}
      </div>
    );
  }

  // Timeline background menu - only paste when no target
  return (
    <div
      ref={menuRef}
      onClick={handleMenuClick}
      className="fixed z-[9999] w-52 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 pointer-events-auto"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <MenuItem onClick={wrapWithClose(handlePaste)} disabled={!hasClipboard}>
        <RiClipboardLine className="w-4 h-4" />
        Paste at Playhead
        <Shortcut>⌘ V</Shortcut>
      </MenuItem>
    </div>
  );
}

interface TimelineContextMenuProviderProps {
  children: React.ReactNode;
  state: TimelineContextMenuState;
  onClose: () => void;
}

export function TimelineContextMenuProvider({
  children,
  state,
  onClose,
}: TimelineContextMenuProviderProps) {
  // Handle right-click on document to prevent native menu when our menu is open
  useEffect(() => {
    if (!state.isOpen) return;

    const handleDocumentContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handleDocumentContextMenu, { capture: true });
    return () =>
      document.removeEventListener("contextmenu", handleDocumentContextMenu, { capture: true });
  }, [state.isOpen]);

  return (
    <>
      {children}
      {state.isOpen && (
        <div className="fixed inset-0 z-[9998]" onClick={onClose}>
          <TimelineContextMenuContent state={state} onClose={onClose} />
        </div>
      )}
    </>
  );
}
