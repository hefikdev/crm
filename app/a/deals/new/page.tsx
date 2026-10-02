"use client";

import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function NewDealPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    value: 0,
    currency: "USD",
    stage: "lead" as const,
    probability: 10,
    expectedCloseDate: "",
    contactId: "",
    companyId: "",
    notes: "",
    tags: [] as string[],
  });

  const { data: contacts } = trpc.contacts.list.useQuery({ limit: 100 });
  const { data: companies } = trpc.companies.list.useQuery({ limit: 100 });
  const createDeal = trpc.deals.create.useMutation({
    onSuccess: (data) => { toast.success("Oferta utworzona"); router.push(`/a/deals/${data.id}`); },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDeal.mutate(form);
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <Link href="/a/deals" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white cursor-pointer">
        <ArrowLeft className="h-4 w-4" /> Powrót do ofert
      </Link>
      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader><CardTitle className="text-white">Nowa oferta</CardTitle></CardHeader>
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
                  <SelectTrigger className="border-zinc-800 bg-zinc-900 text-white"><SelectValue placeholder="Wybierz kontakt" /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="">Brak</SelectItem>
                    {contacts?.data.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Firma</Label>
                <Select value={form.companyId} onValueChange={(v) => setForm({ ...form, companyId: v ?? "" })}>
                  <SelectTrigger className="border-zinc-800 bg-zinc-900 text-white"><SelectValue placeholder="Wybierz firmę" /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="">Brak</SelectItem>
                    {companies?.data.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Notatki</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="border-zinc-800 bg-zinc-900 text-white min-h-[100px]" />
            </div>
            <Button type="submit" className="bg-white text-black hover:bg-zinc-200 cursor-pointer" disabled={createDeal.isPending}>
              {createDeal.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Utwórz ofertę
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}