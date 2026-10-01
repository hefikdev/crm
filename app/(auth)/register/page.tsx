"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (error) {
        toast.error(error.message ?? "Rejestracja nie powiodła się");
        return;
      }

      toast.success("Konto utworzone!");
      router.push("/a");
    } catch {
      toast.error("Wystąpił nieoczekiwany błąd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-white">Utwórz konto</CardTitle>
          <CardDescription className="text-zinc-400">
            Wprowadź dane aby rozpocząć
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">Imię i nazwisko</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jan Kowalski"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Hasło</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600"
              />
              <p className="text-xs text-zinc-500">
                Minimum 8 znaków, duża litera, mała litera i cyfra
              </p>
            </div>
            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-zinc-200 cursor-pointer"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Utwórz konto"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-zinc-500">
            Masz już konto?{" "}
            <Link href="/login" className="text-white hover:underline">
              Zaloguj się
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}