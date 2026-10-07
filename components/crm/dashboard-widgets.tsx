"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Clock, TrendingUp, Target, Zap } from "lucide-react";

export function DashboardWidgets() {
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();
  const { data: pipeline } = trpc.deals.getPipeline.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 bg-accent" />
        ))}
      </div>
    );
  }

  const totalDeals = pipeline?.reduce((sum, p) => sum + p.deals.length, 0) ?? 0;
  const wonCount = pipeline?.find((p) => p.stage === "closed_won")?.deals.length ?? 0;
  const winRate = totalDeals > 0 ? Math.round((wonCount / totalDeals) * 100) : 0;
  const activeDeals = pipeline?.filter((p) => !["closed_won", "closed_lost"].includes(p.stage)).reduce((sum, p) => sum + p.deals.length, 0) ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Współczynnik konwersji
            </CardTitle>
            <Target className="h-4 w-4 text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">{winRate}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-accent overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${winRate}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {wonCount} z {totalDeals} ofert zakończonych sukcesem
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Aktywne oferty
            </CardTitle>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">{activeDeals}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex -space-x-1">
              {pipeline?.filter((p) => !["closed_won", "closed_lost"].includes(p.stage)).map((p) => (
                <div
                  key={p.stage}
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor:
                      p.stage === "lead"
                        ? "rgb(161, 161, 170)"
                        : p.stage === "qualified"
                          ? "rgb(96, 165, 250)"
                          : p.stage === "proposal"
                            ? "rgb(251, 191, 36)"
                            : "rgb(168, 85, 247)",
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">w pipeline</span>
          </div>
          <Link
            href="/a/deals"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors cursor-pointer"
          >
            Zobacz wszystkie <ArrowRight className="h-3 w-3" />
          </Link>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Oczekujące aktywności
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">{stats?.pendingActivities ?? 0}</p>
          <Link
            href="/a/tasks"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors cursor-pointer"
          >
            Przejdź do zadań <ArrowRight className="h-3 w-3" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export function LeadScoreWidget() {
  const { data: leads, isLoading } = trpc.contacts.getLeadScores.useQuery();

  if (isLoading) {
    return <Skeleton className="h-64 bg-accent" />;
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Najlepsze leady
          </CardTitle>
          <Target className="h-4 w-4 text-emerald-400" />
        </div>
      </CardHeader>
      <CardContent>
        {!leads || leads.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Brak kontaktów
          </p>
        ) : (
          <div className="space-y-2">
            {leads.slice(0, 6).map((lead) => (
              <Link
                key={lead.id}
                href={`/a/contacts/${lead.id}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {lead.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {lead.email ?? "Brak e-maila"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <div className="w-16 h-1.5 rounded-full bg-accent overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        lead.score >= 70
                          ? "bg-emerald-500"
                          : lead.score >= 40
                            ? "bg-amber-500"
                            : "bg-zinc-500"
                      }`}
                      style={{ width: `${lead.score}%` }}
                    />
                  </div>
                  <Badge className="bg-muted text-muted-foreground tabular-nums">
                    {lead.score}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}