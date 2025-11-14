/**
 * EVENT PARTICIPANT ROLES SCHEMAS - P0 #12
 * 10 event roles with permissions system
 */

import { pgTable, serial, integer, varchar, text, boolean, timestamp, jsonb, pgEnum, unique } from "drizzle-orm/pg-core";
import { users, events } from "./schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Event role enum - 10 specialized roles
export const eventRoleEnum = pgEnum('event_role', [
  'organizer',
  'co_organizer',
  'dj',
  'teacher',
  'performer',
  'photographer',
  'volunteer',
  'host',
  'sponsor',
  'attendee'
]);

// Event participation status
export const participantStatusEnum = pgEnum('participant_status', [
  'invited',
  'pending',
  'confirmed',
  'declined',
  'cancelled'
]);

// Event participants table with roles
export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: eventRoleEnum("role").notNull(),
  status: participantStatusEnum("status").default("confirmed").notNull(),
  
  // Permissions (role-based)
  canEditEvent: boolean("can_edit_event").default(false),
  canManageParticipants: boolean("can_manage_participants").default(false),
  canPostUpdates: boolean("can_post_updates").default(false),
  canViewAttendees: boolean("can_view_attendees").default(false),
  canManageTickets: boolean("can_manage_tickets").default(false),
  
  // Additional info
  notes: text("notes"), // Organizer notes about this participant
  customTitle: varchar("custom_title", { length: 100 }), // E.g., "Guest DJ from Berlin"
  displayOrder: integer("display_order").default(0), // For ordering in participant lists
  isPubliclyListed: boolean("is_publicly_listed").default(true), // Show on event page
  
  // Compensation (for paid roles)
  compensation: jsonb("compensation"), // { amount: 500, currency: 'USD', type: 'performance_fee' }
  
  // Timestamps
  invitedAt: timestamp("invited_at"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueParticipant: unique("unique_event_user_role").on(table.eventId, table.userId, table.role)
}));

// Event role invitations
export const eventRoleInvitations = pgTable("event_role_invitations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  inviterId: integer("inviter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  inviteeEmail: varchar("invitee_email", { length: 255 }).notNull(),
  inviteeUserId: integer("invitee_user_id").references(() => users.id, { onDelete: "cascade" }),
  role: eventRoleEnum("role").notNull(),
  message: text("message"), // Personal message from organizer
  status: varchar("status", { length: 20 }).default("pending"), // pending, accepted, declined, expired
  token: varchar("token", { length: 255 }).notNull().unique(), // Secure invitation token
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event updates (posted by organizers, DJs, etc.)
export const eventUpdates = pgTable("event_updates", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  authorId: integer("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  authorRole: eventRoleEnum("author_role").notNull(), // Which role is posting this update
  title: varchar("title", { length: 200 }),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").default(false),
  notifyAttendees: boolean("notify_attendees").default(false), // Send notification to all attendees
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertEventParticipantSchema = createInsertSchema(eventParticipants).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertEventRoleInvitationSchema = createInsertSchema(eventRoleInvitations).omit({ 
  id: true, 
  createdAt: true,
  acceptedAt: true 
});

export const insertEventUpdateSchema = createInsertSchema(eventUpdates).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Types
export type EventParticipant = typeof eventParticipants.$inferSelect;
export type InsertEventParticipant = z.infer<typeof insertEventParticipantSchema>;
export type EventRoleInvitation = typeof eventRoleInvitations.$inferSelect;
export type InsertEventRoleInvitation = z.infer<typeof insertEventRoleInvitationSchema>;
export type EventUpdate = typeof eventUpdates.$inferSelect;
export type InsertEventUpdate = z.infer<typeof insertEventUpdateSchema>;

// Role permissions configuration
export const EVENT_ROLE_PERMISSIONS = {
  organizer: {
    canEditEvent: true,
    canManageParticipants: true,
    canPostUpdates: true,
    canViewAttendees: true,
    canManageTickets: true,
  },
  co_organizer: {
    canEditEvent: true,
    canManageParticipants: true,
    canPostUpdates: true,
    canViewAttendees: true,
    canManageTickets: true,
  },
  dj: {
    canEditEvent: false,
    canManageParticipants: false,
    canPostUpdates: true,
    canViewAttendees: true,
    canManageTickets: false,
  },
  teacher: {
    canEditEvent: false,
    canManageParticipants: false,
    canPostUpdates: true,
    canViewAttendees: true,
    canManageTickets: false,
  },
  performer: {
    canEditEvent: false,
    canManageParticipants: false,
    canPostUpdates: true,
    canViewAttendees: false,
    canManageTickets: false,
  },
  photographer: {
    canEditEvent: false,
    canManageParticipants: false,
    canPostUpdates: true,
    canViewAttendees: true,
    canManageTickets: false,
  },
  volunteer: {
    canEditEvent: false,
    canManageParticipants: false,
    canPostUpdates: false,
    canViewAttendees: true,
    canManageTickets: false,
  },
  host: {
    canEditEvent: true,
    canManageParticipants: true,
    canPostUpdates: true,
    canViewAttendees: true,
    canManageTickets: true,
  },
  sponsor: {
    canEditEvent: false,
    canManageParticipants: false,
    canPostUpdates: true,
    canViewAttendees: false,
    canManageTickets: false,
  },
  attendee: {
    canEditEvent: false,
    canManageParticipants: false,
    canPostUpdates: false,
    canViewAttendees: false,
    canManageTickets: false,
  },
} as const;
