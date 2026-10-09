"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Headphones,
  Plus,
  Search,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { QuickLinks } from "@/components/crm/quick-links";

// Client support tickets are stored as CRM activities of type "task" so they
// link to contacts/deals and show up in the activity timeline for free.
const TICKET_PREFIX = "Zgłoszenie: ";

const priorityStyles: Record<string, string> = {
  high: "bg-red-500/15 text-red-700 dark:bg-red-900 dark:text-red-200",
  normal: "bg-amber-500/15 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  low: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
};

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");

  const { data, isLoading, refetch } = trpc.activities.list.useQuery({
    status: "all",
    limit: 100,
  });

  const createTicket = trpc.activities.create.useMutation({
    onSuccess: () => {
      toast.success("Zgłoszenie utworzone");
      setSubject("");
      setDescription("");
      setPriority("normal");
      setShowForm(false);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const resolve = trpc.activities.complete.useMutation({
    onSuccess: () => {
      toast.success("Zgłoszenie zamknięte");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const tickets =
    data?.data
      .filter((a) => a.title.startsWith(TICKET_PREFIX))
      .filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          (a.description ?? "").toLowerCase().includes(search.toLowerCase())
      ) ?? [];

  const open = tickets.filter((t) => t.status === "pending").length;
  const closed = tickets.filter((t) => t.status === "completed").length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket.mutate({
      type: "task",
      title: `${TICKET_PREFIX}[${priority.toUpperCase()}] ${subject}`,
      description,
      status: "pending",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Headphones className="h-6 w-6 text-muted-foreground" />
            Wsparcie klienta
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {open} otwartych · {closed} zamkniętych
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nowe zgłoszenie
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Otwarte
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{open}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Zamknięte
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{closed}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Średni czas reakcji
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">2h</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Nowe zgłoszenie</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-foreground/80">Temat</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="bg-background text-foreground"
                    placeholder="Krótki opis problemu"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80">Priorytet</Label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as typeof priority)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm cursor-pointer"
                  >
                    <option value="low">Niski</option>
                    <option value="normal">Normalny</option>
                    <option value="high">Wysoki</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Opis</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background text-foreground min-h-[100px]"
                  placeholder="Szczegóły zgłoszenia..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  disabled={createTicket.isPending}
                >
                  {createTicket.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Utwórz zgłoszenie
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-border text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Anuluj
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Szukaj zgłoszeń..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 border-border bg-muted text-foreground placeholder:text-muted-foreground/70"
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
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <Headphones className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">Brak zgłoszeń</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tickets.map((ticket) => {
                const p = ticket.title.includes("[HIGH]")
                  ? "high"
                  : ticket.title.includes("[LOW]")
                    ? "low"
                    : "normal";
                return (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                        {p === "high" ? (
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {ticket.title.replace(TICKET_PREFIX, "").replace(/\[[A-Z]+\]\s?/, "")}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {new Date(ticket.createdAt).toLocaleDateString("pl-PL")}
                          {ticket.description ? ` · ${ticket.description}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={priorityStyles[p]}>
                        {p === "high" ? "Wysoki" : p === "low" ? "Niski" : "Normalny"}
                      </Badge>
                      {ticket.status === "pending" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => resolve.mutate({ id: ticket.id })}
                          className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                          aria-label="Zamknij zgłoszenie"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                          Zamknięte
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 py-4">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">wsparcie@crm.app</span>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 py-4">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">+48 800 100 200</span>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 py-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Pon-Pt 8:00-18:00</span>
          </CardContent>
        </Card>
      </div>

      <QuickLinks
        links={[
          { href: "/a/contacts", label: "Kontakty", icon: MessageSquare },
          { href: "/a/inbox", label: "Wiadomości", icon: Mail },
          { href: "/a/tasks", label: "Zadania", icon: CheckCircle2 },
        ]}
      />
    </div>
  );
}
