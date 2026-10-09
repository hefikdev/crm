"use client";

import { trpc } from "@/lib/trpc/client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ActivityEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: activity, isLoading } = trpc.activities.getById.useQuery({ id });
  const { data: contacts } = trpc.contacts.list.useQuery({ limit: 100 });
  const { data: deals } = trpc.deals.list.useQuery({ limit: 100 });

  const updateActivity = trpc.activities.update.useMutation({
    onSuccess: () => {
      toast.success("Aktywność zaktualizowana");
      router.push(`/a/activities/${id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const [form, setForm] = useState({
    type: "task" as "call" | "email" | "meeting" | "task" | "note" | "follow_up",
    title: "",
    description: "",
    status: "pending" as "pending" | "completed" | "cancelled",
    dueDate: "",
    contactId: "",
    dealId: "",
  });

  useEffect(() => {
    if (activity) {
      setForm({
        type: activity.type,
        title: activity.title,
        description: activity.description ?? "",
        status: activity.status,
        dueDate: activity.dueDate ? activity.dueDate.slice(0, 10) : "",
        contactId: activity.contactId ?? "",
        dealId: activity.dealId ?? "",
      });
    }
  }, [activity]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32 bg-accent" />
        <Skeleton className="h-96 bg-accent" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aktywność nie znaleziona</p>
        <Link href="/a/activities" className="text-foreground hover:underline">
          Powrót do aktywności
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateActivity.mutate({ id, data: form });
  };

  return (
    <div className="space-y-6">
      <Link
        href={`/a/activities/${id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Powrót do szczegółów
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Edytuj aktywność</h1>
        <p className="text-muted-foreground text-sm mt-1">{activity.title}</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Dane aktywności</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground/80">Tytuł</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="bg-background text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Typ</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as typeof form.type })}
                >
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="call">Telefon</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="meeting">Spotkanie</SelectItem>
                    <SelectItem value="task">Zadanie</SelectItem>
                    <SelectItem value="note">Notatka</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}
                >
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="pending">Oczekujące</SelectItem>
                    <SelectItem value="completed">Zakończone</SelectItem>
                    <SelectItem value="cancelled">Anulowane</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Kontakt</Label>
                <Select
                  value={form.contactId}
                  onValueChange={(v) => setForm({ ...form, contactId: v ?? "" })}
                >
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue placeholder="Wybierz" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="">Brak</SelectItem>
                    {contacts?.data.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Oferta</Label>
                <Select
                  value={form.dealId}
                  onValueChange={(v) => setForm({ ...form, dealId: v ?? "" })}
                >
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue placeholder="Wybierz" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="">Brak</SelectItem>
                    {deals?.data.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground/80">Termin</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground/80">Opis</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-background text-foreground min-h-[100px]"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                disabled={updateActivity.isPending}
              >
                {updateActivity.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Zapisz zmiany
              </Button>
              <Link href={`/a/activities/${id}`}>
                <Button
                  type="button"
                  variant="outline"
                  className="border-border text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Anuluj
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
