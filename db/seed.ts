import { db, sqlite } from "@/db";
import { users, accounts } from "@/db/schema/auth";
import { companies } from "@/db/schema/companies";
import { contacts } from "@/db/schema/contacts";
import { deals, dealItems } from "@/db/schema/deals";
import { activities } from "@/db/schema/activities";
import { products } from "@/db/schema/products";
import { targets } from "@/db/schema/targets";
import { automations, emailTemplates } from "@/db/schema/automations";
import { hashPassword } from "better-auth/crypto";
import { createId } from "@paralleldrive/cuid2";
import { count, eq } from "drizzle-orm";

// Deterministic PRNG so demo data is stable across runs.
let rngState = 1337;
const rand = () => {
  rngState = (rngState * 1103515245 + 12345) & 0x7fffffff;
  return rngState / 0x7fffffff;
};
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

const FIRST = ["Jan", "Anna", "Piotr", "Katarzyna", "Marek", "Agnieszka", "Tomasz", "Magdalena", "Paweł", "Ewa", "Krzysztof", "Joanna", "Michał", "Barbara", "Andrzej", "Monika", "Grzegorz", "Zofia", "Łukasz", "Halina"];
const LAST = ["Kowalski", "Nowak", "Wiśniewski", "Wójcik", "Kowalczyk", "Kamiński", "Lewandowski", "Zieliński", "Szymański", "Woźniak", "Dąbrowski", "Kozłowski", "Jankowski", "Mazur", "Kwiatkowski", "Krawczyk", "Piotrowski", "Grabowski", "Nowicki", "Pawłowski"];
const INDUSTRIES = ["Technologia", "Finanse", "Produkcja", "Handel", "Logistyka", "Medycyna", "Edukacja", "Budownictwo", "Energetyka", "Marketing"];
const CITIES = ["Warszawa", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin", "Bydgoszcz", "Lublin", "Katowice"];
const SIZES = ["1-10", "11-50", "51-200", "201-1000", "1001+"] as const;
const POSITIONS = ["Prezes", "Dyrektor", "Manager", "Specjalista", "Analityk", "Handlowiec", "Konsultant", "Asystent"];
const SOURCES = ["referral", "website", "email", "phone", "social", "other"] as const;
const STAGES = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"] as const;
const ACTIVITY_TYPES = ["call", "email", "meeting", "task", "note", "follow_up"] as const;
const COMPANY_SUFFIX = ["Sp. z o.o.", "S.A.", "Group", "Solutions", "Systems", "Partners", "Tech", "Industries"];
const COMPANY_PREFIX = ["Nova", "Vertex", "Apex", "Prime", "Global", "Delta", "Omega", "Sigma", "Alpha", "Quantum", "Stellar", "Pioneer", "Summit", "Horizon", "Fusion"];
const PRODUCT_CATEGORIES = ["Oprogramowanie", "Usługi", "Sprzęt", "Szkolenia", "Wsparcie", "Subskrypcje"];
const PRODUCT_NAMES = [
  "CRM Enterprise", "CRM Standard", "Moduł Analityczny", "Integracja API", "Wdrożenie i konfiguracja",
  "Szkolenie zespołu", "Wsparcie Premium", "Hosting roczny", "Migracja danych", "Audyt procesów",
  "Licencja dodatkowa", "Konsultacje strategiczne", "Serwis 24/7", "Backup w chmurze", "Portal klienta",
];

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const daysAhead = (n: number) => new Date(Date.now() + n * 86400000).toISOString();

export async function seedForUser(userId: string) {
  // 120 companies
  const companyRows = Array.from({ length: 120 }, () => {
    const name = `${pick(COMPANY_PREFIX)} ${pick(COMPANY_SUFFIX)}`;
    const domain = name.toLowerCase().replace(/[^a-z]/g, "") + ".pl";
    return {
      id: createId(),
      userId,
      name,
      domain,
      industry: pick(INDUSTRIES),
      size: pick(SIZES),
      phone: `+48 ${int(100, 999)} ${int(100, 999)} ${int(100, 999)}`,
      email: `kontakt@${domain}`,
      website: `https://${domain}`,
      address: `ul. ${pick(LAST)} ${int(1, 100)}`,
      city: pick(CITIES),
      country: "Polska",
      notes: pick([
        "Klient strategiczny — priorytet obsługi.",
        "Zainteresowany rozszerzeniem licencji.",
        "Wymaga faktury z odroczonym terminem.",
        "Polecony przez partnera handlowego.",
        null,
      ]),
      tags: [pick(INDUSTRIES)],
      status: pick(["active", "active", "active", "lead", "inactive"] as const),
      createdAt: daysAgo(int(1, 365)),
      updatedAt: daysAgo(int(0, 30)),
    };
  });
  await db.insert(companies).values(companyRows);

  // 800 contacts
  const contactRows = Array.from({ length: 800 }, () => {
    const first = pick(FIRST);
    const last = pick(LAST);
    const company = pick(companyRows);
    const domain = company.domain ?? "example.pl";
    return {
      id: createId(),
      userId,
      companyId: company.id,
      firstName: first,
      lastName: last,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`.replace(/[^a-z0-9.@]/g, ""),
      phone: `+48 ${int(100, 999)} ${int(100, 999)} ${int(100, 999)}`,
      position: pick(POSITIONS),
      avatarUrl: null,
      tags: [],
      notes: pick([
        "Preferuje kontakt telefoniczny.",
        "Decydent w zakresie zakupów IT.",
        "Prosi o ofertę mailem.",
        null,
      ]),
      status: pick(["active", "active", "active", "lead", "inactive", "archived"] as const),
      source: pick(SOURCES),
      lastContactedAt: daysAgo(int(0, 90)),
      createdAt: daysAgo(int(1, 365)),
      updatedAt: daysAgo(int(0, 30)),
    };
  });
  await db.insert(contacts).values(contactRows);

  // 600 deals
  const dealRows = Array.from({ length: 600 }, () => {
    const contact = pick(contactRows);
    const company = companyRows.find((c) => c.id === contact.companyId) ?? pick(companyRows);
    const stage = pick(STAGES);
    const closed = stage === "closed_won" || stage === "closed_lost";
    return {
      id: createId(),
      userId,
      contactId: contact.id,
      companyId: company.id,
      title: `${pick(["Wdrożenie", "Licencja", "Kontrakt", "Umowa", "Projekt", "Serwis"])} ${pick(COMPANY_PREFIX)}`,
      value: int(5, 500) * 1000,
      currency: "PLN",
      stage,
      probability: stage === "closed_won" ? 100 : stage === "closed_lost" ? 0 : int(10, 90),
      expectedCloseDate: daysAhead(int(1, 120)),
      closedAt: closed ? daysAgo(int(1, 180)) : null,
      notes: pick([
        "Klient oczekuje wdrożenia w tym kwartale.",
        "Negocjacje dotyczą warunków płatności.",
        "Wymagana integracja z systemem ERP.",
        null,
      ]),
      tags: [],
      createdAt: daysAgo(int(1, 300)),
      updatedAt: daysAgo(int(0, 30)),
    };
  });
  await db.insert(deals).values(dealRows);

  // 900 activities
  const activityRows = Array.from({ length: 900 }, () => {
    const contact = pick(contactRows);
    const deal = pick(dealRows);
    const status = pick(["pending", "pending", "completed", "completed", "cancelled"] as const);
    return {
      id: createId(),
      userId,
      contactId: contact.id,
      dealId: deal.id,
      type: pick(ACTIVITY_TYPES),
      title: `${pick(["Rozmowa", "Spotkanie", "E-mail", "Follow-up", "Zadanie", "Notatka"])} - ${contact.firstName} ${contact.lastName}`,
      description: pick([
        "Omówiono zakres współpracy i harmonogram.",
        "Klient prosi o przesłanie oferty.",
        "Ustalono termin kolejnego spotkania.",
        "Wysłano materiały informacyjne.",
        null,
      ]),
      status,
      dueDate: daysAhead(int(-30, 60)),
      completedAt: status === "completed" ? daysAgo(int(0, 60)) : null,
      createdAt: daysAgo(int(1, 200)),
      updatedAt: daysAgo(int(0, 30)),
    };
  });
  await db.insert(activities).values(activityRows);

  await seedCatalogForUser(userId);
  await seedAutomationsForUser(userId);

  return {
    companies: companyRows.length,
    contacts: contactRows.length,
    deals: dealRows.length,
    activities: activityRows.length,
  };
}

// Idempotent: seeds products, targets and deal line items for a user.
// Safe to call on existing databases to backfill the catalog.
export async function seedCatalogForUser(userId: string) {
  const existing = await db
    .select({ c: count() })
    .from(products)
    .where(eq(products.userId, userId));
  if ((existing[0]?.c ?? 0) > 0) {
    return { skipped: true as const };
  }

  // 60 products
  const productRows = Array.from({ length: 60 }, (_, i) => {
    const name = PRODUCT_NAMES[i % PRODUCT_NAMES.length];
    return {
      id: createId(),
      userId,
      name: i >= PRODUCT_NAMES.length ? `${name} ${Math.floor(i / PRODUCT_NAMES.length) + 1}` : name,
      sku: `SKU-${String(i + 1).padStart(4, "0")}`,
      description: `${name} — oferta handlowa dla klientów biznesowych.`,
      category: pick(PRODUCT_CATEGORIES),
      price: int(5, 500) * 100,
      currency: "PLN",
      active: rand() > 0.15,
      createdAt: daysAgo(int(1, 300)),
      updatedAt: daysAgo(int(0, 30)),
    };
  });
  await db.insert(products).values(productRows);

  // 6 monthly targets (current + 5 previous months)
  const now = new Date();
  const targetRows = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return {
      id: createId(),
      userId,
      period,
      amount: int(200, 800) * 1000,
      currency: "PLN",
      createdAt: daysAgo(i * 30 + 1),
      updatedAt: daysAgo(i * 30),
    };
  });
  await db.insert(targets).values(targetRows);

  // Deal line items for a subset of the user's deals
  const userDeals = await db
    .select({ id: deals.id, createdAt: deals.createdAt })
    .from(deals)
    .where(eq(deals.userId, userId))
    .limit(300);

  if (userDeals.length > 0) {
    const itemRows = userDeals.flatMap((deal) => {
      const lineCount = int(1, 3);
      return Array.from({ length: lineCount }, () => {
        const product = pick(productRows);
        return {
          id: createId(),
          dealId: deal.id,
          productId: product.id,
          name: product.name,
          quantity: int(1, 5),
          unitPrice: product.price,
          createdAt: deal.createdAt,
        };
      });
    });
    await db.insert(dealItems).values(itemRows);
  }

  await seedAutomationsForUser(userId);

  return {
    skipped: false as const,
    products: productRows.length,
    targets: targetRows.length,
  };
}

// Idempotent: seeds example automations and email templates.
export async function seedAutomationsForUser(userId: string) {
  const existing = await db
    .select({ c: count() })
    .from(automations)
    .where(eq(automations.userId, userId));
  if ((existing[0]?.c ?? 0) > 0) {
    return { skipped: true as const };
  }

  await db.insert(automations).values([
    {
      id: createId(),
      userId,
      name: "Zadanie po wygraniu oferty",
      trigger: "deal_won",
      action: "create_task",
      actionValue: "Zadzwoń do klienta i podziękuj za współpracę — {{name}}",
      delayMinutes: 0,
      active: true,
      runCount: 0,
    },
    {
      id: createId(),
      userId,
      name: "Follow-up dzień po utworzeniu oferty",
      trigger: "deal_created",
      action: "create_task",
      actionValue: "Follow-up: skontaktuj się w sprawie {{name}}",
      delayMinutes: 1440,
      active: true,
      runCount: 0,
    },
    {
      id: createId(),
      userId,
      name: "Powitanie nowego kontaktu",
      trigger: "contact_created",
      action: "send_email",
      actionSubject: "Dziękujemy za kontakt",
      actionValue:
        "Dzień dobry,\ndziękujemy za nawiązanie kontaktu. Wkrótce się odezwiemy.\n\nPozdrawiamy,\nZespół",
      delayMinutes: 0,
      active: true,
      runCount: 0,
    },
    {
      id: createId(),
      userId,
      name: "Notatka przy przejściu do negocjacji",
      trigger: "deal_stage_changed",
      triggerValue: "negotiation",
      action: "create_note",
      actionValue: "Oferta {{name}} weszła w etap negocjacji",
      delayMinutes: 0,
      active: true,
      runCount: 0,
    },
  ]);

  await db.insert(emailTemplates).values([
    {
      id: createId(),
      userId,
      name: "Podziękowanie za spotkanie",
      subject: "Dziękujemy za spotkanie",
      body: "Dzień dobry,\ndziękujemy za dzisiejsze spotkanie. Podsumowanie i kolejne kroki prześlemy w osobnej wiadomości.\n\nPozdrawiamy",
    },
    {
      id: createId(),
      userId,
      name: "Przypomnienie o ofercie",
      subject: "Przypomnienie w sprawie oferty",
      body: "Dzień dobry,\nchciałbym przypomnieć o przesłanej ofercie. Chętnie odpowiem na pytania.\n\nPozdrawiam",
    },
  ]);

  return { skipped: false as const };
}

export async function seed() {
  const existing = await db.select({ c: count() }).from(companies);
  if ((existing[0]?.c ?? 0) > 0) {
    // Backfill catalog + automation data for users created before these existed.
    const allUsers = await db.select({ id: users.id }).from(users);
    for (const u of allUsers) {
      await seedCatalogForUser(u.id);
      await seedAutomationsForUser(u.id);
    }
    return { seeded: false as const };
  }

  const userId = createId();
  const now = new Date();
  const password = await hashPassword("Demo1234");

  await db.insert(users).values({
    id: userId,
    email: "demo@crm.app",
    name: "Demo User",
    emailVerified: true,
    role: "admin",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(accounts).values({
    id: createId(),
    userId,
    accountId: userId,
    providerId: "credential",
    password,
    createdAt: now,
    updatedAt: now,
  });

  const counts = await seedForUser(userId);
  return { seeded: true as const, counts };
}

// Run directly: npx tsx db/seed.ts
if (process.argv[1]?.includes("seed")) {
  (async () => {
    const { migrate } = await import("drizzle-orm/better-sqlite3/migrator");
    try {
      migrate(db, { migrationsFolder: "./db/migrations" });
    } catch {
      // Tables may already exist; not fatal.
    }
    const r = await seed();
    console.log(
      r.seeded ? `Seeded: ${JSON.stringify(r.counts)}` : "Already seeded, skipping."
    );
    sqlite.close();
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
