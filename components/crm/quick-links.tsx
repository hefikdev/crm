"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export interface QuickLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Bottom-of-page quick navigation to related subpages.
export function QuickLinks({ links }: { links: QuickLink[] }) {
  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="flex-1 min-w-[160px]">
          <Button
            variant="outline"
            className="w-full justify-start border-border bg-card text-foreground hover:bg-muted cursor-pointer"
          >
            <link.icon className="h-4 w-4 mr-2 text-muted-foreground" />
            {link.label}
          </Button>
        </Link>
      ))}
    </div>
  );
}
