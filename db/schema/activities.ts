import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./auth";
import { contacts } from "./contacts";
import { deals } from "./deals";

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey().$defaultFn(createId),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contactId: text("contact_id").references(() => contacts.id, { onDelete: "cascade" }),
  dealId: text("deal_id").references(() => deals.id, { onDelete: "set null" }),
  type: text("type", {
    enum: ["call", "email", "meeting", "task", "note", "follow_up"],
  }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["pending", "completed", "cancelled"] }).default("pending").notNull(),
  dueDate: text("due_date"),
  completedAt: text("completed_at"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});