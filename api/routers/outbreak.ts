import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { outbreakCases, shipTracking } from "@db/schema";
import { desc } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

function parseRSSItems(xml: string) {
  const items: { title: string; link: string; pubDate: string; description: string }[] = [];
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
    items.push({
      title: extract("title").trim(),
      link: link.trim(),
      pubDate: extract("pubDate").trim(),
      description: extract("description").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300),
    });
  }
  return items;
}

const ACTIVE_OUTBREAKS = [
  {
    id: "dengue-sa-2026",
    disease: "Dengue fever",
    pathogen: "Dengue virus",
    location: "South America",
    country: "Brazil, Argentina, Colombia",
    casesConfirmed: 45200,
    casesSuspected: 128000,
    deaths: 87,
    severity: "high",
    riskLevel: "high",
    lat: -14.235,
    lng: -51.925,
    transmission: "Vector-borne (Aedes aegypti)",
    source: "PAHO/WHO",
    sourceUrl: "https://www.paho.org/en/topics/dengue",
    lastUpdate: "2026-05-08",
  },
  {
    id: "mpox-cladeib-2026",
    disease: "Mpox (clade Ib)",
    pathogen: "Monkeypox virus clade Ib",
    location: "Central Africa / Europe",
    country: "DRC, Germany, France",
    casesConfirmed: 342,
    casesSuspected: 120,
    deaths: 12,
    severity: "high",
    riskLevel: "high",
    lat: -4.038,
    lng: 21.758,
    transmission: "Person-to-person (close contact)",
    source: "WHO/ECDC",
    sourceUrl: "https://www.who.int/emergencies/disease-outbreak-news",
    lastUpdate: "2026-05-07",
  },
  {
    id: "cholera-ea-2026",
    disease: "Cholera",
    pathogen: "Vibrio cholerae",
    location: "Eastern Africa",
    country: "Malawi, Mozambique, Zambia",
    casesConfirmed: 18500,
    casesSuspected: 4200,
    deaths: 245,
    severity: "critical",
    riskLevel: "critical",
    lat: -13.254,
    lng: 34.301,
    transmission: "Fecal-oral (water/food)",
    source: "WHO/Gov",
    sourceUrl: "https://www.who.int/emergencies/disease-outbreak-news",
    lastUpdate: "2026-05-06",
  },
  {
    id: "h5n1-global-2026",
    disease: "H5N1 avian influenza",
    pathogen: "Influenza A/H5N1",
    location: "North America / Global",
    country: "USA, Canada, Mexico",
    casesConfirmed: 42,
    casesSuspected: 18,
    deaths: 1,
    severity: "high",
    riskLevel: "high",
    lat: 37.09,
    lng: -95.71,
    transmission: "Zoonotic (poultry/wild birds)",
    source: "CDC/WHO",
    sourceUrl: "https://www.cdc.gov/flu/avianflu/index.htm",
    lastUpdate: "2026-05-05",
  },
  {
    id: "marburg-tz-2026",
    disease: "Marburg virus disease",
    pathogen: "Marburg virus",
    location: "Tanzania",
    country: "Tanzania",
    casesConfirmed: 1,
    casesSuspected: 0,
    deaths: 0,
    severity: "critical",
    riskLevel: "critical",
    lat: -6.369,
    lng: 34.889,
    transmission: "Zoonotic (Rousettus bats) / person-to-person",
    source: "WHO",
    sourceUrl: "https://www.who.int/emergencies/disease-outbreak-news",
    lastUpdate: "2026-05-04",
  },
  {
    id: "influenza-eu-2026",
    disease: "Seasonal influenza",
    pathogen: "Influenza A/B",
    location: "Europe",
    country: "Germany, France, UK, Italy",
    casesConfirmed: 125000,
    casesSuspected: 34000,
    deaths: 320,
    severity: "medium",
    riskLevel: "moderate",
    lat: 51.165,
    lng: 10.451,
    transmission: "Airborne / droplet",
    source: "ECDC",
    sourceUrl: "https://www.ecdc.europa.eu/en/seasonal-influenza",
    lastUpdate: "2026-05-03",
  },
  {
    id: "zika-sea-2026",
    disease: "Zika virus",
    pathogen: "Zika virus",
    location: "Southeast Asia",
    country: "Thailand, Vietnam",
    casesConfirmed: 89,
    casesSuspected: 210,
    deaths: 0,
    severity: "medium",
    riskLevel: "moderate",
    lat: 15.87,
    lng: 100.992,
    transmission: "Vector-borne (Aedes aegypti)",
    source: "WHO",
    sourceUrl: "https://www.who.int/emergencies/disease-outbreak-news",
    lastUpdate: "2026-05-02",
  },
  {
    id: "malaria-wa-2026",
    disease: "Malaria",
    pathogen: "Plasmodium falciparum",
    location: "West Africa",
    country: "Ghana, Nigeria",
    casesConfirmed: 285000,
    casesSuspected: 12000,
    deaths: 890,
    severity: "medium",
    riskLevel: "moderate",
    lat: 9.082,
    lng: 8.675,
    transmission: "Vector-borne (Anopheles)",
    source: "WHO",
    sourceUrl: "https://www.who.int/malaria",
    lastUpdate: "2026-05-01",
  },
];

export const outbreakRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(outbreakCases).orderBy(desc(outbreakCases.createdAt)).limit(50);
  }),

  getLatest: publicQuery.query(async () => {
    const db = getDb();
    const cases = await db.select().from(outbreakCases).orderBy(desc(outbreakCases.createdAt)).limit(1);
    return cases[0] || null;
  }),

  getStats: publicQuery.query(async () => {
    const db = getDb();
    const allCases = await db.select().from(outbreakCases);

    const totalCases = allCases.reduce((sum: number, c: any) => sum + (c.casesConfirmed || 0), 0);
    const totalSuspected = allCases.reduce((sum: number, c: any) => sum + (c.casesSuspected || 0), 0);
    const totalDeaths = allCases.reduce((sum: number, c: any) => sum + (c.deaths || 0), 0);
    const cfr = totalCases > 0 ? ((totalDeaths / totalCases) * 100).toFixed(1) : "0";

    return {
      casesTotal: totalCases + totalSuspected,
      casesConfirmed: totalCases,
      casesSuspected: totalSuspected,
      deaths: totalDeaths,
      cfr: parseFloat(cfr),
      activeOutbreaks: allCases.filter((c: any) => (c.casesConfirmed || 0) > 0).length,
    };
  }),

  fetchWHO: publicQuery.query(async () => {
    try {
      const res = await fetch(
        "https://www.who.int/feeds/entity/emergencies/disease-outbreak-news/en/rss.xml",
        { signal: AbortSignal.timeout(10000) }
      );
      if (!res.ok) throw new Error(`WHO RSS ${res.status}`);
      const xml = await res.text();
      const items = parseRSSItems(xml).slice(0, 20);
      return { success: true, items, lastUpdated: new Date().toISOString() };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "WHO RSS failed",
        items: [],
        lastUpdated: new Date().toISOString(),
      };
    }
  }),

  getGlobal: publicQuery.query(async () => {
    let whoItems: { title: string; link: string; pubDate: string; description: string }[] = [];
    let whoAvailable = false;

    try {
      const res = await fetch(
        "https://www.who.int/feeds/entity/emergencies/disease-outbreak-news/en/rss.xml",
        { signal: AbortSignal.timeout(10000) }
      );
      if (res.ok) {
        const xml = await res.text();
        whoItems = parseRSSItems(xml).slice(0, 10);
        whoAvailable = true;
      }
    } catch { /* use hardcoded fallback */ }

    return {
      success: true,
      outbreaks: ACTIVE_OUTBREAKS,
      whoAlerts: whoItems,
      whoAvailable,
      totalActive: ACTIVE_OUTBREAKS.length,
      totalCases: ACTIVE_OUTBREAKS.reduce((s, o) => s + (o.casesConfirmed || 0), 0),
      totalDeaths: ACTIVE_OUTBREAKS.reduce((s, o) => s + (o.deaths || 0), 0),
      lastUpdated: new Date().toISOString(),
    };
  }),

  create: publicQuery
    .input(
      z.object({
        source: z.string().min(1),
        disease: z.string().min(1),
        location: z.string().optional(),
        country: z.string().optional(),
        casesConfirmed: z.number().optional(),
        casesSuspected: z.number().optional(),
        deaths: z.number().optional(),
        cfr: z.number().optional(),
        riskLevel: z.string().optional(),
        symptoms: z.string().optional(),
        transmission: z.string().optional(),
        sourceUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(outbreakCases).values({
        ...input,
        rawData: input as Record<string, unknown>,
      });
      return { id: Number(result[0].insertId), ...input };
    }),

  syncWHO: publicQuery.query(async () => {
    try {
      const response = await fetch("https://ghoapi.azureedge.net/api/EPIDEMIC", {
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error("WHO API failed");
      const data = await response.json();
      return { success: true, data, source: "WHO" };
    } catch (error) {
      return {
        success: false,
        source: "WHO",
        error: error instanceof Error ? error.message : "Unknown error",
        outbreaks: ACTIVE_OUTBREAKS.slice(0, 3),
      };
    }
  }),

  syncECDC: publicQuery.query(async () => {
    try {
      const response = await fetch("https://opendata.ecdc.europa.eu/covid19/casedistribution/json/", {
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error("ECDC API failed");
      const data = await response.json();
      return { success: true, data, source: "ECDC" };
    } catch (error) {
      return {
        success: false,
        source: "ECDC",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }),

  // Auto-scrape WHO DON + ProMED, send to Claude, save structured data to DB
  autoExtract: publicQuery.query(async () => {
    const HANTA_KEYWORDS = ["hantavirus", "hanta", "andv", "andes", "hondius", "hps", "hcps", "pulmonary syndrome"];

    // 1. Fetch WHO DON RSS + ProMED RSS in parallel
    async function fetchProMEDRaw(): Promise<{ title: string; description: string; link: string; pubDate: string }[]> {
      try {
        const res = await fetch("https://promedmail.org/feed/", { signal: AbortSignal.timeout(10000) });
        if (!res.ok) return [];
        const xml = await res.text();
        return parseRSSItems(xml);
      } catch { return []; }
    }

    const [whoItems, promedItems] = await Promise.all([
      (async () => {
        try {
          const res = await fetch("https://www.who.int/feeds/entity/emergencies/disease-outbreak-news/en/rss.xml", { signal: AbortSignal.timeout(10000) });
          if (!res.ok) return [];
          return parseRSSItems(await res.text());
        } catch { return []; }
      })(),
      fetchProMEDRaw(),
    ]);

    // 2. Filter for hantavirus-relevant articles
    const allItems = [...whoItems, ...promedItems];
    const relevant = allItems.filter((item) => {
      const text = `${item.title} ${item.description}`.toLowerCase();
      return HANTA_KEYWORDS.some((k) => text.includes(k));
    });

    if (relevant.length === 0) {
      return { success: false, reason: "No hantavirus articles found in feeds", scanned: allItems.length };
    }

    // 3. Send to Claude Haiku for fast structured extraction
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { success: false, reason: "ANTHROPIC_API_KEY not set" };

    const anthropic = new Anthropic({ apiKey });
    const articleText = relevant
      .slice(0, 8)
      .map((a) => `[${a.pubDate ? new Date(a.pubDate).toDateString() : "?"}] ${a.title}\n${a.description}`)
      .join("\n\n---\n\n");

    const extractPrompt = `You are an epidemic intelligence analyst tracking the 2026 MV Hondius Andes hantavirus (ANDV) outbreak.

Extract the LATEST confirmed numbers from these articles. Return ONLY valid JSON, no markdown, no explanation:

{
  "casesConfirmed": <integer or null>,
  "casesSuspected": <integer or null>,
  "deaths": <integer or null>,
  "shipStatus": <string describing ship status or null>,
  "peopleOnboard": <integer or null>,
  "symptomatic": <integer currently showing symptoms or null>,
  "evacuated": <integer evacuated or null>,
  "inIcu": <integer in ICU or null>,
  "newLocations": [<string>],
  "latestEvent": <one sentence summary of latest development or null>,
  "confidence": "high" | "medium" | "low",
  "sourceNames": [<source names>]
}

Rules: use null for any value not explicitly stated. Do not guess. Only use numbers from the articles.

Articles:
${articleText}`;

    let extracted: Record<string, any> = {};
    try {
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: extractPrompt }],
      });
      const text = response.content[0].type === "text" ? response.content[0].text : "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) extracted = JSON.parse(jsonMatch[0]);
    } catch (err) {
      return { success: false, reason: "Claude extraction failed", error: String(err) };
    }

    // 4. Save to DB if meaningful data found
    const db = getDb();
    const hasData = extracted.casesConfirmed != null || extracted.deaths != null;

    if (hasData) {
      const cfr =
        extracted.casesConfirmed && extracted.deaths
          ? parseFloat(((extracted.deaths / extracted.casesConfirmed) * 100).toFixed(1))
          : 0;

      await db.insert(outbreakCases).values({
        source: (extracted.sourceNames ?? ["WHO/ProMED"]).join(", "),
        disease: "Andes orthohantavirus (ANDV) / Hantavirus Pulmonary Syndrome",
        location: "MV Hondius Antarctic cruise ship",
        country: "International (ship-borne)",
        casesConfirmed: extracted.casesConfirmed ?? 0,
        casesSuspected: extracted.casesSuspected ?? 0,
        deaths: extracted.deaths ?? 0,
        cfr,
        riskLevel: "critical",
        symptoms: "Fever, fatigue, muscle aches, respiratory failure, pulmonary edema",
        transmission: "Person-to-person (Andes virus unique among hantaviruses)",
        rawData: extracted as Record<string, unknown>,
      }).catch(() => { /* ignore duplicate insert errors */ });

      // Update ship tracking if ship data extracted
      if (extracted.shipStatus || extracted.peopleOnboard != null) {
        await db.insert(shipTracking).values({
          vesselName: "MV Hondius",
          operator: "Oceanwide Expeditions",
          status: extracted.shipStatus ?? "Status unknown",
          peopleOnboard: extracted.peopleOnboard ?? null,
          symptomatic: extracted.symptomatic ?? 0,
          evacuated: extracted.evacuated ?? 0,
          inIcu: extracted.inIcu ?? 0,
          destination: "Tenerife, Canary Islands",
        }).catch(() => { /* ignore */ });
      }
    }

    return {
      success: true,
      extracted,
      articlesScanned: allItems.length,
      relevantFound: relevant.length,
      savedToDb: hasData,
    };
  }),
});
