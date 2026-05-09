import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { shipTracking } from "@db/schema";
import { desc } from "drizzle-orm";

export const shipRouter = createRouter({
  getCurrent: publicQuery.query(async () => {
    const db = getDb();
    const ships = await db.select().from(shipTracking).orderBy(desc(shipTracking.updatedAt)).limit(1);
    
    return ships[0] || {
      id: 1,
      vesselName: "MV Hondius",
      operator: "Oceanwide Expeditions",
      status: "En route to Tenerife",
      latitude: 28.05,
      longitude: -15.6,
      peopleOnboard: 150,
      symptomatic: 0,
      evacuated: 3,
      inIcu: 2,
      destination: "Tenerife, Canary Islands",
      eta: new Date(Date.now() + 2 * 86400000),
      updatedAt: new Date(),
    };
  }),

  update: publicQuery
    .input(
      z.object({
        vesselName: z.string(),
        status: z.string(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        peopleOnboard: z.number().optional(),
        symptomatic: z.number().optional(),
        evacuated: z.number().optional(),
        inIcu: z.number().optional(),
        destination: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(shipTracking).values(input);
      return { success: true, ...input };
    }),

  getRoute: publicQuery.query(() => {
    return [
      { lat: -54.8, lng: -68.3, name: "Ushuaia — Departure", date: "Apr 6" },
      { lat: -63.5, lng: -57, name: "Antarctic Peninsula", date: "Apr 10" },
      { lat: -54.3, lng: -36.7, name: "South Georgia", date: "Apr 18" },
      { lat: -37.1, lng: -12.3, name: "Tristan da Cunha", date: "Apr 22" },
      { lat: -16, lng: -5.7, name: "Saint Helena — 30 pax disembarked", date: "Apr 24" },
      { lat: 14.93, lng: -23.51, name: "Cape Verde — Evacuations", date: "May 4" },
      { lat: 28.05, lng: -15.6, name: "Tenerife — Quarantine ETA", date: "May 10" },
    ];
  }),
});
