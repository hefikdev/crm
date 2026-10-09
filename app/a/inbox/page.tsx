"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Mail, Send, Plus, Search, ArrowLeft, Users, FileText, CalendarClock } from "lucide-react";
import { QuickLinks } from "@/components/crm/quick-links";
import { useRouter } from "next/navigation";

export default function InboxPage() {
  const router = useRouter();
  const [view, setView] = useState<"list" | "compose">("list");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("email");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading, refetch } = trpc.activities.list.useQuery({
    type: "email",
    limit: 50,
  });

  const createMessage = trpc.activities.create.useMutation({
    onSuccess: () => {
      toast.success("Wiadomość utworzona");
      setTitle("");
      setDescription("");
      setView("list");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredMessages =
    data?.data.filter(
      (m) =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        (m.description ?? "").toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const handleSend = () => {
    if (!title.trim()) {
      toast.error("Temat jest wymagany");
      return;
    }
    createMessage.mutate({
      type: "email",
      title,
      description: description || "",
      status: "pending",
      dueDate: "",
      contactId: "",
      dealId: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wiadomości</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filteredMessages.length} wiadomości
          </p>
        </div>
        <Button
          onClick={() => setView(view === "compose" ? "list" : "compose")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          {view === "compose" ? (
            <>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Nowa wiadomość
            </>
          )}
        </Button>
      </div>

      {view === "compose" ? (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Nowa wiadomość</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground/80">Temat</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Temat wiadomości"
                className="bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">Typ</Label>
              <Select value={type} onValueChange={(v) => setType(v ?? "email")}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="note">Notatka wewnętrzna</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">Treść</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Treść wiadomości..."
                className="border-border bg-muted text-foreground min-h-[200px]"
              />
            </div>
            <Button
              onClick={handleSend}
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              disabled={createMessage.isPending}
            >
              {createMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Wyślij
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj wiadomości..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-border bg-muted text-foreground placeholder:text-muted-foreground/70"
            />
          </div>

          <Card className="border-border bg-card">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 bg-accent" />
                  ))}
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Brak wiadomości</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => router.push(`/a/activities/${msg.id}`)}
                      className="flex items-center gap-3 p-4 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground truncate">
                            {msg.title}
                          </p>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {new Date(msg.createdAt).toLocaleDateString("pl-PL")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {msg.description ?? "Brak treści"}
                        </p>
                      </div>
                      <Badge
                        className={
                          msg.status === "completed"
                            ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
                            : "bg-accent text-foreground/80"
                        }
                      >
                        {msg.status === "completed" ? "Wysłane" : "Szkic"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <QuickLinks
        links={[
          { href: "/a/contacts", label: "Kontakty", icon: Users },
          { href: "/a/notes", label: "Notatki", icon: FileText },
          { href: "/a/activities", label: "Aktywności", icon: CalendarClock },
        ]}
      />
    </div>
  );
}