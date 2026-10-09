"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export function NeedsAttentionWidget() {
  const { data, isLoading } = trpc.dashboard.getNeedsAttention.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 bg-accent" />
        <Skeleton className="h-64 bg-accent" />
      </div>
    );
  }

  const overdue = data?.overdue ?? [];
  const stale = data?.staleDeals ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            Po terminie
          </CardTitle>
          <Badge className="bg-red-500/15 text-red-700 dark:bg-red-900 dark:text-red-200">
            {overdue.length}
          </Badge>
        </CardHeader>
        <CardContent>
          {overdue.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Wszystko na bieżąco
            </p>
          ) : (
            <div className="space-y-2">
              {overdue.map((a) => (
                <Link
                  key={a.id}
                  href={`/a/activities/${a.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{a.title}</p>
                    <p className="text-xs text-red-400">
                      Termin:{" "}
                      {a.dueDate
                        ? new Date(a.dueDate).toLocaleDateString("pl-PL")
                        : "—"}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            Oferty bez ruchu (14 dni)
          </CardTitle>
          <Badge className="bg-amber-500/15 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
            {stale.length}
          </Badge>
        </CardHeader>
        <CardContent>
          {stale.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Brak zaniedbanych ofert
            </p>
          ) : (
            <div className="space-y-2">
              {stale.map((d) => (
                <Link
                  key={d.id}
                  href={`/a/deals/${d.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.value.toLocaleString()} PLN · ostatnia zmiana{" "}
                      {new Date(d.updatedAt).toLocaleDateString("pl-PL")}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
