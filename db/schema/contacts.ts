import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./auth";

export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey().$defaultFn(createId),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  companyId: text("company_id"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  position: text("position"),
  avatarUrl: text("avatar_url"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  notes: text("notes"),
  status: text("status", { enum: ["active", "inactive", "lead", "archived"] }).default("active").notNull(),
  source: text("source", { enum: ["referral", "website", "email", "phone", "social", "other"] }).default("other"),
  lastContactedAt: text("last_contacted_at"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});