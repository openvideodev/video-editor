"use client";

import { PropertiesPanel } from "./properties-panel";

export function RightPanel() {
  return (
    <div className="w-full h-full overflow-hidden flex flex-col border-l">
      <div className="flex-1 min-h-0 mt-0 overflow-hidden">
        <PropertiesPanel />
      </div>
    </div>
  );
}
