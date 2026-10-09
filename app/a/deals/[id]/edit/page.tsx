"use client";

import { trpc } from "@/lib/trpc/client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function DealEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: deal, isLoading } = trpc.deals.getById.useQuery({ id });
  const { data: contacts } = trpc.contacts.list.useQuery({ limit: 100 });
  const { data: companies } = trpc.companies.list.useQuery({ limit: 100 });

  const updateDeal = trpc.deals.update.useMutation({
    onSuccess: () => {
      toast.success("Oferta zaktualizowana");
      router.push(`/a/deals/${id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const [form, setForm] = useState<{
    title: string;
    value: number;
    currency: string;
    stage: "lead" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
    probability: number;
    expectedCloseDate: string;
    contactId: string;
    companyId: string;
    notes: string;
    tags: string[];
  }>({
    title: "",
    value: 0,
    currency: "PLN",
    stage: "lead",
    probability: 10,
    expectedCloseDate: "",
    contactId: "",
    companyId: "",
    notes: "",
    tags: [],
  });

  useEffect(() => {
    if (deal) {
      setForm({
        title: deal.title,
        value: deal.value,
        currency: deal.currency,
        stage: deal.stage,
        probability: deal.probability,
        expectedCloseDate: deal.expectedCloseDate ?? "",
        contactId: deal.contactId ?? "",
        companyId: deal.companyId ?? "",
        notes: deal.notes ?? "",
        tags: deal.tags ?? [],
      });
    }
  }, [deal]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32 bg-accent" />
        <Skeleton className="h-96 bg-accent" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Oferta nie znaleziona</p>
        <Link href="/a/deals" className="text-foreground hover:underline">
          Powrót do ofert
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeal.mutate({ id, data: form });
  };

  return (
    <div className="space-y-6">
      <Link
        href={`/a/deals/${id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Powrót do szczegółów
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Edytuj ofertę</h1>
        <p className="text-muted-foreground text-sm mt-1">{deal.title}</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Dane oferty</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground/80">Tytuł</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="bg-background text-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Wartość</Label>
                <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="bg-background text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Prawdopodobieństwo (%)</Label>
                <Input type="number" min={0} max={100} value={form.probability} onChange={(e) => setForm({ ...form, probability: Number(e.target.value) })} className="bg-background text-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Etap</Label>
                <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: (v ?? "lead") as typeof form.stage })}>
                  <SelectTrigger className="bg-background text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="lead">Początkowe</SelectItem>
                    <SelectItem value="qualified">Kwalifikowane</SelectItem>
                    <SelectItem value="proposal">Oferta</SelectItem>
                    <SelectItem value="negotiation">Negocjacje</SelectItem>
                    <SelectItem value="closed_won">Zrealizowane</SelectItem>
                    <SelectItem value="closed_lost">Utracone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Przewidywana data zamknięcia</Label>
                <Input type="date" value={form.expectedCloseDate} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })} className="bg-background text-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Kontakt</Label>
                <Select value={form.contactId} onValueChange={(v) => setForm({ ...form, contactId: v ?? "" })}>
                  <SelectTrigger className="bg-background text-foreground"><SelectValue placeholder="Wybierz" /></SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="">Brak</SelectItem>
                    {contacts?.data.map((c) => (<SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Firma</Label>
                <Select value={form.companyId} onValueChange={(v) => setForm({ ...form, companyId: v ?? "" })}>
                  <SelectTrigger className="bg-background text-foreground"><SelectValue placeholder="Wybierz" /></SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="">Brak</SelectItem>
                    {companies?.data.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">Notatki</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-background text-foreground min-h-[100px]" />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer" disabled={updateDeal.isPending}>
                {updateDeal.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Zapisz zmiany
              </Button>
              <Link href={`/a/deals/${id}`}>
                <Button type="button" variant="outline" className="border-border text-muted-foreground hover:text-foreground cursor-pointer">
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
