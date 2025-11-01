import { Router } from "express";
import type { IStorage } from "./storage";

export function createTalentMatchRoutes(storage: IStorage) {
  const router = Router();

  // ============================================================================
  // VOLUNTEER MANAGEMENT
  // ============================================================================

  // Create volunteer profile
  router.post("/volunteers", async (req, res) => {
    try {
      const { userId, profile, skills, availability, hoursPerWeek } = req.body;
      
      const volunteer = await storage.createVolunteer({
        userId,
        profile,
        skills,
        availability,
        hoursPerWeek
      });

      res.json(volunteer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get volunteer by ID
  router.get("/volunteers/:id", async (req, res) => {
    try {
      const volunteer = await storage.getVolunteerById(parseInt(req.params.id));
      if (!volunteer) {
        return res.status(404).json({ error: "Volunteer not found" });
      }
      res.json(volunteer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get volunteer by user ID
  router.get("/volunteers/user/:userId", async (req, res) => {
    try {
      const volunteer = await storage.getVolunteerByUserId(parseInt(req.params.userId));
      if (!volunteer) {
        return res.status(404).json({ error: "Volunteer not found" });
      }
      res.json(volunteer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // RESUME MANAGEMENT
  // ============================================================================

  // Upload resume
  router.post("/volunteers/:volunteerId/resume", async (req, res) => {
    try {
      const { filename, fileUrl, parsedText, links } = req.body;
      const volunteerId = parseInt(req.params.volunteerId);

      const resume = await storage.createResume({
        volunteerId,
        filename,
        fileUrl,
        parsedText,
        links
      });

      res.json(resume);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get resume by volunteer ID
  router.get("/volunteers/:volunteerId/resume", async (req, res) => {
    try {
      const resume = await storage.getResumeByVolunteerId(parseInt(req.params.volunteerId));
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }
      res.json(resume);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // AI CLARIFIER SESSIONS
  // ============================================================================

  // Start clarifier session
  router.post("/volunteers/:volunteerId/clarifier", async (req, res) => {
    try {
      const volunteerId = parseInt(req.params.volunteerId);
      
      const session = await storage.createClarifierSession({
        volunteerId,
        chatLog: [],
        detectedSignals: [],
        status: "active"
      });

      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add message to clarifier session
  router.post("/clarifier/:sessionId/message", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const { role, message } = req.body;

      const session = await storage.getClarifierSessionById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const chatLog = Array.isArray(session.chatLog) ? session.chatLog : [];
      chatLog.push({
        role,
        message,
        timestamp: new Date().toISOString()
      });

      const updated = await storage.updateClarifierSession(sessionId, { chatLog });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Complete clarifier session
  router.post("/clarifier/:sessionId/complete", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const { detectedSignals } = req.body;

      const updated = await storage.updateClarifierSession(sessionId, {
        detectedSignals,
        status: "completed",
        completedAt: new Date()
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get clarifier session
  router.get("/clarifier/:sessionId", async (req, res) => {
    try {
      const session = await storage.getClarifierSessionById(parseInt(req.params.sessionId));
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // TASK MANAGEMENT
  // ============================================================================

  // Get all tasks
  router.get("/tasks", async (req, res) => {
    try {
      const { status, domain } = req.query;
      const tasks = await storage.getAllTasks();
      
      let filtered = tasks;
      if (status) {
        filtered = filtered.filter(t => t.status === status);
      }
      if (domain) {
        filtered = filtered.filter(t => t.domain === domain);
      }

      res.json(filtered);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create task
  router.post("/tasks", async (req, res) => {
    try {
      const { title, description, domain, phase, estimatedHours, requiredSkills } = req.body;
      
      const task = await storage.createTask({
        title,
        description,
        domain,
        phase,
        estimatedHours,
        requiredSkills,
        status: "open"
      });

      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get task by ID
  router.get("/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getTaskById(parseInt(req.params.id));
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // TASK ASSIGNMENTS
  // ============================================================================

  // Create assignment (AI recommendation or manual)
  router.post("/assignments", async (req, res) => {
    try {
      const { volunteerId, taskId, matchReason } = req.body;
      
      const assignment = await storage.createAssignment({
        volunteerId,
        taskId,
        matchReason,
        status: "pending"
      });

      res.json(assignment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get assignments for volunteer
  router.get("/volunteers/:volunteerId/assignments", async (req, res) => {
    try {
      const assignments = await storage.getAssignmentsByVolunteerId(parseInt(req.params.volunteerId));
      res.json(assignments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Approve assignment
  router.post("/admin/assignments/:id/approve", async (req, res) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const { adminNotes } = req.body;

      const updated = await storage.updateAssignment(assignmentId, {
        status: "approved",
        adminNotes,
        approvedAt: new Date()
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Reject assignment
  router.post("/admin/assignments/:id/reject", async (req, res) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const { adminNotes } = req.body;

      const updated = await storage.updateAssignment(assignmentId, {
        status: "rejected",
        adminNotes,
        rejectedAt: new Date()
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get all pending assignments
  router.get("/admin/assignments/pending", async (req, res) => {
    try {
      const assignments = await storage.getPendingAssignments();
      res.json(assignments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // ESA AGENTS REGISTRY
  // ============================================================================

  // Get all agents
  router.get("/esa/agents", async (req, res) => {
    try {
      // Load from ESA.json
      const fs = await import("fs/promises");
      const path = await import("path");
      const esaPath = path.join(process.cwd(), "ESA.json");
      const esaData = JSON.parse(await fs.readFile(esaPath, "utf-8"));
      res.json(esaData.agents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get agent by ID
  router.get("/esa/agents/:id", async (req, res) => {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const esaPath = path.join(process.cwd(), "ESA.json");
      const esaData = JSON.parse(await fs.readFile(esaPath, "utf-8"));
      const agent = esaData.agents.find((a: any) => a.id === req.params.id);
      
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  router.get("/health", async (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      endpoints: {
        volunteers: "/api/v1/volunteers",
        tasks: "/api/v1/tasks",
        assignments: "/api/v1/assignments",
        clarifier: "/api/v1/clarifier",
        esa: "/api/v1/esa"
      }
    });
  });

  return router;
}
