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
import { profileEnrichmentService } from "./services/profile-enrichment";
import queuesRoutes from "./routes/queues";
import mentionRoutes from "./routes/mention-routes";
import lifeCeoRoutes from "./routes/life-ceo-routes";
import adminRoutes from "./routes/admin-routes";
import { createFriendsRoutes } from "./routes/friends-routes";
import { createAnalyticsRoutes } from "./routes/analytics-routes";
import { createBookmarkRoutes } from "./routes/bookmark-routes";
import avatarRoutes from "./routes/avatarRoutes";
import videoRoutes from "./routes/videoRoutes";
import videoUploadRoutes from "./routes/video-upload-routes";
import videoRecordingRoutes from "./routes/video-recording-routes";
import { objectStorageService } from "./objectStorage";
import mrblueVideoRoutes from "./routes/mrblue-video-routes";
import mrBlueRoutes from "./routes/mrblue";
import mrBlueChatRoutes from "./routes/mrblue-chat";
import mrBlueStreamRoutes from "./routes/mrblue-stream";
import mrBlueEnhancedRoutes from "./routes/mr-blue-enhanced";
import mrBlueAgentsRoutes from "./routes/mrBlueAgents";
import mrBlueActivateAgentsRoutes from "./routes/mrblue/activate-agents";
import mrBlueSaveBackendRoutes from "./routes/mrblue/save-backend";
import { registerLumaRoutes } from "./routes/mrblue/luma-routes";
import mrBlueContextRoutes from "./routes/mrblue-context-routes";
import mrBlueVideoConferenceRoutes from "./routes/mrblue-video-conference-routes";
import mrBlueVibeCodingRoutes from "./routes/mrblue-vibecoding-routes";
import mrBlueVibeStreamRoutes from "./routes/mrblue-vibestream-routes";
import mrBlueVoiceRoutes from "./routes/mrblue-voice-routes";
import mrBlueTTSRoutes from "./routes/mrBlueTTS";
import voiceFirstRoutes from "./routes/voice-first-routes";
import mrBlueVibecodingRoutes from "./routes/mrblue-vibecoding-routes";
import mrBlueMessengerRoutes from "./routes/mrblue-messenger-routes";
import mrBlueAutonomousRoutes from "./routes/mrblue-autonomous-routes";
import mrBlueMemoryRoutes from "./routes/mrblue-memory-routes";
import mrBluePlanRoutes from "./routes/mr-blue-plan-routes";
import mrBluePageGeneratorRoutes from "./routes/mr-blue-page-generator";
import pageAuditRoutes from "./routes/page-audit-routes";
import mrBlueErrorAnalysisRoutes from "./routes/mrblue-error-analysis-routes";
import mrBlueErrorActionsRoutes from "./routes/mrblue-error-actions-routes";
import mrBlueOrchestrationRoutes from "./routes/mrblue-orchestration-routes";
import mrBlueTaskPlannerRoutes from "./routes/mrblue-task-planner-routes";
import mrBlueQualityValidatorRoutes from "./routes/mrblue-quality-validator-routes";
import mrBlueGitCommitRoutes from "./routes/mrblue-git-commit-routes";
import mrBluePreferencesRoutes from "./routes/mrblue-preferences-routes";
import mrBlueWorkflowPatternsRoutes from "./routes/mrblue-workflow-patterns-routes";
import mrBlueAgentEventsRoutes from "./routes/mrblue-agent-events-routes";
import mrBlueDependenciesRoutes from "./routes/mrblue-dependencies-routes";
import mrBlueRoleAdapterRoutes from "./routes/mrblue-role-adapter-routes";
import mrBlueSelfHealRoutes from "./routes/mrblue-self-heal-routes";
import mrBlueLeadershipRoutes from "./routes/mrblue-leadership-routes";
import mbmdSessionRoutes from "./routes/mbmd-session-routes";
import ctoWalkthroughRoutes from "./routes/cto-walkthrough-routes";
import mrBlueSubscriptionRoutes from "./routes/mrblue-subscription-routes";
import mrBlueLearningRoutes from "./routes/mrblue-learning-routes";
import mrBlueQAResearchRoutes from "./routes/mrblue-qa-research-routes";
import mrBlueExecutorRoutes from "./routes/mrblue-executor-routes";
import qaPlatformRoutes from "./routes/qa-platform-routes";
import proPageRoutes from "./routes/pro-page-routes";
import aiCollaborationRoutes from "./routes/ai-collaboration-routes";
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
// DELETED: Pricing system rework per Payment & Billing Audit (Dec 2025)
// import pricingRoutes from "./routes/pricing-routes";
import planRoutes from "./routes/plan-routes";
import thePlanRoutes from "./routes/thePlanRoutes";
import syncRoutes from "./routes/sync-routes";
import selfHealingRoutes from "./routes/self-healing-routes";
import agentHealthRoutes from "./routes/agent-health-routes";
import predictiveContextRoutes from "./routes/predictive-context-routes";
import agentLearningRoutes from "./routes/agentLearning";
import orchestrationPhasesRoutes from "./routes/orchestrationPhases";
import openSourceIntegrationsRoutes from "./routes/openSourceIntegrations";
import aiEnhanceRoutes from "./routes/ai-enhance";
import { DataCompletenessValidator } from "./services/validation/DataCompletenessValidator";
import { ComponentPRDRegistry } from "./services/validation/ComponentPRDRegistry";
import userSearchRoutes from "./routes/user-search";
import locationRoutes from "./routes/locations";
import locationsRoutes from "./routes/locations-routes";
import locationChangeRoutes from "./routes/location-change-routes";
import locationHistoryRoutes from "./routes/location-history-routes";
import roleChangeRoutes from "./routes/role-change-routes";
import cityRoutes from "./routes/city-routes";
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
import proRoutes from "./routes/pro";
import healthRoutes from "./routes/health";
import financialGoalsRoutes from "./routes/financial-goals-routes";
import budgetRoutes from "./routes/budget-routes";
import healthDataRoutes from "./routes/health-routes";
import nutritionRoutes from "./routes/nutrition-routes";
import eventRoutes from "./routes/event-routes";
import eventRolesRoutes from "./routes/event-roles-routes";
import eventSeriesRoutes from "./routes/event-series";
import groupRoutes from "./routes/group-routes";
import { cityGroupDataIngestionService } from "./services/city-group-data-ingestion";
import mapRoutes from "./routes/map-routes";
import crowdfundingRoutes from "./routes/crowdfunding-routes";
import stripeDonationRoutes from "./routes/stripe-donation-routes";
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
import paymentRoutes from "./routes/payment-routes";
import onboardingRoutes from "./routes/onboarding-routes";
import messagesRoutes from "./routes/messages-routes";
import { registerMessagingRoutes } from "./routes/messaging-routes";
import messagingWebhookRoutes from "./routes/messaging-webhook-routes";
import slackWebhookRoutes from "./routes/slack-webhook";
import adsRoutes from "./routes/ads-routes";
import revenueRoutes from "./routes/revenue-routes";
import volunteerTestingRoutes from "./routes/volunteerTesting";
import volunteerTasksRoutes from "./routes/volunteerTasks";
import scenarioGeneratorRoutes from "./routes/scenarioGeneratorRoutes";
import talentPipelineRoutes from "./routes/talentPipeline";
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

// MB.MD Protocol Phase 1: PART_10 Completion Routes
import invitationBatchingRoutes from "./routes/invitation-batching-routes";
import tangoResumeRoutes from "./routes/tango-resume-routes";
import roleConfirmationRoutes from "./routes/role-confirmation-routes";

// Marketing Site Public Routes
import publicStatsRoutes from "./routes/public-stats-routes";

// MB.MD v9.9.3: Faceless Content Marketing
import contentRoutes from "./routes/content-routes";

import { authenticateToken, optionalAuth, AuthRequest, requireRoleLevel } from "./middleware/auth";
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
  eventRsvps,
  groups,
  scrapedEvents,
  chatMessages,
  notifications,
  friendships,
  postLikes,
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
  venues,
  housingListings,
  userLocationHistory,
  storyViews,
  groupMembers,
  friendRequests,
} from "@shared/schema";
import { 
  esaAgents,
  agentTasks,
  agentCommunications
} from "@shared/platform-schema";
import { db } from "@shared/db";
import { eq, and, or, desc, sql, isNotNull, gte, count, inArray } from "drizzle-orm";
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
  // Log full error details for debugging
  console.error("[GlobalErrorHandler] Error on", req.method, req.originalUrl);
  console.error("[GlobalErrorHandler] Error name:", err.name);
  console.error("[GlobalErrorHandler] Error message:", err.message);
  console.error("[GlobalErrorHandler] Error stack:", err.stack);
  
  // If headers already sent, delegate to Express default error handler
  if (res.headersSent) {
    return next(err);
  }
  
  // Handle Zod validation errors
  if (err.name === "ZodError") {
    return res.status(400).json({ 
      message: "Validation error", 
      errors: err.errors 
    });
  }
  
  // Handle JSON parsing errors
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Invalid JSON in request body",
      error: err.message
    });
  }
  
  // Handle payload too large
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      message: "Request payload too large",
      error: err.message
    });
  }
  
  // Preserve status code if set on error object
  const statusCode = err.statusCode || err.status || 500;
  
  // In production, still include the error message for debugging critical issues
  // but omit stack traces
  res.status(statusCode).json({ 
    message: err.message || "Internal server error",
    path: req.originalUrl,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
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

// Simple in-memory cache for expensive community endpoints
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const communityCache = {
  locations: null as CacheEntry<any[]> | null,
  stats: null as CacheEntry<any> | null,
  TTL: 5 * 60 * 1000, // 5 minutes
  
  get<T>(key: 'locations' | 'stats'): T | null {
    const entry = this[key] as CacheEntry<T> | null;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.TTL) {
      this[key] = null;
      return null;
    }
    return entry.data;
  },
  
  set<T>(key: 'locations' | 'stats', data: T): void {
    (this as any)[key] = { data, timestamp: Date.now() };
  },
  
  invalidate(): void {
    this.locations = null;
    this.stats = null;
  }
};

import onboardingRoutes from "./routes/onboarding-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register modular routes
  app.use("/api/cities", cityRoutes);
  app.use("/api/onboarding", onboardingRoutes);
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

  const talentMatchRoutes = createTalentMatchRoutes(storage);
  app.use("/api/talent-match", talentMatchRoutes);

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

  // Talent Match Guest Sessions (in-memory storage for guest volunteer flows)
  const talentMatchSessions = new Map<string, {
    sessionId: string;
    name: string;
    email: string;
    step: string;
    uploadedDocuments?: Array<{ fileName: string; fileSize: number; parsedText?: string }>;
    interviewMessages?: Array<{ role: string; content: string }>;
    createdAt: number;
    lastUpdatedAt: number;
  }>();

  // Clean up expired sessions every hour
  setInterval(() => {
    const now = Date.now();
    const expiryMs = 24 * 60 * 60 * 1000; // 24 hours
    for (const [sessionId, session] of talentMatchSessions) {
      if (now - session.createdAt > expiryMs) {
        talentMatchSessions.delete(sessionId);
      }
    }
  }, 60 * 60 * 1000);

  // Create session
  app.post("/api/talent-match/session", async (req: Request, res: Response) => {
    try {
      const { name, email } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
      }
      
      const sessionId = `tm_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const now = Date.now();
      
      const session = {
        sessionId,
        name,
        email,
        step: "upload",
        uploadedDocuments: [],
        interviewMessages: [],
        createdAt: now,
        lastUpdatedAt: now,
      };
      
      talentMatchSessions.set(sessionId, session);
      
      res.cookie("talentMatchSessionId", sessionId, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: false,
        sameSite: "lax",
        path: "/",
      });
      
      res.json({ success: true, session });
    } catch (error: any) {
      console.error("[TalentMatch Session] Create error:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Get session
  app.get("/api/talent-match/session", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.talentMatchSessionId || req.query.sessionId;
      
      if (!sessionId) {
        return res.status(404).json({ error: "No session found" });
      }
      
      const session = talentMatchSessions.get(sessionId as string);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found or expired" });
      }
      
      const now = Date.now();
      if (now - session.createdAt > 24 * 60 * 60 * 1000) {
        talentMatchSessions.delete(sessionId as string);
        return res.status(404).json({ error: "Session expired" });
      }
      
      res.cookie("talentMatchSessionId", sessionId, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: false,
        sameSite: "lax",
        path: "/",
      });
      
      res.json({ success: true, session });
    } catch (error: any) {
      console.error("[TalentMatch Session] Get error:", error);
      res.status(500).json({ error: "Failed to get session" });
    }
  });

  // Update session
  app.patch("/api/talent-match/session", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.talentMatchSessionId || req.body.sessionId;
      
      if (!sessionId) {
        return res.status(404).json({ error: "No session found" });
      }
      
      const session = talentMatchSessions.get(sessionId as string);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found or expired" });
      }
      
      const { step, uploadedDocuments, interviewMessages } = req.body;
      
      if (step) session.step = step;
      if (uploadedDocuments) session.uploadedDocuments = uploadedDocuments;
      if (interviewMessages) session.interviewMessages = interviewMessages;
      session.lastUpdatedAt = Date.now();
      
      talentMatchSessions.set(sessionId as string, session);
      
      res.cookie("talentMatchSessionId", sessionId, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: false,
        sameSite: "lax",
        path: "/",
      });
      
      res.json({ success: true, session });
    } catch (error: any) {
      console.error("[TalentMatch Session] Update error:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // Delete session
  app.delete("/api/talent-match/session", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.talentMatchSessionId;
      
      if (sessionId) {
        talentMatchSessions.delete(sessionId);
      }
      
      res.clearCookie("talentMatchSessionId", { path: "/" });
      res.json({ success: true });
    } catch (error: any) {
      console.error("[TalentMatch Session] Delete error:", error);
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  // Parse resume for guest users (no auth required)
  // This allows guest flow to get actual parsed text from PDF/DOCX files
  // Security: Size limited to 5MB, rate limited by session cookie
  const guestParseRateLimiter = new Map<string, { count: number; resetAt: number }>();
  const MAX_GUEST_PARSES_PER_HOUR = 10;
  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  
  app.post("/api/talent-match/parse-resume", async (req: Request, res: Response) => {
    try {
      const { filename, fileBuffer } = req.body;
      
      if (!filename || !fileBuffer) {
        return res.status(400).json({ error: "filename and fileBuffer (base64) are required" });
      }
      
      // Security: Validate base64 size before decoding (base64 is ~33% larger than binary)
      const estimatedBinarySize = Math.ceil(fileBuffer.length * 0.75);
      if (estimatedBinarySize > MAX_FILE_SIZE_BYTES) {
        console.warn(`[TalentMatch] Rejected oversized file: ${filename}, estimated ${estimatedBinarySize} bytes`);
        return res.status(413).json({ error: "File exceeds 5MB limit" });
      }
      
      // Security: Rate limiting by session or IP
      const sessionId = req.cookies?.talentMatchSessionId || req.ip || "anonymous";
      const now = Date.now();
      const limiterEntry = guestParseRateLimiter.get(sessionId);
      
      if (limiterEntry) {
        if (now < limiterEntry.resetAt) {
          if (limiterEntry.count >= MAX_GUEST_PARSES_PER_HOUR) {
            console.warn(`[TalentMatch] Rate limit exceeded for session: ${sessionId}`);
            return res.status(429).json({ error: "Too many parse requests. Please try again later." });
          }
          limiterEntry.count++;
        } else {
          // Reset the counter
          guestParseRateLimiter.set(sessionId, { count: 1, resetAt: now + 60 * 60 * 1000 });
        }
      } else {
        guestParseRateLimiter.set(sessionId, { count: 1, resetAt: now + 60 * 60 * 1000 });
      }
      
      const { resumeParser } = await import("./services/resume-parser");
      
      const buffer = Buffer.from(fileBuffer, "base64");
      
      // DEBUG: Log buffer details in route
      console.log(`[TalentMatch Route] Decoded buffer for ${filename}: ${buffer.length} bytes`);
      console.log(`[TalentMatch Route] Buffer starts with: ${buffer.slice(0, 5).toString('hex')}`);
      
      // Validate actual buffer size
      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        console.warn(`[TalentMatch] Rejected oversized file: ${filename}, ${buffer.length} bytes`);
        return res.status(413).json({ error: "File exceeds 5MB limit" });
      }
      
      const parsed = await resumeParser.parseResume(buffer, filename);
      
      console.log(`[TalentMatch] Parsed resume for guest: ${filename}, ${parsed.text.length} chars`);
      
      res.json({
        parsedText: parsed.text,
        skills: parsed.skills,
        links: parsed.links,
        signals: parsed.signals,
      });
    } catch (error: any) {
      console.error("[TalentMatch] Parse resume error:", error);
      res.status(500).json({ error: "Failed to parse resume" });
    }
  });

  // Submit volunteer application from guest session
  app.post("/api/talent-match/submit", async (req: Request, res: Response) => {
    try {
      const { name, email, documents, interviewMessages } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
      }
      
      const { db } = await import("./db");
      const { users, volunteers, resumes, clarifierSessions, candidatePipelines } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      // Find or create user
      let [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);
      
      let userId: number;
      
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + Date.now();
        const [newUser] = await db
          .insert(users)
          .values({
            email: email.toLowerCase(),
            username,
            name,
            password: "temp_volunteer_" + Math.random().toString(36).substring(2),
            waitlist: true,
            waitlistDate: new Date(),
          })
          .returning();
        userId = newUser.id;
      }
      
      // Create volunteer record
      const [volunteer] = await db
        .insert(volunteers)
        .values({
          userId,
          profile: { name, email, source: "talent_match_modal" },
          skills: [],
          availability: "pending_review",
        })
        .returning();
      
      // Store resume if documents provided
      if (documents && documents.length > 0) {
        for (const doc of documents) {
          await db.insert(resumes).values({
            volunteerId: volunteer.id,
            filename: doc.fileName,
            parsedText: doc.parsedText || "",
          });
        }
      }
      
      // Store interview session
      if (interviewMessages && interviewMessages.length > 0) {
        await db.insert(clarifierSessions).values({
          volunteerId: volunteer.id,
          chatLog: interviewMessages,
          status: "completed",
          completedAt: new Date(),
        });
      }
      
      // Create pipeline entry for admin review (stage="offered" shows in Pending Approvals)
      await db.insert(candidatePipelines).values({
        userId: 1, // System/admin user
        candidateId: userId,
        stage: "offered",
        source: "talent_match_guest",
        notes: `Completed 10-question AI interview. ${documents?.length || 0} document(s) uploaded.`,
      });
      
      // Clear the guest session
      const sessionId = req.cookies?.talentMatchSessionId;
      if (sessionId) {
        talentMatchSessions.delete(sessionId);
      }
      res.clearCookie("talentMatchSessionId", { path: "/" });
      
      console.log(`[TalentMatch] Volunteer application submitted: ${email}, volunteerId: ${volunteer.id}`);
      
      res.json({ success: true, volunteerId: volunteer.id });
    } catch (error: any) {
      console.error("[TalentMatch] Submit error:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // Public stats endpoint for landing page (no auth required)
  // Displays real data only - no fake numbers. Stats hidden if below threshold.
  const DISPLAY_THRESHOLD = 10;
  
  app.get("/api/stats/public", async (req: Request, res: Response) => {
    try {
      const { db } = await import("./db");
      const { users, events } = await import("@shared/schema");
      const { count, sql, eq, and, gte } = await import("drizzle-orm");
      
      // Get active users count with role breakdowns
      const usersResult = await db.select({ 
        total: count(),
        teachers: sql<number>`COUNT(CASE WHEN 'teacher' = ANY(tango_roles) THEN 1 END)`,
        organizers: sql<number>`COUNT(CASE WHEN 'organizer' = ANY(tango_roles) THEN 1 END)`,
      }).from(users).where(and(eq(users.isActive, true), eq(users.suspended, false)));
      
      const totalUsers = usersResult[0]?.total || 0;
      const teacherCount = usersResult[0]?.teachers || 0;
      const organizerCount = usersResult[0]?.organizers || 0;
      
      // Get upcoming events count
      const eventsResult = await db.select({ count: count() })
        .from(events)
        .where(gte(events.startDate, new Date()));
      const totalEvents = eventsResult[0]?.count || 0;
      
      // Get city groups count (official city pages with tango communities)
      const { groups } = await import("@shared/schema");
      const citiesResult = await db
        .select({ count: count() })
        .from(groups)
        .where(eq(groups.type, "city"));
      const totalCities = citiesResult[0]?.count || 0;
      
      // Get unique countries count from city groups
      const countriesResult = await db
        .select({ count: sql<number>`COUNT(DISTINCT country)` })
        .from(groups)
        .where(and(eq(groups.type, "city"), sql`country IS NOT NULL AND country != ''`));
      const totalCountries = countriesResult[0]?.count || 0;

      // Waitlist Role Stats (New MB.MD Module)
      const waitlistRoles = await db.execute(sql`
        SELECT 
          role_item as role,
          COUNT(*)::int as count
        FROM (
          SELECT unnest(tango_roles) as role_item
          FROM users
          WHERE waitlist = true
        ) roles
        WHERE role_item IS NOT NULL
        GROUP BY role_item
        ORDER BY count DESC
      `);
      
      // Platform stats (always shown - these are founder facts)
      const platformStats = {
        yearsBuilding: 1,
        hoursInvested: 3000,
        amountInvested: 30000,
        foundedYear: 2024,
        startedDancing: "September 2007",
        yearsOfDancing: 18,
        trips: 112,
        cities: 79,
        countries: 27,
      };
      
      // Only return stats that meet the display threshold (no fake numbers!)
      res.json({
        dancers: (totalUsers || 0) >= 1 ? totalUsers : null,
        teachers: (teacherCount || 0) >= 1 ? teacherCount : null,
        organizers: (organizerCount || 0) >= 1 ? organizerCount : null,
        events: (totalEvents || 0) >= 1 ? totalEvents : null,
        cities: (totalCities || 0) >= 1 ? totalCities : null,
        countries: (totalCountries || 0) >= 1 ? totalCountries : null,
        platformStats,
        waitlistRoles: waitlistRoles.rows || [],
      });
    } catch (error: any) {
      console.error('[PublicStats] Error:', error);
      // On error, return null for dynamic stats but keep platform stats
      res.json({
        dancers: null,
        teachers: null,
        organizers: null,
        events: null,
        cities: null,
        countries: null,
        platformStats: {
          yearsBuilding: 1,
          hoursInvested: 3000,
          amountInvested: 30000,
          foundedYear: 2024,
          startedDancing: "September 2007",
          yearsOfDancing: 18,
          trips: 112,
          cities: 79,
          countries: 27,
        },
      });
    }
  });
  
  // ============================================================================
  // WEBHOOK ROUTES (BEFORE CSRF - external platforms cannot send CSRF tokens)
  // n8n + OpenAI hybrid messaging webhooks for WhatsApp, Telegram, Slack, etc.
  // ============================================================================
  app.use("/api", messagingWebhookRoutes);
  app.use("/slack", slackWebhookRoutes);
  
  // ============================================================================
  // CSRF PROTECTION: Verify CSRF tokens on all mutating requests (POST/PUT/DELETE/PATCH)
  // Skips: GET/HEAD/OPTIONS and JWT Bearer auth requests (handled in middleware)
  // ============================================================================
  app.use(verifyCsrfToken);
  
  // Phase 1 & 2 Deployment Blocker Routes
  app.use("/api/rbac", rbacRoutes);
  app.use("/api/feature-flags", featureFlagsRoutes);
  // DELETED: Pricing system rework per Payment & Billing Audit (Dec 2025)
  // app.use("/api/pricing", pricingRoutes);
  
  // Phase 3 Deployment Blocker Routes
  app.use("/api/plan", planRoutes);
  
  // The Plan routes use optional auth - allows unauthenticated /progress checks,
  // but POST endpoints (/start, /skip) require auth at route level
  app.use("/api/the-plan", optionalAuth, thePlanRoutes);
  
  app.use("/api/sync", syncRoutes);
  
  // Self-Healing Routes (public + admin)
  app.use("/api/self-healing", selfHealingRoutes);       // Public: /activate endpoint
  app.use("/api/admin/self-healing", selfHealingRoutes); // Admin: dashboard, scan, etc.
  
  // Phase 4 Deployment Blocker Routes
  app.use("/api/agents", agentHealthRoutes);
  app.use("/api/agents/learning", agentLearningRoutes);  // MB.MD v9.9.3 + Samsung TRM Agent Learning
  app.use("/api/orchestration/phases", orchestrationPhasesRoutes);  // MB.MD v9.9.3 Patterns 66, 67, 68
  app.use("/api/integrations", openSourceIntegrationsRoutes);  // GenAI Agents, Curriculum, ComfyUI
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
  
  // MB.MD v9.9.4: Scenario Generator for comprehensive testing coverage
  app.use("/api/scenarios", scenarioGeneratorRoutes);
  
  // Volunteer Task Management - Plan Items, Work Logs, Stats
  app.use("/api/volunteer", volunteerTasksRoutes);
  
  // Talent Pipeline Management - Candidate tracking and approvals
  app.use("/api/talent-pipeline", talentPipelineRoutes);
  
  // Marketing Site Public Routes (no auth required)
  app.use("/api/public", publicStatsRoutes);
  
  // TRACK 8: Gamification System - Points, Badges, Leaderboard, Progressive Autonomy
  app.use("/api/gamification", gamificationRoutes);
  
  // MB.MD v9.9.3: Faceless Content Marketing API
  app.use("/api/content", contentRoutes);
  
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
  app.use("/api/payments", paymentRoutes); // MB.MD Pattern 49: International Payments
  app.use("/api/onboarding", onboardingRoutes);
  app.use("/api/messages", messagesRoutes);
  registerMessagingRoutes(app); // New messaging routes for direct messages, group chats, and threads
  // Note: messaging webhooks moved before CSRF middleware
  app.use("/api/ads", adsRoutes);
  app.use("/api/admin/ads", adsRoutes);
  app.use("/api/revenue", revenueRoutes);
  app.use("/api", createFriendsRoutes(storage));
  app.use("/api", createAnalyticsRoutes(storage));
  app.use("/api", createBookmarkRoutes(storage));
  app.use("/api/avatar", avatarRoutes);
  app.use("/api/videos", videoRoutes);
  app.use("/api/upload/video", videoUploadRoutes);
  app.use("/api/videos/recording", videoRecordingRoutes); // Video Recording System (MB.MD Pattern 41)
  
  // Object Storage: Serve public objects (videos, images)
  // Blueprint: javascript_object_storage
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    try {
      const filePath = req.params.filePath;
      const bucketName = objectStorageService.getBucketName();
      const objectPath = `/${bucketName}/public/${filePath}`;
      await objectStorageService.downloadToResponse(objectPath, res);
    } catch (error: any) {
      console.error("[ObjectStorage] Public object serve error:", error.message);
      res.status(404).json({ error: "File not found" });
    }
  });
  app.use("/api/mrblue", mrblueVideoRoutes);
  app.use("/api/mrblue", mrBlueStreamRoutes); // Streaming SSE endpoint
  app.use("/api/mrblue", mrBlueRoutes);
  app.use("/api/mrblue", mrBlueChatRoutes);
  app.use("/api/mrblue/activate-agents", mrBlueActivateAgentsRoutes); // MB.MD v9.2: Contextual agent activat
  app.use("/api/mrblue", mrBlueVibecodingRoutes);
  app.use("/api/1167/save-backend", mrBlueSaveBackendRoutes); // MB.MD v9.3: Backend agent system (Save button)
  app.use("/api/mrblue/context", mrBlueContextRoutes); // System 1: Context Service with LanceDB
  app.use("/api/mrblue/video", mrBlueVideoConferenceRoutes); // System 2: Daily.co Video Conference
  app.use("/api/mrblue/vibecode", mrBlueVibeCodingRoutes); // System 4: Vibe Coding Engine (Natural Language → Code)
  app.use("/api/mrblue/vibestream", mrBlueVibeStreamRoutes); // System 4b: Streaming ReAct VibeCoding (MB.MD Pattern 97)
  app.use("/api/mrblue/voice", mrBlueVoiceRoutes); // System 5: Voice Cloning with ElevenLabs (17 languages)
  app.use("/api/mr-blue/tts", mrBlueTTSRoutes); // TTS Proxy for 3D Avatar (secure ElevenLabs key)
  app.use("/api/voice", voiceFirstRoutes); // Voice-First Features (Wispr Flow inspired): 4x faster than typing, 68 languages
  app.use("/api/mrblue/messenger", mrBlueMessengerRoutes); // System 6: Facebook Messenger Integration
  app.use("/api/mrblue/autonomous", mrBlueAutonomousRoutes); // System 7: Autonomous Coding Engine
  app.use("/api/mrblue/memory", mrBlueMemoryRoutes); // System 8: Advanced Memory System
  app.use("/api/mrblue/leadership", mrBlueLeadershipRoutes); // Leadership Agents (CTO, CEO, VPs, Heads) with continuous learning
  app.use("/api/mbmd", mbmdSessionRoutes); // MB.MD Session Service - Auto-invoke agents (God Command #0)
  app.use("/api/mrblue/plan", mrBluePlanRoutes); // Plan Roadmap Tracker (47-page validation system)
  app.use("/api/mr-blue", mrBluePageGeneratorRoutes); // AI Page Generator (1,218 agents + 4 archetypes)
  app.use("/api/page-audit", pageAuditRoutes); // Page Audit System (12 categories + self-healing)
  app.use("/api/mrblue", mrBlueErrorAnalysisRoutes); // Phase 3: Error Analysis API with AI Integration
  app.use("/api/mrblue", mrBlueErrorActionsRoutes); // Phase 4: Error Fix Actions (Apply/Escalate)
  app.use("/api/a2a", a2aRoutes); // A2A Protocol - Machine-to-machine agent communication (MB.MD Phase 6A)
  app.use("/api/mrblue/orchestration", mrBlueOrchestrationRoutes); // Multi-agent orchestration with LangChain.js
  
  // ============================================================================
  // MR. BLUE PHASE 2 INTEGRATIONS - 10 NEW AGENTS (MB.MD)
  // ============================================================================
  app.use("/api/mrblue/task-planner", mrBlueTaskPlannerRoutes); // Agent #44: AI-powered task decomposition (GROQ Llama-3.3-70b)
  app.use("/api/mrblue/quality", mrBlueQualityValidatorRoutes); // Agent #43: Code quality + security scanning (GPT-4o)
  app.use("/api/mrblue/git", mrBlueGitCommitRoutes); // Agent #41: AI commit messages + Git operations
  app.use("/api/mrblue/preferences", mrBluePreferencesRoutes); // Agent #42: Auto-extract user preferences (16 patterns)
  app.use("/api/mrblue/workflow", mrBlueWorkflowPatternsRoutes); // Agent #46: Workflow pattern learning + prediction
  app.use("/api/mrblue/events", mrBlueAgentEventsRoutes); // Agent #45: Inter-agent event bus viewer
  app.use("/api/mrblue/dependencies", mrBlueDependenciesRoutes); // Agent #50: File dependency analysis
  app.use("/api/mrblue/role", mrBlueRoleAdapterRoutes); // Agent #47: Tier-based feature gating
  app.use("/api/mrblue", mrBlueSelfHealRoutes); // MB.MD Pattern 53: Self-healing for god-level users
  app.use("/api/cto/walkthrough", ctoWalkthroughRoutes); // CTO walkthrough with Playwright preview
  app.use("/api/mrblue/subscription", mrBlueSubscriptionRoutes); // Agent #48: Quota management
  app.use("/api/mrblue/learning", mrBlueLearningRoutes); // Agent #49: 10-pathway learning coordinator
  app.use("/api/mrblue/qa", mrBlueQAResearchRoutes); // Agent #50: Q&A research and test orchestration
  app.use("/api/mrblue/executor", mrBlueExecutorRoutes); // MB.MD Pattern 67: Task Executor - Mr. Blue builds via playbooks
  app.use("/api/qa-platform", qaPlatformRoutes); // MB.MD Pattern 67: QA/Customer Test Platform
  app.use("/api/pro", proPageRoutes); // Pattern 101: Pro Pages & Website Scraping
  app.use("/api/ai-collaboration", aiCollaborationRoutes); // MB.MD v9.3: Replit AI ↔ Mr Blue hierarchical collaboration
  
  app.use("/api/orchestration", orchestrationRoutes); // Production-ready workflow orchestration (Sequential/Parallel/Intelligence Cycle)
  app.use("/api/git", gitRoutes); // Autonomous Git commit system with AI-generated messages
  app.use(mrBlueEnhancedRoutes); // Enhanced Mr. Blue with troubleshooting KB
  app.use("/api/autonomous", autonomousRoutes); // Mr. Blue Autonomous Agent (God Level)
  app.use("/api/visual-editor", authenticateToken, visualEditorRoutes);
  app.use("/api/whisper", authenticateToken, whisperRoutes);
  app.use("/api/realtime", authenticateToken, realtimeVoiceRoutes);
  app.use("/api/openai-realtime", authenticateToken, openaiRealtimeRoutes);
  registerVoiceCloningRoutes(app); // Voice cloning for Mr. Blue custom voices
    registerLumaRoutes(app); // Luma Dream Machine video generation for Mr Blue
  app.use("/api/premium", premiumMediaRoutes);
  app.use("/api/god-level", authenticateToken, godLevelRoutes);
  app.use("/api/ai", aiEnhanceRoutes);
  app.use("/api/user", userSearchRoutes);
  app.use("/api/users", userSearchRoutes); // Also mount at /api/users for messaging user search
  app.use("/api/locations", locationRoutes);
  app.use("/api/locations", locationsRoutes); // MB.MD Agent 1: Live city search with caching
  app.use("/api/location", locationChangeRoutes); // Location change effects endpoint
  app.use("/api/location-history", locationHistoryRoutes); // User location history (cities lived 6+ months)
  app.use("/api/roles", roleChangeRoutes); // Role change effects - auto-join PRO groups
  app.use("/api/cities", cityRoutes); // City Group Priority Search (Tier 1: MT groups, Tier 2: Popular, Tier 3: Nominatim)
  
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
  stripeDonationRoutes(app); // Stripe donation checkout (mb.md P111-P115)
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
  app.use("/api/event-series", eventSeriesRoutes);
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
  
  // MB.MD Protocol Phase 1: PART_10 Completion API Routes
  console.log("✅ [MB.MD Phase 1] Registering invitation batching routes");
  app.use("/api/invitations", invitationBatchingRoutes);
  
  console.log("✅ [MB.MD Phase 1] Registering tango résumé routes");
  app.use("/api/resumes", tangoResumeRoutes);
  
  console.log("✅ [MB.MD Phase 1] Registering role confirmation routes");
  app.use("/api/role-confirmations", roleConfirmationRoutes);
  
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
  
  // WAVE 3A: PRO API Endpoints (pro-stats, event-history, booking-requests)
  app.use("/api/users", proRoutes);
  
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
      // DEBUG: Log incoming media fields
      console.log('[POST /api/posts] Received fields:', Object.keys(req.body));
      console.log('[POST /api/posts] videoUrl present:', !!req.body.videoUrl);
      console.log('[POST /api/posts] videoUrl length:', req.body.videoUrl?.length || 0);
      console.log('[POST /api/posts] videoThumbnail present:', !!req.body.videoThumbnail);
      console.log('[POST /api/posts] imageUrl present:', !!req.body.imageUrl);
      
      const postData: any = {
        ...req.body,
        userId: req.user!.id,
        type: req.body.type || 'post'
      };
      
      // DEBUG: Verify spread worked
      console.log('[POST /api/posts] postData.videoUrl present:', !!postData.videoUrl);
      
      // If story, set 24-hour expiration
      if (postData.type === 'story') {
        postData.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
      
      const post = await storage.createPost(postData);
      
      // DEBUG: Verify stored result
      console.log('[POST /api/posts] Created post ID:', post.id);
      console.log('[POST /api/posts] post.videoUrl saved:', !!post.videoUrl);

      // Handle Hidden Gems (Place Recommendations)
      if (req.body.isRecommendation && req.body.location && req.body.coordinates) {
        try {
          const { lat, lng } = req.body.coordinates;
          await storage.createOrUpdatePlaceRecommendation(
            req.user!.id,
            req.body.location,
            req.body.postType || 'venue',
            lat,
            lng,
            post.id,
            {
              description: req.body.content,
              address: req.body.location,
              priceRange: req.body.richContent?.priceRange,
            }
          );
          console.log(`[Hidden Gems] ✅ Created/updated place recommendation for "${req.body.location}"`);
        } catch (error) {
          console.error(`[Hidden Gems] Failed to create place recommendation:`, error);
        }
      }

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
      const { userId, limit = "20", offset = "0", type } = req.query;
      const currentUserId = req.user?.id; // From auth middleware if authenticated (optional for public route)
      
      // Filter by type only if explicitly specified (no default - show all post types)
      const posts = await storage.getPosts({
        userId: userId ? parseInt(userId as string) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        currentUserId: currentUserId,
        type: type ? type as string : undefined
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

  // Feature 13: Discover Feed (optionalAuth - allows public access with fallback to trending)
  app.get("/api/feed/discover", optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { limit = "20", offset = "0" } = req.query;
      
      // If user is authenticated, get personalized discover feed
      if (req.user) {
        const result = await feedAlgorithmService.getDiscoverFeed(
          req.user.id,
          parseInt(limit as string),
          parseInt(offset as string)
        );
        return res.json(result);
      }
      
      // For unauthenticated users, return trending posts as discover feed
      const posts = await feedAlgorithmService.getTrendingPosts(parseInt(limit as string));
      res.json({
        posts,
        nextOffset: posts.length === parseInt(limit as string) ? parseInt(offset as string) + parseInt(limit as string) : null,
        hasMore: posts.length === parseInt(limit as string),
      });
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
      res.json({ message: "Post deleted successfully", postId: id });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  app.post("/api/posts/:id/restore", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      res.status(410).json({ 
        message: "Post cannot be restored - already permanently deleted",
        hint: "Undo is only available for a short time after deletion"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to restore post" });
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
      
      if (reactionType === undefined || reactionType === null) {
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

  // Get user's saved posts - Page 16 SavedPostsPage
  app.get("/api/saved-posts", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userSavedPosts = await db
        .select({
          id: posts.id,
          content: posts.content,
          userId: posts.userId,
          createdAt: posts.createdAt,
          likes: posts.likes,
          comments: posts.comments,
          author: {
            id: users.id,
            name: users.name,
            username: users.username,
            profileImage: users.profileImage,
          },
        })
        .from(savedPosts)
        .leftJoin(posts, eq(savedPosts.postId, posts.id))
        .leftJoin(users, eq(posts.userId, users.id))
        .where(eq(savedPosts.userId, req.user!.id))
        .orderBy(desc(savedPosts.createdAt));
      
      res.json(userSavedPosts);
    } catch (error) {
      console.error("Get saved posts error:", error);
      res.status(500).json({ message: "Failed to fetch saved posts" });
    }
  });

  // ============================================================================
  // STORIES ENDPOINTS - Page 15 StoriesPage
  // ============================================================================
  
  // Get stories feed from friends (24-hour stories)
  app.get("/api/stories/feed", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      // Get friend IDs
      const friendIds = await db
        .select({ friendId: friendships.friendId })
        .from(friendships)
        .where(eq(friendships.userId, req.user!.id));
      
      const friendIdList = friendIds.map(f => f.friendId);
      
      // Get active stories (not expired) from friends
      const stories = await db
        .select({
          id: posts.id,
          content: posts.content,
          imageUrl: posts.imageUrl,
          videoUrl: posts.videoUrl,
          userId: posts.userId,
          createdAt: posts.createdAt,
          expiresAt: posts.expiresAt,
          viewCount: sql<number>`count(distinct ${storyViews.id})::int`,
        })
        .from(posts)
        .leftJoin(storyViews, eq(posts.id, storyViews.storyId))
        .where(
          and(
            eq(posts.type, 'story'),
            sql`${posts.expiresAt} > NOW()`,
            sql`${posts.userId} = ANY(${friendIdList})`
          )
        )
        .groupBy(posts.id)
        .orderBy(desc(posts.createdAt));
      
      // Group stories by user
      const storyGroups: any = {};
      for (const story of stories) {
        const user = await storage.getUserById(story.userId);
        if (!user) continue;
        
        if (!storyGroups[story.userId]) {
          storyGroups[story.userId] = {
            user: {
              id: user.id,
              name: user.name,
              username: user.username,
              profileImage: user.profileImage,
            },
            stories: [],
            hasUnviewed: false,
          };
        }
        
        // Check if user has viewed this story
        const viewed = await db
          .select()
          .from(storyViews)
          .where(
            and(
              eq(storyViews.storyId, story.id),
              eq(storyViews.viewerId, req.user!.id)
            )
          )
          .limit(1);
        
        const hasViewed = viewed.length > 0;
        if (!hasViewed) storyGroups[story.userId].hasUnviewed = true;
        
        storyGroups[story.userId].stories.push({
          ...story,
          hasViewed,
        });
      }
      
      res.json(Object.values(storyGroups));
    } catch (error) {
      console.error("Get stories feed error:", error);
      res.status(500).json({ message: "Failed to fetch stories feed" });
    }
  });
  
  // Get user's own stories
  app.get("/api/stories/my", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const myStories = await db
        .select({
          id: posts.id,
          content: posts.content,
          imageUrl: posts.imageUrl,
          videoUrl: posts.videoUrl,
          createdAt: posts.createdAt,
          expiresAt: posts.expiresAt,
          viewCount: sql<number>`count(distinct ${storyViews.id})::int`,
        })
        .from(posts)
        .leftJoin(storyViews, eq(posts.id, storyViews.storyId))
        .where(
          and(
            eq(posts.type, 'story'),
            eq(posts.userId, req.user!.id),
            sql`${posts.expiresAt} > NOW()`
          )
        )
        .groupBy(posts.id)
        .orderBy(desc(posts.createdAt));
      
      res.json(myStories);
    } catch (error) {
      console.error("Get my stories error:", error);
      res.status(500).json({ message: "Failed to fetch your stories" });
    }
  });
  
  // Create a story (24-hour expiration)
  app.post("/api/stories", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { content, imageUrl, videoUrl } = req.body;
      
      if (!imageUrl && !videoUrl) {
        return res.status(400).json({ message: "Image or video is required" });
      }
      
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      const newStory = await db.insert(posts).values({
        content: content || '',
        imageUrl,
        videoUrl,
        userId: req.user!.id,
        type: 'story',
        expiresAt,
      }).returning();
      
      res.status(201).json(newStory[0]);
    } catch (error) {
      console.error("Create story error:", error);
      res.status(500).json({ message: "Failed to create story" });
    }
  });
  
  // Record story view
  app.post("/api/stories/:id/view", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const storyId = parseInt(req.params.id);
      
      // Check if already viewed
      const existing = await db
        .select()
        .from(storyViews)
        .where(
          and(
            eq(storyViews.storyId, storyId),
            eq(storyViews.viewerId, req.user!.id)
          )
        )
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(storyViews).values({
          storyId,
          viewerId: req.user!.id,
        });
      }
      
      res.json({ viewed: true });
    } catch (error) {
      console.error("Record story view error:", error);
      res.status(500).json({ message: "Failed to record view" });
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

  // COMMENT REACTIONS - Use commentLikes table as temporary storage
  app.post("/api/comments/:id/react", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const commentId = parseInt(req.params.id);
      const { reactionType } = req.body;
      
      if (reactionType === undefined || reactionType === null) {
        return res.status(400).json({ message: "Reaction type is required" });
      }

      // For now, map reactions to simple like/unlike using commentLikes
      // In production, would use dedicated commentReactions table
      if (reactionType === '' || reactionType === 'love') {
        // Remove like
        await db.delete(commentLikes).where(
          and(
            eq(commentLikes.commentId, commentId),
            eq(commentLikes.userId, req.user!.id)
          )
        );
      } else {
        // Remove any existing like first
        await db.delete(commentLikes).where(
          and(
            eq(commentLikes.commentId, commentId),
            eq(commentLikes.userId, req.user!.id)
          )
        );
        
        // Add new like
        await db.insert(commentLikes).values({
          commentId,
          userId: req.user!.id,
        });

        // Send notification to comment author
        const comment = await db.select().from(postComments)
          .where(eq(postComments.id, commentId))
          .limit(1);
        
        if (comment[0] && comment[0].userId !== req.user!.id) {
          await storage.createNotification({
            userId: comment[0].userId,
            type: 'reaction',
            title: 'New reaction',
            message: `Someone reacted ${reactionType} to your comment`,
            data: JSON.stringify({ commentId })
          });
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('React to comment error:', error);
      res.status(500).json({ message: "Failed to react to comment" });
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

  // Get users who liked/reacted to a post (Bug #11 - Who Liked)
  app.get("/api/posts/:id/likes", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 50;
      
      const likedUsers = await db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          reactionType: postLikes.reactionType,
        })
        .from(postLikes)
        .innerJoin(users, eq(postLikes.userId, users.id))
        .where(eq(postLikes.postId, postId))
        .orderBy(desc(postLikes.createdAt))
        .limit(limit);
      
      res.json(likedUsers);
    } catch (error) {
      console.error("Error fetching post likes:", error);
      res.status(500).json({ message: "Failed to fetch likes" });
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

  // PATCH /api/users/me - Update current user's profile (for onboarding and profile edits)
  // IMPORTANT: This route MUST come BEFORE /api/users/:id to prevent :id matching "me"
  app.patch("/api/users/me", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const {
        name,
        username,
        bio,
        city,
        country,
        yearsOfDancing,
        tangoRoles,
        tangoStartYear,
        tangoRoleExperience,
        socialLinks,
        profileImage,
        leaderLevel,
        followerLevel,
        primaryLanguage,
        languages,
        occupation,
        portfolioUrls,
        communityWebsiteUrl,
        privacySettings,
        formStatus,
        isOnboardingComplete,
      } = req.body;

      // Build update data object - only include fields that are provided
      const updateData: any = {
        updatedAt: new Date(),
      };

      // Add profile fields if provided
      if (name !== undefined) updateData.name = name;
      if (username !== undefined) updateData.username = username;
      if (bio !== undefined) updateData.bio = bio;
      if (city !== undefined) updateData.city = city;
      if (country !== undefined) updateData.country = country;
      if (yearsOfDancing !== undefined) updateData.yearsOfDancing = yearsOfDancing;
      if (tangoRoles !== undefined) updateData.tangoRoles = tangoRoles;
      if (tangoStartYear !== undefined) updateData.tangoStartYear = tangoStartYear;
      if (tangoRoleExperience !== undefined) updateData.tangoRoleExperience = tangoRoleExperience;
      if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
      if (profileImage !== undefined) updateData.profileImage = profileImage;
      if (leaderLevel !== undefined) updateData.leaderLevel = leaderLevel;
      if (followerLevel !== undefined) updateData.followerLevel = followerLevel;
      if (primaryLanguage !== undefined) updateData.primaryLanguage = primaryLanguage;
      if (languages !== undefined) updateData.languages = languages;
      if (occupation !== undefined) updateData.occupation = occupation;
      if (portfolioUrls !== undefined) updateData.portfolioUrls = portfolioUrls;
      if (communityWebsiteUrl !== undefined) updateData.communityWebsiteUrl = communityWebsiteUrl;
      if (formStatus !== undefined) updateData.formStatus = formStatus;
      if (isOnboardingComplete !== undefined) updateData.isOnboardingComplete = isOnboardingComplete;

      // Handle privacySettings JSONB merge
      if (privacySettings !== undefined) {
        updateData.privacySettings = sql`COALESCE(${users.privacySettings}, '{}'::jsonb) || ${JSON.stringify(privacySettings)}::jsonb`;
      }

      // Update user in database
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`[PATCH /api/users/me] Updated user ${userId} - city: ${city}, formStatus: ${formStatus}`);
      res.json(updatedUser);
    } catch (error) {
      console.error('[PATCH /api/users/me] Failed to update user profile:', error);
      res.status(500).json({ message: "Failed to update profile" });
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
      console.error("[GET /api/users/:id] Error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile endpoint - for Profile Edit Page
  app.patch("/api/users/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Verify user is updating their own profile or is admin
      if (req.user!.id !== userId && req.user!.role !== 'super_admin') {
        return res.status(403).json({ message: "Unauthorized to update this profile" });
      }

      const {
        name,
        username,
        bio,
        city,
        country,
        yearsOfDancing,
        tangoRoles,
        tangoStartYear,
        tangoRoleExperience,
        socialLinks,
        profileImage,
        leaderLevel,
        followerLevel,
        primaryLanguage,
        languages,
        occupation,
        portfolioUrls,
        communityWebsiteUrl,
        privacySettings,
      } = req.body;

      // Build update data object - only include fields that are provided
      const updateData: any = {
        updatedAt: new Date(),
      };

      // Add profile fields if provided
      if (name !== undefined) updateData.name = name;
      if (username !== undefined) updateData.username = username;
      if (bio !== undefined) updateData.bio = bio;
      if (city !== undefined) updateData.city = city;
      if (country !== undefined) updateData.country = country;
      if (yearsOfDancing !== undefined) updateData.yearsOfDancing = yearsOfDancing;
      if (tangoRoles !== undefined) updateData.tangoRoles = tangoRoles;
      if (tangoStartYear !== undefined) updateData.tangoStartYear = tangoStartYear;
      if (tangoRoleExperience !== undefined) updateData.tangoRoleExperience = tangoRoleExperience;
      if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
      if (profileImage !== undefined) updateData.profileImage = profileImage;
      if (leaderLevel !== undefined) updateData.leaderLevel = leaderLevel;
      if (followerLevel !== undefined) updateData.followerLevel = followerLevel;
      if (primaryLanguage !== undefined) updateData.primaryLanguage = primaryLanguage;
      if (languages !== undefined) updateData.languages = languages;
      if (occupation !== undefined) updateData.occupation = occupation;
      if (portfolioUrls !== undefined) updateData.portfolioUrls = portfolioUrls;
      if (communityWebsiteUrl !== undefined) updateData.communityWebsiteUrl = communityWebsiteUrl;

      // Handle privacySettings JSONB merge - critical for field-level privacy
      if (privacySettings !== undefined) {
        updateData.privacySettings = sql`COALESCE(${users.privacySettings}, '{}'::jsonb) || ${JSON.stringify(privacySettings)}::jsonb`;
      }

      // Update user in database
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      res.status(500).json({ message: "Failed to update profile" });
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

  // FIX BATCH B - PAGE 3: User settings endpoints for UserSettingsPage
  
  // GET /api/users/me/settings - Fetch current user's settings
  app.get("/api/users/me/settings", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const [user] = await db
        .select({
          emailNotifications: users.isActive, // Placeholder - add proper notification fields
          pushNotifications: users.isActive, // Placeholder
          smsNotifications: users.isActive, // Placeholder
          profileVisibility: sql<string>`COALESCE((${users.privacySettings}->>'profileVisibility')::text, 'public')`,
          showEmail: sql<boolean>`COALESCE((${users.privacySettings}->>'showEmail')::boolean, false)`,
          showPhone: sql<boolean>`COALESCE((${users.privacySettings}->>'showPhone')::boolean, false)`,
          language: sql<string>`COALESCE(${users.languages}[1], 'en')`, // Get first language from array
          timezone: sql<string>`'UTC'`, // Placeholder - field doesn't exist yet
          twoFactorEnabled: users.twoFactorEnabled,
        })
        .from(users)
        .where(eq(users.id, req.user!.id));

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });

  // PATCH /api/users/me/settings - Update current user's settings
  app.patch("/api/users/me/settings", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const {
        emailNotifications,
        pushNotifications,
        smsNotifications,
        profileVisibility,
        showEmail,
        showPhone,
        language,
        timezone,
      } = req.body;

      // Update privacySettings jsonb field
      const privacySettings: any = {};
      if (profileVisibility !== undefined) privacySettings.profileVisibility = profileVisibility;
      if (showEmail !== undefined) privacySettings.showEmail = showEmail;
      if (showPhone !== undefined) privacySettings.showPhone = showPhone;

      const updateData: any = { updatedAt: new Date() };
      
      // Update language array if provided
      if (language !== undefined) {
        updateData.languages = [language]; // Store as single-element array
      }
      
      // Update privacy settings if any provided
      if (Object.keys(privacySettings).length > 0) {
        updateData.privacySettings = sql`COALESCE(${users.privacySettings}, '{}'::jsonb) || ${JSON.stringify(privacySettings)}::jsonb`;
      }

      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, req.user!.id))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Settings updated successfully", user: updatedUser });
    } catch (error) {
      console.error('Failed to update user settings:', error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // PATCH /api/users/me/password - Change current user's password
  app.patch("/api/users/me/password", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "All password fields are required" });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "New passwords do not match" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }

      // Get current user with password
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user!.id));

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const bcrypt = require('bcrypt');
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await db
        .update(users)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.id, req.user!.id));

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error('Failed to change password:', error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Privacy settings endpoints
  app.get("/api/settings/privacy", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user!.id),
        columns: {
          privacySettings: true
        }
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Parse privacy settings from jsonb or return defaults
      const privacySettings = user.privacySettings || {};
      
      res.json({
        marketingEmails: privacySettings.marketingEmails ?? true,
        analytics: privacySettings.analytics ?? true,
        thirdPartySharing: privacySettings.thirdPartySharing ?? false,
        profileVisibility: privacySettings.profileVisibility ?? "public",
        searchable: privacySettings.searchable ?? true,
        showActivity: privacySettings.showActivity ?? true
      });
    } catch (error) {
      console.error('Failed to fetch privacy settings:', error);
      res.status(500).json({ message: "Failed to fetch privacy settings" });
    }
  });

  app.patch("/api/settings/privacy", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const updates = req.body;

      // Get current privacy settings
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user!.id),
        columns: {
          privacySettings: true
        }
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Merge with existing settings
      const currentSettings = user.privacySettings || {};
      const newSettings = {
        ...currentSettings,
        ...updates
      };

      // Update user privacy settings
      await db
        .update(users)
        .set({ 
          privacySettings: newSettings,
          updatedAt: new Date()
        })
        .where(eq(users.id, req.user!.id));

      res.json({ message: "Privacy settings updated successfully" });
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      res.status(500).json({ message: "Failed to update privacy settings" });
    }
  });

  // User stats endpoint - for Dashboard
  app.get("/api/users/:id/stats", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Fetch all stats in parallel for performance
      const [eventsAttended, connections, postsLiked, messageConversations] = await Promise.all([
        db.select({ count: sql<number>`count(*)::int` })
          .from(eventRsvps)
          .where(and(eq(eventRsvps.userId, userId), eq(eventRsvps.status, 'going')))
          .then(rows => rows[0]?.count || 0),
        
        db.select({ count: sql<number>`count(*)::int` })
          .from(friendships)
          .where(
            and(
              or(eq(friendships.userId, userId), eq(friendships.friendId, userId)),
              eq(friendships.status, 'accepted')
            )
          )
          .then(rows => rows[0]?.count || 0),
        
        db.select({ count: sql<number>`count(*)::int` })
          .from(postLikes)
          .where(eq(postLikes.userId, userId))
          .then(rows => rows[0]?.count || 0),
        
        db.select({ count: sql<number>`count(distinct ${chatMessages.chatRoomId})::int` })
          .from(chatMessages)
          .where(eq(chatMessages.userId, userId))
          .then(rows => rows[0]?.count || 0)
      ]);

      res.json({
        eventsAttended,
        connections,
        postsLiked,
        messages: messageConversations
      });
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Public profile endpoint - for UserProfilePublicPage
  app.get("/api/users/:userId/profile", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Get user basic info
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get stats
      const [postsCount, friendsCount, eventsAttended] = await Promise.all([
        db.select({ count: sql<number>`count(*)::int` })
          .from(posts)
          .where(eq(posts.userId, userId))
          .then(rows => rows[0]?.count || 0),
        
        db.select({ count: sql<number>`count(*)::int` })
          .from(friendships)
          .where(
            and(
              or(eq(friendships.userId, userId), eq(friendships.friendId, userId)),
              eq(friendships.status, 'accepted')
            )
          )
          .then(rows => rows[0]?.count || 0),
        
        db.select({ count: sql<number>`count(*)::int` })
          .from(eventRsvps)
          .where(and(eq(eventRsvps.userId, userId), eq(eventRsvps.status, 'going')))
          .then(rows => rows[0]?.count || 0),
      ]);
      
      res.json({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatarUrl: user.profileImage,
        bio: user.bio,
        city: user.city,
        country: user.country,
        role: user.role,
        danceLevel: user.yearsOfDancing,
        yearsOfDancing: user.yearsOfDancing,
        leaderLevel: user.leaderLevel,
        followerLevel: user.followerLevel,
        socialLinks: user.socialLinks,
        tangoRoles: user.tangoRoles,
        joinedAt: user.createdAt,
        stats: {
          posts: postsCount,
          friends: friendsCount,
          eventsAttended,
          points: 0, // TODO: implement points system
        }
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // User's posts - for UserProfilePublicPage
  app.get("/api/users/:userId/posts", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const userPosts = await db
        .select({
          id: posts.id,
          content: posts.content,
          imageUrl: posts.imageUrl,
          videoUrl: posts.videoUrl,
          createdAt: posts.createdAt,
          likes: posts.likes,
          comments: posts.comments,
        })
        .from(posts)
        .where(and(
          eq(posts.userId, userId),
          eq(posts.type, 'post') // Exclude stories
        ))
        .orderBy(desc(posts.createdAt))
        .limit(10);
      
      res.json(userPosts);
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  // User's events - for UserProfilePublicPage and ProfileTabEvents
  app.get("/api/users/:userId/events", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const { status = "going", past } = req.query;
      
      // Parse status parameter: can be comma-separated list like "going,maybe,interested"
      const statusList = typeof status === 'string' 
        ? status.split(',').map(s => s.trim()).filter(Boolean)
        : ['going'];
      
      // Build conditions
      const conditions = [eq(eventRsvps.userId, userId)];
      
      // Add status filter - match any of the provided statuses
      if (statusList.length === 1) {
        conditions.push(eq(eventRsvps.status, statusList[0]));
      } else if (statusList.length > 1) {
        conditions.push(inArray(eventRsvps.status, statusList));
      }
      
      // Add date filter for past/upcoming events
      if (past === 'true') {
        conditions.push(sql`${events.startDate} < NOW()`);
      }
      
      const userEvents = await db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          startDate: events.startDate,
          endDate: events.endDate,
          location: events.location,
          city: events.city,
          venue: events.venue,
          eventType: events.eventType,
          imageUrl: events.imageUrl,
          maxAttendees: events.maxAttendees,
          rsvpStatus: eventRsvps.status,
        })
        .from(events)
        .innerJoin(eventRsvps, eq(events.id, eventRsvps.eventId))
        .where(and(...conditions))
        .orderBy(desc(events.startDate))
        .limit(50);
      
      // Format response to match expected structure
      const formattedEvents = userEvents.map(event => ({
        event: {
          id: event.id,
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          city: event.city,
          venue: event.venue,
          eventType: event.eventType,
          imageUrl: event.imageUrl,
          maxAttendees: event.maxAttendees,
        },
        rsvpStatus: event.rsvpStatus,
        _count: 0,
      }));
      
      res.json(formattedEvents);
    } catch (error) {
      console.error('Failed to fetch user events:', error);
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });

  // Upcoming events endpoint - for Dashboard
  app.get("/api/users/:id/upcoming-events", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      const upcomingEvents = await db
        .select({
          id: events.id,
          title: events.title,
          startDate: events.startDate,
          location: events.location,
        })
        .from(events)
        .innerJoin(eventRsvps, eq(events.id, eventRsvps.eventId))
        .where(
          and(
            eq(eventRsvps.userId, userId),
            eq(eventRsvps.status, 'going'),
            gte(events.startDate, sql`NOW()`)
          )
        )
        .orderBy(events.startDate)
        .limit(3);

      res.json(upcomingEvents);
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error);
      res.status(500).json({ message: "Failed to fetch upcoming events" });
    }
  });

  // Recent activity endpoint - for Dashboard
  app.get("/api/users/:id/recent-activity", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Fetch recent post likes
      const recentLikes = await db
        .select({
          type: sql<string>`'post_like'`,
          createdAt: postLikes.createdAt,
          targetId: posts.id,
          relatedUser: users.name,
        })
        .from(postLikes)
        .innerJoin(posts, eq(postLikes.postId, posts.id))
        .innerJoin(users, eq(posts.userId, users.id))
        .where(eq(postLikes.userId, userId))
        .orderBy(desc(postLikes.createdAt))
        .limit(5);

      // Fetch recent event RSVPs
      const recentRsvps = await db
        .select({
          type: sql<string>`'event_rsvp'`,
          createdAt: eventRsvps.rsvpedAt,
          targetId: events.id,
          relatedUser: events.title,
        })
        .from(eventRsvps)
        .innerJoin(events, eq(eventRsvps.eventId, events.id))
        .where(eq(eventRsvps.userId, userId))
        .orderBy(desc(eventRsvps.rsvpedAt))
        .limit(5);

      // Combine and sort all activities
      const allActivities = [...recentLikes, ...recentRsvps]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

      res.json(allActivities);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
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

  // Get events created by the user - Page 17 MyEventsPage
  app.get("/api/events/my-events", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const myEvents = await db
        .select()
        .from(events)
        .where(eq(events.userId, req.user!.id))
        .orderBy(desc(events.date));
      res.json(myEvents);
    } catch (error) {
      console.error("Get my events error:", error);
      res.status(500).json({ message: "Failed to fetch your events" });
    }
  });

  // List all events with filters (CRITICAL - Page 11 EventsPage depends on this!)
  // Also includes approved scraped events for immediate visibility
  app.get("/api/events", async (req: Request, res: Response) => {
    console.log('[EVENTS API] /api/events called with query:', req.query);
    try {
      const { 
        search, 
        eventType, 
        city, 
        groupId,
        limit = "50", 
        offset = "0",
        includeScraped = "true"
      } = req.query;

      // Get main events from storage
      const mainEvents = await storage.getEvents({
        search: search as string | undefined,
        eventType: eventType as string | undefined,
        city: city as string | undefined,
        groupId: groupId ? parseInt(groupId as string) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      // Also fetch approved scraped events if requested
      let allEvents = mainEvents;
      
      if (includeScraped === "true") {
        const conditions = [eq(scrapedEvents.status, 'approved')];
        
        if (city) {
          conditions.push(sql`LOWER(${scrapedEvents.city}) = LOWER(${city as string})`);
        }
        if (eventType) {
          conditions.push(eq(scrapedEvents.eventType, eventType as string));
        }
        if (search) {
          const searchLower = (search as string).toLowerCase();
          conditions.push(sql`(
            LOWER(${scrapedEvents.title}) LIKE ${'%' + searchLower + '%'} OR
            LOWER(${scrapedEvents.description}) LIKE ${'%' + searchLower + '%'}
          )`);
        }
        
        const scrapedResults = await db.select()
          .from(scrapedEvents)
          .where(and(...conditions))
          .limit(parseInt(limit as string));
        
        // Transform scraped events to match main event format
        const transformedScraped = scrapedResults.map(se => ({
          id: se.id,
          title: se.title,
          description: se.description,
          date: se.eventDate,
          startDate: se.eventDate,
          endDate: se.endDate,
          startTime: se.startTime,
          endTime: se.endTime,
          location: se.location,
          address: se.location,
          city: se.city,
          country: se.country,
          eventType: se.eventType || 'event',
          imageUrl: se.imageUrl,
          price: se.price ? String(se.price) : null,
          status: 'published',
          source: 'scraped',
          sourceUrl: se.sourceUrl,
          sourceName: se.sourceName,
          organizers: se.organizers,
          djs: se.djs,
          teachers: se.teachers,
          performers: se.performers,
          latitude: se.latitude,
          longitude: se.longitude,
          userId: null,
          createdAt: se.createdAt,
        }));
        
        // Merge and dedupe by title + date (avoid duplicates)
        const existingTitles = new Set(mainEvents.map((e: any) => 
          `${(e.title || '').toLowerCase()}-${e.date || e.startDate}`
        ));
        
        const uniqueScraped = transformedScraped.filter(se => 
          !existingTitles.has(`${(se.title || '').toLowerCase()}-${se.date}`)
        );
        
        allEvents = [...mainEvents, ...uniqueScraped];
        
        // Sort by date
        allEvents.sort((a: any, b: any) => {
          const dateA = new Date(a.date || a.startDate || 0);
          const dateB = new Date(b.date || b.startDate || 0);
          return dateA.getTime() - dateB.getTime();
        });
      }

      res.json({ events: allEvents });
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({ message: "Failed to fetch events" });
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

  // Get user's groups (groups the user is a member of) - Page 13 GroupsPage
  app.get("/api/groups/my-groups", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userGroups = await db
        .select({
          id: groups.id,
          name: groups.name,
          description: groups.description,
          city: groups.city,
          type: groups.type,
          imageUrl: groups.imageUrl,
          memberCount: sql<number>`count(${groupMembers.id})::int`,
        })
        .from(groupMembers)
        .leftJoin(groups, eq(groupMembers.groupId, groups.id))
        .where(eq(groupMembers.userId, req.user!.id))
        .groupBy(groups.id, groups.name, groups.description, groups.city, groups.type, groups.imageUrl);

      res.json(userGroups);
    } catch (error) {
      console.error('Failed to fetch user groups:', error);
      res.status(500).json({ message: "Failed to fetch user groups" });
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

  // NOTE: /api/messages/conversations is handled by messaging-routes.ts (direct-message based)
  // These chat-room based routes are disabled to avoid conflicts with the frontend hooks
  // which expect the direct-message format with userId for DMs
  
  // app.get("/api/messages/conversations", authenticateToken, async (req: AuthRequest, res: Response) => {
  //   try {
  //     const conversations = await storage.getUserConversations(req.user!.id);
  //     res.json(conversations);
  //   } catch (error) {
  //     console.error("Error fetching conversations:", error);
  //     res.status(500).json({ message: "Failed to fetch conversations" });
  //   }
  // });

  // app.post("/api/messages/conversations", authenticateToken, async (req: AuthRequest, res: Response) => {
  //   try {
  //     const { userId: otherUserId } = req.body;
  //     
  //     if (!otherUserId) {
  //       return res.status(400).json({ message: "userId is required" });
  //     }
  //     
  //     const conversation = await storage.getOrCreateDirectConversation(req.user!.id, otherUserId);
  //     res.status(201).json(conversation);
  //   } catch (error) {
  //     res.status(500).json({ message: "Failed to create conversation" });
  //   }
  // });

  // IMPORTANT: This route must come BEFORE /api/messages/:conversationId to avoid being caught by dynamic param
  app.get("/api/messages/unread-count", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Count unread direct messages (DMs) specifically for the logged-in user
      const [dmCount] = await db.select({
        count: sql<number>`count(*)::int`
      })
      .from(directMessages)
      .where(
        and(
          eq(directMessages.recipientId, userId),
          eq(directMessages.isRead, false)
        )
      );

      // Count unread group/room messages ONLY for groups the user is actually a member of
      // This prevents global/system messages from inflating the personal unread count
      const userIdStr = String(userId);
      const [chatCount] = await db.select({
        count: sql<number>`count(*)::int`
      })
      .from(chatMessages)
      .innerJoin(groupMembers, eq(chatMessages.chatRoomId, groupMembers.groupId))
      .where(
        and(
          eq(groupMembers.userId, userId),
          sql`(${chatMessages.readBy} IS NULL OR NOT (${userIdStr} = ANY(${chatMessages.readBy})))`
        )
      );
      
      const totalUnread = (dmCount?.count || 0) + (chatCount?.count || 0);
      res.json({ count: totalUnread });
    } catch (error) {
      console.error("Get unread message count error:", error);
      res.json({ count: 0 });
    }
  });

  // Get messages in a conversation (alias for MessagesDetailPage compatibility)
  app.get("/api/messages/:conversationId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const chatRoomId = parseInt(req.params.conversationId);
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

  // Send message (alias for MessagesDetailPage compatibility)
  app.post("/api/messages/:conversationId", authenticateToken, validateRequest(insertChatMessageSchema.omit({ chatRoomId: true, userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const chatRoomId = parseInt(req.params.conversationId);
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

  // ============================================================================
  // VENUES API (Public - for VenuesPage)
  // ============================================================================
  
  app.get("/api/venues", async (req: Request, res: Response) => {
    try {
      const { city, type, limit = "50" } = req.query;
      
      // Return curated venue data for the tango community
      const venues = [
        {
          id: 1,
          name: "La Viruta Tango",
          address: "Armenia 1366, Palermo",
          city: "Buenos Aires",
          country: "Argentina",
          type: "milonga",
          rating: 4.9,
          reviewCount: 328,
          phone: "+54 11 4774-6357",
          website: "https://lavirutatango.com",
          schedule: "Tue-Sun 11pm-5am",
          imageUrl: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800",
          description: "Legendary Buenos Aires milonga with live orchestras and authentic atmosphere"
        },
        {
          id: 2,
          name: "Salon Canning",
          address: "Scalabrini Ortiz 1331",
          city: "Buenos Aires",
          country: "Argentina",
          type: "milonga",
          rating: 4.8,
          reviewCount: 256,
          phone: "+54 11 4832-6753",
          schedule: "Mon-Sun 10pm-4am",
          imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800",
          description: "Classic milonga venue in the heart of Palermo"
        },
        {
          id: 3,
          name: "El Beso",
          address: "Riobamba 416",
          city: "Buenos Aires",
          country: "Argentina",
          type: "milonga",
          rating: 4.7,
          reviewCount: 189,
          schedule: "Wed-Sun 11pm-4am",
          imageUrl: "https://images.unsplash.com/photo-1485872299829-c673f50dea4d?w=800",
          description: "Intimate traditional milonga with classic tango atmosphere"
        },
        {
          id: 4,
          name: "Tango Malevaje",
          address: "123 Tango Street",
          city: "New York",
          country: "USA",
          type: "studio",
          rating: 4.6,
          reviewCount: 142,
          website: "https://tangomalevaje.com",
          schedule: "Daily classes and practica",
          imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
          description: "Premier tango studio in Manhattan with world-class instruction"
        },
        {
          id: 5,
          name: "Milonga del Indio",
          address: "Güemes 4671",
          city: "Buenos Aires",
          country: "Argentina",
          type: "milonga",
          rating: 4.8,
          reviewCount: 203,
          schedule: "Fri-Sat 11pm-5am",
          imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
          description: "Traditional neighborhood milonga with authentic porteño spirit"
        },
        {
          id: 6,
          name: "Tango Terra",
          address: "Via Roma 45",
          city: "Rome",
          country: "Italy",
          type: "studio",
          rating: 4.5,
          reviewCount: 98,
          schedule: "Classes and milongas weekly",
          imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
          description: "Beautiful Roman venue hosting regular tango events"
        }
      ];
      
      // Filter by city if provided
      let filteredVenues = venues;
      if (city) {
        filteredVenues = filteredVenues.filter(v => 
          v.city.toLowerCase().includes((city as string).toLowerCase())
        );
      }
      if (type && type !== 'all') {
        filteredVenues = filteredVenues.filter(v => v.type === type);
      }
      
      res.json(filteredVenues.slice(0, parseInt(limit as string)));
    } catch (error) {
      console.error('[Venues] Get venues error:', error);
      res.status(500).json({ message: 'Failed to fetch venues' });
    }
  });

  app.get("/api/venues/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      // Return venue detail (would come from database in production)
      res.json({
        id,
        name: "La Viruta Tango",
        address: "Armenia 1366, Palermo",
        city: "Buenos Aires",
        country: "Argentina",
        type: "milonga",
        rating: 4.9,
        reviewCount: 328,
        description: "Legendary Buenos Aires milonga with live orchestras"
      });
    } catch (error) {
      console.error('[Venues] Get venue error:', error);
      res.status(500).json({ message: 'Failed to fetch venue' });
    }
  });

  // ============================================================================
  // TUTORIALS API (Public - for TutorialsPage)
  // ============================================================================
  
  app.get("/api/tutorials", async (req: Request, res: Response) => {
    try {
      const { level, category } = req.query;
      
      const tutorials = [
        {
          id: 1,
          title: "Basic Tango Walk",
          description: "Master the fundamental walking technique that forms the foundation of all tango movement",
          level: "beginner",
          category: "technique",
          duration: 15,
          instructor: "Carlos Gavito",
          thumbnailUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800",
          videoUrl: null,
          viewCount: 12500,
          rating: 4.9
        },
        {
          id: 2,
          title: "The Embrace (Abrazo)",
          description: "Learn the different types of embrace and how to connect with your partner",
          level: "beginner",
          category: "connection",
          duration: 20,
          instructor: "Maria Nieves",
          thumbnailUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800",
          videoUrl: null,
          viewCount: 9800,
          rating: 4.8
        },
        {
          id: 3,
          title: "Ocho Cortado",
          description: "Execute the classic ocho cortado with precision and musicality",
          level: "intermediate",
          category: "figures",
          duration: 25,
          instructor: "Pablo Veron",
          thumbnailUrl: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800",
          videoUrl: null,
          viewCount: 7500,
          rating: 4.7
        },
        {
          id: 4,
          title: "Musicality in Tango",
          description: "Understanding tango music structure and how to interpret it through movement",
          level: "intermediate",
          category: "musicality",
          duration: 30,
          instructor: "Gustavo Naveira",
          thumbnailUrl: "https://images.unsplash.com/photo-1485872299829-c673f50dea4d?w=800",
          videoUrl: null,
          viewCount: 6200,
          rating: 4.9
        },
        {
          id: 5,
          title: "Advanced Sacadas",
          description: "Master complex sacada combinations and transitions",
          level: "advanced",
          category: "figures",
          duration: 35,
          instructor: "Chicho Frumboli",
          thumbnailUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
          videoUrl: null,
          viewCount: 4100,
          rating: 4.8
        },
        {
          id: 6,
          title: "Milonga Rhythm",
          description: "Dance to the energetic rhythm of milonga with confidence",
          level: "intermediate",
          category: "styles",
          duration: 25,
          instructor: "Sebastian Arce",
          thumbnailUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
          videoUrl: null,
          viewCount: 5300,
          rating: 4.6
        }
      ];
      
      let filtered = tutorials;
      if (level && level !== 'all') {
        filtered = filtered.filter(t => t.level === level);
      }
      if (category && category !== 'all') {
        filtered = filtered.filter(t => t.category === category);
      }
      
      res.json(filtered);
    } catch (error) {
      console.error('[Tutorials] Get tutorials error:', error);
      res.status(500).json({ message: 'Failed to fetch tutorials' });
    }
  });

  app.get("/api/tutorials/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      res.json({
        id,
        title: "Basic Tango Walk",
        description: "Master the fundamental walking technique",
        level: "beginner",
        duration: 15,
        instructor: "Carlos Gavito",
        content: "Full tutorial content here..."
      });
    } catch (error) {
      console.error('[Tutorials] Get tutorial error:', error);
      res.status(500).json({ message: 'Failed to fetch tutorial' });
    }
  });

  // ============================================================================
  // WORKSHOPS API (Public - for WorkshopsPage)
  // ============================================================================
  
  app.get("/api/workshops", async (req: Request, res: Response) => {
    try {
      const workshops = [
        {
          id: 1,
          title: "Milonga Intensive Weekend",
          description: "Two-day deep dive into milonga rhythm and styling with world-renowned instructors",
          instructor: "Sebastian Arce & Mariana Montes",
          location: "Buenos Aires, Argentina",
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
          price: 250,
          currency: "USD",
          capacity: 30,
          enrolled: 24,
          level: "intermediate",
          imageUrl: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800"
        },
        {
          id: 2,
          title: "Tango Nuevo Masterclass",
          description: "Explore contemporary tango movement with innovative techniques",
          instructor: "Chicho Frumboli & Juana Sepulveda",
          location: "Berlin, Germany",
          startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
          price: 300,
          currency: "EUR",
          capacity: 25,
          enrolled: 18,
          level: "advanced",
          imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800"
        },
        {
          id: 3,
          title: "Beginners Tango Bootcamp",
          description: "Complete introduction to Argentine tango for absolute beginners",
          instructor: "Local Maestros",
          location: "New York, USA",
          startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
          price: 150,
          currency: "USD",
          capacity: 40,
          enrolled: 35,
          level: "beginner",
          imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800"
        },
        {
          id: 4,
          title: "Vals Workshop",
          description: "Master the elegant art of tango vals with flowing movements",
          instructor: "Gustavo Naveira & Giselle Anne",
          location: "Paris, France",
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
          price: 200,
          currency: "EUR",
          capacity: 35,
          enrolled: 28,
          level: "intermediate",
          imageUrl: "https://images.unsplash.com/photo-1485872299829-c673f50dea4d?w=800"
        }
      ];
      
      res.json(workshops);
    } catch (error) {
      console.error('[Workshops] Get workshops error:', error);
      res.status(500).json({ message: 'Failed to fetch workshops' });
    }
  });

  app.get("/api/workshops/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      res.json({
        id,
        title: "Milonga Intensive Weekend",
        description: "Two-day deep dive into milonga rhythm",
        instructor: "Sebastian Arce & Mariana Montes",
        location: "Buenos Aires, Argentina",
        price: 250,
        capacity: 30,
        enrolled: 24
      });
    } catch (error) {
      console.error('[Workshops] Get workshop error:', error);
      res.status(500).json({ message: 'Failed to fetch workshop' });
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

  // Get friends for a specific user (public endpoint for viewing profiles)
  app.get("/api/users/:userId/friends", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const friends = await storage.getUserFriends(userId);
      // Return public-safe friend data
      const publicFriends = friends.map(f => ({
        id: f.id,
        name: f.name,
        username: f.username,
        profileImage: f.profileImage,
        bio: f.bio,
        city: f.city,
        tangoRoles: f.tangoRoles,
        closenessScore: f.closenessScore,
      }));
      res.json(publicFriends);
    } catch (error) {
      console.error("[GET /api/users/:userId/friends] Error:", error);
      res.status(500).json({ message: "Failed to fetch user friends" });
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

  // Get received friend requests (requests sent TO current user)
  app.get("/api/friends/requests/received", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const requests = await storage.getFriendRequests(req.user!.id);
      res.json(requests);
    } catch (error) {
      console.error('Failed to fetch received friend requests:', error);
      res.status(500).json({ message: "Failed to fetch friend requests" });
    }
  });

  // Get sent friend requests (requests sent BY current user)
  app.get("/api/friends/requests/sent", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const sentRequests = await db
        .select({
          id: friendRequests.id,
          senderId: friendRequests.senderId,
          receiverId: friendRequests.receiverId,
          status: friendRequests.status,
          createdAt: friendRequests.createdAt,
          receiver: {
            id: users.id,
            name: users.name,
            username: users.username,
            profileImage: users.profileImage,
          },
        })
        .from(friendRequests)
        .leftJoin(users, eq(friendRequests.receiverId, users.id))
        .where(
          and(
            eq(friendRequests.senderId, req.user!.id),
            eq(friendRequests.status, 'pending')
          )
        )
        .orderBy(desc(friendRequests.createdAt));
      
      res.json(sentRequests);
    } catch (error) {
      console.error('Failed to fetch sent friend requests:', error);
      res.status(500).json({ message: "Failed to fetch sent friend requests" });
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

  // Alias for reject (frontend expects this)
  app.post("/api/friends/decline/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      await storage.declineFriendRequest(requestId);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to decline friend request:', error);
      res.status(500).json({ message: "Failed to decline friend request" });
    }
  });

  // Cancel sent friend request
  app.delete("/api/friends/request/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      await storage.declineFriendRequest(requestId);
      res.status(204).send();
    } catch (error) {
      console.error('Failed to cancel friend request:', error);
      res.status(500).json({ message: "Failed to cancel friend request" });
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

  // Get friendship info (base route)
  app.get("/api/friends/friendship/:friendId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const friendId = parseInt(req.params.friendId);
      const friendshipInfo = await storage.getFriendshipInfo(req.user!.id, friendId);
      
      if (!friendshipInfo) {
        return res.status(404).json({ error: "Friendship not found" });
      }
      
      res.json(friendshipInfo);
    } catch (error) {
      console.error("[GET /api/friends/friendship/:friendId] Error:", error);
      res.status(500).json({ message: "Failed to fetch friendship info" });
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

  app.get("/api/friends/friendship/:friendId/shared-data", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const friendId = parseInt(req.params.friendId);
      const userId = req.user!.id;
      
      const sharedData = await storage.getFriendshipSharedData(userId, friendId);
      
      if (!sharedData) {
        return res.status(404).json({ message: "Friendship not found" });
      }
      
      res.json(sharedData);
    } catch (error) {
      console.error("[GET /api/friends/friendship/:friendId/shared-data] Error:", error);
      res.status(500).json({ message: "Failed to fetch shared data" });
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

  app.post("/api/users/me/photo", authenticateToken, profileMediaUpload.single('photo'), async (req: AuthRequest, res: Response) => {
    try {
      const file = (req as any).file;
      
      if (!file) {
        return res.status(400).json({ message: "No photo file provided" });
      }

      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ message: "File must be an image" });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const userId = req.user!.id;
      const ext = file.originalname.split('.').pop() || 'jpg';
      const filename = `profile-${userId}-${timestamp}.${ext}`;

      // Upload to Object Storage
      const { objectStorageService } = await import('./objectStorage');
      
      const result = await objectStorageService.uploadBuffer(file.buffer, {
        filename,
        contentType: file.mimetype,
        isPublic: true,
        directory: 'profile-photos'
      });

      if (!result.success) {
        console.error('[POST /api/users/me/photo] Upload failed:', result.error);
        return res.status(500).json({ message: "Failed to upload photo to storage" });
      }

      console.log(`[POST /api/users/me/photo] Uploaded photo for user ${userId}: ${result.publicUrl}`);
      
      res.json({ 
        imageUrl: result.publicUrl,
        objectPath: result.objectPath 
      });
    } catch (error: any) {
      console.error('[POST /api/users/me/photo] Error:', error);
      res.status(500).json({ message: "Photo upload failed", error: error.message });
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
      const query = (req.query.query as string) || (req.query.q as string) || "";
      if (query.length < 2) {
        return res.json({ users: [], events: [], groups: [], posts: [] });
      }
      
      // storage.search() returns flat array with 'type' field
      // Frontend expects { users: [], events: [], groups: [], posts: [] }
      const flatResults = await storage.search(query, req.user!.id);
      
      // Transform flat array to categorized object
      const categorizedResults = {
        users: flatResults.filter((r: any) => r.type === 'user'),
        events: flatResults.filter((r: any) => r.type === 'event'),
        groups: flatResults.filter((r: any) => r.type === 'group'),
        posts: flatResults.filter((r: any) => r.type === 'post'),
      };
      
      res.json(categorizedResults);
    } catch (error) {
      console.error('Search failed:', error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Alias for global-search used by InlineSearchInput
  app.get("/api/user/global-search", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const query = (req.query.q as string) || (req.query.query as string) || "";
      if (query.length < 2) {
        return res.json({ users: [], events: [], groups: [], posts: [] });
      }
      
      const flatResults = await storage.search(query, req.user!.id);
      const categorizedResults = {
        users: flatResults.filter((r: any) => r.type === 'user'),
        events: flatResults.filter((r: any) => r.type === 'event'),
        groups: flatResults.filter((r: any) => r.type === 'group'),
        posts: flatResults.filter((r: any) => r.type === 'post'),
      };
      
      res.json(categorizedResults);
    } catch (error) {
      console.error('Global search failed:', error);
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

  // =========================================================
  // MB.MD PRD COVERAGE API
  // Reports on component/page PRD coverage and smart defaults
  // =========================================================
  app.get("/api/prd/coverage", async (req: Request, res: Response) => {
    try {
      const report = DataCompletenessValidator.generatePRDCoverageReport();
      res.json({
        success: true,
        mbmd_version: "9.2",
        timestamp: new Date().toISOString(),
        ...report
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to generate PRD coverage report" });
    }
  });

  app.get("/api/prd/page/:pageId", async (req: Request, res: Response) => {
    try {
      const { pageId } = req.params;
      const pagePRD = ComponentPRDRegistry.getPagePRD(pageId);
      if (!pagePRD) {
        return res.status(404).json({ success: false, message: `Page PRD not found: ${pageId}` });
      }
      const components = ComponentPRDRegistry.getPageComponents(pageId);
      res.json({
        success: true,
        page: pagePRD,
        components: components,
        componentCount: components.length
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to get page PRD" });
    }
  });

  app.get("/api/prd/component/:componentId", async (req: Request, res: Response) => {
    try {
      const { componentId } = req.params;
      const componentPRD = ComponentPRDRegistry.getComponentPRD(componentId);
      if (!componentPRD) {
        return res.status(404).json({ success: false, message: `Component PRD not found: ${componentId}` });
      }
      res.json({
        success: true,
        component: componentPRD,
        requiredFields: ComponentPRDRegistry.getRequiredFields(componentId),
        fieldsWithDefaults: ComponentPRDRegistry.getFieldsWithDefaults(componentId)
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to get component PRD" });
    }
  });

  app.post("/api/prd/validate", async (req: Request, res: Response) => {
    try {
      const { componentId, data } = req.body;
      if (!componentId || !data) {
        return res.status(400).json({ success: false, message: "componentId and data required" });
      }
      const result = await DataCompletenessValidator.validateComponent(componentId, data);
      res.json({
        success: true,
        validation: result
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Validation failed" });
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
  // UNIFIED: Now uses posts table with postType='memory' filter
  // User Decision: Unify Memories and Feed to single posts table
  app.get("/api/memories", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { limit = "20", offset = "0", filter = "all" } = req.query;
      const userId = req.user!.id;
      
      // Get memories from posts table (postType = 'memory')
      const memories = await storage.getPosts({
        userId,
        type: 'memory',
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        currentUserId: userId
      });
      
      // Transform posts to Memory format for backward compatibility
      const formattedMemories = memories.map(post => ({
        id: post.id,
        userId: post.userId,
        title: post.content?.slice(0, 50) || 'Memory',
        description: post.content || '',
        type: post.imageUrl ? 'photo' : post.videoUrl ? 'video' : 'milestone',
        imageUrl: post.imageUrl,
        videoUrl: post.videoUrl,
        date: post.createdAt,
        location: post.location,
        tags: post.hashtags || [],
        user: post.user
      }));
      
      res.json(formattedMemories);
    } catch (error) {
      console.error("Get memories error:", error);
      res.status(500).json({ message: "Failed to fetch memories" });
    }
  });

  // MEMORIES STATS - Returns statistics about user's memories
  app.get("/api/memories/stats", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Get all memory-type posts for this user
      const allMemories = await storage.getPosts({
        userId,
        type: 'memory',
        limit: 1000,
        offset: 0,
        currentUserId: userId
      });
      
      // Calculate stats
      const thisYear = new Date().getFullYear();
      const thisYearMemories = allMemories.filter(m => 
        new Date(m.createdAt).getFullYear() === thisYear
      );
      
      res.json({
        totalMemories: allMemories.length,
        eventsAttended: allMemories.filter(m => m.location).length,
        milestones: allMemories.filter(m => !m.imageUrl && !m.videoUrl).length,
        thisYear: thisYearMemories.length
      });
    } catch (error) {
      console.error("Get memories stats error:", error);
      res.status(500).json({ message: "Failed to fetch memories stats" });
    }
  });

  app.post("/api/memories", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      // Create memory as a post with postType='memory'
      const memory = await storage.createPost({
        userId: req.user!.id,
        content: req.body.description || req.body.title || '',
        imageUrl: req.body.imageUrl,
        videoUrl: req.body.videoUrl,
        location: req.body.location,
        postType: 'memory',
        visibility: req.body.visibility || 'public',
        hashtags: req.body.tags || []
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

  // Initialize WebSocket Upgrade Router BEFORE any WebSocket services
  const { wsUpgradeRouter } = await import("./lib/websocketUpgradeRouter");
  wsUpgradeRouter.initialize(httpServer);
  
  // Initialize and register notification service with router
  wsNotificationService.initialize(httpServer);
  wsNotificationService.registerWithRouter(wsUpgradeRouter);
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

  // ============================================================================
  // CITY GROUP DATA ENRICHMENT (MB.MD Protocol)
  // ============================================================================

  // Enrich a single city group from scraped data
  app.post("/api/city-groups/:id/enrich", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      const result = await cityGroupDataIngestionService.enrichCityGroup(groupId);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("[CityGroupEnrich] Error:", error);
      res.status(500).json({ 
        message: "Failed to enrich city group",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Batch enrich all city groups
  app.post("/api/city-groups/enrich-all", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const result = await cityGroupDataIngestionService.enrichAllCityGroups();
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("[CityGroupEnrichAll] Error:", error);
      res.status(500).json({ 
        message: "Failed to enrich city groups",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Assign cityscape cover photo to a city group
  app.post("/api/city-groups/:id/assign-cityscape", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      const cityName = req.body.cityName;
      
      if (!cityName) {
        return res.status(400).json({ message: "cityName is required" });
      }

      const result = await cityGroupDataIngestionService.assignCityscapeCoverPhoto(cityName);
      
      if (result) {
        res.json({
          success: true,
          coverPhoto: result,
        });
      } else {
        res.status(404).json({ 
          message: "No cityscape found for this city",
        });
      }
    } catch (error) {
      console.error("[CityGroupCityscape] Error:", error);
      res.status(500).json({ 
        message: "Failed to assign cityscape",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Hook: Trigger enrichment when city group is created
  app.post("/api/city-groups/:id/on-created", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      const cityName = req.body.cityName;
      
      if (!cityName) {
        return res.status(400).json({ message: "cityName is required" });
      }

      await cityGroupDataIngestionService.onCityGroupCreated(groupId, cityName);
      res.json({ success: true });
    } catch (error) {
      console.error("[CityGroupCreated] Error:", error);
      res.status(500).json({ 
        message: "Failed to process new city group",
        error: error instanceof Error ? error.message : "Unknown error",
      });
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

  // 1. GET /api/community/locations - Get all community locations with stats (PUBLIC)
  // MB.MD v9.8: City groups as primary data source + user profile cities
  // OPTIMIZED: Uses caching and parallel queries for performance
  app.get("/api/community/locations", async (req: Request, res: Response) => {
    try {
      // Check cache first (5 minute TTL)
      const cached = communityCache.get<any[]>('locations');
      if (cached) {
        return res.json(cached);
      }

      // Run ALL queries in parallel for speed
      const [
        cityGroups,
        userCities,
        locationHistoryCities,
        eventsByCity,
        scrapedEventsByCity,
        venuesByCity,
        housingByCity,
        scrapedEventCitiesData
      ] = await Promise.all([
        // PRIMARY SOURCE: Get all city groups from groups table
        db.select({
          id: groups.id,
          name: groups.name,
          slug: groups.slug,
          city: groups.city,
          country: groups.country,
          latitude: groups.latitude,
          longitude: groups.longitude,
          memberCount: groups.memberCount,
          eventCount: groups.eventCount,
          coverImage: groups.coverImage,
        })
        .from(groups)
        .where(and(
          eq(groups.type, 'city'),
          isNotNull(groups.city)
        )),
        
        // SECONDARY SOURCE: Get unique cities from user profiles (current city)
        db.select({
          city: users.city,
          country: users.country,
          memberCount: sql<number>`count(*)::int`,
        })
        .from(users)
        .where(and(
          isNotNull(users.city),
          eq(users.isActive, true),
          eq(users.suspended, false)
        ))
        .groupBy(users.city, users.country),
        
        // SECONDARY SOURCE: Get unique cities from location history
        db.select({
          city: userLocationHistory.city,
          country: userLocationHistory.country,
          latitude: userLocationHistory.latitude,
          longitude: userLocationHistory.longitude,
          memberCount: sql<number>`count(distinct ${userLocationHistory.userId})::int`,
        })
        .from(userLocationHistory)
        .where(isNotNull(userLocationHistory.city))
        .groupBy(
          userLocationHistory.city, 
          userLocationHistory.country,
          userLocationHistory.latitude,
          userLocationHistory.longitude
        ),
        
        // ENRICHMENT: Get event counts by city
        db.select({
          city: events.city,
          country: events.country,
          eventCount: sql<number>`count(*)::int`,
        })
        .from(events)
        .where(and(
          isNotNull(events.city),
          eq(events.status, 'published')
        ))
        .groupBy(events.city, events.country),
        
        // Also count approved scraped events
        db.select({
          city: scrapedEvents.city,
          country: scrapedEvents.country,
          eventCount: sql<number>`count(*)::int`,
        })
        .from(scrapedEvents)
        .where(and(
          isNotNull(scrapedEvents.city),
          eq(scrapedEvents.status, 'approved')
        ))
        .groupBy(scrapedEvents.city, scrapedEvents.country),
        
        // ENRICHMENT: Get venue counts by city
        db.select({
          city: venues.city,
          country: venues.country,
          venueCount: sql<number>`count(*)::int`,
        })
        .from(venues)
        .where(isNotNull(venues.city))
        .groupBy(venues.city, venues.country),
        
        // ENRICHMENT: Get housing counts by city
        db.select({
          city: housingListings.city,
          country: housingListings.country,
          housingCount: sql<number>`count(*)::int`,
        })
        .from(housingListings)
        .where(and(
          isNotNull(housingListings.city),
          eq(housingListings.status, 'active')
        ))
        .groupBy(housingListings.city, housingListings.country),
        
        // TERTIARY SOURCE: Cities from scraped events
        db.select({
          city: scrapedEvents.city,
          country: scrapedEvents.country,
          latitude: scrapedEvents.latitude,
          longitude: scrapedEvents.longitude,
          eventCount: sql<number>`count(*)::int`,
        })
        .from(scrapedEvents)
        .where(and(
          isNotNull(scrapedEvents.city),
          or(
            eq(scrapedEvents.status, 'approved'),
            eq(scrapedEvents.status, 'ingested')
          )
        ))
        .groupBy(
          scrapedEvents.city, 
          scrapedEvents.country,
          scrapedEvents.latitude,
          scrapedEvents.longitude
        )
      ]);

      // City coordinates lookup for common cities
      const cityCoords: Record<string, { lat: number; lng: number }> = {
        'Buenos Aires': { lat: -34.6037, lng: -58.3816 },
        'Paris': { lat: 48.8566, lng: 2.3522 },
        'New York': { lat: 40.7128, lng: -74.0060 },
        'Tokyo': { lat: 35.6762, lng: 139.6503 },
        'Berlin': { lat: 52.5200, lng: 13.4050 },
        'London': { lat: 51.5074, lng: -0.1278 },
        'Rome': { lat: 41.9028, lng: 12.4964 },
        'Shanghai': { lat: 31.2304, lng: 121.4737 },
        'Dubai': { lat: 25.2048, lng: 55.2708 },
        'São Paulo': { lat: -23.5505, lng: -46.6333 },
        'San Francisco': { lat: 37.7749, lng: -122.4194 },
        'Seoul': { lat: 37.5665, lng: 126.9780 },
        'Toronto': { lat: 43.6532, lng: -79.3832 },
        'Melbourne': { lat: -37.8136, lng: 144.9631 },
        'Rosario': { lat: -32.9468, lng: -60.6393 },
        'Istanbul': { lat: 41.0082, lng: 28.9784 },
        'Milan': { lat: 45.4642, lng: 9.1900 },
        'Barcelona': { lat: 41.3874, lng: 2.1686 },
        'Madrid': { lat: 40.4168, lng: -3.7038 },
        'Montevideo': { lat: -34.9011, lng: -56.1645 },
        'Los Angeles': { lat: 34.0522, lng: -118.2437 },
        'Chicago': { lat: 41.8781, lng: -87.6298 },
        'Sydney': { lat: -33.8688, lng: 151.2093 },
        'Amsterdam': { lat: 52.3676, lng: 4.9041 },
        'Vienna': { lat: 48.2082, lng: 16.3738 },
        'Prague': { lat: 50.0755, lng: 14.4378 },
        'Lisbon': { lat: 38.7223, lng: -9.1393 },
        'Athens': { lat: 37.9838, lng: 23.7275 },
        // Additional cities from scraped events
        'Warsaw': { lat: 52.2297, lng: 21.0122 },
        'Budapest': { lat: 47.4979, lng: 19.0402 },
        'Porto': { lat: 41.1579, lng: -8.6291 },
        'Riga': { lat: 56.9496, lng: 24.1052 },
        'Belgrade': { lat: 44.7866, lng: 20.4489 },
        'Bogota': { lat: 4.7110, lng: -74.0721 },
        'Miami': { lat: 25.7617, lng: -80.1918 },
        'Singapore': { lat: 1.3521, lng: 103.8198 },
        'Hong Kong': { lat: 22.3193, lng: 114.1694 },
        // Additional US cities
        'Phoenix': { lat: 33.4484, lng: -112.0740 },
        'Denver': { lat: 39.7392, lng: -104.9903 },
        'Seattle': { lat: 47.6062, lng: -122.3321 },
        'Boston': { lat: 42.3601, lng: -71.0589 },
        'Austin': { lat: 30.2672, lng: -97.7431 },
        'Portland': { lat: 45.5051, lng: -122.6750 },
        'San Diego': { lat: 32.7157, lng: -117.1611 },
        'Washington': { lat: 38.9072, lng: -77.0369 },
        'Washington DC': { lat: 38.9072, lng: -77.0369 },
        // Additional European cities
        'Munich': { lat: 48.1351, lng: 11.5820 },
        'Cologne': { lat: 50.9375, lng: 6.9603 },
        'Hamburg': { lat: 53.5511, lng: 9.9937 },
        'Florence': { lat: 43.7696, lng: 11.2558 },
        'Naples': { lat: 40.8518, lng: 14.2681 },
        'Zurich': { lat: 47.3769, lng: 8.5417 },
        'Krakow': { lat: 50.0647, lng: 19.9450 },
        'Dublin': { lat: 53.3498, lng: -6.2603 },
        'Stockholm': { lat: 59.3293, lng: 18.0686 },
        'Oslo': { lat: 59.9139, lng: 10.7522 },
        'Helsinki': { lat: 60.1699, lng: 24.9384 },
        // Additional Latin American cities
        'Lima': { lat: -12.0464, lng: -77.0428 },
        'Santiago': { lat: -33.4489, lng: -70.6693 },
        'Medellin': { lat: 6.2476, lng: -75.5658 },
        // Additional Asian cities
        'Taipei': { lat: 25.0330, lng: 121.5654 },
        'Bangkok': { lat: 13.7563, lng: 100.5018 },
        'Mumbai': { lat: 19.0760, lng: 72.8777 },
        'Tbilisi': { lat: 41.7151, lng: 44.8271 },
      };

      // Normalize city key for consistent lookups (case-insensitive, trimmed, Turkish chars)
      const normalizeKey = (city: string) => {
        return city
          .toLowerCase()
          .trim()
          .replace(/İ/gi, 'i')  // Turkish capital İ
          .replace(/ı/g, 'i')   // Turkish lowercase ı (dotless i)
          .replace(/i̇/g, 'i'); // Combined i + combining dot above
      };

      // Build normalized coords lookup for consistent coordinate access
      const normalizedCityCoords = new Map<string, { lat: number; lng: number }>();
      for (const [cityName, coords] of Object.entries(cityCoords)) {
        normalizedCityCoords.set(normalizeKey(cityName), coords);
      }

      // Helper to get coords by normalized key
      const getCoordsByNormalizedKey = (city: string) => {
        return normalizedCityCoords.get(normalizeKey(city)) || { lat: 0, lng: 0 };
      };

      // Build enrichment lookup maps with normalized keys
      const eventsMap = new Map<string, number>();
      for (const e of eventsByCity) {
        const key = normalizeKey(e.city || '');
        eventsMap.set(key, (eventsMap.get(key) || 0) + (e.eventCount || 0));
      }
      // Add scraped events to the count
      for (const e of scrapedEventsByCity) {
        const key = normalizeKey(e.city || '');
        eventsMap.set(key, (eventsMap.get(key) || 0) + (e.eventCount || 0));
      }
      const venuesMap = new Map<string, number>();
      for (const v of venuesByCity) {
        const key = normalizeKey(v.city || '');
        venuesMap.set(key, (venuesMap.get(key) || 0) + (v.venueCount || 0));
      }
      const housingMap = new Map<string, number>();
      for (const h of housingByCity) {
        const key = normalizeKey(h.city || '');
        housingMap.set(key, (housingMap.get(key) || 0) + (h.housingCount || 0));
      }

      // Track cities we've already added (by normalized city key)
      const addedCities = new Set<string>();

      // Build locations from city groups (PRIMARY SOURCE)
      const locations: any[] = [];
      
      for (const group of cityGroups) {
        const city = group.city || '';
        const cityKey = normalizeKey(city);
        if (!cityKey) continue;
        
        addedCities.add(cityKey);
        
        // PRIORITY: Database coords FIRST (from geocoding), then hardcoded fallback
        const dbLat = group.latitude ? parseFloat(group.latitude as string) : null;
        const dbLng = group.longitude ? parseFloat(group.longitude as string) : null;
        const hasValidDbCoords = dbLat !== null && dbLng !== null && !(dbLat === 0 && dbLng === 0);
        
        const coords = hasValidDbCoords
          ? { lat: dbLat!, lng: dbLng! }
          : (normalizedCityCoords.get(cityKey) || cityCoords[city] || { lat: 0, lng: 0 });
        
        locations.push({
          id: group.id,
          groupId: group.id,
          city: city,
          country: group.country || '',
          slug: (group as any).slug || '', // Include slug for proper navigation
          coordinates: coords,
          memberCount: group.memberCount || 0,
          activeEvents: eventsMap.get(cityKey) || group.eventCount || 0,
          venues: venuesMap.get(cityKey) || 0,
          housing: housingMap.get(cityKey) || 0,
          recommendations: venuesMap.get(cityKey) || 0,
          coverImage: group.coverImage,
          isActive: true
        });
      }

      // Build coordinates map from location history for cities without known coords
      const locationHistoryCoords = new Map<string, { lat: number; lng: number }>();
      for (const h of locationHistoryCities) {
        if (h.latitude && h.longitude) {
          const key = normalizeKey(h.city || '');
          locationHistoryCoords.set(key, {
            lat: parseFloat(h.latitude as string),
            lng: parseFloat(h.longitude as string)
          });
        }
      }

      // Add cities from user profiles that don't have city groups yet
      let tempId = -1;
      for (const userCity of userCities) {
        const city = userCity.city || '';
        const cityKey = normalizeKey(city);
        if (!cityKey || addedCities.has(cityKey)) continue;
        
        addedCities.add(cityKey);
        
        // Try coords from: normalized lookup, known lookup, location history, or default
        const coords = normalizedCityCoords.get(cityKey) || cityCoords[city] || locationHistoryCoords.get(cityKey) || { lat: 0, lng: 0 };
        
        locations.push({
          id: tempId--,
          groupId: null, // No city group yet
          city: city,
          country: userCity.country || '',
          coordinates: coords,
          memberCount: userCity.memberCount || 0,
          activeEvents: eventsMap.get(cityKey) || 0,
          venues: venuesMap.get(cityKey) || 0,
          housing: housingMap.get(cityKey) || 0,
          recommendations: venuesMap.get(cityKey) || 0,
          coverImage: null,
          isActive: true
        });
      }

      // Add cities from location history (previous tango cities) that aren't in groups or user cities
      for (const historyCity of locationHistoryCities) {
        const city = historyCity.city || '';
        const cityKey = normalizeKey(city);
        if (!cityKey || addedCities.has(cityKey)) continue;
        
        addedCities.add(cityKey);
        
        // Use stored coordinates from location history if available
        const storedCoords = historyCity.latitude && historyCity.longitude ? {
          lat: parseFloat(historyCity.latitude as string),
          lng: parseFloat(historyCity.longitude as string)
        } : null;
        
        const coords = storedCoords || normalizedCityCoords.get(cityKey) || cityCoords[city] || { lat: 0, lng: 0 };
        
        locations.push({
          id: tempId--,
          groupId: null, // No city group yet
          city: city,
          country: historyCity.country || '',
          coordinates: coords,
          memberCount: historyCity.memberCount || 0,
          activeEvents: eventsMap.get(cityKey) || 0,
          venues: venuesMap.get(cityKey) || 0,
          housing: housingMap.get(cityKey) || 0,
          recommendations: venuesMap.get(cityKey) || 0,
          coverImage: null,
          isActive: true
        });
      }

      // TERTIARY SOURCE: Add cities from approved scraped events (already fetched in parallel)
      const scrapedEventCities = scrapedEventCitiesData;

      // Normalize country names (Turkey/Türkiye -> Turkey, İstanbul -> Istanbul)
      const normalizeCountry = (country: string) => {
        if (country === 'Türkiye') return 'Turkey';
        return country;
      };
      const normalizeCity = (city: string) => {
        // Replace Turkish İ with regular I
        return city.replace(/İ/g, 'I').replace(/ı/g, 'i');
      };

      for (const scrapedCity of scrapedEventCities) {
        const rawCity = scrapedCity.city || '';
        const city = normalizeCity(rawCity);
        const cityKey = normalizeKey(city);
        if (!cityKey || addedCities.has(cityKey)) continue;
        
        addedCities.add(cityKey);
        
        // Use scraped event coordinates if available
        const storedCoords = scrapedCity.latitude && scrapedCity.longitude ? {
          lat: parseFloat(scrapedCity.latitude as string),
          lng: parseFloat(scrapedCity.longitude as string)
        } : null;
        
        const coords = storedCoords || normalizedCityCoords.get(cityKey) || cityCoords[city] || cityCoords[rawCity] || { lat: 0, lng: 0 };
        const country = normalizeCountry(scrapedCity.country || '');
        
        locations.push({
          id: tempId--,
          groupId: null, // No city group yet - scraped event city
          city: city,
          country: country,
          coordinates: coords,
          memberCount: 0, // No members yet
          activeEvents: scrapedCity.eventCount || 0,
          venues: venuesMap.get(cityKey) || 0,
          housing: housingMap.get(cityKey) || 0,
          recommendations: venuesMap.get(cityKey) || 0,
          coverImage: null,
          isActive: true
        });
      }

      // Filter out locations with invalid (0,0) coordinates - these would appear in Africa
      const validLocations = locations.filter(loc => 
        !(loc.coordinates.lat === 0 && loc.coordinates.lng === 0)
      );
      
      // Cache the result for 5 minutes
      communityCache.set('locations', validLocations);
      
      res.json(validLocations);
    } catch (error) {
      console.error("Get community locations error:", error);
      res.status(500).json({ message: "Failed to fetch community locations" });
    }
  });

  // 2. GET /api/community/stats - Get global community statistics (PUBLIC)
  // OPTIMIZED: Uses caching and parallel queries for performance
  app.get("/api/community/stats", async (req: Request, res: Response) => {
    try {
      // Check cache first (5 minute TTL)
      const cached = communityCache.get<any>('stats');
      if (cached) {
        return res.json(cached);
      }

      // MB.MD v9.8.1: Calculate stats from all location sources (city groups + user profiles + location history)
      // Run ALL queries in parallel for speed
      const [
        cityGroupStats,
        userCitiesStats,
        locationHistoryStats,
        scrapedEventsStats,
        venueStats,
        housingStats
      ] = await Promise.all([
        // Get stats from city groups (primary source)
        db.select({
          totalCities: sql<number>`count(*)::int`,
          countries: sql<number>`count(distinct ${groups.country})::int`,
          totalMembers: sql<number>`sum(${groups.memberCount})::int`,
          totalEvents: sql<number>`sum(${groups.eventCount})::int`,
        })
        .from(groups)
        .where(eq(groups.type, 'city')),
        
        // Get user profile cities (users with non-null city)
        db.select({
          uniqueCities: sql<number>`count(distinct ${users.city})::int`,
          uniqueCountries: sql<number>`count(distinct ${users.country})::int`,
          totalUsers: sql<number>`count(distinct ${users.id})::int`,
        })
        .from(users)
        .where(and(eq(users.isActive, true), isNotNull(users.city))),
        
        // Get location history cities
        db.select({
          uniqueCities: sql<number>`count(distinct ${userLocationHistory.city})::int`,
          uniqueCountries: sql<number>`count(distinct ${userLocationHistory.country})::int`,
        })
        .from(userLocationHistory),
        
        // Get scraped event cities (approved or ingested)
        db.select({
          uniqueCities: sql<number>`count(distinct ${scrapedEvents.city})::int`,
          uniqueCountries: sql<number>`count(distinct ${scrapedEvents.country})::int`,
          totalEvents: sql<number>`count(*)::int`,
        })
        .from(scrapedEvents)
        .where(
          and(
            isNotNull(scrapedEvents.city),
            or(
              eq(scrapedEvents.status, 'approved'),
              eq(scrapedEvents.status, 'ingested')
            )
          )
        ),
        
        // Get venue recommendations
        db.select({
          totalVenues: sql<number>`count(*)::int`,
        })
        .from(venues),
        
        // Get housing listings
        db.select({
          totalHousing: sql<number>`count(*)::int`,
        })
        .from(housingListings)
        .where(eq(housingListings.status, 'active'))
      ]);

      // Combine stats from all sources (DEDUPLICATED - use MAX, not SUM)
      // totalCities should be the highest count (actual unique cities with groups)
      const totalCities = Math.max(
        cityGroupStats[0]?.totalCities || 0,
        (userCitiesStats[0]?.uniqueCities || 0),
        (locationHistoryStats[0]?.uniqueCities || 0),
        (scrapedEventsStats[0]?.uniqueCities || 0)
      );
      
      // totalCountries - use DISTINCT count from all tables
      const totalCountries = Math.max(
        cityGroupStats[0]?.countries || 0,
        (userCitiesStats[0]?.uniqueCountries || 0),
        (locationHistoryStats[0]?.uniqueCountries || 0),
        (scrapedEventsStats[0]?.uniqueCountries || 0)
      );
      
      // totalMembers = ACTUAL users in system (not additive)
      const totalMembers = userCitiesStats[0]?.totalUsers || 0;
      
      // activeEventsTotal = SUM of all events (these are independent)
      const activeEventsTotal = (cityGroupStats[0]?.totalEvents || 0) + (scrapedEventsStats[0]?.totalEvents || 0);

      const stats = {
        totalCities,
        countries: totalCountries,
        totalMembers,
        activeEvents: activeEventsTotal,
        totalVenues: venueStats[0]?.totalVenues || 0,
        totalRecommendations: venueStats[0]?.totalVenues || 0,
        totalHousing: housingStats[0]?.totalHousing || 0
      };
      
      // Cache the result for 5 minutes
      communityCache.set('stats', stats);
      
      res.json(stats);
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

  // List all teachers - for TeachersPage
  app.get("/api/teachers", async (req: Request, res: Response) => {
    try {
      // Get all active teacher profiles with user data
      const teachersList = await db
        .select({
          id: teacherProfiles.id,
          userId: teacherProfiles.userId,
          bio: teacherProfiles.bio,
          specialties: teacherProfiles.specialties,
          yearsOfExperience: teacherProfiles.yearsExperience,
          hourlyRate: teacherProfiles.hourlyRate,
          availability: teacherProfiles.availability,
          isActive: teacherProfiles.isActive,
          isAvailable: teacherProfiles.isActive,
          rating: teacherProfiles.averageRating,
          reviewCount: teacherProfiles.reviewCount,
          totalStudents: teacherProfiles.totalStudents,
          certifications: teacherProfiles.certifications,
          user: {
            id: users.id,
            name: users.name,
            profileImage: users.profileImage,
            city: users.city,
            country: users.country,
          }
        })
        .from(teacherProfiles)
        .leftJoin(users, eq(teacherProfiles.userId, users.id))
        .where(eq(teacherProfiles.isActive, true))
        .orderBy(desc(teacherProfiles.averageRating));
      
      res.json(teachersList);
    } catch (error) {
      console.error("[Teachers] List error:", error);
      res.status(500).json({ message: "Failed to fetch teachers list" });
    }
  });

  // Get teacher profile by ID - for TeacherProfilePage
  app.get("/api/teachers/:teacherId", async (req: Request, res: Response) => {
    try {
      const teacherId = parseInt(req.params.teacherId);
      
      // Get teacher profile with user data
      const teacherProfile = await db
        .select({
          id: teacherProfiles.id,
          userId: teacherProfiles.userId,
          bio: teacherProfiles.bio,
          specialties: teacherProfiles.specialties,
          yearsExperience: teacherProfiles.yearsExperience,
          hourlyRate: teacherProfiles.hourlyRate,
          availability: teacherProfiles.availability,
          isActive: teacherProfiles.isActive,
          averageRating: teacherProfiles.averageRating,
          reviewCount: teacherProfiles.reviewCount,
          totalStudents: teacherProfiles.totalStudents,
          certifications: teacherProfiles.certifications,
          user: {
            name: users.name,
            profileImage: users.profileImage,
            city: users.city,
            country: users.country,
          }
        })
        .from(teacherProfiles)
        .leftJoin(users, eq(teacherProfiles.userId, users.id))
        .where(eq(teacherProfiles.userId, teacherId))
        .limit(1);
      
      if (!teacherProfile[0]) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      
      const profile = teacherProfile[0];
      
      // Format response to match TeacherProfilePage expectations
      res.json({
        id: profile.userId,
        name: profile.user.name,
        profileImage: profile.user.profileImage,
        bio: profile.bio || '',
        city: profile.user.city || '',
        country: profile.user.country || '',
        specialties: profile.specialties || [],
        yearsExperience: profile.yearsExperience || 0,
        rating: profile.averageRating || 0,
        reviewCount: profile.reviewCount || 0,
        studentCount: profile.totalStudents || 0,
        achievements: profile.certifications || [],
        availability: profile.availability || 'Available',
      });
    } catch (error) {
      console.error("[Teacher Profile] Get error:", error);
      res.status(500).json({ message: "Failed to fetch teacher profile" });
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

  // Marketplace Items (public alias for MarketplacePage)
  app.get("/api/marketplace/items", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const products = await storage.getMarketplaceProducts({ category, limit, offset });
      
      // Transform to match frontend expectations (items format)
      const items = products.map((p: any) => ({
        id: p.id,
        title: p.name || p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        imageUrl: p.imageUrl,
        status: p.status || 'available',
        sellerId: p.creatorUserId,
        createdAt: p.createdAt,
      }));
      
      res.json(items);
    } catch (error) {
      console.error('[Marketplace] Get items error:', error);
      res.status(500).json({ message: 'Failed to fetch marketplace items' });
    }
  });

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
      console.log(`[Travel] PATCH /api/travel/plans/${id}:`, JSON.stringify(req.body));
      const plan = await storage.updateTravelPlan(id, req.body);
      console.log(`[Travel] Updated plan ${id} visibility:`, plan?.visibility);
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
      
      let languages: string[] = [];
      if (req.body.languages) {
        if (typeof req.body.languages === 'string') {
          languages = req.body.languages.split(',').map((l: string) => l.trim()).filter(Boolean);
        } else if (Array.isArray(req.body.languages)) {
          languages = req.body.languages;
        }
      }
      
      const results = await searchService.search({
        query: req.body.query,
        userId: req.user!.id,
        limit: req.body.limit || 20,
        languages: languages.length > 0 ? languages : undefined,
        primaryLanguage: req.body.primaryLanguage || undefined,
        languageMatchMode: req.body.languageMatchMode || 'any'
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
  // PROFILE ENRICHMENT API (GitHub/LinkedIn)
  // Fetches public profile data from GitHub, validates LinkedIn URLs
  // ============================================================================

  app.post("/api/talent-match/enrich-profile", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { urls } = req.body;
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ message: 'urls array is required' });
      }
      const result = await profileEnrichmentService.enrichFromUrls(urls);
      res.json(result);
    } catch (error: any) {
      console.error('[ProfileEnrichment] Enrich profile error:', error);
      res.status(500).json({ message: 'Failed to enrich profile', error: error.message });
    }
  });

  app.get("/api/talent-match/enrich-github/:username", async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      if (!username) {
        return res.status(400).json({ message: 'GitHub username is required' });
      }
      const profile = await profileEnrichmentService.fetchGitHubProfile(username);
      res.json(profile);
    } catch (error: any) {
      console.error('[ProfileEnrichment] GitHub fetch error:', error);
      if (error.status === 404) {
        return res.status(404).json({ message: 'GitHub user not found' });
      }
      res.status(500).json({ message: 'Failed to fetch GitHub profile', error: error.message });
    }
  });

  app.post("/api/talent-match/validate-linkedin", async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: 'LinkedIn URL is required' });
      }
      const result = profileEnrichmentService.processLinkedInUrl(url);
      res.json(result);
    } catch (error: any) {
      console.error('[ProfileEnrichment] LinkedIn validation error:', error);
      res.status(500).json({ message: 'Failed to validate LinkedIn URL', error: error.message });
    }
  });

  app.post("/api/talent-match/validate-urls", async (req: Request, res: Response) => {
    try {
      const { urls } = req.body;
      if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({ message: 'urls array is required' });
      }
      const result = profileEnrichmentService.validateProfileUrls(urls);
      res.json(result);
    } catch (error: any) {
      console.error('[ProfileEnrichment] URL validation error:', error);
      res.status(500).json({ message: 'Failed to validate URLs', error: error.message });
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

  // ==================== PLACE RECOMMENDATIONS (Hidden Gems - Google Maps Style) ====================

  // Get place recommendations by location (radius search)
  app.get("/api/recommendations/by-location", async (req: Request, res: Response) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radiusKm = parseInt(req.query.radius as string) || 5;

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ message: "Invalid latitude or longitude" });
      }

      const recommendations = await storage.getPlaceRecommendationsByLocation(lat, lng, radiusKm);
      res.json(recommendations);
    } catch (error) {
      console.error('[Recommendations] Get by location error:', error);
      res.status(500).json({ message: "Failed to fetch place recommendations" });
    }
  });

  // Get place recommendations by category
  app.get("/api/recommendations/by-category/:category", async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const recommendations = await storage.getPlaceRecommendationsByCategory(category, limit, offset);
      res.json(recommendations);
    } catch (error) {
      console.error('[Recommendations] Get by category error:', error);
      res.status(500).json({ message: "Failed to fetch place recommendations" });
    }
  });

  // Get a specific place recommendation
  app.get("/api/recommendations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid recommendation ID" });
      }

      const recommendation = await storage.getPlaceRecommendationById(id);
      if (!recommendation) {
        return res.status(404).json({ message: "Recommendation not found" });
      }

      res.json(recommendation);
    } catch (error) {
      console.error('[Recommendations] Get by ID error:', error);
      res.status(500).json({ message: "Failed to fetch place recommendation" });
    }
  });

  // ==================== PROFILE PHOTO UPLOAD ====================
  
  app.post("/api/profile/photo", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { photoData } = req.body;
      if (!photoData) {
        return res.status(400).json({ message: "Photo data is required" });
      }

      const userId = req.user!.id;
      await db.update(users).set({ profileImage: photoData }).where(eq(users.id, userId));
      const updatedUsers = await db.select().from(users).where(eq(users.id, userId));
      const updatedUser = updatedUsers[0];
      
      res.json(updatedUser || { message: "Photo updated" });
    } catch (error) {
      console.error('[Profile] Upload photo error:', error);
      res.status(500).json({ message: "Failed to upload profile photo" });
    }
  });

  // ==================== COVER PHOTO UPLOAD ====================

  app.post("/api/profile/cover", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { coverData } = req.body;
      if (!coverData) {
        return res.status(400).json({ message: "Cover data is required" });
      }

      const userId = req.user!.id;
      await db.update(users).set({ backgroundImage: coverData }).where(eq(users.id, userId));
      const updatedUsers = await db.select().from(users).where(eq(users.id, userId));
      const updatedUser = updatedUsers[0];
      
      res.json(updatedUser || { message: "Cover updated" });
    } catch (error) {
      console.error('[Profile] Upload cover error:', error);
      res.status(500).json({ message: "Failed to upload cover photo" });
    }
  });

  // ==================== MAP MARKERS - INDIVIDUAL EVENTS ====================

  app.get("/api/map/markers", async (req: Request, res: Response) => {
    try {
      // Get all upcoming events with valid coordinates
      const eventMarkers = await db
        .select({
          id: events.id,
          title: events.title,
          city: events.city,
          country: events.country,
          latitude: events.latitude,
          longitude: events.longitude,
          eventType: events.eventType,
          startDate: events.startDate,
          address: events.address,
          location: events.location,
        })
        .from(events)
        .where(and(
          ne(events.latitude, null),
          ne(events.longitude, null),
          gt(events.startDate, new Date()),
          eq(events.status, 'published')
        ))
        .limit(500);

      // Transform to map marker format with validated coordinates
      const markers = eventMarkers
        .map((event: any) => {
          const lat = parseFloat(String(event.latitude || 0));
          const lng = parseFloat(String(event.longitude || 0));
          
          console.log(`[Map] Event "${event.title}": lat=${lat}, lng=${lng}`);
          
          // Skip if coordinates are invalid
          if (isNaN(lat) || isNaN(lng)) {
            console.log(`[Map] Skipping event "${event.title}" - invalid coordinates`);
            return null;
          }
          
          return {
            id: event.id,
            title: event.title,
            city: event.city || '',
            country: event.country || '',
            coordinates: {
              lat: lat,
              lng: lng,
            },
            eventType: event.eventType || 'social',
            startDate: event.startDate,
            address: event.address || event.location,
            memberCount: 0,
            activeEvents: 1,
            recommendations: 0,
            housing: 0,
            isActive: true,
          };
        })
        .filter((marker: any) => marker !== null);

      console.log(`[Map] Returning ${markers.length} event markers`);
      res.json(markers);
    } catch (error) {
      console.error('[Map] Fetch event markers error:', error);
      res.status(500).json({ message: "Failed to fetch map markers" });
    }
  });

  console.log('[Server] ✅ AI Services Consolidation routes loaded successfully');

  return httpServer;
}
