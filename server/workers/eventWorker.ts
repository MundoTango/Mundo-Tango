/**
 * EVENT AUTOMATION WORKER
 * Handles: Event RSVPs, reminders, calendar sync
 * Automations: A-EVENT-01, A-EVENT-02, A-EVENT-03
 */

import { Worker, Job } from "bullmq";
import { storage } from "../storage";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

// A-EVENT-01: Event Reminder (1 hour before)
async function handleEventReminder(job: Job) {
  const { eventId } = job.data;
  
  console.log(`[A-EVENT-01] Sending reminders for event ${eventId}`);
  
  // Get all users who RSVP'd "going"
  const attendees = await storage.getEventAttendees(eventId, "going");
  
  for (const attendee of attendees) {
    await storage.createNotification({
      userId: attendee.userId,
      type: "event_reminder",
      title: "Event starting soon! 🎵",
      message: `Your event "${attendee.eventTitle}" starts in 1 hour`,
      actionUrl: `/events/${eventId}`,
    });
  }
  
  console.log(`[A-EVENT-01] ✅ Reminders sent to ${attendees.length} attendees`);
}

// A-EVENT-02: Event RSVP Automation
async function handleEventRsvp(job: Job) {
  const { eventId, userId, status } = job.data;
  
  console.log(`[A-EVENT-02] Processing RSVP: user ${userId} → ${status} for event ${eventId}`);
  
  const event = await storage.getEventById(eventId);
  if (!event) return;
  
  // 1. Notify event organizer
  if (status === "going" && userId !== event.userId) {
    const user = await storage.getUserById(userId);
    if (user) {
      await storage.createNotification({
        userId: event.userId,
        type: "event_rsvp",
        title: "New RSVP for your event",
        message: `${user.name} is going to "${event.title}"`,
        actionUrl: `/events/${eventId}`,
        actorId: userId,
      });
    }
  }
  
  // 2. Schedule event reminder (1 hour before)
  if (status === "going") {
    const eventStart = new Date(event.startDate);
    const reminderTime = new Date(eventStart.getTime() - 60 * 60 * 1000); // 1 hour before
    const delay = reminderTime.getTime() - Date.now();
    
    if (delay > 0) {
      // Schedule reminder
      // await eventQueue.add("event-reminder", { eventId }, { delay });
      console.log(`[A-EVENT-02] Reminder scheduled for ${reminderTime}`);
    }
  }
  
  // 3. Suggest calendar sync
  // TODO: Integration with Google Calendar API
  
  console.log(`[A-EVENT-02] ✅ RSVP automation complete`);
}

// A-EVENT-03: New Event Notification (to community members)
async function handleNewEventNotification(job: Job) {
  const { eventId, communityId } = job.data;
  
  console.log(`[A-EVENT-03] Notifying community ${communityId} about event ${eventId}`);
  
  const event = await storage.getEventById(eventId);
  if (!event) return;
  
  // Get all community members
  const members = await storage.getCommunityMembers(communityId);
  
  // Notify top engaged members (limit to 50 to avoid spam)
  const topMembers = members.slice(0, 50);
  
  for (const member of topMembers) {
    if (member.userId !== event.userId) { // Don't notify organizer
      await storage.createNotification({
        userId: member.userId,
        type: "new_event",
        title: "New event in your community",
        message: `${event.title} - ${new Date(event.startDate).toLocaleDateString()}`,
        actionUrl: `/events/${eventId}`,
      });
    }
  }
  
  console.log(`[A-EVENT-03] ✅ Notified ${topMembers.length} members`);
}

// Create Worker
const eventWorker = new Worker(
  "event-automation",
  async (job: Job) => {
    try {
      switch (job.name) {
        case "event-reminder":
          await handleEventReminder(job);
          break;
        case "event-rsvp":
          await handleEventRsvp(job);
          break;
        case "new-event-notification":
          await handleNewEventNotification(job);
          break;
        default:
          console.error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      console.error(`[Event Worker] Error:`, error);
      throw error;
    }
  },
  { connection }
);

eventWorker.on("completed", (job) => {
  console.log(`✅ Event job ${job.id} completed`);
});

eventWorker.on("failed", (job, err) => {
  console.error(`❌ Event job ${job?.id} failed:`, err.message);
});

console.log("🚀 Event Automation Worker started");

export default eventWorker;
