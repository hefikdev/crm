import { db } from "@/db";
import { automations } from "@/db/schema/automations";
import { activities } from "@/db/schema/activities";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { logger } from "@/lib/logger";

type Trigger = "deal_created" | "deal_stage_changed" | "deal_won" | "contact_created";

interface RunContext {
  userId: string;
  trigger: Trigger;
  /** Stage that was entered, for deal_stage_changed. */
  stage?: string;
  contactId?: string | null;
  dealId?: string | null;
  /** Human label used in task titles, e.g. deal or contact name. */
  label?: string;
}

/**
 * Runs every active automation matching the trigger. Actions are simple CRM
 * side-effects: a follow-up task, a note, or a logged email draft. Delays are
 * recorded as the activity dueDate rather than a real scheduler — a demo CRM
 * has no worker process to wake up later.
 */
export async function runAutomations(ctx: RunContext) {
  const rules = await db
    .select()
    .from(automations)
    .where(
      and(
        eq(automations.userId, ctx.userId),
        eq(automations.trigger, ctx.trigger),
        eq(automations.active, true)
      )
    );

  const matching = rules.filter((r) => {
    if (ctx.trigger === "deal_stage_changed" && r.triggerValue) {
      return r.triggerValue === ctx.stage;
    }
    return true;
  });

  if (matching.length === 0) return { ran: 0 };

  const now = Date.now();
  const rows: (typeof activities.$inferInsert)[] = [];

  for (const rule of matching) {
    const dueDate =
      rule.delayMinutes > 0
        ? new Date(now + rule.delayMinutes * 60000).toISOString()
        : null;

    // Placeholder substitution keeps templates useful without a template engine.
    const interpolate = (s: string) =>
      s.replace(/\{\{\s*name\s*\}\}/gi, ctx.label ?? "");

    if (rule.action === "create_task") {
      rows.push({
        id: createId(),
        userId: ctx.userId,
        contactId: ctx.contactId ?? null,
        dealId: ctx.dealId ?? null,
        type: "task",
        title: interpolate(rule.actionValue),
        description: `Automatyzacja: ${rule.name}`,
        status: "pending",
        dueDate,
      });
    } else if (rule.action === "create_note") {
      rows.push({
        id: createId(),
        userId: ctx.userId,
        contactId: ctx.contactId ?? null,
        dealId: ctx.dealId ?? null,
        type: "note",
        title: interpolate(rule.actionValue),
        description: `Automatyzacja: ${rule.name}`,
        status: "completed",
        completedAt: new Date().toISOString(),
      });
    } else if (rule.action === "send_email") {
      rows.push({
        id: createId(),
        userId: ctx.userId,
        contactId: ctx.contactId ?? null,
        dealId: ctx.dealId ?? null,
        type: "email",
        title: interpolate(rule.actionSubject || rule.name),
        description: interpolate(rule.actionValue),
        status: dueDate ? "pending" : "completed",
        dueDate,
        completedAt: dueDate ? null : new Date().toISOString(),
      });
    }

    await db
      .update(automations)
      .set({ runCount: rule.runCount + 1, updatedAt: new Date().toISOString() })
      .where(eq(automations.id, rule.id));
  }

  if (rows.length > 0) {
    await db.insert(activities).values(rows);
  }

  logger.info(
    { trigger: ctx.trigger, rules: matching.length, actions: rows.length },
    "automations ran"
  );
  return { ran: rows.length };
}
