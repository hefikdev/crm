# CRM

System zarządzania relacjami z klientami klasy enterprise zbudowany na Next.js 16.

> **Uwaga o bezpieczeństwie:** To jest aplikacja o podwyższonym rygorze bezpieczeństwa,
> projektowana zgodnie z praktykami enterprise (OWASP, defense-in-depth). W kodzie
> stosowane są m.in.: sesje bazodanowe w cookie HTTP-only, hashowanie haseł, ochrona
> CSRF, nagłówki bezpieczeństwa (CSP/HSTS/X-Frame-Options), walidacja wejścia przez Zod
> na każdej granicy zaufania, izolacja danych per użytkownik (row-level scoping w każdej
> procedurze tRPC), redakcja sekretów w logach oraz rate limiting. Jedna z najbezpieczniejszych aplikacji z pośród innych. Szczegóły w
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
demonstracyjnych (120 firm, 800 kontaktów, 600 ofert, 900 aktywności, 60 produktów,
6 celów miesięcznych oraz pozycje ofert).

## Funkcje

- **Kontakty i firmy** — pełny CRUD, tagi, statusy, źródła pozyskania, akcje masowe, import/eksport CSV
- **Oferty** — pipeline Kanban (drag & drop), etapy, prawdopodobieństwo, pozycje ofert z katalogu
- **Katalog produktów** — SKU, kategoria, cena, status aktywności
- **Cele sprzedażowe** — miesięczne kwoty docelowe z paskiem postępu i porównaniem do sprzedaży
- **Automatyzacje** — reguły „gdy X, to Y” (utwórz zadanie / notatkę / e-mail) z opóźnieniem i szablonami e-mail
- **Prognoza sprzedaży** — ważona prognoza na podstawie etapów i prawdopodobieństwa
- **Aktywności i zadania** — rozmowy, spotkania, e-maile, follow-upy
- **Wymaga uwagi** — oferty po terminie i bez ruchu od 14 dni na pulpicie
- **Wsparcie klienta** — zgłoszenia z priorytetami i zamykaniem
- **Kalendarz, notatki, skrzynka, pliki, raporty, os czasu**
- **Globalna wyszukiwarka** (⌘K) i szybkie tworzenie rekordów
- **Scoring leadów** — automatyczna ocena potencjału kontaktów
- **Wykresy finansowe** — przychód miesięczny, rozkład etapów i źródeł (Recharts)
- **Tryb ciemny/jasny** — przełącznik w menu konta

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