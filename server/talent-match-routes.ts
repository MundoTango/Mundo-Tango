import { Router } from "express";
import type { IStorage } from "./storage";
import { resumeParser } from "./services/resume-parser";
import { detectSkillSignals, matchVolunteerToTasks, generateClarifierQuestions } from "./algorithms/signal-detection";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

  // Upload resume with AI parsing
  router.post("/volunteers/:volunteerId/resume", async (req, res) => {
    try {
      const { filename, fileBuffer, fileUrl } = req.body;
      const volunteerId = parseInt(req.params.volunteerId);

      let parsedText = "";
      let skills: string[] = [];
      let links: string[] = [];
      let signals: string[] = [];

      if (fileBuffer) {
        const buffer = Buffer.from(fileBuffer, "base64");
        const parsed = await resumeParser.parseResume(buffer, filename);
        
        parsedText = parsed.text;
        skills = parsed.skills;
        links = parsed.links;
        signals = parsed.signals;
      } else if (req.body.parsedText) {
        parsedText = req.body.parsedText;
        skills = req.body.skills || [];
        links = req.body.links || [];
      }

      const skillSignals = detectSkillSignals(parsedText, skills);
      signals = skillSignals.map(s => s.signal);

      const resume = await storage.createResume({
        volunteerId,
        filename,
        fileUrl,
        parsedText,
        links
      });

      await storage.updateVolunteer(volunteerId, {
        skills: skills,
      });

      res.json({
        ...resume,
        detectedSkills: skills,
        detectedSignals: skillSignals,
      });
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

  // Start clarifier session with AI
  router.post("/volunteers/:volunteerId/clarifier", async (req, res) => {
    try {
      const volunteerId = parseInt(req.params.volunteerId);
      
      const volunteer = await storage.getVolunteerById(volunteerId);
      if (!volunteer) {
        return res.status(404).json({ error: "Volunteer not found" });
      }

      const resume = await storage.getResumeByVolunteerId(volunteerId);
      
      const initialSignals = volunteer.skills 
        ? detectSkillSignals(resume?.parsedText || "", volunteer.skills)
        : [];

      const firstQuestion = generateClarifierQuestions(initialSignals, [])[0] || 
        "Tell me about your technical background and what you're passionate about building.";

      const session = await storage.createClarifierSession({
        volunteerId,
        chatLog: [
          {
            role: "assistant",
            message: `Hi! I'm here to learn more about your skills and match you with the right tasks. ${firstQuestion}`,
            timestamp: new Date().toISOString(),
          }
        ],
        detectedSignals: initialSignals.map(s => s.signal),
        status: "active"
      });

      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add message to clarifier session with AI response
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

      if (role === "user") {
        const systemPrompt = `You are an AI interviewer for Mundo Tango's volunteer program. Your goal is to:
1. Ask follow-up questions about their technical skills
2. Understand what they're passionate about building
3. Detect their expertise level
4. Be friendly and conversational
Keep responses concise (2-3 sentences max).`;

        const messages = chatLog.map(msg => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.message,
        }));

        const aiResponse = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          max_tokens: 150,
          temperature: 0.7,
        });

        const aiMessage = aiResponse.choices[0]?.message?.content || "Tell me more about that.";

        chatLog.push({
          role: "assistant",
          message: aiMessage,
          timestamp: new Date().toISOString(),
        });
      }

      const updated = await storage.updateClarifierSession(sessionId, { chatLog });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Complete clarifier session with task matching
  router.post("/clarifier/:sessionId/complete", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);

      const session = await storage.getClarifierSessionById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const volunteer = await storage.getVolunteerById(session.volunteerId);
      if (!volunteer) {
        return res.status(404).json({ error: "Volunteer not found" });
      }

      const resume = await storage.getResumeByVolunteerId(session.volunteerId);
      const chatText = (session.chatLog as any[])
        .map((msg: any) => msg.message)
        .join(" ");

      const combinedText = `${resume?.parsedText || ""} ${chatText}`;
      const skillSignals = detectSkillSignals(combinedText, volunteer.skills || []);
      const detectedSignals = skillSignals.map(s => s.signal);

      const allTasks = await storage.getAllTasks();
      const openTasks = allTasks.filter(t => t.status === "open");
      
      const taskMatches = matchVolunteerToTasks(
        volunteer.skills || [],
        skillSignals,
        openTasks
      );

      for (const match of taskMatches.slice(0, 5)) {
        await storage.createAssignment({
          volunteerId: session.volunteerId,
          taskId: match.taskId,
          matchReason: `AI match score: ${match.matchScore.toFixed(0)}%. Signals: ${match.matchedSignals.join(", ")}`,
          status: "pending",
        });
      }

      const updated = await storage.updateClarifierSession(sessionId, {
        detectedSignals,
        status: "completed",
        completedAt: new Date()
      });

      res.json({
        ...updated,
        taskMatches: taskMatches.slice(0, 5),
        assignmentsCreated: Math.min(taskMatches.length, 5),
      });
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
