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
  lead: "bg-zinc-800 text-zinc-300",
  qualified: "bg-blue-900 text-blue-200",
  proposal: "bg-amber-900 text-amber-200",
  negotiation: "bg-purple-900 text-purple-200",
  closed_won: "bg-emerald-900 text-emerald-200",
  closed_lost: "bg-red-900 text-red-200",
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
  const updateDeal = trpc.deals.update.useMutation({
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
      updateDeal.mutate({
        id: dealId,
        data: { stage: targetStage as any, title: "", value: 0, probability: 0, tags: [] },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-96 bg-zinc-800" />
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
          <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  {stageLabels[column.stage] ?? column.stage}
                </CardTitle>
                <span className="text-xs text-zinc-500">{column.deals.length}</span>
              </div>
              <p className="text-xs text-zinc-600">{column.total.toLocaleString()} PLN</p>
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
                  className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer"
                >
                  <p className="text-sm font-medium text-white truncate">{deal.title}</p>
                  <p className="text-xs text-zinc-400 mt-1">{deal.value.toLocaleString()} PLN</p>
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
                className="w-full text-zinc-500 hover:text-white hover:bg-zinc-800 cursor-pointer"
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