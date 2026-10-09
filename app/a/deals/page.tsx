"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, DollarSign, MoreHorizontal, Users, Building2, Package, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QuickLinks } from "@/components/crm/quick-links";
import { exportCsv } from "@/lib/csv";

const stageColors: Record<string, string> = {
  lead: "bg-accent text-foreground/80",
  qualified: "bg-blue-500/15 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  proposal: "bg-amber-500/15 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  negotiation: "bg-purple-500/15 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
  closed_won: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  closed_lost: "bg-red-500/15 text-red-700 dark:bg-red-900 dark:text-red-200",
};

export default function DealsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");
  const [sort, setSort] = useState("newest");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = trpc.deals.list.useQuery({
    search,
    stage,
    sort: sort as "newest" | "oldest" | "value_desc" | "value_asc" | "closeDate",
    minValue: minValue ? Number(minValue) : undefined,
    maxValue: maxValue ? Number(maxValue) : undefined,
    page,
    limit: 20,
  });
  const { data: stats } = trpc.deals.getStats.useQuery();

  const deleteDeal = trpc.deals.delete.useMutation({
    onSuccess: () => { toast.success("Oferta usunięta"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const utils = trpc.useUtils();

  const handleExport = async () => {
    const all = await utils.deals.list.fetch({
      search,
      stage,
      sort: sort as "newest" | "oldest" | "value_desc" | "value_asc" | "closeDate",
      minValue: minValue ? Number(minValue) : undefined,
      maxValue: maxValue ? Number(maxValue) : undefined,
      page: 1,
      limit: 5000,
    });
    exportCsv("oferty.csv", all.data, [
      { key: "title", label: "Tytuł" },
      { key: "value", label: "Wartość" },
      { key: "currency", label: "Waluta" },
      { key: "stage", label: "Etap" },
      { key: "probability", label: "Prawdopodobieństwo" },
      { key: "expectedCloseDate", label: "Data zamknięcia" },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Oferty</h1>
          <p className="text-muted-foreground text-sm mt-1">{data?.total ?? 0} ofert</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            className="border-border text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Download className="h-4 w-4 mr-2" />
            Eksport CSV
          </Button>
          <Link href="/a/deals/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Dodaj ofertę
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Pipeline</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-foreground">{(stats?.totalValue ?? 0).toLocaleString()} PLN</p></CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Aktywne</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-foreground">{(stats?.activeValue ?? 0).toLocaleString()} PLN</p></CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Zrealizowane</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-emerald-400">{(stats?.wonValue ?? 0).toLocaleString()} PLN</p></CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Utracone</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-red-400">{stats?.lostCount ?? 0}</p></CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Szukaj ofert..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 border-border bg-muted text-foreground placeholder:text-muted-foreground/70" />
        </div>
        <select value={stage} onChange={(e) => { setStage(e.target.value); setPage(1); }} className="px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm cursor-pointer">
          <option value="all">Wszystkie etapy</option>
          <option value="lead">Początkowe</option>
          <option value="qualified">Kwalifikowane</option>
          <option value="proposal">Oferta</option>
          <option value="negotiation">Negocjacje</option>
          <option value="closed_won">Zrealizowane</option>
          <option value="closed_lost">Utracone</option>
        </select>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm cursor-pointer">
          <option value="newest">Najnowsze</option>
          <option value="oldest">Najstarsze</option>
          <option value="value_desc">Wartość malejąco</option>
          <option value="value_asc">Wartość rosnąco</option>
          <option value="closeDate">Data zamknięcia</option>
        </select>
        <Input
          type="number"
          placeholder="Wartość od"
          value={minValue}
          onChange={(e) => { setMinValue(e.target.value); setPage(1); }}
          className="w-32 border-border bg-muted text-foreground placeholder:text-muted-foreground/70"
        />
        <Input
          type="number"
          placeholder="Wartość do"
          value={maxValue}
          onChange={(e) => { setMaxValue(e.target.value); setPage(1); }}
          className="w-32 border-border bg-muted text-foreground placeholder:text-muted-foreground/70"
        />
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 bg-accent" />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-12"><p className="text-muted-foreground">Brak ofert</p></div>
          ) : (
            <div className="divide-y divide-border">
              {data?.data.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between p-4 hover:bg-muted transition-colors cursor-pointer" onClick={() => router.push(`/a/deals/${deal.id}`)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <DollarSign className="h-4 w-4 text-foreground/80" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{deal.title}</p>
                      <p className="text-xs text-muted-foreground">{deal.value.toLocaleString()} PLN · {deal.probability}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={stageColors[deal.stage]}>{deal.stage === "closed_won" ? "Zrealizowane" : deal.stage === "closed_lost" ? "Utracone" : deal.stage === "lead" ? "Początkowe" : deal.stage === "qualified" ? "Kwalifikowane" : deal.stage === "proposal" ? "Oferta" : "Negocjacje"}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground cursor-pointer" />
                        }
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-popover border-border text-popover-foreground">
                        <DropdownMenuItem className="cursor-pointer hover:bg-accent" onClick={(e) => { e.stopPropagation(); router.push(`/a/deals/${deal.id}`); }}>Edytuj</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 cursor-pointer hover:bg-accent" onClick={(e) => { e.stopPropagation(); if (confirm("Usunąć?")) deleteDeal.mutate({ id: deal.id }); }}>Usuń</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="border-border text-muted-foreground cursor-pointer">Poprzednia</Button>
          <span className="text-sm text-muted-foreground">Strona {page} z {data.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="border-border text-muted-foreground cursor-pointer">Następna</Button>
        </div>
      )}

      <QuickLinks
        links={[
          { href: "/a/contacts", label: "Kontakty", icon: Users },
          { href: "/a/companies", label: "Firmy", icon: Building2 },
          { href: "/a/products", label: "Produkty", icon: Package },
        ]}
      />
    </div>
  );
}