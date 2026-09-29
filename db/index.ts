import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as authSchema from "./schema/auth";
import * as contactsSchema from "./schema/contacts";
import * as companiesSchema from "./schema/companies";
import * as dealsSchema from "./schema/deals";
import * as activitiesSchema from "./schema/activities";
import { logger } from "@/lib/logger";
import path from "path";
import fs from "fs";

const dbPath = process.env.DATABASE_URL?.replace("file:", "") ?? "./data/crm.db";
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("busy_timeout = 5000");
sqlite.pragma("synchronous = NORMAL");
sqlite.pragma("cache_size = -20000");

const db = drizzle(sqlite, {
  schema: {
    ...authSchema,
    ...contactsSchema,
    ...companiesSchema,
    ...dealsSchema,
    ...activitiesSchema,
  },
  logger:
    process.env.LOG_LEVEL === "debug"
      ? {
          logQuery(query, params) {
            logger.debug({ query, params }, "db query");
          },
        }
      : false,
});

export { db, sqlite };
export type DB = typeof db;