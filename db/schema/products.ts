import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./auth";

export const products = sqliteTable("products", {
  id: text("id").primaryKey().$defaultFn(createId),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sku: text("sku"),
  description: text("description"),
  category: text("category"),
  price: real("price").default(0).notNull(),
  currency: text("currency").default("PLN").notNull(),
  active: integer("active", { mode: "boolean" }).default(true).notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});
