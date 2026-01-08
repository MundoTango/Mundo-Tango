import { Router } from "express";
import type { IStorage } from "./storage";
import { resumeParser } from "./services/resume-parser";
import { detectSkillSignals, matchVolunteerToTasks, generateClarifierQuestions } from "./algorithms/signal-detection";
import { profileEnrichmentService } from "./services/profile-enrichment";
import Groq from "groq-sdk";

// Bifrost AI Gateway integration - MB.MD Protocol Implementation
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.BIFROST_BASE_URL || undefined,
});

export function createTalentMatchRoutes(storage: IStorage) {
  const router = Router();

  // ============================================================================
  // VOLUNTEER MANAGEMENT
  // ============================================================================

  // Create volunteer profile (or return existing)
  router.post("/volunteers", async (req, res) => {
    try {
      const { userId, profile, skills, availability, hoursPerWeek } = req.body;
      
      // Check if volunteer already exists for this user
      const existing = await storage.getVolunteerByUserId(userId);
      if (existing) {
        // Return existing profile instead of creating duplicate
        return res.json(existing);
      }
      
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

  // Get current user's volunteer profile
  router.get("/volunteers/me", async (req, res) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "User ID not found" });
      }
      const volunteer = await storage.getVolunteerByUserId(userId);
      if (!volunteer) {
        return res.status(404).json({ error: "Volunteer profile not found" });
      }
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

  // Get volunteer details with resume and interview sessions
  router.get("/volunteers/:id/details", async (req, res) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      const volunteer = await storage.getVolunteerById(volunteerId);
      if (!volunteer) {
        return res.status(404).json({ error: "Volunteer not found" });
      }

      const resume = await storage.getResumeByVolunteerId(volunteerId);
      const interviewSessions = await storage.getClarifierSessionsByVolunteerId(volunteerId);
      const assignments = await storage.getAssignmentsByVolunteerId(volunteerId);

      res.json({
        volunteer,
        resume,
        interviewSessions,
        assignments
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // RESUME MANAGEMENT
  // ============================================================================

  // Upload resume with AI parsing (upsert - updates if exists)
  router.post("/volunteers/:volunteerId/resume", async (req, res) => {
    try {
      const { filename, fileBuffer, fileUrl } = req.body;
      const volunteerId = parseInt(req.params.volunteerId);

      let parsedText = "";
      let skills: string[] = [];
      let links: string[] = [];
      let signals: string[] = [];

      // Prefer frontend-parsed text (already processed) over server-side parsing
      if (req.body.parsedText) {
        parsedText = req.body.parsedText;
        skills = req.body.skills || [];
        links = req.body.links || [];
      } else if (fileBuffer) {
        // Fallback to server-side parsing if frontend didn't parse
        const buffer = Buffer.from(fileBuffer, "base64");
        const parsed = await resumeParser.parseResume(buffer, filename);
        
        parsedText = parsed.text;
        skills = parsed.skills;
        links = parsed.links;
        signals = parsed.signals;
      }

      const skillSignals = detectSkillSignals(parsedText, skills);
      signals = skillSignals.map(s => s.signal);

      // Check if resume already exists for this volunteer
      const existingResume = await storage.getResumeByVolunteerId(volunteerId);
      
      let resume;
      if (existingResume) {
        // Update existing resume
        resume = await storage.updateResume(existingResume.id, {
          filename,
          fileUrl,
          parsedText,
          links
        });
      } else {
        // Create new resume
        resume = await storage.createResume({
          volunteerId,
          filename,
          fileUrl,
          parsedText,
          links
        });
      }

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
        // MB.MD Fix: Fetch volunteer's resume for personalized AI context
        const resume = await storage.getResumeByVolunteerId(session.volunteerId);
        const resumeContext = resume?.parsedText 
          ? `\n\nVolunteer's Resume/Background:\n${resume.parsedText.slice(0, 4000)}`
          : '';
        
        const systemPrompt = `You are Mr Blue, the AI interviewer for Mundo Tango's volunteer program.
${resumeContext}

Your goal is to:
1. Ask specific follow-up questions about their resume, projects, and technical skills
2. Reference specific technologies, experiences, or projects from their background when asking questions
3. Understand what they're passionate about building
4. Detect their expertise level and preferred work style
5. Be friendly, warm, and conversational

Important: If you have resume context above, ask questions that directly reference their specific experience. Do NOT ask generic questions.
Keep responses concise (2-3 sentences max).`;

        const messages = chatLog.map((msg: any) => ({
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

  // PATCH endpoint for authenticated embed mode interview completion
  // This handles the frontend's PATCH /api/v1/volunteers/clarifier/:clarifierId call
  router.patch("/volunteers/clarifier/:clarifierId", async (req, res) => {
    try {
      const clarifierId = parseInt(req.params.clarifierId);
      const { interviewMessages, status, completedAt } = req.body;

      const session = await storage.getClarifierSessionById(clarifierId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const volunteer = await storage.getVolunteerById(session.volunteerId);
      if (!volunteer) {
        return res.status(404).json({ error: "Volunteer not found" });
      }

      // Update chatLog with provided messages (handle both 'message' and 'content' field names)
      const chatLog = interviewMessages?.map((m: any) => ({
        role: m.role,
        message: m.message ?? m.content,
        timestamp: m.timestamp || new Date().toISOString()
      })) || session.chatLog;

      // Update the clarifier session
      const updated = await storage.updateClarifierSession(clarifierId, {
        chatLog,
        status: status || "completed",
        completedAt: completedAt ? new Date(completedAt) : new Date()
      });

      // MB.MD FIX (Jan 8, 2026): Ensure pipeline entry is created for BOTH guest and authenticated sessions
      // and ensure it uses the correct 'offered' stage for the Talent Pipeline UI
      const { db } = await import("./db");
      const { candidatePipelines } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");

      if (volunteer.userId) {
        const existingPipeline = await db
          .select()
          .from(candidatePipelines)
          .where(eq(candidatePipelines.candidateId, volunteer.userId))
          .limit(1);
        
        if (existingPipeline.length === 0) {
          await db.insert(candidatePipelines).values({
            userId: 1, // System/admin user
            candidateId: volunteer.userId,
            stage: "offered", // This maps to "Pending Approval" in the UI
            source: "talent_match_interview",
            notes: `Completed AI interview. Session ID: ${clarifierId}. Messages: ${chatLog?.length || 0}`,
          });
          console.log(`[TalentMatch] Created pipeline entry for user ${volunteer.userId}`);
        } else {
          // Update existing to ensure it's in the 'offered' stage if they just finished the interview
          await db.update(candidatePipelines)
            .set({ 
              stage: "offered",
              notes: (existingPipeline[0].notes || "") + `\nUpdated: Completed AI interview ${clarifierId}.`,
              updatedAt: new Date() 
            })
            .where(eq(candidatePipelines.candidateId, volunteer.userId));
          console.log(`[TalentMatch] Updated existing pipeline entry for user ${volunteer.userId} to 'offered' stage`);
        }
      }

      console.log(`[TalentMatch] Clarifier session ${clarifierId} completed for volunteer ${session.volunteerId}`);
      
      res.json({ success: true, ...updated });
    } catch (error: any) {
      console.error("[TalentMatch] Error completing clarifier session:", error);
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

  // ============================================================================
  // PROFILE ENRICHMENT
  // ============================================================================

  // Enrich profile from GitHub username
  router.get("/enrich-github/:username", async (req, res) => {
    try {
      const { username } = req.params;
      
      if (!username || username.trim() === "") {
        return res.status(400).json({ error: "GitHub username is required" });
      }

      const profile = await profileEnrichmentService.fetchGitHubProfile(username);
      res.json(profile);
    } catch (error: any) {
      console.error("[ProfileEnrichment] GitHub fetch error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Enrich profile from multiple URLs (GitHub and/or LinkedIn)
  router.post("/enrich-profile", async (req, res) => {
    try {
      const { urls } = req.body;
      
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: "URLs array is required" });
      }

      const enrichment = await profileEnrichmentService.enrichFromUrls(urls);
      res.json(enrichment);
    } catch (error: any) {
      console.error("[ProfileEnrichment] Enrich profile error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Validate LinkedIn URL and extract info
  router.post("/validate-linkedin", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== "string" || url.trim() === "") {
        return res.status(400).json({ error: "LinkedIn URL is required" });
      }

      const result = profileEnrichmentService.processLinkedInUrl(url);
      res.json(result);
    } catch (error: any) {
      console.error("[ProfileEnrichment] LinkedIn validation error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Validate multiple profile URLs
  router.post("/validate-urls", async (req, res) => {
    try {
      const { urls } = req.body;
      
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: "URLs array is required" });
      }

      const validation = profileEnrichmentService.validateProfileUrls(urls);
      res.json(validation);
    } catch (error: any) {
      console.error("[ProfileEnrichment] URL validation error:", error.message);
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
        esa: "/api/v1/esa",
        enrichment: {
          github: "/api/v1/enrich-github/:username",
          enrichProfile: "/api/v1/enrich-profile",
          validateLinkedIn: "/api/v1/validate-linkedin",
          validateUrls: "/api/v1/validate-urls"
        }
      }
    });
  });

  // Create or retrieve session
  router.post("/session", async (req, res) => {
    try {
      const { name, email } = req.body;
      const sessionId = `tm_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      const session = {
        sessionId,
        name,
        email,
        step: "upload",
        uploadedDocuments: [],
        interviewMessages: [],
        createdAt: Date.now(),
        lastUpdatedAt: Date.now(),
      };
      
      res.json({ success: true, session });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get current session
  router.get("/session", async (req, res) => {
    try {
      const sessionId = req.cookies.talentMatchSessionId;
      if (!sessionId) {
        return res.status(404).json({ error: "No session found" });
      }

      // In a real app, we'd fetch from DB. For now, we'll return a successful response
      // if the cookie exists, as the frontend will fallback to localStorage for data.
      res.json({ 
        success: true, 
        session: { 
          sessionId,
          // Other fields will be merged from localStorage on the frontend
        } 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
