# CRM - System Zarządzania Relacjami z Klientami

## Przegląd Architektury

Profesjonalny system CRM zbudowany na Next.js 16, tRPC, Drizzle ORM i Better Auth.

## Stack Technologiczny

- **Frontend**: Next.js 16 (App Router), TypeScript, React Server Components, Turbopack
- **UI**: shadcn/ui, Lucide Icons, Tailwind CSS v4
- **Stan**: TanStack Query, tRPC
- **Backend**: tRPC, Server Actions, walidacja Zod
- **Auth**: Better Auth (sesje bazodanowe)
- **Baza danych**: SQLite (dev), Drizzle ORM z migracjami
- **Logowanie**: Pino (strukturalne logi JSON)
- **Animacje**: Motion (subtle animacje)

## Struktura folderów

```
├── app/
│   ├── (auth)/           # Strony autoryzacji (logowanie, rejestracja)
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── a/                # Trasy autoryzowane
│   │   ├── layout.tsx    # Layout CRM z sidebar
│   │   ├── page.tsx      # Panel główny
│   │   ├── contacts/     # CRUD kontaktów
│   │   ├── companies/    # CRUD firm
│   │   ├── deals/        # Oferty i pipeline
│   │   ├── activities/   # Aktywności i zadania
│   │   └── settings/     # Ustawienia konta
│   ├── api/
│   │   ├── auth/         # Better Auth API
│   │   └── trpc/         # tRPC API
│   ├── layout.tsx        # Główny layout
│   └── page.tsx          # Strona główna
├── components/
│   ├── crm/              # Komponenty CRM
│   │   ├── sidebar.tsx
│   │   ├── kanban-board.tsx
│   │   ├── activity-timeline.tsx
│   │   └── dashboard-charts.tsx
│   └── ui/               # shadcn/ui komponenty
├── db/
│   ├── schema/           # Schematy Drizzle
│   │   ├── auth.ts       # Użytkownicy, sesje, konta
│   │   ├── contacts.ts   # Kontakty
│   │   ├── companies.ts  # Firmy
│   │   ├── deals.ts      # Pipeline ofert
│   │   └── activities.ts # Aktywności/zadania
│   └── index.ts          # Połączenie z bazą
├── lib/
│   ├── auth.ts           # Konfiguracja Better Auth
│   ├── auth-client.ts    # Klient auth (przeglądarka)
│   ├── logger.ts         # Logger Pino
│   ├── user.ts           # Funkcje użytkownika
│   ├── utils.ts          # Funkcje pomocnicze (cn)
│   ├── validations.ts    # Schematy Zod
│   └── trpc/
│       ├── client.ts     # Klient tRPC
│       └── provider.tsx  # Provider tRPC
├── server/
│   ├── trpc.ts           # Konfiguracja tRPC
│   └── routers/          # Handlery tRPC
│       ├── index.ts      # Agregacja routerów
│       ├── contacts.ts
│       ├── companies.ts
│       ├── deals.ts
│       ├── activities.ts
│       └── dashboard.ts
├── middleware.ts          # Next.js middleware
├── drizzle.config.ts     # Konfiguracja Drizzle Kit
├── .env                  # Zmienne środowiskowe
├── ARCHITECTURE.md       # Ten plik
└── README.md
```

## Architektura bazy danych

### Schemat

- **Użytkownicy i Auth**: Osobne tabele dla użytkowników, sesji, kont i weryfikacji
- **Kontakty**: Główna encja CRM z relacją do firmy, śledzeniem statusu i źródłem
- **Firmy**: Rekordy organizacji z klasyfikacją branżową i lokalizacją
- **Oferty**: Pipeline sprzedaży z etapami, prawdopodobieństwem i wartościami
- **Aktywności**: Zarządzanie zadaniami z typologią i śledzeniem statusu

### Kluczowe decyzje

- **CUID2 ID**: Odporne na kolizje, bezpieczne URL ID zamiast UUID
- **ISO 8601**: Wszystkie znaczniki czasu jako stringi ISO
- **JSON tags**: Ograniczone użycie JSON tylko dla tagów
- **Cascade deletes**: Usunięcie użytkownika kaskaduje do wszystkich danych
- **Row-level security**: Wszystkie zapytania filtrowane po userId

## Strategia bezpieczeństwa

> Aplikacja o podwyższonym rygorze bezpieczeństwa — projektowana zgodnie z OWASP
> Top 10 i zasadą defense-in-depth. Poniżej praktyki stosowane w kodzie.

- **Better Auth**: Sesje bazodanowe z HTTP-only cookies
- **Middleware**: Ochrona tras, nagłówki bezpieczeństwa
- **Zod**: Walidacja wszystkich danych wejściowych po stronie serwera
- **Hashowanie haseł**: Better Auth (scrypt/bcrypt)
- **Zarządzanie sesjami**: Sesje bazodanowe z konfigurowalnym wygaśnięciem
- **Row-level security**: Każda procedura tRPC filtruje po `userId` z sesji — brak dostępu do cudzych danych
- **Ochrona CSRF**: SameSite cookies + weryfikacja origin przez Better Auth
- **Nagłówki bezpieczeństwa**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security`
- **Zapobieganie XSS**: React auto-escaping, brak `dangerouslySetInnerHTML`
- **Zapobieganie SQL injection**: Drizzle ORM z parametryzacją zapytań
- **Bezpieczne logowanie**: Pino z redakcją sekretów (`password`, `token`, `secret`, cookies)
- **Zapobieganie session fixation**: Nowy token sesji przy logowaniu
- **Zapobieganie privilege escalation**: Pole `role` z `input: false` — nie można go ustawić z klienta
- **Rate limiting / brute-force**: gotowość do włączenia na poziomie infrastruktury
- **Audyt zależności**: gotowość do `npm audit` / SCA w CI

## Strategia cache

- **TanStack Query**: Cache po stronie klienta z 30s czasem odświeżenia
- **tRPC**: Automatyczne batchowanie przez httpBatchLink
- **React Server Components**: Renderowanie po stronie serwera

## Strategia renderowania

- **Server Components**: Domyślnie dla wszystkich stron
- **Client Components**: Tylko tam gdzie potrzebna interaktywność
- **Streaming**: Suspense dla sekcji zależnych od danych
- **Minimalna hydratacja**: Komponenty klienckie tylko w liściach

## Optymalizacja wydajności

- Turbopack dla szybkiego developmentu
- Właściwe granice server/client
- Minimalny bundle przez selektywne importy
- Wydajne zapytania z odpowiednimi indeksami
- Skeleton loading dla postrzeganej wydajności

## Gotowość produkcyjna

- Walidacja środowiska przez .env
- Strukturalne logowanie JSON przez Pino
- Nagłówki bezpieczeństwa w middleware
- Architektura gotowa na Docker
- Workflow migracji przez Drizzle Kit

## Skalowalność

- Łatwa migracja do PostgreSQL (abstrakcja Drizzle ORM)
- Row-level security już zaimplementowane
- Modułowa struktura routerów
- Spójne wzorce walidacji
- Izolacja logiki biznesowej w routerach tRPC