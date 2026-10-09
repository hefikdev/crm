"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

const STAGE_LABELS: Record<string, string> = {
  lead: "Początkowe",
  qualified: "Kwalifikowane",
  proposal: "Oferta",
  negotiation: "Negocjacje",
  closed_won: "Zrealizowane",
  closed_lost: "Utracone",
};

const STAGE_COLORS: Record<string, string> = {
  lead: "#a1a1aa",
  qualified: "#60a5fa",
  proposal: "#fbbf24",
  negotiation: "#a855f7",
  closed_won: "#10b981",
  closed_lost: "#ef4444",
};

const SOURCE_LABELS: Record<string, string> = {
  referral: "Polecenie",
  website: "Strona WWW",
  email: "E-mail",
  phone: "Telefon",
  social: "Social media",
  other: "Inne",
};

const SOURCE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#ec4899", "#71717a"];

export function FinancialCharts() {
  const { data, isLoading } = trpc.dashboard.getAnalytics.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-72 bg-accent" />
        ))}
      </div>
    );
  }

  const monthly = data?.monthlyData ?? [];
  const stageData = Object.entries(data?.stageDistribution ?? {}).map(([stage, count]) => ({
    name: STAGE_LABELS[stage] ?? stage,
    value: count as number,
    color: STAGE_COLORS[stage] ?? "#71717a",
  }));
  const sourceData = Object.entries(data?.sourceBreakdown ?? {}).map(([source, count], i) => ({
    name: SOURCE_LABELS[source] ?? source,
    value: count as number,
    color: SOURCE_COLORS[i % SOURCE_COLORS.length],
  }));

  const totalWon = monthly.reduce((sum, m) => sum + m.won, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="border-border bg-card lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Przychód miesięczny
          </CardTitle>
          <span className="text-sm font-semibold text-emerald-500 tabular-nums">
            {totalWon.toLocaleString()} PLN
          </span>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthly} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${Math.round((v as number) / 1000)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(v) => [`${Number(v).toLocaleString()} PLN`, "Zrealizowane"]}
                cursor={{ fill: "hsl(var(--accent))", opacity: 0.4 }}
              />
              <Bar dataKey="won" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Oferty wg etapu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={stageData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                stroke="none"
              >
                {stageData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border bg-card lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Źródła kontaktów
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sourceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={85}
                paddingAngle={2}
                stroke="none"
                label={(props) => `${props.name ?? ""}: ${props.value ?? 0}`}
                labelLine={false}
              >
                {sourceData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
