"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Database,
  Shield,
  Rocket,
  Globe,
  Sparkles,
} from "lucide-react";

const roadmap = [
  {
    icon: Bot,
    title: "Agent AI (zaawansowany)",
    status: "W przygotowaniu",
    desc: "Autonomiczny agent AI do kwalifikacji leadów, podsumowań rozmów, generowania ofert i przewidywania szans sprzedaży. Wykorzysta modele językowe z pamięcią kontekstu klienta.",
  },
  {
    icon: Database,
    title: "PostgreSQL w produkcji",
    status: "Planowane",
    desc: "SQLite służy wyłącznie celom demonstracyjnym. W środowisku produkcyjnym aplikacja korzysta z klastra PostgreSQL klasy enterprise — replikacja multi-region, automatyczny failover, connection pooling i kopie zapasowe point-in-time.",
  },
  {
    icon: Globe,
    title: "Multi-region",
    status: "Planowane",
    desc: "Rozmieszczenie geograficzne z replikami odczytu w wielu regionach, niskie opóźnienia i zgodność z RODO (rezydencja danych).",
  },
  {
    icon: Sparkles,
    title: "Automatyzacje workflow",
    status: "Planowane",
    desc: "Reguły automatyzacji: wyzwalacze, sekwencje e-mail, zadania warunkowe i integracje webhook.",
  },
];

export default function AboutPage() {
  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">O systemie</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Informacje o architekturze i planach rozwoju
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Bezpieczeństwo klasy enterprise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aplikacja projektowana zgodnie z OWASP i zasadą defense-in-depth:
            sesje bazodanowe w cookie HTTP-only, hashowanie haseł, ochrona CSRF,
            nagłówki bezpieczeństwa, walidacja Zod na każdej granicy zaufania oraz
            izolacja danych per użytkownik (row-level scoping).
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Plan rozwoju
        </h2>
        <div className="space-y-4">
          {roadmap.map((item) => (
            <Card key={item.title} className="border-border bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground flex items-center gap-2 text-base">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    {item.title}
                  </CardTitle>
                  <Badge className="bg-amber-500/15 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                    {item.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground">
            Wersja demonstracyjna · Dane generowane automatycznie · Baza SQLite
            wyłącznie do celów prezentacyjnych
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
