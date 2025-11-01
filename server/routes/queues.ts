import { Router } from "express";
import { createQueue } from "../workers/redis-fallback";

// Initialize queues with automatic Redis fallback
const userLifecycleQueue = createQueue("user-lifecycle");
const socialQueue = createQueue("social-automation");
const eventQueue = createQueue("event-automation");
const lifeCeoQueue = createQueue("life-ceo-automation");
const housingQueue = createQueue("housing-automation");
const adminQueue = createQueue("admin-automation");

const router = Router();

// A-USER-01: Trigger new user welcome
router.post("/user-lifecycle/welcome", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await userLifecycleQueue.add("new-user-welcome", { userId });
    
    res.json({ 
      message: "Welcome workflow queued",
      job: "new-user-welcome",
      userId 
    });
  } catch (error: any) {
    console.error("Queue error:", error);
    res.status(500).json({ error: error.message });
  }
});

// A-USER-02: Trigger profile completion reminder
router.post("/user-lifecycle/profile-reminder", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await userLifecycleQueue.add("profile-completion-reminder", { userId });
    
    res.json({ 
      message: "Profile reminder queued",
      job: "profile-completion-reminder",
      userId 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Social automation triggers
router.post("/social/follow-notification", async (req, res) => {
  try {
    const { followerId, followedId } = req.body;
    await socialQueue.add("follow-notification", { followerId, followedId });
    res.json({ message: "Follow notification queued" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Event automation triggers
router.post("/events/reminder", async (req, res) => {
  try {
    const { eventId, userId } = req.body;
    await eventQueue.add("event-reminder", { eventId, userId });
    res.json({ message: "Event reminder queued" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Life CEO automation triggers
router.post("/life-ceo/daily-goal", async (req, res) => {
  try {
    const { userId } = req.body;
    await lifeCeoQueue.add("daily-goal-reminder", { userId });
    res.json({ message: "Daily goal reminder queued" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Health check for all queues
router.get("/health", async (req, res) => {
  try {
    const health = {
      userLifecycle: await userLifecycleQueue.getJobCounts(),
      social: await socialQueue.getJobCounts(),
      events: await eventQueue.getJobCounts(),
      lifeCeo: await lifeCeoQueue.getJobCounts(),
      housing: await housingQueue.getJobCounts(),
      admin: await adminQueue.getJobCounts(),
    };
    
    res.json({ status: "healthy", queues: health });
  } catch (error: any) {
    res.status(500).json({ status: "unhealthy", error: error.message });
  }
});

export default router;
