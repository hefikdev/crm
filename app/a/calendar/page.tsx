"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, ClipboardCheck, CalendarClock, History } from "lucide-react";
import { QuickLinks } from "@/components/crm/quick-links";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  call: "bg-blue-500",
  email: "bg-amber-500",
  meeting: "bg-purple-500",
  task: "bg-emerald-500",
  note: "bg-zinc-500",
  follow_up: "bg-rose-500",
};

const typeLabels: Record<string, string> = {
  call: "Telefon",
  email: "E-mail",
  meeting: "Spotkanie",
  task: "Zadanie",
  note: "Notatka",
  follow_up: "Follow-up",
};

const monthNames = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];

const dayNames = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

export default function CalendarPage() {
  const router = useRouter();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const { data: activities, isLoading } = trpc.activities.list.useQuery({
    limit: 100,
  });

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = (firstDay.getDay() + 6) % 7;

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getActivitiesForDay = (day: number) => {
    if (!activities?.data) return [];
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return activities.data.filter((a) => {
      if (a.dueDate) return a.dueDate.startsWith(dateStr);
      const created = new Date(a.createdAt);
      return (
        created.getDate() === day &&
        created.getMonth() === currentMonth &&
        created.getFullYear() === currentYear
      );
    });
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kalendarz</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {monthNames[currentMonth]} {currentYear}
          </p>
        </div>
        <Button
          onClick={() => router.push("/a/activities/new")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Dodaj wydarzenie
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevMonth}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {monthNames[currentMonth]} {currentYear}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 bg-accent" />
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs text-muted-foreground font-medium py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-24 rounded-lg bg-muted/50" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayActivities = getActivitiesForDay(day);
                  const isToday = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` === todayStr;

                  return (
                    <div
                      key={day}
                      className={cn(
                        "min-h-24 p-1 rounded-lg border transition-colors",
                        isToday
                          ? "border-white bg-muted"
                          : "border-border bg-card hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center justify-center mb-1">
                        <span
                          className={cn(
                            "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                            isToday ? "bg-white text-black" : "text-muted-foreground"
                          )}
                        >
                          {day}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {dayActivities.slice(0, 3).map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-center gap-1 px-1 py-0.5 rounded cursor-pointer hover:bg-accent"
                            onClick={() => router.push("/a/activities")}
                          >
                            <div
                              className={cn(
                                "h-1.5 w-1.5 rounded-full shrink-0",
                                typeColors[activity.type] ?? "bg-zinc-500"
                              )}
                            />
                            <span className="text-[10px] text-foreground/80 truncate">
                              {activity.title}
                            </span>
                          </div>
                        ))}
                        {dayActivities.length > 3 && (
                          <p className="text-[10px] text-muted-foreground text-center">
                            +{dayActivities.length - 3} więcej
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nadchodzące aktywności
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32 bg-accent" />
          ) : activities?.data.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Brak aktywności w tym miesiącu
            </p>
          ) : (
            <div className="space-y-2">
              {activities?.data
                .filter((a) => a.status === "pending")
                .slice(0, 10)
                .map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => router.push("/a/activities")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          typeColors[activity.type] ?? "bg-zinc-500"
                        )}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {typeLabels[activity.type] ?? activity.type}
                          {activity.dueDate &&
                            ` · ${new Date(activity.dueDate).toLocaleDateString("pl-PL")}`}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        activity.status === "pending"
                          ? "bg-accent text-foreground/80"
                          : "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
                      }
                    >
                      {activity.status === "pending" ? "Oczekuje" : "Zakończone"}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <QuickLinks
        links={[
          { href: "/a/tasks", label: "Zadania", icon: ClipboardCheck },
          { href: "/a/activities", label: "Aktywności", icon: CalendarClock },
          { href: "/a/timeline", label: "Os czasu", icon: History },
        ]}
      />
    </div>
  );
}