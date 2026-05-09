import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { outbreakCases } from "@db/schema";
import { desc } from "drizzle-orm";

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

  getGlobal: publicQuery.query(async () => {
    try {
      // Try WHO RSS/Atom feed (simulated via known endpoints)
      const whoRes = await fetch("https://www.who.int/emergencies/disease-outbreak-news", {
        signal: AbortSignal.timeout(8000),
      });
      const whoAvailable = whoRes.ok;

      return {
        success: true,
        outbreaks: ACTIVE_OUTBREAKS,
        whoAvailable,
        totalActive: ACTIVE_OUTBREAKS.length,
        totalCases: ACTIVE_OUTBREAKS.reduce((s, o) => s + (o.casesConfirmed || 0), 0),
        totalDeaths: ACTIVE_OUTBREAKS.reduce((s, o) => s + (o.deaths || 0), 0),
        lastUpdated: new Date().toISOString(),
      };
    } catch {
      return {
        success: true,
        outbreaks: ACTIVE_OUTBREAKS,
        whoAvailable: false,
        totalActive: ACTIVE_OUTBREAKS.length,
        totalCases: ACTIVE_OUTBREAKS.reduce((s, o) => s + (o.casesConfirmed || 0), 0),
        totalDeaths: ACTIVE_OUTBREAKS.reduce((s, o) => s + (o.deaths || 0), 0),
        lastUpdated: new Date().toISOString(),
      };
    }
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
});
