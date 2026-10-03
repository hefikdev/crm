"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { LogOut, User, Shield } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    toast.success("Wylogowano");
    router.push("/login");
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Ustawienia</h1>
        <p className="text-zinc-500 text-sm mt-1">Zarządzaj kontem</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-4 w-4" />
            Konto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-400">
            Jesteś zalogowany przez e-mail.
          </p>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Wyloguj się
          </Button>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Bezpieczeństwo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-400">
            Zarządzanie sesjami, polityka haseł i nagłówki bezpieczeństwa skonfigurowane na poziomie infrastruktury.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}