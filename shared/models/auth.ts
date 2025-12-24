import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

// Session storage table for Replit Auth.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const replitSessions = pgTable(
  "replit_sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_replit_session_expire").on(table.expire)]
);

// Replit Auth user storage table.
// Links Replit OAuth users to the main users table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const replitAuthUsers = pgTable("replit_auth_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  linkedUserId: varchar("linked_user_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertReplitUser = typeof replitAuthUsers.$inferInsert;
export type ReplitUser = typeof replitAuthUsers.$inferSelect;
