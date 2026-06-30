"use client";

import { useState, useEffect } from "react";
import { useProjectStore } from "@/stores/project-store";
import { usePanelStore } from "@/stores/panel-store";
import { Button } from "@/components/ui/button";
import { ExportPopover } from "./export-popover";
import { TaskbarPopover } from "./taskbar-popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import {
  RiArchiveDrawerLine,
  RiSideBarLine,
  RiHomeLine,
  RiMenuLine,
  RiLayout3Line,
  RiMoonLine,
  RiSunLine,
  RiComputerLine,
} from "@remixicon/react";
import { RiLockLine, RiArrowDownSLine } from "@remixicon/react";
import { core } from "@/lib/project";
import { data } from "./data";

export default function Header() {
  const { projectName, resetProject, setProjectName } = useProjectStore();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const {
    showLeftPanel,
    showRightPanel,
    showTimeline,
    toggleLeftPanel,
    toggleRightPanel,
    toggleTimeline,
    resetLayout,
  } = usePanelStore();

  const handleNewProject = () => {
    resetProject();
    core.project.new();
  };

  const handleExportJSON = () => {
    try {
      const projectData = core.project.export();
      const jsonString = JSON.stringify(projectData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${projectName || "project"}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export project:", err);
    }
  };

  const handleLoadJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const projectData = JSON.parse(text);

        const name = projectData.name || file.name.replace(/\.json$/i, "");
        setProjectName(name);

        core.project.import(projectData);
      } catch (err) {
        console.error("Failed to load project JSON:", err);
        alert("Invalid project file");
      }
    };
    input.click();
  };

  // Global keydown listener for Export (Ctrl+E / Cmd+E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setIsExportOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="h-13 border-b shrink-0">
      <div className="h-full grid grid-cols-3 items-center px-4">
        {/* Left Column: Home, Menu, View */}
        <div className="flex items-center justify-start gap-0.5">
          {/* Home Icon */}
          <Button variant="ghost" size="icon">
            <RiHomeLine className="size-4.5" />
            <span className="sr-only">Home</span>
          </Button>

          {/* Menu Icon with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <RiMenuLine className="size-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 text-xs">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-xs">
                  <span className="flex-1">Theme</span>
                  {theme === "dark" ? (
                    <RiMoonLine className="size-4 text-muted-foreground" />
                  ) : theme === "light" ? (
                    <RiSunLine className="size-4 text-muted-foreground" />
                  ) : (
                    <RiComputerLine className="size-4 text-muted-foreground" />
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-36 text-xs">
                    <DropdownMenuItem className="text-xs" onClick={() => setTheme("light")}>
                      <RiSunLine className="mr-2 size-4" />
                      <span className="flex-1">Light</span>
                      {theme === "light" && <span className="text-xs">✓</span>}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs" onClick={() => setTheme("dark")}>
                      <RiMoonLine className="mr-2 size-4" />
                      <span className="flex-1">Dark</span>
                      {theme === "dark" && <span className="text-xs">✓</span>}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs" onClick={() => setTheme("system")}>
                      <RiComputerLine className="mr-2 size-4" />
                      <span className="flex-1">System</span>
                      {theme === "system" && <span className="text-xs">✓</span>}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs" onClick={handleNewProject}>
                <span>New Project</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={handleLoadJSON}>
                <span>Load from JSON</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={handleExportJSON}>
                <span>Export to JSON</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Menu with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-xs flex items-center gap-1">
                <RiLayout3Line className="size-4" />
                <span>View</span>
                <RiArrowDownSLine className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 text-xs">
              <DropdownMenuItem className="text-xs" onClick={toggleLeftPanel}>
                <span className="flex-1">Left Panel</span>
                {showLeftPanel && <span className="text-xs">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={toggleRightPanel}>
                <span className="flex-1">Right Panel</span>
                {showRightPanel && <span className="text-xs">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={toggleTimeline}>
                <span className="flex-1">Timeline</span>
                {showTimeline && <span className="text-xs">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs" onClick={resetLayout}>
                <span>Reset Layout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>


        {/* Center Column: Project Space & Details */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold">
          <RiLockLine size={14} className=" shrink-0" />
          <span className=" font-medium">Personal</span>
          <span className="px-1">/</span>
          <span className="text-foreground truncate max-w-[200px]">
            {projectName || "Untitled video"}
          </span>
          <RiArrowDownSLine size={12} className="shrink-0 ml-0.5" />
        </div>

        {/* Right Column: Aspect Ratio and Export Button */}
        <div className="flex items-center justify-end gap-2">
          {/* Taskbar Button */}
          <TaskbarPopover>
            <RiArchiveDrawerLine className="size-4" />
            <span className="sr-only">Tasks</span>
          </TaskbarPopover>

          {/* Export Button */}
          <ExportPopover open={isExportOpen} onOpenChange={setIsExportOpen}>
            <Button className="h-7 text-xs font-semibold px-3 rounded-md flex items-center gap-2">
              <span>Export</span>
            </Button>
          </ExportPopover>
        </div>
      </div>
    </div>
  );
}
