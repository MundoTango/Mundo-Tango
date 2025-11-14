/**
 * MESSAGE PLATFORM SCHEMAS - P0 #12-16
 * Unified inbox for MT + Gmail + Facebook + Instagram + WhatsApp
 */

import { pgTable, serial, integer, varchar, text, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Message channel enum
export const messageChannelEnum = pgEnum('message_channel', [
  'mt',
  'gmail',
  'facebook',
  'instagram',
  'whatsapp'
]);

// Connected channels table
export const connectedChannels = pgTable("connected_channels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channel: messageChannelEnum("channel").notNull(),
  accessToken: text("access_token"), // Encrypted
  refreshToken: text("refresh_token"), // Encrypted
  accountId: varchar("account_id", { length: 255 }), // External account ID
  accountName: varchar("account_name", { length: 255 }),
  config: jsonb("config"), // Channel-specific settings
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// External messages table
export const externalMessages = pgTable("external_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channel: messageChannelEnum("channel").notNull(),
  externalId: varchar("external_id", { length: 255 }).notNull().unique(),
  threadId: varchar("thread_id", { length: 255 }),
  from: varchar("from", { length: 255 }),
  to: varchar("to", { length: 255 }),
  subject: text("subject"),
  body: text("body"),
  htmlBody: text("html_body"),
  attachments: jsonb("attachments"), // Array of attachment objects
  isRead: boolean("is_read").default(false),
  isStarred: boolean("is_starred").default(false),
  labels: text("labels").array(),
  receivedAt: timestamp("received_at").notNull(),
  syncedAt: timestamp("synced_at").defaultNow(),
});

// Message templates table
export const messageTemplates = pgTable("message_templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  body: text("body").notNull(),
  channels: text("channels").array(), // Which channels this template can be used for
  variables: jsonb("variables"), // Template variables like {{name}}, {{eventName}}
  isPublic: boolean("is_public").default(false),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Message automations table
export const messageAutomations = pgTable("message_automations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  channel: messageChannelEnum("channel").notNull(),
  automationType: varchar("automation_type", { length: 30 }).notNull(), // auto_reply, template, scheduled, routing
  trigger: jsonb("trigger").notNull(), // Trigger conditions
  action: jsonb("action").notNull(), // What to do
  templateId: integer("template_id").references(() => messageTemplates.id),
  config: jsonb("config"), // Additional configuration
  isActive: boolean("is_active").default(true),
  lastRunAt: timestamp("last_run_at"),
  runCount: integer("run_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scheduled messages table
export const scheduledMessages = pgTable("scheduled_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channel: messageChannelEnum("channel").notNull(),
  to: varchar("to", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  body: text("body").notNull(),
  templateId: integer("template_id").references(() => messageTemplates.id),
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  status: varchar("status", { length: 20 }).default("pending"), // pending, sent, failed, cancelled
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertConnectedChannelSchema = createInsertSchema(connectedChannels).omit({ id: true, createdAt: true, updatedAt: true });
export const insertExternalMessageSchema = createInsertSchema(externalMessages).omit({ id: true, syncedAt: true });
export const insertMessageTemplateSchema = createInsertSchema(messageTemplates).omit({ id: true, createdAt: true, updatedAt: true, usageCount: true });
export const insertMessageAutomationSchema = createInsertSchema(messageAutomations).omit({ id: true, createdAt: true, updatedAt: true, lastRunAt: true, runCount: true });
export const insertScheduledMessageSchema = createInsertSchema(scheduledMessages).omit({ id: true, createdAt: true, sentAt: true });

// Types
export type ConnectedChannel = typeof connectedChannels.$inferSelect;
export type InsertConnectedChannel = z.infer<typeof insertConnectedChannelSchema>;
export type ExternalMessage = typeof externalMessages.$inferSelect;
export type InsertExternalMessage = z.infer<typeof insertExternalMessageSchema>;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertMessageTemplate = z.infer<typeof insertMessageTemplateSchema>;
export type MessageAutomation = typeof messageAutomations.$inferSelect;
export type InsertMessageAutomation = z.infer<typeof insertMessageAutomationSchema>;
export type ScheduledMessage = typeof scheduledMessages.$inferSelect;
export type InsertScheduledMessage = z.infer<typeof insertScheduledMessageSchema>;
