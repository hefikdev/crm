"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, User, Building2, DollarSign, CalendarClock } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

const actions = [
  { key: "C", label: "Nowy kontakt", icon: User, href: "/a/contacts/new", color: "text-blue-400" },
  { key: "F", label: "Nowa firma", icon: Building2, href: "/a/companies/new", color: "text-emerald-400" },
  { key: "O", label: "Nowa oferta", icon: DollarSign, href: "/a/deals/new", color: "text-amber-400" },
  { key: "A", label: "Nowa aktywność", icon: CalendarClock, href: "/a/activities/new", color: "text-purple-400" },
];

export function QuickCreateModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"contact" | "deal" | "activity">("contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const createContact = trpc.contacts.create.useMutation({
    onSuccess: (data) => {
      toast.success("Kontakt utworzony");
      setOpen(false);
      reset();
      router.push(`/a/contacts/${data.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const createDeal = trpc.deals.create.useMutation({
    onSuccess: (data) => {
      toast.success("Oferta utworzona");
      setOpen(false);
      reset();
      router.push(`/a/deals/${data.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const createActivity = trpc.activities.create.useMutation({
    onSuccess: () => {
      toast.success("Aktywność utworzona");
      setOpen(false);
      reset();
      router.push("/a/activities");
    },
    onError: (err) => toast.error(err.message),
  });

  const reset = () => {
    setName("");
    setEmail("");
    setValue("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nazwa jest wymagana");
      return;
    }

    if (type === "contact") {
      createContact.mutate({
        firstName: name.split(" ")[0] || name,
        lastName: name.split(" ").slice(1).join(" ") || "",
        email: email || "",
        phone: "",
        position: "",
        companyId: "",
        tags: [],
        notes: "",
        status: "active",
        source: "other",
      });
    } else if (type === "deal") {
      createDeal.mutate({
        title: name,
        value: Number(value) || 0,
        currency: "PLN",
        stage: "lead",
        probability: 10,
        expectedCloseDate: "",
        contactId: "",
        companyId: "",
        notes: "",
        tags: [],
      });
    } else {
      createActivity.mutate({
        type: "task",
        title: name,
        description: "",
        status: "pending",
        dueDate: "",
        contactId: "",
        dealId: "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer w-full"
          />
        }
      >
        <Plus className="h-4 w-4 mr-2" />
        Szybkie dodawanie
      </DialogTrigger>
      <DialogContent className="bg-popover border-border text-popover-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Szybkie dodawanie</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground/80">Typ</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as typeof type)}
            >
              <SelectTrigger className="border-border bg-muted text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="contact">Kontakt</SelectItem>
                <SelectItem value="deal">Oferta</SelectItem>
                <SelectItem value="activity">Aktywność</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground/80">
              {type === "contact"
                ? "Imię i nazwisko"
                : type === "deal"
                  ? "Nazwa oferty"
                  : "Tytuł aktywności"}
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                type === "contact"
                  ? "Jan Kowalski"
                  : type === "deal"
                    ? "Sprzedaż produktu X"
                    : "Spotkanie z klientem"
              }
              className="border-border bg-muted text-foreground"
              autoFocus
            />
          </div>
          {type === "contact" && (
            <div className="space-y-2">
              <Label className="text-foreground/80">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jan@example.com"
                className="border-border bg-muted text-foreground"
              />
            </div>
          )}
          {type === "deal" && (
            <div className="space-y-2">
              <Label className="text-foreground/80">Wartość (PLN)</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="10000"
                className="border-border bg-muted text-foreground"
              />
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-border text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              disabled={createContact.isPending || createDeal.isPending || createActivity.isPending}
            >
              {(createContact.isPending || createDeal.isPending || createActivity.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Utwórz"
              )}
            </Button>
          </div>
        </form>

        <div className="border-t border-border pt-4 mt-2">
          <p className="text-xs text-muted-foreground mb-2">Szybkie przejścia</p>
          <div className="grid grid-cols-2 gap-2">
            {actions.map((action) => (
              <Button
                key={action.key}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  router.push(action.href);
                }}
                className="justify-start text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
              >
                <action.icon className={`h-3.5 w-3.5 mr-2 ${action.color}`} />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}