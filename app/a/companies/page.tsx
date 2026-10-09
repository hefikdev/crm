"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Globe, MoreHorizontal, Users, DollarSign, CalendarClock, Download } from "lucide-react";
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

export default function CompaniesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = trpc.companies.list.useQuery({
    search,
    status,
    industry,
    sort: sort as "newest" | "oldest" | "name",
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

  const utils = trpc.useUtils();

  const handleExport = async () => {
    const all = await utils.companies.list.fetch({
      search,
      status,
      industry,
      sort: sort as "newest" | "oldest" | "name",
      page: 1,
      limit: 5000,
    });
    exportCsv("firmy.csv", all.data, [
      { key: "name", label: "Nazwa" },
      { key: "domain", label: "Domena" },
      { key: "industry", label: "Branża" },
      { key: "city", label: "Miasto" },
      { key: "phone", label: "Telefon" },
      { key: "email", label: "E-mail" },
      { key: "status", label: "Status" },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Firmy</h1>
          <p className="text-muted-foreground text-sm mt-1">{data?.total ?? 0} firm</p>
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
          <Link href="/a/companies/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Dodaj firmę
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj firm..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 border-border bg-muted text-foreground placeholder:text-muted-foreground/70"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm cursor-pointer"
        >
          <option value="all">Wszystkie</option>
          <option value="active">Aktywne</option>
          <option value="inactive">Nieaktywne</option>
          <option value="lead">Lead</option>
          <option value="archived">Zarchiwizowane</option>
        </select>
        <select
          value={industry}
          onChange={(e) => { setIndustry(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm cursor-pointer"
        >
          <option value="all">Wszystkie branże</option>
          <option value="Technologia">Technologia</option>
          <option value="Finanse">Finanse</option>
          <option value="Produkcja">Produkcja</option>
          <option value="Handel">Handel</option>
          <option value="Logistyka">Logistyka</option>
          <option value="Medycyna">Medycyna</option>
          <option value="Edukacja">Edukacja</option>
          <option value="Budownictwo">Budownictwo</option>
          <option value="Energetyka">Energetyka</option>
          <option value="Marketing">Marketing</option>
        </select>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm cursor-pointer"
        >
          <option value="newest">Najnowsze</option>
          <option value="oldest">Najstarsze</option>
          <option value="name">Nazwa A-Z</option>
        </select>
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
            <div className="text-center py-12">
              <p className="text-muted-foreground">Brak firm</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data?.data.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-4 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => router.push(`/a/companies/${company.id}`)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-sm font-medium text-foreground/80 shrink-0">
                      {company.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{company.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {company.industry && <span>{company.industry}</span>}
                        {company.city && <span>{company.city}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      company.status === "active" ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200" :
                      "bg-accent text-foreground/80"
                    }>
                      {company.status === "active" ? "Aktywna" : "Nieaktywna"}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground cursor-pointer" />
                        }
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-popover border-border text-popover-foreground">
                        <DropdownMenuItem className="cursor-pointer hover:bg-accent" onClick={(e) => { e.stopPropagation(); router.push(`/a/companies/${company.id}`); }}>
                          Edytuj
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 cursor-pointer hover:bg-accent" onClick={(e) => { e.stopPropagation(); if (confirm("Usunąć?")) deleteCompany.mutate({ id: company.id }); }}>
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
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="border-border text-muted-foreground cursor-pointer">Poprzednia</Button>
          <span className="text-sm text-muted-foreground">Strona {page} z {data.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="border-border text-muted-foreground cursor-pointer">Następna</Button>
        </div>
      )}

      <QuickLinks
        links={[
          { href: "/a/contacts", label: "Kontakty", icon: Users },
          { href: "/a/deals", label: "Oferty", icon: DollarSign },
          { href: "/a/activities", label: "Aktywności", icon: CalendarClock },
        ]}
      />
    </div>
  );
}