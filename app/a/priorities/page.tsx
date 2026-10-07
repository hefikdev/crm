"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Clock, AlertTriangle, Sun } from "lucide-react";

export default function PrioritiesPage() {
  const router = useRouter();
  const { data, isLoading, refetch } = trpc.activities.list.useQuery({
    status: "pending",
    limit: 100,
  });

  const complete = trpc.activities.complete.useMutation({
    onSuccess: () => {
      toast.success("Zadanie zakończone");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const now = Date.now();
  const items = data?.data ?? [];
  const overdue = items.filter(
    (a) => a.dueDate && new Date(a.dueDate).getTime() < now
  );
  const today = items.filter((a) => {
    if (!a.dueDate) return false;
    const d = new Date(a.dueDate);
    const t = new Date();
    return (
      d.getDate() === t.getDate() &&
      d.getMonth() === t.getMonth() &&
      d.getFullYear() === t.getFullYear()
    );
  });
  const upcoming = items.filter(
    (a) => !a.dueDate || new Date(a.dueDate).getTime() >= now
  );

  const sections = [
    { title: "Po terminie", items: overdue, icon: AlertTriangle, color: "text-red-500" },
    { title: "Na dziś", items: today, icon: Sun, color: "text-amber-500" },
    { title: "Nadchodzące", items: upcoming, icon: Clock, color: "text-muted-foreground" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Priorytety</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Co wymaga uwagi dzisiaj
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 bg-accent" />
          ))}
        </div>
      ) : (
        sections.map((section) => (
          <Card key={section.title} className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <section.icon className={`h-4 w-4 ${section.color}`} />
                {section.title}
                <Badge className="bg-muted text-muted-foreground ml-auto">
                  {section.items.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {section.items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Nic do zrobienia
                </p>
              ) : (
                <div className="space-y-2">
                  {section.items.slice(0, 8).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.title}
                        </p>
                        {activity.dueDate && (
                          <p className="text-xs text-muted-foreground">
                            Termin:{" "}
                            {new Date(activity.dueDate).toLocaleDateString("pl-PL")}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => complete.mutate({ id: activity.id })}
                        className="text-emerald-500 hover:text-emerald-400 cursor-pointer shrink-0"
                        aria-label="Zakończ"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
