"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Building2, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { KanbanBoard } from "@/components/crm/kanban-board";
import { DashboardCharts } from "@/components/crm/dashboard-charts";
import { DashboardWidgets, LeadScoreWidget } from "@/components/crm/dashboard-widgets";

const stageColors: Record<string, string> = {
  lead: "bg-accent text-foreground/80",
  qualified: "bg-blue-500/15 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  proposal: "bg-amber-500/15 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  negotiation: "bg-purple-500/15 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
  closed_won: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  closed_lost: "bg-red-500/15 text-red-700 dark:bg-red-900 dark:text-red-200",
};

export default function DashboardPage() {
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();
  const { data: recentActivity } = trpc.dashboard.getRecentActivity.useQuery();

  const cards = [
    {
      title: "Kontakty",
      value: stats?.totalContacts ?? 0,
      icon: Users,
      href: "/a/contacts",
      color: "text-blue-400",
    },
    {
      title: "Firmy",
      value: stats?.totalCompanies ?? 0,
      icon: Building2,
      href: "/a/companies",
      color: "text-emerald-400",
    },
    {
      title: "Ofert",
      value: stats?.totalDeals ?? 0,
      icon: DollarSign,
      href: "/a/deals",
      color: "text-amber-400",
    },
    {
      title: "Wartość pipeline",
      value: `${(stats?.pipelineValue ?? 0).toLocaleString()} PLN`,
      icon: TrendingUp,
      href: "/a/deals",
      color: "text-purple-400",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panel główny</h1>
          <p className="text-muted-foreground text-sm mt-1">Przegląd CRM</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/a/contacts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <ArrowUpRight className="h-4 w-4" />
            Dodaj kontakt
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="border-border bg-card hover:bg-muted transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 bg-accent" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <DashboardCharts />

      <DashboardWidgets />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadScoreWidget />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Tablica Kanban</h2>
        <KanbanBoard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ostatnie oferty
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 bg-accent" />
                ))}
              </div>
            ) : stats?.recentDeals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Brak ofert</p>
            ) : (
              <div className="space-y-2">
                {stats?.recentDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/a/deals/${deal.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{deal.title}</p>
                      <p className="text-xs text-muted-foreground">{deal.value.toLocaleString()} PLN</p>
                    </div>
                    <Badge className={stageColors[deal.stage]}>
                      {deal.stage === "closed_won" ? "Zrealizowane" : deal.stage === "closed_lost" ? "Utracone" : deal.stage === "lead" ? "Początkowe" : deal.stage === "qualified" ? "Kwalifikowane" : deal.stage === "proposal" ? "Oferta" : "Negocjacje"}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ostatnia aktywność
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 bg-accent" />
                ))}
              </div>
            ) : recentActivity?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Brak aktywności</p>
            ) : (
              <div className="space-y-2">
                {recentActivity?.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString("pl-PL")}
                      </p>
                    </div>
                    <Badge
                      className={
                        activity.status === "completed"
                          ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
                          : "bg-accent text-foreground/80"
                      }
                    >
                      {activity.status === "completed" ? "Zakończone" : activity.status === "pending" ? "Oczekujące" : "Anulowane"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}