import { router, protectedProcedure } from "@/server/trpc";
import { db } from "@/db";
import { contacts } from "@/db/schema/contacts";
import { companies } from "@/db/schema/companies";
import { deals } from "@/db/schema/deals";
import { eq, and, or, like, desc } from "drizzle-orm";
import { z } from "zod";

// Universal search across all entities — the core enterprise CRM feature.
export const searchRouter = router({
  global: protectedProcedure
    .input(z.object({ query: z.string().min(1).max(100) }))
    .query(async ({ ctx, input }) => {
      const q = `%${input.query}%`;
      const uid = ctx.user.id;

      const [contactRows, companyRows, dealRows] = await Promise.all([
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
      };
    }),
});
