"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Target, TrendingUp, Loader2, Trash2 } from "lucide-react";

export default function TargetsPage() {
  const { data: progress, isLoading, refetch } = trpc.targets.getProgress.useQuery();
  const { data: allTargets, refetch: refetchAll } = trpc.targets.list.useQuery();

  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [amount, setAmount] = useState(0);

  const upsert = trpc.targets.upsert.useMutation({
    onSuccess: () => {
      toast.success("Cel zapisany");
      refetch();
      refetchAll();
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = trpc.targets.delete.useMutation({
    onSuccess: () => {
      toast.success("Cel usunięty");
      refetch();
      refetchAll();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsert.mutate({ period, amount, currency: "PLN" });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cele sprzedażowe</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ustal i śledź cele miesięczne
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 bg-accent" />
      ) : (
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Bieżący miesiąc ({progress?.period})
              </CardTitle>
              <Target className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {(progress?.actual ?? 0).toLocaleString()} PLN
                </p>
                <p className="text-sm text-muted-foreground">
                  z {(progress?.target ?? 0).toLocaleString()} PLN celu
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-2xl font-bold ${
                    (progress?.percent ?? 0) >= 100
                      ? "text-emerald-400"
                      : (progress?.percent ?? 0) >= 50
                        ? "text-amber-400"
                        : "text-foreground"
                  }`}
                >
                  {progress?.percent ?? 0}%
                </p>
                <p className="text-xs text-muted-foreground">realizacji</p>
              </div>
            </div>
            <div className="h-3 rounded-full bg-accent overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  (progress?.percent ?? 0) >= 100
                    ? "bg-emerald-500"
                    : (progress?.percent ?? 0) >= 50
                      ? "bg-amber-500"
                      : "bg-blue-500"
                }`}
                style={{ width: `${Math.min(progress?.percent ?? 0, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Ustaw cel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Miesiąc</Label>
              <Input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="h-10 w-44"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Kwota celu (PLN)</Label>
              <Input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="h-10 w-44"
              />
            </div>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={upsert.isPending}
            >
              {upsert.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Zapisz cel"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Historia celów
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!allTargets || allTargets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Brak zdefiniowanych celów
            </p>
          ) : (
            <div className="divide-y divide-border">
              {allTargets.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {t.period}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground tabular-nums">
                      {t.amount.toLocaleString()} {t.currency}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove.mutate({ id: t.id })}
                      className="text-muted-foreground hover:text-red-500 cursor-pointer"
                      aria-label="Usuń cel"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
