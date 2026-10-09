import { router, protectedProcedure } from "@/server/trpc";
import { db } from "@/db";
import { deals, dealItems } from "@/db/schema/deals";
import { dealSchema, dealItemSchema } from "@/lib/validations";
import { eq, desc, like, and, count, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

export const dealsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        stage: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(deals.userId, ctx.user.id)];

      if (input.search) {
        conditions.push(like(deals.title, `%${input.search}%`));
      }

      if (input.stage && input.stage !== "all") {
        conditions.push(eq(deals.stage, input.stage as typeof deals.$inferSelect.stage));
      }

      const offset = (input.page - 1) * input.limit;

      const [data, totalResult] = await Promise.all([
        db
          .select()
          .from(deals)
          .where(and(...conditions))
          .orderBy(desc(deals.createdAt))
          .limit(input.limit)
          .offset(offset),
        db
          .select({ count: count() })
          .from(deals)
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
      const deal = await db
        .select()
        .from(deals)
        .where(and(eq(deals.id, input.id), eq(deals.userId, ctx.user.id)))
        .limit(1);

      if (!deal[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deal not found" });
      }

      return deal[0];
    }),

  create: protectedProcedure
    .input(dealSchema)
    .mutation(async ({ ctx, input }) => {
      const data = {
        ...input,
        userId: ctx.user.id,
        contactId: input.contactId || null,
        companyId: input.companyId || null,
        expectedCloseDate: input.expectedCloseDate || null,
        notes: input.notes || null,
      };

      const result = await db.insert(deals).values(data).returning();
      logger.info({ dealId: result[0].id }, "deal created");
      return result[0];
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), data: dealSchema }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select()
        .from(deals)
        .where(and(eq(deals.id, input.id), eq(deals.userId, ctx.user.id)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deal not found" });
      }

      const updateData: Record<string, unknown> = {
        ...input.data,
        contactId: input.data.contactId || null,
        companyId: input.data.companyId || null,
        expectedCloseDate: input.data.expectedCloseDate || null,
        notes: input.data.notes || null,
        updatedAt: new Date().toISOString(),
      };

      if (input.data.stage === "closed_won" || input.data.stage === "closed_lost") {
        updateData.closedAt = new Date().toISOString();
      }

      const result = await db
        .update(deals)
        .set(updateData)
        .where(eq(deals.id, input.id))
        .returning();

      logger.info({ dealId: input.id }, "deal updated");
      return result[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select()
        .from(deals)
        .where(and(eq(deals.id, input.id), eq(deals.userId, ctx.user.id)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deal not found" });
      }

      await db.delete(deals).where(eq(deals.id, input.id));
      logger.info({ dealId: input.id }, "deal deleted");
      return { success: true };
    }),

  getPipeline: protectedProcedure.query(async ({ ctx }) => {
    const stages = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"] as const;
    const result = await db
      .select()
      .from(deals)
      .where(eq(deals.userId, ctx.user.id))
      .orderBy(desc(deals.createdAt));

    const pipeline = stages.map((stage) => ({
      stage,
      deals: result.filter((d) => d.stage === stage),
      total: result.filter((d) => d.stage === stage).reduce((sum, d) => sum + d.value, 0),
    }));

    return pipeline;
  }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const allDeals = await db
      .select()
      .from(deals)
      .where(eq(deals.userId, ctx.user.id));

    const totalValue = allDeals.reduce((sum, d) => sum + d.value, 0);
    const wonValue = allDeals
      .filter((d) => d.stage === "closed_won")
      .reduce((sum, d) => sum + d.value, 0);
    const activeValue = allDeals
      .filter((d) => !["closed_won", "closed_lost"].includes(d.stage))
      .reduce((sum, d) => sum + d.value, 0);

    return {
      total: allDeals.length,
      totalValue,
      wonValue,
      activeValue,
      wonCount: allDeals.filter((d) => d.stage === "closed_won").length,
      lostCount: allDeals.filter((d) => d.stage === "closed_lost").length,
    };
  }),

  // Line items — a deal's product breakdown.
  listItems: protectedProcedure
    .input(z.object({ dealId: z.string() }))
    .query(async ({ ctx, input }) => {
      const deal = await db
        .select()
        .from(deals)
        .where(and(eq(deals.id, input.dealId), eq(deals.userId, ctx.user.id)))
        .limit(1);

      if (!deal[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deal not found" });
      }

      return await db
        .select()
        .from(dealItems)
        .where(eq(dealItems.dealId, input.dealId))
        .orderBy(desc(dealItems.createdAt));
    }),

  addItem: protectedProcedure
    .input(z.object({ dealId: z.string(), data: dealItemSchema }))
    .mutation(async ({ ctx, input }) => {
      const deal = await db
        .select()
        .from(deals)
        .where(and(eq(deals.id, input.dealId), eq(deals.userId, ctx.user.id)))
        .limit(1);

      if (!deal[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deal not found" });
      }

      const result = await db
        .insert(dealItems)
        .values({
          dealId: input.dealId,
          productId: input.data.productId || null,
          name: input.data.name,
          quantity: input.data.quantity,
          unitPrice: input.data.unitPrice,
        })
        .returning();

      // Keep the deal value in sync with its line items.
      const items = await db
        .select()
        .from(dealItems)
        .where(eq(dealItems.dealId, input.dealId));
      const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
      await db
        .update(deals)
        .set({ value: total, updatedAt: new Date().toISOString() })
        .where(eq(deals.id, input.dealId));

      return result[0];
    }),

  removeItem: protectedProcedure
    .input(z.object({ id: z.string(), dealId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deal = await db
        .select()
        .from(deals)
        .where(and(eq(deals.id, input.dealId), eq(deals.userId, ctx.user.id)))
        .limit(1);

      if (!deal[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deal not found" });
      }

      await db.delete(dealItems).where(eq(dealItems.id, input.id));

      const items = await db
        .select()
        .from(dealItems)
        .where(eq(dealItems.dealId, input.dealId));
      const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
      await db
        .update(deals)
        .set({ value: total, updatedAt: new Date().toISOString() })
        .where(eq(deals.id, input.dealId));

      return { success: true };
    }),
});