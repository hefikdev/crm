import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as authSchema from "@/db/schema/auth";
import { logger } from "@/lib/logger";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: authSchema.users,
      session: authSchema.sessions,
      account: authSchema.accounts,
      verification: authSchema.verifications,
    },
  }),
  session: {
    strategy: "database",
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "user",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  databaseHooks: {
    user: {
      create: {
        // Every new account gets its own demo dataset so the CRM is never empty.
        after: async (user) => {
          const { seedForUser } = await import("@/db/seed");
          await seedForUser(user.id);
        },
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!].filter(Boolean),
  logger: {
    level: process.env.LOG_LEVEL === "debug" ? "debug" : "info",
  },
  advanced: {
    cookiePrefix: "crm",
    crossSubDomainCookies: {
      enabled: false,
    },
  },
});