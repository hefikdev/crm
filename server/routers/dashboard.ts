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

  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const [allDeals, allContacts, allActivities] = await Promise.all([
      db.select().from(deals).where(eq(deals.userId, userId)),
      db.select().from(contacts).where(eq(contacts.userId, userId)),
      db.select().from(activities).where(eq(activities.userId, userId)),
    ]);

    // Monthly revenue for last 6 months
    const monthlyData: { month: string; won: number; created: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pl-PL", { month: "short" });
      const won = allDeals
        .filter(
          (deal) =>
            deal.closedAt &&
            deal.stage === "closed_won" &&
            deal.closedAt.startsWith(monthKey)
        )
        .reduce((sum, deal) => sum + deal.value, 0);
      const created = allDeals.filter((deal) =>
        deal.createdAt.startsWith(monthKey)
      ).length;
      monthlyData.push({ month: label, won, created });
    }

    // Contact sources breakdown
    const sourceBreakdown = allContacts.reduce<Record<string, number>>(
      (acc, contact) => {
        const source = contact.source ?? "other";
        acc[source] = (acc[source] ?? 0) + 1;
        return acc;
      },
      {}
    );

    // Activity completion rate
    const completedActivities = allActivities.filter(
      (a) => a.status === "completed"
    ).length;
    const completionRate =
      allActivities.length > 0
        ? Math.round((completedActivities / allActivities.length) * 100)
        : 0;

    // Top deals
    const topDeals = [...allDeals]
      .filter((d) => d.stage !== "closed_lost")
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Stage distribution
    const stageDistribution = allDeals.reduce<Record<string, number>>(
      (acc, deal) => {
        acc[deal.stage] = (acc[deal.stage] ?? 0) + 1;
        return acc;
      },
      {}
    );

    return {
      monthlyData,
      sourceBreakdown,
      completionRate,
      completedActivities,
      totalActivities: allActivities.length,
      topDeals,
      stageDistribution,
      avgDealValue:
        allDeals.length > 0
          ? Math.round(
              allDeals.reduce((sum, d) => sum + d.value, 0) / allDeals.length
            )
          : 0,
    };
  }),
});