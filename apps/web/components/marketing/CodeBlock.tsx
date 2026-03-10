"use client";

import { useState } from "react";

interface CodeTab {
  id: string;
  label: string;
  code: string;
}

interface CodeBlockProps {
  tabs: CodeTab[];
}

export function CodeBlock({ tabs }: CodeBlockProps) {
  const [active, setActive] = useState(tabs[0]?.id);
  const activeTab = tabs.find((t) => t.id === active);

  return (
    <div className="rounded-lg overflow-hidden">
      <div className="flex bg-[#1E1A17]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-5 py-2.5 text-[13px] font-medium transition-colors cursor-pointer ${
              active === tab.id
                ? "text-white bg-code-bg"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-code-bg p-5 overflow-x-auto">
        <pre className="text-[14px] leading-relaxed">
          <code className="text-[#E5DDD5]">{activeTab?.code}</code>
        </pre>
      </div>
    </div>
  );
}
