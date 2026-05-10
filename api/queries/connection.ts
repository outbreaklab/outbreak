import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

function createMockDb(): any {
  const mockChain: any = {
    select: () => mockChain,
    from: () => mockChain,
    orderBy: () => mockChain,
    limit: (_n: number) => Promise.resolve([]),
    where: () => mockChain,
    insert: () => ({ values: () => Promise.resolve([{ insertId: 1 }]) }),
    then: (resolve: any) => resolve([]),
  };
  return mockChain;
}

export function getDb() {
  if (!instance) {
    if (!env.databaseUrl) {
      console.warn("[DB] DATABASE_URL not set, using mock database");
      return createMockDb();
    }
    // Support both PlanetScale (mysql2 URL) and standard Railway MySQL
    const pool = mysql.createPool(env.databaseUrl);
    instance = drizzle(pool, { schema: fullSchema, mode: "default" });
  }
  return instance;
}
