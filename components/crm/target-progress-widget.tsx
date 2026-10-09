"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, TrendingUp } from "lucide-react";
import Link from "next/link";

export function TargetProgressWidget() {
  const { data, isLoading } = trpc.targets.getProgress.useQuery();

  if (isLoading) {
    return <Skeleton className="h-[140px] bg-accent rounded-xl" />;
  }

  const target = data?.target ?? 0;
  const actual = data?.actual ?? 0;
  const percent = data?.percent ?? 0;
  const clamped = Math.min(percent, 100);

  const barColor =
    percent >= 100
      ? "bg-emerald-500"
      : percent >= 50
        ? "bg-amber-500"
        : "bg-primary";

  return (
    <Link href="/a/targets" className="block">
      <Card className="border-border bg-card hover:border-primary/40 transition-colors cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Cel sprzedażowy
            </CardTitle>
            <span className="text-xs text-muted-foreground">{data?.period}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {target > 0 ? (
            <>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-semibold text-foreground tabular-nums">
                  {actual.toLocaleString()} PLN
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  / {target.toLocaleString()} PLN
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${clamped}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {percent}% celu miesięcznego
                </span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {Math.max(target - actual, 0).toLocaleString()} PLN do celu
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-2">
              Brak celu na ten miesiąc — kliknij, aby ustawić.
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
