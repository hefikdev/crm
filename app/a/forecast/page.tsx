"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Target, DollarSign, Percent } from "lucide-react";

const stageLabels: Record<string, string> = {
  lead: "Początkowe",
  qualified: "Kwalifikowane",
  proposal: "Oferta",
  negotiation: "Negocjacje",
  closed_won: "Zrealizowane",
  closed_lost: "Utracone",
};

export default function ForecastPage() {
  const { data: pipeline, isLoading } = trpc.deals.getPipeline.useQuery();
  const { data: stats } = trpc.dashboard.getStats.useQuery();

  // Weighted forecast based on stage probability
  const stageProbability: Record<string, number> = {
    lead: 0.1,
    qualified: 0.3,
    proposal: 0.5,
    negotiation: 0.75,
    closed_won: 1,
    closed_lost: 0,
  };

  const forecast =
    pipeline?.reduce(
      (sum, column) =>
        sum + column.total * (stageProbability[column.stage] ?? 0),
      0
    ) ?? 0;

  const activePipeline =
    pipeline
      ?.filter((p) => !["closed_won", "closed_lost"].includes(p.stage))
      .reduce((sum, p) => sum + p.total, 0) ?? 0;

  const confidence =
    activePipeline > 0 ? Math.round((forecast / activePipeline) * 100) : 0;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48 bg-accent" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 bg-accent" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Prognoza</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Prognoza sprzedaży ważona prawdopodobieństwem
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Prognoza ważona
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {Math.round(forecast).toLocaleString()} PLN
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Oczekiwany przychód
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Aktywny pipeline
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {activePipeline.toLocaleString()} PLN
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Łączna wartość otwartych ofert
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pewność prognozy
            </CardTitle>
            <Percent className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{confidence}%</p>
            <div className="mt-2 h-1.5 rounded-full bg-accent overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-500"
                style={{ width: `${confidence}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Prognoza według etapów
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipeline?.map((column) => {
              const weighted = column.total * (stageProbability[column.stage] ?? 0);
              const percentage =
                activePipeline > 0
                  ? Math.round((column.total / activePipeline) * 100)
                  : 0;
              return (
                <div key={column.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground/80">
                      {stageLabels[column.stage] ?? column.stage}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {Math.round((stageProbability[column.stage] ?? 0) * 100)}%
                        szansy
                      </span>
                      <span className="text-muted-foreground">
                        {column.total.toLocaleString()} PLN
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-accent overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground/70">
                    Prognoza: {Math.round(weighted).toLocaleString()} PLN
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Najlepsze szanse na zamknięcie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pipeline
              ?.filter((p) => ["proposal", "negotiation"].includes(p.stage))
              .flatMap((p) => p.deals.map((d) => ({ ...d, stageName: p.stage })))
              .sort((a, b) => b.value * b.probability - a.value * a.probability)
              .slice(0, 8)
              .map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {deal.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {deal.probability}% · {stageLabels[deal.stageName] ?? deal.stageName}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-medium text-foreground">
                      {deal.value.toLocaleString()} PLN
                    </p>
                    <p className="text-xs text-emerald-400">
                      Prognoza:{" "}
                      {Math.round(
                        (deal.value * deal.probability) / 100
                      ).toLocaleString()}{" "}
                      PLN
                    </p>
                  </div>
                </div>
              ))}
            {pipeline?.filter((p) =>
              ["proposal", "negotiation"].includes(p.stage)
            ).flatMap((p) => p.deals).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                Brak ofert w etapach ofertowania i negocjacji
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}