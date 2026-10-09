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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ustawienia</h1>
        <p className="text-muted-foreground text-sm mt-1">Zarządzaj kontem</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            Konto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Jesteś zalogowany przez e-mail.
          </p>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="border-border text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Wyloguj się
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Bezpieczeństwo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Zarządzanie sesjami, polityka haseł i nagłówki bezpieczeństwa skonfigurowane na poziomie infrastruktury.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}