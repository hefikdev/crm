import { db, sqlite } from "@/db";
import { users, accounts } from "@/db/schema/auth";
import { companies } from "@/db/schema/companies";
import { contacts } from "@/db/schema/contacts";
import { deals } from "@/db/schema/deals";
import { activities } from "@/db/schema/activities";
import { hashPassword } from "better-auth/crypto";
import { createId } from "@paralleldrive/cuid2";
import { count } from "drizzle-orm";

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

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const daysAhead = (n: number) => new Date(Date.now() + n * 86400000).toISOString();

export async function seedForUser(userId: string) {
  // 60 companies
  const companyRows = Array.from({ length: 60 }, () => {
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
      notes: null,
      tags: [pick(INDUSTRIES)],
      status: pick(["active", "active", "active", "lead", "inactive"] as const),
      createdAt: daysAgo(int(1, 365)),
      updatedAt: daysAgo(int(0, 30)),
    };
  });
  await db.insert(companies).values(companyRows);

  // 400 contacts
  const contactRows = Array.from({ length: 400 }, () => {
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
      notes: null,
      status: pick(["active", "active", "active", "lead", "inactive", "archived"] as const),
      source: pick(SOURCES),
      lastContactedAt: daysAgo(int(0, 90)),
      createdAt: daysAgo(int(1, 365)),
      updatedAt: daysAgo(int(0, 30)),
    };
  });
  await db.insert(contacts).values(contactRows);

  // 300 deals
  const dealRows = Array.from({ length: 300 }, () => {
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
      notes: null,
      tags: [],
      createdAt: daysAgo(int(1, 300)),
      updatedAt: daysAgo(int(0, 30)),
    };
  });
  await db.insert(deals).values(dealRows);

  // 400 activities
  const activityRows = Array.from({ length: 400 }, () => {
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
      description: null,
      status,
      dueDate: daysAhead(int(-30, 60)),
      completedAt: status === "completed" ? daysAgo(int(0, 60)) : null,
      createdAt: daysAgo(int(1, 200)),
      updatedAt: daysAgo(int(0, 30)),
    };
  });
  await db.insert(activities).values(activityRows);

  return {
    companies: companyRows.length,
    contacts: contactRows.length,
    deals: dealRows.length,
    activities: activityRows.length,
  };
}

export async function seed() {
  const existing = await db.select({ c: count() }).from(companies);
  if ((existing[0]?.c ?? 0) > 0) {
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
