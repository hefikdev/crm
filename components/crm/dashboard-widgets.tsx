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