"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  CalendarClock,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BarChart3,
  ClipboardCheck,
  FileText,
  Mail,
  TrendingUp,
  FolderOpen,
  Flame,
  History,
  Package,
  Target,
  Headphones,
  Sun,
  Moon,
  Zap,
} from "lucide-react";
import { QuickCreateModal } from "@/components/crm/quick-create";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

const navItems = [
  { href: "/a", label: "Panel", icon: LayoutDashboard },
  { href: "/a/priorities", label: "Priorytety", icon: Flame },
  { href: "/a/contacts", label: "Kontakty", icon: Users },
  { href: "/a/companies", label: "Firmy", icon: Building2 },
  { href: "/a/deals", label: "Oferty", icon: DollarSign },
  { href: "/a/products", label: "Produkty", icon: Package },
  { href: "/a/targets", label: "Cele", icon: Target },
  { href: "/a/automations", label: "Automatyzacje", icon: Zap },
  { href: "/a/forecast", label: "Prognoza", icon: TrendingUp },
  { href: "/a/tasks", label: "Zadania", icon: ClipboardCheck },
  { href: "/a/calendar", label: "Kalendarz", icon: Calendar },
  { href: "/a/timeline", label: "Os czasu", icon: History },
  { href: "/a/notes", label: "Notatki", icon: FileText },
  { href: "/a/inbox", label: "Wiadomości", icon: Mail },
  { href: "/a/files", label: "Pliki", icon: FolderOpen },
  { href: "/a/reports", label: "Raporty", icon: BarChart3 },
  { href: "/a/activities", label: "Aktywności", icon: CalendarClock },
  { href: "/a/support", label: "Wsparcie", icon: Headphones },
  { href: "/a/settings", label: "Ustawienia", icon: Settings },
];

export function Sidebar({ userName, userEmail }: { userName: string; userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Wylogowano");
      router.push("/login");
    } catch {
      toast.error("Błąd wylogowania");
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <Link href="/a" className="text-lg font-bold text-foreground tracking-tight">
            CRM
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="p-2">
        <QuickCreateModal />
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex items-center gap-3 w-full rounded-lg p-2 hover:bg-accent transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              collapsed && "justify-center"
            )}
            aria-label="Menu konta"
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-accent text-foreground/80 text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="bg-popover border-border text-popover-foreground w-56"
          >
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              render={<Link href="/a/settings" />}
              className="cursor-pointer"
            >
              <Settings className="h-4 w-4 mr-2" />
              Ustawienia
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 mr-2" />
              ) : (
                <Moon className="h-4 w-4 mr-2" />
              )}
              {theme === "dark" ? "Tryb jasny" : "Tryb ciemny"}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-red-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Wyloguj
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}