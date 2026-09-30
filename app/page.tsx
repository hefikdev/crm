import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            CRM
          </h1>
          <p className="text-xl text-zinc-400">
            System zarządzania relacjami z klientami klasy enterprise.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-zinc-200 px-8 py-6 text-base cursor-pointer">
              Zaloguj się
            </Button>
          </Link>
          <Link href="/register">
            <Button
              variant="outline"
              className="border-zinc-800 text-white hover:bg-zinc-900 px-8 py-6 text-base cursor-pointer"
            >
              Rejestracja
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-12 text-left">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-300">Kontakty</h3>
            <p className="text-sm text-zinc-500">
              Zarządzaj relacjami z pełnym systemem kontaktów.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-300">Oferty</h3>
            <p className="text-sm text-zinc-500">
              Śledź pipeline sprzedaży od leada do zamknięcia.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-300">Aktywności</h3>
            <p className="text-sm text-zinc-500">
              Bądź na bieżąco z zadaniami, telefonami i follow-upami.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}