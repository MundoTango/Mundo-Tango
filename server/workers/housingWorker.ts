/**
 * HOUSING AUTOMATION WORKER
 * Handles: Host home bookings, guest requests, reviews
 * Automations: A-HOUSING-01
 */

import { Worker, Job } from "bullmq";
import { storage } from "../storage";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

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

// Create Worker
const housingWorker = new Worker(
  "housing-automation",
  async (job: Job) => {
    try {
      switch (job.name) {
        case "booking-confirmation":
          await handleBookingConfirmation(job);
          break;
        default:
          console.error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      console.error(`[Housing Worker] Error:`, error);
      throw error;
    }
  },
  { connection }
);

housingWorker.on("completed", (job) => {
  console.log(`✅ Housing job ${job.id} completed`);
});

housingWorker.on("failed", (job, err) => {
  console.error(`❌ Housing job ${job?.id} failed:`, err.message);
});

console.log("🚀 Housing Automation Worker started");

export default housingWorker;
