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

export default function NewCompanyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    domain: "",
    industry: "",
    size: undefined as "1-10" | "11-50" | "51-200" | "201-1000" | "1001+" | undefined,
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    country: "",
    notes: "",
    tags: [] as string[],
    status: "active" as const,
  });

  const createCompany = trpc.companies.create.useMutation({
    onSuccess: (data) => { toast.success("Firma utworzona"); router.push(`/a/companies/${data.id}`); },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCompany.mutate(form);
  };

  return (
    <div className="space-y-6">
      <Link href="/a/companies" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
        <ArrowLeft className="h-4 w-4" /> Powrót do firm
      </Link>
      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-foreground">New Company</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground/80">Nazwa firmy</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-background text-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Domena</Label>
                <Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} className="bg-background text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Branża</Label>
                <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="bg-background text-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Wielkość</Label>
                <Select value={form.size ?? ""} onValueChange={(v) => setForm({ ...form, size: (v ?? undefined) as typeof form.size })}>
                  <SelectTrigger className="bg-background text-foreground"><SelectValue placeholder="Wybierz wielkość" /></SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201-1000">201-1000</SelectItem>
                    <SelectItem value="1001+">1001+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: (v ?? "active") as typeof form.status })}>
                  <SelectTrigger className="bg-background text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="active">Aktywna</SelectItem>
                    <SelectItem value="inactive">Nieaktywna</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="archived">Zarchiwizowana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-background text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Telefon</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-background text-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Miasto</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-background text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Kraj</Label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="bg-background text-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">Adres</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-background text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">Notatki</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-background text-foreground min-h-[100px]" />
            </div>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer" disabled={createCompany.isPending}>
              {createCompany.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Create Company
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}