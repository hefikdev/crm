"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Zap,
  Plus,
  Trash2,
  Loader2,
  Power,
  Mail,
  FileText,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";
import { QuickLinks } from "@/components/crm/quick-links";

const triggerLabels: Record<string, string> = {
  deal_created: "Utworzono ofertę",
  deal_stage_changed: "Zmieniono etap oferty",
  deal_won: "Wygrano ofertę",
  contact_created: "Utworzono kontakt",
};

const actionLabels: Record<string, string> = {
  create_task: "Utwórz zadanie",
  create_note: "Dodaj notatkę",
  send_email: "Wyślij e-mail",
};

const actionIcons: Record<string, typeof Mail> = {
  create_task: ClipboardCheck,
  create_note: FileText,
  send_email: Mail,
};

const stageOptions = [
  { value: "lead", label: "Początkowe" },
  { value: "qualified", label: "Kwalifikowane" },
  { value: "proposal", label: "Oferta" },
  { value: "negotiation", label: "Negocjacje" },
];

export default function AutomationsPage() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("deal_created");
  const [triggerValue, setTriggerValue] = useState("");
  const [action, setAction] = useState("create_task");
  const [actionValue, setActionValue] = useState("");
  const [actionSubject, setActionSubject] = useState("");
  const [delayMinutes, setDelayMinutes] = useState(0);

  const { data: rules, isLoading, refetch } = trpc.automations.list.useQuery();
  const { data: templates } = trpc.automations.listTemplates.useQuery();

  const createRule = trpc.automations.create.useMutation({
    onSuccess: () => {
      toast.success("Automatyzacja utworzona");
      setName("");
      setActionValue("");
      setActionSubject("");
      setTriggerValue("");
      setDelayMinutes(0);
      setShowForm(false);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggle = trpc.automations.toggle.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => toast.error(err.message),
  });

  const remove = trpc.automations.delete.useMutation({
    onSuccess: () => {
      toast.success("Automatyzacja usunięta");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRule.mutate({
      name,
      trigger: trigger as "deal_created" | "deal_stage_changed" | "deal_won" | "contact_created",
      triggerValue: trigger === "deal_stage_changed" ? triggerValue : "",
      action: action as "create_task" | "create_note" | "send_email",
      actionValue,
      actionSubject,
      delayMinutes,
      active: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-6 w-6 text-muted-foreground" />
            Automatyzacje
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Reguły „gdy X, to Y” — {rules?.filter((r) => r.active).length ?? 0} aktywnych
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nowa reguła
        </Button>
      </div>

      {showForm && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Nowa reguła automatyzacji</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Nazwa reguły</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="np. Zadanie po wygraniu oferty"
                  className="bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground/80">Wyzwalacz (gdy...)</Label>
                  <Select value={trigger} onValueChange={(v) => setTrigger(v ?? "deal_created")}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      {Object.entries(triggerLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {trigger === "deal_stage_changed" && (
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Etap docelowy</Label>
                    <Select value={triggerValue} onValueChange={(v) => setTriggerValue(v ?? "")}>
                      <SelectTrigger className="bg-background text-foreground">
                        <SelectValue placeholder="Dowolny etap" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        {stageOptions.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground/80">Akcja (to...)</Label>
                  <Select value={action} onValueChange={(v) => setAction(v ?? "create_task")}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      {Object.entries(actionLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80">Opóźnienie (minuty)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={delayMinutes}
                    onChange={(e) => setDelayMinutes(Number(e.target.value))}
                    className="bg-background text-foreground"
                  />
                </div>
              </div>

              {action === "send_email" && (
                <div className="space-y-2">
                  <Label className="text-foreground/80">Temat e-maila</Label>
                  <Input
                    value={actionSubject}
                    onChange={(e) => setActionSubject(e.target.value)}
                    placeholder="np. Dziękujemy za rozmowę"
                    className="bg-background text-foreground"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-foreground/80">
                  {action === "create_task"
                    ? "Treść zadania"
                    : action === "create_note"
                      ? "Treść notatki"
                      : "Treść e-maila"}
                </Label>
                <Textarea
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  required
                  placeholder="Użyj {{name}} aby wstawić nazwę oferty lub kontaktu"
                  className="bg-background text-foreground min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">
                  Podpowiedź: <code>{"{{name}}"}</code> zostanie zastąpione nazwą oferty lub kontaktu.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  disabled={createRule.isPending}
                >
                  {createRule.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Utwórz regułę
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-border text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Anuluj
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 bg-accent" />
          ))}
        </div>
      ) : !rules || rules.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="text-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">Brak automatyzacji</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Utwórz pierwszą regułę, aby zautomatyzować pracę zespołu.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => {
            const ActionIcon = actionIcons[rule.action] ?? Zap;
            return (
              <Card key={rule.id} className="border-border bg-card">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{rule.name}</p>
                      <Badge
                        className={
                          rule.active
                            ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
                            : "bg-accent text-muted-foreground"
                        }
                      >
                        {rule.active ? "Aktywna" : "Wstrzymana"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        uruchomień: {rule.runCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                      <Badge className="bg-muted text-muted-foreground">
                        {triggerLabels[rule.trigger]}
                        {rule.triggerValue ? ` → ${rule.triggerValue}` : ""}
                      </Badge>
                      <ArrowRight className="h-3 w-3" />
                      <Badge className="bg-muted text-muted-foreground flex items-center gap-1">
                        <ActionIcon className="h-3 w-3" />
                        {actionLabels[rule.action]}
                      </Badge>
                      {rule.delayMinutes > 0 && (
                        <span>· opóźnienie {rule.delayMinutes} min</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggle.mutate({ id: rule.id })}
                      className={
                        rule.active
                          ? "text-emerald-500 hover:text-emerald-400 cursor-pointer"
                          : "text-muted-foreground hover:text-foreground cursor-pointer"
                      }
                      aria-label={rule.active ? "Wstrzymaj" : "Aktywuj"}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Usunąć tę automatyzację?")) remove.mutate({ id: rule.id });
                      }}
                      className="text-muted-foreground hover:text-red-500 cursor-pointer"
                      aria-label="Usuń"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {templates && templates.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Szablony e-mail ({templates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-lg bg-muted"
                >
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.subject}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <QuickLinks
        links={[
          { href: "/a/deals", label: "Oferty", icon: Zap },
          { href: "/a/tasks", label: "Zadania", icon: ClipboardCheck },
          { href: "/a/inbox", label: "Wiadomości", icon: Mail },
        ]}
      />
    </div>
  );
}
