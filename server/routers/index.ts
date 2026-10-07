import { router } from "@/server/trpc";
import { contactsRouter } from "./contacts";
import { companiesRouter } from "./companies";
import { dealsRouter } from "./deals";
import { activitiesRouter } from "./activities";
import { dashboardRouter } from "./dashboard";
import { searchRouter } from "./search";

export const appRouter = router({
  contacts: contactsRouter,
  companies: companiesRouter,
  deals: dealsRouter,
  activities: activitiesRouter,
  dashboard: dashboardRouter,
  search: searchRouter,
});

export type AppRouter = typeof appRouter;