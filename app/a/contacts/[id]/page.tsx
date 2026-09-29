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
import { Loader2, ArrowLeft, Mail, Phone, Building2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ActivityTimeline } from "@/components/crm/activity-timeline";

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: contact, isLoading } = trpc.contacts.getById.useQuery({ id });
  const { data: companies } = trpc.companies.list.useQuery({ limit: 100 });
  const updateContact = trpc.contacts.update.useMutation({
    onSuccess: () => {
      toast.success("Contact updated");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });
  const deleteContact = trpc.contacts.delete.useMutation({
    onSuccess: () => {
      toast.success("Contact deleted");
      router.push("/a/contacts");
    },
    onError: (err) => toast.error(err.message),
  });
  const { refetch } = trpc.contacts.getById.useQuery({ id });

  const [form, setForm] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    companyId: string;
    status: "active" | "inactive" | "lead" | "archived";
    source: "referral" | "website" | "email" | "phone" | "social" | "other";
    notes: string;
    tags: string[];
  }>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    companyId: "",
    status: "active",
    source: "other",
    notes: "",
    tags: [],
  });

  useEffect(() => {
    if (contact) {
      setForm({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email ?? "",
        phone: contact.phone ?? "",
        position: contact.position ?? "",
        companyId: contact.companyId ?? "",
        status: contact.status,
        source: contact.source ?? "other",
        notes: contact.notes ?? "",
        tags: contact.tags ?? [],
      });
    }
  }, [contact]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-2xl mx-auto min-h-[calc(100vh-8rem)] flex flex-col justify-center">
        <Skeleton className="h-8 w-32 bg-accent" />
        <Skeleton className="h-96 bg-accent" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Kontakt nie znaleziony</p>
        <Link href="/a/contacts" className="text-foreground hover:underline">Powrót do kontaktów</Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateContact.mutate({ id, data: form });
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto min-h-[calc(100vh-8rem)] flex flex-col justify-center">
      <div className="flex items-center justify-between">
        <Link href="/a/contacts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          Powrót
        </Link>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (confirm("Usunąć ten kontakt?")) deleteContact.mutate({ id });
          }}
          className="cursor-pointer"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Usuń
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center text-2xl font-medium text-foreground/80">
          {contact.firstName[0]}{contact.lastName[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{contact.firstName} {contact.lastName}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            {contact.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{contact.email}</span>}
            {contact.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{contact.phone}</span>}
          </div>
        </div>
        <Badge className={
          contact.status === "active" ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200" :
          contact.status === "lead" ? "bg-blue-500/15 text-blue-700 dark:bg-blue-900 dark:text-blue-200" :
          "bg-accent text-foreground/80"
        }>
          {contact.status}
        </Badge>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Edytuj kontakt</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Imię</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Nazwisko</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  className="bg-background text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Telefon</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="bg-background text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Stanowisko</Label>
                <Input
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Firma</Label>
                <Select
                  value={form.companyId}
                  onValueChange={(v) => setForm({ ...form, companyId: v ?? "" })}
                >
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue placeholder="Wybierz firmę" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
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
                <Label className="text-foreground/80">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: (v ?? "active") as typeof form.status })}
                >
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="active">Aktywny</SelectItem>
                    <SelectItem value="inactive">Nieaktywny</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="archived">Zarchiwizowany</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Źródło</Label>
                <Select
                  value={form.source}
                  onValueChange={(v) => setForm({ ...form, source: (v ?? "other") as typeof form.source })}
                >
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
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
              <Label className="text-foreground/80">Notatki</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="bg-background text-foreground min-h-[100px]"
              />
            </div>

            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              disabled={updateContact.isPending}
            >
              {updateContact.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Zapisz zmiany
            </Button>
          </form>
        </CardContent>
      </Card>

      <ActivityTimeline contactId={id} />
    </div>
  );
}