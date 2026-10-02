"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, DollarSign, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const stageColors: Record<string, string> = {
  lead: "bg-zinc-800 text-zinc-300",
  qualified: "bg-blue-900 text-blue-200",
  proposal: "bg-amber-900 text-amber-200",
  negotiation: "bg-purple-900 text-purple-200",
  closed_won: "bg-emerald-900 text-emerald-200",
  closed_lost: "bg-red-900 text-red-200",
};

export default function DealsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = trpc.deals.list.useQuery({
    search,
    stage,
    page,
    limit: 20,
  });
  const { data: stats } = trpc.deals.getStats.useQuery();

  const deleteDeal = trpc.deals.delete.useMutation({
    onSuccess: () => { toast.success("Oferta usunięta"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Oferty</h1>
          <p className="text-zinc-500 text-sm mt-1">{data?.total ?? 0} ofert</p>
        </div>
        <Link href="/a/deals/new">
          <Button className="bg-white text-black hover:bg-zinc-200 cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj ofertę
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400">Pipeline</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-white">{(stats?.totalValue ?? 0).toLocaleString()} PLN</p></CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400">Aktywne</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-white">{(stats?.activeValue ?? 0).toLocaleString()} PLN</p></CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400">Zrealizowane</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-emerald-400">{(stats?.wonValue ?? 0).toLocaleString()} PLN</p></CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400">Utracone</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-red-400">{stats?.lostCount ?? 0}</p></CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input placeholder="Szukaj ofert..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600" />
        </div>
        <select value={stage} onChange={(e) => { setStage(e.target.value); setPage(1); }} className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white text-sm cursor-pointer">
          <option value="all">Wszystkie etapy</option>
          <option value="lead">Początkowe</option>
          <option value="qualified">Kwalifikowane</option>
          <option value="proposal">Oferta</option>
          <option value="negotiation">Negocjacje</option>
          <option value="closed_won">Zrealizowane</option>
          <option value="closed_lost">Utracone</option>
        </select>
      </div>

      <Card className="border-zinc-800 bg-zinc-950">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 bg-zinc-800" />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-12"><p className="text-zinc-500">Brak ofert</p></div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {data?.data.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors cursor-pointer" onClick={() => router.push(`/a/deals/${deal.id}`)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                      <DollarSign className="h-4 w-4 text-zinc-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{deal.title}</p>
                      <p className="text-xs text-zinc-500">{deal.value.toLocaleString()} PLN · {deal.probability}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={stageColors[deal.stage]}>{deal.stage === "closed_won" ? "Zrealizowane" : deal.stage === "closed_lost" ? "Utracone" : deal.stage === "lead" ? "Początkowe" : deal.stage === "qualified" ? "Kwalifikowane" : deal.stage === "proposal" ? "Oferta" : "Negocjacje"}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white cursor-pointer"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-white">
                        <DropdownMenuItem className="cursor-pointer hover:bg-zinc-800" onClick={(e) => { e.stopPropagation(); router.push(`/a/deals/${deal.id}`); }}>Edytuj</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 cursor-pointer hover:bg-zinc-800" onClick={(e) => { e.stopPropagation(); if (confirm("Usunąć?")) deleteDeal.mutate({ id: deal.id }); }}>Usuń</DropdownMenuItem>
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
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="border-zinc-800 text-zinc-400 cursor-pointer">Poprzednia</Button>
          <span className="text-sm text-zinc-500">Strona {page} z {data.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="border-zinc-800 text-zinc-400 cursor-pointer">Następna</Button>
        </div>
      )}
    </div>
  );
}