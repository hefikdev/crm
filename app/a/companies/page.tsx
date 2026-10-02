"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Globe, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CompaniesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = trpc.companies.list.useQuery({
    search,
    status,
    page,
    limit: 20,
  });

  const deleteCompany = trpc.companies.delete.useMutation({
    onSuccess: () => {
      toast.success("Firma usunięta");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Firmy</h1>
          <p className="text-zinc-500 text-sm mt-1">{data?.total ?? 0} firm</p>
        </div>
        <Link href="/a/companies/new">
          <Button className="bg-white text-black hover:bg-zinc-200 cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj firmę
          </Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Szukaj firm..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white text-sm cursor-pointer"
        >
          <option value="all">Wszystkie</option>
          <option value="active">Aktywne</option>
          <option value="inactive">Nieaktywne</option>
          <option value="lead">Lead</option>
          <option value="archived">Zarchiwizowane</option>
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
            <div className="text-center py-12">
              <p className="text-zinc-500">Brak firm</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {data?.data.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors cursor-pointer"
                  onClick={() => router.push(`/a/companies/${company.id}`)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-300 shrink-0">
                      {company.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{company.name}</p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        {company.industry && <span>{company.industry}</span>}
                        {company.city && <span>{company.city}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      company.status === "active" ? "bg-emerald-900 text-emerald-200" :
                      "bg-zinc-800 text-zinc-300"
                    }>
                      {company.status === "active" ? "Aktywna" : "Nieaktywna"}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white cursor-pointer">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-white">
                        <DropdownMenuItem className="cursor-pointer hover:bg-zinc-800" onClick={(e) => { e.stopPropagation(); router.push(`/a/companies/${company.id}`); }}>
                          Edytuj
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 cursor-pointer hover:bg-zinc-800" onClick={(e) => { e.stopPropagation(); if (confirm("Usunąć?")) deleteCompany.mutate({ id: company.id }); }}>
                          Usuń
                        </DropdownMenuItem>
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