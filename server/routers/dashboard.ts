import { router, protectedProcedure } from "@/server/trpc";
import { db } from "@/db";
import { contacts } from "@/db/schema/contacts";
import { companies } from "@/db/schema/companies";
import { deals } from "@/db/schema/deals";
import { activities } from "@/db/schema/activities";
import { eq, desc, count, and, sql } from "drizzle-orm";

export const dashboardRouter = router({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const [contactCount, companyCount, dealData, activityData] = await Promise.all([
      db
        .select({ count: count() })
        .from(contacts)
        .where(eq(contacts.userId, userId)),
      db
        .select({ count: count() })
        .from(companies)
        .where(eq(companies.userId, userId)),
      db
        .select()
        .from(deals)
        .where(eq(deals.userId, userId)),
      db
        .select()
        .from(activities)
        .where(and(eq(activities.userId, userId), eq(activities.status, "pending"))),
    ]);

    const allDeals = dealData;
    const pipelineValue = allDeals
      .filter((d) => !["closed_won", "closed_lost"].includes(d.stage))
      .reduce((sum, d) => sum + d.value, 0);
    const wonValue = allDeals
      .filter((d) => d.stage === "closed_won")
      .reduce((sum, d) => sum + d.value, 0);

    return {
      totalContacts: contactCount[0]?.count ?? 0,
      totalCompanies: companyCount[0]?.count ?? 0,
      totalDeals: allDeals.length,
      pipelineValue,
      wonValue,
      pendingActivities: activityData.length,
      recentDeals: allDeals.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    };
  }),

  getRecentActivity: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, ctx.user.id))
      .orderBy(desc(activities.createdAt))
      .limit(10);
  }),
});