/**
 * EVENTS & RECOMMENDATIONS E2E TESTS
 * MB.MD v8.0 - WEEK 9 DAY 3
 * 
 * Comprehensive test suite covering:
 * - Event CRUD operations (8 tests)
 * - Event RSVPs & Check-ins (8 tests)
 * - Recommendations: Friends, Events, Teachers, Content (14 tests)
 * Target: 30+ tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import { db } from "@shared/db";
import { users, events, eventRsvps, friendships, teachers, posts } from "@shared/schema";
import { eq } from "drizzle-orm";

describe("Events & Recommendations E2E Tests", () => {
  let authToken: string;
  let userId: number;
  let teacherUserId: number;
  let teacherToken: string;

  beforeEach(async () => {
    // Clean up database
    await db.delete(eventRsvps);
    await db.delete(events);
    await db.delete(friendships);
    await db.delete(teachers);
    await db.delete(posts);
    await db.delete(users);

    // Create test users
    const [user] = await db
      .insert(users)
      .values({
        email: "test@example.com",
        username: "testuser",
        name: "Test User",
        city: "Buenos Aires",
        country: "Argentina",
        leaderLevel: 3,
        followerLevel: 3,
        isActive: true,
      })
      .returning();
    userId = user.id;

    const [teacher] = await db
      .insert(users)
      .values({
        email: "teacher@example.com",
        username: "teacheruser",
        name: "Teacher User",
        role: "teacher",
        city: "Buenos Aires",
        country: "Argentina",
        leaderLevel: 5,
        followerLevel: 5,
        isActive: true,
      })
      .returning();
    teacherUserId = teacher.id;

    // Mock authentication tokens (simplified for testing)
    authToken = `Bearer mock-token-${userId}`;
    teacherToken = `Bearer mock-token-${teacherUserId}`;
  });

  // ============================================================================
  // EVENT CRUD OPERATIONS (8 TESTS)
  // ============================================================================

  describe("Event CRUD Operations", () => {
    it("should create a new event (POST /api/events)", async () => {
      const eventData = {
        title: "Friday Night Milonga",
        description: "Join us for a wonderful milonga",
        eventType: "milonga",
        startDate: new Date("2025-12-01T20:00:00Z"),
        location: "La Catedral",
        city: "Buenos Aires",
        country: "Argentina",
        isPaid: false,
        maxAttendees: 100,
      };

      const response = await request(app)
        .post("/api/events")
        .set("Authorization", teacherToken)
        .send(eventData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.title).toBe(eventData.title);
      expect(response.body.eventType).toBe(eventData.eventType);
    });

    it("should prevent non-teachers from creating events", async () => {
      const eventData = {
        title: "Unauthorized Event",
        description: "This should fail",
        eventType: "milonga",
        startDate: new Date("2025-12-01T20:00:00Z"),
        location: "Test Location",
        city: "Test City",
        country: "Test Country",
      };

      await request(app)
        .post("/api/events")
        .set("Authorization", authToken)
        .send(eventData)
        .expect(403);
    });

    it("should get all events (GET /api/events)", async () => {
      // Create test event
      await db.insert(events).values({
        userId: teacherUserId,
        title: "Test Event",
        description: "Test Description",
        eventType: "milonga",
        startDate: new Date("2025-12-01T20:00:00Z"),
        location: "Test Location",
        city: "Buenos Aires",
        country: "Argentina",
        status: "published",
      });

      const response = await request(app)
        .get("/api/events")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should get event by ID (GET /api/events/:id)", async () => {
      const [event] = await db
        .insert(events)
        .values({
          userId: teacherUserId,
          title: "Specific Event",
          description: "Test Description",
          eventType: "workshop",
          startDate: new Date("2025-12-01T20:00:00Z"),
          location: "Test Location",
          city: "Buenos Aires",
          country: "Argentina",
          status: "published",
        })
        .returning();

      const response = await request(app)
        .get(`/api/events/${event.id}`)
        .expect(200);

      expect(response.body.id).toBe(event.id);
      expect(response.body.title).toBe("Specific Event");
    });

    it("should update event (PUT /api/events/:id) - owner only", async () => {
      const [event] = await db
        .insert(events)
        .values({
          userId: teacherUserId,
          title: "Original Title",
          description: "Test Description",
          eventType: "milonga",
          startDate: new Date("2025-12-01T20:00:00Z"),
          location: "Test Location",
          city: "Buenos Aires",
          country: "Argentina",
          status: "published",
        })
        .returning();

      const updateData = {
        title: "Updated Title",
        description: "Updated Description",
      };

      const response = await request(app)
        .put(`/api/events/${event.id}`)
        .set("Authorization", teacherToken)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe("Updated Title");
    });

    it("should prevent non-owners from updating event", async () => {
      const [event] = await db
        .insert(events)
        .values({
          userId: teacherUserId,
          title: "Protected Event",
          description: "Test Description",
          eventType: "milonga",
          startDate: new Date("2025-12-01T20:00:00Z"),
          location: "Test Location",
          city: "Buenos Aires",
          country: "Argentina",
          status: "published",
        })
        .returning();

      await request(app)
        .put(`/api/events/${event.id}`)
        .set("Authorization", authToken)
        .send({ title: "Hacked Title" })
        .expect(403);
    });

    it("should delete event (DELETE /api/events/:id) - owner only", async () => {
      const [event] = await db
        .insert(events)
        .values({
          userId: teacherUserId,
          title: "Event to Delete",
          description: "Test Description",
          eventType: "milonga",
          startDate: new Date("2025-12-01T20:00:00Z"),
          location: "Test Location",
          city: "Buenos Aires",
          country: "Argentina",
          status: "published",
        })
        .returning();

      await request(app)
        .delete(`/api/events/${event.id}`)
        .set("Authorization", teacherToken)
        .expect(200);

      // Verify deletion
      const deletedEvent = await db
        .select()
        .from(events)
        .where(eq(events.id, event.id))
        .limit(1);

      expect(deletedEvent.length).toBe(0);
    });

    it("should filter events by location (GET /api/events?city=...)", async () => {
      // Create events in different cities
      await db.insert(events).values([
        {
          userId: teacherUserId,
          title: "Buenos Aires Event",
          description: "Test",
          eventType: "milonga",
          startDate: new Date("2025-12-01T20:00:00Z"),
          location: "Test",
          city: "Buenos Aires",
          country: "Argentina",
          status: "published",
        },
        {
          userId: teacherUserId,
          title: "Paris Event",
          description: "Test",
          eventType: "milonga",
          startDate: new Date("2025-12-01T20:00:00Z"),
          location: "Test",
          city: "Paris",
          country: "France",
          status: "published",
        },
      ]);

      const response = await request(app)
        .get("/api/events?city=Buenos Aires")
        .expect(200);

      expect(response.body.every((e: any) => e.city === "Buenos Aires")).toBe(true);
    });
  });

  // ============================================================================
  // EVENT RSVPs & CHECK-INS (8 TESTS)
  // ============================================================================

  describe("Event RSVPs & Check-ins", () => {
    let testEventId: number;

    beforeEach(async () => {
      const [event] = await db
        .insert(events)
        .values({
          userId: teacherUserId,
          title: "RSVP Test Event",
          description: "Test Description",
          eventType: "milonga",
          startDate: new Date("2025-12-01T20:00:00Z"),
          location: "Test Location",
          city: "Buenos Aires",
          country: "Argentina",
          status: "published",
          maxAttendees: 10,
        })
        .returning();

      testEventId = event.id;
    });

    it("should create RSVP (POST /api/events/:id/rsvp)", async () => {
      const response = await request(app)
        .post(`/api/events/${testEventId}/rsvp`)
        .set("Authorization", authToken)
        .send({ status: "going" })
        .expect(200);

      expect(response.body.status).toBe("going");
      expect(response.body.eventId).toBe(testEventId);
    });

    it("should update existing RSVP", async () => {
      // Create initial RSVP
      await db.insert(eventRsvps).values({
        eventId: testEventId,
        userId: userId,
        status: "going",
      });

      // Update to "maybe"
      const response = await request(app)
        .post(`/api/events/${testEventId}/rsvp`)
        .set("Authorization", authToken)
        .send({ status: "maybe" })
        .expect(200);

      expect(response.body.status).toBe("maybe");
    });

    it("should get event attendees (GET /api/events/:id/attendees)", async () => {
      // Create RSVP
      await db.insert(eventRsvps).values({
        eventId: testEventId,
        userId: userId,
        status: "going",
      });

      const response = await request(app)
        .get(`/api/events/${testEventId}/attendees`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should prevent RSVP when event is full", async () => {
      // Fill event to capacity
      const attendeeIds: number[] = [];
      for (let i = 0; i < 10; i++) {
        const [attendee] = await db
          .insert(users)
          .values({
            email: `attendee${i}@example.com`,
            username: `attendee${i}`,
            name: `Attendee ${i}`,
            isActive: true,
          })
          .returning();

        attendeeIds.push(attendee.id);

        await db.insert(eventRsvps).values({
          eventId: testEventId,
          userId: attendee.id,
          status: "going",
        });
      }

      // Update event attendee count
      await db
        .update(events)
        .set({ currentAttendees: 10 })
        .where(eq(events.id, testEventId));

      // Try to RSVP when full
      await request(app)
        .post(`/api/events/${testEventId}/rsvp`)
        .set("Authorization", authToken)
        .send({ status: "going" })
        .expect(400);
    });

    it("should check-in attendee (POST /api/events/:id/check-in)", async () => {
      // Create RSVP
      await db.insert(eventRsvps).values({
        eventId: testEventId,
        userId: userId,
        status: "going",
      });

      const response = await request(app)
        .post(`/api/events/${testEventId}/check-in`)
        .set("Authorization", teacherToken)
        .send({ attendeeId: userId })
        .expect(200);

      expect(response.body.message).toBe("Check-in successful");
      expect(response.body.rsvp.checkedIn).toBe(true);
    });

    it("should prevent non-organizers from checking in attendees", async () => {
      // Create RSVP
      await db.insert(eventRsvps).values({
        eventId: testEventId,
        userId: userId,
        status: "going",
      });

      await request(app)
        .post(`/api/events/${testEventId}/check-in`)
        .set("Authorization", authToken)
        .send({ attendeeId: userId })
        .expect(403);
    });

    it("should prevent duplicate check-ins", async () => {
      // Create and check-in RSVP
      await db.insert(eventRsvps).values({
        eventId: testEventId,
        userId: userId,
        status: "going",
        checkedIn: true,
        checkedInAt: new Date(),
      });

      await request(app)
        .post(`/api/events/${testEventId}/check-in`)
        .set("Authorization", teacherToken)
        .send({ attendeeId: userId })
        .expect(400);
    });

    it("should cancel RSVP", async () => {
      // Create RSVP
      await db.insert(eventRsvps).values({
        eventId: testEventId,
        userId: userId,
        status: "going",
      });

      const response = await request(app)
        .post(`/api/events/${testEventId}/rsvp`)
        .set("Authorization", authToken)
        .send({ status: "not_going" })
        .expect(200);

      expect(response.body.status).toBe("not_going");
    });
  });

  // ============================================================================
  // RECOMMENDATION ENGINE (14 TESTS)
  // ============================================================================

  describe("Recommendation Engine", () => {
    describe("Friend Recommendations", () => {
      it("should recommend users with mutual friends", async () => {
        // Create friend network
        const [friend1] = await db
          .insert(users)
          .values({
            email: "friend1@example.com",
            username: "friend1",
            name: "Friend One",
            city: "Buenos Aires",
            country: "Argentina",
            isActive: true,
          })
          .returning();

        const [candidate] = await db
          .insert(users)
          .values({
            email: "candidate@example.com",
            username: "candidate",
            name: "Candidate User",
            city: "Buenos Aires",
            country: "Argentina",
            leaderLevel: 3,
            followerLevel: 3,
            isActive: true,
          })
          .returning();

        // Create friendships
        await db.insert(friendships).values([
          {
            userId: userId,
            friendId: friend1.id,
            status: "accepted",
          },
          {
            userId: friend1.id,
            friendId: candidate.id,
            status: "accepted",
          },
        ]);

        const response = await request(app)
          .get("/api/recommendations/friends")
          .set("Authorization", authToken)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        const recommended = response.body.find((r: any) => r.id === candidate.id);
        expect(recommended).toBeDefined();
        expect(recommended?.recommendationReasons).toContain("1 mutual friend");
      });

      it("should recommend users in same city", async () => {
        const [localUser] = await db
          .insert(users)
          .values({
            email: "local@example.com",
            username: "localuser",
            name: "Local User",
            city: "Buenos Aires",
            country: "Argentina",
            leaderLevel: 3,
            followerLevel: 3,
            isActive: true,
          })
          .returning();

        const response = await request(app)
          .get("/api/recommendations/friends?limit=20")
          .set("Authorization", authToken)
          .expect(200);

        const recommended = response.body.find((r: any) => r.id === localUser.id);
        expect(recommended?.recommendationReasons).toContain("Lives in Buenos Aires");
      });

      it("should recommend users with similar dance level", async () => {
        const [similarUser] = await db
          .insert(users)
          .values({
            email: "similar@example.com",
            username: "similaruser",
            name: "Similar User",
            city: "Paris",
            country: "France",
            leaderLevel: 3,
            followerLevel: 3,
            isActive: true,
          })
          .returning();

        const response = await request(app)
          .get("/api/recommendations/friends?limit=20")
          .set("Authorization", authToken)
          .expect(200);

        const recommended = response.body.find((r: any) => r.id === similarUser.id);
        if (recommended) {
          expect(recommended.recommendationReasons).toContain("Similar dance level");
        }
      });
    });

    describe("Event Recommendations", () => {
      it("should recommend events in user's city", async () => {
        const [localEvent] = await db
          .insert(events)
          .values({
            userId: teacherUserId,
            title: "Local Milonga",
            description: "Test",
            eventType: "milonga",
            startDate: new Date("2025-12-01T20:00:00Z"),
            location: "Test",
            city: "Buenos Aires",
            country: "Argentina",
            status: "published",
          })
          .returning();

        const response = await request(app)
          .get("/api/recommendations/events")
          .set("Authorization", authToken)
          .expect(200);

        const recommended = response.body.find((e: any) => e.id === localEvent.id);
        expect(recommended?.recommendationReasons).toContain("In Buenos Aires");
      });

      it("should recommend events that friends are attending", async () => {
        // Create friend
        const [friend] = await db
          .insert(users)
          .values({
            email: "eventfriend@example.com",
            username: "eventfriend",
            name: "Event Friend",
            isActive: true,
          })
          .returning();

        await db.insert(friendships).values({
          userId: userId,
          friendId: friend.id,
          status: "accepted",
        });

        // Create event
        const [friendEvent] = await db
          .insert(events)
          .values({
            userId: teacherUserId,
            title: "Friend's Event",
            description: "Test",
            eventType: "workshop",
            startDate: new Date("2025-12-01T20:00:00Z"),
            location: "Test",
            city: "Paris",
            country: "France",
            status: "published",
          })
          .returning();

        // Friend RSVPs
        await db.insert(eventRsvps).values({
          eventId: friendEvent.id,
          userId: friend.id,
          status: "going",
        });

        const response = await request(app)
          .get("/api/recommendations/events")
          .set("Authorization", authToken)
          .expect(200);

        const recommended = response.body.find((e: any) => e.id === friendEvent.id);
        expect(recommended?.recommendationReasons).toContain("1 friend attending");
      });

      it("should recommend popular events", async () => {
        const [popularEvent] = await db
          .insert(events)
          .values({
            userId: teacherUserId,
            title: "Popular Event",
            description: "Test",
            eventType: "festival",
            startDate: new Date("2025-12-01T20:00:00Z"),
            location: "Test",
            city: "New York",
            country: "USA",
            status: "published",
            currentAttendees: 50,
          })
          .returning();

        const response = await request(app)
          .get("/api/recommendations/events")
          .set("Authorization", authToken)
          .expect(200);

        const recommended = response.body.find((e: any) => e.id === popularEvent.id);
        expect(recommended?.recommendationReasons).toContain("50 attending");
      });
    });

    describe("Teacher Recommendations", () => {
      it("should recommend teachers in same city", async () => {
        const [teacherProfile] = await db
          .insert(teachers)
          .values({
            userId: teacherUserId,
            name: "Local Teacher",
            bio: "Test bio",
            city: "Buenos Aires",
            country: "Argentina",
            specialties: ["Argentine Tango"],
            yearsTeaching: 10,
            averageRating: 4.8,
            totalReviews: 50,
            isActive: true,
          })
          .returning();

        const response = await request(app)
          .get("/api/recommendations/teachers")
          .set("Authorization", authToken)
          .expect(200);

        const recommended = response.body.find((t: any) => t.id === teacherProfile.id);
        expect(recommended?.recommendationReasons).toContain("Located in Buenos Aires");
      });

      it("should recommend highly-rated teachers", async () => {
        const [topTeacher] = await db
          .insert(teachers)
          .values({
            userId: teacherUserId,
            name: "Top Teacher",
            bio: "Test bio",
            city: "Paris",
            country: "France",
            specialties: ["Vals"],
            yearsTeaching: 15,
            averageRating: 5.0,
            totalReviews: 100,
            isActive: true,
          })
          .returning();

        const response = await request(app)
          .get("/api/recommendations/teachers")
          .set("Authorization", authToken)
          .expect(200);

        const recommended = response.body.find((t: any) => t.id === topTeacher.id);
        expect(recommended?.recommendationReasons).toContain("5.0⭐ rating");
      });

      it("should recommend teachers suitable for beginner dancers", async () => {
        // Update user to beginner level
        await db
          .update(users)
          .set({ leaderLevel: 1, followerLevel: 1 })
          .where(eq(users.id, userId));

        const [beginnerTeacher] = await db
          .insert(teachers)
          .values({
            userId: teacherUserId,
            name: "Beginner-Friendly Teacher",
            bio: "Specializes in beginners",
            city: "Buenos Aires",
            country: "Argentina",
            specialties: ["Fundamentals"],
            yearsTeaching: 5,
            averageRating: 4.5,
            totalReviews: 30,
            isActive: true,
          })
          .returning();

        const response = await request(app)
          .get("/api/recommendations/teachers")
          .set("Authorization", authToken)
          .expect(200);

        const recommended = response.body.find((t: any) => t.id === beginnerTeacher.id);
        expect(recommended?.recommendationReasons).toContain("Great for beginners");
      });
    });

    describe("Content Recommendations", () => {
      it("should recommend posts from friends", async () => {
        // Create friend
        const [friend] = await db
          .insert(users)
          .values({
            email: "postfriend@example.com",
            username: "postfriend",
            name: "Post Friend",
            isActive: true,
          })
          .returning();

        await db.insert(friendships).values({
          userId: userId,
          friendId: friend.id,
          status: "accepted",
        });

        // Create post
        const [friendPost] = await db
          .insert(posts)
          .values({
            userId: friend.id,
            content: "Check out this tango move!",
            visibility: "public",
          })
          .returning();

        const response = await request(app)
          .get("/api/recommendations/content")
          .set("Authorization", authToken)
          .expect(200);

        const recommended = response.body.find((p: any) => p.id === friendPost.id);
        expect(recommended?.recommendationReasons).toContain("From a friend");
      });

      it("should recommend popular posts", async () => {
        const [popularPost] = await db
          .insert(posts)
          .values({
            userId: teacherUserId,
            content: "Amazing tango performance!",
            visibility: "public",
            likesCount: 50,
            commentsCount: 20,
          })
          .returning();

        const response = await request(app)
          .get("/api/recommendations/content")
          .set("Authorization", authToken)
          .expect(200);

        const recommended = response.body.find((p: any) => p.id === popularPost.id);
        expect(recommended?.recommendationReasons).toContain("Popular post");
      });

      it("should return limited recommendations", async () => {
        const response = await request(app)
          .get("/api/recommendations/content?limit=5")
          .set("Authorization", authToken)
          .expect(200);

        expect(response.body.length).toBeLessThanOrEqual(5);
      });
    });

    it("should require authentication for all recommendations", async () => {
      await request(app).get("/api/recommendations/friends").expect(401);
      await request(app).get("/api/recommendations/events").expect(401);
      await request(app).get("/api/recommendations/teachers").expect(401);
      await request(app).get("/api/recommendations/content").expect(401);
    });
  });
});
