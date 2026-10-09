import { router, protectedProcedure } from "@/server/trpc";
import { db } from "@/db";
import { targets } from "@/db/schema/targets";
import { deals } from "@/db/schema/deals";
import { targetSchema } from "@/lib/validations";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { logger } from "@/lib/logger";

export const targetsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(targets)
      .where(eq(targets.userId, ctx.user.id))
      .orderBy(desc(targets.period));
  }),

  // Current month target vs actual won revenue.
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const period = new Date().toISOString().slice(0, 7);

    const [targetRow, wonDeals] = await Promise.all([
      db
        .select()
        .from(targets)
        .where(and(eq(targets.userId, ctx.user.id), eq(targets.period, period)))
        .limit(1),
      db
        .select()
        .from(deals)
        .where(and(eq(deals.userId, ctx.user.id), eq(deals.stage, "closed_won"))),
    ]);

    const actual = wonDeals
      .filter((d) => d.closedAt?.startsWith(period))
      .reduce((sum, d) => sum + d.value, 0);

    const target = targetRow[0]?.amount ?? 0;
    const percent = target > 0 ? Math.round((actual / target) * 100) : 0;

    return { period, target, actual, percent };
  }),

  upsert: protectedProcedure
    .input(targetSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select()
        .from(targets)
        .where(and(eq(targets.userId, ctx.user.id), eq(targets.period, input.period)))
        .limit(1);

      if (existing[0]) {
        const result = await db
          .update(targets)
          .set({ amount: input.amount, currency: input.currency, updatedAt: new Date().toISOString() })
          .where(eq(targets.id, existing[0].id))
          .returning();
        return result[0];
      }

      const result = await db
        .insert(targets)
        .values({ ...input, userId: ctx.user.id })
        .returning();
      logger.info({ targetId: result[0].id }, "target created");
      return result[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(targets)
        .where(and(eq(targets.id, input.id), eq(targets.userId, ctx.user.id)));
      return { success: true };
    }),
});
