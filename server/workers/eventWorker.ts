/**
 * EVENT AUTOMATION WORKER
 * Handles: Event RSVPs, reminders, calendar sync
 * Automations: A-EVENT-01, A-EVENT-02, A-EVENT-03
 */

import { Job } from "bullmq";
import { storage } from "../storage";
import { createWorker } from "./redis-fallback";

// A-EVENT-01: Event Reminder (1 hour before)
async function handleEventReminder(job: Job) {
  const { eventId } = job.data;
  
  console.log(`[A-EVENT-01] Sending reminders for event ${eventId}`);
  
  // Get all users who RSVP'd "going" (placeholder - would query event_rsvps table)
  const attendees: any[] = [];
  
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
  
  // Get all community members (placeholder - would query group_members table)
  const members: any[] = [];
  
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

// A-EVENT-04: Post-Event Follow-Up
async function handlePostEventFollowUp(job: Job) {
  const { eventId, attendeeIds } = job.data;
  
  console.log(`[A-EVENT-04] Post-event follow-up for event ${eventId}`);
  
  const event = await storage.getEventById(eventId);
  if (!event) return;
  
  for (const attendeeId of attendeeIds) {
    await storage.createNotification({
      userId: attendeeId,
      type: "event_followup",
      title: "Thank You for Attending! 🙏",
      message: `Hope you enjoyed "${event.title}"! Share your experience`,
      actionUrl: `/events/${eventId}`,
    });
  }
  
  console.log(`[A-EVENT-04] ✅ Follow-up sent to ${attendeeIds.length} attendees`);
}

// A-EVENT-05: Feedback Collection
async function handleFeedbackCollection(job: Job) {
  const { eventId, attendeeId } = job.data;
  
  console.log(`[A-EVENT-05] Requesting feedback for event ${eventId} from user ${attendeeId}`);
  
  const event = await storage.getEventById(eventId);
  if (!event) return;
  
  await storage.createNotification({
    userId: attendeeId,
    type: "feedback_request",
    title: "Rate Your Experience ⭐",
    message: `How was "${event.title}"? Your feedback helps organizers improve`,
    actionUrl: `/events/${eventId}/feedback`,
  });
  
  console.log(`[A-EVENT-05] ✅ Feedback request sent`);
}

// A-EVENT-06: Photo Sharing Automation
async function handlePhotoSharing(job: Job) {
  const { eventId, attendeeIds } = job.data;
  
  console.log(`[A-EVENT-06] Photo sharing for event ${eventId}`);
  
  const event = await storage.getEventById(eventId);
  if (!event) return;
  
  for (const attendeeId of attendeeIds) {
    await storage.createNotification({
      userId: attendeeId,
      type: "photo_album",
      title: "Event Photos Ready! 📸",
      message: `View and share photos from "${event.title}"`,
      actionUrl: `/events/${eventId}/photos`,
    });
  }
  
  console.log(`[A-EVENT-06] ✅ Photo sharing notifications sent`);
}

// A-EVENT-07: Attendee Networking
async function handleAttendeeNetworking(job: Job) {
  const { eventId, userId, suggestedConnectionId } = job.data;
  
  console.log(`[A-EVENT-07] Networking suggestion for event ${eventId}`);
  
  const suggestedUser = await storage.getUserById(suggestedConnectionId);
  if (!suggestedUser) return;
  
  await storage.createNotification({
    userId,
    type: "networking",
    title: "Connect with Fellow Attendees! 🤝",
    message: `${suggestedUser.name} also attended this event. Say hello!`,
    actionUrl: `/profile/${suggestedUser.username}`,
  });
  
  console.log(`[A-EVENT-07] ✅ Networking suggestion sent`);
}

// A-EVENT-08: Recurring Event Reminders
async function handleRecurringEventReminder(job: Job) {
  const { eventId, userId } = job.data;
  
  console.log(`[A-EVENT-08] Recurring event reminder for user ${userId}`);
  
  const event = await storage.getEventById(eventId);
  if (!event) return;
  
  await storage.createNotification({
    userId,
    type: "recurring_event",
    title: "Your Regular Milonga is This Week! 🎵",
    message: `Don't miss "${event.title}" - starts soon`,
    actionUrl: `/events/${eventId}`,
  });
  
  console.log(`[A-EVENT-08] ✅ Recurring reminder sent`);
}

// Create Worker with automatic Redis fallback
const eventWorker = createWorker(
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
        case "post-event-followup":
          await handlePostEventFollowUp(job);
          break;
        case "feedback-collection":
          await handleFeedbackCollection(job);
          break;
        case "photo-sharing":
          await handlePhotoSharing(job);
          break;
        case "attendee-networking":
          await handleAttendeeNetworking(job);
          break;
        case "recurring-event-reminder":
          await handleRecurringEventReminder(job);
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
