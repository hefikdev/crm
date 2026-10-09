import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./auth";

// Automation rules: "when <trigger> then <action>". The classic CRM
// automation primitive — no visual flow builder needed to be useful.
export const automations = sqliteTable("automations", {
  id: text("id").primaryKey().$defaultFn(createId),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // Trigger
  trigger: text("trigger", {
    enum: ["deal_created", "deal_stage_changed", "deal_won", "contact_created"],
  }).notNull(),
  // Optional trigger filter — e.g. only when stage becomes "proposal".
  triggerValue: text("trigger_value"),
  // Action
  action: text("action", {
    enum: ["create_task", "create_note", "send_email"],
  }).notNull(),
  // Action payload — task title / note body / email body.
  actionValue: text("action_value").notNull(),
  actionSubject: text("action_subject"),
  // When minutes > 0 the action is scheduled instead of instant.
  delayMinutes: integer("delay_minutes").default(0).notNull(),
  active: integer("active", { mode: "boolean" }).default(true).notNull(),
  runCount: integer("run_count").default(0).notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// Reusable email templates — feed automations and manual sends.
export const emailTemplates = sqliteTable("email_templates", {
  id: text("id").primaryKey().$defaultFn(createId),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});
