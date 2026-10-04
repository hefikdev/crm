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
import { Loader2, Mail, Send, Plus, Search, ArrowLeft } from "lucide-react";

export default function InboxPage() {
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Wiadomości</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {filteredMessages.length} wiadomości
          </p>
        </div>
        <Button
          onClick={() => setView(view === "compose" ? "list" : "compose")}
          className="bg-white text-black hover:bg-zinc-200 cursor-pointer"
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
        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-white">Nowa wiadomość</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Temat</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Temat wiadomości"
                className="border-zinc-800 bg-zinc-900 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Typ</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="border-zinc-800 bg-zinc-900 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="note">Notatka wewnętrzna</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Treść</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Treść wiadomości..."
                className="border-zinc-800 bg-zinc-900 text-white min-h-[200px]"
              />
            </div>
            <Button
              onClick={handleSend}
              className="bg-white text-black hover:bg-zinc-200 cursor-pointer"
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Szukaj wiadomości..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600"
            />
          </div>

          <Card className="border-zinc-800 bg-zinc-950">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 bg-zinc-800" />
                  ))}
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500">Brak wiadomości</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="flex items-center gap-3 p-4 hover:bg-zinc-900 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4 text-zinc-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white truncate">
                            {msg.title}
                          </p>
                          <span className="text-xs text-zinc-500 shrink-0 ml-2">
                            {new Date(msg.createdAt).toLocaleDateString("pl-PL")}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                          {msg.description ?? "Brak treści"}
                        </p>
                      </div>
                      <Badge
                        className={
                          msg.status === "completed"
                            ? "bg-emerald-900 text-emerald-200"
                            : "bg-zinc-800 text-zinc-300"
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
    </div>
  );
}