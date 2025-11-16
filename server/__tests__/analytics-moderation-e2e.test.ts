import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "../db";
import { 
  users, 
  analyticsEvents, 
  userAnalytics, 
  platformMetrics,
  moderationReports,
  moderationActions,
  userViolations
} from "@/shared/schema";
import { eq } from "drizzle-orm";
import request from "supertest";
import express from "express";
import analyticsRoutes from "../routes/analytics-moderation-routes";
import { authenticateToken } from "../middleware/auth";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use("/api", analyticsRoutes);

let testUser: any;
let adminUser: any;
let userToken: string;
let adminToken: string;

beforeAll(async () => {
  // Create test users
  const [user] = await db.insert(users).values({
    name: "Test User",
    username: "testuser",
    email: "test@example.com",
    password: "hashedpassword",
    role: "user",
  }).returning();
  testUser = user;

  const [admin] = await db.insert(users).values({
    name: "Admin User",
    username: "adminuser",
    email: "admin@example.com",
    password: "hashedpassword",
    role: "admin",
  }).returning();
  adminUser = admin;

  // Generate tokens
  userToken = jwt.sign({ userId: testUser.id }, process.env.JWT_SECRET || "test-secret");
  adminToken = jwt.sign({ userId: adminUser.id }, process.env.JWT_SECRET || "test-secret");
});

afterAll(async () => {
  // Cleanup
  await db.delete(analyticsEvents).where(eq(analyticsEvents.userId, testUser.id));
  await db.delete(moderationReports).where(eq(moderationReports.reporterId, testUser.id));
  await db.delete(users).where(eq(users.id, testUser.id));
  await db.delete(users).where(eq(users.id, adminUser.id));
});

describe("Analytics System E2E Tests", () => {
  describe("Event Tracking", () => {
    it("should track a user event", async () => {
      const response = await request(app)
        .post("/api/analytics/track")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          eventType: "page_view",
          metadata: { page: "/feed" },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify event was created
      const events = await db
        .select()
        .from(analyticsEvents)
        .where(eq(analyticsEvents.userId, testUser.id));
      
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].eventType).toBe("page_view");
    });

    it("should track multiple event types", async () => {
      const eventTypes = ["post_created", "post_liked", "event_rsvp", "page_view"];
      
      for (const eventType of eventTypes) {
        await request(app)
          .post("/api/analytics/track")
          .set("Authorization", `Bearer ${userToken}`)
          .send({ eventType });
      }

      const events = await db
        .select()
        .from(analyticsEvents)
        .where(eq(analyticsEvents.userId, testUser.id));

      expect(events.length).toBeGreaterThanOrEqual(eventTypes.length);
    });

    it("should store event metadata", async () => {
      const metadata = { postId: 123, duration: 45 };
      
      await request(app)
        .post("/api/analytics/track")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          eventType: "post_view",
          metadata,
        });

      const events = await db
        .select()
        .from(analyticsEvents)
        .where(eq(analyticsEvents.userId, testUser.id));

      const event = events.find(e => e.eventType === "post_view");
      expect(event).toBeDefined();
      expect(event?.metadata).toMatchObject(metadata);
    });
  });

  describe("User Analytics", () => {
    it("should get user activity report", async () => {
      // Create some events first
      await db.insert(analyticsEvents).values([
        {
          userId: testUser.id,
          eventType: "post_created",
          metadata: {},
        },
        {
          userId: testUser.id,
          eventType: "post_liked",
          metadata: {},
        },
      ]);

      const response = await request(app)
        .get(`/api/analytics/user/${testUser.id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(testUser.id);
      expect(response.body.totalEvents).toBeGreaterThan(0);
      expect(response.body.eventTypes).toBeDefined();
    });

    it("should prevent non-admin users from viewing others' analytics", async () => {
      const response = await request(app)
        .get(`/api/analytics/user/${adminUser.id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it("should allow admins to view any user's analytics", async () => {
      const response = await request(app)
        .get(`/api/analytics/user/${testUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(testUser.id);
    });
  });

  describe("Admin Dashboard", () => {
    it("should get dashboard data for admins", async () => {
      const response = await request(app)
        .get("/api/analytics/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.metrics).toBeDefined();
      expect(response.body.metrics).toHaveProperty("dau");
      expect(response.body.metrics).toHaveProperty("mau");
    });

    it("should deny dashboard access to non-admins", async () => {
      const response = await request(app)
        .get("/api/analytics/dashboard")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it("should include user growth data", async () => {
      const response = await request(app)
        .get("/api/analytics/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.userGrowth).toBeDefined();
      expect(Array.isArray(response.body.userGrowth)).toBe(true);
    });
  });

  describe("Platform Metrics", () => {
    it("should get platform health metrics for admins", async () => {
      // Add some platform metrics
      await db.insert(platformMetrics).values([
        { metric: "api_latency", value: "150" },
        { metric: "error_rate", value: "0.5" },
        { metric: "throughput", value: "1000" },
      ]);

      const response = await request(app)
        .get("/api/analytics/platform")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.metrics).toBeDefined();
    });

    it("should deny platform metrics to non-admins", async () => {
      const response = await request(app)
        .get("/api/analytics/platform")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("Cohort Analysis", () => {
    it("should get cohort data for admins", async () => {
      const response = await request(app)
        .get("/api/analytics/cohorts")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.cohorts).toBeDefined();
      expect(Array.isArray(response.body.cohorts)).toBe(true);
    });

    it("should deny cohort analysis to non-admins", async () => {
      const response = await request(app)
        .get("/api/analytics/cohorts")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
});

describe("Content Moderation System E2E Tests", () => {
  describe("Content Reporting", () => {
    it("should allow users to report content", async () => {
      const response = await request(app)
        .post("/api/moderation/report")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          contentType: "post",
          contentId: 123,
          reason: "Inappropriate content",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.reportId).toBeDefined();
    });

    it("should create a pending moderation report", async () => {
      await request(app)
        .post("/api/moderation/report")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          contentType: "comment",
          contentId: 456,
          reason: "Spam",
        });

      const reports = await db
        .select()
        .from(moderationReports)
        .where(eq(moderationReports.reporterId, testUser.id));

      expect(reports.length).toBeGreaterThan(0);
      const report = reports.find(r => r.contentType === "comment");
      expect(report?.status).toBe("pending");
    });
  });

  describe("Moderation Queue", () => {
    it("should show pending reports to admins", async () => {
      const response = await request(app)
        .get("/api/moderation/queue")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.reports).toBeDefined();
      expect(Array.isArray(response.body.reports)).toBe(true);
    });

    it("should deny moderation queue access to non-admins", async () => {
      const response = await request(app)
        .get("/api/moderation/queue")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("Moderation Actions", () => {
    it("should allow admins to take moderation action", async () => {
      // Create a report first
      const [report] = await db.insert(moderationReports).values({
        reporterId: testUser.id,
        contentType: "post",
        contentId: 789,
        reason: "Violation",
        status: "pending",
      }).returning();

      const response = await request(app)
        .post("/api/moderation/action")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          reportId: report.id,
          actionType: "remove",
          targetId: 789,
          targetType: "post",
          reason: "Content violates community guidelines",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should deny moderation actions to non-admins", async () => {
      const response = await request(app)
        .post("/api/moderation/action")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          actionType: "ban",
          targetId: 999,
          targetType: "user",
          reason: "Test",
        });

      expect(response.status).toBe(403);
    });

    it("should update report status after action", async () => {
      const [report] = await db.insert(moderationReports).values({
        reporterId: testUser.id,
        contentType: "post",
        contentId: 999,
        reason: "Test report",
        status: "pending",
      }).returning();

      await request(app)
        .post("/api/moderation/action")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          reportId: report.id,
          actionType: "remove",
          targetId: 999,
          targetType: "post",
          reason: "Confirmed violation",
        });

      const updatedReport = await db.query.moderationReports.findFirst({
        where: eq(moderationReports.id, report.id),
      });

      expect(updatedReport?.status).toBe("resolved");
      expect(updatedReport?.resolvedBy).toBe(adminUser.id);
    });
  });

  describe("Content Violation Detection", () => {
    it("should detect profanity in content", async () => {
      const response = await request(app)
        .post("/api/moderation/check")
        .send({
          content: "This is a fucking bad post",
        });

      expect(response.status).toBe(200);
      expect(response.body.clean).toBe(false);
      expect(response.body.violations).toContain("profanity");
    });

    it("should detect spam patterns", async () => {
      const response = await request(app)
        .post("/api/moderation/check")
        .send({
          content: "Click here now! Buy now! Limited time offer! $$$",
        });

      expect(response.status).toBe(200);
      expect(response.body.clean).toBe(false);
      expect(response.body.violations).toContain("spam");
    });

    it("should detect excessive capitalization", async () => {
      const response = await request(app)
        .post("/api/moderation/check")
        .send({
          content: "THIS IS ALL CAPS AND VERY ANNOYING TO READ",
        });

      expect(response.status).toBe(200);
      expect(response.body.clean).toBe(false);
      expect(response.body.violations).toContain("excessive_caps");
    });

    it("should mark clean content as safe", async () => {
      const response = await request(app)
        .post("/api/moderation/check")
        .send({
          content: "This is a nice and friendly message about tango dancing.",
        });

      expect(response.status).toBe(200);
      expect(response.body.clean).toBe(true);
      expect(response.body.violations.length).toBe(0);
    });
  });

  describe("User Banning & Violations", () => {
    it("should create violation and ban user", async () => {
      const [targetUser] = await db.insert(users).values({
        name: "Bad User",
        username: "baduser",
        email: "bad@example.com",
        password: "hashedpassword",
        role: "user",
        suspended: false,
      }).returning();

      const response = await request(app)
        .post("/api/moderation/action")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          actionType: "ban",
          targetId: targetUser.id,
          targetType: "user",
          reason: "Multiple violations",
        });

      expect(response.status).toBe(200);

      // Check violation was created
      const violations = await db
        .select()
        .from(userViolations)
        .where(eq(userViolations.userId, targetUser.id));

      expect(violations.length).toBeGreaterThan(0);

      // Check user was suspended
      const bannedUser = await db.query.users.findFirst({
        where: eq(users.id, targetUser.id),
      });

      expect(bannedUser?.suspended).toBe(true);

      // Cleanup
      await db.delete(userViolations).where(eq(userViolations.userId, targetUser.id));
      await db.delete(users).where(eq(users.id, targetUser.id));
    });
  });

  describe("Appeals System", () => {
    it("should get pending appeals for admins", async () => {
      // Create a violation with appeal
      await db.insert(userViolations).values({
        userId: testUser.id,
        violationType: "spam",
        severity: "medium",
        description: "Posted spam content",
        appealStatus: "pending",
        appealReason: "It was a mistake",
      });

      const response = await request(app)
        .get("/api/moderation/appeals")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.appeals).toBeDefined();
      expect(Array.isArray(response.body.appeals)).toBe(true);
      expect(response.body.appeals.length).toBeGreaterThan(0);
    });

    it("should deny appeals access to non-admins", async () => {
      const response = await request(app)
        .get("/api/moderation/appeals")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
});

describe("Admin Permissions Tests", () => {
  it("should require authentication for all endpoints", async () => {
    const endpoints = [
      { method: "post", path: "/api/analytics/track" },
      { method: "get", path: "/api/analytics/dashboard" },
      { method: "get", path: "/api/analytics/user/1" },
      { method: "get", path: "/api/analytics/platform" },
      { method: "post", path: "/api/moderation/report" },
      { method: "get", path: "/api/moderation/queue" },
    ];

    for (const endpoint of endpoints) {
      const response = await request(app)[endpoint.method](endpoint.path);
      expect(response.status).toBeGreaterThanOrEqual(401);
    }
  });

  it("should enforce admin-only endpoints", async () => {
    const adminEndpoints = [
      "/api/analytics/dashboard",
      "/api/analytics/platform",
      "/api/analytics/cohorts",
      "/api/moderation/queue",
      "/api/moderation/appeals",
    ];

    for (const endpoint of adminEndpoints) {
      const response = await request(app)
        .get(endpoint)
        .set("Authorization", `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
    }
  });
});
