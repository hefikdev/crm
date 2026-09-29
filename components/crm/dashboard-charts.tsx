"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

export function DashboardCharts() {
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();
  const { data: pipeline } = trpc.deals.getPipeline.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 bg-accent" />
        <Skeleton className="h-64 bg-accent" />
      </div>
    );
  }

  const maxPipelineValue = Math.max(...(pipeline?.map((p) => p.total) ?? [0]), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pipeline sprzedaży
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pipeline?.map((column) => (
              <div key={column.stage} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/80 capitalize">
                    {column.stage === "closed_won"
                      ? "Zrealizowane"
                      : column.stage === "closed_lost"
                        ? "Utracone"
                        : column.stage === "lead"
                          ? "Początkowe"
                          : column.stage === "qualified"
                            ? "Kwalifikowane"
                            : column.stage === "proposal"
                              ? "Oferta"
                              : "Negocjacje"}
                  </span>
                  <span className="text-muted-foreground">{column.total.toLocaleString()} PLN</span>
                </div>
                <div className="h-2 rounded-full bg-accent overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      column.stage === "closed_won"
                        ? "bg-emerald-500"
                        : column.stage === "closed_lost"
                          ? "bg-red-500"
                          : "bg-blue-500"
                    }`}
                    style={{ width: `${(column.total / maxPipelineValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Podsumowanie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div>
              <p className="text-sm text-muted-foreground">Wartość pipeline</p>
              <p className="text-lg font-bold text-foreground">
                {(stats?.pipelineValue ?? 0).toLocaleString()} PLN
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div>
              <p className="text-sm text-muted-foreground">Zrealizowane</p>
              <p className="text-lg font-bold text-emerald-400">
                {(stats?.wonValue ?? 0).toLocaleString()} PLN
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div>
              <p className="text-sm text-muted-foreground">Oczekujące aktywności</p>
              <p className="text-lg font-bold text-foreground">{stats?.pendingActivities ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}