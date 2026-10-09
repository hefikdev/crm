"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Plus } from "lucide-react";

const stageColors: Record<string, string> = {
  lead: "bg-accent text-foreground/80",
  qualified: "bg-blue-500/15 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  proposal: "bg-amber-500/15 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  negotiation: "bg-purple-500/15 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
  closed_won: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  closed_lost: "bg-red-500/15 text-red-700 dark:bg-red-900 dark:text-red-200",
};

const stageLabels: Record<string, string> = {
  lead: "Początkowe",
  qualified: "Kwalifikowane",
  proposal: "Oferta",
  negotiation: "Negocjacje",
  closed_won: "Zrealizowane",
  closed_lost: "Utracone",
};

export function KanbanBoard() {
  const router = useRouter();
  const { data: pipeline, isLoading, refetch } = trpc.deals.getPipeline.useQuery();
  const updateStage = trpc.deals.updateStage.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => toast.error(err.message),
  });

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId);
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("dealId");
    if (dealId) {
      updateStage.mutate({
        id: dealId,
        stage: targetStage as "lead" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-96 bg-accent" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-6 gap-3 overflow-x-auto pb-4">
      {pipeline?.map((column) => (
        <div
          key={column.stage}
          className="min-w-[200px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, column.stage)}
        >
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stageLabels[column.stage] ?? column.stage}
                </CardTitle>
                <span className="text-xs text-muted-foreground">{column.deals.length}</span>
              </div>
              <p className="text-xs text-muted-foreground/70">{column.total.toLocaleString()} PLN</p>
            </CardHeader>
            <CardContent className="space-y-2 min-h-[200px]">
              {column.deals.map((deal) => (
                <motion.div
                  key={deal.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  draggable
                  onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, deal.id)}
                  onClick={() => router.push(`/a/deals/${deal.id}`)}
                  className="p-3 rounded-lg bg-muted border border-border hover:border-border transition-colors cursor-pointer"
                >
                  <p className="text-sm font-medium text-foreground truncate">{deal.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{deal.value.toLocaleString()} PLN</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge className={stageColors[deal.stage]}>
                      {deal.probability}%
                    </Badge>
                  </div>
                </motion.div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/a/deals/new")}
                className="w-full text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
              >
                <Plus className="h-3 w-3 mr-1" />
                Dodaj
              </Button>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}