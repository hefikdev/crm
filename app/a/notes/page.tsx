"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  Search,
  Trash2,
  Loader2,
  Save,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("note");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = trpc.activities.list.useQuery({
    status: "all",
    type: "note",
    limit: 50,
  });

  const createNote = trpc.activities.create.useMutation({
    onSuccess: () => {
      toast.success("Notatka utworzona");
      setTitle("");
      setDescription("");
      setShowForm(false);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateNote = trpc.activities.update.useMutation({
    onSuccess: () => {
      toast.success("Notatka zaktualizowana");
      setTitle("");
      setDescription("");
      setEditingId(null);
      setShowForm(false);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteNote = trpc.activities.delete.useMutation({
    onSuccess: () => {
      toast.success("Notatka usunięta");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // Since we filter type=note, and the list router may not have freeform search for notes
  // we filter client-side
  const filteredNotes =
    data?.data.filter(
      (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        (n.description ?? "").toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Tytuł jest wymagany");
      return;
    }
    const payload = {
      type: "note" as const,
      title,
      description: description || "",
      status: "completed" as const,
      dueDate: "",
      contactId: "",
      dealId: "",
    };

    if (editingId) {
      updateNote.mutate({ id: editingId, data: payload });
    } else {
      createNote.mutate(payload);
    }
  };

  const handleEdit = (note: (typeof filteredNotes)[0]) => {
    setTitle(note.title);
    setDescription(note.description ?? "");
    setEditingId(note.id);
    setShowForm(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notatki</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filteredNotes.length} notatek
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setTitle("");
            setDescription("");
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Anuluj" : "Nowa notatka"}
        </Button>
      </div>

      {showForm && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">
              {editingId ? "Edytuj notatkę" : "Nowa notatka"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground/80">Tytuł</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tytuł notatki"
                className="bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">Treść</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Treść notatki..."
                className="border-border bg-muted text-foreground min-h-[200px]"
              />
            </div>
            <Button
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              disabled={createNote.isPending || updateNote.isPending}
            >
              {(createNote.isPending || updateNote.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {editingId ? "Zapisz zmiany" : "Utwórz notatkę"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Szukaj notatek..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 border-border bg-muted text-foreground placeholder:text-muted-foreground/70"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 bg-accent" />
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">Brak notatek</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className="border-border bg-card hover:bg-muted transition-colors cursor-pointer"
              onClick={() => handleEdit(note)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-foreground truncate">
                    {note.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-400 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Usunąć notatkę?")) deleteNote.mutate({ id: note.id });
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {note.description ?? "Brak treści"}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-2">
                  {new Date(note.createdAt).toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}