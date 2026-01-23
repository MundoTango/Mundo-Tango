// Test fixtures for users domain
import type { InsertUser } from "@db/schema";

export const testUsers = {
  alice: {
    email: "alice@example.com",
    username: "alice_tango",
    fullName: "Alice Wonderland",
    hashedPassword: "$2a$10$test.hash.for.testing.only",
    emailVerified: true,
    role: "user",
    cityId: 1,
    tangoRole: "follower",
    experienceLevel: "intermediate",
  } as InsertUser,

  bob: {
    email: "bob@example.com",
    username: "bob_dancer",
    fullName: "Bob Builder",
    hashedPassword: "$2a$10$test.hash.for.testing.only",
    emailVerified: true,
    role: "user",
    cityId: 1,
    tangoRole: "leader",
    experienceLevel: "advanced",
  } as InsertUser,

  unverified: {
    email: "unverified@example.com",
    username: "unverified_user",
    fullName: "Unverified User",
    hashedPassword: "$2a$10$test.hash.for.testing.only",
    emailVerified: false,
    role: "user",
    cityId: 1,
  } as InsertUser,

  admin: {
    email: "admin@mundotango.com",
    username: "admin",
    fullName: "Admin User",
    hashedPassword: "$2a$10$test.hash.for.testing.only",
    emailVerified: true,
    role: "admin",
    cityId: 1,
  } as InsertUser,
};
