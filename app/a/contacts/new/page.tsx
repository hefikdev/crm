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

export default function NewContactPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    companyId: "",
    status: "active" as const,
    source: "other" as const,
    notes: "",
    tags: [] as string[],
  });

  const { data: companies } = trpc.companies.list.useQuery({ limit: 100 });
  const createContact = trpc.contacts.create.useMutation({
    onSuccess: (data) => {
      toast.success("Kontakt utworzony");
      router.push(`/a/contacts/${data.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createContact.mutate(form);
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <Link href="/a/contacts" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white cursor-pointer">
        <ArrowLeft className="h-4 w-4" />
        Powrót do kontaktów
      </Link>

      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-white">Nowy kontakt</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Imię</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  className="border-zinc-800 bg-zinc-900 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Nazwisko</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  className="border-zinc-800 bg-zinc-900 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border-zinc-800 bg-zinc-900 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Telefon</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="border-zinc-800 bg-zinc-900 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Stanowisko</Label>
                <Input
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="border-zinc-800 bg-zinc-900 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Company</Label>
                <Select
                  value={form.companyId}
                  onValueChange={(v) => setForm({ ...form, companyId: v ?? "" })}
                >
                  <SelectTrigger className="border-zinc-800 bg-zinc-900 text-white">
                    <SelectValue placeholder="Wybierz firmę" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="">Brak</SelectItem>
                    {companies?.data.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: (v ?? "active") as typeof form.status })}
                >
                  <SelectTrigger className="border-zinc-800 bg-zinc-900 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="active">Aktywny</SelectItem>
                    <SelectItem value="inactive">Nieaktywny</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="archived">Zarchiwizowany</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Source</Label>
                <Select
                  value={form.source}
                  onValueChange={(v) => setForm({ ...form, source: (v ?? "other") as typeof form.source })}
                >
                  <SelectTrigger className="border-zinc-800 bg-zinc-900 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="referral">Polecenie</SelectItem>
                    <SelectItem value="website">Strona WWW</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="phone">Telefon</SelectItem>
                    <SelectItem value="social">Social media</SelectItem>
                    <SelectItem value="other">Inne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Notatki</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="border-zinc-800 bg-zinc-900 text-white min-h-[100px]"
              />
            </div>

            <Button
              type="submit"
              className="bg-white text-black hover:bg-zinc-200 cursor-pointer"
              disabled={createContact.isPending}
            >
              {createContact.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Utwórz kontakt
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}