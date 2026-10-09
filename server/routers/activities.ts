import { router, protectedProcedure } from "@/server/trpc";
import { db } from "@/db";
import { activities } from "@/db/schema/activities";
import { activitySchema } from "@/lib/validations";
import { eq, desc, and, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

export const activitiesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        contactId: z.string().optional(),
        dealId: z.string().optional(),
        status: z.string().optional(),
        type: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(activities.userId, ctx.user.id)];

      if (input.contactId) conditions.push(eq(activities.contactId, input.contactId));
      if (input.dealId) conditions.push(eq(activities.dealId, input.dealId));
      if (input.status && input.status !== "all") {
        conditions.push(eq(activities.status, input.status as typeof activities.$inferSelect.status));
      }
      if (input.type && input.type !== "all") {
        conditions.push(eq(activities.type, input.type as typeof activities.$inferSelect.type));
      }

      const offset = (input.page - 1) * input.limit;

      const [data, totalResult] = await Promise.all([
        db
          .select()
          .from(activities)
          .where(and(...conditions))
          .orderBy(desc(activities.createdAt))
          .limit(input.limit)
          .offset(offset),
        db
          .select({ count: count() })
          .from(activities)
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
      const activity = await db
        .select()
        .from(activities)
        .where(and(eq(activities.id, input.id), eq(activities.userId, ctx.user.id)))
        .limit(1);

      if (!activity[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Activity not found" });
      }

      return activity[0];
    }),

  create: protectedProcedure
    .input(activitySchema)
    .mutation(async ({ ctx, input }) => {
      const data = {
        ...input,
        userId: ctx.user.id,
        contactId: input.contactId || null,
        dealId: input.dealId || null,
        description: input.description || null,
        dueDate: input.dueDate || null,
      };

      const result = await db.insert(activities).values(data).returning();
      logger.info({ activityId: result[0].id }, "activity created");
      return result[0];
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), data: activitySchema }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select()
        .from(activities)
        .where(and(eq(activities.id, input.id), eq(activities.userId, ctx.user.id)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Activity not found" });
      }

      const updateData: Record<string, unknown> = {
        ...input.data,
        contactId: input.data.contactId || null,
        dealId: input.data.dealId || null,
        description: input.data.description || null,
        dueDate: input.data.dueDate || null,
        updatedAt: new Date().toISOString(),
      };

      if (input.data.status === "completed") {
        updateData.completedAt = new Date().toISOString();
      }

      const result = await db
        .update(activities)
        .set(updateData)
        .where(eq(activities.id, input.id))
        .returning();

      logger.info({ activityId: input.id }, "activity updated");
      return result[0];
    }),

  complete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await db
        .update(activities)
        .set({
          status: "completed",
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(and(eq(activities.id, input.id), eq(activities.userId, ctx.user.id)))
        .returning();

      if (!result[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Activity not found" });
      }

      return result[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select()
        .from(activities)
        .where(and(eq(activities.id, input.id), eq(activities.userId, ctx.user.id)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Activity not found" });
      }

      await db.delete(activities).where(eq(activities.id, input.id));
      return { success: true };
    }),

  getUpcoming: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date().toISOString();
    return await db
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.userId, ctx.user.id),
          eq(activities.status, "pending")
        )
      )
      .orderBy(desc(activities.dueDate))
      .limit(10);
  }),
});