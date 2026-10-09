import { router, protectedProcedure } from "@/server/trpc";
import { db } from "@/db";
import { contacts } from "@/db/schema/contacts";
import { companies } from "@/db/schema/companies";
import { deals } from "@/db/schema/deals";
import { products } from "@/db/schema/products";
import { activities } from "@/db/schema/activities";
import { eq, and, or, like, desc } from "drizzle-orm";
import { z } from "zod";

// Universal search across all entities — the core enterprise CRM feature.
export const searchRouter = router({
  global: protectedProcedure
    .input(z.object({ query: z.string().min(1).max(100) }))
    .query(async ({ ctx, input }) => {
      const q = `%${input.query}%`;
      const uid = ctx.user.id;

      const [contactRows, companyRows, dealRows, productRows, activityRows] = await Promise.all([
        db
          .select({
            id: contacts.id,
            firstName: contacts.firstName,
            lastName: contacts.lastName,
            email: contacts.email,
          })
          .from(contacts)
          .where(
            and(
              eq(contacts.userId, uid),
              or(
                like(contacts.firstName, q),
                like(contacts.lastName, q),
                like(contacts.email, q)
              )
            )
          )
          .orderBy(desc(contacts.createdAt))
          .limit(5),
        db
          .select({ id: companies.id, name: companies.name, industry: companies.industry })
          .from(companies)
          .where(
            and(
              eq(companies.userId, uid),
              or(like(companies.name, q), like(companies.domain, q))
            )
          )
          .orderBy(desc(companies.createdAt))
          .limit(5),
        db
          .select({ id: deals.id, title: deals.title, value: deals.value, stage: deals.stage })
          .from(deals)
          .where(and(eq(deals.userId, uid), like(deals.title, q)))
          .orderBy(desc(deals.createdAt))
          .limit(5),
        db
          .select({ id: products.id, name: products.name, sku: products.sku, price: products.price })
          .from(products)
          .where(
            and(
              eq(products.userId, uid),
              or(like(products.name, q), like(products.sku, q))
            )
          )
          .orderBy(desc(products.createdAt))
          .limit(5),
        db
          .select({ id: activities.id, title: activities.title, type: activities.type })
          .from(activities)
          .where(and(eq(activities.userId, uid), like(activities.title, q)))
          .orderBy(desc(activities.createdAt))
          .limit(5),
      ]);

      return {
        contacts: contactRows.map((c) => ({
          id: c.id,
          label: `${c.firstName} ${c.lastName}`,
          sub: c.email ?? "",
          href: `/a/contacts/${c.id}`,
        })),
        companies: companyRows.map((c) => ({
          id: c.id,
          label: c.name,
          sub: c.industry ?? "",
          href: `/a/companies/${c.id}`,
        })),
        deals: dealRows.map((d) => ({
          id: d.id,
          label: d.title,
          sub: `${d.value.toLocaleString()} PLN`,
          href: `/a/deals/${d.id}`,
        })),
        products: productRows.map((p) => ({
          id: p.id,
          label: p.name,
          sub: p.sku ?? `${p.price.toLocaleString()} PLN`,
          href: `/a/products`,
        })),
        activities: activityRows.map((a) => ({
          id: a.id,
          label: a.title,
          sub: a.type,
          href: `/a/activities/${a.id}`,
        })),
      };
    }),
});
