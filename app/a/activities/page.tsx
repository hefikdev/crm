"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock, CheckCircle2, Clock, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const typeColors: Record<string, string> = {
  call: "bg-blue-500/15 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  email: "bg-amber-500/15 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  meeting: "bg-purple-500/15 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
  task: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  note: "bg-accent text-foreground/80",
  follow_up: "bg-rose-500/15 text-rose-700 dark:bg-rose-900 dark:text-rose-200",
};

export default function ActivitiesPage() {
  const router = useRouter();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = trpc.activities.list.useQuery({
    status,
    page,
    limit: 20,
  });

  const completeActivity = trpc.activities.complete.useMutation({
    onSuccess: () => { toast.success("Aktywność zakończona"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Aktywności</h1>
          <p className="text-muted-foreground text-sm mt-1">{data?.total ?? 0} aktywności</p>
        </div>
        <Link href="/a/activities/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj aktywność
          </Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm cursor-pointer">
          <option value="all">Wszystkie</option>
          <option value="pending">Oczekujące</option>
          <option value="completed">Zakończone</option>
          <option value="cancelled">Anulowane</option>
        </select>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 bg-accent" />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-12"><p className="text-muted-foreground">Brak aktywności</p></div>
          ) : (
            <div className="divide-y divide-border">
              {data?.data.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      {activity.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString("pl-PL")}
                        {activity.dueDate && ` · Termin: ${new Date(activity.dueDate).toLocaleDateString("pl-PL")}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={typeColors[activity.type]}>{activity.type === "call" ? "Telefon" : activity.type === "email" ? "E-mail" : activity.type === "meeting" ? "Spotkanie" : activity.type === "task" ? "Zadanie" : activity.type === "note" ? "Notatka" : "Follow-up"}</Badge>
                    {activity.status === "pending" && (
                      <Button variant="ghost" size="icon" onClick={() => completeActivity.mutate({ id: activity.id })} className="text-emerald-400 hover:text-emerald-300 cursor-pointer">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="border-border text-muted-foreground cursor-pointer">Poprzednia</Button>
          <span className="text-sm text-muted-foreground">Strona {page} z {data.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="border-border text-muted-foreground cursor-pointer">Następna</Button>
        </div>
      )}
    </div>
  );
}