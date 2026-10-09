"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { trpc } from "@/lib/trpc/client";
import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  CalendarClock,
  Settings,
  Calendar,
  BarChart3,
  ClipboardCheck,
  FileText,
  Mail,
  Plus,
  TrendingUp,
  FolderOpen,
  Flame,
  History,
  Info,
  Package,
  Target,
} from "lucide-react";

const pages = [
  { href: "/a", label: "Panel główny", icon: LayoutDashboard, keywords: "dashboard panel home" },
  { href: "/a/priorities", label: "Priorytety", icon: Flame, keywords: "priorities priorytety dzisiaj" },
  { href: "/a/contacts", label: "Kontakty", icon: Users, keywords: "contacts kontakty osoby" },
  { href: "/a/companies", label: "Firmy", icon: Building2, keywords: "companies firmy" },
  { href: "/a/deals", label: "Oferty", icon: DollarSign, keywords: "deals oferty sprzedaz" },
  { href: "/a/products", label: "Produkty", icon: Package, keywords: "products produkty katalog cennik" },
  { href: "/a/targets", label: "Cele", icon: Target, keywords: "targets cele kwoty sprzedaz" },
  { href: "/a/forecast", label: "Prognoza", icon: TrendingUp, keywords: "forecast prognoza sprzedaz" },
  { href: "/a/tasks", label: "Zadania", icon: ClipboardCheck, keywords: "tasks zadania" },
  { href: "/a/calendar", label: "Kalendarz", icon: Calendar, keywords: "calendar kalendarz" },
  { href: "/a/timeline", label: "Os czasu", icon: History, keywords: "timeline historia os czasu" },
  { href: "/a/notes", label: "Notatki", icon: FileText, keywords: "notes notatki" },
  { href: "/a/inbox", label: "Wiadomości", icon: Mail, keywords: "inbox wiadomosci email" },
  { href: "/a/files", label: "Pliki", icon: FolderOpen, keywords: "files pliki dokumenty" },
  { href: "/a/reports", label: "Raporty", icon: BarChart3, keywords: "reports raporty statystyki" },
  { href: "/a/activities", label: "Aktywności", icon: CalendarClock, keywords: "activities aktywnosci" },
  { href: "/a/about", label: "O systemie", icon: Info, keywords: "about o systemie info roadmap" },
  { href: "/a/settings", label: "Ustawienia", icon: Settings, keywords: "settings ustawienia konto" },
];

const quickActions = [
  { href: "/a/contacts/new", label: "Nowy kontakt", icon: Plus, keywords: "new contact nowy" },
  { href: "/a/companies/new", label: "Nowa firma", icon: Plus, keywords: "new company nowa" },
  { href: "/a/deals/new", label: "Nowa oferta", icon: Plus, keywords: "new deal nowa" },
  { href: "/a/activities/new", label: "Nowa aktywność", icon: Plus, keywords: "new activity nowa" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: results } = trpc.search.global.useQuery(
    { query },
    { enabled: query.trim().length >= 2 }
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runAction = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  const hasResults =
    results &&
    (results.contacts.length > 0 ||
      results.companies.length > 0 ||
      results.deals.length > 0);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Szukaj kontaktów, firm, ofert..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Brak wyników</CommandEmpty>

        {hasResults && (
          <>
            {results.contacts.length > 0 && (
              <CommandGroup heading="Kontakty">
                {results.contacts.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={`${c.label} ${c.sub}`}
                    onSelect={() => runAction(c.href)}
                    className="cursor-pointer"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    <span>{c.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{c.sub}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.companies.length > 0 && (
              <CommandGroup heading="Firmy">
                {results.companies.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={`${c.label} ${c.sub}`}
                    onSelect={() => runAction(c.href)}
                    className="cursor-pointer"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    <span>{c.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{c.sub}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.deals.length > 0 && (
              <CommandGroup heading="Oferty">
                {results.deals.map((d) => (
                  <CommandItem
                    key={d.id}
                    value={`${d.label} ${d.sub}`}
                    onSelect={() => runAction(d.href)}
                    className="cursor-pointer"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>{d.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{d.sub}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}

        <CommandGroup heading="Strony">
          {pages.map((page) => (
            <CommandItem
              key={page.href}
              value={`${page.label} ${page.keywords}`}
              onSelect={() => runAction(page.href)}
              className="cursor-pointer"
            >
              <page.icon className="h-4 w-4 mr-2" />
              {page.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Szybkie akcje">
          {quickActions.map((action) => (
            <CommandItem
              key={action.href}
              value={action.label}
              onSelect={() => runAction(action.href)}
              className="cursor-pointer"
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}