import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  int,
  float,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

// Outbreak cases table - stores real-time case data
export const outbreakCases = mysqlTable("outbreak_cases", {
  id: serial("id").primaryKey(),
  source: varchar("source", { length: 100 }).notNull(), // WHO, ECDC, ProMED, etc
  disease: varchar("disease", { length: 200 }).notNull(),
  location: varchar("location", { length: 300 }),
  country: varchar("country", { length: 100 }),
  casesConfirmed: int("cases_confirmed").default(0),
  casesSuspected: int("cases_suspected").default(0),
  deaths: int("deaths").default(0),
  cfr: float("cfr").default(0), // case fatality rate
  riskLevel: varchar("risk_level", { length: 50 }).default("low"),
  symptoms: text("symptoms"),
  transmission: varchar("transmission", { length: 200 }),
  sourceUrl: text("source_url"),
  rawData: json("raw_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// News articles table - stores fetched news
export const newsArticles = mysqlTable("news_articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  source: varchar("source", { length: 200 }),
  author: varchar("author", { length: 200 }),
  url: text("url").notNull(),
  imageUrl: text("image_url"),
  severity: varchar("severity", { length: 50 }).default("medium"),
  publishedAt: timestamp("published_at"),
  isAlert: boolean("is_alert").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Risk assessments table - AI-generated risk assessments
export const riskAssessments = mysqlTable("risk_assessments", {
  id: serial("id").primaryKey(),
  outbreakId: int("outbreak_id"),
  riskLevel: varchar("risk_level", { length: 50 }).notNull(),
  riskScore: float("risk_score").default(0),
  generalPublic: varchar("general_public", { length: 100 }),
  closeContacts: varchar("close_contacts", { length: 100 }),
  analysis: text("analysis"),
  recommendations: text("recommendations"),
  modelUsed: varchar("model_used", { length: 50 }).default("claude"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Telegram alerts log
export const telegramAlerts = mysqlTable("telegram_alerts", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  severity: varchar("severity", { length: 50 }).default("info"),
  sent: boolean("sent").default(true),
  response: text("response"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Ship tracking data
export const shipTracking = mysqlTable("ship_tracking", {
  id: serial("id").primaryKey(),
  vesselName: varchar("vessel_name", { length: 200 }),
  operator: varchar("operator", { length: 200 }),
  status: varchar("status", { length: 100 }),
  latitude: float("latitude"),
  longitude: float("longitude"),
  peopleOnboard: int("people_onboard"),
  symptomatic: int("symptomatic").default(0),
  evacuated: int("evacuated").default(0),
  inIcu: int("in_icu").default(0),
  destination: varchar("destination", { length: 200 }),
  eta: timestamp("eta"),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});
