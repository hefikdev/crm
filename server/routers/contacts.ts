import { router, publicProcedure, protectedProcedure } from "@/server/trpc";
import { db } from "@/db";
import { contacts } from "@/db/schema/contacts";
import { contactSchema } from "@/lib/validations";
import { eq, desc, like, and, count, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

export const contactsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
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

      const offset = (input.page - 1) * input.limit;

      const [data, totalResult] = await Promise.all([
        db
          .select()
          .from(contacts)
          .where(and(...conditions))
          .orderBy(desc(contacts.createdAt))
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
});