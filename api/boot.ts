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

// Cron job: auto-sync data every 10 minutes
function startCronJobs() {
  const TEN_MINUTES = 10 * 60 * 1000;

  // News sync
  setInterval(async () => {
    try {
      console.log("[CRON] Syncing news...");
      const caller = appRouter.createCaller({} as any);
      await caller.news.fetchLatest();
      console.log("[CRON] News synced successfully");
    } catch (err) {
      console.error("[CRON] News sync failed:", err);
    }
  }, TEN_MINUTES);

  // Initial sync on startup
  setTimeout(async () => {
    try {
      console.log("[INIT] Running initial data sync...");
      const caller = appRouter.createCaller({} as any);
      await caller.news.fetchLatest();
      console.log("[INIT] Initial sync complete");
    } catch (err) {
      console.error("[INIT] Initial sync failed:", err);
    }
  }, 5000);

  console.log("[CRON] Scheduled jobs started (10-min interval)");
}

startCronJobs();
