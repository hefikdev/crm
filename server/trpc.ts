import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";
import { logger } from "@/lib/logger";
import type { SafeUser } from "@/lib/user";
import { sanitizeUser } from "@/lib/user";

export async function createContext() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return {
    session,
    user: session?.user ? sanitizeUser(session.user as unknown as SafeUser) : null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    logger.error(
      {
        code: error.code,
        message: error.message,
        path: shape.data?.path,
      },
      "tRPC error"
    );
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      session: ctx.session,
    },
  });
});