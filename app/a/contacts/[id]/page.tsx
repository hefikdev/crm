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
  Mail,
  Phone,
  Building2,
  Trash2,
  Pencil,
  Briefcase,
  Tag,
  FileText,
  DollarSign,
  Users,
  CalendarClock,
} from "lucide-react";
import Link from "next/link";
import { ActivityTimeline } from "@/components/crm/activity-timeline";
import { QuickLinks } from "@/components/crm/quick-links";

const statusLabels: Record<string, string> = {
  active: "Aktywny",
  inactive: "Nieaktywny",
  lead: "Lead",
  archived: "Zarchiwizowany",
};

const sourceLabels: Record<string, string> = {
  referral: "Polecenie",
  website: "Strona WWW",
  email: "E-mail",
  phone: "Telefon",
  social: "Social media",
  other: "Inne",
};

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: contact, isLoading } = trpc.contacts.getById.useQuery({ id });
  const { data: company } = trpc.companies.getById.useQuery(
    { id: contact?.companyId ?? "" },
    { enabled: !!contact?.companyId }
  );

  const deleteContact = trpc.contacts.delete.useMutation({
    onSuccess: () => {
      toast.success("Kontakt usunięty");
      router.push("/a/contacts");
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

  if (!contact) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Kontakt nie znaleziony</p>
        <Link href="/a/contacts" className="text-foreground hover:underline">
          Powrót do kontaktów
        </Link>
      </div>
    );
  }

  const initials = `${contact.firstName[0]}${contact.lastName[0]}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/a/contacts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Powrót
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/a/contacts/${id}/edit`}>
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
              if (confirm("Usunąć ten kontakt?")) deleteContact.mutate({ id });
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
            <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center text-2xl font-medium text-foreground/80 shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">
                  {contact.firstName} {contact.lastName}
                </h1>
                <Badge
                  className={
                    contact.status === "active"
                      ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
                      : contact.status === "lead"
                        ? "bg-blue-500/15 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-accent text-foreground/80"
                  }
                >
                  {statusLabels[contact.status]}
                </Badge>
              </div>
              {contact.position && (
                <p className="text-muted-foreground text-sm mt-1">{contact.position}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {contact.phone}
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
            <InfoRow icon={Building2} label="Firma">
              {company ? (
                <Link
                  href={`/a/companies/${company.id}`}
                  className="text-foreground hover:underline cursor-pointer"
                >
                  {company.name}
                </Link>
              ) : (
                <span className="text-muted-foreground">Brak</span>
              )}
            </InfoRow>
            <InfoRow icon={Briefcase} label="Stanowisko">
              {contact.position || <span className="text-muted-foreground">Brak</span>}
            </InfoRow>
            <InfoRow icon={Tag} label="Źródło">
              {sourceLabels[contact.source ?? "other"]}
            </InfoRow>
            <InfoRow icon={CalendarClock} label="Ostatni kontakt">
              {contact.lastContactedAt
                ? new Date(contact.lastContactedAt).toLocaleDateString("pl-PL")
                : "Brak"}
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
            {contact.notes ? (
              <p className="text-sm text-foreground whitespace-pre-wrap">{contact.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Brak notatek</p>
            )}
            {contact.tags && contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {contact.tags.map((tag) => (
                  <Badge key={tag} className="bg-accent text-foreground/80">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ActivityTimeline contactId={id} />

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
  icon: typeof FileText;
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
