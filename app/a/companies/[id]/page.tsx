"use client";

import { trpc } from "@/lib/trpc/client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Globe,
  Trash2,
  Pencil,
  Mail,
  Phone,
  MapPin,
  Users,
  User,
  DollarSign,
  CalendarClock,
} from "lucide-react";
import Link from "next/link";
import { QuickLinks } from "@/components/crm/quick-links";

const statusLabels: Record<string, string> = {
  active: "Aktywna",
  inactive: "Nieaktywna",
  lead: "Lead",
  archived: "Zarchiwizowana",
};

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: company, isLoading } = trpc.companies.getById.useQuery({ id });
  const { data: contacts } = trpc.contacts.list.useQuery({ companyId: id, limit: 50 });

  const deleteCompany = trpc.companies.delete.useMutation({
    onSuccess: () => {
      toast.success("Firma usunięta");
      router.push("/a/companies");
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32 bg-accent" />
        <Skeleton className="h-64 bg-accent" />
        <Skeleton className="h-48 bg-accent" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Firma nie znaleziona</p>
        <Link href="/a/companies" className="text-foreground hover:underline">
          Powrót do firm
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/a/companies" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Powrót
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/a/companies/${id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edytuj
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Usunąć firmę?")) deleteCompany.mutate({ id });
            }}
            className="cursor-pointer"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Usuń
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6 text-foreground/80" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
                <Badge
                  className={
                    company.status === "active"
                      ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
                      : "bg-accent text-foreground/80"
                  }
                >
                  {statusLabels[company.status]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {company.industry ?? "Brak branży"}
                {company.size ? ` · ${company.size} pracowników` : ""}
                {company.city ? ` · ${company.city}` : ""}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                {company.email && (
                  <a
                    href={`mailto:${company.email}`}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {company.email}
                  </a>
                )}
                {company.phone && (
                  <a
                    href={`tel:${company.phone}`}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {company.phone}
                  </a>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Informacje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow icon={Globe} label="Domena">
              {company.domain || <span className="text-muted-foreground">Brak</span>}
            </InfoRow>
            <InfoRow icon={Building2} label="Branża">
              {company.industry || <span className="text-muted-foreground">Brak</span>}
            </InfoRow>
            <InfoRow icon={MapPin} label="Adres">
              {[company.address, company.city, company.country].filter(Boolean).join(", ") || (
                <span className="text-muted-foreground">Brak</span>
              )}
            </InfoRow>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Notatki
            </CardTitle>
          </CardHeader>
          <CardContent>
            {company.notes ? (
              <p className="text-sm text-foreground whitespace-pre-wrap">{company.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Brak notatek</p>
            )}
            {company.tags && company.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {company.tags.map((tag) => (
                  <Badge key={tag} className="bg-accent text-foreground/80">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Kontakty ({contacts?.total ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!contacts || contacts.data.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Brak kontaktów w tej firmie
            </p>
          ) : (
            <div className="divide-y divide-border">
              {contacts.data.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/a/contacts/${contact.id}`}
                  className="flex items-center justify-between py-3 hover:bg-muted transition-colors cursor-pointer px-2 -mx-2 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center text-xs font-medium text-foreground/80 shrink-0">
                      {contact.firstName[0]}
                      {contact.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {contact.position ?? contact.email ?? "—"}
                      </p>
                    </div>
                  </div>
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <QuickLinks
        links={[
          { href: "/a/contacts", label: "Kontakty", icon: Users },
          { href: "/a/deals", label: "Oferty", icon: DollarSign },
          { href: "/a/activities", label: "Aktywności", icon: CalendarClock },
        ]}
      />
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Globe;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="text-sm text-foreground text-right">{children}</span>
    </div>
  );
}