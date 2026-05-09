import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { newsArticles } from "@db/schema";
import { desc, sql } from "drizzle-orm";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const NewsAPI = require("newsapi");

function getNewsApi() {
  const key = process.env.NEWSAPI_KEY || "";
  if (!key) return null;
  return new NewsAPI(key);
}

export const newsRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(newsArticles).orderBy(desc(newsArticles.createdAt)).limit(50);
  }),

  fetchLatest: publicQuery.query(async () => {
    try {
      const newsapi = getNewsApi();
      if (!newsapi) throw new Error("NewsAPI not configured");
      const response = await newsapi.v2.everything({
        q: "outbreak OR epidemic OR pandemic OR hantavirus OR ebola OR mpox OR dengue OR malaria OR \"infectious disease\" OR \"disease outbreak\" OR coronavirus OR zika OR cholera",
        language: "en",
        sortBy: "publishedAt",
        pageSize: 30,
        from: new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0],
      });

      const articles = response.articles || [];

      // Store in database
      const db = getDb();
      const severityKeywords: Record<string, string> = {
        death: "critical",
        die: "critical",
        fatal: "critical",
        emergency: "high",
        quarantine: "high",
        confirmed: "medium",
        suspected: "medium",
        vaccine: "low",
        recovered: "low",
      };

      for (const article of articles.slice(0, 10)) {
        const titleLower = (article.title || "").toLowerCase();
        let severity = "medium";
        for (const [keyword, level] of Object.entries(severityKeywords)) {
          if (titleLower.includes(keyword)) {
            severity = level;
            break;
          }
        }

        await db.insert(newsArticles).values({
          title: article.title || "Untitled",
          description: article.description || "",
          source: article.source?.name || "Unknown",
          author: article.author || null,
          url: article.url || "",
          imageUrl: article.urlToImage || null,
          severity,
          publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
        }).catch(() => { /* ignore duplicates */ });
      }

      return { success: true, count: articles.length, articles: articles.slice(0, 15) };
    } catch (error) {
      const mockArticles = [
        { title: "WHO reports surge in dengue cases across South America", source: "WHO", severity: "high", publishedAt: "2026-05-08T14:30:00Z", description: "Dengue fever cases have increased dramatically across Brazil, Argentina, and Colombia in recent weeks." },
        { title: "Mpox clade Ib detected in new European cluster", source: "Reuters", severity: "high", publishedAt: "2026-05-07T10:15:00Z", description: "Health authorities in Germany and France report new mpox cases linked to recent travel from Central Africa." },
        { title: "ECDC warns of seasonal influenza spike across Europe", source: "ECDC", severity: "medium", publishedAt: "2026-05-06T16:45:00Z", description: "European CDC reports above-average influenza activity in 12 member states." },
        { title: "Cholera outbreak declared in Eastern Africa", source: "ProMED", severity: "critical", publishedAt: "2026-05-05T08:20:00Z", description: "Malawi and Mozambique report rapidly expanding cholera outbreak affecting thousands." },
        { title: "Marburg virus case confirmed in Tanzania", source: "BBC", severity: "critical", publishedAt: "2026-05-04T12:00:00Z", description: "A single case of Marburg virus disease has been confirmed with contact tracing underway." },
        { title: "H5N1 avian influenza spread concerns agricultural sector", source: "The Guardian", severity: "high", publishedAt: "2026-05-03T09:30:00Z", description: "Bird flu detected in multiple poultry farms across the United States and Canada." },
        { title: "Zika virus resurgence detected in Southeast Asia", source: "Science Magazine", severity: "medium", publishedAt: "2026-05-02T11:00:00Z", description: "Local transmission of Zika virus confirmed in Thailand and Vietnam after years of absence." },
        { title: "Malaria elimination program faces setback in West Africa", source: "CNN", severity: "medium", publishedAt: "2026-05-01T15:20:00Z", description: "Drug-resistant malaria strains emerging in Ghana and Nigeria concern public health officials." },
      ];

      return {
        success: false,
        error: error instanceof Error ? error.message : "NewsAPI failed",
        articles: mockArticles,
        source: "fallback",
      };
    }
  }),

  search: publicQuery
    .input(z.object({ q: z.string() }))
    .query(async ({ input }) => {
      try {
        const newsapi = getNewsApi();
        if (!newsapi) throw new Error("NewsAPI not configured");
        const response = await newsapi.v2.everything({
          q: input.q,
          language: "en",
          sortBy: "publishedAt",
          pageSize: 20,
        });
        return { success: true, articles: response.articles || [] };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Search failed" };
      }
    }),

  getBySeverity: publicQuery
    .input(z.object({ severity: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(newsArticles)
        .where(sql`${newsArticles.severity} = ${input.severity}`)
        .orderBy(desc(newsArticles.createdAt))
        .limit(20);
    }),
});
