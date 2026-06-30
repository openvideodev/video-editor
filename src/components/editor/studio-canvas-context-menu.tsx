"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import {
  RiArrowGoForwardLine,
  RiArrowRightSLine,
  RiClipboardLine,
  RiFileCopyLine,
  RiEyeLine,
  RiFlipHorizontalLine,
  RiFlipVerticalLine,
  RiLockLine,
  RiDeleteBinLine,
} from "@remixicon/react";
import { core, projectStore } from "@/lib/project";
import { nanoid } from "nanoid";
import type { AnyClip } from "@openvideo/core";
import type { ProjectStore } from "@openvideo/core";
import { useStudioStore } from "@/stores/studio-store";

export interface StudioContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  target: "object" | "background" | null;
}

export function useStudioContextMenu() {
  const [state, setState] = React.useState<StudioContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    target: null,
  });

  const openContextMenu = useCallback(
    (position: { x: number; y: number }, target: "object" | "background") => {
      setState({
        isOpen: true,
        position,
        target,
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

function MenuSeparator() {
  return <div className="-mx-1 my-1 h-px bg-border" />;
}

function Shortcut({ children }: { children: React.ReactNode }) {
  return <span className="ml-auto text-xs tracking-widest text-muted-foreground">{children}</span>;
}

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
    }, 150);
  };

  const handleOpen = () => {
    clearCloseTimer();
    setOpen(true);
  };

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

interface StudioContextMenuContentProps {
  state: StudioContextMenuState;
  onClose: () => void;
}

export function StudioContextMenuContent({ state, onClose }: StudioContextMenuContentProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(state.position);
  const { studio } = useStudioStore();
  const selectedIds = useStore(projectStore, (s: ProjectStore) => s.selectedIds);
  const clipboard = useStore(projectStore, (s: ProjectStore) => s.clipboard);
  const hasSelection = selectedIds.length > 0;
  const hasClipboard = clipboard.length > 0;

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

  const handleCopy = useCallback(() => {
    if (!hasSelection) return;
    const { clips } = projectStore.getState();
    const items = selectedIds
      .map((id) => clips[id])
      .filter(Boolean)
      .map((clip) => JSON.parse(JSON.stringify(clip)));
    projectStore.getState().setClipboard(items);
  }, [selectedIds, hasSelection]);

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

  const handleDelete = useCallback(() => {
    if (!hasSelection) return;
    core.clip.remove(selectedIds);
  }, [selectedIds, hasSelection]);

  const handleToggleVisibility = useCallback(() => {
    console.log("Toggle visibility");
  }, []);

  const handleToggleLock = useCallback(() => {
    console.log("Toggle lock");
  }, []);

  if (!state.isOpen) return null;

  // Stop propagation on menu container so clicks don't bubble to backdrop
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Object-specific menu (when clicking on a selected object)
  if (state.target === "object" && hasSelection) {
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

        <MenuSeparator />

        <MenuItem onClick={wrapWithClose(handleToggleVisibility)}>
          <RiEyeLine className="w-4 h-4" />
          Hide
          <Shortcut>⌘ H</Shortcut>
        </MenuItem>

        <MenuItem onClick={wrapWithClose(handleToggleLock)}>
          <RiLockLine className="w-4 h-4" />
          Lock
          <Shortcut>⌘ L</Shortcut>
        </MenuItem>

        <MenuSub
          trigger={
            <>
              <RiFlipHorizontalLine className="w-4 h-4" />
              Flip
            </>
          }
        >
          <MenuItem onClick={wrapWithClose(() => {})}>Flip Horizontal</MenuItem>
          <MenuItem onClick={wrapWithClose(() => {})}>Flip Vertical</MenuItem>
        </MenuSub>

        <MenuItem onClick={wrapWithClose(() => {})}>
          <RiArrowGoForwardLine className="w-4 h-4" />
          Rotate 90°
        </MenuItem>

        <MenuSeparator />

        <MenuItem onClick={wrapWithClose(handleDelete)} destructive>
          <RiDeleteBinLine className="w-4 h-4" />
          Delete
          <Shortcut>⌫</Shortcut>
        </MenuItem>
      </div>
    );
  }

  // Canvas background menu - only paste when no target
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
        Paste
        <Shortcut>⌘ V</Shortcut>
      </MenuItem>
    </div>
  );
}

interface StudioContextMenuProviderProps {
  children: React.ReactNode;
  state: StudioContextMenuState;
  onClose: () => void;
}

export function StudioContextMenuProvider({
  children,
  state,
  onClose,
}: StudioContextMenuProviderProps) {
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
          <StudioContextMenuContent state={state} onClose={onClose} />
        </div>
      )}
    </>
  );
}
