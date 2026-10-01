import { router, protectedProcedure } from "@/server/trpc";
import { db } from "@/db";
import { companies } from "@/db/schema/companies";
import { companySchema } from "@/lib/validations";
import { eq, desc, like, and, count, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

export const companiesRouter = router({
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
      const conditions = [eq(companies.userId, ctx.user.id)];

      if (input.search) {
        conditions.push(
          sql`(${like(companies.name, `%${input.search}%`)} OR ${like(companies.domain, `%${input.search}%`)} OR ${like(companies.email, `%${input.search}%`)})`
        );
      }

      if (input.status && input.status !== "all") {
        conditions.push(eq(companies.status, input.status as typeof companies.$inferSelect.status));
      }

      const offset = (input.page - 1) * input.limit;

      const [data, totalResult] = await Promise.all([
        db
          .select()
          .from(companies)
          .where(and(...conditions))
          .orderBy(desc(companies.createdAt))
          .limit(input.limit)
          .offset(offset),
        db
          .select({ count: count() })
          .from(companies)
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
      const company = await db
        .select()
        .from(companies)
        .where(and(eq(companies.id, input.id), eq(companies.userId, ctx.user.id)))
        .limit(1);

      if (!company[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Company not found" });
      }

      return company[0];
    }),

  create: protectedProcedure
    .input(companySchema)
    .mutation(async ({ ctx, input }) => {
      const data = {
        ...input,
        userId: ctx.user.id,
        domain: input.domain || null,
        industry: input.industry || null,
        phone: input.phone || null,
        email: input.email || null,
        website: input.website || null,
        address: input.address || null,
        city: input.city || null,
        country: input.country || null,
        notes: input.notes || null,
      };

      const result = await db.insert(companies).values(data).returning();
      logger.info({ companyId: result[0].id }, "company created");
      return result[0];
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), data: companySchema }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select()
        .from(companies)
        .where(and(eq(companies.id, input.id), eq(companies.userId, ctx.user.id)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Company not found" });
      }

      const updateData = {
        ...input.data,
        domain: input.data.domain || null,
        industry: input.data.industry || null,
        phone: input.data.phone || null,
        email: input.data.email || null,
        website: input.data.website || null,
        address: input.data.address || null,
        city: input.data.city || null,
        country: input.data.country || null,
        notes: input.data.notes || null,
        updatedAt: new Date().toISOString(),
      };

      const result = await db
        .update(companies)
        .set(updateData)
        .where(eq(companies.id, input.id))
        .returning();

      logger.info({ companyId: input.id }, "company updated");
      return result[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select()
        .from(companies)
        .where(and(eq(companies.id, input.id), eq(companies.userId, ctx.user.id)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Company not found" });
      }

      await db.delete(companies).where(eq(companies.id, input.id));
      logger.info({ companyId: input.id }, "company deleted");
      return { success: true };
    }),
});