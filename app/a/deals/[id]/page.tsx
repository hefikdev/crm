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
  DollarSign,
  Trash2,
  Pencil,
  Percent,
  CalendarClock,
  User,
  Building2,
  Target,
  Package,
  Users,
} from "lucide-react";
import Link from "next/link";
import { DealItems } from "@/components/crm/deal-items";
import { QuickLinks } from "@/components/crm/quick-links";

const stageColors: Record<string, string> = {
  lead: "bg-accent text-foreground/80",
  qualified: "bg-blue-500/15 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  proposal: "bg-amber-500/15 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  negotiation: "bg-purple-500/15 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
  closed_won: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  closed_lost: "bg-red-500/15 text-red-700 dark:bg-red-900 dark:text-red-200",
};

const stageLabels: Record<string, string> = {
  lead: "Początkowe",
  qualified: "Kwalifikowane",
  proposal: "Oferta",
  negotiation: "Negocjacje",
  closed_won: "Zrealizowane",
  closed_lost: "Utracone",
};

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: deal, isLoading } = trpc.deals.getById.useQuery({ id });
  const { data: contact } = trpc.contacts.getById.useQuery(
    { id: deal?.contactId ?? "" },
    { enabled: !!deal?.contactId }
  );
  const { data: company } = trpc.companies.getById.useQuery(
    { id: deal?.companyId ?? "" },
    { enabled: !!deal?.companyId }
  );

  const deleteDeal = trpc.deals.delete.useMutation({
    onSuccess: () => {
      toast.success("Oferta usunięta");
      router.push("/a/deals");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/a/deals"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Powrót
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/a/deals/${id}/edit`}>
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
              if (confirm("Usunąć ofertę?")) deleteDeal.mutate({ id });
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
              <DollarSign className="h-6 w-6 text-foreground/80" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{deal.title}</h1>
                <Badge className={stageColors[deal.stage]}>{stageLabels[deal.stage]}</Badge>
              </div>
              <p className="text-2xl font-semibold text-foreground mt-2">
                {deal.value.toLocaleString()} {deal.currency}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border bg-card">
          <CardContent className="pt-6 space-y-4">
            <InfoRow icon={Percent} label="Prawdopodobieństwo">
              {deal.probability}%
            </InfoRow>
            <InfoRow icon={CalendarClock} label="Data zamknięcia">
              {deal.expectedCloseDate
                ? new Date(deal.expectedCloseDate).toLocaleDateString("pl-PL")
                : "Brak"}
            </InfoRow>
            <InfoRow icon={Target} label="Utworzono">
              {new Date(deal.createdAt).toLocaleDateString("pl-PL")}
            </InfoRow>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Powiązania
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contact ? (
              <Link
                href={`/a/contacts/${contact.id}`}
                className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {contact.firstName} {contact.lastName}
                </span>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-3">
                <User className="h-4 w-4" /> Brak kontaktu
              </p>
            )}
            {company ? (
              <Link
                href={`/a/companies/${company.id}`}
                className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{company.name}</span>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-3">
                <Building2 className="h-4 w-4" /> Brak firmy
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Notatki
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deal.notes ? (
              <p className="text-sm text-foreground whitespace-pre-wrap">{deal.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Brak notatek</p>
            )}
          </CardContent>
        </Card>
      </div>

      <DealItems dealId={id} />

      <QuickLinks
        links={[
          { href: "/a/deals", label: "Oferty", icon: DollarSign },
          { href: "/a/products", label: "Produkty", icon: Package },
          { href: "/a/contacts", label: "Kontakty", icon: Users },
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
  icon: typeof Percent;
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
