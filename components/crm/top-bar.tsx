"use client";

import { Search } from "lucide-react";

export function TopBar() {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <kbd className="px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-400 font-mono text-[10px]">
          ⌘K
        </kbd>
        <span>szybkie wyszukiwanie</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-zinc-600">
        <span>CRM v1.0</span>
      </div>
    </div>
  );
}