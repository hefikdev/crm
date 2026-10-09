"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  Users,
  Building2,
} from "lucide-react";
import { QuickLinks } from "@/components/crm/quick-links";

const stageLabels: Record<string, string> = {
  lead: "Początkowe",
  qualified: "Kwalifikowane",
  proposal: "Oferta",
  negotiation: "Negocjacje",
  closed_won: "Zrealizowane",
  closed_lost: "Utracone",
};

const sourceLabels: Record<string, string> = {
  referral: "Polecenie",
  website: "Strona WWW",
  email: "E-mail",
  phone: "Telefon",
  social: "Social media",
  other: "Inne",
};

const stageBarColors: Record<string, string> = {
  lead: "bg-zinc-500",
  qualified: "bg-blue-500",
  proposal: "bg-amber-500",
  negotiation: "bg-purple-500",
  closed_won: "bg-emerald-500",
  closed_lost: "bg-red-500",
};

export default function ReportsPage() {
  const { data: stats, isLoading: statsLoading } =
    trpc.dashboard.getStats.useQuery();
  const { data: analytics, isLoading: analyticsLoading } =
    trpc.dashboard.getAnalytics.useQuery();
  const { data: pipeline } = trpc.deals.getPipeline.useQuery();

  const totalDeals = pipeline?.reduce((sum, p) => sum + p.deals.length, 0) ?? 0;
  const wonCount =
    pipeline?.find((p) => p.stage === "closed_won")?.deals.length ?? 0;
  const winRate = totalDeals > 0 ? Math.round((wonCount / totalDeals) * 100) : 0;

  const maxMonthly = Math.max(
    ...(analytics?.monthlyData.map((m) => m.won) ?? [1]),
    1
  );

  const maxSourceCount = Math.max(
    ...Object.values(analytics?.sourceBreakdown ?? { other: 1 }),
    1
  );

  if (statsLoading || analyticsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-accent" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 bg-accent" />
          ))}
        </div>
        <Skeleton className="h-64 bg-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Raporty</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Przegląd kluczowych wskaźników wydajności
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Wartość pipeline
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {(stats?.pipelineValue ?? 0).toLocaleString()} PLN
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Średnia: {(analytics?.avgDealValue ?? 0).toLocaleString()} PLN
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Zrealizowane
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-400">
              {(stats?.wonValue ?? 0).toLocaleString()} PLN
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {wonCount} zakończonych sukcesem
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Współczynnik wygranych
            </CardTitle>
            <Target className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{winRate}%</p>
            <div className="mt-2 h-1.5 rounded-full bg-accent overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${winRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Ukończone aktywności
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {analytics?.completionRate ?? 0}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics?.completedActivities ?? 0} z{" "}
              {analytics?.totalActivities ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Przychód z ostatnich 6 miesięcy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-4 h-48">
            {(analytics?.monthlyData ?? []).map((month) => {
              const height =
                maxMonthly > 0 ? (month.won / maxMonthly) * 100 : 0;
              return (
                <div
                  key={month.month}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <span className="text-xs text-muted-foreground">
                    {month.won > 0 ? `${(month.won / 1000).toFixed(0)}k` : "0"}
                  </span>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-700 min-h-[4px]"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {month.month}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Pipeline według etapów
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics?.stageDistribution ?? {}).map(
                ([stage, count]) => {
                  const percentage =
                    totalDeals > 0 ? Math.round((count / totalDeals) * 100) : 0;
                  return (
                    <div key={stage} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground/80">
                          {stageLabels[stage] ?? stage}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {count} ofert
                          </span>
                          <span className="text-xs text-muted-foreground/70">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-accent overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${stageBarColors[stage] ?? "bg-zinc-500"}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Źródła kontaktów
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics?.sourceBreakdown ?? {}).map(
                ([source, count]) => {
                  const percentage =
                    maxSourceCount > 0
                      ? Math.round((count / maxSourceCount) * 100)
                      : 0;
                  return (
                    <div key={source} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground/80">
                          {sourceLabels[source] ?? source}
                        </span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-accent overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
              {Object.keys(analytics?.sourceBreakdown ?? {}).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Brak danych
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Największe oferty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics?.topDeals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Brak ofert
                </p>
              ) : (
                analytics?.topDeals.map((deal, index) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground w-4">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {deal.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {deal.probability}% prawdopodobieństwa
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-foreground shrink-0 ml-2">
                      {deal.value.toLocaleString()} PLN
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Podsumowanie bazy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-muted-foreground">Kontakty</span>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {stats?.totalContacts ?? 0}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-muted-foreground">Firmy</span>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {stats?.totalCompanies ?? 0}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-amber-400" />
                  <span className="text-xs text-muted-foreground">Oferty</span>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {stats?.totalDeals ?? 0}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-muted-foreground">
                    Aktywności
                  </span>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {stats?.pendingActivities ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <QuickLinks
        links={[
          { href: "/a/forecast", label: "Prognoza", icon: TrendingUp },
          { href: "/a/deals", label: "Oferty", icon: DollarSign },
          { href: "/a/targets", label: "Cele", icon: Target },
        ]}
      />
    </div>
  );
}