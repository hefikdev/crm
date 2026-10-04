"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  CheckCircle2,
  Clock,
  CalendarClock,
  Filter,
} from "lucide-react";

const typeColors: Record<string, string> = {
  task: "bg-emerald-900 text-emerald-200",
  call: "bg-blue-900 text-blue-200",
  email: "bg-amber-900 text-amber-200",
  meeting: "bg-purple-900 text-purple-200",
  follow_up: "bg-rose-900 text-rose-200",
  note: "bg-zinc-800 text-zinc-300",
};

export default function TasksPage() {
  const router = useRouter();
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("pending");

  const { data, isLoading, refetch } = trpc.activities.list.useQuery({
    type: filterType !== "all" ? filterType : undefined,
    status: filterStatus,
    limit: 50,
  });

  const completeTask = trpc.activities.complete.useMutation({
    onSuccess: () => {
      toast.success("Zadanie zakończone");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const pendingCount = data?.data.filter((a) => a.status === "pending").length ?? 0;
  const overdueCount =
    data?.data.filter(
      (a) => a.status === "pending" && a.dueDate && new Date(a.dueDate) < new Date()
    ).length ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Zadania</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {pendingCount} oczekujących
            {overdueCount > 0 && (
              <span className="text-red-400 ml-2">
                · {overdueCount} po terminie
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={() => router.push("/a/activities/new")}
          className="bg-white text-black hover:bg-zinc-200 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Dodaj zadanie
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white text-sm cursor-pointer"
          >
            <option value="pending">Oczekujące</option>
            <option value="completed">Zakończone</option>
            <option value="all">Wszystkie</option>
          </select>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white text-sm cursor-pointer"
        >
          <option value="all">Wszystkie typy</option>
          <option value="task">Zadania</option>
          <option value="call">Telefony</option>
          <option value="email">E-maile</option>
          <option value="meeting">Spotkania</option>
          <option value="follow_up">Follow-up</option>
        </select>
      </div>

      <Card className="border-zinc-800 bg-zinc-950">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 bg-zinc-800" />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-12">
              <CalendarClock className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">Brak zadań</p>
              <Button
                variant="link"
                onClick={() => router.push("/a/activities/new")}
                className="text-white cursor-pointer"
              >
                Utwórz pierwsze zadanie
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {data?.data.map((task) => {
                const isOverdue =
                  task.status === "pending" &&
                  task.dueDate &&
                  new Date(task.dueDate) < new Date();

                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 transition-colors ${
                      task.status === "completed"
                        ? "bg-zinc-900/50"
                        : "hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => {
                          if (task.status === "pending") {
                            completeTask.mutate({ id: task.id });
                          }
                        }}
                        className={"shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer " + (task.status === "completed"
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-zinc-600 hover:border-emerald-500")}
                      >
                        {task.status === "completed" && (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            task.status === "completed"
                              ? "text-zinc-500 line-through"
                              : "text-white"
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                          <Badge className={typeColors[task.type] ?? "bg-zinc-800 text-zinc-300"}>
                            {task.type === "call"
                              ? "Telefon"
                              : task.type === "email"
                                ? "E-mail"
                                : task.type === "meeting"
                                  ? "Spotkanie"
                                  : task.type === "task"
                                    ? "Zadanie"
                                    : task.type === "follow_up"
                                      ? "Follow-up"
                                      : "Notatka"}
                          </Badge>
                          {task.dueDate && (
                            <span
                              className={`flex items-center gap-1 ${
                                isOverdue ? "text-red-400" : "text-zinc-500"
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString("pl-PL")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {task.status === "pending" && (
                      <Badge
                        className={
                          isOverdue
                            ? "bg-red-900 text-red-200"
                            : "bg-zinc-800 text-zinc-300"
                        }
                      >
                        {isOverdue ? "Po terminie" : "Oczekuje"}
                      </Badge>
                    )}
                    {task.status === "completed" && task.completedAt && (
                      <span className="text-xs text-zinc-600">
                        {new Date(task.completedAt).toLocaleDateString("pl-PL")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}