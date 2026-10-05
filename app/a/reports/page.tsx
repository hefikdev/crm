"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  Users,
  Building2,
} from "lucide-react";

export default function ReportsPage() {
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();
  const { data: pipeline } = trpc.deals.getPipeline.useQuery();

  const totalDeals = pipeline?.reduce((sum, p) => sum + p.deals.length, 0) ?? 0;
  const totalPipelineValue = pipeline?.reduce((sum, p) => sum + p.total, 0) ?? 0;
  const wonValue =
    pipeline?.find((p) => p.stage === "closed_won")?.total ?? 0;
  const wonCount =
    pipeline?.find((p) => p.stage === "closed_won")?.deals.length ?? 0;
  const winRate =
    totalDeals > 0
      ? Math.round((wonCount / totalDeals) * 100)
      : 0;
  const avgDealValue = totalDeals > 0 ? Math.round(totalPipelineValue / totalDeals) : 0;

  const activeDeals =
    pipeline
      ?.filter((p) => !["closed_won", "closed_lost"].includes(p.stage))
      .reduce((sum, p) => sum + p.deals.length, 0) ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Raporty</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Przegląd kluczowych wskaźników wydajności
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 bg-zinc-800" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-zinc-800 bg-zinc-950">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Wartość pipeline
                </CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">
                  {totalPipelineValue.toLocaleString()} PLN
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Łączna wartość wszystkich ofert
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Zrealizowane
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-emerald-400">
                  {wonValue.toLocaleString()} PLN
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {wonCount} zakończonych sukcesem
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Współczynnik wygranych
                </CardTitle>
                <Target className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{winRate}%</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {totalDeals} wszystkich ofert
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Średnia wartość
                </CardTitle>
                <Activity className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">
                  {avgDealValue.toLocaleString()} PLN
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Średnia wartość oferty
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-zinc-800 bg-zinc-950">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                  Pipeline według etapów
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipeline?.map((column) => {
                    const percentage =
                      totalPipelineValue > 0
                        ? Math.round(
                            (column.total / totalPipelineValue) * 100
                          )
                        : 0;
                    return (
                      <div key={column.stage} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-300 capitalize">
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
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-500">
                              {column.total.toLocaleString()} PLN
                            </span>
                            <Badge
                              className={
                                column.stage === "closed_won"
                                  ? "bg-emerald-900 text-emerald-200"
                                  : column.stage === "closed_lost"
                                    ? "bg-red-900 text-red-200"
                                    : "bg-zinc-800 text-zinc-300"
                              }
                            >
                              {column.deals.length}
                            </Badge>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              column.stage === "closed_won"
                                ? "bg-emerald-500"
                                : column.stage === "closed_lost"
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                  Podsumowanie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-900 flex items-center justify-center">
                      <Target className="h-4 w-4 text-blue-200" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Aktywne oferty</p>
                      <p className="text-sm font-medium text-white">
                        {activeDeals}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-900 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-emerald-200" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">
                        Współczynnik konwersji
                      </p>
                      <p className="text-sm font-medium text-white">{winRate}%</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-900 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-purple-200" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Średnia wartość oferty</p>
                      <p className="text-sm font-medium text-white">
                        {avgDealValue.toLocaleString()} PLN
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                Statystyki kontaktów i firm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-zinc-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-zinc-400">Kontakty</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {stats?.totalContacts ?? 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-zinc-400">Firmy</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {stats?.totalCompanies ?? 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-amber-400" />
                    <span className="text-xs text-zinc-400">Oferty</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {stats?.totalDeals ?? 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-purple-400" />
                    <span className="text-xs text-zinc-400">Aktywności</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {stats?.pendingActivities ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}