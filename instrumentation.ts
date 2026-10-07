export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { migrate } = await import("drizzle-orm/better-sqlite3/migrator");
  const { db } = await import("@/db");
  const { seed } = await import("@/db/seed");
  const { logger } = await import("@/lib/logger");

  try {
    migrate(db, { migrationsFolder: "./db/migrations" });
  } catch (error) {
    // Tables may already exist (created via `drizzle-kit push`); not fatal.
    logger.warn({ error }, "migration skipped");
  }

  try {
    const result = await seed();
    if (result.seeded) {
      logger.info(result.counts, "demo data seeded");
    }
  } catch (error) {
    logger.error({ error }, "seed failed");
  }
}
