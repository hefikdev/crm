"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        toast.error(error.message ?? "Nieprawidłowe dane logowania");
        return;
      }

      toast.success("Witaj ponownie!");
      const redirect = searchParams.get("redirect") ?? "/a";
      router.push(redirect);
    } catch {
      toast.error("Wystąpił nieoczekiwany błąd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-zinc-800 bg-zinc-950">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-white">Zaloguj się</CardTitle>
        <CardDescription className="text-zinc-400">
          Wprowadź dane logowania
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-zinc-300">Hasło</Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-white text-black hover:bg-zinc-200 cursor-pointer"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Zaloguj się"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">
          Nie masz konta?{" "}
          <Link href="/register" className="text-white hover:underline">
            Zarejestruj się
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-950">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-white">Zaloguj się</CardTitle>
            <CardDescription className="text-zinc-400">Ładowanie...</CardDescription>
          </CardHeader>
        </Card>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}