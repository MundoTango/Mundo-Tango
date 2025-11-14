import { pgTable, serial, varchar, text, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

export const platformAds = pgTable("platform_ads", {
  id: serial("id").primaryKey(),
  advertiser: varchar("advertiser", { length: 255 }).notNull(),
  adType: varchar("ad_type", { length: 50 }).notNull(), // banner, native, sponsored
  placement: varchar("placement", { length: 50 }).notNull(), // feed, events, housing, map, messages, profile
  imageUrl: text("image_url"),
  title: varchar("title", { length: 200 }),
  description: text("description"),
  ctaText: varchar("cta_text", { length: 50 }),
  targetUrl: text("target_url").notNull(),
  targeting: jsonb("targeting").$type<{
    roles?: string[];
    cities?: string[];
    countries?: string[];
    tiers?: string[];
  }>(),
  dailyBudget: integer("daily_budget"), // in cents
  cpmRate: integer("cpm_rate").notNull(), // cost per 1000 impressions in cents
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  placementIdx: index("platform_ads_placement_idx").on(table.placement),
  activeIdx: index("platform_ads_active_idx").on(table.isActive),
}));

export const adImpressions = pgTable("ad_impressions", {
  id: serial("id").primaryKey(),
  adId: integer("ad_id").notNull().references(() => platformAds.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  placement: varchar("placement", { length: 50 }).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow(),
  clicked: boolean("clicked").default(false),
  clickedAt: timestamp("clicked_at"),
}, (table) => ({
  adIdIdx: index("ad_impressions_ad_id_idx").on(table.adId),
  userIdIdx: index("ad_impressions_user_id_idx").on(table.userId),
  viewedAtIdx: index("ad_impressions_viewed_at_idx").on(table.viewedAt),
}));

export const adRevenue = pgTable("ad_revenue", {
  id: serial("id").primaryKey(),
  adId: integer("ad_id").notNull().references(() => platformAds.id, { onDelete: "cascade" }),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  revenue: integer("revenue").notNull(), // in cents
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  adIdDateIdx: index("ad_revenue_ad_id_date_idx").on(table.adId, table.date),
  dateIdx: index("ad_revenue_date_idx").on(table.date),
}));

// Insert schemas
export const insertPlatformAdSchema = createInsertSchema(platformAds, {
  advertiser: z.string().min(1, "Advertiser name is required"),
  adType: z.enum(["banner", "native", "sponsored"]),
  placement: z.enum(["feed", "events", "housing", "map", "messages", "profile"]),
  targetUrl: z.string().url("Must be a valid URL"),
  cpmRate: z.number().int().positive("CPM rate must be positive"),
  dailyBudget: z.number().int().positive().optional(),
  targeting: z.object({
    roles: z.array(z.string()).optional(),
    cities: z.array(z.string()).optional(),
    countries: z.array(z.string()).optional(),
    tiers: z.array(z.string()).optional(),
  }).optional(),
}).omit({ id: true, createdAt: true });

export const insertAdImpressionSchema = createInsertSchema(adImpressions, {
  adId: z.number().int().positive(),
  placement: z.string().min(1),
}).omit({ id: true, viewedAt: true });

export const insertAdRevenueSchema = createInsertSchema(adRevenue, {
  adId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  revenue: z.number().int(),
}).omit({ id: true, createdAt: true });

// Select schemas
export const selectPlatformAdSchema = createSelectSchema(platformAds);
export const selectAdImpressionSchema = createSelectSchema(adImpressions);
export const selectAdRevenueSchema = createSelectSchema(adRevenue);

// Types
export type PlatformAd = typeof platformAds.$inferSelect;
export type InsertPlatformAd = z.infer<typeof insertPlatformAdSchema>;
export type AdImpression = typeof adImpressions.$inferSelect;
export type InsertAdImpression = z.infer<typeof insertAdImpressionSchema>;
export type AdRevenue = typeof adRevenue.$inferSelect;
export type InsertAdRevenue = z.infer<typeof insertAdRevenueSchema>;
