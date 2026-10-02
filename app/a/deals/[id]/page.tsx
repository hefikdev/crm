"use client";

import { trpc } from "@/lib/trpc/client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2, ArrowLeft, DollarSign, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const stageColors: Record<string, string> = {
  lead: "bg-zinc-800 text-zinc-300",
  qualified: "bg-blue-900 text-blue-200",
  proposal: "bg-amber-900 text-amber-200",
  negotiation: "bg-purple-900 text-purple-200",
  closed_won: "bg-emerald-900 text-emerald-200",
  closed_lost: "bg-red-900 text-red-200",
};

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: deal, isLoading, refetch } = trpc.deals.getById.useQuery({ id });
  const { data: contacts } = trpc.contacts.list.useQuery({ limit: 100 });
  const { data: companies } = trpc.companies.list.useQuery({ limit: 100 });
  const updateDeal = trpc.deals.update.useMutation({
    onSuccess: () => { toast.success("Oferta zaktualizowana"); refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteDeal = trpc.deals.delete.useMutation({
    onSuccess: () => { toast.success("Oferta usunięta"); router.push("/a/deals"); },
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
    currency: "USD",
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

  if (isLoading) return <div className="p-6"><Skeleton className="h-96 bg-zinc-800" /></div>;
  if (!deal) return <div className="p-6 text-center"><p className="text-zinc-500">Oferta nie znaleziona</p></div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeal.mutate({ id, data: form });
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <Link href="/a/deals" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Powrót
        </Link>
        <Button variant="destructive" size="sm" onClick={() => { if (confirm("Usunąć ofertę?")) deleteDeal.mutate({ id }); }} className="cursor-pointer">
          <Trash2 className="h-4 w-4 mr-2" /> Usuń
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-xl bg-zinc-800 flex items-center justify-center"><DollarSign className="h-6 w-6 text-zinc-300" /></div>
        <div>
          <h1 className="text-2xl font-bold text-white">{deal.title}</h1>
          <p className="text-sm text-zinc-500">{deal.value.toLocaleString()} PLN · {deal.probability}% prawdopodobieństwo</p>
        </div>
        <Badge className={stageColors[deal.stage]}>{deal.stage.replace("_", " ")}</Badge>
      </div>

      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader><CardTitle className="text-white">Edytuj ofertę</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Tytuł</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="border-zinc-800 bg-zinc-900 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Wartość</Label>
                <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="border-zinc-800 bg-zinc-900 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Prawdopodobieństwo (%)</Label>
                <Input type="number" min={0} max={100} value={form.probability} onChange={(e) => setForm({ ...form, probability: Number(e.target.value) })} className="border-zinc-800 bg-zinc-900 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Etap</Label>
                <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: (v ?? "lead") as typeof form.stage })}>
                  <SelectTrigger className="border-zinc-800 bg-zinc-900 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
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
                <Label className="text-zinc-300">Przewidywana data zamknięcia</Label>
                <Input type="date" value={form.expectedCloseDate} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })} className="border-zinc-800 bg-zinc-900 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Kontakt</Label>
                <Select value={form.contactId} onValueChange={(v) => setForm({ ...form, contactId: v ?? "" })}>
                  <SelectTrigger className="border-zinc-800 bg-zinc-900 text-white"><SelectValue placeholder="Wybierz" /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="">Brak</SelectItem>
                    {contacts?.data.map((c) => (<SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Firma</Label>
                <Select value={form.companyId} onValueChange={(v) => setForm({ ...form, companyId: v ?? "" })}>
                  <SelectTrigger className="border-zinc-800 bg-zinc-900 text-white"><SelectValue placeholder="Wybierz" /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="">Brak</SelectItem>
                    {companies?.data.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Notatki</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="border-zinc-800 bg-zinc-900 text-white min-h-[100px]" />
            </div>
            <Button type="submit" className="bg-white text-black hover:bg-zinc-200 cursor-pointer" disabled={updateDeal.isPending}>
              {updateDeal.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Zapisz zmiany
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}