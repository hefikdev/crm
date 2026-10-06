# CRM

System zarządzania relacjami z klientami klasy enterprise zbudowany na Next.js 16.

## Pierwsze kroki

```bash
# Instalacja zależności
npm install

# Konfiguracja środowiska
cp .env.example .env
# Edytuj .env z własnymi sekretami

# Uruchom migracje bazy danych
npm run db:generate
npm run db:migrate

# Uruchom serwer deweloperski
npm run dev
```

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