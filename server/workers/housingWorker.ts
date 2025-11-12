/**
 * HOUSING AUTOMATION WORKER
 * Handles: Host home bookings, guest requests, reviews
 * Automations: A-HOUSING-01
 */

import { Job } from "bullmq";
import { storage } from "../storage";
import { createWorker } from "./redis-fallback";

// A-HOUSING-01: Booking Confirmation
async function handleBookingConfirmation(job: Job) {
  const { bookingId, hostId, guestId } = job.data;
  
  console.log(`[A-HOUSING-01] Processing booking ${bookingId}`);
  
  const host = await storage.getUserById(hostId);
  const guest = await storage.getUserById(guestId);
  
  if (!host || !guest) return;
  
  // Notify host
  await storage.createNotification({
    userId: hostId,
    type: "booking_request",
    title: "New Booking Request",
    message: `${guest.name} wants to book your place`,
    actionUrl: `/housing/bookings/${bookingId}`,
  });
  
  // Notify guest
  await storage.createNotification({
    userId: guestId,
    type: "booking_confirmation",
    title: "Booking Request Sent",
    message: `Your request has been sent to ${host.name}`,
    actionUrl: `/housing/bookings/${bookingId}`,
  });
  
  console.log(`[A-HOUSING-01] ✅ Booking notifications sent`);
}

// A-HOUSING-02: Availability Reminders
async function handleAvailabilityReminder(job: Job) {
  const { hostId, listingId } = job.data;
  
  console.log(`[A-HOUSING-02] Availability reminder for host ${hostId}`);
  
  await storage.createNotification({
    userId: hostId,
    type: "availability_reminder",
    title: "Update Your Availability 📅",
    message: "Keep your calendar current for upcoming tango events",
    actionUrl: `/housing/listings/${listingId}/calendar`,
  });
  
  console.log(`[A-HOUSING-02] ✅ Availability reminder sent`);
}

// A-HOUSING-03: Review Requests
async function handleReviewRequest(job: Job) {
  const { guestId, hostId, bookingId } = job.data;
  
  console.log(`[A-HOUSING-03] Review request for guest ${guestId}`);
  
  const host = await storage.getUserById(hostId);
  if (!host) return;
  
  await storage.createNotification({
    userId: guestId,
    type: "review_request",
    title: "Share Your Experience ⭐",
    message: `How was your stay with ${host.name}? Leave a review`,
    actionUrl: `/housing/bookings/${bookingId}/review`,
  });
  
  console.log(`[A-HOUSING-03] ✅ Review request sent`);
}

// A-HOUSING-04: Price Optimization Alerts
async function handlePriceOptimization(job: Job) {
  const { hostId, listingId, suggestedPrice, currentPrice } = job.data;
  
  console.log(`[A-HOUSING-04] Price optimization for host ${hostId}`);
  
  await storage.createNotification({
    userId: hostId,
    type: "price_optimization",
    title: "Optimize Your Pricing 💰",
    message: `Consider adjusting from $${currentPrice} to $${suggestedPrice} based on market demand`,
    actionUrl: `/housing/listings/${listingId}/pricing`,
  });
  
  console.log(`[A-HOUSING-04] ✅ Price optimization alert sent`);
}

// A-HOUSING-05: Search Alerts
async function handleSearchAlert(job: Job) {
  const { userId, cityName, newListingId } = job.data;
  
  console.log(`[A-HOUSING-05] Search alert for user ${userId}`);
  
  await storage.createNotification({
    userId,
    type: "search_alert",
    title: `New Listing in ${cityName}! 🏠`,
    message: "A new host home matching your saved search is available",
    actionUrl: `/housing/listings/${newListingId}`,
  });
  
  console.log(`[A-HOUSING-05] ✅ Search alert sent`);
}

// Create Worker with automatic Redis fallback
const housingWorker = createWorker(
  "housing-automation",
  async (job: Job<any, any, string>) => {
    try {
      switch (job.name) {
        case "booking-confirmation":
          await handleBookingConfirmation(job);
          break;
        case "availability-reminder":
          await handleAvailabilityReminder(job);
          break;
        case "review-request":
          await handleReviewRequest(job);
          break;
        case "price-optimization":
          await handlePriceOptimization(job);
          break;
        case "search-alert":
          await handleSearchAlert(job);
          break;
        default:
          console.error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      console.error(`[Housing Worker] Error:`, error);
      throw error;
    }
  }
);

if ('on' in housingWorker) {
  housingWorker.on("completed", (job: Job) => {
    console.log(`✅ Housing job ${job.id} completed`);
  });

  housingWorker.on("failed", (job: Job | undefined, err: Error) => {
    console.error(`❌ Housing job ${job?.id} failed:`, err.message);
  });
}

console.log("🚀 Housing Automation Worker started");

export default housingWorker;
