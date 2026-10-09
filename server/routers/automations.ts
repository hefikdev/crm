import { router, protectedProcedure } from "@/server/trpc";
import { db } from "@/db";
import { automations, emailTemplates } from "@/db/schema/automations";
import { automationSchema, emailTemplateSchema } from "@/lib/validations";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

export const automationsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(automations)
      .where(eq(automations.userId, ctx.user.id))
      .orderBy(desc(automations.createdAt));
  }),

  create: protectedProcedure
    .input(automationSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await db
        .insert(automations)
        .values({
          ...input,
          userId: ctx.user.id,
          triggerValue: input.triggerValue || null,
          actionSubject: input.actionSubject || null,
        })
        .returning();
      logger.info({ automationId: result[0].id }, "automation created");
      return result[0];
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), data: automationSchema }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select()
        .from(automations)
        .where(and(eq(automations.id, input.id), eq(automations.userId, ctx.user.id)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Automation not found" });
      }

      const result = await db
        .update(automations)
        .set({
          ...input.data,
          triggerValue: input.data.triggerValue || null,
          actionSubject: input.data.actionSubject || null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(automations.id, input.id))
        .returning();

      return result[0];
    }),

  toggle: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select()
        .from(automations)
        .where(and(eq(automations.id, input.id), eq(automations.userId, ctx.user.id)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Automation not found" });
      }

      const result = await db
        .update(automations)
        .set({ active: !existing[0].active, updatedAt: new Date().toISOString() })
        .where(eq(automations.id, input.id))
        .returning();

      return result[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(automations)
        .where(and(eq(automations.id, input.id), eq(automations.userId, ctx.user.id)));
      return { success: true };
    }),

  // Email templates
  listTemplates: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.userId, ctx.user.id))
      .orderBy(desc(emailTemplates.createdAt));
  }),

  createTemplate: protectedProcedure
    .input(emailTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await db
        .insert(emailTemplates)
        .values({ ...input, userId: ctx.user.id })
        .returning();
      return result[0];
    }),

  deleteTemplate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(emailTemplates)
        .where(and(eq(emailTemplates.id, input.id), eq(emailTemplates.userId, ctx.user.id)));
      return { success: true };
    }),
});
