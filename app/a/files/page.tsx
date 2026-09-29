"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FolderOpen,
  Upload,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Trash2,
  Download,
} from "lucide-react";

type FileType = "document" | "image" | "spreadsheet";

interface CrmFile {
  id: string;
  name: string;
  type: FileType;
  size: string;
  uploadedAt: string;
}

const fileIcons: Record<FileType, typeof FileText> = {
  document: FileText,
  image: ImageIcon,
  spreadsheet: FileSpreadsheet,
};

const fileLabels: Record<FileType, string> = {
  document: "Dokument",
  image: "Obraz",
  spreadsheet: "Arkusz",
};

export default function FilesPage() {
  const [files, setFiles] = useState<CrmFile[]>([]);
  const [search, setSearch] = useState("");

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = () => {
    toast.info("Przesyłanie plików będzie dostępne wkrótce");
  };

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast.success("Plik usunięty");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pliki</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {files.length} plików
          </p>
        </div>
        <Button onClick={handleUpload} className="cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          Prześlij plik
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Input
          placeholder="Szukaj plików..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10"
        />
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Wszystkie pliki
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">Brak plików</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Prześlij pierwszy plik, aby rozpocząć
              </p>
              <Button
                variant="link"
                onClick={handleUpload}
                className="text-foreground cursor-pointer mt-2"
              >
                Prześlij plik
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((file) => {
                const Icon = fileIcons[file.type];
                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fileLabels[file.type]} · {file.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-muted text-muted-foreground">
                        {new Date(file.uploadedAt).toLocaleDateString("pl-PL")}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                        aria-label="Pobierz plik"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(file.id)}
                        className="text-muted-foreground hover:text-red-500 cursor-pointer"
                        aria-label="Usuń plik"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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