"use client";

import { TabBar } from "./tabbar";
import { useMediaPanelStore, type Tab } from "./store";
import PanelAssets from "./panel/assets";
import PanelEffect from "./panel/effects";
import PanelTransition from "./panel/transition";
import PanelText from "./panel/text";
import PanelCaptions from "./panel/captions";
import PanelElements from "./panel/elements";

const viewMap: Record<Tab, React.ReactNode> = {
  assets: <PanelAssets showHeader={false} />,
  text: <PanelText />,
  captions: <PanelCaptions />,
  transitions: <PanelTransition />,
  effects: <PanelEffect />,
  elements: <PanelElements />,
};

export function MediaPanel() {
  const { activeTab, isOpen } = useMediaPanelStore();

  return (
    <div className="w-full h-full flex flex-col overflow-hidden border-r">
      <TabBar />
      {isOpen && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="flex-1 overflow-auto">{viewMap[activeTab]}</div>
        </div>
      )}
    </div>
  );
}
