console.log("🔍 [DEBUG] Starting server/routes.ts module loading...");
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import authRoutes from "./routes/auth";
import facebookOAuthRoutes from "./routes/auth/facebook-oauth-routes";
import storiesRoutes from "./routes/stories-routes";
import liveRoutes from "./routes/live-routes";
import socialActionsRoutes from "./routes/social-actions-routes";
import deploymentsRoutes from "./routes/deployments";
import secretsRoutes from "./routes/secrets";
import previewsRoutes from "./routes/previews";
import platformAllRoutes from "./routes/platform-all";
import webhooksRoutes from "./routes/webhooks";
import { createTalentMatchRoutes } from "./talent-match-routes";
import { createAIChatRoutes } from "./ai-chat-routes";
import queuesRoutes from "./routes/queues";
import mentionRoutes from "./routes/mention-routes";
import lifeCeoRoutes from "./routes/life-ceo-routes";
import adminRoutes from "./routes/admin-routes";
import { createFriendsRoutes } from "./routes/friends-routes";
import { createAnalyticsRoutes } from "./routes/analytics-routes";
import { createBookmarkRoutes } from "./routes/bookmark-routes";
import avatarRoutes from "./routes/avatarRoutes";
import videoRoutes from "./routes/videoRoutes";
import mrblueVideoRoutes from "./routes/mrblue-video-routes";
import mrBlueRoutes from "./routes/mrBlue";
import mrBlueStreamRoutes from "./routes/mrblue-stream";
import mrBlueEnhancedRoutes from "./routes/mr-blue-enhanced";
import mrBlueAgentsRoutes from "./routes/mrBlueAgents";
import mrBlueContextRoutes from "./routes/mrblue-context-routes";
import mrBlueVideoConferenceRoutes from "./routes/mrblue-video-conference-routes";
import mrBlueVibeCodingRoutes from "./routes/mrblue-vibecoding-routes";
import mrBlueVoiceRoutes from "./routes/mrblue-voice-routes";
import voiceFirstRoutes from "./routes/voice-first-routes";
import mrBlueMessengerRoutes from "./routes/mrblue-messenger-routes";
import mrBlueAutonomousRoutes from "./routes/mrblue-autonomous-routes";
import mrBlueMemoryRoutes from "./routes/mrblue-memory-routes";
import mrBluePlanRoutes from "./routes/mr-blue-plan-routes";
import mrBluePageGeneratorRoutes from "./routes/mr-blue-page-generator";
import pageAuditRoutes from "./routes/page-audit-routes";
import mrBlueErrorAnalysisRoutes from "./routes/mrblue-error-analysis-routes";
import mrBlueErrorActionsRoutes from "./routes/mrblue-error-actions-routes";
import mrBlueOrchestrationRoutes from "./routes/mrblue-orchestration-routes";
import orchestrationRoutes from "./routes/orchestration";
import gitRoutes from "./routes/git";
import a2aRoutes from "./routes/a2a";
import autonomousRoutes from "./routes/autonomous";
import premiumMediaRoutes from "./routes/premiumMedia";
import learningIntelligenceRoutes from "./routes/learningIntelligence";
import godLevelRoutes from "./routes/godLevel";
import visualEditorRoutes from "./routes/visualEditor";
import whisperRoutes from "./routes/whisper";
import openaiRealtimeRoutes from "./routes/openai-realtime";
import realtimeVoiceRoutes, { initRealtimeVoiceWebSocket } from "./routes/realtimeVoice";
import { registerVoiceCloningRoutes } from "./routes/voiceCloning";
import { initLivestreamWebSocket } from "./services/livestream-websocket";
import rbacRoutes from "./routes/rbac-routes";
import featureFlagsRoutes from "./routes/feature-flags-routes";
import pricingRoutes from "./routes/pricing-routes";
import planRoutes from "./routes/plan-routes";
import thePlanRoutes from "./routes/thePlanRoutes";
import syncRoutes from "./routes/sync-routes";
import selfHealingRoutes from "./routes/self-healing-routes";
import agentHealthRoutes from "./routes/agent-health-routes";
import predictiveContextRoutes from "./routes/predictive-context-routes";
import aiEnhanceRoutes from "./routes/ai-enhance";
import userSearchRoutes from "./routes/user-search";
import locationRoutes from "./routes/locations";
import { registerAIArbitrageRoutes } from "./routes/ai-arbitrage-routes";
import { registerDPOTrainingRoutes } from "./routes/dpo-training-routes";
import housingRoutes from "./routes/housing-routes";
import housingPhotosRoutes from "./routes/housing-photos-routes";
import livestreamRoutes from "./routes/livestream-routes";
import marketplaceRoutes from "./routes/marketplace-routes";
import subscriptionRoutes from "./routes/subscription-routes";
import reviewRoutes from "./routes/review-routes";
import mediaRoutes from "./routes/media-routes";
import { registerAlbumRoutes } from "./routes/album-routes";
import leaderboardRoutes from "./routes/leaderboard-routes";
import blogRoutes from "./routes/blog-routes";
import teacherRoutes from "./routes/teacher-routes";
import djRoutes from "./routes/dj-routes";
import musicianRoutes from "./routes/musician-routes";
import venueRoutes from "./routes/venue-routes";
import workshopRoutes from "./routes/workshop-routes";
import musicRoutes from "./routes/music-routes";
import travelRoutes from "./routes/travel-routes";
import achievementRoutes from "./routes/achievement-routes";
import reputationRoutes from "./routes/reputation-routes";
import profileRoutes from "./routes/profileRoutes";
import profileMediaRoutes from "./routes/profileMediaRoutes";
import profileAnalyticsRoutes from "./routes/profileAnalyticsRoutes";
import professionalProfileRoutes from "./routes/professionalProfileRoutes";
import businessProfileRoutes from "./routes/businessProfileRoutes";
import serviceProviderProfileRoutes from "./routes/serviceProviderProfileRoutes";
import serviceProfileRoutes from "./routes/serviceProfileRoutes";
import specialtyProfileRoutes from "./routes/specialtyProfileRoutes";
import contentProfileRoutes from "./routes/contentProfileRoutes";
import healthRoutes from "./routes/health";
import financialGoalsRoutes from "./routes/financial-goals-routes";
import budgetRoutes from "./routes/budget-routes";
import healthDataRoutes from "./routes/health-routes";
import nutritionRoutes from "./routes/nutrition-routes";
import eventRoutes from "./routes/event-routes";
import eventRolesRoutes from "./routes/event-roles-routes";
import groupRoutes from "./routes/group-routes";
import mapRoutes from "./routes/map-routes";
import crowdfundingRoutes from "./routes/crowdfunding-routes";
import recommendationRoutes from "./routes/recommendation-routes";
import crowdfundingAgentsRoutes from "./routes/crowdfundingAgentsRoutes";
import analyticsModerationRoutes from "./routes/analytics-moderation-routes";
console.log("🔍 [DEBUG] About to import agentIntelligenceRoutes...");
import agentIntelligenceRoutes from "./routes/agentIntelligenceRoutes";
console.log("✅ [DEBUG] agentIntelligenceRoutes loaded");
import agentCommunicationRoutes from "./routes/agentCommunicationRoutes";
import knowledgeRoutes from "./routes/knowledgeRoutes";
import monitoringRoutes from "./routes/monitoringRoutes";
import multiAIRoutes from "./routes/multiAIRoutes";
import agentRollupRoutes from "./routes/agent-rollup-routes";
import documentationGovernanceRoutes from "./routes/documentation-governance-routes";
import learningIndexRoutes from "./routes/learningIndexRoutes";
import financialAgentsRoutes from "./routes/financialAgentsRoutes";
import socialMediaAgentsRoutes from "./routes/socialMediaAgentsRoutes";
import marketplaceAgentsRoutes from "./routes/marketplaceAgentsRoutes";
import travelAgentsRoutes from "./routes/travelAgentsRoutes";
import userTestingAgentsRoutes from "./routes/userTestingAgentsRoutes";
import legalAgentsRoutes from "./routes/legalAgentsRoutes";
import gdprRoutes from "./routes/gdpr";
import securityRoutes from "./routes/security-routes";
import gdprComplianceRoutes from "./routes/gdpr-routes";
import legalRoutes from "./routes/legal-routes";
import scrapingAdminRoutes from "./routes/scraping-admin-routes";
import facebookScraperRoutes from "./routes/facebook-scraper-routes";
import facebookImportRoutes from "./routes/facebook-import-routes";
import facebookMessengerRoutes from "./routes/facebook-messenger-routes";
import facebookWebhooksRoutes from "./routes/facebook-webhooks";
import socialIntegrationRoutes from "./routes/social-integration-routes";
import computerUseRoutes from "./routes/computer-use-routes";
import aiSelectorRoutes from "./routes/ai-selector-routes";
import journeyRoutes from "./routes/journey-routes";
import billingRoutes from "./routes/billing-routes";
import onboardingRoutes from "./routes/onboarding-routes";
import messagesRoutes from "./routes/messages-routes";
import { registerMessagingRoutes } from "./routes/messaging-routes";
import adsRoutes from "./routes/ads-routes";
import revenueRoutes from "./routes/revenue-routes";
import volunteerTestingRoutes from "./routes/volunteerTesting";
import gamificationRoutes from "./routes/gamification";
import { registerLearningPathwaysRoutes } from "./routes/learningPathways-routes";
import systemPromptsRoutes from "./routes/systemPrompts";
import telemetryRoutes from "./routes/telemetry";
import swaggerRoutes from "./routes/swagger";
import tracesRoutes from "./routes/traces";
import postsEnhancedRoutes from "./routes/posts-enhanced";
import testRunnerRoutes from "./routes/test-runner";
import replitAIBridgeRoutes from "./routes/replit-ai-bridge";
import autonomousLoopRoutes from "./routes/autonomous-loop";
import { authenticateToken, AuthRequest, requireRoleLevel } from "./middleware/auth";
import { setCsrfToken, verifyCsrfToken } from "./middleware/csrf";
import { auditLog, getClientIp } from "./middleware/auditLog";
import { wsNotificationService } from "./services/websocket-notification-service";
import { wsEngagementService } from "./services/websocket-engagement-service";
import { wsService as autonomousWsService } from "./services/websocket";
import { 
  insertPostSchema, 
  insertPostCommentSchema,
  insertEventSchema,
  insertEventRsvpSchema,
  insertGroupSchema,
  insertChatMessageSchema,
  savedPosts,
  posts,
  reactions,
  postShares,
  postReports,
  commentLikes,
  postComments,
  agentHealth,
  users,
  events,
  groups,
  chatMessages,
  notifications,
  friendships,
  follows,
  profileViews,
  travelPlans,
  travelPlanItems,
  contactSubmissions,
  venueRecommendations,
  insertTravelPlanSchema,
  insertContactSubmissionSchema,
  insertVenueRecommendationSchema,
  insertTeacherProfileSchema,
  insertDJProfileSchema,
  insertMusicianProfileSchema,
  insertPhotographerProfileSchema,
  insertPerformerProfileSchema,
  insertVendorProfileSchema,
  insertTangoSchoolProfileSchema,
  insertTangoHotelProfileSchema,
  insertHostVenueProfileSchema,
  insertWellnessProfileSchema,
  insertTourOperatorProfileSchema,
  insertTangoGuideProfileSchema,
  insertTaxiDancerProfileSchema,
  insertContentCreatorProfileSchema,
  insertLearningResourceProfileSchema,
  insertOrganizerProfileSchema,
  insertChoreographerProfileSchema,
  photographerProfiles,
  performerProfiles,
  djProfiles,
  musicianProfiles,
  contentCreatorProfiles,
  teacherProfiles,
  vendorProfiles,
  choreographerProfiles,
  tangoSchoolProfiles,
  tangoHotelProfiles,
  hostVenueProfiles,
  wellnessProfiles,
  tourOperatorProfiles,
  tangoGuideProfiles,
  taxiDancerProfiles,
  learningResourceProfiles,
  organizerProfiles,
  profileMedia,
  dataExportRequests,
  userPrivacySettings,
  insertDataExportRequestSchema,
  insertUserPrivacySettingsSchema,
} from "@shared/schema";
import { 
  esaAgents,
  agentTasks,
  agentCommunications
} from "@shared/platform-schema";
import { db } from "@shared/db";
import { eq, and, or, desc, sql, isNotNull, gte, count } from "drizzle-orm";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { cityscapeService } from "./services/cityscape-service";
import { feedAlgorithmService } from "./services/feedAlgorithm";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationError.toString() 
        });
      }
      next(error);
    }
  };
};

const createPostBodySchema = insertPostSchema.omit({ userId: true });
const createCommentBodySchema = insertPostCommentSchema.omit({ userId: true, postId: true });

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  
  if (err.name === "ZodError") {
    return res.status(400).json({ 
      message: "Validation error", 
      errors: err.errors 
    });
  }
  
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
};

// ============================================================================
// MULTER & CLOUDINARY CONFIGURATION FOR PROFILE MEDIA
// ============================================================================

const profileMediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm',
      'application/pdf',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: JPEG, PNG, WebP, MP4, WebM, PDF'));
    }
  }
});

// Configure Cloudinary if environment variables are present
if (process.env.CLOUDINARY_URL || 
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[ProfileMedia] Cloudinary configured for media uploads');
} else {
  console.warn('[ProfileMedia] Cloudinary not configured - using base64 fallback for media uploads');
}

async function uploadMediaToCloudinary(
  file: Express.Multer.File,
  folder: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<{ url: string; publicId?: string }> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    // Fallback to base64
    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;
    return { url: dataUrl };
  }

  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          transformation: resourceType === 'image' ? [
            { width: 1920, height: 1920, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ] : undefined,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));
          
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      
      uploadStream.end(file.buffer);
    });
  } catch (error) {
    console.error('[ProfileMedia] Cloudinary upload failed:', error);
    // Fallback to base64
    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;
    return { url: dataUrl };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // MB.MD Metrics endpoint (must be before CSRF middleware for Prometheus scraping)
  const { mbmdMetrics } = await import("./services/mb-md-metrics");
  app.get("/metrics", async (req: Request, res: Response) => {
    try {
      const metrics = await mbmdMetrics.getMetrics();
      res.set('Content-Type', 'text/plain; version=0.0.4');
      res.send(metrics);
    } catch (error) {
      console.error('[MB.MD Metrics] Error generating metrics:', error);
      res.status(500).send('Error generating metrics');
    }
  });

  // Security middleware (CSP headers already applied in server/index.ts via Helmet)
  app.use(setCsrfToken);
  
  // CSRF token endpoint (must be before verifyCsrfToken)
  app.get("/api/csrf-token", (req: Request, res: Response) => {
    const token = res.locals.csrfToken || req.cookies["XSRF-TOKEN"];
    res.json({ csrfToken: token });
  });

  // Waitlist endpoint (public - no auth required, before CSRF verification)
  app.post("/api/waitlist/join", async (req: Request, res: Response) => {
    try {
      const { email, name } = req.body;

      // Validate email
      if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Valid email is required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email.toLowerCase());

      if (existingUser) {
        // Update existing user to waitlist
        await storage.updateUser(existingUser.id, {
          waitlist: true,
          waitlistDate: new Date()
        });
        return res.json({ success: true, message: 'You\'re already on our waitlist!' });
      }

      // Create new waitlist user
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      await storage.createUser({
        email: email.toLowerCase(),
        username: username,
        name: name || 'Waitlist User',
        password: 'temp_waitlist_password', // Will be reset when they sign up
        waitlist: true,
        waitlistDate: new Date()
      });

      res.json({ success: true, message: 'Welcome to the waitlist! We\'ll notify you when we launch.' });
    } catch (error: any) {
      console.error('[Waitlist] Error:', error);
      res.status(500).json({ error: 'Failed to join waitlist' });
    }
  });
  
  // ============================================================================
  // CSRF PROTECTION: Verify CSRF tokens on all mutating requests (POST/PUT/DELETE/PATCH)
  // Skips: GET/HEAD/OPTIONS and JWT Bearer auth requests (handled in middleware)
  // ============================================================================
  app.use(verifyCsrfToken);
  
  // Phase 1 & 2 Deployment Blocker Routes
  app.use("/api/rbac", rbacRoutes);
  app.use("/api/feature-flags", featureFlagsRoutes);
  app.use("/api/pricing", pricingRoutes);
  
  // Phase 3 Deployment Blocker Routes
  app.use("/api/plan", planRoutes);
  app.use("/api/the-plan", thePlanRoutes);
  app.use("/api/sync", syncRoutes);
  app.use("/api/admin/self-healing", selfHealingRoutes);
  
  // Phase 4 Deployment Blocker Routes
  app.use("/api/agents", agentHealthRoutes);
  app.use("/api/predictive", predictiveContextRoutes);
  
  // TRACK 3 BATCH 13-16: Agent Intelligence API Layer
  app.use("/api/agent-intelligence", agentIntelligenceRoutes);
  app.use("/api/agents/communication", agentCommunicationRoutes);
  app.use("/api/knowledge", knowledgeRoutes);
  app.use("/api/monitoring", monitoringRoutes);
  
  // PHASE 0B: Agent Knowledge Rollup System
  app.use("/api/agent-rollup", agentRollupRoutes);
  
  // TRACK 9: API Documentation & Core Endpoints
  app.use("/api/prompts", systemPromptsRoutes);
  app.use("/api/telemetry", telemetryRoutes);
  app.use("/api/traces", tracesRoutes);
  app.use("/api-docs", swaggerRoutes);
  
  // BATCH 16: Multi-AI Orchestration Routes
  app.use("/api/ai/multi", multiAIRoutes);
  
  // AI ARBITRAGE: Intelligent Routing & Cost Optimization (50-90% savings)
  registerAIArbitrageRoutes(app);
  
  // AI LEARNING SYSTEMS: DPO Training, Curriculum, GEPA, LIMI
  registerDPOTrainingRoutes(app);
  
  // BATCH 29: Documentation Governance System
  app.use("/api/documentation", documentationGovernanceRoutes);
  
  // PHASE 0C: Journey Recording System for Scott's Book
  app.use("/api/journey", journeyRoutes);
  
  // Learning Index API Routes
  app.use("/api/learning", learningIndexRoutes);
  
  // Financial Agents Routes (33 AI Agents for Financial Management)
  app.use("/api/financial/agents", financialAgentsRoutes);
  
  // Social Media Agents Routes (5 AI Agents for Social Media Management)
  app.use("/api/social/agents", socialMediaAgentsRoutes);
  
  // Social Integration Routes (Part 10: Multi-Platform Data Integration & Closeness Calculator)
  app.use("/api/social", socialIntegrationRoutes);
  
  // Marketplace AI Agents Routes (8 AI Agents for Marketplace Management)
  app.use("/api/marketplace/agents", marketplaceAgentsRoutes);
  
  // Travel AI Agents Routes (6 AI Agents for Travel Management - Agents #175-180)
  app.use("/api/travel/agents", travelAgentsRoutes);
  
  // User Testing AI Agents Routes (4 AI Agents for UX Testing - Agents #163-166)
  app.use("/api/user-testing", userTestingAgentsRoutes);
  
  // TRACK 6: Volunteer Testing System - Scenarios + Recruitment + UI
  app.use("/api/volunteer", volunteerTestingRoutes);
  
  // TRACK 8: Gamification System - Points, Badges, Leaderboard, Progressive Autonomy
  app.use("/api/gamification", gamificationRoutes);
  
  // Legal Document AI Agents Routes (2 AI Agents for Legal Documents - Agents #185-186)
  app.use("/api/legal/agents", legalAgentsRoutes);

  // Test Runner & Replit AI Bridge (MB.MD v9.2 - Nov 19, 2025)
  app.use("/api/tests", testRunnerRoutes);
  app.use("/api/replit-ai", replitAIBridgeRoutes);
  app.use("/api/autonomous-loop", autonomousLoopRoutes);
  
  // TRACK 2: Mr. Blue Core Agents Routes (#201-205) - Service + Routes + Frontend
  app.use("/api/mr-blue/agents", mrBlueAgentsRoutes);
  
  // TRACK 3: Learning Intelligence Agents (#206-208) - Orchestrator + Pathways
  app.use("/api/learning", learningIntelligenceRoutes);
  
  // TRACK 7: Learning Pathways - 10 Data Collection Pathways
  registerLearningPathwaysRoutes(app);
  
  // Existing routes
  app.use("/api/auth", authRoutes);
  app.use("/api/auth/facebook", facebookOAuthRoutes);
  app.use("/api/deployments", deploymentsRoutes);
  app.use("/api/secrets", secretsRoutes);
  app.use("/api/previews", previewsRoutes);
  app.use("/api/platform", platformAllRoutes);
  app.use("/api/webhooks", webhooksRoutes);
  app.use("/api/v1", createTalentMatchRoutes(storage));
  app.use("/api/v1", createAIChatRoutes());
  app.use("/api/queues", queuesRoutes);
  app.use("/api/mentions", mentionRoutes);
  app.use("/api/life-ceo", lifeCeoRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api", scrapingAdminRoutes);
  app.use("/api/scraper/facebook", facebookScraperRoutes);
  app.use("/api/facebook", facebookImportRoutes);
  app.use("/api/facebook", facebookMessengerRoutes);
  app.use("", facebookWebhooksRoutes); // Facebook Messenger Platform webhooks (no /api prefix)
  
  // Mr. Blue Computer Use - Anthropic Computer Use API (System 11)
  app.use("/api/computer-use", computerUseRoutes);
  app.use("/api", aiSelectorRoutes);
  app.use("/api/billing", billingRoutes);
  app.use("/api/onboarding", onboardingRoutes);
  app.use("/api/messages", messagesRoutes);
  registerMessagingRoutes(app); // New messaging routes for direct messages, group chats, and threads
  app.use("/api/ads", adsRoutes);
  app.use("/api/admin/ads", adsRoutes);
  app.use("/api/revenue", revenueRoutes);
  app.use("/api", createFriendsRoutes(storage));
  app.use("/api", createAnalyticsRoutes(storage));
  app.use("/api", createBookmarkRoutes(storage));
  app.use("/api/avatar", avatarRoutes);
  app.use("/api/videos", videoRoutes);
  app.use("/api/mrblue", mrblueVideoRoutes);
  app.use("/api/mrblue", mrBlueStreamRoutes); // Streaming SSE endpoint
  app.use("/api/mrblue", mrBlueRoutes);
  app.use("/api/mrblue/context", mrBlueContextRoutes); // System 1: Context Service with LanceDB
  app.use("/api/mrblue/video", mrBlueVideoConferenceRoutes); // System 2: Daily.co Video Conference
  app.use("/api/mrblue/vibecode", mrBlueVibeCodingRoutes); // System 4: Vibe Coding Engine (Natural Language → Code)
  app.use("/api/mrblue/voice", mrBlueVoiceRoutes); // System 5: Voice Cloning with ElevenLabs (17 languages)
  app.use("/api/voice", voiceFirstRoutes); // Voice-First Features (Wispr Flow inspired): 4x faster than typing, 68 languages
  app.use("/api/mrblue/messenger", mrBlueMessengerRoutes); // System 6: Facebook Messenger Integration
  app.use("/api/mrblue/autonomous", mrBlueAutonomousRoutes); // System 7: Autonomous Coding Engine
  app.use("/api/mrblue/memory", mrBlueMemoryRoutes); // System 8: Advanced Memory System
  app.use("/api/mrblue/plan", mrBluePlanRoutes); // Plan Roadmap Tracker (47-page validation system)
  app.use("/api/mr-blue", mrBluePageGeneratorRoutes); // AI Page Generator (1,218 agents + 4 archetypes)
  app.use("/api/page-audit", pageAuditRoutes); // Page Audit System (12 categories + self-healing)
  app.use("/api/mrblue", mrBlueErrorAnalysisRoutes); // Phase 3: Error Analysis API with AI Integration
  app.use("/api/mrblue", mrBlueErrorActionsRoutes); // Phase 4: Error Fix Actions (Apply/Escalate)
  app.use("/api/a2a", a2aRoutes); // A2A Protocol - Machine-to-machine agent communication (MB.MD Phase 6A)
  app.use("/api/mrblue/orchestration", mrBlueOrchestrationRoutes); // Multi-agent orchestration with LangChain.js
  app.use("/api/orchestration", orchestrationRoutes); // Production-ready workflow orchestration (Sequential/Parallel/Intelligence Cycle)
  app.use("/api/git", gitRoutes); // Autonomous Git commit system with AI-generated messages
  app.use(mrBlueEnhancedRoutes); // Enhanced Mr. Blue with troubleshooting KB
  app.use("/api/autonomous", autonomousRoutes); // Mr. Blue Autonomous Agent (God Level)
  app.use("/api/visual-editor", authenticateToken, visualEditorRoutes);
  app.use("/api/whisper", authenticateToken, whisperRoutes);
  app.use("/api/realtime", authenticateToken, realtimeVoiceRoutes);
  app.use("/api/openai-realtime", authenticateToken, openaiRealtimeRoutes);
  registerVoiceCloningRoutes(app); // Voice cloning for Mr. Blue custom voices
  app.use("/api/premium", premiumMediaRoutes);
  app.use("/api/god-level", authenticateToken, godLevelRoutes);
  app.use("/api/ai", aiEnhanceRoutes);
  app.use("/api/user", userSearchRoutes);
  app.use("/api/locations", locationRoutes);
  
  // ============================================================================
  // GDPR COMPLIANCE & PRIVACY ROUTES
  // ============================================================================
  
  // Register GDPR routes (data export, account deletion, consent management)
  app.use(gdprRoutes);
  app.use(securityRoutes); // P0 #7: 2FA
  app.use(gdprComplianceRoutes); // P0 #5: Data Export
  app.use(legalRoutes); // P0 #9: Code of Conduct
  
  // Get active user sessions (mock data)
  app.get("/api/settings/sessions", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const mockSessions = [
        {
          id: "1",
          device: "Chrome on Windows",
          location: "San Francisco, CA, USA",
          ipAddress: "192.168.1.1",
          lastActive: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          current: true,
        },
        {
          id: "2",
          device: "Safari on iPhone",
          location: "New York, NY, USA",
          ipAddress: "192.168.1.2",
          lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          current: false,
        },
      ];
      res.json(mockSessions);
    } catch (error: any) {
      console.error("[GET /api/settings/sessions] Error:", error);
      res.status(500).json({ message: "Failed to fetch sessions", error: error.message });
    }
  });

  // Revoke a specific session
  app.post("/api/settings/revoke-session", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { sessionId } = req.body;
      res.json({ message: "Session revoked successfully" });
    } catch (error: any) {
      console.error("[POST /api/settings/revoke-session] Error:", error);
      res.status(500).json({ message: "Failed to revoke session", error: error.message });
    }
  });

  // Get user's data export requests
  app.get("/api/settings/data-exports", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const exports = await db
        .select()
        .from(dataExportRequests)
        .where(eq(dataExportRequests.userId, req.user!.id))
        .orderBy(desc(dataExportRequests.requestedAt));
      
      res.json(exports);
    } catch (error: any) {
      console.error("[GET /api/settings/data-exports] Error:", error);
      res.status(500).json({ message: "Failed to fetch data exports", error: error.message });
    }
  });

  // Request data export
  app.post("/api/settings/request-data-export", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertDataExportRequestSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const [exportRequest] = await db
        .insert(dataExportRequests)
        .values(validatedData)
        .returning();

      res.status(201).json({
        message: "Data export request created successfully",
        export: exportRequest,
      });
    } catch (error: any) {
      console.error("[POST /api/settings/request-data-export] Error:", error);
      res.status(500).json({ message: "Failed to create data export request", error: error.message });
    }
  });

  // Get security audit logs
  app.get("/api/settings/audit-logs", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const mockAuditLogs = [
        {
          id: "1",
          action: "login",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          ipAddress: "192.168.1.1",
          userAgent: "Chrome/120.0",
          status: "success",
        },
        {
          id: "2",
          action: "password_change",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          ipAddress: "192.168.1.1",
          userAgent: "Chrome/120.0",
          status: "success",
        },
        {
          id: "3",
          action: "login_failed",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
          ipAddress: "192.168.1.5",
          userAgent: "Firefox/119.0",
          status: "failed",
        },
      ];
      res.json(mockAuditLogs);
    } catch (error: any) {
      console.error("[GET /api/settings/audit-logs] Error:", error);
      res.status(500).json({ message: "Failed to fetch audit logs", error: error.message });
    }
  });

  // Update privacy settings
  app.patch("/api/settings/privacy", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { marketingEmails, analytics, thirdPartySharing, profileVisibility, searchable, showActivity } = req.body;

      const [existing] = await db
        .select()
        .from(userPrivacySettings)
        .where(eq(userPrivacySettings.userId, req.user!.id));

      let privacySettings;
      if (existing) {
        [privacySettings] = await db
          .update(userPrivacySettings)
          .set({
            marketingEmails,
            analytics,
            thirdPartySharing,
            profileVisibility,
            searchable,
            showActivity,
            updatedAt: new Date(),
          })
          .where(eq(userPrivacySettings.userId, req.user!.id))
          .returning();
      } else {
        [privacySettings] = await db
          .insert(userPrivacySettings)
          .values({
            userId: req.user!.id,
            marketingEmails,
            analytics,
            thirdPartySharing,
            profileVisibility,
            searchable,
            showActivity,
          })
          .returning();
      }

      res.json({
        message: "Privacy settings updated successfully",
        settings: privacySettings,
      });
    } catch (error: any) {
      console.error("[PATCH /api/settings/privacy] Error:", error);
      res.status(500).json({ message: "Failed to update privacy settings", error: error.message });
    }
  });

  // Get privacy settings
  app.get("/api/settings/privacy", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const [privacySettings] = await db
        .select()
        .from(userPrivacySettings)
        .where(eq(userPrivacySettings.userId, req.user!.id));

      if (!privacySettings) {
        const [newSettings] = await db
          .insert(userPrivacySettings)
          .values({ userId: req.user!.id })
          .returning();
        return res.json(newSettings);
      }

      res.json(privacySettings);
    } catch (error: any) {
      console.error("[GET /api/settings/privacy] Error:", error);
      res.status(500).json({ message: "Failed to fetch privacy settings", error: error.message });
    }
  });

  // Delete account (GDPR Article 17 - Right to Erasure)
  app.post("/api/settings/delete-account", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ message: "Password confirmation required" });
      }

      await auditLog(req, "account_deletion_requested", "user", req.user!.id, {
        userId: req.user!.id,
        timestamp: new Date().toISOString(),
      });

      res.json({ message: "Account deletion request submitted (stub - full implementation pending)" });
    } catch (error: any) {
      console.error("[POST /api/settings/delete-account] Error:", error);
      res.status(500).json({ message: "Failed to delete account", error: error.message });
    }
  });
  
  // Phase B: New feature routes
  app.use("/api/housing", housingRoutes);
  app.use("/api/housing", housingPhotosRoutes);
  app.use("/api/livestreams", livestreamRoutes);
  app.use("/api/marketplace", marketplaceRoutes);
  app.use("/api/subscriptions", subscriptionRoutes);
  crowdfundingRoutes(app); // GoFundMe-style crowdfunding platform
  app.use("/api/crowdfunding/agents", crowdfundingAgentsRoutes); // AI Agents for crowdfunding (Agents #181-184)
  
  // Phase D: Community & Engagement Systems
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/media", mediaRoutes);
  registerAlbumRoutes(app);
  app.use("/api/leaderboard", leaderboardRoutes);
  app.use("/api/blog", blogRoutes);
  
  // Phase E: Professional Tools Routes
  app.use("/api/teachers", teacherRoutes);
  app.use("/api/djs", djRoutes);
  app.use("/api/musicians", musicianRoutes);

  // AGENT 10: Events & Groups Systems
  app.use("/api/events", eventRoutes);
  app.use("/api", eventRolesRoutes); // Event participant roles
  app.use("/api/groups", groupRoutes);
  app.use("/api/map", mapRoutes); // Community map markers
  app.use("/api/recommendations", recommendationRoutes); // MB.MD Week 9 Day 3: Recommendation Engine
  app.use("/api", analyticsModerationRoutes); // MB.MD Week 9 Day 4: Analytics & Moderation
  
  // MB.MD Week 9 Day 5: Stories, Live Streams, Social Actions
  app.use("/api/stories", storiesRoutes);
  app.use("/api/live", liveRoutes);
  app.use("/api", socialActionsRoutes);

  // ============================================================================
  // BATCH 15: UNIFIED PROFILE SEARCH
  // ============================================================================
  
  app.get("/api/profiles/search", async (req: Request, res: Response) => {
    try {
      const {
        q,
        types,
        city,
        country,
        minRating,
        maxPrice,
        verified,
        availability,
        page = "1",
        limit = "20"
      } = req.query;

      // Parse query parameters
      const parsedTypes = types 
        ? (Array.isArray(types) ? types : [types]).map(t => String(t))
        : undefined;
      
      const parsedVerified = verified !== undefined 
        ? verified === "true" || verified === "1"
        : undefined;
      
      const parsedAvailability = availability !== undefined
        ? availability === "true" || availability === "1"
        : undefined;

      const searchFilters = {
        q: q ? String(q) : undefined,
        types: parsedTypes,
        city: city ? String(city) : undefined,
        country: country ? String(country) : undefined,
        minRating: minRating ? parseFloat(String(minRating)) : undefined,
        maxPrice: maxPrice ? parseFloat(String(maxPrice)) : undefined,
        verified: parsedVerified,
        availability: parsedAvailability,
        page: parseInt(String(page)),
        limit: parseInt(String(limit)),
      };

      const result = await storage.searchAllProfiles(searchFilters);
      
      res.json(result);
    } catch (error: any) {
      console.error("[GET /api/profiles/search] Error:", error);
      res.status(500).json({ 
        message: "Failed to search profiles", 
        error: error.message 
      });
    }
  });

  // BATCH 05: Photographer/Performer/Vendor Profile APIs
  
  // Photographer Profile Routes
  app.post("/api/profiles/photographer", authenticateToken, validateRequest(insertPhotographerProfileSchema.omit({ userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const profile = await storage.createPhotographerProfile({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("[POST /api/profiles/photographer] Error:", error);
      res.status(500).json({ message: "Failed to create photographer profile", error: error.message });
    }
  });

  app.get("/api/profiles/photographer/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getPhotographerProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Photographer profile not found" });
      }
      
      res.json(profile);
    } catch (error: any) {
      console.error("[GET /api/profiles/photographer/:userId] Error:", error);
      res.status(500).json({ message: "Failed to fetch photographer profile", error: error.message });
    }
  });

  app.put("/api/profiles/photographer", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const updated = await storage.updatePhotographerProfile(req.user!.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("[PUT /api/profiles/photographer] Error:", error);
      res.status(500).json({ message: "Failed to update photographer profile", error: error.message });
    }
  });

  app.delete("/api/profiles/photographer", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deletePhotographerProfile(req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("[DELETE /api/profiles/photographer] Error:", error);
      res.status(500).json({ message: "Failed to delete photographer profile", error: error.message });
    }
  });

  app.get("/api/profiles/photographers/search", async (req: Request, res: Response) => {
    try {
      const { 
        specialty,
        city, 
        minRating, 
        maxRate,
        limit = "20", 
        offset = "0" 
      } = req.query;
      
      const profiles = await storage.searchPhotographerProfiles({
        specialties: specialty ? [specialty as string] : undefined,
        city: city as string | undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        maxRate: maxRate ? parseFloat(maxRate as string) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(profiles);
    } catch (error: any) {
      console.error("[GET /api/profiles/photographers/search] Error:", error);
      res.status(500).json({ message: "Failed to search photographer profiles", error: error.message });
    }
  });

  // Performer Profile Routes
  app.post("/api/profiles/performer", authenticateToken, validateRequest(insertPerformerProfileSchema.omit({ userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const profile = await storage.createPerformerProfile({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("[POST /api/profiles/performer] Error:", error);
      res.status(500).json({ message: "Failed to create performer profile", error: error.message });
    }
  });

  app.get("/api/profiles/performer/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getPerformerProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Performer profile not found" });
      }
      
      res.json(profile);
    } catch (error: any) {
      console.error("[GET /api/profiles/performer/:userId] Error:", error);
      res.status(500).json({ message: "Failed to fetch performer profile", error: error.message });
    }
  });

  app.put("/api/profiles/performer", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const updated = await storage.updatePerformerProfile(req.user!.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("[PUT /api/profiles/performer] Error:", error);
      res.status(500).json({ message: "Failed to update performer profile", error: error.message });
    }
  });

  app.delete("/api/profiles/performer", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deletePerformerProfile(req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("[DELETE /api/profiles/performer] Error:", error);
      res.status(500).json({ message: "Failed to delete performer profile", error: error.message });
    }
  });

  app.get("/api/profiles/performers/search", async (req: Request, res: Response) => {
    try {
      const { 
        performanceType,
        style, 
        city,
        minRating,
        maxFee,
        limit = "20", 
        offset = "0" 
      } = req.query;
      
      const profiles = await storage.searchPerformerProfiles({
        performanceTypes: performanceType ? [performanceType as string] : undefined,
        style: style as string | undefined,
        city: city as string | undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        maxFee: maxFee ? parseFloat(maxFee as string) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(profiles);
    } catch (error: any) {
      console.error("[GET /api/profiles/performers/search] Error:", error);
      res.status(500).json({ message: "Failed to search performer profiles", error: error.message });
    }
  });

  // Vendor Profile Routes
  app.post("/api/profiles/vendor", authenticateToken, validateRequest(insertVendorProfileSchema.omit({ userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const profile = await storage.createVendorProfile({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("[POST /api/profiles/vendor] Error:", error);
      res.status(500).json({ message: "Failed to create vendor profile", error: error.message });
    }
  });

  app.get("/api/profiles/vendor/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getVendorProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }
      
      res.json(profile);
    } catch (error: any) {
      console.error("[GET /api/profiles/vendor/:userId] Error:", error);
      res.status(500).json({ message: "Failed to fetch vendor profile", error: error.message });
    }
  });

  app.put("/api/profiles/vendor", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const updated = await storage.updateVendorProfile(req.user!.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("[PUT /api/profiles/vendor] Error:", error);
      res.status(500).json({ message: "Failed to update vendor profile", error: error.message });
    }
  });

  app.delete("/api/profiles/vendor", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteVendorProfile(req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("[DELETE /api/profiles/vendor] Error:", error);
      res.status(500).json({ message: "Failed to delete vendor profile", error: error.message });
    }
  });

  app.get("/api/profiles/vendors/search", async (req: Request, res: Response) => {
    try {
      const { 
        productCategory,
        city,
        priceRange,
        minRating,
        limit = "20", 
        offset = "0" 
      } = req.query;
      
      const profiles = await storage.searchVendorProfiles({
        productCategories: productCategory ? [productCategory as string] : undefined,
        city: city as string | undefined,
        priceRange: priceRange as string | undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(profiles);
    } catch (error: any) {
      console.error("[GET /api/profiles/vendors/search] Error:", error);
      res.status(500).json({ message: "Failed to search vendor profiles", error: error.message });
    }
  });

  // BATCH 06: Business Profile APIs - Tango School
  app.post("/api/profiles/tango-school", authenticateToken, validateRequest(insertTangoSchoolProfileSchema.omit({ userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const profile = await storage.createTangoSchoolProfile({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("[POST /api/profiles/tango-school] Error:", error);
      res.status(500).json({ message: "Failed to create tango school profile", error: error.message });
    }
  });

  app.get("/api/profiles/tango-school/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getTangoSchoolProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Tango school profile not found" });
      }
      
      res.json(profile);
    } catch (error: any) {
      console.error("[GET /api/profiles/tango-school/:userId] Error:", error);
      res.status(500).json({ message: "Failed to fetch tango school profile", error: error.message });
    }
  });

  app.put("/api/profiles/tango-school", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const updated = await storage.updateTangoSchoolProfile(req.user!.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("[PUT /api/profiles/tango-school] Error:", error);
      res.status(500).json({ message: "Failed to update tango school profile", error: error.message });
    }
  });

  app.delete("/api/profiles/tango-school", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteTangoSchoolProfile(req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("[DELETE /api/profiles/tango-school] Error:", error);
      res.status(500).json({ message: "Failed to delete tango school profile", error: error.message });
    }
  });

  app.get("/api/profiles/tango-schools/search", async (req: Request, res: Response) => {
    try {
      const { 
        city,
        country,
        minRating,
        verified,
        classTypes,
        limit = "20", 
        offset = "0" 
      } = req.query;
      
      const profiles = await storage.searchTangoSchoolProfiles({
        city: city as string | undefined,
        country: country as string | undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        verified: verified === "true" ? true : verified === "false" ? false : undefined,
        classTypes: classTypes ? (Array.isArray(classTypes) ? classTypes as string[] : [classTypes as string]) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(profiles);
    } catch (error: any) {
      console.error("[GET /api/profiles/tango-schools/search] Error:", error);
      res.status(500).json({ message: "Failed to search tango school profiles", error: error.message });
    }
  });

  // BATCH 06: Business Profile APIs - Tango Hotel
  app.post("/api/profiles/tango-hotel", authenticateToken, validateRequest(insertTangoHotelProfileSchema.omit({ userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const profile = await storage.createTangoHotelProfile({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("[POST /api/profiles/tango-hotel] Error:", error);
      res.status(500).json({ message: "Failed to create tango hotel profile", error: error.message });
    }
  });

  app.get("/api/profiles/tango-hotel/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getTangoHotelProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Tango hotel profile not found" });
      }
      
      res.json(profile);
    } catch (error: any) {
      console.error("[GET /api/profiles/tango-hotel/:userId] Error:", error);
      res.status(500).json({ message: "Failed to fetch tango hotel profile", error: error.message });
    }
  });

  app.put("/api/profiles/tango-hotel", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const updated = await storage.updateTangoHotelProfile(req.user!.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("[PUT /api/profiles/tango-hotel] Error:", error);
      res.status(500).json({ message: "Failed to update tango hotel profile", error: error.message });
    }
  });

  app.delete("/api/profiles/tango-hotel", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteTangoHotelProfile(req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("[DELETE /api/profiles/tango-hotel] Error:", error);
      res.status(500).json({ message: "Failed to delete tango hotel profile", error: error.message });
    }
  });

  app.get("/api/profiles/tango-hotels/search", async (req: Request, res: Response) => {
    try {
      const { 
        city,
        country,
        minRating,
        minPrice,
        maxPrice,
        verified,
        amenities,
        limit = "20", 
        offset = "0" 
      } = req.query;
      
      const profiles = await storage.searchTangoHotelProfiles({
        city: city as string | undefined,
        country: country as string | undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        verified: verified === "true" ? true : verified === "false" ? false : undefined,
        amenities: amenities ? (Array.isArray(amenities) ? amenities as string[] : [amenities as string]) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(profiles);
    } catch (error: any) {
      console.error("[GET /api/profiles/tango-hotels/search] Error:", error);
      res.status(500).json({ message: "Failed to search tango hotel profiles", error: error.message });
    }
  });

  // BATCH 06: Business Profile APIs - Host Venue
  app.post("/api/profiles/host-venue", authenticateToken, validateRequest(insertHostVenueProfileSchema.omit({ userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const profile = await storage.createHostVenueProfile({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("[POST /api/profiles/host-venue] Error:", error);
      res.status(500).json({ message: "Failed to create host venue profile", error: error.message });
    }
  });

  app.get("/api/profiles/host-venue/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getHostVenueProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Host venue profile not found" });
      }
      
      res.json(profile);
    } catch (error: any) {
      console.error("[GET /api/profiles/host-venue/:userId] Error:", error);
      res.status(500).json({ message: "Failed to fetch host venue profile", error: error.message });
    }
  });

  app.put("/api/profiles/host-venue", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const updated = await storage.updateHostVenueProfile(req.user!.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("[PUT /api/profiles/host-venue] Error:", error);
      res.status(500).json({ message: "Failed to update host venue profile", error: error.message });
    }
  });

  app.delete("/api/profiles/host-venue", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteHostVenueProfile(req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("[DELETE /api/profiles/host-venue] Error:", error);
      res.status(500).json({ message: "Failed to delete host venue profile", error: error.message });
    }
  });

  app.get("/api/profiles/host-venues/search", async (req: Request, res: Response) => {
    try {
      const { 
        city,
        country,
        minRating,
        minCapacity,
        verified,
        amenities,
        venueTypes,
        limit = "20", 
        offset = "0" 
      } = req.query;
      
      const profiles = await storage.searchHostVenueProfiles({
        city: city as string | undefined,
        country: country as string | undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        minCapacity: minCapacity ? parseInt(minCapacity as string) : undefined,
        verified: verified === "true" ? true : verified === "false" ? false : undefined,
        amenities: amenities ? (Array.isArray(amenities) ? amenities as string[] : [amenities as string]) : undefined,
        venueTypes: venueTypes ? (Array.isArray(venueTypes) ? venueTypes as string[] : [venueTypes as string]) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(profiles);
    } catch (error: any) {
      console.error("[GET /api/profiles/host-venues/search] Error:", error);
      res.status(500).json({ message: "Failed to search host venue profiles", error: error.message });
    }
  });

  // ============================================================================
  // BATCH 07: Specialty Service APIs (Wellness/Tour Operator/Guide/Taxi Dancer)
  // ============================================================================

  // Wellness Profile Routes
  app.post("/api/profiles/wellness", authenticateToken, validateRequest(insertWellnessProfileSchema.omit({ userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const profile = await storage.createWellnessProfile({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("[POST /api/profiles/wellness] Error:", error);
      res.status(500).json({ message: "Failed to create wellness profile", error: error.message });
    }
  });

  app.get("/api/profiles/wellness/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getWellnessProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Wellness profile not found" });
      }
      
      res.json(profile);
    } catch (error: any) {
      console.error("[GET /api/profiles/wellness/:userId] Error:", error);
      res.status(500).json({ message: "Failed to fetch wellness profile", error: error.message });
    }
  });

  app.put("/api/profiles/wellness", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const updated = await storage.updateWellnessProfile(req.user!.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("[PUT /api/profiles/wellness] Error:", error);
      res.status(500).json({ message: "Failed to update wellness profile", error: error.message });
    }
  });

  app.delete("/api/profiles/wellness", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteWellnessProfile(req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("[DELETE /api/profiles/wellness] Error:", error);
      res.status(500).json({ message: "Failed to delete wellness profile", error: error.message });
    }
  });

  app.get("/api/profiles/wellness/search", async (req: Request, res: Response) => {
    try {
      const { 
        specialty,
        city,
        minRating,
        maxRate,
        verified,
        limit = "20", 
        offset = "0" 
      } = req.query;
      
      const profiles = await storage.searchWellnessProfiles({
        specialties: specialty ? [specialty as string] : undefined,
        city: city as string | undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        maxRate: maxRate ? parseFloat(maxRate as string) : undefined,
        verified: verified === "true" ? true : verified === "false" ? false : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(profiles);
    } catch (error: any) {
      console.error("[GET /api/profiles/wellness/search] Error:", error);
      res.status(500).json({ message: "Failed to search wellness profiles", error: error.message });
    }
  });

  // Tour Operator Profile Routes
  app.post("/api/profiles/tour-operator", authenticateToken, validateRequest(insertTourOperatorProfileSchema.omit({ userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const profile = await storage.createTourOperatorProfile({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("[POST /api/profiles/tour-operator] Error:", error);
      res.status(500).json({ message: "Failed to create tour operator profile", error: error.message });
    }
  });

  app.get("/api/profiles/tour-operator/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getTourOperatorProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Tour operator profile not found" });
      }
      
      res.json(profile);
    } catch (error: any) {
      console.error("[GET /api/profiles/tour-operator/:userId] Error:", error);
      res.status(500).json({ message: "Failed to fetch tour operator profile", error: error.message });
    }
  });

  app.put("/api/profiles/tour-operator", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const updated = await storage.updateTourOperatorProfile(req.user!.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("[PUT /api/profiles/tour-operator] Error:", error);
      res.status(500).json({ message: "Failed to update tour operator profile", error: error.message });
    }
  });

  app.delete("/api/profiles/tour-operator", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteTourOperatorProfile(req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("[DELETE /api/profiles/tour-operator] Error:", error);
      res.status(500).json({ message: "Failed to delete tour operator profile", error: error.message });
    }
  });

  app.get("/api/profiles/tour-operators/search", async (req: Request, res: Response) => {
    try {
      const { 
        destination,
        tourType,
        city,
        minRating,
        maxPrice,
        verified,
        limit = "20", 
        offset = "0" 
      } = req.query;
      
      const profiles = await storage.searchTourOperatorProfiles({
        destination: destination as string | undefined,
        tourTypes: tourType ? [tourType as string] : undefined,
        city: city as string | undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        verified: verified === "true" ? true : verified === "false" ? false : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(profiles);
    } catch (error: any) {
      console.error("[GET /api/profiles/tour-operators/search] Error:", error);
      res.status(500).json({ message: "Failed to search tour operator profiles", error: error.message });
    }
  });

  // Tango Guide Profile Routes
  app.post("/api/profiles/tango-guide", authenticateToken, validateRequest(insertTangoGuideProfileSchema.omit({ userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const profile = await storage.createTangoGuideProfile({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("[POST /api/profiles/tango-guide] Error:", error);
      res.status(500).json({ message: "Failed to create tango guide profile", error: error.message });
    }
  });

  app.get("/api/profiles/tango-guide/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getTangoGuideProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Tango guide profile not found" });
      }
      
      res.json(profile);
    } catch (error: any) {
      console.error("[GET /api/profiles/tango-guide/:userId] Error:", error);
      res.status(500).json({ message: "Failed to fetch tango guide profile", error: error.message });
    }
  });

  app.put("/api/profiles/tango-guide", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const updated = await storage.updateTangoGuideProfile(req.user!.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("[PUT /api/profiles/tango-guide] Error:", error);
      res.status(500).json({ message: "Failed to update tango guide profile", error: error.message });
    }
  });

  app.delete("/api/profiles/tango-guide", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteTangoGuideProfile(req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("[DELETE /api/profiles/tango-guide] Error:", error);
      res.status(500).json({ message: "Failed to delete tango guide profile", error: error.message });
    }
  });

  app.get("/api/profiles/tango-guides/search", async (req: Request, res: Response) => {
    try {
      const { 
        city,
        languages,
        minRating,
        maxRate,
        verified,
        limit = "20", 
        offset = "0" 
      } = req.query;
      
      const profiles = await storage.searchTangoGuideProfiles({
        city: city as string | undefined,
        language: languages as string | undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        maxRate: maxRate ? parseFloat(maxRate as string) : undefined,
        verified: verified === "true" ? true : verified === "false" ? false : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(profiles);
    } catch (error: any) {
      console.error("[GET /api/profiles/tango-guides/search] Error:", error);
      res.status(500).json({ message: "Failed to search tango guide profiles", error: error.message });
    }
  });

  // Taxi Dancer Profile Routes
  app.post("/api/profiles/taxi-dancer", authenticateToken, validateRequest(insertTaxiDancerProfileSchema.omit({ userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const profile = await storage.createTaxiDancerProfile({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("[POST /api/profiles/taxi-dancer] Error:", error);
      res.status(500).json({ message: "Failed to create taxi dancer profile", error: error.message });
    }
  });

  app.get("/api/profiles/taxi-dancer/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getTaxiDancerProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Taxi dancer profile not found" });
      }
      
      res.json(profile);
    } catch (error: any) {
      console.error("[GET /api/profiles/taxi-dancer/:userId] Error:", error);
      res.status(500).json({ message: "Failed to fetch taxi dancer profile", error: error.message });
    }
  });

  app.put("/api/profiles/taxi-dancer", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const updated = await storage.updateTaxiDancerProfile(req.user!.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("[PUT /api/profiles/taxi-dancer] Error:", error);
      res.status(500).json({ message: "Failed to update taxi dancer profile", error: error.message });
    }
  });

  app.delete("/api/profiles/taxi-dancer", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteTaxiDancerProfile(req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("[DELETE /api/profiles/taxi-dancer] Error:", error);
      res.status(500).json({ message: "Failed to delete taxi dancer profile", error: error.message });
    }
  });

  app.get("/api/profiles/taxi-dancers/search", async (req: Request, res: Response) => {
    try {
      const { 
        city,
        role,
        minRating,
        maxRate,
        verified,
        available,
        limit = "20", 
        offset = "0" 
      } = req.query;
      
      const profiles = await storage.searchTaxiDancerProfiles({
        city: city as string | undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        maxRate: maxRate ? parseFloat(maxRate as string) : undefined,
        verified: verified === "true" ? true : verified === "false" ? false : undefined,
        availability: available as string | undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(profiles);
    } catch (error: any) {
      console.error("[GET /api/profiles/taxi-dancers/search] Error:", error);
      res.status(500).json({ message: "Failed to search taxi dancer profiles", error: error.message });
    }
  });

  // ============================================================================
  // BATCH 08: Content Creator/Learning Resource/Organizer Profile APIs
  // ============================================================================

  // Content Creator Profile Routes
  app.post("/api/profiles/content-creator", authenticateToken, validateRequest(insertContentCreatorProfileSchema.omit({ userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const profile = await storage.createContentCreatorProfile({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("[POST /api/profiles/content-creator] Error:", error);
      res.status(500).json({ message: "Failed to create content creator profile", error: error.message });
    }
  });

  app.get("/api/profiles/content-creator/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getContentCreatorProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Content creator profile not found" });
      }
      
      res.json(profile);
    } catch (error: any) {
      console.error("[GET /api/profiles/content-creator/:userId] Error:", error);
      res.status(500).json({ message: "Failed to fetch content creator profile", error: error.message });
    }
  });

  app.put("/api/profiles/content-creator", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const updated = await storage.updateContentCreatorProfile(req.user!.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("[PUT /api/profiles/content-creator] Error:", error);
      res.status(500).json({ message: "Failed to update content creator profile", error: error.message });
    }
  });

  app.delete("/api/profiles/content-creator", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteContentCreatorProfile(req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("[DELETE /api/profiles/content-creator] Error:", error);
      res.status(500).json({ message: "Failed to delete content creator profile", error: error.message });
    }
  });

  app.get("/api/profiles/content-creators/search", async (req: Request, res: Response) => {
    try {
      const { 
        contentType,
        platform,
        city,
        minFollowers,
        minRating,
        verified,
        limit = "20", 
        offset = "0" 
      } = req.query;
      
      const profiles = await storage.searchContentCreatorProfiles({
        contentType: contentType as string | undefined,
        platform: platform as string | undefined,
        city: city as string | undefined,
        minFollowers: minFollowers ? parseInt(minFollowers as string) : undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        verified: verified === "true" ? true : verified === "false" ? false : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(profiles);
    } catch (error: any) {
      console.error("[GET /api/profiles/content-creators/search] Error:", error);
      res.status(500).json({ message: "Failed to search content creator profiles", error: error.message });
    }
  });

  // Learning Resource Profile Routes
  app.post("/api/profiles/learning-resource", authenticateToken, validateRequest(insertLearningResourceProfileSchema.omit({ userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const profile = await storage.createLearningResourceProfile({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("[POST /api/profiles/learning-resource] Error:", error);
      res.status(500).json({ message: "Failed to create learning resource profile", error: error.message });
    }
  });

  app.get("/api/profiles/learning-resource/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getLearningResourceProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Learning resource profile not found" });
      }
      
      res.json(profile);
    } catch (error: any) {
      console.error("[GET /api/profiles/learning-resource/:userId] Error:", error);
      res.status(500).json({ message: "Failed to fetch learning resource profile", error: error.message });
    }
  });

  app.put("/api/profiles/learning-resource", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const updated = await storage.updateLearningResourceProfile(req.user!.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("[PUT /api/profiles/learning-resource] Error:", error);
      res.status(500).json({ message: "Failed to update learning resource profile", error: error.message });
    }
  });

  app.delete("/api/profiles/learning-resource", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteLearningResourceProfile(req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("[DELETE /api/profiles/learning-resource] Error:", error);
      res.status(500).json({ message: "Failed to delete learning resource profile", error: error.message });
    }
  });

  app.get("/api/profiles/learning-resources/search", async (req: Request, res: Response) => {
    try {
      const { 
        resourceType,
        format,
        level,
        city,
        minRating,
        verified,
        limit = "20", 
        offset = "0" 
      } = req.query;
      
      const profiles = await storage.searchLearningResourceProfiles({
        topic: resourceType as string | undefined,
        format: format as string | undefined,
        level: level as string | undefined,
        city: city as string | undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        verified: verified === "true" ? true : verified === "false" ? false : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(profiles);
    } catch (error: any) {
      console.error("[GET /api/profiles/learning-resources/search] Error:", error);
      res.status(500).json({ message: "Failed to search learning resource profiles", error: error.message });
    }
  });

  // Organizer Profile Routes
  app.post("/api/profiles/organizer", authenticateToken, validateRequest(insertOrganizerProfileSchema.omit({ userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const profile = await storage.createOrganizerProfile({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("[POST /api/profiles/organizer] Error:", error);
      res.status(500).json({ message: "Failed to create organizer profile", error: error.message });
    }
  });

  app.get("/api/profiles/organizer/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getOrganizerProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Organizer profile not found" });
      }
      
      res.json(profile);
    } catch (error: any) {
      console.error("[GET /api/profiles/organizer/:userId] Error:", error);
      res.status(500).json({ message: "Failed to fetch organizer profile", error: error.message });
    }
  });

  app.put("/api/profiles/organizer", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const updated = await storage.updateOrganizerProfile(req.user!.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("[PUT /api/profiles/organizer] Error:", error);
      res.status(500).json({ message: "Failed to update organizer profile", error: error.message });
    }
  });

  app.delete("/api/profiles/organizer", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteOrganizerProfile(req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("[DELETE /api/profiles/organizer] Error:", error);
      res.status(500).json({ message: "Failed to delete organizer profile", error: error.message });
    }
  });

  app.get("/api/profiles/organizers/search", async (req: Request, res: Response) => {
    try {
      const { 
        organizationType,
        city,
        country,
        minEventsOrganized,
        minRating,
        verified,
        limit = "20", 
        offset = "0" 
      } = req.query;
      
      const profiles = await storage.searchOrganizerProfiles({
        city: city as string | undefined,
        eventType: organizationType as string | undefined,
        country: country as string | undefined,
        minEventsOrganized: minEventsOrganized ? parseInt(minEventsOrganized as string) : undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        verified: verified === "true" ? true : verified === "false" ? false : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(profiles);
    } catch (error: any) {
      console.error("[GET /api/profiles/organizers/search] Error:", error);
      res.status(500).json({ message: "Failed to search organizer profiles", error: error.message });
    }
  });

  // ============================================================================
  // BATCH 13: Profile Media Upload Endpoints
  // ============================================================================

  // Helper function to get profile table and field names based on type
  const getProfileConfig = (type: string) => {
    const configs: Record<string, { table: any; photoField: string; videoField: string; portfolioField?: string }> = {
      'teacher': {
        table: teacherProfiles,
        photoField: 'photoUrls',
        videoField: 'videoUrls',
        portfolioField: 'certifications'
      },
      'dj': { 
        table: djProfiles, 
        photoField: 'photoUrls', 
        videoField: 'videoUrls',
        portfolioField: 'setLists'
      },
      'musician': { 
        table: musicianProfiles, 
        photoField: 'photoUrls',
        videoField: 'videoUrls',
        portfolioField: 'audioSamples'
      },
      'photographer': { 
        table: photographerProfiles, 
        photoField: 'photoUrls', 
        videoField: 'videoUrls',
        portfolioField: 'portfolioUrls'
      },
      'performer': { 
        table: performerProfiles, 
        photoField: 'photoUrls', 
        videoField: 'demoVideoUrls',
        portfolioField: 'performanceHistory'
      },
      'vendor': {
        table: vendorProfiles,
        photoField: 'photoUrls',
        videoField: 'videoUrls',
        portfolioField: 'catalogUrls'
      },
      'choreographer': {
        table: choreographerProfiles,
        photoField: 'photoUrls',
        videoField: 'videoUrls',
        portfolioField: 'choreographyPortfolio'
      },
      'tango-school': {
        table: tangoSchoolProfiles,
        photoField: 'photoUrls',
        videoField: 'videoUrls',
        portfolioField: 'facilityPhotos'
      },
      'tango-hotel': {
        table: tangoHotelProfiles,
        photoField: 'photoUrls',
        videoField: 'virtualTourUrl',
        portfolioField: 'roomPhotos'
      },
      'host-venue': {
        table: hostVenueProfiles,
        photoField: 'photoUrls',
        videoField: 'videoUrls',
        portfolioField: 'venuePhotos'
      },
      'wellness': {
        table: wellnessProfiles,
        photoField: 'photoUrls',
        videoField: 'videoUrls',
        portfolioField: 'servicePhotos'
      },
      'tour-operator': {
        table: tourOperatorProfiles,
        photoField: 'photoUrls',
        videoField: 'videoUrls',
        portfolioField: 'tourPhotos'
      },
      'tango-guide': {
        table: tangoGuideProfiles,
        photoField: 'photoUrls',
        videoField: 'videoUrls',
        portfolioField: 'tourHighlights'
      },
      'taxi-dancer': {
        table: taxiDancerProfiles,
        photoField: 'photoUrls',
        videoField: 'videoUrls',
        portfolioField: 'dancePhotos'
      },
      'content-creator': { 
        table: contentCreatorProfiles, 
        photoField: 'photoUrls',
        videoField: 'videoUrls',
        portfolioField: 'contentPortfolio'
      },
      'learning-resource': {
        table: learningResourceProfiles,
        photoField: 'photoUrls',
        videoField: 'videoUrls',
        portfolioField: 'resourceLinks'
      },
      'organizer': {
        table: organizerProfiles,
        photoField: 'photoUrls',
        videoField: 'videoUrls',
        portfolioField: 'eventPhotos'
      },
    };
    return configs[type];
  };

  // POST /api/profiles/:profileType/:userId/upload-photo
  app.post("/api/profiles/:profileType/:userId/upload-photo", authenticateToken, profileMediaUpload.single('photo'), async (req: AuthRequest, res: Response) => {
    try {
      const { profileType, userId } = req.params;
      const userIdInt = parseInt(userId);
      
      // Validate that user can only upload to their own profile
      if (req.user!.id !== userIdInt) {
        return res.status(403).json({ message: 'You can only upload photos to your own profile' });
      }
      
      const config = getProfileConfig(profileType);
      
      if (!config) {
        return res.status(400).json({ message: `Invalid profile type: ${profileType}` });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No photo file provided' });
      }

      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ message: 'File must be an image' });
      }

      // Upload to Cloudinary
      const uploadResult = await uploadMediaToCloudinary(
        req.file,
        `profiles/${profileType}/${userIdInt}/photos`,
        'image'
      );

      // Get current profile
      const [profile] = await db.select()
        .from(config.table)
        .where(eq(config.table.userId, userIdInt))
        .limit(1);

      if (!profile) {
        return res.status(404).json({ message: `${profileType} profile not found` });
      }

      // Add URL to photo array
      const currentPhotos = profile[config.photoField] || [];
      const updatedPhotos = [...currentPhotos, uploadResult.url];

      // Update profile
      await db.update(config.table)
        .set({ [config.photoField]: updatedPhotos, updatedAt: new Date() })
        .where(eq(config.table.userId, userIdInt));

      res.status(201).json({ 
        message: 'Photo uploaded successfully',
        url: uploadResult.url,
        type: 'photo'
      });
    } catch (error: any) {
      console.error(`[POST /api/profiles/:profileType/:userId/upload-photo] Error:`, error);
      res.status(500).json({ message: 'Failed to upload photo', error: error.message });
    }
  });

  // POST /api/profiles/:profileType/:userId/upload-video
  app.post("/api/profiles/:profileType/:userId/upload-video", authenticateToken, profileMediaUpload.single('video'), async (req: AuthRequest, res: Response) => {
    try {
      const { profileType, userId } = req.params;
      const userIdInt = parseInt(userId);
      
      // Validate that user can only upload to their own profile
      if (req.user!.id !== userIdInt) {
        return res.status(403).json({ message: 'You can only upload videos to your own profile' });
      }
      
      const config = getProfileConfig(profileType);
      
      if (!config) {
        return res.status(400).json({ message: `Invalid profile type: ${profileType}` });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No video file provided' });
      }

      if (!req.file.mimetype.startsWith('video/')) {
        return res.status(400).json({ message: 'File must be a video' });
      }

      // Upload to Cloudinary
      const uploadResult = await uploadMediaToCloudinary(
        req.file,
        `profiles/${profileType}/${userIdInt}/videos`,
        'video'
      );

      // Get current profile
      const [profile] = await db.select()
        .from(config.table)
        .where(eq(config.table.userId, userIdInt))
        .limit(1);

      if (!profile) {
        return res.status(404).json({ message: `${profileType} profile not found` });
      }

      // Add URL to video array
      const currentVideos = profile[config.videoField] || [];
      const updatedVideos = [...currentVideos, uploadResult.url];

      // Update profile
      await db.update(config.table)
        .set({ [config.videoField]: updatedVideos, updatedAt: new Date() })
        .where(eq(config.table.userId, userIdInt));

      res.status(201).json({ 
        message: 'Video uploaded successfully',
        url: uploadResult.url,
        type: 'video'
      });
    } catch (error: any) {
      console.error(`[POST /api/profiles/:profileType/:userId/upload-video] Error:`, error);
      res.status(500).json({ message: 'Failed to upload video', error: error.message });
    }
  });

  // POST /api/profiles/:profileType/:userId/upload-portfolio
  app.post("/api/profiles/:profileType/:userId/upload-portfolio", authenticateToken, profileMediaUpload.single('file'), async (req: AuthRequest, res: Response) => {
    try {
      const { profileType, userId } = req.params;
      const userIdInt = parseInt(userId);
      
      // Validate that user can only upload to their own profile
      if (req.user!.id !== userIdInt) {
        return res.status(403).json({ message: 'You can only upload portfolio items to your own profile' });
      }
      
      const config = getProfileConfig(profileType);
      
      if (!config) {
        return res.status(400).json({ message: `Invalid profile type: ${profileType}` });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file provided' });
      }

      // Determine resource type based on mime type
      let resourceType: 'image' | 'video' | 'raw' = 'image';
      let fieldToUpdate = config.portfolioField || config.photoField;

      if (req.file.mimetype.startsWith('video/')) {
        resourceType = 'video';
        fieldToUpdate = config.portfolioField || config.videoField;
      } else if (req.file.mimetype === 'application/pdf') {
        resourceType = 'raw';
        fieldToUpdate = config.portfolioField || config.photoField;
      } else if (req.file.mimetype.startsWith('audio/')) {
        resourceType = 'raw';
        fieldToUpdate = config.portfolioField || config.photoField;
      }

      // Upload to Cloudinary
      const uploadResult = await uploadMediaToCloudinary(
        req.file,
        `profiles/${profileType}/${userIdInt}/portfolio`,
        resourceType
      );

      // Get current profile
      const [profile] = await db.select()
        .from(config.table)
        .where(eq(config.table.userId, userIdInt))
        .limit(1);

      if (!profile) {
        return res.status(404).json({ message: `${profileType} profile not found` });
      }

      // Add URL to appropriate array
      const currentItems = profile[fieldToUpdate] || [];
      const updatedItems = [...currentItems, uploadResult.url];

      // Update profile
      await db.update(config.table)
        .set({ [fieldToUpdate]: updatedItems, updatedAt: new Date() })
        .where(eq(config.table.userId, userIdInt));

      res.status(201).json({ 
        message: 'Portfolio item uploaded successfully',
        url: uploadResult.url,
        type: resourceType,
        field: fieldToUpdate
      });
    } catch (error: any) {
      console.error(`[POST /api/profiles/:profileType/:userId/upload-portfolio] Error:`, error);
      res.status(500).json({ message: 'Failed to upload portfolio item', error: error.message });
    }
  });

  // DELETE /api/profiles/:profileType/:userId/media/:mediaId
  app.delete("/api/profiles/:profileType/:userId/media/:mediaId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { profileType, userId, mediaId } = req.params;
      const userIdInt = parseInt(userId);
      
      // Validate that user can only delete from their own profile
      if (req.user!.id !== userIdInt) {
        return res.status(403).json({ message: 'You can only delete media from your own profile' });
      }
      
      const config = getProfileConfig(profileType);
      
      if (!config) {
        return res.status(400).json({ message: `Invalid profile type: ${profileType}` });
      }

      // mediaId is the URL to remove
      const urlToRemove = decodeURIComponent(mediaId);

      // Get current profile
      const [profile] = await db.select()
        .from(config.table)
        .where(eq(config.table.userId, userIdInt))
        .limit(1);

      if (!profile) {
        return res.status(404).json({ message: `${profileType} profile not found` });
      }

      // Remove from all possible fields
      const updates: any = { updatedAt: new Date() };
      let mediaFound = false;

      if (profile[config.photoField]) {
        const filtered = (profile[config.photoField] as string[]).filter(url => url !== urlToRemove);
        if (filtered.length !== (profile[config.photoField] as string[]).length) {
          updates[config.photoField] = filtered;
          mediaFound = true;
        }
      }

      if (profile[config.videoField]) {
        const filtered = (profile[config.videoField] as string[]).filter(url => url !== urlToRemove);
        if (filtered.length !== (profile[config.videoField] as string[]).length) {
          updates[config.videoField] = filtered;
          mediaFound = true;
        }
      }

      if (config.portfolioField && profile[config.portfolioField]) {
        const filtered = (profile[config.portfolioField] as string[]).filter(url => url !== urlToRemove);
        if (filtered.length !== (profile[config.portfolioField] as string[]).length) {
          updates[config.portfolioField] = filtered;
          mediaFound = true;
        }
      }

      if (!mediaFound) {
        return res.status(404).json({ message: 'Media not found in profile' });
      }

      // Update profile
      await db.update(config.table)
        .set(updates)
        .where(eq(config.table.userId, userIdInt));

      res.json({ message: 'Media deleted successfully' });
    } catch (error: any) {
      console.error(`[DELETE /api/profiles/:profileType/:userId/media/:mediaId] Error:`, error);
      res.status(500).json({ message: 'Failed to delete media', error: error.message });
    }
  });

  // GET /api/profiles/:profileType/:userId/media
  app.get("/api/profiles/:profileType/:userId/media", async (req: Request, res: Response) => {
    try {
      const { profileType, userId } = req.params;
      const config = getProfileConfig(profileType);
      
      if (!config) {
        return res.status(400).json({ message: `Invalid profile type: ${profileType}` });
      }

      const userIdInt = parseInt(userId);
      if (isNaN(userIdInt)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Get profile
      const [profile] = await db.select()
        .from(config.table)
        .where(eq(config.table.userId, userIdInt))
        .limit(1);

      if (!profile) {
        return res.status(404).json({ message: `${profileType} profile not found` });
      }

      // Collect all media
      const media: any = {
        photos: profile[config.photoField] || [],
        videos: profile[config.videoField] || [],
      };

      if (config.portfolioField && profile[config.portfolioField]) {
        media.portfolio = profile[config.portfolioField];
      }

      res.json(media);
    } catch (error: any) {
      console.error(`[GET /api/profiles/:profileType/:userId/media] Error:`, error);
      res.status(500).json({ message: 'Failed to fetch media', error: error.message });
    }
  });

  app.use("/api/venues", venueRoutes);
  app.use("/api/workshops", workshopRoutes);
  app.use("/api/music", musicRoutes);
  app.use("/api/travel", travelRoutes);
  app.use("/api/achievements", achievementRoutes);
  app.use("/api/endorsements", reputationRoutes);
  app.use("/api/reputation", reputationRoutes);
  app.use("/api/profile", profileRoutes);
  
  // BATCH 13-14: Profile Media & Analytics Routes
  app.use("/api/profile", profileMediaRoutes);
  app.use("/api/profile", profileAnalyticsRoutes);
  
  // BATCH 04-05: Professional Profile Routes
  app.use("/api/profiles", professionalProfileRoutes);
  
  // BATCH 06-07: Business + Specialty Profile Routes
  app.use("/api/profiles", businessProfileRoutes);
  
  // BATCH 05-06: Service Provider + Business Profile API Endpoints
  app.use("/api", serviceProviderProfileRoutes);
  
  // BATCH 05: Service Provider Profile Routes (photographers, performers, vendors, choreographers)
  app.use("/api/profiles", serviceProfileRoutes);
  
  // BATCH 07-08: Specialty + Content/Organizer Profile Routes
  app.use("/api/profile", specialtyProfileRoutes);
  
  // BATCH 08: Content/Organizer Profile Routes
  app.use("/api/profiles", contentProfileRoutes);
  
  // Enhanced Health Check Routes (Production Monitoring)
  app.use(healthRoutes);
  
  // WAVE 7 TRACK 4: Encryption at Rest Routes (P0 #8)
  // AES-256-GCM encrypted sensitive financial, health, budget, and nutrition data
  // Note: Routes handle authentication internally - don't apply global auth middleware
  app.use(financialGoalsRoutes);
  app.use(budgetRoutes);
  app.use(healthDataRoutes);
  app.use(nutritionRoutes);
  
  // Enhanced Posts Routes (Rich Text, Multiple Images, Videos, Scheduling, Drafts, etc.)
  app.use("/api/posts", postsEnhancedRoutes);

  app.post("/api/posts", authenticateToken, validateRequest(createPostBodySchema), async (req: AuthRequest, res: Response) => {
    try {
      const postData: any = {
        ...req.body,
        userId: req.user!.id,
        type: req.body.type || 'post'
      };
      
      // If story, set 24-hour expiration
      if (postData.type === 'story') {
        postData.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
      
      const post = await storage.createPost(postData);

      // NEW: Handle canonical mention format @user:user_123:maria
      const mentionIds = req.body.mentions || [];
      const mentionedGroups: Array<{ id: number; type: string }> = [];
      const mentionedUsers: number[] = [];

      // Parse mention IDs to extract user IDs and group IDs
      for (const mentionId of mentionIds) {
        if (typeof mentionId !== 'string') continue;
        
        if (mentionId.startsWith('user_')) {
          // Extract numeric user ID from "user_123" format
          const userId = parseInt(mentionId.replace('user_', ''));
          if (!isNaN(userId) && userId !== req.user!.id) {
            mentionedUsers.push(userId);
          }
        } else if (mentionId.startsWith('group_')) {
          const groupId = parseInt(mentionId.replace('group_', ''));
          if (!isNaN(groupId)) {
            mentionedGroups.push({ id: groupId, type: 'professional-group' });
          }
        } else if (mentionId.startsWith('city_')) {
          const cityId = parseInt(mentionId.replace('city_', ''));
          if (!isNaN(cityId)) {
            mentionedGroups.push({ id: cityId, type: 'city-group' });
          }
        }
      }

      // Send mention notifications to users
      const author = await storage.getUserById(req.user!.id);
      for (const mentionedUserId of mentionedUsers) {
        try {
          await storage.createNotification({
            userId: mentionedUserId,
            type: 'mention',
            title: 'You were mentioned',
            message: `${author?.name || 'Someone'} mentioned you in a post`,
            data: JSON.stringify({ postId: post.id, relatedType: 'post' }),
            actionUrl: `/feed#post-${post.id}`
          });
          
          // Real-time Socket.io notification
          wsNotificationService.sendNotification(mentionedUserId, {
            type: 'mention',
            title: 'You were mentioned',
            message: `${author?.name || 'Someone'} mentioned you in a post`,
            postId: post.id,
            authorName: author?.name,
            authorAvatar: author?.profileImage,
          });
        } catch (error) {
          console.error(`Failed to send notification to user ${mentionedUserId}:`, error);
        }
      }

      // Auto-post to mentioned groups
      if (mentionedGroups.length > 0) {
        const user = await storage.getUserById(req.user!.id);
        const userCity = user?.city || post.location;
        
        for (const group of mentionedGroups) {
          try {
            // Determine if user is a resident or visitor
            let postType = 'visitor';
            
            if (group.type === 'city-group') {
              // For city groups, check if user's city matches the group city
              const groupData = await storage.getGroupById(group.id);
              if (groupData && userCity) {
                const cityMatch = userCity.toLowerCase().includes(groupData.city?.toLowerCase() || '') ||
                                 (groupData.city?.toLowerCase() || '').includes(userCity.toLowerCase());
                postType = cityMatch ? 'resident' : 'visitor';
              }
            } else {
              // For professional groups, consider members as residents
              const isMember = await storage.isGroupMember(group.id, req.user!.id);
              postType = isMember ? 'resident' : 'visitor';
            }
            
            // Create group post
            await storage.createGroupPost({
              groupId: group.id,
              authorId: req.user!.id,
              content: req.body.content,
              mediaUrls: req.body.imageUrls || [],
              mediaType: req.body.imageUrls && req.body.imageUrls.length > 0 ? 'image' : undefined,
              postType: postType,
              isApproved: true, // Auto-approve posts from mentions
            });
            
            console.log(`[Auto-Post] ✅ Posted to ${group.type} "${group.name}" as ${postType}`);
          } catch (error) {
            console.error(`[Auto-Post] Failed to post to group ${group.id}:`, error);
          }
        }
      }

      if (post.location) {
        const cityName = cityscapeService.parseCityFromLocation(post.location);
        
        if (cityName) {
          const existingCommunities = await storage.getGroups({ search: cityName, limit: 10, offset: 0 });
          const cityExists = existingCommunities.some(
            c => c.name.toLowerCase() === cityName.toLowerCase()
          );

          if (!cityExists) {
            console.log(`[City Auto-Creation] Creating new city: ${cityName}`);
            
            const cityscapePhoto = await cityscapeService.fetchCityscapePhoto(cityName);
            
            const newCityCommunity = await storage.createGroup({
              name: cityName,
              description: `The official ${cityName} tango community. Connect with dancers, teachers, and events in your city.`,
              type: "city",
              createdBy: req.user!.id,
              coverImage: cityscapePhoto?.url || "",
              city: cityName,
              slug: cityName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            });

            await storage.joinGroup(newCityCommunity.id, req.user!.id);
            
            console.log(`[City Auto-Creation] ✅ Created ${cityName} community (ID: ${newCityCommunity.id})`);
          }
        }
      }

      // Fetch the full post with user data populated (including role)
      const fullPost = await storage.getPostById(post.id);
      res.status(201).json(fullPost);
    } catch (error) {
      console.error("[POST /api/posts] Error:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Get stories (active, non-expired)
  app.get("/api/posts/stories", async (req: Request & { userId?: number; user?: any }, res: Response) => {
    try {
      const currentUserId = req.user?.id;
      
      // Get active stories using Drizzle directly
      const { and, eq, gt } = await import("drizzle-orm");
      const { posts: postsTable } = await import("@shared/schema");
      const { db } = await import("./db");
      
      const stories = await db.select()
        .from(postsTable)
        .where(
          and(
            eq(postsTable.type, 'story'),
            gt(postsTable.expiresAt, new Date())
          )
        )
        .orderBy(postsTable.createdAt)
        .limit(20);
      
      // Enrich with user data
      const { enrichPostContentWithGroupTypes } = await import("./utils/enrich-mentions");
      const enrichedStories = await Promise.all(
        stories.map(async (story: any) => {
          const user = await storage.getUserById(story.userId);
          return {
            ...story,
            content: await enrichPostContentWithGroupTypes(story.content),
            user: user ? {
              id: user.id,
              name: user.name,
              username: user.username,
              profileImage: user.profileImage
            } : null
          };
        })
      );
      
      res.json(enrichedStories);
    } catch (error) {
      console.error("[GET /api/posts/stories] Error fetching stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.get("/api/posts", async (req: Request & { userId?: number; user?: any }, res: Response) => {
    try {
      const { userId, limit = "20", offset = "0", type = "post" } = req.query;
      const currentUserId = req.user?.id; // From auth middleware if authenticated (optional for public route)
      
      // Filter by type (default to 'post' to exclude stories from regular feed)
      const posts = await storage.getPosts({
        userId: userId ? parseInt(userId as string) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        currentUserId: currentUserId,
        type: type as string
      });
      
      // Enrich posts with group type information for proper color rendering
      const { enrichPostContentWithGroupTypes } = await import("./utils/enrich-mentions");
      const enrichedPosts = await Promise.all(
        posts.map(async (post: any) => ({
          ...post,
          content: await enrichPostContentWithGroupTypes(post.content),
        }))
      );
      
      res.json(enrichedPosts);
    } catch (error) {
      console.error("[GET /api/posts] Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // ============================================================================
  // FEED ALGORITHM ENDPOINTS (Features 11-18)
  // ============================================================================
  
  // Feature 11: Personalized Feed
  app.get("/api/feed/personalized", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { limit = "20", offset = "0" } = req.query;
      const result = await feedAlgorithmService.getPersonalizedFeed(
        req.user!.id,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      res.json(result);
    } catch (error) {
      console.error("[GET /api/feed/personalized] Error:", error);
      res.status(500).json({ message: "Failed to fetch personalized feed" });
    }
  });

  // Feature 13: Following Feed
  app.get("/api/feed/following", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { limit = "20", offset = "0" } = req.query;
      const result = await feedAlgorithmService.getFollowingFeed(
        req.user!.id,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      res.json(result);
    } catch (error) {
      console.error("[GET /api/feed/following] Error:", error);
      res.status(500).json({ message: "Failed to fetch following feed" });
    }
  });

  // Feature 13: Discover Feed
  app.get("/api/feed/discover", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { limit = "20", offset = "0" } = req.query;
      const result = await feedAlgorithmService.getDiscoverFeed(
        req.user!.id,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      res.json(result);
    } catch (error) {
      console.error("[GET /api/feed/discover] Error:", error);
      res.status(500).json({ message: "Failed to fetch discover feed" });
    }
  });

  // Feature 16: Trending Posts
  app.get("/api/feed/trending", async (req: Request, res: Response) => {
    try {
      const { limit = "5" } = req.query;
      const posts = await feedAlgorithmService.getTrendingPosts(parseInt(limit as string));
      res.json(posts);
    } catch (error) {
      console.error("[GET /api/feed/trending] Error:", error);
      res.status(500).json({ message: "Failed to fetch trending posts" });
    }
  });

  // Feature 17: Recently Active Users
  app.get("/api/feed/active-users", async (req: Request, res: Response) => {
    try {
      const { limit = "10" } = req.query;
      const users = await feedAlgorithmService.getRecentlyActiveUsers(parseInt(limit as string));
      res.json(users);
    } catch (error) {
      console.error("[GET /api/feed/active-users] Error:", error);
      res.status(500).json({ message: "Failed to fetch active users" });
    }
  });

  // Feature 18: AI-Powered Recommendations
  app.get("/api/feed/recommended", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { limit = "10" } = req.query;
      const posts = await feedAlgorithmService.getRecommendedPosts(
        req.user!.id,
        parseInt(limit as string)
      );
      res.json(posts);
    } catch (error) {
      console.error("[GET /api/feed/recommended] Error:", error);
      res.status(500).json({ message: "Failed to fetch recommended posts" });
    }
  });

  // ============================================================================
  // EXISTING POSTS ENDPOINTS
  // ============================================================================

  app.get("/api/posts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPostById(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const comments = await storage.getPostComments(id);
      res.json({ ...post, comments });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.put("/api/posts/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPostById(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updated = await storage.updatePost(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.patch("/api/posts/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPostById(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updated = await storage.updatePost(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPostById(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deletePost(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  app.post("/api/posts/:id/like", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      await storage.likePost(postId, req.user!.id);
      res.json({ liked: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete("/api/posts/:id/like", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      await storage.unlikePost(postId, req.user!.id);
      res.json({ liked: false });
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  // REACTIONS - 13 reaction types
  app.post("/api/posts/:id/react", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const { reactionType } = req.body;
      
      if (!reactionType) {
        return res.status(400).json({ message: "Reaction type is required" });
      }

      // Remove any existing reaction
      await db.delete(reactions).where(
        and(
          eq(reactions.postId, postId),
          eq(reactions.userId, req.user!.id)
        )
      );

      // Add new reaction if not removing
      if (reactionType !== '') {
        await db.insert(reactions).values({
          postId,
          userId: req.user!.id,
          reactionType,
        });

        // Send notification to post author
        const post = await storage.getPostById(postId);
        if (post && post.userId !== req.user!.id) {
          await storage.createNotification({
            userId: post.userId,
            type: 'reaction',
            title: 'New reaction',
            message: `Someone reacted ${reactionType} to your post`,
            data: JSON.stringify({ postId }),
            actionUrl: `/feed#post-${postId}`
          });
        }
      }

      // Get updated reaction counts by type
      const reactionsByType = await db
        .select({
          reactionType: reactions.reactionType,
          count: sql<number>`count(*)::int`
        })
        .from(reactions)
        .where(eq(reactions.postId, postId))
        .groupBy(reactions.reactionType);
      
      // Build reactions object { "love": 5, "fire": 3, ... }
      const reactionsObject: Record<string, number> = {};
      let totalCount = 0;
      for (const row of reactionsByType) {
        reactionsObject[row.reactionType] = row.count;
        totalCount += row.count;
      }
      
      // Update posts.likes count to reflect current reaction count
      await db.update(posts)
        .set({ likes: totalCount })
        .where(eq(posts.id, postId));

      // Get user's current reaction
      const userReactionResult = await db
        .select()
        .from(reactions)
        .where(
          and(
            eq(reactions.postId, postId),
            eq(reactions.userId, req.user!.id)
          )
        )
        .limit(1);
      
      const userReaction = userReactionResult[0]?.reactionType || null;

      // Feature 19: Broadcast reaction update via WebSocket
      wsEngagementService.broadcastLikeUpdate(
        postId,
        req.user!.id,
        req.user!.name || req.user!.email,
        reactionsObject,
        userReaction,
        totalCount
      );

      res.json({ 
        reactions: reactionsObject,
        currentReaction: userReaction,  // Match field name from GET /api/posts
        totalReactions: totalCount
      });
    } catch (error) {
      console.error('React to post error:', error);
      res.status(500).json({ message: "Failed to react to post" });
    }
  });

  // DELETE reaction
  app.delete("/api/posts/:id/react", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);

      // Remove user's reaction
      await db.delete(reactions).where(
        and(
          eq(reactions.postId, postId),
          eq(reactions.userId, req.user!.id)
        )
      );

      // Get updated reaction counts by type
      const reactionsByType = await db
        .select({
          reactionType: reactions.reactionType,
          count: sql<number>`count(*)::int`
        })
        .from(reactions)
        .where(eq(reactions.postId, postId))
        .groupBy(reactions.reactionType);
      
      // Build reactions object
      const reactionsObject: Record<string, number> = {};
      let totalCount = 0;
      for (const row of reactionsByType) {
        reactionsObject[row.reactionType] = row.count;
        totalCount += row.count;
      }
      
      // Update posts.likes count
      await db.update(posts)
        .set({ likes: totalCount })
        .where(eq(posts.id, postId));

      // Feature 19: Broadcast reaction update via WebSocket
      wsEngagementService.broadcastLikeUpdate(
        postId,
        req.user!.id,
        req.user!.name || req.user!.email,
        reactionsObject,
        null, // User removed their reaction
        totalCount
      );

      res.json({ 
        reactions: reactionsObject,
        currentReaction: null,  // Match field name from GET /api/posts
        totalReactions: totalCount
      });
    } catch (error) {
      console.error('Remove reaction error:', error);
      res.status(500).json({ message: "Failed to remove reaction" });
    }
  });

  // SHARE - 3 share types: timeline, comment, link
  app.post("/api/posts/:id/share", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const { shareType, comment } = req.body;
      
      if (!shareType || !['timeline', 'comment', 'link'].includes(shareType)) {
        return res.status(400).json({ message: "Valid share type is required" });
      }

      if (shareType !== 'link') {
        await db.insert(postShares).values({
          postId,
          userId: req.user!.id,
          shareType,
          comment: comment || null,
        });

        // Send notification to post author
        const post = await storage.getPostById(postId);
        if (post && post.userId !== req.user!.id) {
          await storage.createNotification({
            userId: post.userId,
            type: 'share',
            title: 'Post shared',
            message: `Someone shared your post${comment ? ' with a comment' : ''}`,
            data: JSON.stringify({ postId }),
            actionUrl: `/feed#post-${postId}`
          });
        }
      }

      res.json({ shared: true });
    } catch (error) {
      console.error('Share post error:', error);
      res.status(500).json({ message: "Failed to share post" });
    }
  });

  // COMMENT LIKES
  app.post("/api/comments/:id/like", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const commentId = parseInt(req.params.id);
      
      await db.transaction(async (tx) => {
        // Check if already liked
        const existing = await tx.select().from(commentLikes)
          .where(and(
            eq(commentLikes.commentId, commentId),
            eq(commentLikes.userId, req.user!.id)
          ))
          .limit(1);

        if (existing.length === 0) {
          // Add like
          await tx.insert(commentLikes).values({
            commentId,
            userId: req.user!.id,
          });

          // Send notification to comment author
          const comment = await tx.select().from(postComments)
            .where(eq(postComments.id, commentId))
            .limit(1);
          
          if (comment[0] && comment[0].userId !== req.user!.id) {
            await storage.createNotification({
              userId: comment[0].userId,
              type: 'comment_like',
              title: 'Comment liked',
              message: 'Someone liked your comment',
              data: JSON.stringify({ commentId })
            });
          }
        } else {
          // Remove like
          await tx.delete(commentLikes).where(
            and(
              eq(commentLikes.commentId, commentId),
              eq(commentLikes.userId, req.user!.id)
            )
          );
        }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Like comment error:', error);
      res.status(500).json({ message: "Failed to like comment" });
    }
  });

  app.post("/api/posts/:id/save", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      await storage.savePost(postId, req.user!.id);
      res.json({ saved: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to save post" });
    }
  });

  app.delete("/api/posts/:id/save", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      await storage.unsavePost(postId, req.user!.id);
      res.json({ saved: false });
    } catch (error) {
      res.status(500).json({ message: "Failed to unsave post" });
    }
  });

  app.post("/api/posts/:id/report", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const { reason, details } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: "Reason is required" });
      }
      
      await storage.reportPost({
        contentType: "post",
        contentId: postId,
        reporterId: req.user!.id,
        reason,
        details: details || null,
      });
      
      res.status(201).json({ message: "Report submitted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit report" });
    }
  });

  app.post("/api/posts/:id/comments", authenticateToken, validateRequest(insertPostCommentSchema.omit({ postId: true, userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const comment = await storage.createPostComment({
        ...req.body,
        postId,
        userId: req.user!.id
      });

      // Feature 20: Broadcast new comment via WebSocket
      wsEngagementService.broadcastNewComment(postId, comment);

      res.status(201).json(comment);
    } catch (error) {
      console.error("Create comment error:", error);
      res.status(500).json({ message: "Failed to create comment", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/posts/:id/comments", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/users/:id/follow", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const followingId = parseInt(req.params.id);
      
      if (followingId === req.user!.id) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      const result = await storage.followUser(req.user!.id, followingId);
      
      if (!result) {
        return res.status(400).json({ message: "Already following this user" });
      }
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete("/api/users/:id/follow", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const followingId = parseInt(req.params.id);
      await storage.unfollowUser(req.user!.id, followingId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const param = req.params.id;
      let user: any;
      
      // Check if param is a number or a username
      if (/^\d+$/.test(param)) {
        // It's a numeric ID
        user = await storage.getUserById(parseInt(param));
      } else {
        // It's a username
        user = await storage.getUserByUsername(param);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/users/:id/followers", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch followers" });
    }
  });

  app.get("/api/users/:id/following", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const following = await storage.getFollowing(userId);
      res.json(following);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch following" });
    }
  });

  // Global search endpoint for UnifiedTopBar
  app.get("/api/user/global-search", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 3) {
        return res.json({ users: [], events: [], groups: [], posts: [] });
      }

      const searchTerm = `%${query.toLowerCase()}%`;

      // Search users
      const usersResults = await db.select({
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
        type: sql<string>`'user'`,
      })
        .from(users)
        .where(
          or(
            sql`LOWER(${users.name}) LIKE ${searchTerm}`,
            sql`LOWER(${users.username}) LIKE ${searchTerm}`
          )
        )
        .limit(5);

      // Search events
      const eventsResults = await db.select({
        id: events.id,
        title: events.title,
        date: events.date,
        city: events.city,
        type: sql<string>`'event'`,
      })
        .from(events)
        .where(sql`LOWER(${events.title}) LIKE ${searchTerm}`)
        .limit(5);

      // Search groups
      const groupsResults = await db.select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        memberCount: groups.memberCount,
        type: sql<string>`'group'`,
      })
        .from(groups)
        .where(sql`LOWER(${groups.name}) LIKE ${searchTerm}`)
        .limit(5);

      res.json({
        users: usersResults,
        events: eventsResults,
        groups: groupsResults,
      });
    } catch (error) {
      console.error("Global search error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  app.post("/api/events", authenticateToken, validateRequest(insertEventSchema.omit({ userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const event = await storage.createEvent({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // NOTE: /api/events routes are now handled by event-routes.ts router (line 627)
  // This section was left as a placeholder for reference

  app.get("/api/events/my-rsvps", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const rsvps = await storage.getUserRsvps(req.user!.id);
      res.json(rsvps);
    } catch (error) {
      console.error("Get user RSVPs error:", error);
      res.status(500).json({ message: "Failed to fetch user RSVPs" });
    }
  });

  app.get("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEventById(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.put("/api/events/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEventById(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (event.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updated = await storage.updateEvent(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEventById(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (event.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteEvent(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  app.post("/api/events/:id/rsvp", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["going", "interested", "maybe"].includes(status)) {
        return res.status(400).json({ message: "Invalid RSVP status" });
      }
      
      const existing = await storage.getUserEventRsvp(eventId, req.user!.id);
      
      if (existing) {
        const updated = await storage.updateEventRsvp(eventId, req.user!.id, status);
        return res.json(updated);
      }
      
      const rsvp = await storage.createEventRsvp({
        eventId,
        userId: req.user!.id,
        status
      });
      
      res.status(201).json(rsvp);
    } catch (error) {
      res.status(500).json({ message: "Failed to RSVP to event" });
    }
  });

  app.get("/api/events/:id/attendees", async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const attendees = await storage.getEventRsvps(eventId);
      res.json(attendees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendees" });
    }
  });

  app.post("/api/groups", authenticateToken, validateRequest(insertGroupSchema.omit({ createdBy: true, ownerId: true, slug: true })), async (req: AuthRequest, res: Response) => {
    try {
      // Generate slug from name if not provided
      const slug = req.body.slug || req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const group = await storage.createGroup({
        ...req.body,
        slug,
        createdBy: req.user!.id,
        ownerId: req.user!.id
      });
      
      await storage.joinGroup(group.id, req.user!.id);
      
      res.status(201).json(group);
    } catch (error) {
      console.error("Create group error:", error);
      res.status(500).json({ message: "Failed to create group", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/groups", async (req: Request, res: Response) => {
    try {
      const { search, limit = "20", offset = "0" } = req.query;
      const groups = await storage.getGroups({
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get("/api/groups/:id", async (req: Request, res: Response) => {
    try {
      const param = req.params.id;
      let group: any;
      
      // Check if param is a number or a slug
      if (/^\d+$/.test(param)) {
        // It's a numeric ID
        group = await storage.getGroupById(parseInt(param));
      } else {
        // It's a slug
        group = await storage.getGroupBySlug(param);
      }
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      res.json(group);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });

  app.post("/api/groups/:id/join", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      const result = await storage.joinGroup(groupId, req.user!.id);
      
      if (!result) {
        return res.status(400).json({ message: "Already a member of this group" });
      }
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to join group" });
    }
  });

  app.delete("/api/groups/:id/leave", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      await storage.leaveGroup(groupId, req.user!.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to leave group" });
    }
  });

  app.get("/api/groups/:id/members", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      const members = await storage.getGroupMembers(groupId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.get("/api/groups/:id/membership", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      const isMember = await storage.isGroupMember(groupId, req.user!.id);
      res.json({ isMember });
    } catch (error) {
      res.status(500).json({ message: "Failed to check membership" });
    }
  });

  app.get("/api/messages/conversations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const conversations = await storage.getUserConversations(req.user!.id);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/messages/conversations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { userId: otherUserId } = req.body;
      
      if (!otherUserId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const conversation = await storage.getOrCreateDirectConversation(req.user!.id, otherUserId);
      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get("/api/messages/conversations/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const chatRoomId = parseInt(req.params.id);
      const { limit = "50", offset = "0" } = req.query;
      
      const messages = await storage.getChatRoomMessages(
        chatRoomId,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages/conversations/:id/messages", authenticateToken, validateRequest(insertChatMessageSchema.omit({ chatRoomId: true, userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const chatRoomId = parseInt(req.params.id);
      const message = await storage.sendMessage({
        ...req.body,
        chatRoomId,
        userId: req.user!.id
      });
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.put("/api/messages/conversations/:id/read", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const chatRoomId = parseInt(req.params.id);
      await storage.markConversationAsRead(chatRoomId, req.user!.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to mark as read" });
    }
  });

  app.get("/api/messages/unread-count", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const result = await db.select({
        count: sql<number>`count(*)::int`
      })
      .from(chatMessages)
      .where(
        sql`NOT (${req.user!.id}::text = ANY(${chatMessages.readBy}))`
      );
      
      res.json({ count: result[0]?.count || 0 });
    } catch (error) {
      console.error("Get unread message count error:", error);
      res.status(500).json({ message: "Failed to fetch unread message count" });
    }
  });

  app.get("/api/notifications", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { limit = "50" } = req.query;
      const notifications = await storage.getUserNotifications(req.user!.id, parseInt(limit as string));
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/count", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const result = await db.select({
        count: sql<number>`count(*)::int`
      })
      .from(notifications)
      .where(and(
        eq(notifications.userId, req.user!.id),
        eq(notifications.isRead, false)
      ));
      
      res.json({ count: result[0]?.count || 0 });
    } catch (error) {
      console.error("Get notification count error:", error);
      res.status(500).json({ message: "Failed to fetch notification count" });
    }
  });

  app.put("/api/notifications/:id/read", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/read-all", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.markAllNotificationsAsRead(req.user!.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Friends endpoints
  app.get("/api/friends", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const friends = await storage.getUserFriends(req.user!.id);
      res.json(friends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.get("/api/friends/requests", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const requests = await storage.getFriendRequests(req.user!.id);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch friend requests" });
    }
  });

  app.get("/api/friends/suggestions", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const suggestions = await storage.getFriendSuggestions(req.user!.id);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch friend suggestions" });
    }
  });

  app.post("/api/friends/requests", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.body;
      const result = await storage.sendFriendRequest({ senderId: req.user!.id, receiverId: userId });
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });

  app.post("/api/friends/requests/:id/accept", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      await storage.acceptFriendRequest(requestId);
      res.json({ accepted: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to accept friend request" });
    }
  });

  app.delete("/api/friends/requests/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      await storage.declineFriendRequest(requestId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to decline friend request" });
    }
  });

  app.post("/api/friends/request/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const receiverId = parseInt(req.params.userId);
      const result = await storage.sendFriendRequest({ senderId: req.user!.id, receiverId });
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });

  app.post("/api/friends/requests/:id/reject", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      await storage.declineFriendRequest(requestId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject friend request" });
    }
  });

  app.delete("/api/friends/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const friendId = parseInt(req.params.id);
      await storage.removeFriend(req.user!.id, friendId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove friend" });
    }
  });

  app.get("/api/friends/mutual/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const mutualFriends = await storage.getMutualFriends(req.user!.id, userId);
      res.json(mutualFriends);
    } catch (error) {
      console.error("[GET /api/friends/mutual/:userId] Error:", error);
      res.status(500).json({ message: "Failed to fetch mutual friends" });
    }
  });

  app.get("/api/friends/friendship/:friendId/stats", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const friendId = parseInt(req.params.friendId);
      const stats = await storage.getFriendshipStats(req.user!.id, friendId);
      
      if (!stats) {
        return res.status(404).json({ message: "Friendship not found" });
      }
      
      res.json(stats);
    } catch (error) {
      console.error("[GET /api/friends/friendship/:friendId/stats] Error:", error);
      res.status(500).json({ message: "Failed to fetch friendship stats" });
    }
  });

  app.patch("/api/notifications/:id/read", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/mark-all-read", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.markAllNotificationsAsRead(req.user!.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.deleteNotification(notificationId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  app.post("/api/communities/auto-join", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { cityName, country } = req.body;
      
      let community = await storage.getCommunityByCity(cityName);
      
      if (!community) {
        // Import cityscape system
        const { assignCityscapeToCommunity } = await import('./algorithms/cityCityscape');
        const cityscapeData = assignCityscapeToCommunity(cityName);
        
        community = await storage.createCommunity({
          name: `${cityName} Tango Community`,
          cityName,
          country,
          description: `Connect with tango dancers in ${cityName}`,
          ...cityscapeData
        });
      }
      
      const existingMembership = await storage.getCommunityMembership(community.id, req.user!.id);
      if (!existingMembership) {
        await storage.joinCommunity(community.id, req.user!.id);
      }
      
      res.json(community);
    } catch (error) {
      console.error("Auto-join community error:", error);
      res.status(500).json({ message: "Failed to join community" });
    }
  });

  app.post("/api/users/me/photo", authenticateToken, async (req: any, res: Response) => {
    try {
      res.json({ imageUrl: "https://via.placeholder.com/400" });
    } catch (error) {
      res.status(500).json({ message: "Photo upload failed" });
    }
  });

  // Feed stats endpoint for hero section
  app.get("/api/feed/stats", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const postsToday = await storage.getPostsCount({ since: today });
      const activeUsers = await storage.getActiveUsersCount();
      const upcomingEvents = await storage.getUpcomingEventsCount();
      
      res.json({
        postsToday: postsToday || 24,
        activeUsers: activeUsers || 142,
        upcomingEvents: upcomingEvents || 8
      });
    } catch (error) {
      res.json({ postsToday: 24, activeUsers: 142, upcomingEvents: 8 });
    }
  });

  // Search endpoint
  app.get("/api/search", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const query = (req.query.query as string) || "";
      if (query.length < 2) {
        return res.json({ users: [], events: [], groups: [] });
      }
      const results = await storage.search(query, req.user!.id);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Admin endpoints
  app.get("/api/admin/stats", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/moderation-queue", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const queue = await storage.getModerationQueue();
      res.json(queue);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch moderation queue" });
    }
  });

  app.get("/api/admin/activity", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const activity = await storage.getRecentAdminActivity();
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // ============================================================================
  // TRACK 6: NEW API ROUTES FOR 8 PAGES
  // ============================================================================

  // 1. MEMORIES API (GET, POST)
  // Uses media table for personal memories
  app.get("/api/memories", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { limit = "20", offset = "0", filter = "all" } = req.query;
      const userId = req.user!.id;
      
      let params: any = {
        type: filter === "all" ? undefined : filter === "photos" ? "image" : filter,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };
      
      const memories = await storage.getUserMedia(userId, params);
      res.json({ memories, total: memories.length });
    } catch (error) {
      console.error("Get memories error:", error);
      res.status(500).json({ message: "Failed to fetch memories" });
    }
  });

  app.post("/api/memories", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const memory = await storage.createMedia({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(memory);
    } catch (error) {
      console.error("Create memory error:", error);
      res.status(500).json({ message: "Failed to create memory" });
    }
  });

  // 2. RECOMMENDATIONS API (GET)
  // Returns personalized recommendations based on user preferences
  app.get("/api/recommendations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { type = "events", limit = "10" } = req.query;
      const userId = req.user!.id;
      
      let recommendations: any[] = [];
      const limitNum = parseInt(limit as string);
      
      // Use existing recommendation algorithms based on type
      switch (type) {
        case "events":
          const events = await storage.getEvents({ limit: limitNum, offset: 0 });
          recommendations = events.map(e => ({ ...e, recommendationType: "event" }));
          break;
        case "people":
          const suggestions = await storage.getFriendSuggestions(userId);
          recommendations = suggestions.slice(0, limitNum).map((s: any) => ({ ...s, recommendationType: "person" }));
          break;
        case "venues":
          const venues = await storage.getVenues({ limit: limitNum, offset: 0 });
          recommendations = venues.map(v => ({ ...v, recommendationType: "venue" }));
          break;
        case "content":
          const posts = await storage.getPosts({ limit: limitNum, offset: 0 });
          recommendations = posts.map(p => ({ ...p, recommendationType: "content" }));
          break;
        default:
          recommendations = [];
      }
      
      res.json({ recommendations, type, count: recommendations.length });
    } catch (error) {
      console.error("Get recommendations error:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // 3. COMMUNITY MAP API (GET)
  // Returns global community data with city markers and member counts
  app.get("/api/community-map", async (req: Request, res: Response) => {
    try {
      const { region } = req.query;
      
      let communities: any[];
      if (region) {
        communities = await storage.searchCommunities(region as string, 100);
      } else {
        const groups = await storage.getGroups({ search: "", limit: 100, offset: 0 });
        communities = groups.filter((g: any) => g.groupType === "city");
      }
      
      // Get active events per city
      const events = await storage.getEvents({ limit: 100, offset: 0 });
      
      const communityData = communities.map(community => {
        const cityEvents = events.filter((e: any) => 
          e.city?.toLowerCase() === community.city?.toLowerCase()
        );
        
        return {
          id: community.id,
          name: community.name,
          city: community.city,
          country: community.country,
          memberCount: community.memberCount || 0,
          activeEvents: cityEvents.length,
          coverPhoto: community.coverPhoto,
          coordinates: {
            lat: 0, // Would need geocoding service
            lng: 0
          }
        };
      });
      
      res.json({ communities: communityData, total: communityData.length });
    } catch (error) {
      console.error("Get community map error:", error);
      res.status(500).json({ message: "Failed to fetch community map data" });
    }
  });

  // 4. INVITATIONS API (GET, POST, PUT)
  // For role invitations (e.g., admin, volunteer, team member invitations)
  app.get("/api/invitations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Get friend requests as invitations (can be extended for role-based invitations)
      const invitations = await storage.getFriendRequests(userId);
      
      res.json({ invitations, total: invitations.length });
    } catch (error) {
      console.error("Get invitations error:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  app.post("/api/invitations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { receiverId, message, invitationType = "friend" } = req.body;
      
      if (!receiverId) {
        return res.status(400).json({ message: "receiverId is required" });
      }
      
      const invitation = await storage.sendFriendRequest({
        senderId: req.user!.id,
        receiverId,
        senderMessage: message || "",
        status: "pending"
      });
      
      res.status(201).json(invitation);
    } catch (error) {
      console.error("Create invitation error:", error);
      res.status(500).json({ message: "Failed to create invitation" });
    }
  });

  app.put("/api/invitations/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const invitationId = parseInt(req.params.id);
      const { action } = req.body; // "accept" or "decline"
      
      if (!action || !["accept", "decline"].includes(action)) {
        return res.status(400).json({ message: "action must be 'accept' or 'decline'" });
      }
      
      if (action === "accept") {
        await storage.acceptFriendRequest(invitationId);
      } else {
        await storage.declineFriendRequest(invitationId);
      }
      
      res.json({ message: `Invitation ${action}ed successfully` });
    } catch (error) {
      console.error("Update invitation error:", error);
      res.status(500).json({ message: "Failed to update invitation" });
    }
  });

  // 5. FAVORITES API (GET, POST, DELETE)
  // For bookmarked content (posts, events, people, venues)
  app.get("/api/favorites", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { category = "all" } = req.query;
      const userId = req.user!.id;
      
      // For now, returns saved posts (can be extended for other content types)
      const savedPostsData = await db
        .select({
          id: savedPosts.id,
          postId: savedPosts.postId,
          createdAt: savedPosts.createdAt,
          post: posts
        })
        .from(savedPosts)
        .leftJoin(posts, eq(savedPosts.postId, posts.id))
        .where(eq(savedPosts.userId, userId))
        .orderBy(desc(savedPosts.createdAt));
      
      const favorites = savedPostsData.map(sp => ({
        ...sp.post,
        favoriteId: sp.id,
        favoritedAt: sp.createdAt,
        category: "post"
      }));
      
      res.json({ favorites, total: favorites.length });
    } catch (error) {
      console.error("Get favorites error:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { contentType, contentId } = req.body;
      
      if (!contentType || !contentId) {
        return res.status(400).json({ message: "contentType and contentId are required" });
      }
      
      // For posts
      if (contentType === "post") {
        await storage.savePost(contentId, req.user!.id);
      }
      
      res.status(201).json({ message: "Added to favorites" });
    } catch (error) {
      console.error("Add favorite error:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const favoriteId = parseInt(req.params.id);
      const { contentType = "post" } = req.query;
      
      if (contentType === "post") {
        // Get the saved post to find postId
        const savedPost = await db
          .select()
          .from(savedPosts)
          .where(and(eq(savedPosts.id, favoriteId), eq(savedPosts.userId, req.user!.id)))
          .limit(1);
        
        if (savedPost[0]) {
          await storage.unsavePost(savedPost[0].postId, req.user!.id);
        }
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Remove favorite error:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // 6. ESA FRAMEWORK STATUS API (GET) - Admin only
  // Returns ESA framework overview with 105 agents, health metrics, certification levels
  app.get("/api/platform/esa", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
    try {
      // Get all ESA agents
      const agents = await db
        .select()
        .from(esaAgents)
        .orderBy(esaAgents.agentCode);
      
      // Get agent health metrics
      const healthMetrics = await db
        .select()
        .from(agentHealth)
        .orderBy(desc(agentHealth.lastCheckAt));
      
      // Calculate summary metrics
      const totalAgents = agents.length;
      const certifiedAgents = agents.filter(a => a.certificationLevel && a.certificationLevel > 0).length;
      const activeAgents = agents.filter(a => a.status === "active").length;
      
      const healthByStatus = {
        healthy: healthMetrics.filter(h => h.status === "healthy").length,
        degraded: healthMetrics.filter(h => h.status === "degraded").length,
        failing: healthMetrics.filter(h => h.status === "failing").length,
        offline: healthMetrics.filter(h => h.status === "offline").length
      };
      
      res.json({
        framework: "ESA",
        totalAgents,
        activeAgents,
        certifiedAgents,
        healthMetrics: healthByStatus,
        agents: agents.map(a => ({
          agentCode: a.agentCode,
          agentName: a.agentName,
          agentType: a.agentType,
          status: a.status,
          certificationLevel: a.certificationLevel,
          tasksCompleted: a.tasksCompleted,
          lastActiveAt: a.lastActiveAt
        }))
      });
    } catch (error) {
      console.error("Get ESA framework error:", error);
      res.status(500).json({ message: "Failed to fetch ESA framework status" });
    }
  });

  // 7. ESA TASKS API (GET, POST, PUT) - Admin only
  app.get("/api/platform/esa/tasks", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
    try {
      const { agentId, status, limit = "50" } = req.query;
      
      let query = db.select().from(agentTasks);
      const conditions = [];
      
      if (agentId) {
        conditions.push(eq(agentTasks.agentId, parseInt(agentId as string)));
      }
      if (status) {
        conditions.push(eq(agentTasks.status, status as string));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const tasks = await query
        .orderBy(desc(agentTasks.createdAt))
        .limit(parseInt(limit as string));
      
      res.json({ tasks, total: tasks.length });
    } catch (error) {
      console.error("Get ESA tasks error:", error);
      res.status(500).json({ message: "Failed to fetch ESA tasks" });
    }
  });

  app.post("/api/platform/esa/tasks", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
    try {
      const { agentId, taskType, title, description, priority = "medium" } = req.body;
      
      if (!agentId || !taskType || !title) {
        return res.status(400).json({ message: "agentId, taskType, and title are required" });
      }
      
      const task = await db.insert(agentTasks).values({
        agentId,
        taskType,
        title,
        description,
        priority,
        status: "pending"
      }).returning();
      
      res.status(201).json(task[0]);
    } catch (error) {
      console.error("Create ESA task error:", error);
      res.status(500).json({ message: "Failed to create ESA task" });
    }
  });

  app.put("/api/platform/esa/tasks/:id", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const { status, result, errorMessage } = req.body;
      
      const updateData: any = { updatedAt: new Date() };
      if (status) updateData.status = status;
      if (result) updateData.result = result;
      if (errorMessage) updateData.errorMessage = errorMessage;
      
      if (status === "completed") {
        updateData.completedAt = new Date();
      }
      if (status === "in_progress" && !req.body.startedAt) {
        updateData.startedAt = new Date();
      }
      
      const task = await db
        .update(agentTasks)
        .set(updateData)
        .where(eq(agentTasks.id, taskId))
        .returning();
      
      if (!task[0]) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task[0]);
    } catch (error) {
      console.error("Update ESA task error:", error);
      res.status(500).json({ message: "Failed to update ESA task" });
    }
  });

  // 8. ESA COMMUNICATIONS API (GET) - Admin only
  app.get("/api/platform/esa/communications", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
    try {
      const { agentId, messageType, limit = "50" } = req.query;
      
      let query = db.select().from(agentCommunications);
      const conditions = [];
      
      if (agentId) {
        const agentIdNum = parseInt(agentId as string);
        conditions.push(
          or(
            eq(agentCommunications.fromAgentId, agentIdNum),
            eq(agentCommunications.toAgentId, agentIdNum)
          )!
        );
      }
      if (messageType) {
        conditions.push(eq(agentCommunications.communicationType, messageType as string));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const communications = await query
        .orderBy(desc(agentCommunications.createdAt))
        .limit(parseInt(limit as string));
      
      res.json({ communications, total: communications.length });
    } catch (error) {
      console.error("Get ESA communications error:", error);
      res.status(500).json({ message: "Failed to fetch ESA communications" });
    }
  });

  app.use(errorHandler);

  const httpServer = createServer(app);

  wsNotificationService.initialize(httpServer);
  console.log("[WebSocket] Notification service initialized on /ws/notifications");

  // Initialize Realtime Voice WebSocket
  initRealtimeVoiceWebSocket(httpServer);
  console.log("[WebSocket] Realtime Voice service initialized on /ws/realtime");

  // Initialize Livestream Chat WebSocket
  initLivestreamWebSocket(httpServer);
  console.log("[WebSocket] Livestream chat initialized on /ws/stream/:streamId");

  // Initialize Autonomous Workflow WebSocket
  autonomousWsService.initialize(httpServer);
  console.log("[WebSocket] Autonomous workflow service initialized on /ws/autonomous");

  // Initialize Engagement WebSocket (Features 19 & 20: Live likes and comments)
  wsEngagementService.initialize(httpServer);
  console.log("[WebSocket] Engagement service initialized on /ws/engagement");

  // ============================================================================
  // GROUPS - Additional routes removed (duplicates - using group-routes.ts instead)
  // ============================================================================

  // Update Group
  app.put("/api/groups/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const group = await storage.updateGroup(parseInt(req.params.id), req.body);
      if (!group) return res.status(404).json({ message: "Group not found" });
      res.json(group);
    } catch (error) {
      console.error("Update group error:", error);
      res.status(500).json({ message: "Failed to update group" });
    }
  });

  // Delete Group
  app.delete("/api/groups/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteGroup(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Delete group error:", error);
      res.status(500).json({ message: "Failed to delete group" });
    }
  });

  // Get Suggested Groups
  app.get("/api/groups/suggested/for-user", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { limit } = req.query;
      const groups = await storage.getSuggestedGroups(req.user!.id, limit ? parseInt(limit as string) : 10);
      res.json(groups);
    } catch (error) {
      console.error("Get suggested groups error:", error);
      res.status(500).json({ message: "Failed to fetch suggested groups" });
    }
  });

  // Join Group
  app.post("/api/groups/:id/join", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const member = await storage.joinGroup(parseInt(req.params.id), req.user!.id);
      res.status(201).json(member);
    } catch (error) {
      console.error("Join group error:", error);
      res.status(500).json({ message: "Failed to join group" });
    }
  });

  // Leave Group
  app.post("/api/groups/:id/leave", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.leaveGroup(parseInt(req.params.id), req.user!.id);
      res.status(204).send();
    } catch (error) {
      console.error("Leave group error:", error);
      res.status(500).json({ message: "Failed to leave group" });
    }
  });

  // Get Group Members
  app.get("/api/groups/:id/members", async (req: Request, res: Response) => {
    try {
      const members = await storage.getGroupMembers(parseInt(req.params.id));
      res.json(members);
    } catch (error) {
      console.error("Get group members error:", error);
      res.status(500).json({ message: "Failed to fetch group members" });
    }
  });

  // Update Group Member
  app.put("/api/groups/:groupId/members/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const member = await storage.updateGroupMember(
        parseInt(req.params.groupId),
        parseInt(req.params.userId),
        req.body
      );
      if (!member) return res.status(404).json({ message: "Member not found" });
      res.json(member);
    } catch (error) {
      console.error("Update group member error:", error);
      res.status(500).json({ message: "Failed to update member" });
    }
  });

  // Ban Group Member
  app.post("/api/groups/:groupId/members/:userId/ban", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.banGroupMember(parseInt(req.params.groupId), parseInt(req.params.userId));
      res.status(204).send();
    } catch (error) {
      console.error("Ban group member error:", error);
      res.status(500).json({ message: "Failed to ban member" });
    }
  });

  // Send Group Invite
  app.post("/api/groups/:id/invites", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const invite = await storage.sendGroupInvite({
        groupId: parseInt(req.params.id),
        inviterId: req.user!.id,
        inviteeId: req.body.inviteeId,
        message: req.body.message,
      });
      res.status(201).json(invite);
    } catch (error) {
      console.error("Send group invite error:", error);
      res.status(500).json({ message: "Failed to send invite" });
    }
  });

  // Get User's Group Invites
  app.get("/api/groups/invites/my-invites", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const invites = await storage.getUserGroupInvites(req.user!.id);
      res.json(invites);
    } catch (error) {
      console.error("Get group invites error:", error);
      res.status(500).json({ message: "Failed to fetch invites" });
    }
  });

  // Accept Group Invite
  app.post("/api/groups/invites/:id/accept", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.acceptGroupInvite(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Accept group invite error:", error);
      res.status(500).json({ message: "Failed to accept invite" });
    }
  });

  // Decline Group Invite
  app.post("/api/groups/invites/:id/decline", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.declineGroupInvite(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Decline group invite error:", error);
      res.status(500).json({ message: "Failed to decline invite" });
    }
  });

  // Create Group Post
  app.post("/api/groups/:id/posts", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const post = await storage.createGroupPost({
        groupId: parseInt(req.params.id),
        authorId: req.user!.id,
        ...req.body,
      });
      res.status(201).json(post);
    } catch (error) {
      console.error("Create group post error:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Get Group Posts
  app.get("/api/groups/:id/posts", async (req: Request, res: Response) => {
    try {
      const { limit, offset } = req.query;
      const posts = await storage.getGroupPosts(parseInt(req.params.id), {
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(posts);
    } catch (error) {
      console.error("Get group posts error:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Update Group Post
  app.put("/api/groups/posts/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const post = await storage.updateGroupPost(parseInt(req.params.id), req.body);
      if (!post) return res.status(404).json({ message: "Post not found" });
      res.json(post);
    } catch (error) {
      console.error("Update group post error:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  // Delete Group Post
  app.delete("/api/groups/posts/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteGroupPost(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Delete group post error:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Pin Group Post
  app.post("/api/groups/posts/:id/pin", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.pinGroupPost(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Pin group post error:", error);
      res.status(500).json({ message: "Failed to pin post" });
    }
  });

  // Unpin Group Post
  app.post("/api/groups/posts/:id/unpin", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.unpinGroupPost(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Unpin group post error:", error);
      res.status(500).json({ message: "Failed to unpin post" });
    }
  });

  // Approve Group Post
  app.post("/api/groups/posts/:id/approve", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.approveGroupPost(parseInt(req.params.id), req.user!.id);
      res.status(204).send();
    } catch (error) {
      console.error("Approve group post error:", error);
      res.status(500).json({ message: "Failed to approve post" });
    }
  });

  // Get Group Categories
  app.get("/api/groups/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getGroupCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get group categories error:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Create Group Category
  app.post("/api/groups/categories", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
    try {
      const category = await storage.createGroupCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Create group category error:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Assign Category to Group
  app.post("/api/groups/:groupId/categories/:categoryId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.assignGroupCategory(parseInt(req.params.groupId), parseInt(req.params.categoryId));
      res.status(204).send();
    } catch (error) {
      console.error("Assign group category error:", error);
      res.status(500).json({ message: "Failed to assign category" });
    }
  });

  // Remove Category from Group
  app.delete("/api/groups/:groupId/categories/:categoryId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.removeGroupCategory(parseInt(req.params.groupId), parseInt(req.params.categoryId));
      res.status(204).send();
    } catch (error) {
      console.error("Remove group category error:", error);
      res.status(500).json({ message: "Failed to remove category" });
    }
  });

  // Get Groups by Category
  app.get("/api/groups/categories/:id/groups", async (req: Request, res: Response) => {
    try {
      const groups = await storage.getGroupsByCategory(parseInt(req.params.id));
      res.json(groups);
    } catch (error) {
      console.error("Get groups by category error:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  // ============================================================================
  // HOUSING SYSTEM ROUTES (Wave 8D)
  // ============================================================================

  // Get Housing Listings (with filtering)
  app.get("/api/housing/listings", async (req: Request, res: Response) => {
    try {
      const params = {
        city: req.query.city as string,
        country: req.query.country as string,
        hostId: req.query.hostId ? parseInt(req.query.hostId as string) : undefined,
        status: req.query.status as string,
        propertyTypes: req.query.propertyTypes ? JSON.parse(req.query.propertyTypes as string) : undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string) : undefined,
        bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms as string) : undefined,
        maxGuests: req.query.maxGuests ? parseInt(req.query.maxGuests as string) : undefined,
        amenities: req.query.amenities ? JSON.parse(req.query.amenities as string) : undefined,
        friendsOnly: req.query.friendsOnly === 'true',
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };
      
      const listings = await storage.getHousingListings(params);
      res.json(listings);
    } catch (error) {
      console.error("Get housing listings error:", error);
      res.status(500).json({ message: "Failed to fetch housing listings" });
    }
  });

  // Get Housing Listing by ID
  app.get("/api/housing/listings/:id", async (req: Request, res: Response) => {
    try {
      const listing = await storage.getHousingListingById(parseInt(req.params.id));
      if (!listing) {
        return res.status(404).json({ message: "Housing listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Get housing listing error:", error);
      res.status(500).json({ message: "Failed to fetch housing listing" });
    }
  });

  // Create Housing Listing
  app.post("/api/housing/listings", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const listing = await storage.createHousingListing({
        hostId: req.user!.id,
        ...req.body,
      });
      res.status(201).json(listing);
    } catch (error) {
      console.error("Create housing listing error:", error);
      res.status(500).json({ message: "Failed to create housing listing" });
    }
  });

  // Update Housing Listing
  app.put("/api/housing/listings/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const listing = await storage.updateHousingListing(parseInt(req.params.id), req.body);
      if (!listing) {
        return res.status(404).json({ message: "Housing listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Update housing listing error:", error);
      res.status(500).json({ message: "Failed to update housing listing" });
    }
  });

  // Delete Housing Listing
  app.delete("/api/housing/listings/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteHousingListing(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Delete housing listing error:", error);
      res.status(500).json({ message: "Failed to delete housing listing" });
    }
  });

  // Get Housing Bookings
  app.get("/api/housing/bookings", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const params = {
        listingId: req.query.listingId ? parseInt(req.query.listingId as string) : undefined,
        guestId: req.query.guestId ? parseInt(req.query.guestId as string) : undefined,
        status: req.query.status as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };
      
      const bookings = await storage.getHousingBookings(params);
      res.json(bookings);
    } catch (error) {
      console.error("Get housing bookings error:", error);
      res.status(500).json({ message: "Failed to fetch housing bookings" });
    }
  });

  // Create Housing Booking
  app.post("/api/housing/bookings", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const booking = await storage.createHousingBooking({
        guestId: req.user!.id,
        ...req.body,
      });
      res.status(201).json(booking);
    } catch (error) {
      console.error("Create housing booking error:", error);
      res.status(500).json({ message: "Failed to create housing booking" });
    }
  });

  // Update Housing Booking
  app.put("/api/housing/bookings/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const booking = await storage.updateHousingBooking(parseInt(req.params.id), req.body);
      if (!booking) {
        return res.status(404).json({ message: "Housing booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Update housing booking error:", error);
      res.status(500).json({ message: "Failed to update housing booking" });
    }
  });

  // Delete Housing Booking
  app.delete("/api/housing/bookings/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteHousingBooking(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Delete housing booking error:", error);
      res.status(500).json({ message: "Failed to delete housing booking" });
    }
  });

  // ============================================================================
  // PHASE H: COMMUNITY MAP, TRAVEL PLANNER, CONTACT FORM (10 endpoints)
  // ============================================================================

  // 1. GET /api/community/locations - Get all community locations with stats
  app.get("/api/community/locations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const locations = await db.select({
        id: users.id,
        city: users.city,
        country: users.country,
        memberCount: sql<number>`count(distinct ${users.id})::int`,
        activeEvents: sql<number>`count(distinct ${events.id})::int`,
        venues: sql<number>`0`,
        isActive: sql<boolean>`true`,
      })
      .from(users)
      .leftJoin(events, eq(events.userId, users.id))
      .where(and(
        isNotNull(users.city),
        isNotNull(users.country),
        eq(users.isActive, true)
      ))
      .groupBy(users.city, users.country, users.id);

      const groupedLocations = locations.reduce((acc: any[], loc) => {
        const key = `${loc.city}-${loc.country}`;
        const existing = acc.find(l => `${l.city}-${l.country}` === key);
        if (existing) {
          existing.memberCount += 1;
          existing.activeEvents += loc.activeEvents;
        } else {
          acc.push({
            id: loc.id,
            city: loc.city,
            country: loc.country,
            coordinates: { lat: 0, lng: 0 },
            memberCount: 1,
            activeEvents: loc.activeEvents,
            venues: 0,
            isActive: true
          });
        }
        return acc;
      }, []);

      res.json(groupedLocations);
    } catch (error) {
      console.error("Get community locations error:", error);
      res.status(500).json({ message: "Failed to fetch community locations" });
    }
  });

  // 2. GET /api/community/stats - Get global community statistics
  app.get("/api/community/stats", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const stats = await db.select({
        totalMembers: sql<number>`count(distinct ${users.id})::int`,
        countries: sql<number>`count(distinct ${users.country})::int`,
        cities: sql<number>`count(distinct ${users.city})::int`,
        activeEvents: sql<number>`count(distinct ${events.id})::int`,
      })
      .from(users)
      .leftJoin(events, eq(events.userId, users.id))
      .where(eq(users.isActive, true));

      res.json({
        totalCities: stats[0]?.cities || 0,
        countries: stats[0]?.countries || 0,
        totalMembers: stats[0]?.totalMembers || 0,
        activeEvents: stats[0]?.activeEvents || 0,
        totalVenues: 0
      });
    } catch (error) {
      console.error("Get community stats error:", error);
      res.status(500).json({ message: "Failed to fetch community stats" });
    }
  });

  // GET /api/community/global-stats - Get global community statistics for sidebar
  app.get("/api/community/global-stats", async (req: Request, res: Response) => {
    try {
      const stats = await db.select({
        totalUsers: sql<number>`count(distinct ${users.id})::int`,
        totalEvents: sql<number>`count(distinct ${events.id})::int`,
        totalGroups: sql<number>`count(distinct ${groups.id})::int`,
      })
      .from(users)
      .leftJoin(events, eq(events.userId, users.id))
      .leftJoin(groups, eq(groups.createdBy, users.id))
      .where(eq(users.isActive, true));

      // Get user city members count if authenticated
      let userCityMembers = 0;
      const authHeader = req.headers.authorization;
      if (authHeader) {
        // Simple token check without requiring authentication
        try {
          const userCity = req.user?.city;
          const userCountry = req.user?.country;
          
          if (userCity && userCountry) {
            const cityStats = await db.select({
              count: sql<number>`count(*)::int`
            })
            .from(users)
            .where(and(
              eq(users.city, userCity),
              eq(users.country, userCountry),
              eq(users.isActive, true)
            ));
            
            userCityMembers = cityStats[0]?.count || 0;
          }
        } catch (err) {
          // Ignore auth errors for this optional data
          console.log("Could not fetch user city stats:", err);
        }
      }

      res.json({
        totalUsers: stats[0]?.totalUsers || 0,
        totalEvents: stats[0]?.totalEvents || 0,
        totalGroups: stats[0]?.totalGroups || 0,
        userCityMembers
      });
    } catch (error) {
      console.error("Get global community stats error:", error);
      res.status(500).json({ message: "Failed to fetch global community stats" });
    }
  });

  // 3. GET /api/travel/trips - Get user's travel plans
  app.get("/api/travel/trips", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const trips = await db.select()
        .from(travelPlans)
        .where(eq(travelPlans.userId, req.user!.id))
        .orderBy(desc(travelPlans.createdAt));
      res.json(trips);
    } catch (error) {
      console.error("Get travel trips error:", error);
      res.status(500).json({ message: "Failed to fetch travel trips" });
    }
  });

  // 4. POST /api/travel/trips - Create new travel plan
  app.post("/api/travel/trips", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { city, country, startDate, endDate, tripDuration, budget, interests, travelStyle, status, notes } = req.body;
      
      if (!city || !startDate || !endDate || !tripDuration) {
        return res.status(400).json({ message: "Missing required fields: city, startDate, endDate, tripDuration" });
      }

      const [trip] = await db.insert(travelPlans)
        .values({
          userId: req.user!.id,
          city,
          country: country || "",
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          tripDuration,
          budget: budget || "",
          interests: interests || [],
          travelStyle: travelStyle || "",
          status: status || "planning",
          notes: notes || ""
        })
        .returning();
      res.status(201).json(trip);
    } catch (error) {
      console.error("Create travel trip error:", error);
      res.status(500).json({ message: "Failed to create travel trip" });
    }
  });

  // 5. GET /api/travel/trips/:id - Get travel plan details
  app.get("/api/travel/trips/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const [trip] = await db.select()
        .from(travelPlans)
        .where(and(
          eq(travelPlans.id, parseInt(req.params.id)),
          eq(travelPlans.userId, req.user!.id)
        ));

      if (!trip) {
        return res.status(404).json({ message: "Travel trip not found" });
      }

      const items = await db.select()
        .from(travelPlanItems)
        .where(eq(travelPlanItems.travelPlanId, trip.id));

      res.json({ ...trip, items });
    } catch (error) {
      console.error("Get travel trip details error:", error);
      res.status(500).json({ message: "Failed to fetch travel trip details" });
    }
  });

  // 6. PATCH /api/travel/trips/:id - Update travel plan
  app.patch("/api/travel/trips/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const [trip] = await db.update(travelPlans)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(
          eq(travelPlans.id, parseInt(req.params.id)),
          eq(travelPlans.userId, req.user!.id)
        ))
        .returning();

      if (!trip) {
        return res.status(404).json({ message: "Travel trip not found" });
      }

      res.json(trip);
    } catch (error) {
      console.error("Update travel trip error:", error);
      res.status(500).json({ message: "Failed to update travel trip" });
    }
  });

  // 7. DELETE /api/travel/trips/:id - Delete travel plan
  app.delete("/api/travel/trips/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await db.delete(travelPlans)
        .where(and(
          eq(travelPlans.id, parseInt(req.params.id)),
          eq(travelPlans.userId, req.user!.id)
        ));
      res.status(204).send();
    } catch (error) {
      console.error("Delete travel trip error:", error);
      res.status(500).json({ message: "Failed to delete travel trip" });
    }
  });

  // 8. GET /api/travel/destinations - Get suggested destinations (mock data for now)
  app.get("/api/travel/destinations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const destinations = [
        { id: 1, name: "Buenos Aires, Argentina", description: "The birthplace of tango", image: "", popularity: 95 },
        { id: 2, name: "Montevideo, Uruguay", description: "Traditional milongas and festivals", image: "", popularity: 85 },
        { id: 3, name: "Paris, France", description: "European tango capital", image: "", popularity: 80 },
        { id: 4, name: "Istanbul, Turkey", description: "Growing tango scene", image: "", popularity: 70 },
        { id: 5, name: "Barcelona, Spain", description: "Vibrant tango community", image: "", popularity: 75 }
      ];
      res.json(destinations);
    } catch (error) {
      console.error("Get destinations error:", error);
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });

  // 9. GET /api/travel/packages - Get travel packages based on events
  app.get("/api/travel/packages", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const packages = await db.select({
        id: events.id,
        title: events.title,
        location: events.location,
        startDate: events.startDate,
        endDate: events.endDate,
        description: events.description,
        price: events.price,
        category: events.category
      })
      .from(events)
      .where(and(
        eq(events.eventType, "festival"),
        gte(events.startDate, new Date())
      ))
      .orderBy(events.startDate)
      .limit(10);

      res.json(packages);
    } catch (error) {
      console.error("Get travel packages error:", error);
      res.status(500).json({ message: "Failed to fetch travel packages" });
    }
  });

  // 10. POST /api/contact - Submit contact form
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const validation = insertContactSubmissionSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid contact form data", errors: validation.error });
      }

      const [submission] = await db.insert(contactSubmissions)
        .values(validation.data)
        .returning();

      res.status(201).json({ 
        message: "Contact form submitted successfully", 
        id: submission.id 
      });
    } catch (error) {
      console.error("Submit contact form error:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // ============================================================================
  // VENUE RECOMMENDATIONS APIs (PART 1-14) - 4 endpoints
  // ============================================================================

  // 7. GET /api/venue-recommendations - Get all venue recommendations with filters
  app.get("/api/venue-recommendations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { category, cuisine, city, priceLevel, minRating } = req.query;

      let query = db.select().from(venueRecommendations);
      const conditions = [];

      if (category) conditions.push(eq(venueRecommendations.category, category as string));
      if (cuisine) conditions.push(eq(venueRecommendations.cuisine, cuisine as string));
      if (city) conditions.push(eq(venueRecommendations.city, city as string));
      if (priceLevel) conditions.push(eq(venueRecommendations.priceLevel, priceLevel as string));
      if (minRating) conditions.push(gte(venueRecommendations.rating, parseFloat(minRating as string)));

      const recommendations = conditions.length > 0
        ? await query.where(and(...conditions)).orderBy(desc(venueRecommendations.rating))
        : await query.orderBy(desc(venueRecommendations.rating));

      res.json(recommendations);
    } catch (error) {
      console.error("Get venue recommendations error:", error);
      res.status(500).json({ message: "Failed to fetch venue recommendations" });
    }
  });

  // 8. POST /api/venue-recommendations - Create venue recommendation
  app.post("/api/venue-recommendations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const validation = insertVenueRecommendationSchema.safeParse({
        ...req.body,
        userId: req.user!.id
      });

      if (!validation.success) {
        return res.status(400).json({ message: "Invalid venue recommendation data", errors: validation.error });
      }

      const [recommendation] = await db.insert(venueRecommendations)
        .values(validation.data)
        .returning();

      res.status(201).json(recommendation);
    } catch (error) {
      console.error("Create venue recommendation error:", error);
      res.status(500).json({ message: "Failed to create venue recommendation" });
    }
  });

  // 9. PATCH /api/venue-recommendations/:id - Update venue recommendation
  app.patch("/api/venue-recommendations/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      const [existing] = await db.select()
        .from(venueRecommendations)
        .where(eq(venueRecommendations.id, id));

      if (!existing) {
        return res.status(404).json({ message: "Venue recommendation not found" });
      }

      if (existing.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this recommendation" });
      }

      const [updated] = await db.update(venueRecommendations)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(venueRecommendations.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Update venue recommendation error:", error);
      res.status(500).json({ message: "Failed to update venue recommendation" });
    }
  });

  // 10. DELETE /api/venue-recommendations/:id - Delete venue recommendation
  app.delete("/api/venue-recommendations/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      const [existing] = await db.select()
        .from(venueRecommendations)
        .where(eq(venueRecommendations.id, id));

      if (!existing) {
        return res.status(404).json({ message: "Venue recommendation not found" });
      }

      if (existing.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this recommendation" });
      }

      await db.delete(venueRecommendations).where(eq(venueRecommendations.id, id));

      res.json({ message: "Venue recommendation deleted successfully" });
    } catch (error) {
      console.error("Delete venue recommendation error:", error);
      res.status(500).json({ message: "Failed to delete venue recommendation" });
    }
  });

  // ============================================================================
  // PART 2 P0 WORKFLOWS - CRITICAL ADMIN INFRASTRUCTURE (23 endpoints)
  // ============================================================================

  // Import P0 workflow services
  const { FounderApprovalService } = await import("./services/founderApprovalService");
  const { SafetyReviewService } = await import("./services/safetyReviewService");
  const { AISupportService } = await import("./services/aiSupportService");

  // ============================================================================
  // WORKFLOW #1: FOUNDER APPROVAL (8 endpoints)
  // ============================================================================

  // 1.1 POST /api/admin/founder-approval - Submit feature for approval
  app.post("/api/admin/founder-approval", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const feature = await FounderApprovalService.submitFeatureForReview(req.body);
      res.status(201).json(feature);
    } catch (error) {
      console.error("Submit feature for approval error:", error);
      res.status(500).json({ message: "Failed to submit feature for approval" });
    }
  });

  // 1.2 GET /api/admin/founder-approval/pending - Get pending reviews
  app.get("/api/admin/founder-approval/pending", authenticateToken, requireRoleLevel('admin'), async (req: AuthRequest, res: Response) => {
    try {
      const pending = await FounderApprovalService.getPendingReviews();
      res.json(pending);
    } catch (error) {
      console.error("Get pending reviews error:", error);
      res.status(500).json({ message: "Failed to fetch pending reviews" });
    }
  });

  // 1.3 GET /api/admin/founder-approval/:id - Get feature review by ID
  app.get("/api/admin/founder-approval/:id", authenticateToken, requireRoleLevel('admin'), async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const feature = await FounderApprovalService.getFeatureReview(id);
      
      if (!feature) {
        return res.status(404).json({ message: "Feature review not found" });
      }

      res.json(feature);
    } catch (error) {
      console.error("Get feature review error:", error);
      res.status(500).json({ message: "Failed to fetch feature review" });
    }
  });

  // 1.4 GET /api/admin/founder-approval/page/:pageUrl - Get features by page
  app.get("/api/admin/founder-approval/page/:pageUrl", authenticateToken, requireRoleLevel('admin'), async (req: AuthRequest, res: Response) => {
    try {
      const pageUrl = decodeURIComponent(req.params.pageUrl);
      const features = await FounderApprovalService.getFeaturesByPage(pageUrl);
      res.json(features);
    } catch (error) {
      console.error("Get features by page error:", error);
      res.status(500).json({ message: "Failed to fetch features" });
    }
  });

  // 1.5 POST /api/admin/founder-approval/:id/approve - Approve feature
  app.post("/api/admin/founder-approval/:id/approve", authenticateToken, requireRoleLevel('god'), async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { reviewNotes, checklist } = req.body;
      
      const feature = await FounderApprovalService.approveFeature(
        id,
        req.user!.id,
        reviewNotes,
        checklist
      );

      res.json(feature);
    } catch (error) {
      console.error("Approve feature error:", error);
      res.status(500).json({ message: "Failed to approve feature" });
    }
  });

  // 1.6 POST /api/admin/founder-approval/:id/request-changes - Request changes
  app.post("/api/admin/founder-approval/:id/request-changes", authenticateToken, requireRoleLevel('god'), async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { reviewNotes, checklist } = req.body;
      
      const feature = await FounderApprovalService.requestChanges(
        id,
        req.user!.id,
        reviewNotes,
        checklist
      );

      res.json(feature);
    } catch (error) {
      console.error("Request changes error:", error);
      res.status(500).json({ message: "Failed to request changes" });
    }
  });

  // 1.7 POST /api/admin/founder-approval/:id/reject - Reject feature
  app.post("/api/admin/founder-approval/:id/reject", authenticateToken, requireRoleLevel('god'), async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { reviewNotes } = req.body;
      
      const feature = await FounderApprovalService.rejectFeature(
        id,
        req.user!.id,
        reviewNotes
      );

      res.json(feature);
    } catch (error) {
      console.error("Reject feature error:", error);
      res.status(500).json({ message: "Failed to reject feature" });
    }
  });

  // 1.8 GET /api/admin/founder-approval/stats - Get approval statistics
  app.get("/api/admin/founder-approval/stats", authenticateToken, requireRoleLevel('admin'), async (req: AuthRequest, res: Response) => {
    try {
      const stats = await FounderApprovalService.getApprovalStats();
      res.json(stats);
    } catch (error) {
      console.error("Get approval stats error:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // ============================================================================
  // WORKFLOW #2: SAFETY REVIEW (10 endpoints)
  // ============================================================================

  // 2.1 POST /api/admin/safety-reviews - Create safety review
  app.post("/api/admin/safety-reviews", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const review = await SafetyReviewService.createSafetyReview(req.body);
      res.status(201).json(review);
    } catch (error) {
      console.error("Create safety review error:", error);
      res.status(500).json({ message: "Failed to create safety review" });
    }
  });

  // 2.2 GET /api/admin/safety-reviews/pending - Get pending reviews
  app.get("/api/admin/safety-reviews/pending", authenticateToken, requireRoleLevel('moderator'), async (req: AuthRequest, res: Response) => {
    try {
      const { targetType } = req.query;
      const pending = await SafetyReviewService.getPendingReviews(targetType as string);
      res.json(pending);
    } catch (error) {
      console.error("Get pending safety reviews error:", error);
      res.status(500).json({ message: "Failed to fetch pending reviews" });
    }
  });

  // 2.3 GET /api/admin/safety-reviews/high-priority - Get high-priority reviews
  app.get("/api/admin/safety-reviews/high-priority", authenticateToken, requireRoleLevel('moderator'), async (req: AuthRequest, res: Response) => {
    try {
      const reviews = await SafetyReviewService.getHighPriorityReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Get high-priority reviews error:", error);
      res.status(500).json({ message: "Failed to fetch high-priority reviews" });
    }
  });

  // 2.4 GET /api/admin/safety-reviews/:id - Get safety review by ID
  app.get("/api/admin/safety-reviews/:id", authenticateToken, requireRoleLevel('moderator'), async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const review = await SafetyReviewService.getSafetyReview(id);
      
      if (!review) {
        return res.status(404).json({ message: "Safety review not found" });
      }

      res.json(review);
    } catch (error) {
      console.error("Get safety review error:", error);
      res.status(500).json({ message: "Failed to fetch safety review" });
    }
  });

  // 2.5 GET /api/admin/safety-reviews/target/:targetType/:targetId - Get reviews for target
  app.get("/api/admin/safety-reviews/target/:targetType/:targetId", authenticateToken, requireRoleLevel('moderator'), async (req: AuthRequest, res: Response) => {
    try {
      const targetType = req.params.targetType;
      const targetId = parseInt(req.params.targetId);
      const reviews = await SafetyReviewService.getReviewsForTarget(targetType, targetId);
      res.json(reviews);
    } catch (error) {
      console.error("Get target reviews error:", error);
      res.status(500).json({ message: "Failed to fetch target reviews" });
    }
  });

  // 2.6 PATCH /api/admin/safety-reviews/:id/risk-level - Update risk level
  app.patch("/api/admin/safety-reviews/:id/risk-level", authenticateToken, requireRoleLevel('moderator'), async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { riskLevel, notes } = req.body;
      
      const review = await SafetyReviewService.updateRiskLevel(id, riskLevel, notes);
      res.json(review);
    } catch (error) {
      console.error("Update risk level error:", error);
      res.status(500).json({ message: "Failed to update risk level" });
    }
  });

  // 2.7 POST /api/admin/safety-reviews/:id/background-check - Complete background check
  app.post("/api/admin/safety-reviews/:id/background-check", authenticateToken, requireRoleLevel('admin'), async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { provider, result, documents } = req.body;
      
      const review = await SafetyReviewService.completeBackgroundCheck(id, provider, result, documents);
      res.json(review);
    } catch (error) {
      console.error("Complete background check error:", error);
      res.status(500).json({ message: "Failed to complete background check" });
    }
  });

  // 2.8 POST /api/admin/safety-reviews/:id/approve - Approve safety review
  app.post("/api/admin/safety-reviews/:id/approve", authenticateToken, requireRoleLevel('moderator'), async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { actionTaken, notes } = req.body;
      
      const review = await SafetyReviewService.approveSafetyReview(
        id,
        req.user!.id,
        actionTaken,
        notes
      );

      res.json(review);
    } catch (error) {
      console.error("Approve safety review error:", error);
      res.status(500).json({ message: "Failed to approve safety review" });
    }
  });

  // 2.9 POST /api/admin/safety-reviews/:id/reject - Reject/flag safety review
  app.post("/api/admin/safety-reviews/:id/reject", authenticateToken, requireRoleLevel('moderator'), async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { actionTaken, notes, issues } = req.body;
      
      const review = await SafetyReviewService.rejectSafetyReview(
        id,
        req.user!.id,
        actionTaken,
        notes,
        issues
      );

      res.json(review);
    } catch (error) {
      console.error("Reject safety review error:", error);
      res.status(500).json({ message: "Failed to reject safety review" });
    }
  });

  // 2.10 POST /api/admin/safety-reviews/:id/escalate - Escalate review
  app.post("/api/admin/safety-reviews/:id/escalate", authenticateToken, requireRoleLevel('moderator'), async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { riskLevel, notes } = req.body;
      
      const review = await SafetyReviewService.escalateReview(id, riskLevel, notes);
      res.json(review);
    } catch (error) {
      console.error("Escalate review error:", error);
      res.status(500).json({ message: "Failed to escalate review" });
    }
  });

  // 2.11 GET /api/admin/safety-reviews/stats - Get safety statistics
  app.get("/api/admin/safety-reviews/stats", authenticateToken, requireRoleLevel('admin'), async (req: AuthRequest, res: Response) => {
    try {
      const stats = await SafetyReviewService.getSafetyStats();
      res.json(stats);
    } catch (error) {
      console.error("Get safety stats error:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // ============================================================================
  // WORKFLOW #4: AI SUPPORT (14 endpoints)
  // ============================================================================

  // 4.1 POST /api/support/tickets - Create support ticket
  app.post("/api/support/tickets", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const ticket = await AISupportService.createTicket({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Create support ticket error:", error);
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  // 4.2 GET /api/support/tickets - Get user's tickets
  app.get("/api/support/tickets", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const tickets = await AISupportService.getUserTickets(req.user!.id);
      res.json(tickets);
    } catch (error) {
      console.error("Get user tickets error:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  // 4.3 GET /api/support/tickets/:id - Get ticket by ID
  app.get("/api/support/tickets/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const ticket = await AISupportService.getTicket(id);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      if (ticket.userId !== req.user!.id && !['admin', 'super_admin', 'god'].includes(req.user!.role)) {
        return res.status(403).json({ message: "Not authorized" });
      }

      res.json(ticket);
    } catch (error) {
      console.error("Get ticket error:", error);
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  // 4.4 POST /api/support/tickets/:id/ai-response - Add AI response
  app.post("/api/support/tickets/:id/ai-response", authenticateToken, requireRoleLevel('admin'), async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { response, confidence } = req.body;
      
      const ticket = await AISupportService.addAIResponse(id, response, confidence);
      res.json(ticket);
    } catch (error) {
      console.error("Add AI response error:", error);
      res.status(500).json({ message: "Failed to add AI response" });
    }
  });

  // 4.5 POST /api/support/tickets/:id/assign - Assign to agent
  app.post("/api/support/tickets/:id/assign", authenticateToken, requireRoleLevel('admin'), async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { agentId } = req.body;
      
      const ticket = await AISupportService.assignToAgent(id, agentId);
      res.json(ticket);
    } catch (error) {
      console.error("Assign ticket error:", error);
      res.status(500).json({ message: "Failed to assign ticket" });
    }
  });

  // 4.6 POST /api/support/tickets/:id/agent-response - Add agent response
  app.post("/api/support/tickets/:id/agent-response", authenticateToken, requireRoleLevel('admin'), async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { message } = req.body;
      
      const ticket = await AISupportService.addAgentResponse(id, req.user!.id, message);
      res.json(ticket);
    } catch (error) {
      console.error("Add agent response error:", error);
      res.status(500).json({ message: "Failed to add agent response" });
    }
  });

  // 4.7 POST /api/support/tickets/:id/resolve - Resolve ticket
  app.post("/api/support/tickets/:id/resolve", authenticateToken, requireRoleLevel('admin'), async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { resolution } = req.body;
      
      const ticket = await AISupportService.resolveTicket(id, req.user!.id, resolution);
      res.json(ticket);
    } catch (error) {
      console.error("Resolve ticket error:", error);
      res.status(500).json({ message: "Failed to resolve ticket" });
    }
  });

  // 4.8 POST /api/support/tickets/:id/rating - Add satisfaction rating
  app.post("/api/support/tickets/:id/rating", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { rating, feedback } = req.body;
      
      const ticket = await AISupportService.getTicket(id);
      if (ticket?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updated = await AISupportService.addSatisfactionRating(id, rating, feedback);
      res.json(updated);
    } catch (error) {
      console.error("Add rating error:", error);
      res.status(500).json({ message: "Failed to add rating" });
    }
  });

  // 4.9 POST /api/support/tickets/:id/escalate - Escalate ticket
  app.post("/api/support/tickets/:id/escalate", authenticateToken, requireRoleLevel('admin'), async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { newPriority, reason } = req.body;
      
      const ticket = await AISupportService.escalateTicket(id, newPriority, reason);
      res.json(ticket);
    } catch (error) {
      console.error("Escalate ticket error:", error);
      res.status(500).json({ message: "Failed to escalate ticket" });
    }
  });

  // 4.10 GET /api/admin/support/open - Get open tickets
  app.get("/api/admin/support/open", authenticateToken, requireRoleLevel('admin'), async (req: AuthRequest, res: Response) => {
    try {
      const { priority, humanReviewRequired } = req.query;
      const tickets = await AISupportService.getOpenTickets(
        priority as string,
        humanReviewRequired === 'true'
      );
      res.json(tickets);
    } catch (error) {
      console.error("Get open tickets error:", error);
      res.status(500).json({ message: "Failed to fetch open tickets" });
    }
  });

  // 4.11 GET /api/admin/support/review - Get tickets requiring review
  app.get("/api/admin/support/review", authenticateToken, requireRoleLevel('admin'), async (req: AuthRequest, res: Response) => {
    try {
      const tickets = await AISupportService.getTicketsRequiringReview();
      res.json(tickets);
    } catch (error) {
      console.error("Get tickets for review error:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  // 4.12 GET /api/admin/support/high-priority - Get high-priority tickets
  app.get("/api/admin/support/high-priority", authenticateToken, requireRoleLevel('admin'), async (req: AuthRequest, res: Response) => {
    try {
      const tickets = await AISupportService.getHighPriorityTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Get high-priority tickets error:", error);
      res.status(500).json({ message: "Failed to fetch high-priority tickets" });
    }
  });

  // 4.13 GET /api/admin/support/stats - Get support statistics
  app.get("/api/admin/support/stats", authenticateToken, requireRoleLevel('admin'), async (req: AuthRequest, res: Response) => {
    try {
      const stats = await AISupportService.getSupportStats();
      res.json(stats);
    } catch (error) {
      console.error("Get support stats error:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // ===============================
  // DATABASE BACKUP ENDPOINTS
  // ===============================

  // POST /api/admin/backups/create - Create database backup
  app.post("/api/admin/backups/create", authenticateToken, requireRoleLevel('super_admin'), async (req: AuthRequest, res: Response) => {
    try {
      const { createBackup } = await import("./utils/databaseBackup.js");
      const backupPath = await createBackup();
      res.json({ 
        success: true, 
        backupPath,
        message: "Database backup created successfully" 
      });
    } catch (error) {
      console.error("Create backup error:", error);
      res.status(500).json({ message: "Failed to create backup" });
    }
  });

  // GET /api/admin/backups/list - List all backups
  app.get("/api/admin/backups/list", authenticateToken, requireRoleLevel('super_admin'), async (req: AuthRequest, res: Response) => {
    try {
      const { listBackups } = await import("./utils/databaseBackup.js");
      const backups = await listBackups();
      res.json(backups);
    } catch (error) {
      console.error("List backups error:", error);
      res.status(500).json({ message: "Failed to list backups" });
    }
  });

  // GET /api/admin/backups/stats - Get backup statistics
  app.get("/api/admin/backups/stats", authenticateToken, requireRoleLevel('super_admin'), async (req: AuthRequest, res: Response) => {
    try {
      const { getBackupStats } = await import("./utils/databaseBackup.js");
      const stats = await getBackupStats();
      res.json(stats);
    } catch (error) {
      console.error("Get backup stats error:", error);
      res.status(500).json({ message: "Failed to get backup statistics" });
    }
  });

  // POST /api/admin/backups/cleanup - Clean up old backups
  app.post("/api/admin/backups/cleanup", authenticateToken, requireRoleLevel('super_admin'), async (req: AuthRequest, res: Response) => {
    try {
      const { cleanupOldBackups } = await import("./utils/databaseBackup.js");
      const deletedCount = await cleanupOldBackups();
      res.json({ 
        success: true, 
        deletedCount,
        message: `Cleaned up ${deletedCount} old backups` 
      });
    } catch (error) {
      console.error("Cleanup backups error:", error);
      res.status(500).json({ message: "Failed to cleanup backups" });
    }
  });

  // ===============================
  // BATCH 03: CORE PROFILE API ENDPOINTS
  // ===============================

  // Validation schemas for profile operations
  const updateBaseProfileSchema = z.object({
    bio: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    profileImage: z.string().url().optional().or(z.literal("")),
    backgroundImage: z.string().url().optional().or(z.literal("")),
    languages: z.array(z.string()).optional(),
    tangoRoles: z.array(z.string()).optional(),
    name: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    occupation: z.string().optional(),
  });

  const trackProfileViewSchema = z.object({
    viewerIp: z.string().optional(),
    viewerUserId: z.number().optional(),
  });

  // GET /api/profile - Get current user's complete profile (all professional profiles merged)
  app.get("/api/profile", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user!.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const profile = await storage.getUserProfile(req.user!.id);

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("[Profile API] Error fetching current user profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // PUT /api/profile - Update user base profile
  app.put("/api/profile", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user!.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const validatedData = updateBaseProfileSchema.parse(req.body);
      
      const updatedProfile = await storage.updateUserProfile(req.user!.id, validatedData);

      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: error.errors 
        });
      }
      console.error("[Profile API] Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // GET /api/profile/:userId - Get any user's public profile
  app.get("/api/profile/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Get target user's profile
      const targetProfile = await storage.getUserProfile(userId);
      
      if (!targetProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Check visibility permissions
      const visibilitySettings = await storage.getProfileVisibilitySettings(userId);
      const profileVisibility = visibilitySettings?.profileVisibility || "public";

      // Check if viewer can access this profile
      const viewerId = req.user!.id;
      let canView = false;

      if (profileVisibility === "public") {
        canView = true;
      } else if (profileVisibility === "friends") {
        // Check if viewer is a friend
        if (viewerId && viewerId !== userId) {
          const [friendships] = await db
            .select()
            .from(friendships as any)
            .where(
              or(
                and(eq((friendships as any).userId, viewerId), eq((friendships as any).friendId, userId)),
                and(eq((friendships as any).userId, userId), eq((friendships as any).friendId, viewerId))
              )
            )
            .limit(1);
          canView = !!friendships;
        } else if (viewerId === userId) {
          canView = true; // User can always view their own profile
        }
      } else if (profileVisibility === "private") {
        // Only the profile owner can view
        canView = viewerId === userId;
      }

      if (!canView) {
        return res.status(403).json({ 
          message: "You do not have permission to view this profile",
          visibilityLevel: profileVisibility 
        });
      }

      res.json(targetProfile);
    } catch (error) {
      console.error("[Profile API] Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // GET /api/profile/:userId/visibility - Check profile visibility permissions
  app.get("/api/profile/:userId/visibility", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Get visibility settings
      const visibilitySettings = await storage.getProfileVisibilitySettings(userId);
      const profileVisibility = visibilitySettings?.profileVisibility || "public";

      // Check if viewer can access
      const viewerId = req.user!.id;
      let canView = false;

      if (profileVisibility === "public") {
        canView = true;
      } else if (profileVisibility === "friends") {
        if (viewerId && viewerId !== userId) {
          const [friendship] = await db
            .select()
            .from(friendships as any)
            .where(
              or(
                and(eq((friendships as any).userId, viewerId), eq((friendships as any).friendId, userId)),
                and(eq((friendships as any).userId, userId), eq((friendships as any).friendId, viewerId))
              )
            )
            .limit(1);
          canView = !!friendship;
        } else if (viewerId === userId) {
          canView = true;
        }
      } else if (profileVisibility === "private") {
        canView = viewerId === userId;
      }

      res.json({
        canView,
        visibilityLevel: profileVisibility,
        isOwner: viewerId === userId,
        isFriend: viewerId !== userId && canView && profileVisibility === "friends"
      });
    } catch (error) {
      console.error("[Profile API] Error checking visibility:", error);
      res.status(500).json({ message: "Failed to check visibility" });
    }
  });

  // GET /api/profile/:userId/stats - Get profile statistics
  app.get("/api/profile/:userId/stats", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Check if profile exists
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Get follower count
      const [followersResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(follows)
        .where(eq(follows.followingId, userId));
      const followers = followersResult?.count || 0;

      // Get following count
      const [followingResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(follows)
        .where(eq(follows.followerId, userId));
      const following = followingResult?.count || 0;

      // Get friendship/connections count
      const [connectionsResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(friendships as any)
        .where(
          or(
            eq((friendships as any).userId, userId),
            eq((friendships as any).friendId, userId)
          )
        );
      const connections = connectionsResult?.count || 0;

      // Get profile view stats
      const viewStats = await storage.getProfileViewStats(userId);
      const views = viewStats?.totalViews || 0;

      // Calculate profile completion percentage
      const profileFields = [
        user.bio,
        user.profileImage,
        user.city,
        user.country,
        user.languages?.length,
        user.tangoRoles?.length,
        user.firstName,
        user.lastName,
      ];
      const completedFields = profileFields.filter(field => field).length;
      const completionPercentage = Math.round((completedFields / profileFields.length) * 100);

      // Get post and event counts from database
      const [postsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(posts).where(eq(posts.userId, userId));
      const [eventsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(events).where(eq(events.userId, userId));

      res.json({
        views,
        followers,
        following,
        connections,
        completionPercentage,
        totalPosts: postsCount?.count || 0,
        totalEvents: eventsCount?.count || 0,
      });
    } catch (error) {
      console.error("[Profile API] Error fetching profile stats:", error);
      res.status(500).json({ message: "Failed to fetch profile stats" });
    }
  });

  // POST /api/profile/:userId/view - Track profile view
  app.post("/api/profile/:userId/view", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const validatedData = trackProfileViewSchema.parse(req.body);

      // Check if profile exists
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Track the view (you can implement this in storage or use analytics service)
      // For now, we'll just acknowledge the view was tracked
      // In a real implementation, you might store this in a profileViews table

      res.json({ 
        success: true,
        message: "Profile view tracked successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: error.errors 
        });
      }
      console.error("[Profile API] Error tracking profile view:", error);
      res.status(500).json({ message: "Failed to track profile view" });
    }
  });

  // Teacher Profiles
  app.post("/api/profiles/teacher", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const validated = insertTeacherProfileSchema.parse(req.body);
      const profile = await storage.createTeacherProfile({ ...validated, userId: req.user!.id });
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("[Teacher Profile] Create error:", error);
      res.status(500).json({ message: "Failed to create teacher profile" });
    }
  });

  app.get("/api/profiles/teacher/:userId", async (req: Request, res: Response) => {
    try {
      const profile = await storage.getTeacherProfile(parseInt(req.params.userId));
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      res.json(profile);
    } catch (error) {
      console.error("[Teacher Profile] Get error:", error);
      res.status(500).json({ message: "Failed to fetch teacher profile" });
    }
  });

  app.put("/api/profiles/teacher", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const validated = insertTeacherProfileSchema.partial().parse(req.body);
      const profile = await storage.updateTeacherProfile(req.user!.id, validated);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("[Teacher Profile] Update error:", error);
      res.status(500).json({ message: "Failed to update teacher profile" });
    }
  });

  app.delete("/api/profiles/teacher", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteTeacherProfile(req.user!.id);
      res.status(204).send();
    } catch (error) {
      console.error("[Teacher Profile] Delete error:", error);
      res.status(500).json({ message: "Failed to delete teacher profile" });
    }
  });

  app.get("/api/profiles/teachers/search", async (req: Request, res: Response) => {
    try {
      const filters = { 
        city: req.query.city as string | undefined, 
        minRate: req.query.minRate ? parseFloat(req.query.minRate as string) : undefined, 
        maxRate: req.query.maxRate ? parseFloat(req.query.maxRate as string) : undefined, 
        styles: req.query.styles as string | undefined, 
        level: req.query.level as string | undefined 
      };
      const results = await storage.searchTeacherProfiles(filters);
      res.json(results);
    } catch (error) {
      console.error("[Teacher Profile] Search error:", error);
      res.status(500).json({ message: "Failed to search teacher profiles" });
    }
  });

  // DJ Profiles
  app.post("/api/profiles/dj", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const validated = insertDJProfileSchema.parse(req.body);
      const profile = await storage.createDJProfile({ ...validated, userId: req.user!.id });
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("[DJ Profile] Create error:", error);
      res.status(500).json({ message: "Failed to create DJ profile" });
    }
  });

  app.get("/api/profiles/dj/:userId", async (req: Request, res: Response) => {
    try {
      const profile = await storage.getDJProfile(parseInt(req.params.userId));
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      res.json(profile);
    } catch (error) {
      console.error("[DJ Profile] Get error:", error);
      res.status(500).json({ message: "Failed to fetch DJ profile" });
    }
  });

  app.put("/api/profiles/dj", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const validated = insertDJProfileSchema.partial().parse(req.body);
      const profile = await storage.updateDJProfile(req.user!.id, validated);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("[DJ Profile] Update error:", error);
      res.status(500).json({ message: "Failed to update DJ profile" });
    }
  });

  app.delete("/api/profiles/dj", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteDJProfile(req.user!.id);
      res.status(204).send();
    } catch (error) {
      console.error("[DJ Profile] Delete error:", error);
      res.status(500).json({ message: "Failed to delete DJ profile" });
    }
  });

  app.get("/api/profiles/djs/search", async (req: Request, res: Response) => {
    try {
      const filters = { 
        city: req.query.city as string | undefined, 
        minRate: req.query.minRate ? parseFloat(req.query.minRate as string) : undefined, 
        maxRate: req.query.maxRate ? parseFloat(req.query.maxRate as string) : undefined, 
        styles: req.query.styles as string | undefined, 
        equipmentType: req.query.equipmentType as string | undefined 
      };
      const results = await storage.searchDJProfiles(filters);
      res.json(results);
    } catch (error) {
      console.error("[DJ Profile] Search error:", error);
      res.status(500).json({ message: "Failed to search DJ profiles" });
    }
  });

  // Musician Profiles
  app.post("/api/profiles/musician", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const validated = insertMusicianProfileSchema.parse(req.body);
      const profile = await storage.createMusicianProfile({ ...validated, userId: req.user!.id });
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("[Musician Profile] Create error:", error);
      res.status(500).json({ message: "Failed to create musician profile" });
    }
  });

  app.get("/api/profiles/musician/:userId", async (req: Request, res: Response) => {
    try {
      const profile = await storage.getMusicianProfile(parseInt(req.params.userId));
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      res.json(profile);
    } catch (error) {
      console.error("[Musician Profile] Get error:", error);
      res.status(500).json({ message: "Failed to fetch musician profile" });
    }
  });

  app.put("/api/profiles/musician", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const validated = insertMusicianProfileSchema.partial().parse(req.body);
      const profile = await storage.updateMusicianProfile(req.user!.id, validated);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("[Musician Profile] Update error:", error);
      res.status(500).json({ message: "Failed to update musician profile" });
    }
  });

  app.delete("/api/profiles/musician", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteMusicianProfile(req.user!.id);
      res.status(204).send();
    } catch (error) {
      console.error("[Musician Profile] Delete error:", error);
      res.status(500).json({ message: "Failed to delete musician profile" });
    }
  });

  app.get("/api/profiles/musicians/search", async (req: Request, res: Response) => {
    try {
      const filters = { 
        city: req.query.city as string | undefined, 
        minRate: req.query.minRate ? parseFloat(req.query.minRate as string) : undefined, 
        maxRate: req.query.maxRate ? parseFloat(req.query.maxRate as string) : undefined, 
        instruments: req.query.instruments as string | undefined, 
        ensembleType: req.query.ensembleType as string | undefined 
      };
      const results = await storage.searchMusicianProfiles(filters);
      res.json(results);
    } catch (error) {
      console.error("[Musician Profile] Search error:", error);
      res.status(500).json({ message: "Failed to search musician profiles" });
    }
  });

  // ============================================================================
  // BATCH 14: PROFILE ANALYTICS TRACKING
  // ============================================================================

  /**
   * POST /api/profiles/:userId/track-view
   * Track a profile view with analytics data
   */
  app.post("/api/profiles/:userId/track-view", async (req: Request, res: Response) => {
    try {
      const profileUserId = parseInt(req.params.userId);
      
      if (isNaN(profileUserId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Extract tracking data from request body
      const { profileType, source } = req.body;
      
      // Get viewer IP (check for proxies)
      const viewerIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
        || req.headers['x-real-ip'] as string
        || req.socket.remoteAddress 
        || null;

      // Get viewer user ID if authenticated (optional)
      const authHeader = req.headers.authorization;
      let viewerUserId: number | null = null;
      
      if (authHeader?.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'fallback-secret');
          viewerUserId = (decoded as any).userId;
          
          // Don't track self-views
          if (viewerUserId === profileUserId) {
            return res.json({ message: 'Self-view not tracked' });
          }
        } catch (error) {
          // Token invalid or expired, continue as anonymous view
        }
      }

      // Create profile view record
      await db.insert(profileViews).values({
        profileUserId,
        viewerUserId,
        profileType: profileType || null,
        viewerIp,
      });

      res.status(201).json({ 
        message: 'Profile view tracked successfully'
      });
    } catch (error) {
      console.error('[Profile Analytics] Track view error:', error);
      res.status(500).json({ message: 'Failed to track profile view' });
    }
  });

  /**
   * GET /api/profiles/:userId/analytics
   * Get comprehensive analytics for a profile with aggregation
   * Query params: period (day|week|month), days (number)
   */
  app.get("/api/profiles/:userId/analytics", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const profileUserId = parseInt(req.params.userId);
      
      if (isNaN(profileUserId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Privacy check: only owner can see detailed analytics
      if (req.user!.id !== profileUserId) {
        return res.status(403).json({ message: 'Not authorized to view analytics' });
      }

      const { period = 'month', days = '30' } = req.query;
      const daysNum = parseInt(days as string);
      const startDate = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);

      // Total view count
      const [totalViewsResult] = await db.select({
        count: count(),
      })
      .from(profileViews)
      .where(
        and(
          eq(profileViews.profileUserId, profileUserId),
          gte(profileViews.createdAt, startDate)
        )
      );

      // Unique visitors (distinct viewer IPs and user IDs)
      const [uniqueVisitorsResult] = await db.select({
        uniqueIps: sql<number>`COUNT(DISTINCT CASE WHEN ${profileViews.viewerIp} IS NOT NULL THEN ${profileViews.viewerIp} END)`,
        uniqueUsers: sql<number>`COUNT(DISTINCT CASE WHEN ${profileViews.viewerUserId} IS NOT NULL THEN ${profileViews.viewerUserId} END)`,
      })
      .from(profileViews)
      .where(
        and(
          eq(profileViews.profileUserId, profileUserId),
          gte(profileViews.createdAt, startDate)
        )
      );

      // Views by profile type/tab
      const viewsByTab = await db.select({
        profileType: profileViews.profileType,
        count: count(),
      })
      .from(profileViews)
      .where(
        and(
          eq(profileViews.profileUserId, profileUserId),
          gte(profileViews.createdAt, startDate),
          isNotNull(profileViews.profileType)
        )
      )
      .groupBy(profileViews.profileType)
      .orderBy(desc(count()));

      // Daily views aggregation
      const dailyViews = await db.select({
        date: sql<string>`DATE(${profileViews.createdAt})`,
        totalViews: count(),
        uniqueVisitors: sql<number>`COUNT(DISTINCT COALESCE(${profileViews.viewerUserId}::text, ${profileViews.viewerIp}))`,
      })
      .from(profileViews)
      .where(
        and(
          eq(profileViews.profileUserId, profileUserId),
          gte(profileViews.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE(${profileViews.createdAt})`)
      .orderBy(sql`DATE(${profileViews.createdAt})`);

      // Weekly aggregation
      const weeklyViews = await db.select({
        week: sql<string>`DATE_TRUNC('week', ${profileViews.createdAt})`,
        totalViews: count(),
        uniqueVisitors: sql<number>`COUNT(DISTINCT COALESCE(${profileViews.viewerUserId}::text, ${profileViews.viewerIp}))`,
      })
      .from(profileViews)
      .where(
        and(
          eq(profileViews.profileUserId, profileUserId),
          gte(profileViews.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE_TRUNC('week', ${profileViews.createdAt})`)
      .orderBy(sql`DATE_TRUNC('week', ${profileViews.createdAt})`);

      // Monthly aggregation
      const monthlyViews = await db.select({
        month: sql<string>`DATE_TRUNC('month', ${profileViews.createdAt})`,
        totalViews: count(),
        uniqueVisitors: sql<number>`COUNT(DISTINCT COALESCE(${profileViews.viewerUserId}::text, ${profileViews.viewerIp}))`,
      })
      .from(profileViews)
      .where(
        and(
          eq(profileViews.profileUserId, profileUserId),
          gte(profileViews.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE_TRUNC('month', ${profileViews.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${profileViews.createdAt})`);

      res.json({
        period: daysNum,
        summary: {
          totalViews: totalViewsResult.count || 0,
          uniqueVisitors: (uniqueVisitorsResult.uniqueIps || 0) + (uniqueVisitorsResult.uniqueUsers || 0),
          uniqueIps: uniqueVisitorsResult.uniqueIps || 0,
          uniqueUsers: uniqueVisitorsResult.uniqueUsers || 0,
        },
        viewsByTab,
        daily: dailyViews,
        weekly: weeklyViews,
        monthly: monthlyViews,
      });
    } catch (error) {
      console.error('[Profile Analytics] Get analytics error:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  /**
   * GET /api/profiles/:userId/visitors
   * Get recent profile visitors with details
   * Query params: limit (number)
   */
  app.get("/api/profiles/:userId/visitors", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const profileUserId = parseInt(req.params.userId);
      
      if (isNaN(profileUserId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Privacy check: only owner can see visitors
      if (req.user!.id !== profileUserId) {
        return res.status(403).json({ message: 'Not authorized to view visitors' });
      }

      const { limit = '50' } = req.query;
      const limitNum = Math.min(parseInt(limit as string), 100); // Cap at 100

      // Get recent visitors with user details (if authenticated)
      const visitors = await db.select({
        id: profileViews.id,
        viewedAt: profileViews.createdAt,
        profileType: profileViews.profileType,
        viewerUserId: profileViews.viewerUserId,
        viewerIp: profileViews.viewerIp,
        viewer: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(profileViews)
      .leftJoin(users, eq(profileViews.viewerUserId, users.id))
      .where(eq(profileViews.profileUserId, profileUserId))
      .orderBy(desc(profileViews.createdAt))
      .limit(limitNum);

      // Format response
      const formattedVisitors = visitors.map(v => ({
        id: v.id,
        viewedAt: v.viewedAt,
        profileType: v.profileType,
        viewer: v.viewerUserId ? v.viewer : null,
        isAnonymous: !v.viewerUserId,
        viewerLocation: v.viewerIp ? {
          ip: v.viewerIp.substring(0, v.viewerIp.lastIndexOf('.')) + '.xxx', // Partial IP for privacy
        } : null,
      }));

      res.json(formattedVisitors);
    } catch (error) {
      console.error('[Profile Analytics] Get visitors error:', error);
      res.status(500).json({ message: 'Failed to fetch visitors' });
    }
  });

  // ============================================================================
  // PART_3: FINANCIAL MANAGEMENT API ROUTES (AGENTS #73-105)
  // ============================================================================

  // Financial Portfolios
  app.get("/api/financial/portfolios", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const portfolios = await storage.getFinancialPortfolios(req.user!.id);
      res.json(portfolios);
    } catch (error) {
      console.error('[Financial] Get portfolios error:', error);
      res.status(500).json({ message: 'Failed to fetch portfolios' });
    }
  });

  app.post("/api/financial/portfolios", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertFinancialPortfolioSchema.parse(req.body);
      const portfolio = await storage.createFinancialPortfolio(req.user!.id, data);
      res.json(portfolio);
    } catch (error) {
      console.error('[Financial] Create portfolio error:', error);
      res.status(500).json({ message: 'Failed to create portfolio' });
    }
  });

  app.get("/api/financial/portfolios/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const portfolio = await storage.getFinancialPortfolioById(id);
      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }
      res.json(portfolio);
    } catch (error) {
      console.error('[Financial] Get portfolio error:', error);
      res.status(500).json({ message: 'Failed to fetch portfolio' });
    }
  });

  app.patch("/api/financial/portfolios/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const portfolio = await storage.updateFinancialPortfolio(id, req.body);
      res.json(portfolio);
    } catch (error) {
      console.error('[Financial] Update portfolio error:', error);
      res.status(500).json({ message: 'Failed to update portfolio' });
    }
  });

  app.delete("/api/financial/portfolios/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFinancialPortfolio(id);
      res.json({ message: 'Portfolio deleted' });
    } catch (error) {
      console.error('[Financial] Delete portfolio error:', error);
      res.status(500).json({ message: 'Failed to delete portfolio' });
    }
  });

  // Financial Accounts
  app.get("/api/financial/accounts", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const accounts = await storage.getFinancialAccounts(req.user!.id);
      res.json(accounts);
    } catch (error) {
      console.error('[Financial] Get accounts error:', error);
      res.status(500).json({ message: 'Failed to fetch accounts' });
    }
  });

  app.post("/api/financial/accounts", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertFinancialAccountSchema.parse(req.body);
      const account = await storage.createFinancialAccount(req.user!.id, data);
      res.json(account);
    } catch (error) {
      console.error('[Financial] Create account error:', error);
      res.status(500).json({ message: 'Failed to create account' });
    }
  });

  app.post("/api/financial/accounts/:id/sync", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.syncFinancialAccount(id);
      res.json(account);
    } catch (error) {
      console.error('[Financial] Sync account error:', error);
      res.status(500).json({ message: 'Failed to sync account' });
    }
  });

  // Financial Assets
  app.get("/api/financial/portfolios/:portfolioId/assets", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const portfolioId = parseInt(req.params.portfolioId);
      const assets = await storage.getFinancialAssets(portfolioId);
      res.json(assets);
    } catch (error) {
      console.error('[Financial] Get assets error:', error);
      res.status(500).json({ message: 'Failed to fetch assets' });
    }
  });

  app.post("/api/financial/portfolios/:portfolioId/assets", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const portfolioId = parseInt(req.params.portfolioId);
      const data = insertFinancialAssetSchema.parse(req.body);
      const asset = await storage.createFinancialAsset(portfolioId, data);
      res.json(asset);
    } catch (error) {
      console.error('[Financial] Create asset error:', error);
      res.status(500).json({ message: 'Failed to create asset' });
    }
  });

  // Financial Trades
  app.get("/api/financial/portfolios/:portfolioId/trades", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const portfolioId = parseInt(req.params.portfolioId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      const trades = await storage.getFinancialTrades(portfolioId, { limit, offset });
      res.json(trades);
    } catch (error) {
      console.error('[Financial] Get trades error:', error);
      res.status(500).json({ message: 'Failed to fetch trades' });
    }
  });

  app.post("/api/financial/portfolios/:portfolioId/trades", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const portfolioId = parseInt(req.params.portfolioId);
      const data = insertFinancialTradeSchema.parse(req.body);
      const trade = await storage.createFinancialTrade(portfolioId, data);
      res.json(trade);
    } catch (error) {
      console.error('[Financial] Create trade error:', error);
      res.status(500).json({ message: 'Failed to create trade' });
    }
  });

  // Financial Strategies
  app.get("/api/financial/strategies", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const isActive = req.query.isActive === 'true';
      const strategies = await storage.getFinancialStrategies({ isActive: req.query.isActive ? isActive : undefined });
      res.json(strategies);
    } catch (error) {
      console.error('[Financial] Get strategies error:', error);
      res.status(500).json({ message: 'Failed to fetch strategies' });
    }
  });

  app.post("/api/financial/strategies", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertFinancialStrategySchema.parse(req.body);
      const strategy = await storage.createFinancialStrategy(data);
      res.json(strategy);
    } catch (error) {
      console.error('[Financial] Create strategy error:', error);
      res.status(500).json({ message: 'Failed to create strategy' });
    }
  });

  // Financial Market Data
  app.get("/api/financial/market/:symbol", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const symbol = req.params.symbol;
      const marketData = await storage.getFinancialMarketData(symbol);
      res.json(marketData || {});
    } catch (error) {
      console.error('[Financial] Get market data error:', error);
      res.status(500).json({ message: 'Failed to fetch market data' });
    }
  });

  // Financial AI Decisions
  app.get("/api/financial/portfolios/:portfolioId/ai-decisions", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const portfolioId = parseInt(req.params.portfolioId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      const decisions = await storage.getFinancialAIDecisions(portfolioId, { limit, offset });
      res.json(decisions);
    } catch (error) {
      console.error('[Financial] Get AI decisions error:', error);
      res.status(500).json({ message: 'Failed to fetch AI decisions' });
    }
  });

  app.post("/api/financial/ai-decisions", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertFinancialAIDecisionSchema.parse(req.body);
      const decision = await storage.createFinancialAIDecision(data);
      res.json(decision);
    } catch (error) {
      console.error('[Financial] Create AI decision error:', error);
      res.status(500).json({ message: 'Failed to create AI decision' });
    }
  });

  // Financial Risk Metrics
  app.get("/api/financial/portfolios/:portfolioId/risk-metrics", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const portfolioId = parseInt(req.params.portfolioId);
      const metrics = await storage.getFinancialRiskMetrics(portfolioId);
      res.json(metrics || {});
    } catch (error) {
      console.error('[Financial] Get risk metrics error:', error);
      res.status(500).json({ message: 'Failed to fetch risk metrics' });
    }
  });

  // Financial Agents
  app.get("/api/financial/agents", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const tier = req.query.tier ? parseInt(req.query.tier as string) : undefined;
      const isActive = req.query.isActive === 'true';
      const agents = await storage.getFinancialAgents({ tier, isActive: req.query.isActive ? isActive : undefined });
      res.json(agents);
    } catch (error) {
      console.error('[Financial] Get agents error:', error);
      res.status(500).json({ message: 'Failed to fetch agents' });
    }
  });

  // Financial Monitoring Logs
  app.get("/api/financial/monitoring", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const agentId = req.query.agentId ? parseInt(req.query.agentId as string) : undefined;
      const portfolioId = req.query.portfolioId ? parseInt(req.query.portfolioId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const logs = await storage.getFinancialMonitoringLogs({ agentId, portfolioId, limit });
      res.json(logs);
    } catch (error) {
      console.error('[Financial] Get monitoring logs error:', error);
      res.status(500).json({ message: 'Failed to fetch monitoring logs' });
    }
  });

  // ============================================================================
  // PART_3: SOCIAL MEDIA INTEGRATION API ROUTES (AGENTS #120-124)
  // ============================================================================

  // Platform Connections
  app.get("/api/social/connections", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const connections = await storage.getPlatformConnections(req.user!.id);
      res.json(connections);
    } catch (error) {
      console.error('[Social] Get connections error:', error);
      res.status(500).json({ message: 'Failed to fetch connections' });
    }
  });

  app.post("/api/social/connections", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertPlatformConnectionSchema.parse(req.body);
      const connection = await storage.createPlatformConnection(req.user!.id, data);
      res.json(connection);
    } catch (error) {
      console.error('[Social] Create connection error:', error);
      res.status(500).json({ message: 'Failed to create connection' });
    }
  });

  app.get("/api/social/connections/:platform", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const platform = req.params.platform;
      const connection = await storage.getPlatformConnection(req.user!.id, platform);
      res.json(connection || {});
    } catch (error) {
      console.error('[Social] Get connection error:', error);
      res.status(500).json({ message: 'Failed to fetch connection' });
    }
  });

  // Social Posts
  app.get("/api/social/posts", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      const posts = await storage.getSocialPosts(req.user!.id, { status, limit, offset });
      res.json(posts);
    } catch (error) {
      console.error('[Social] Get posts error:', error);
      res.status(500).json({ message: 'Failed to fetch posts' });
    }
  });

  app.post("/api/social/posts", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertSocialPostSchema.parse(req.body);
      const post = await storage.createSocialPost(req.user!.id, data);
      res.json(post);
    } catch (error) {
      console.error('[Social] Create post error:', error);
      res.status(500).json({ message: 'Failed to create post' });
    }
  });

  app.get("/api/social/posts/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getSocialPostById(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.json(post);
    } catch (error) {
      console.error('[Social] Get post error:', error);
      res.status(500).json({ message: 'Failed to fetch post' });
    }
  });

  app.post("/api/social/posts/:id/publish", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.publishSocialPost(id);
      res.json(post);
    } catch (error) {
      console.error('[Social] Publish post error:', error);
      res.status(500).json({ message: 'Failed to publish post' });
    }
  });

  // Social Campaigns
  app.get("/api/social/campaigns", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const campaigns = await storage.getSocialCampaigns(req.user!.id, { status });
      res.json(campaigns);
    } catch (error) {
      console.error('[Social] Get campaigns error:', error);
      res.status(500).json({ message: 'Failed to fetch campaigns' });
    }
  });

  app.post("/api/social/campaigns", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertSocialCampaignSchema.parse(req.body);
      const campaign = await storage.createSocialCampaign(req.user!.id, data);
      res.json(campaign);
    } catch (error) {
      console.error('[Social] Create campaign error:', error);
      res.status(500).json({ message: 'Failed to create campaign' });
    }
  });

  // Cross Platform Analytics
  app.get("/api/social/analytics/:period", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const period = req.params.period;
      const analytics = await storage.getCrossPlatformAnalytics(req.user!.id, period);
      res.json(analytics || {});
    } catch (error) {
      console.error('[Social] Get analytics error:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  // AI Generated Content
  app.get("/api/social/campaigns/:campaignId/ai-content", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const approvalStatus = req.query.approvalStatus as string | undefined;
      const content = await storage.getAIGeneratedContent(campaignId, { approvalStatus });
      res.json(content);
    } catch (error) {
      console.error('[Social] Get AI content error:', error);
      res.status(500).json({ message: 'Failed to fetch AI content' });
    }
  });

  app.post("/api/social/ai-content", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertAIGeneratedContentSchema.parse(req.body);
      const content = await storage.createAIGeneratedContent(data);
      res.json(content);
    } catch (error) {
      console.error('[Social] Create AI content error:', error);
      res.status(500).json({ message: 'Failed to create AI content' });
    }
  });

  // Scraped Events
  app.get("/api/social/scraped-events", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      const events = await storage.getScrapedEvents({ status, limit, offset });
      res.json(events);
    } catch (error) {
      console.error('[Social] Get scraped events error:', error);
      res.status(500).json({ message: 'Failed to fetch scraped events' });
    }
  });

  app.post("/api/social/scraped-events", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertScrapedEventSchema.parse(req.body);
      const event = await storage.createScrapedEvent(data);
      res.json(event);
    } catch (error) {
      console.error('[Social] Create scraped event error:', error);
      res.status(500).json({ message: 'Failed to create scraped event' });
    }
  });

  // Event Claims
  app.get("/api/social/event-claims", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const claims = await storage.getEventClaims(req.user!.id);
      res.json(claims);
    } catch (error) {
      console.error('[Social] Get event claims error:', error);
      res.status(500).json({ message: 'Failed to fetch event claims' });
    }
  });

  app.post("/api/social/event-claims", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertEventClaimSchema.parse(req.body);
      const claim = await storage.createEventClaim(req.user!.id, data.scrapedEventId, data);
      res.json(claim);
    } catch (error) {
      console.error('[Social] Create event claim error:', error);
      res.status(500).json({ message: 'Failed to create event claim' });
    }
  });

  // ============================================================================
  // PART_3: CREATOR MARKETPLACE API ROUTES (AGENTS #158-160)
  // ============================================================================

  // Marketplace Products
  app.get("/api/marketplace/products", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const creatorUserId = req.query.creatorUserId ? parseInt(req.query.creatorUserId as string) : undefined;
      const category = req.query.category as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      const products = await storage.getMarketplaceProducts({ creatorUserId, category, limit, offset });
      res.json(products);
    } catch (error) {
      console.error('[Marketplace] Get products error:', error);
      res.status(500).json({ message: 'Failed to fetch products' });
    }
  });

  app.post("/api/marketplace/products", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertMarketplaceProductSchema.parse(req.body);
      const product = await storage.createMarketplaceProduct(req.user!.id, data);
      res.json(product);
    } catch (error) {
      console.error('[Marketplace] Create product error:', error);
      res.status(500).json({ message: 'Failed to create product' });
    }
  });

  app.get("/api/marketplace/products/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getMarketplaceProductById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      console.error('[Marketplace] Get product error:', error);
      res.status(500).json({ message: 'Failed to fetch product' });
    }
  });

  // Product Purchases
  app.get("/api/marketplace/purchases", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const purchases = await storage.getProductPurchases(req.user!.id);
      res.json(purchases);
    } catch (error) {
      console.error('[Marketplace] Get purchases error:', error);
      res.status(500).json({ message: 'Failed to fetch purchases' });
    }
  });

  app.post("/api/marketplace/products/:productId/purchase", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const productId = parseInt(req.params.productId);
      const data = insertProductPurchaseSchema.parse(req.body);
      const purchase = await storage.createProductPurchase(req.user!.id, productId, data);
      res.json(purchase);
    } catch (error) {
      console.error('[Marketplace] Create purchase error:', error);
      res.status(500).json({ message: 'Failed to create purchase' });
    }
  });

  // Product Reviews
  app.get("/api/marketplace/products/:productId/reviews", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const productId = parseInt(req.params.productId);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      console.error('[Marketplace] Get reviews error:', error);
      res.status(500).json({ message: 'Failed to fetch reviews' });
    }
  });

  app.post("/api/marketplace/products/:productId/reviews", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const productId = parseInt(req.params.productId);
      const data = insertProductReviewSchema.parse(req.body);
      const review = await storage.createProductReview(req.user!.id, productId, data);
      res.json(review);
    } catch (error) {
      console.error('[Marketplace] Create review error:', error);
      res.status(500).json({ message: 'Failed to create review' });
    }
  });

  // Marketplace Analytics
  app.get("/api/marketplace/analytics/:period", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const period = req.params.period;
      const analytics = await storage.getMarketplaceAnalytics(req.user!.id, period);
      res.json(analytics || {});
    } catch (error) {
      console.error('[Marketplace] Get analytics error:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  // Funding Campaigns (GoFundMe)
  app.get("/api/funding/campaigns", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const category = req.query.category as string | undefined;
      const status = req.query.status as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      const campaigns = await storage.getFundingCampaigns({ userId, category, status, limit, offset });
      res.json(campaigns);
    } catch (error) {
      console.error('[Funding] Get campaigns error:', error);
      res.status(500).json({ message: 'Failed to fetch campaigns' });
    }
  });

  app.post("/api/funding/campaigns", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertFundingCampaignSchema.parse(req.body);
      const campaign = await storage.createFundingCampaign(req.user!.id, data);
      res.json(campaign);
    } catch (error) {
      console.error('[Funding] Create campaign error:', error);
      res.status(500).json({ message: 'Failed to create campaign' });
    }
  });

  app.get("/api/funding/campaigns/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getFundingCampaignById(id);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      res.json(campaign);
    } catch (error) {
      console.error('[Funding] Get campaign error:', error);
      res.status(500).json({ message: 'Failed to fetch campaign' });
    }
  });

  app.get("/api/funding/campaigns/:campaignId/donations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const donations = await storage.getCampaignDonations(campaignId);
      res.json(donations);
    } catch (error) {
      console.error('[Funding] Get donations error:', error);
      res.status(500).json({ message: 'Failed to fetch donations' });
    }
  });

  app.post("/api/funding/campaigns/:campaignId/donations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const data = insertCampaignDonationSchema.parse(req.body);
      const donation = await storage.createCampaignDonation(campaignId, data);
      res.json(donation);
    } catch (error) {
      console.error('[Funding] Create donation error:', error);
      res.status(500).json({ message: 'Failed to create donation' });
    }
  });

  app.get("/api/funding/campaigns/:campaignId/updates", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const updates = await storage.getCampaignUpdates(campaignId);
      res.json(updates);
    } catch (error) {
      console.error('[Funding] Get updates error:', error);
      res.status(500).json({ message: 'Failed to fetch updates' });
    }
  });

  app.post("/api/funding/campaigns/:campaignId/updates", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const data = insertCampaignUpdateSchema.parse(req.body);
      const update = await storage.createCampaignUpdate(campaignId, data);
      res.json(update);
    } catch (error) {
      console.error('[Funding] Create update error:', error);
      res.status(500).json({ message: 'Failed to create update' });
    }
  });

  // Legal Documents
  app.get("/api/legal/documents", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const isPremium = req.query.isPremium === 'true';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      const documents = await storage.getLegalDocuments({ category, isPremium: req.query.isPremium ? isPremium : undefined, limit, offset });
      res.json(documents);
    } catch (error) {
      console.error('[Legal] Get documents error:', error);
      res.status(500).json({ message: 'Failed to fetch documents' });
    }
  });

  app.post("/api/legal/documents", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertLegalDocumentSchema.parse(req.body);
      const document = await storage.createLegalDocument(req.user!.id, data);
      res.json(document);
    } catch (error) {
      console.error('[Legal] Create document error:', error);
      res.status(500).json({ message: 'Failed to create document' });
    }
  });

  app.get("/api/legal/documents/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getLegalDocumentById(id);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      res.json(document);
    } catch (error) {
      console.error('[Legal] Get document error:', error);
      res.status(500).json({ message: 'Failed to fetch document' });
    }
  });

  app.get("/api/legal/instances", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const instances = await storage.getDocumentInstances(req.user!.id);
      res.json(instances);
    } catch (error) {
      console.error('[Legal] Get instances error:', error);
      res.status(500).json({ message: 'Failed to fetch instances' });
    }
  });

  app.post("/api/legal/documents/:templateId/instances", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const templateId = parseInt(req.params.templateId);
      const data = insertDocumentInstanceSchema.parse(req.body);
      const instance = await storage.createDocumentInstance(req.user!.id, templateId, data);
      res.json(instance);
    } catch (error) {
      console.error('[Legal] Create instance error:', error);
      res.status(500).json({ message: 'Failed to create instance' });
    }
  });

  // ============================================================================
  // PART_3: TRAVEL INTEGRATION API ROUTES (AGENTS #161-162)
  // ============================================================================

  // Travel Plans
  app.get("/api/travel/plans", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const plans = await storage.getTravelPlans(req.user!.id, { status });
      res.json(plans);
    } catch (error) {
      console.error('[Travel] Get plans error:', error);
      res.status(500).json({ message: 'Failed to fetch plans' });
    }
  });

  app.post("/api/travel/plans", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertTravelPlanSchema.parse(req.body);
      const plan = await storage.createTravelPlan(req.user!.id, data);
      res.json(plan);
    } catch (error) {
      console.error('[Travel] Create plan error:', error);
      res.status(500).json({ message: 'Failed to create plan' });
    }
  });

  app.get("/api/travel/plans/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.getTravelPlanById(id);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }
      res.json(plan);
    } catch (error) {
      console.error('[Travel] Get plan error:', error);
      res.status(500).json({ message: 'Failed to fetch plan' });
    }
  });

  app.patch("/api/travel/plans/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.updateTravelPlan(id, req.body);
      res.json(plan);
    } catch (error) {
      console.error('[Travel] Update plan error:', error);
      res.status(500).json({ message: 'Failed to update plan' });
    }
  });

  app.delete("/api/travel/plans/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTravelPlan(id);
      res.json({ message: 'Plan deleted' });
    } catch (error) {
      console.error('[Travel] Delete plan error:', error);
      res.status(500).json({ message: 'Failed to delete plan' });
    }
  });

  // Travel Plan Items
  app.get("/api/travel/plans/:planId/items", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const planId = parseInt(req.params.planId);
      const items = await storage.getTravelPlanItems(planId);
      res.json(items);
    } catch (error) {
      console.error('[Travel] Get items error:', error);
      res.status(500).json({ message: 'Failed to fetch items' });
    }
  });

  app.post("/api/travel/plans/:planId/items", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const planId = parseInt(req.params.planId);
      const data = insertTravelPlanItemSchema.parse(req.body);
      const item = await storage.createTravelPlanItem(planId, data);
      res.json(item);
    } catch (error) {
      console.error('[Travel] Create item error:', error);
      res.status(500).json({ message: 'Failed to create item' });
    }
  });

  app.patch("/api/travel/items/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.updateTravelPlanItem(id, req.body);
      res.json(item);
    } catch (error) {
      console.error('[Travel] Update item error:', error);
      res.status(500).json({ message: 'Failed to update item' });
    }
  });

  app.delete("/api/travel/items/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTravelPlanItem(id);
      res.json({ message: 'Item deleted' });
    } catch (error) {
      console.error('[Travel] Delete item error:', error);
      res.status(500).json({ message: 'Failed to delete item' });
    }
  });

  // Travel Preferences
  app.get("/api/travel/preferences", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const preferences = await storage.getTravelPreferences(req.user!.id);
      res.json(preferences || {});
    } catch (error) {
      console.error('[Travel] Get preferences error:', error);
      res.status(500).json({ message: 'Failed to fetch preferences' });
    }
  });

  app.patch("/api/travel/preferences", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertTravelPreferencesProfileSchema.parse(req.body);
      const preferences = await storage.updateTravelPreferences(req.user!.id, data);
      res.json(preferences);
    } catch (error) {
      console.error('[Travel] Update preferences error:', error);
      res.status(500).json({ message: 'Failed to update preferences' });
    }
  });

  // Travel Recommendations
  app.get("/api/travel/recommendations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const destination = req.query.destination as string | undefined;
      const recommendations = await storage.getTravelRecommendations(req.user!.id, { destination });
      res.json(recommendations);
    } catch (error) {
      console.error('[Travel] Get recommendations error:', error);
      res.status(500).json({ message: 'Failed to fetch recommendations' });
    }
  });

  // ============================================================================
  // EMAIL NOTIFICATION SYSTEM
  // ============================================================================

  // Get email preferences
  app.get("/api/user/email-preferences", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      let prefs = await db.query.emailPreferences.findFirst({
        where: eq(emailPreferences.userId, req.user!.id)
      });
      
      // Create default preferences if none exist
      if (!prefs) {
        const crypto = await import('crypto');
        const created = await db.insert(emailPreferences)
          .values({ 
            userId: req.user!.id, 
            unsubscribeToken: crypto.randomBytes(32).toString('hex') 
          })
          .returning();
        prefs = created[0];
      }
      
      res.json(prefs);
    } catch (error) {
      console.error('[Email] Get preferences error:', error);
      res.status(500).json({ message: 'Failed to fetch email preferences' });
    }
  });

  // Update email preferences
  app.patch("/api/user/email-preferences", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const updated = await db.update(emailPreferences)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(emailPreferences.userId, req.user!.id))
        .returning();
      
      res.json(updated[0]);
    } catch (error) {
      console.error('[Email] Update preferences error:', error);
      res.status(500).json({ message: 'Failed to update email preferences' });
    }
  });

  // Unsubscribe via token (from email link)
  app.get("/api/unsubscribe/:token", async (req: Request, res: Response) => {
    try {
      await db.update(emailPreferences)
        .set({ emailsEnabled: false })
        .where(eq(emailPreferences.unsubscribeToken, req.params.token));
      
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .container { background: white; padding: 40px; border-radius: 10px; text-align: center; max-width: 500px; }
            h1 { color: #333; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
            a { color: #667eea; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Successfully Unsubscribed</h1>
            <p>You have been unsubscribed from all emails from Mundo Tango.</p>
            <p>You can update your email preferences anytime in your <a href="/settings/email-preferences">account settings</a>.</p>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('[Email] Unsubscribe error:', error);
      res.status(500).send('Failed to unsubscribe. Please try again later.');
    }
  });

  // ============================================================================
  // AI SERVICES CONSOLIDATION (Week 10-12)
  // ============================================================================

  console.log('[Server] Loading AI Services Consolidation routes...');
  
  const { MeshyService } = await import('./services/ai/MeshyService');
  const { LumaService } = await import('./services/ai/LumaService');
  const { HeyGenService } = await import('./services/ai/HeyGenService');
  const { PomodoroService } = await import('./services/PomodoroService');
  const { ProductivityAnalyticsService } = await import('./services/ProductivityAnalyticsService');
  const { AIBudgetBuilder } = await import('./services/AIBudgetBuilder');
  const { NaturalLanguageTalentSearch } = await import('./services/NaturalLanguageTalentSearch');
  const { AIOutreachGenerator } = await import('./services/AIOutreachGenerator');
  const { VirtualEmailService } = await import('./services/VirtualEmailService');
  const { DarkWebMonitoringService } = await import('./services/DarkWebMonitoringService');

  // ============================================================================
  // MR BLUE AI CONTENT STUDIO
  // ============================================================================

  app.post("/api/content-studio/generate-3d", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const meshyService = new MeshyService();
      const result = await meshyService.textTo3D({
        userId: req.user!.id,
        prompt: req.body.prompt,
        quality: req.body.quality || 'draft',
        style: req.body.style
      });
      res.json(result);
    } catch (error) {
      console.error('[ContentStudio] 3D generation error:', error);
      res.status(500).json({ message: 'Failed to generate 3D model' });
    }
  });

  app.post("/api/content-studio/image-to-3d", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const meshyService = new MeshyService();
      const result = await meshyService.imageTo3D({
        userId: req.user!.id,
        imageUrls: req.body.imageUrls,
        multiViewMode: req.body.multiViewMode || false,
        targetPolycount: req.body.targetPolycount
      });
      res.json(result);
    } catch (error) {
      console.error('[ContentStudio] Image-to-3D error:', error);
      res.status(500).json({ message: 'Failed to convert image to 3D' });
    }
  });

  app.post("/api/content-studio/generate-video", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const lumaService = new LumaService();
      const result = await lumaService.textToVideo({
        userId: req.user!.id,
        prompt: req.body.prompt,
        duration: req.body.duration || 5,
        aspectRatio: req.body.aspectRatio || '16:9',
        cameraMotion: req.body.cameraMotion,
        style: req.body.style,
        hdr: req.body.hdr
      });
      res.json(result);
    } catch (error) {
      console.error('[ContentStudio] Video generation error:', error);
      res.status(500).json({ message: 'Failed to generate video' });
    }
  });

  app.post("/api/content-studio/image-to-video", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const lumaService = new LumaService();
      const result = await lumaService.imageToVideo({
        userId: req.user!.id,
        imageUrl: req.body.imageUrl,
        duration: req.body.duration || 5,
        animationIntensity: req.body.animationIntensity || 'medium',
        cameraPath: req.body.cameraPath
      });
      res.json(result);
    } catch (error) {
      console.error('[ContentStudio] Image-to-video error:', error);
      res.status(500).json({ message: 'Failed to convert image to video' });
    }
  });

  app.post("/api/content-studio/photo-avatar", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const heygenService = new HeyGenService();
      const result = await heygenService.photoToAvatarVideo({
        userId: req.user!.id,
        photoUrl: req.body.photoUrl,
        script: req.body.script,
        voiceId: req.body.voiceId,
        angle: req.body.angle || 'portrait',
        background: req.body.background || 'clean',
        customBackgroundUrl: req.body.customBackgroundUrl
      });
      res.json(result);
    } catch (error) {
      console.error('[ContentStudio] Photo avatar error:', error);
      res.status(500).json({ message: 'Failed to generate avatar video' });
    }
  });

  app.post("/api/content-studio/digital-twin", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const heygenService = new HeyGenService();
      const result = await heygenService.createDigitalTwin({
        userId: req.user!.id,
        trainingVideoUrl: req.body.trainingVideoUrl,
        name: req.body.name
      });
      res.json(result);
    } catch (error) {
      console.error('[ContentStudio] Digital twin error:', error);
      res.status(500).json({ message: 'Failed to create digital twin' });
    }
  });

  app.get("/api/content-studio/assets", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const assets = await db.select()
        .from(generatedAssets)
        .where(eq(generatedAssets.userId, req.user!.id))
        .orderBy(desc(generatedAssets.createdAt));
      res.json(assets);
    } catch (error) {
      console.error('[ContentStudio] Get assets error:', error);
      res.status(500).json({ message: 'Failed to fetch assets' });
    }
  });

  // ============================================================================
  // PRODUCTIVITY AGENT 2.0
  // ============================================================================

  app.post("/api/productivity/pomodoro/start", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const pomodoroService = new PomodoroService();
      const session = await pomodoroService.startSession({
        userId: req.user!.id,
        taskId: req.body.taskId,
        duration: req.body.duration || 25,
        type: req.body.type || 'work'
      });
      res.json(session);
    } catch (error) {
      console.error('[Productivity] Start pomodoro error:', error);
      res.status(500).json({ message: 'Failed to start pomodoro session' });
    }
  });

  app.post("/api/productivity/pomodoro/:sessionId/complete", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const pomodoroService = new PomodoroService();
      await pomodoroService.completeSession(parseInt(req.params.sessionId));
      res.json({ success: true });
    } catch (error) {
      console.error('[Productivity] Complete pomodoro error:', error);
      res.status(500).json({ message: 'Failed to complete session' });
    }
  });

  app.post("/api/productivity/pomodoro/:sessionId/cancel", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const pomodoroService = new PomodoroService();
      await pomodoroService.cancelSession(parseInt(req.params.sessionId));
      res.json({ success: true });
    } catch (error) {
      console.error('[Productivity] Cancel pomodoro error:', error);
      res.status(500).json({ message: 'Failed to cancel session' });
    }
  });

  app.get("/api/productivity/pomodoro/active", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const pomodoroService = new PomodoroService();
      const session = await pomodoroService.getActiveSession(req.user!.id);
      res.json(session);
    } catch (error) {
      console.error('[Productivity] Get active session error:', error);
      res.status(500).json({ message: 'Failed to get active session' });
    }
  });

  app.get("/api/productivity/stats", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const pomodoroService = new PomodoroService();
      const days = parseInt(req.query.days as string) || 7;
      const stats = await pomodoroService.getUserStats(req.user!.id, days);
      res.json(stats);
    } catch (error) {
      console.error('[Productivity] Get stats error:', error);
      res.status(500).json({ message: 'Failed to get stats' });
    }
  });

  app.post("/api/productivity/report/generate", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const analyticsService = new ProductivityAnalyticsService();
      const report = await analyticsService.generateWeeklyReport(req.user!.id);
      res.json(report);
    } catch (error) {
      console.error('[Productivity] Generate report error:', error);
      res.status(500).json({ message: 'Failed to generate report' });
    }
  });

  app.post("/api/productivity/distraction", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const analyticsService = new ProductivityAnalyticsService();
      await analyticsService.trackDistraction(req.user!.id, req.body.type, req.body.metadata);
      res.json({ success: true });
    } catch (error) {
      console.error('[Productivity] Track distraction error:', error);
      res.status(500).json({ message: 'Failed to track distraction' });
    }
  });

  // ============================================================================
  // FINANCE AGENT ENHANCED
  // ============================================================================

  app.post("/api/finance/analyze", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const budgetBuilder = new AIBudgetBuilder();
      const months = parseInt(req.body.months) || 6;
      const analysis = await budgetBuilder.analyzeSpending(req.user!.id, months);
      res.json(analysis);
    } catch (error) {
      console.error('[Finance] Analyze spending error:', error);
      res.status(500).json({ message: 'Failed to analyze spending' });
    }
  });

  app.post("/api/finance/budget/apply", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const budgetBuilder = new AIBudgetBuilder();
      await budgetBuilder.applyBudget(req.user!.id, req.body.budget);
      res.json({ success: true });
    } catch (error) {
      console.error('[Finance] Apply budget error:', error);
      res.status(500).json({ message: 'Failed to apply budget' });
    }
  });

  app.post("/api/finance/transaction", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const [txn] = await db.insert(financialTransactions).values({
        userId: req.user!.id,
        type: req.body.type,
        amount: req.body.amount,
        category: req.body.category,
        description: req.body.description,
        merchant: req.body.merchant,
        date: new Date(req.body.date),
        recurring: req.body.recurring || false
      }).returning();
      res.json(txn);
    } catch (error) {
      console.error('[Finance] Create transaction error:', error);
      res.status(500).json({ message: 'Failed to create transaction' });
    }
  });

  app.get("/api/finance/transactions", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const txns = await db.select()
        .from(financialTransactions)
        .where(eq(financialTransactions.userId, req.user!.id))
        .orderBy(desc(financialTransactions.date));
      res.json(txns);
    } catch (error) {
      console.error('[Finance] Get transactions error:', error);
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  });

  app.get("/api/finance/budgets", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userBudgets = await db.select()
        .from(budgets)
        .where(eq(budgets.userId, req.user!.id));
      res.json(userBudgets);
    } catch (error) {
      console.error('[Finance] Get budgets error:', error);
      res.status(500).json({ message: 'Failed to fetch budgets' });
    }
  });

  // ============================================================================
  // ENHANCED TALENT MATCH
  // ============================================================================

  app.post("/api/talent-match/search", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const searchService = new NaturalLanguageTalentSearch();
      const results = await searchService.search({
        query: req.body.query,
        userId: req.user!.id,
        limit: req.body.limit || 20
      });
      res.json(results);
    } catch (error) {
      console.error('[TalentMatch] Search error:', error);
      res.status(500).json({ message: 'Failed to search talent' });
    }
  });

  app.post("/api/talent-match/outreach/generate", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const outreachService = new AIOutreachGenerator();
      const message = await outreachService.generateOutreach({
        candidateId: req.body.candidateId,
        opportunityDescription: req.body.opportunityDescription,
        tone: req.body.tone || 'casual',
        channel: req.body.channel || 'email'
      });
      res.json(message);
    } catch (error) {
      console.error('[TalentMatch] Generate outreach error:', error);
      res.status(500).json({ message: 'Failed to generate outreach' });
    }
  });

  app.post("/api/talent-match/outreach/sequence", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const outreachService = new AIOutreachGenerator();
      const sequenceId = await outreachService.createFollowUpSequence({
        userId: req.user!.id,
        candidateId: req.body.candidateId,
        opportunityDescription: req.body.opportunityDescription,
        initialMessage: req.body.initialMessage
      });
      res.json({ sequenceId });
    } catch (error) {
      console.error('[TalentMatch] Create sequence error:', error);
      res.status(500).json({ message: 'Failed to create follow-up sequence' });
    }
  });

  app.post("/api/talent-match/pipeline", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const [candidate] = await db.insert(candidatePipelines).values({
        userId: req.user!.id,
        candidateId: req.body.candidateId,
        opportunityId: req.body.opportunityId,
        stage: req.body.stage || 'contacted',
        source: req.body.source,
        notes: req.body.notes,
        rating: req.body.rating
      }).returning();
      res.json(candidate);
    } catch (error) {
      console.error('[TalentMatch] Create pipeline error:', error);
      res.status(500).json({ message: 'Failed to add to pipeline' });
    }
  });

  app.get("/api/talent-match/pipeline", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const pipeline = await db.select()
        .from(candidatePipelines)
        .where(eq(candidatePipelines.userId, req.user!.id));
      res.json(pipeline);
    } catch (error) {
      console.error('[TalentMatch] Get pipeline error:', error);
      res.status(500).json({ message: 'Failed to fetch pipeline' });
    }
  });

  // ============================================================================
  // PRIVACY & SECURITY HUB
  // ============================================================================

  app.post("/api/privacy/virtual-email", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const emailService = new VirtualEmailService();
      const email = await emailService.createVirtualEmail({
        userId: req.user!.id,
        label: req.body.label,
        forwardTo: req.body.forwardTo
      });
      res.json(email);
    } catch (error) {
      console.error('[Privacy] Create virtual email error:', error);
      res.status(500).json({ message: 'Failed to create virtual email' });
    }
  });

  app.get("/api/privacy/virtual-emails", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const emailService = new VirtualEmailService();
      const emails = await emailService.getUserVirtualEmails(req.user!.id);
      res.json(emails);
    } catch (error) {
      console.error('[Privacy] Get virtual emails error:', error);
      res.status(500).json({ message: 'Failed to fetch virtual emails' });
    }
  });

  app.delete("/api/privacy/virtual-email/:emailId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const emailService = new VirtualEmailService();
      await emailService.deleteVirtualEmail(parseInt(req.params.emailId), req.user!.id);
      res.json({ success: true });
    } catch (error) {
      console.error('[Privacy] Delete virtual email error:', error);
      res.status(500).json({ message: 'Failed to delete virtual email' });
    }
  });

  app.post("/api/privacy/virtual-email/:emailId/toggle", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const emailService = new VirtualEmailService();
      if (req.body.isActive) {
        await emailService.enableVirtualEmail(parseInt(req.params.emailId));
      } else {
        await emailService.disableVirtualEmail(parseInt(req.params.emailId));
      }
      res.json({ success: true });
    } catch (error) {
      console.error('[Privacy] Toggle virtual email error:', error);
      res.status(500).json({ message: 'Failed to toggle virtual email' });
    }
  });

  app.post("/api/privacy/dark-web-scan", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const monitoringService = new DarkWebMonitoringService();
      const result = await monitoringService.scanUserData(req.user!.id);
      res.json(result);
    } catch (error) {
      console.error('[Privacy] Dark web scan error:', error);
      res.status(500).json({ message: 'Failed to scan dark web' });
    }
  });

  app.get("/api/privacy/security-alerts", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const monitoringService = new DarkWebMonitoringService();
      const unreadOnly = req.query.unreadOnly === 'true';
      const alerts = await monitoringService.getUserSecurityAlerts(req.user!.id, unreadOnly);
      res.json(alerts);
    } catch (error) {
      console.error('[Privacy] Get security alerts error:', error);
      res.status(500).json({ message: 'Failed to fetch security alerts' });
    }
  });

  app.post("/api/privacy/security-alert/:alertId/read", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const monitoringService = new DarkWebMonitoringService();
      await monitoringService.markAlertAsRead(parseInt(req.params.alertId), req.user!.id);
      res.json({ success: true });
    } catch (error) {
      console.error('[Privacy] Mark alert as read error:', error);
      res.status(500).json({ message: 'Failed to mark alert as read' });
    }
  });

  console.log('[Server] ✅ AI Services Consolidation routes loaded successfully');

  return httpServer;
}
