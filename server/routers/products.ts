import { router, protectedProcedure } from "@/server/trpc";
import { db } from "@/db";
import { products } from "@/db/schema/products";
import { productSchema } from "@/lib/validations";
import { eq, desc, like, and, count, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

export const productsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(products.userId, ctx.user.id)];

      if (input.search) {
        conditions.push(
          sql`(${like(products.name, `%${input.search}%`)} OR ${like(products.sku, `%${input.search}%`)})`
        );
      }

      const offset = (input.page - 1) * input.limit;

      const [data, totalResult] = await Promise.all([
        db
          .select()
          .from(products)
          .where(and(...conditions))
          .orderBy(desc(products.createdAt))
          .limit(input.limit)
          .offset(offset),
        db.select({ count: count() }).from(products).where(and(...conditions)),
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
      const row = await db
        .select()
        .from(products)
        .where(and(eq(products.id, input.id), eq(products.userId, ctx.user.id)))
        .limit(1);

      if (!row[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }
      return row[0];
    }),

  create: protectedProcedure
    .input(productSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await db
        .insert(products)
        .values({
          ...input,
          userId: ctx.user.id,
          sku: input.sku || null,
          description: input.description || null,
          category: input.category || null,
        })
        .returning();
      logger.info({ productId: result[0].id }, "product created");
      return result[0];
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), data: productSchema }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select()
        .from(products)
        .where(and(eq(products.id, input.id), eq(products.userId, ctx.user.id)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      const result = await db
        .update(products)
        .set({
          ...input.data,
          sku: input.data.sku || null,
          description: input.data.description || null,
          category: input.data.category || null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(products.id, input.id))
        .returning();

      logger.info({ productId: input.id }, "product updated");
      return result[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select()
        .from(products)
        .where(and(eq(products.id, input.id), eq(products.userId, ctx.user.id)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      await db.delete(products).where(eq(products.id, input.id));
      logger.info({ productId: input.id }, "product deleted");
      return { success: true };
    }),
});
