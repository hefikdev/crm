"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Mail, Phone, MoreHorizontal, Building2, DollarSign, CalendarClock, Download, Upload, Trash2, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QuickLinks } from "@/components/crm/quick-links";
import { exportCsv, parseCsv } from "@/lib/csv";
import { useRef } from "react";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  inactive: "bg-accent text-foreground/80",
  lead: "bg-blue-500/15 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  archived: "bg-accent text-muted-foreground",
};

export default function ContactsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = trpc.contacts.list.useQuery({
    search,
    status,
    source,
    sort: sort as "newest" | "oldest" | "name" | "lastContacted",
    page,
    limit: 20,
  });

  const deleteContact = trpc.contacts.delete.useMutation({
    onSuccess: () => {
      toast.success("Kontakt usunięty");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const utils = trpc.useUtils();

  const [selected, setSelected] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bulkDelete = trpc.contacts.bulkDelete.useMutation({
    onSuccess: (r) => {
      toast.success(`Usunięto ${r.count} kontaktów`);
      setSelected([]);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const bulkStatus = trpc.contacts.bulkUpdateStatus.useMutation({
    onSuccess: (r) => {
      toast.success(`Zaktualizowano ${r.count} kontaktów`);
      setSelected([]);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const importRows = trpc.contacts.importRows.useMutation({
    onSuccess: (r) => {
      toast.success(`Zaimportowano ${r.imported}, pominięto ${r.skipped}`);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleAll = () => {
    const ids = data?.data.map((c) => c.id) ?? [];
    setSelected((prev) => (prev.length === ids.length ? [] : ids));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length < 2) {
      toast.error("Plik CSV jest pusty lub nieprawidłowy");
      return;
    }
    // Expect header: firstName,lastName,email,phone,position (order-independent)
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const idx = (name: string) => header.indexOf(name);
    const parsed = rows
      .slice(1)
      .map((r) => ({
        firstName: r[idx("firstname")] ?? r[idx("imię")] ?? "",
        lastName: r[idx("lastname")] ?? r[idx("nazwisko")] ?? "",
        email: r[idx("email")] ?? r[idx("e-mail")] ?? "",
        phone: r[idx("phone")] ?? r[idx("telefon")] ?? "",
        position: r[idx("position")] ?? r[idx("stanowisko")] ?? "",
      }))
      .filter((r) => r.firstName && r.lastName);

    if (parsed.length === 0) {
      toast.error("Nie znaleziono wierszy z imieniem i nazwiskiem");
      return;
    }
    importRows.mutate({ rows: parsed });
    e.target.value = "";
  };

  const handleExport = async () => {
    const all = await utils.contacts.list.fetch({
      search,
      status,
      source,
      sort: sort as "newest" | "oldest" | "name" | "lastContacted",
      page: 1,
      limit: 5000,
    });
    exportCsv("kontakty.csv", all.data, [
      { key: "firstName", label: "Imię" },
      { key: "lastName", label: "Nazwisko" },
      { key: "email", label: "E-mail" },
      { key: "phone", label: "Telefon" },
      { key: "position", label: "Stanowisko" },
      { key: "status", label: "Status" },
      { key: "source", label: "Źródło" },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kontakty</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.total ?? 0} kontaktów
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={importRows.isPending}
            className="border-border text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="border-border text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Download className="h-4 w-4 mr-2" />
            Eksport CSV
          </Button>
          <Link href="/a/contacts/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Dodaj kontakt
            </Button>
          </Link>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted">
          <span className="text-sm text-foreground">
            Wybrano {selected.length}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  bulkStatus.mutate({
                    ids: selected,
                    status: e.target.value as "active" | "inactive" | "lead" | "archived",
                  });
                  e.target.value = "";
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm cursor-pointer"
            >
              <option value="">Zmień status...</option>
              <option value="active">Aktywny</option>
              <option value="inactive">Nieaktywny</option>
              <option value="lead">Lead</option>
              <option value="archived">Zarchiwizowany</option>
            </select>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm(`Usunąć ${selected.length} kontaktów?`))
                  bulkDelete.mutate({ ids: selected });
              }}
              className="cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Usuń
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelected([])}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Odznacz"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-3 items-center">
        <input
          type="checkbox"
          checked={
            !!data?.data.length && selected.length === data.data.length
          }
          onChange={toggleAll}
          className="h-4 w-4 rounded border-border accent-primary cursor-pointer shrink-0"
          aria-label="Zaznacz wszystkie"
        />
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj kontaktów..."
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
          value={source}
          onChange={(e) => { setSource(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm cursor-pointer"
        >
          <option value="all">Wszystkie źródła</option>
          <option value="referral">Polecenie</option>
          <option value="website">Strona</option>
          <option value="email">E-mail</option>
          <option value="phone">Telefon</option>
          <option value="social">Social</option>
          <option value="other">Inne</option>
        </select>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm cursor-pointer"
        >
          <option value="newest">Najnowsze</option>
          <option value="oldest">Najstarsze</option>
          <option value="name">Nazwa A-Z</option>
          <option value="lastContacted">Ostatni kontakt</option>
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
              <p className="text-muted-foreground">Brak kontaktów</p>
              <Link href="/a/contacts/new">
                <Button variant="link" className="text-foreground cursor-pointer">
                  Utwórz pierwszy kontakt
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data?.data.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => router.push(`/a/contacts/${contact.id}`)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={selected.includes(contact.id)}
                      onChange={() => toggleOne(contact.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 rounded border-border accent-primary cursor-pointer shrink-0"
                      aria-label={`Zaznacz ${contact.firstName} ${contact.lastName}`}
                    />
                    <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-sm font-medium text-foreground/80 shrink-0">
                      {contact.firstName[0]}{contact.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {contact.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </span>
                        )}
                        {contact.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[contact.status]}>
                      {contact.status === "active" ? "Aktywny" : contact.status === "inactive" ? "Nieaktywny" : contact.status === "lead" ? "Lead" : "Zarchiwizowany"}
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
                        <DropdownMenuItem
                          className="cursor-pointer hover:bg-accent"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/a/contacts/${contact.id}`);
                          }}
                        >
                          Edytuj
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 cursor-pointer hover:bg-accent"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Usunąć ten kontakt?")) {
                              deleteContact.mutate({ id: contact.id });
                            }
                          }}
                        >
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-border text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Poprzednia
          </Button>
          <span className="text-sm text-muted-foreground">
            Strona {page} z {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="border-border text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Następna
          </Button>
        </div>
      )}

      <QuickLinks
        links={[
          { href: "/a/companies", label: "Firmy", icon: Building2 },
          { href: "/a/deals", label: "Oferty", icon: DollarSign },
          { href: "/a/activities", label: "Aktywności", icon: CalendarClock },
        ]}
      />
    </div>
  );
}