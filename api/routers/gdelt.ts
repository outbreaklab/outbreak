import { createRouter, publicQuery } from "../middleware";

interface GdeltArticle {
  url: string;
  url_mobile: string;
  title: string;
  seendate: string;
  socialimage: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

export const gdeltRouter = createRouter({
  fetchOutbreaks: publicQuery.query(async () => {
    try {
      // GDELT v2 Doc API — free, no key needed
      const queries = [
        "disease outbreak",
        "epidemic",
        "hantavirus",
        "ebola",
        "mpox",
        "dengue",
        "malaria",
        "influenza pandemic",
      ];

      const allArticles: GdeltArticle[] = [];

      for (let i = 0; i < queries.slice(0, 2).length; i++) {
        const q = queries[i];
        const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(q)}&mode=ArtList&maxrecords=10&format=json`;
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        const text = await res.text();
        if (!res.ok || text.includes("Please limit")) {
          if (text.includes("Please limit")) {
            await new Promise((r) => setTimeout(r, 6000));
            // retry once
            const retry = await fetch(url, { signal: AbortSignal.timeout(15000) });
            const retryText = await retry.text();
            if (retry.ok && !retryText.includes("Please limit")) {
              try {
                const data = JSON.parse(retryText) as { articles?: GdeltArticle[] };
                allArticles.push(...(data.articles || []));
              } catch { /* ignore parse error */ }
            }
          }
          continue;
        }
        try {
          const data = JSON.parse(text) as { articles?: GdeltArticle[] };
          const articles = data.articles || [];
          allArticles.push(...articles);
        } catch { /* ignore parse error */ }
        if (i < queries.slice(0, 2).length - 1) {
          await new Promise((r) => setTimeout(r, 6000));
        }
      }

      // Deduplicate by URL
      const seen = new Set<string>();
      const unique = allArticles.filter((a) => {
        if (seen.has(a.url)) return false;
        seen.add(a.url);
        return true;
      });

      return {
        success: true,
        articles: unique.slice(0, 20).map((a) => ({
          title: a.title,
          url: a.url,
          source: a.domain,
          country: a.sourcecountry,
          image: a.socialimage || "",
          date: a.seendate,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "GDELT fetch failed",
        articles: [],
      };
    }
  }),

  geo: publicQuery.query(async () => {
    try {
      const url = `https://api.gdeltproject.org/api/v2/geo/geo?query=${encodeURIComponent("disease outbreak")}&format=GeoJSON`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error("GDELT geo API failed");
      const geojson = await res.json();
      return { success: true, geojson };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "GDELT geo failed",
      };
    }
  }),
});
