import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./auth";

export const companies = sqliteTable("companies", {
  id: text("id").primaryKey().$defaultFn(createId),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  domain: text("domain"),
  industry: text("industry"),
  size: text("size", { enum: ["1-10", "11-50", "51-200", "201-1000", "1001+"] }),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  notes: text("notes"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  status: text("status", { enum: ["active", "inactive", "lead", "archived"] }).default("active").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});