"use client";

import { ThemeToggle } from "@/components/theme-toggle";

export function TopBar() {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-muted-foreground font-mono text-[10px]">
          ⌘K
        </kbd>
        <span>szybkie wyszukiwanie</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </div>
  );
}