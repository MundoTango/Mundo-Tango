// Test fixtures for events domain
import type { InsertEvent } from "@db/schema";

export const testEvents = {
  milonga: {
    name: "Friday Night Milonga",
    description: "Traditional milonga with live orchestra",
    date: new Date("2026-02-20T20:00:00Z"),
    endTime: new Date("2026-02-21T01:00:00Z"),
    cityId: 1,
    venueId: 1,
    organizerId: 1, // Will be set dynamically in tests
    eventType: "milonga",
    priceRange: "$15-25",
    isRecurring: false,
    status: "published",
  } as InsertEvent,

  workshop: {
    name: "Beginner Workshop Series",
    description: "8-week workshop for complete beginners",
    date: new Date("2026-03-01T18:00:00Z"),
    endTime: new Date("2026-03-01T20:00:00Z"),
    cityId: 1,
    venueId: 1,
    organizerId: 1,
    eventType: "workshop",
    priceRange: "$120 for series",
    isRecurring: true,
    status: "published",
  } as InsertEvent,

  festival: {
    name: "Spring Tango Festival",
    description: "Three-day festival with international maestros",
    date: new Date("2026-04-15T09:00:00Z"),
    endTime: new Date("2026-04-17T23:00:00Z"),
    cityId: 1,
    venueId: 1,
    organizerId: 1,
    eventType: "festival",
    priceRange: "$200-500",
    isRecurring: false,
    status: "published",
  } as InsertEvent,

  draft: {
    name: "Draft Event",
    description: "This event is not yet published",
    date: new Date("2026-05-01T20:00:00Z"),
    cityId: 1,
    organizerId: 1,
    eventType: "milonga",
    status: "draft",
  } as InsertEvent,
};
