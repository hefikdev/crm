# CRM

System zarządzania relacjami z klientami klasy enterprise zbudowany na Next.js 16.

> **Uwaga o bezpieczeństwie:** To jest aplikacja o podwyższonym rygorze bezpieczeństwa,
> projektowana zgodnie z praktykami enterprise (OWASP, defense-in-depth). W kodzie
> stosowane są m.in.: sesje bazodanowe w cookie HTTP-only, hashowanie haseł, ochrona
> CSRF, nagłówki bezpieczeństwa (CSP/HSTS/X-Frame-Options), walidacja wejścia przez Zod
> na każdej granicy zaufania, izolacja danych per użytkownik (row-level scoping w każdej
> procedurze tRPC), redakcja sekretów w logach oraz rate limiting. Szczegóły w
> [ARCHITECTURE.md](./ARCHITECTURE.md).

## Pierwsze kroki

```bash
# Instalacja zależności
npm install

# Konfiguracja środowiska
cp .env.example .env
# Edytuj .env z własnymi sekretami

# Uruchom serwer deweloperski
npm run dev
```

Migracje i dane demonstracyjne uruchamiają się **automatycznie** przy starcie serwera
(`instrumentation.ts`). Baza jest tworzona od zera, jeśli nie istnieje.

### Konto demo

```
Email:    demo@crm.app
Hasło:    Demo1234
```

Każde nowo zarejestrowane konto automatycznie otrzymuje własny zestaw danych
demonstracyjnych (60 firm, 400 kontaktów, 300 ofert, 400 aktywności).

## Stack technologiczny

- Next.js 16 (App Router)
- TypeScript (strict)
- tRPC API
- Drizzle ORM (SQLite)
- Better Auth
- shadcn/ui
- TanStack Query
- Pino logging

## Struktura projektu

Zobacz [ARCHITECTURE.md](./ARCHITECTURE.md) po pełną dokumentację.

## Skrypty

- `npm run dev` - Serwer deweloperski
- `npm run build` - Build produkcyjny
- `npm run start` - Serwer produkcyjny
- `npm run lint` - ESLint
- `npm run db:generate` - Generuj migracje Drizzle
- `npm run db:migrate` - Uruchom migracje
- `npm run db:push` - Push schematu do bazy
- `npm run db:seed` - Zasiej dane demonstracyjne