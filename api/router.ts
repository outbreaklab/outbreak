import { createRouter, publicQuery } from "./middleware";
import { outbreakRouter } from "./routers/outbreak";
import { newsRouter } from "./routers/news";
import { gdeltRouter } from "./routers/gdelt";
import { aiRouter } from "./routers/ai";
import { telegramRouter } from "./routers/telegram";
import { shipRouter } from "./routers/ship";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  outbreak: outbreakRouter,
  news: newsRouter,
  gdelt: gdeltRouter,
  ai: aiRouter,
  telegram: telegramRouter,
  ship: shipRouter,
});

export type AppRouter = typeof appRouter;
