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
import { Loader2, ArrowLeft, Building2, Globe, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: company, isLoading, refetch } = trpc.companies.getById.useQuery({ id });
  const updateCompany = trpc.companies.update.useMutation({
    onSuccess: () => { toast.success("Firma zaktualizowana"); refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteCompany = trpc.companies.delete.useMutation({
    onSuccess: () => { toast.success("Firma usunięta"); router.push("/a/companies"); },
    onError: (err) => toast.error(err.message),
  });

  const [form, setForm] = useState<{
    name: string;
    domain: string;
    industry: string;
    size: "1-10" | "11-50" | "51-200" | "201-1000" | "1001+" | undefined;
    phone: string;
    email: string;
    website: string;
    address: string;
    city: string;
    country: string;
    notes: string;
    tags: string[];
    status: "active" | "inactive" | "lead" | "archived";
  }>({
    name: "",
    domain: "",
    industry: "",
    size: undefined,
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    country: "",
    notes: "",
    tags: [],
    status: "active",
  });

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name,
        domain: company.domain ?? "",
        industry: company.industry ?? "",
        size: company.size ?? undefined,
        phone: company.phone ?? "",
        email: company.email ?? "",
        website: company.website ?? "",
        address: company.address ?? "",
        city: company.city ?? "",
        country: company.country ?? "",
        notes: company.notes ?? "",
        tags: company.tags ?? [],
        status: company.status,
      });
    }
  }, [company]);

  if (isLoading) return <div className="p-6"><Skeleton className="h-96 bg-accent" /></div>;
  if (!company) return <div className="p-6 text-center"><p className="text-muted-foreground">Firma nie znaleziona</p></div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany.mutate({ id, data: form });
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto min-h-[calc(100vh-8rem)] flex flex-col justify-center">
      <div className="flex items-center justify-between">
        <Link href="/a/companies" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Powrót
        </Link>
        <Button variant="destructive" size="sm" onClick={() => { if (confirm("Usunąć firmę?")) deleteCompany.mutate({ id }); }} className="cursor-pointer">
          <Trash2 className="h-4 w-4 mr-2" /> Usuń
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-xl bg-accent flex items-center justify-center"><Building2 className="h-6 w-6 text-foreground/80" /></div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
          <p className="text-sm text-muted-foreground">{company.industry ?? "Brak branży"} · {company.city ?? "Brak lokalizacji"}</p>
        </div>
        <Badge className={company.status === "active" ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200" : "bg-accent text-foreground/80"}>{company.status}</Badge>
      </div>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-foreground">Edytuj firmę</CardTitle></CardHeader>
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
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer" disabled={updateCompany.isPending}>
              {updateCompany.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Zapisz zmiany
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}