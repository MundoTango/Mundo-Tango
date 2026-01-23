/**
 * Database Connection Core
 * Centralized database connection for all repositories
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create Neon SQL client
export const sql = neon(process.env.DATABASE_URL);

// Create Drizzle instance
export const db = drizzle(sql);
