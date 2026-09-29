"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Mail, Phone, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = trpc.contacts.list.useQuery({
    search,
    status,
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kontakty</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.total ?? 0} kontaktów
          </p>
        </div>
        <Link href="/a/contacts/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj kontakt
          </Button>
        </Link>
      </div>

      <div className="flex gap-3">
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
    </div>
  );
}