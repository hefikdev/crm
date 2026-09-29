"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, Clock, Phone, Mail, Users, FileText, ArrowRight } from "lucide-react";

const typeIcons: Record<string, React.ReactNode> = {
  call: <Phone className="h-3 w-3" />,
  email: <Mail className="h-3 w-3" />,
  meeting: <Users className="h-3 w-3" />,
  task: <CalendarClock className="h-3 w-3" />,
  note: <FileText className="h-3 w-3" />,
  follow_up: <ArrowRight className="h-3 w-3" />,
};

const typeLabels: Record<string, string> = {
  call: "Telefon",
  email: "E-mail",
  meeting: "Spotkanie",
  task: "Zadanie",
  note: "Notatka",
  follow_up: "Follow-up",
};

export function ActivityTimeline({ contactId }: { contactId: string }) {
  const router = useRouter();
  const { data, isLoading } = trpc.activities.list.useQuery({ contactId, limit: 20 });

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-sm text-muted-foreground">Aktywności</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 bg-accent" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-muted-foreground">Aktywności</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/a/activities/new`)}
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          + Dodaj
        </Button>
      </CardHeader>
      <CardContent>
        {data?.data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Brak aktywności</p>
        ) : (
          <div className="space-y-1 relative before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-accent">
            {data?.data.map((activity) => (
              <div key={activity.id} className="flex gap-3 pl-10 relative pb-3">
                <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-accent flex items-center justify-center">
                  {activity.status === "completed" ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{typeIcons[activity.type]}</span>
                    <Badge className="bg-accent text-foreground/80 text-xs">
                      {typeLabels[activity.type] ?? activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground mt-0.5">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleDateString("pl-PL")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}