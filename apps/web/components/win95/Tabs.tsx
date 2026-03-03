"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTab, className = "" }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className={className}>
      <div className="flex -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-3 py-1 text-[11px] cursor-pointer ${
              active === tab.id
                ? "bg-win95-bg shadow-win95-raised -mb-px z-10 font-bold"
                : "bg-win95-dark/20 shadow-win95-button"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="shadow-win95-raised bg-win95-bg p-3">
        {tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  );
}
