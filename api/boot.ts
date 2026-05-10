import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

// Cron jobs: auto-sync news + AI hantavirus extraction
function startCronJobs() {
  const TEN_MINUTES   = 10 * 60 * 1000;
  const SIX_HOURS     = 6 * 60 * 60 * 1000;  // NewsAPI: max ~4 req/day (free plan = 100/day)
  const THIRTY_MINUTES = 30 * 60 * 1000;

  // Free sources (WHO DON RSS + ProMED) — no rate limit, run every 10 min
  setInterval(async () => {
    try {
      console.log("[CRON] Syncing WHO DON + ProMED (free sources)...");
      const caller = appRouter.createCaller({} as any);
      const result = await caller.outbreak.getGlobal();
      console.log(`[CRON] WHO DON synced — ${(result as any).whoAlerts?.length ?? 0} alerts, whoAvailable=${(result as any).whoAvailable}`);
    } catch (err) {
      console.error("[CRON] WHO DON sync failed:", err);
    }
  }, TEN_MINUTES);

  // NewsAPI — rate-limited: 100 req/day on free plan → run every 6 hours (4 req/day)
  setInterval(async () => {
    try {
      console.log("[CRON] Syncing NewsAPI (rate-limited, 6h interval)...");
      const caller = appRouter.createCaller({} as any);
      const result = await caller.news.fetchLatest();
      console.log(`[CRON] NewsAPI synced — ${(result as any).count ?? 0} articles (${(result as any).sources ?? 'unknown'})`);
    } catch (err) {
      console.error("[CRON] NewsAPI sync failed:", err);
    }
  }, SIX_HOURS);

  // AI hantavirus extraction every 30 minutes
  setInterval(async () => {
    try {
      console.log("[CRON] Running Claude AI hantavirus extraction...");
      const caller = appRouter.createCaller({} as any);
      const result = await caller.outbreak.autoExtract();
      if ((result as any).success) {
        const r = result as any;
        console.log(`[CRON] AI extraction complete — scanned ${r.articlesScanned} articles, found ${r.relevantFound} hantavirus articles, savedToDb=${r.savedToDb}`);
        if (r.extracted?.casesConfirmed != null) {
          console.log(`[CRON] Extracted: ${r.extracted.casesConfirmed} confirmed, ${r.extracted.deaths} deaths, ship="${r.extracted.shipStatus}"`);
        }
      } else {
        console.log(`[CRON] AI extraction: ${(result as any).reason}`);
      }
    } catch (err) {
      console.error("[CRON] AI extraction failed:", err);
    }
  }, THIRTY_MINUTES);

  // Initial syncs on startup — staggered to avoid hammering APIs at once
  setTimeout(async () => {
    try {
      console.log("[INIT] Initial NewsAPI sync...");
      const caller = appRouter.createCaller({} as any);
      const result = await caller.news.fetchLatest();
      console.log(`[INIT] NewsAPI sync complete — sources: ${(result as any).sources}`);
    } catch (err) {
      console.error("[INIT] NewsAPI sync failed:", err);
    }
  }, 5000);

  setTimeout(async () => {
    try {
      console.log("[INIT] Initial Claude AI hantavirus extraction...");
      const caller = appRouter.createCaller({} as any);
      const result = await caller.outbreak.autoExtract();
      console.log("[INIT] AI extraction:", (result as any).success ? "OK" : (result as any).reason);
    } catch (err) {
      console.error("[INIT] AI extraction failed:", err);
    }
  }, 15000);

  console.log("[CRON] Scheduled jobs started — WHO/ProMED: 10min, NewsAPI: 6h, AI extraction: 30min");
}

startCronJobs();
