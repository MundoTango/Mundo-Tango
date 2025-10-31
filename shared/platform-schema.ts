// PHASE 6: PLATFORM INDEPENDENCE - Database Schema
// Feature 1: Deployment Automation
// Created: October 31, 2025
// Following existing Drizzle patterns from shared/schema.ts

import { pgTable, serial, varchar, text, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { users } from "./schema";

// Table 1: Deployments
// Tracks all deployments to Vercel + Railway
export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Deployment metadata
  type: varchar("type", { length: 20 }).notNull(), // 'production' | 'preview' | 'rollback'
  status: varchar("status", { length: 20 }).notNull(), // 'pending' | 'building' | 'deploying' | 'success' | 'failed' | 'cancelled'
  
  // GitHub info
  gitCommitSha: varchar("git_commit_sha", { length: 40 }),
  gitBranch: varchar("git_branch", { length: 255 }).notNull(),
  gitCommitMessage: text("git_commit_message"),
  
  // Deployment URLs
  vercelUrl: text("vercel_url"),
  railwayUrl: text("railway_url"),
  vercelDeploymentId: varchar("vercel_deployment_id", { length: 255 }),
  railwayDeploymentId: varchar("railway_deployment_id", { length: 255 }),
  
  // Build logs
  buildLogs: text("build_logs"),
  errorMessage: text("error_message"),
  
  // Timing
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  durationSeconds: integer("duration_seconds"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("deployments_user_id_idx").on(table.userId),
  statusIdx: index("deployments_status_idx").on(table.status),
  typeIdx: index("deployments_type_idx").on(table.type),
  createdAtIdx: index("deployments_created_at_idx").on(table.createdAt),
}));

// Table 2: Platform Integrations
// Stores API keys and settings for Vercel, Railway, GitHub, etc.
export const platformIntegrations = pgTable("platform_integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Platform info
  platform: varchar("platform", { length: 50 }).notNull(), // 'vercel' | 'railway' | 'github'
  isActive: boolean("is_active").default(true),
  
  // Settings (encrypted API keys, tokens, etc.)
  settings: jsonb("settings").notNull().$type<{
    apiKey?: string;
    apiToken?: string;
    projectId?: string;
    organizationId?: string;
    webhookUrl?: string;
    [key: string]: any;
  }>(),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("platform_integrations_user_id_idx").on(table.userId),
  platformIdx: index("platform_integrations_platform_idx").on(table.platform),
  userPlatformUnique: index("platform_integrations_user_platform_idx").on(table.userId, table.platform),
}));

// Table 3: Environment Variables (for Feature 2: Secrets Management)
export const environmentVariables = pgTable("environment_variables", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Variable info
  key: varchar("key", { length: 255 }).notNull(),
  value: text("value").notNull(), // Encrypted with AES-256
  environment: varchar("environment", { length: 20 }).notNull(), // 'development' | 'preview' | 'production'
  
  // Platform sync status
  syncedToVercel: boolean("synced_to_vercel").default(false),
  syncedToRailway: boolean("synced_to_railway").default(false),
  lastSyncedAt: timestamp("last_synced_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("environment_variables_user_id_idx").on(table.userId),
  envIdx: index("environment_variables_environment_idx").on(table.environment),
  keyIdx: index("environment_variables_key_idx").on(table.key),
}));

// Types for TypeScript
export type Deployment = typeof deployments.$inferSelect;
export type InsertDeployment = typeof deployments.$inferInsert;

export type PlatformIntegration = typeof platformIntegrations.$inferSelect;
export type InsertPlatformIntegration = typeof platformIntegrations.$inferInsert;

export type EnvironmentVariable = typeof environmentVariables.$inferSelect;
export type InsertEnvironmentVariable = typeof environmentVariables.$inferInsert;
