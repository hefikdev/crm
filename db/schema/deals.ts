import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./auth";
import { contacts } from "./contacts";
import { companies } from "./companies";
import { products } from "./products";

export const deals = sqliteTable("deals", {
  id: text("id").primaryKey().$defaultFn(createId),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contactId: text("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  companyId: text("company_id").references(() => companies.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  value: real("value").default(0).notNull(),
  currency: text("currency").default("USD").notNull(),
  stage: text("stage", {
    enum: ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"],
  }).default("lead").notNull(),
  probability: integer("probability").default(10).notNull(),
  expectedCloseDate: text("expected_close_date"),
  closedAt: text("closed_at"),
  notes: text("notes"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const dealItems = sqliteTable("deal_items", {
  id: text("id").primaryKey().$defaultFn(createId),
  dealId: text("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: real("unit_price").default(0).notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});