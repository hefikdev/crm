"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Phone,
  Mail,
  Users,
  CalendarClock,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";

const typeIcons: Record<string, React.ReactNode> = {
  call: <Phone className="h-3.5 w-3.5" />,
  email: <Mail className="h-3.5 w-3.5" />,
  meeting: <Users className="h-3.5 w-3.5" />,
  task: <CalendarClock className="h-3.5 w-3.5" />,
  note: <FileText className="h-3.5 w-3.5" />,
  follow_up: <ArrowRight className="h-3.5 w-3.5" />,
};

const typeLabels: Record<string, string> = {
  call: "Telefon",
  email: "E-mail",
  meeting: "Spotkanie",
  task: "Zadanie",
  note: "Notatka",
  follow_up: "Follow-up",
};

export default function TimelinePage() {
  const { data, isLoading } = trpc.activities.list.useQuery({ limit: 100 });

  const grouped = (data?.data ?? []).reduce<Record<string, typeof data.data>>(
    (acc, activity) => {
      const day = new Date(activity.createdAt).toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      (acc[day] ??= []).push(activity);
      return acc;
    },
    {}
  );

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Os czasu</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pełna historia aktywności
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 bg-accent" />
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Brak aktywności</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([day, items]) => (
          <div key={day}>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {day}
            </h2>
            <Card className="border-border bg-card">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {items.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-4"
                    >
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                        {typeIcons[activity.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {typeLabels[activity.type] ?? activity.type}
                        </p>
                      </div>
                      {activity.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}
