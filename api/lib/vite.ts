import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(import.meta.dirname, "../dist/public");

  // Explicit favicon route
  app.get("/favicon.ico", (c) => {
    const filePath = path.resolve(distPath, "favicon.ico");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      return new Response(content, {
        headers: { "Content-Type": "image/x-icon", "Cache-Control": "public, max-age=86400" },
      });
    }
    return c.notFound();
  });

  app.use("*", serveStatic({ root: distPath }));

  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";
    if (!accept.includes("text/html")) {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.resolve(distPath, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}
