import { router, publicProcedure, protectedProcedure } from "@/server/trpc";
import { db } from "@/db";
import { contacts } from "@/db/schema/contacts";
import { contactSchema } from "@/lib/validations";
import { eq, desc, like, and, count, sql, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { runAutomations } from "@/server/automations";

export const contactsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        source: z.string().optional(),
        companyId: z.string().optional(),
        sort: z.enum(["newest", "oldest", "name", "lastContacted"]).default("newest"),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(5000).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(contacts.userId, ctx.user.id)];

      if (input.search) {
        conditions.push(
          sql`(${like(contacts.firstName, `%${input.search}%`)} OR ${like(contacts.lastName, `%${input.search}%`)} OR ${like(contacts.email, `%${input.search}%`)})`
        );
      }

      if (input.status && input.status !== "all") {
        conditions.push(eq(contacts.status, input.status as typeof contacts.$inferSelect.status));
      }

      if (input.source && input.source !== "all") {
        conditions.push(
          eq(contacts.source, input.source as NonNullable<typeof contacts.$inferSelect.source>)
        );
      }

      if (input.companyId && input.companyId !== "all") {
        conditions.push(eq(contacts.companyId, input.companyId));
      }

      const orderBy =
        input.sort === "oldest"
          ? contacts.createdAt
          : input.sort === "name"
            ? contacts.firstName
            : input.sort === "lastContacted"
              ? desc(contacts.lastContactedAt)
              : desc(contacts.createdAt);

      const offset = (input.page - 1) * input.limit;

      const [data, totalResult] = await Promise.all([
        db
          .select()
          .from(contacts)
          .where(and(...conditions))
          .orderBy(orderBy)
          .limit(input.limit)
          .offset(offset),
        db
          .select({ count: count() })
          .from(contacts)
          .where(and(...conditions)),
      ]);

      return {
        data,
        total: totalResult[0]?.count ?? 0,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil((totalResult[0]?.count ?? 0) / input.limit),
      };
    }),

  // Lead scoring — deterministic 0-100 score from engagement signals.
  getLeadScores: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select()
      .from(contacts)
      .where(eq(contacts.userId, ctx.user.id));

    const now = Date.now();
    const scored = rows.map((c) => {
      let score = 0;
      if (c.status === "active") score += 30;
      else if (c.status === "lead") score += 20;
      if (c.email) score += 15;
      if (c.phone) score += 15;
      if (c.companyId) score += 10;
      if (c.position) score += 5;
      if (c.lastContactedAt) {
        const days = (now - new Date(c.lastContactedAt).getTime()) / 86400000;
        if (days <= 7) score += 25;
        else if (days <= 30) score += 15;
        else if (days <= 90) score += 5;
      }
      return {
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        status: c.status,
        score: Math.min(score, 100),
      };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 20);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const contact = await db
        .select()
        .from(contacts)
        .where(and(eq(contacts.id, input.id), eq(contacts.userId, ctx.user.id)))
        .limit(1);

      if (!contact[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contact not found" });
      }

      return contact[0];
    }),

  create: protectedProcedure
    .input(contactSchema)
    .mutation(async ({ ctx, input }) => {
      const data = {
        ...input,
        userId: ctx.user.id,
        companyId: input.companyId || null,
        email: input.email || null,
        phone: input.phone || null,
        position: input.position || null,
        notes: input.notes || null,
      };

      const result = await db.insert(contacts).values(data).returning();
      logger.info({ contactId: result[0].id }, "contact created");

      await runAutomations({
        userId: ctx.user.id,
        trigger: "contact_created",
        contactId: result[0].id,
        label: `${result[0].firstName} ${result[0].lastName}`,
      });

      return result[0];
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), data: contactSchema }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select()
        .from(contacts)
        .where(and(eq(contacts.id, input.id), eq(contacts.userId, ctx.user.id)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contact not found" });
      }

      const updateData = {
        ...input.data,
        companyId: input.data.companyId || null,
        email: input.data.email || null,
        phone: input.data.phone || null,
        position: input.data.position || null,
        notes: input.data.notes || null,
        updatedAt: new Date().toISOString(),
      };

      const result = await db
        .update(contacts)
        .set(updateData)
        .where(eq(contacts.id, input.id))
        .returning();

      logger.info({ contactId: input.id }, "contact updated");
      return result[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select()
        .from(contacts)
        .where(and(eq(contacts.id, input.id), eq(contacts.userId, ctx.user.id)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contact not found" });
      }

      await db.delete(contacts).where(eq(contacts.id, input.id));
      logger.info({ contactId: input.id }, "contact deleted");
      return { success: true };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const result = await db
      .select({
        status: contacts.status,
        count: count(),
      })
      .from(contacts)
      .where(eq(contacts.userId, ctx.user.id))
      .groupBy(contacts.status);

    return result;
  }),

  // Bulk operations — world-class CRM table stakes.
  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string()).min(1).max(1000) }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(contacts)
        .where(and(eq(contacts.userId, ctx.user.id), inArray(contacts.id, input.ids)));
      logger.info({ count: input.ids.length }, "contacts bulk deleted");
      return { success: true, count: input.ids.length };
    }),

  bulkUpdateStatus: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string()).min(1).max(1000),
        status: z.enum(["active", "inactive", "lead", "archived"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db
        .update(contacts)
        .set({ status: input.status, updatedAt: new Date().toISOString() })
        .where(and(eq(contacts.userId, ctx.user.id), inArray(contacts.id, input.ids)));
      logger.info({ count: input.ids.length, status: input.status }, "contacts bulk status updated");
      return { success: true, count: input.ids.length };
    }),

  // CSV import — accepts parsed rows, skips duplicates by email.
  importRows: protectedProcedure
    .input(
      z.object({
        rows: z
          .array(
            z.object({
              firstName: z.string().min(1).max(100),
              lastName: z.string().min(1).max(100),
              email: z.string().max(255).optional().or(z.literal("")),
              phone: z.string().max(50).optional().or(z.literal("")),
              position: z.string().max(200).optional().or(z.literal("")),
            })
          )
          .min(1)
          .max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select({ email: contacts.email })
        .from(contacts)
        .where(eq(contacts.userId, ctx.user.id));
      const seen = new Set(existing.map((e) => e.email?.toLowerCase()).filter(Boolean));

      const toInsert = [];
      let skipped = 0;
      for (const row of input.rows) {
        const email = row.email?.trim().toLowerCase() || null;
        if (email && seen.has(email)) {
          skipped++;
          continue;
        }
        if (email) seen.add(email);
        toInsert.push({
          userId: ctx.user.id,
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          email: row.email?.trim() || null,
          phone: row.phone?.trim() || null,
          position: row.position?.trim() || null,
          status: "active" as const,
          source: "other" as const,
          tags: [],
        });
      }

      if (toInsert.length > 0) {
        await db.insert(contacts).values(toInsert);
      }
      logger.info({ imported: toInsert.length, skipped }, "contacts imported");
      return { imported: toInsert.length, skipped };
    }),
});