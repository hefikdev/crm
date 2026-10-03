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

export default function NewActivityPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    type: "task" as const,
    title: "",
    description: "",
    status: "pending" as const,
    dueDate: "",
    contactId: "",
    dealId: "",
  });

  const { data: contacts } = trpc.contacts.list.useQuery({ limit: 100 });
  const { data: deals } = trpc.deals.list.useQuery({ limit: 100 });
  const createActivity = trpc.activities.create.useMutation({
    onSuccess: () => { toast.success("Aktywność utworzona"); router.push("/a/activities"); },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createActivity.mutate(form);
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <Link href="/a/activities" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white cursor-pointer">
        <ArrowLeft className="h-4 w-4" /> Powrót do aktywności
      </Link>
      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader><CardTitle className="text-white">Nowa aktywność</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Tytuł</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="border-zinc-800 bg-zinc-900 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Typ</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: (v ?? "task") as typeof form.type })}>
                  <SelectTrigger className="border-zinc-800 bg-zinc-900 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
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
                <Label className="text-zinc-300">Termin</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="border-zinc-800 bg-zinc-900 text-white" />
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
                <Label className="text-zinc-300">Oferta</Label>
                <Select value={form.dealId} onValueChange={(v) => setForm({ ...form, dealId: v ?? "" })}>
                  <SelectTrigger className="border-zinc-800 bg-zinc-900 text-white"><SelectValue placeholder="Wybierz" /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="">Brak</SelectItem>
                    {deals?.data.map((d) => (<SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Opis</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border-zinc-800 bg-zinc-900 text-white min-h-[100px]" />
            </div>
            <Button type="submit" className="bg-white text-black hover:bg-zinc-200 cursor-pointer" disabled={createActivity.isPending}>
              {createActivity.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Utwórz aktywność
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}