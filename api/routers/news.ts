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

async function fetchProMED(): Promise<any[]> {
  try {
    const res = await fetch("https://promedmail.org/feed/", { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const xml = await res.text();
    const items: any[] = [];
    for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
      const raw = match[1];
      const extract = (tag: string) =>
        raw.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`))?.[1] ??
        raw.match(new RegExp(`<${tag}>([^<]*)<\\/${tag}>`))?.[1] ??
        "";
      const link =
        raw.match(/<link>([^<]+)<\/link>/)?.[1] ??
        raw.match(/<guid[^>]*>([^<]+)<\/guid>/)?.[1] ??
        "";
      const title = extract("title").trim();
      const description = extract("description").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 250);
      const titleLow = title.toLowerCase();
      const severity =
        titleLow.includes("death") || titleLow.includes("fatal") ? "critical" :
        titleLow.includes("outbreak") || titleLow.includes("emerg") || titleLow.includes("alert") ? "high" :
        "medium";
      items.push({
        title,
        url: link.trim(),
        source: { name: "ProMED" },
        publishedAt: extract("pubDate").trim(),
        description,
        severity,
      });
    }
    return items.slice(0, 12);
  } catch {
    return [];
  }
}

async function fetchWHOnews(): Promise<any[]> {
  try {
    const res = await fetch(
      "https://www.who.int/feeds/entity/emergencies/disease-outbreak-news/en/rss.xml",
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return [];
    const xml = await res.text();
    const items: any[] = [];
    for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
      const raw = match[1];
      const extract = (tag: string) =>
        raw.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`))?.[1] ??
        raw.match(new RegExp(`<${tag}>([^<]*)<\\/${tag}>`))?.[1] ??
        "";
      const link =
        raw.match(/<link>([^<]+)<\/link>/)?.[1] ??
        raw.match(/<guid[^>]*>([^<]+)<\/guid>/)?.[1] ??
        "";
      const title = extract("title").trim();
      const description = extract("description").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 250);
      items.push({
        title,
        url: link.trim(),
        source: { name: "WHO DON" },
        publishedAt: extract("pubDate").trim(),
        description,
        severity: "high",
      });
    }
    return items.slice(0, 10);
  } catch {
    return [];
  }
}

export const newsRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(newsArticles).orderBy(desc(newsArticles.createdAt)).limit(50);
  }),

  fetchLatest: publicQuery.query(async () => {
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

    // Fetch ProMED + WHO DON in parallel (free, no key needed)
    const [promedArticles, whoArticles] = await Promise.all([fetchProMED(), fetchWHOnews()]);

    let newsApiArticles: any[] = [];
    let newsApiSuccess = false;

    try {
      const newsapi = getNewsApi();
      if (!newsapi) throw new Error("NewsAPI not configured");
      const response = await newsapi.v2.everything({
        q: "outbreak OR epidemic OR pandemic OR hantavirus OR ebola OR mpox OR dengue OR malaria OR \"infectious disease\" OR \"disease outbreak\" OR coronavirus OR zika OR cholera",
        language: "en",
        sortBy: "publishedAt",
        pageSize: 30,
        from: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
      });
      newsApiArticles = (response.articles || []).map((a: any) => {
        const titleLower = (a.title || "").toLowerCase();
        let severity = "medium";
        for (const [keyword, level] of Object.entries(severityKeywords)) {
          if (titleLower.includes(keyword)) { severity = level; break; }
        }
        return { ...a, severity };
      });
      newsApiSuccess = true;

      // Store in database (best effort)
      const db = getDb();
      for (const article of newsApiArticles.slice(0, 10)) {
        await db.insert(newsArticles).values({
          title: article.title || "Untitled",
          description: article.description || "",
          source: article.source?.name || "Unknown",
          author: article.author || null,
          url: article.url || "",
          imageUrl: article.urlToImage || null,
          severity: article.severity,
          publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
        }).catch(() => { /* ignore duplicates */ });
      }
    } catch { /* NewsAPI unavailable, use free sources */ }

    // Merge: NewsAPI first, then WHO DON, then ProMED; dedupe by URL
    const seen = new Set<string>();
    const merged: any[] = [];
    for (const a of [...newsApiArticles, ...whoArticles, ...promedArticles]) {
      const key = (a.url || a.link || a.title || "").trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(a);
    }

    const sources = [
      newsApiSuccess && "NewsAPI",
      whoArticles.length > 0 && "WHO DON",
      promedArticles.length > 0 && "ProMED",
    ].filter(Boolean).join(" + ");

    if (merged.length > 0) {
      return { success: true, count: merged.length, articles: merged.slice(0, 20), sources };
    }

    // Full fallback
    return {
      success: false,
      error: "All news sources unavailable",
      articles: [
        { title: "WHO reports surge in dengue cases across South America", source: { name: "WHO" }, severity: "high", publishedAt: "2026-05-08T14:30:00Z", description: "Dengue fever cases have increased dramatically across Brazil, Argentina, and Colombia in recent weeks." },
        { title: "Mpox clade Ib detected in new European cluster", source: { name: "Reuters" }, severity: "high", publishedAt: "2026-05-07T10:15:00Z", description: "Health authorities in Germany and France report new mpox cases linked to recent travel from Central Africa." },
        { title: "ECDC warns of seasonal influenza spike across Europe", source: { name: "ECDC" }, severity: "medium", publishedAt: "2026-05-06T16:45:00Z", description: "European CDC reports above-average influenza activity in 12 member states." },
        { title: "Cholera outbreak declared in Eastern Africa", source: { name: "ProMED" }, severity: "critical", publishedAt: "2026-05-05T08:20:00Z", description: "Malawi and Mozambique report rapidly expanding cholera outbreak affecting thousands." },
        { title: "Marburg virus case confirmed in Tanzania", source: { name: "BBC" }, severity: "critical", publishedAt: "2026-05-04T12:00:00Z", description: "A single case of Marburg virus disease has been confirmed with contact tracing underway." },
        { title: "H5N1 avian influenza spread concerns agricultural sector", source: { name: "The Guardian" }, severity: "high", publishedAt: "2026-05-03T09:30:00Z", description: "Bird flu detected in multiple poultry farms across the United States and Canada." },
        { title: "Zika virus resurgence detected in Southeast Asia", source: { name: "Science Magazine" }, severity: "medium", publishedAt: "2026-05-02T11:00:00Z", description: "Local transmission of Zika virus confirmed in Thailand and Vietnam after years of absence." },
        { title: "Malaria elimination program faces setback in West Africa", source: { name: "CNN" }, severity: "medium", publishedAt: "2026-05-01T15:20:00Z", description: "Drug-resistant malaria strains emerging in Ghana and Nigeria concern public health officials." },
      ],
      source: "fallback",
      sources: "fallback",
    };
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
