"use client";

import { trpc } from "@/lib/trpc/client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  Trash2,
  CheckCircle2,
  Pencil,
  Phone,
  Mail,
  Users,
  CalendarClock,
  FileText,
  ArrowRight,
  User,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { QuickLinks } from "@/components/crm/quick-links";

const typeLabels: Record<string, string> = {
  call: "Telefon",
  email: "E-mail",
  meeting: "Spotkanie",
  task: "Zadanie",
  note: "Notatka",
  follow_up: "Follow-up",
};

const typeIcons: Record<string, React.ReactNode> = {
  call: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  meeting: <Users className="h-4 w-4" />,
  task: <CalendarClock className="h-4 w-4" />,
  note: <FileText className="h-4 w-4" />,
  follow_up: <ArrowRight className="h-4 w-4" />,
};

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: activity, isLoading, refetch } = trpc.activities.getById.useQuery({ id });

  const deleteActivity = trpc.activities.delete.useMutation({
    onSuccess: () => {
      toast.success("Aktywność usunięta");
      router.push("/a/activities");
    },
    onError: (err) => toast.error(err.message),
  });

  const completeActivity = trpc.activities.complete.useMutation({
    onSuccess: () => {
      toast.success("Aktywność zakończona");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32 bg-accent" />
        <Skeleton className="h-64 bg-accent" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aktywność nie znaleziona</p>
        <Link href="/a/activities" className="text-foreground hover:underline">
          Powrót do aktywności
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/a/activities"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Powrót
        </Link>
        <div className="flex items-center gap-2">
          {activity.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => completeActivity.mutate({ id })}
              className="border-border text-emerald-500 hover:text-emerald-400 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Zakończ
            </Button>
          )}
          <Link href={`/a/activities/${id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edytuj
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Usunąć tę aktywność?")) deleteActivity.mutate({ id });
            }}
            className="cursor-pointer"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Usuń
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-xl bg-accent flex items-center justify-center text-foreground/80 shrink-0">
              {typeIcons[activity.type]}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground">{activity.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-accent text-foreground/80">{typeLabels[activity.type]}</Badge>
                <Badge
                  className={
                    activity.status === "completed"
                      ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
                      : activity.status === "cancelled"
                        ? "bg-red-500/15 text-red-700 dark:bg-red-900 dark:text-red-200"
                        : "bg-amber-500/15 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
                  }
                >
                  {activity.status === "completed" ? "Zakończone" : activity.status === "cancelled" ? "Anulowane" : "Oczekujące"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Informacje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.contactId && (
              <Link
                href={`/a/contacts/${activity.contactId}`}
                className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Kontakt
                </span>
                <span className="text-sm text-foreground">Zobacz</span>
              </Link>
            )}
            {activity.dealId && (
              <Link
                href={`/a/deals/${activity.dealId}`}
                className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  Oferta
                </span>
                <span className="text-sm text-foreground">Zobacz</span>
              </Link>
            )}
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                Termin
              </span>
              <span className="text-sm text-foreground">
                {activity.dueDate
                  ? new Date(activity.dueDate).toLocaleDateString("pl-PL")
                  : "Brak"}
              </span>
            </div>
            {activity.completedAt && (
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Zakończono
                </span>
                <span className="text-sm text-foreground">
                  {new Date(activity.completedAt).toLocaleDateString("pl-PL")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Opis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.description ? (
              <p className="text-sm text-foreground whitespace-pre-wrap">{activity.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Brak opisu</p>
            )}
          </CardContent>
        </Card>
      </div>

      <QuickLinks
        links={[
          { href: "/a/activities", label: "Aktywności", icon: CalendarClock },
          { href: "/a/tasks", label: "Zadania", icon: CheckCircle2 },
          { href: "/a/timeline", label: "Os czasu", icon: ArrowRight },
        ]}
      />
    </div>
  );
}
