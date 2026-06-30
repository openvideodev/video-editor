"use client";

import { cn } from "@/lib/utils";
import { type Tab, tabs, useMediaPanelStore } from "./store";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useStudioStore } from "@/stores/studio-store";

export function TabBar() {
  const { activeTab, setActiveTab, isOpen, setIsOpen } = useMediaPanelStore();
  const { selectedClips, setSelectedClips } = useStudioStore();
  const hasSelection = selectedClips.length > 0;

  return (
    <div className="relative flex items-center border-b h-12 bg-background shrink-0">
      <div className="flex items-center justify-center py-2 px-2 gap-1 w-full overflow-x-auto scrollbar-hidden">
        {(Object.keys(tabs) as Tab[]).map((tabKey) => {
          const tab = tabs[tabKey];
          const isActive = activeTab === tabKey && isOpen && !hasSelection;
          return (
            <div
              className={cn(
                "flex items-center justify-center flex-none cursor-pointer transition-all duration-200 h-8 w-8",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-accent-foreground/80 hover:bg-accent hover:text-accent-foreground",
              )}
              onClick={() => {
                if (hasSelection) {
                  setSelectedClips([]);
                  setActiveTab(tabKey);
                  setIsOpen(true);
                } else if (activeTab === tabKey && isOpen) {
                  setIsOpen(false);
                } else {
                  setActiveTab(tabKey);
                }
              }}
              key={tabKey}
            >
              <Tooltip delayDuration={10}>
                <TooltipTrigger asChild>
                  {isActive ? (
                    <tab.activeIcon className="size-[18px]" />
                  ) : (
                    <tab.icon className="size-[18px]" />
                  )}
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center" sideOffset={8}>
                  {tab.label}
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
}
