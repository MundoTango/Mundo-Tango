console.log("🔍 [DEBUG] Starting server/routes.ts module loading...");
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import authRoutes from "./routes/auth";
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
import mrBlueEnhancedRoutes from "./routes/mr-blue-enhanced";
import visualEditorRoutes from "./routes/visualEditor";
import whisperRoutes from "./routes/whisper";
import openaiRealtimeRoutes from "./routes/openai-realtime";
import realtimeVoiceRoutes, { initRealtimeVoiceWebSocket } from "./routes/realtimeVoice";
import { initLivestreamWebSocket } from "./services/livestream-websocket";
import rbacRoutes from "./routes/rbac-routes";
import featureFlagsRoutes from "./routes/feature-flags-routes";
import pricingRoutes from "./routes/pricing-routes";
import planRoutes from "./routes/plan-routes";
import syncRoutes from "./routes/sync-routes";
import selfHealingRoutes from "./routes/self-healing-routes";
import agentHealthRoutes from "./routes/agent-health-routes";
import predictiveContextRoutes from "./routes/predictive-context-routes";
import aiEnhanceRoutes from "./routes/ai-enhance";
import userSearchRoutes from "./routes/user-search";
import locationSearchRoutes from "./routes/location-search";
import housingRoutes from "./routes/housing-routes";
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
import eventRoutes from "./routes/event-routes";
import groupRoutes from "./routes/group-routes";
console.log("🔍 [DEBUG] About to import agentIntelligenceRoutes...");
import agentIntelligenceRoutes from "./routes/agentIntelligenceRoutes";
console.log("✅ [DEBUG] agentIntelligenceRoutes loaded");
import agentCommunicationRoutes from "./routes/agentCommunicationRoutes";
import knowledgeRoutes from "./routes/knowledgeRoutes";
import monitoringRoutes from "./routes/monitoringRoutes";
import multiAIRoutes from "./routes/multiAIRoutes";
import documentationGovernanceRoutes from "./routes/documentation-governance-routes";
import learningIndexRoutes from "./routes/learningIndexRoutes";
import { authenticateToken, AuthRequest, requireRoleLevel } from "./middleware/auth";
import { wsNotificationService } from "./services/websocket-notification-service";
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
  travelPlans,
  travelPlanItems,
  contactSubmissions,
  stories,
  storyViews,
  venueRecommendations,
  insertTravelPlanSchema,
  insertContactSubmissionSchema,
  insertStorySchema,
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
} from "@shared/schema";
import { 
  esaAgents,
  agentTasks,
  agentCommunications
} from "@shared/platform-schema";
import { db } from "@shared/db";
import { eq, and, or, desc, sql, isNotNull, gte } from "drizzle-orm";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { cityscapeService } from "./services/cityscape-service";
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
  // Phase 1 & 2 Deployment Blocker Routes
  app.use("/api/rbac", rbacRoutes);
  app.use("/api/feature-flags", featureFlagsRoutes);
  app.use("/api/pricing", pricingRoutes);
  
  // Phase 3 Deployment Blocker Routes
  app.use("/api/plan", planRoutes);
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
  
  // BATCH 16: Multi-AI Orchestration Routes
  app.use("/api/ai/multi", multiAIRoutes);
  
  // BATCH 29: Documentation Governance System
  app.use("/api/documentation", documentationGovernanceRoutes);
  
  // Learning Index API Routes
  app.use("/api/learning", learningIndexRoutes);
  
  // Existing routes
  app.use("/api/auth", authRoutes);
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
  app.use("/api", createFriendsRoutes(storage));
  app.use("/api", createAnalyticsRoutes(storage));
  app.use("/api", createBookmarkRoutes(storage));
  app.use("/api/avatar", avatarRoutes);
  app.use("/api/videos", videoRoutes);
  app.use("/api/mrblue", mrblueVideoRoutes);
  app.use("/api/mrblue", mrBlueRoutes);
  app.use(mrBlueEnhancedRoutes); // Enhanced Mr. Blue with troubleshooting KB
  app.use("/api/visual-editor", authenticateToken, visualEditorRoutes);
  app.use("/api/whisper", authenticateToken, whisperRoutes);
  app.use("/api/realtime", authenticateToken, realtimeVoiceRoutes);
  app.use("/api/openai-realtime", authenticateToken, openaiRealtimeRoutes);
  app.use("/api/ai", aiEnhanceRoutes);
  app.use("/api/user", userSearchRoutes);
  app.use("/api/locations", locationSearchRoutes);
  
  // Phase B: New feature routes
  app.use("/api/housing", housingRoutes);
  app.use("/api/livestreams", livestreamRoutes);
  app.use("/api/marketplace", marketplaceRoutes);
  app.use("/api/subscriptions", subscriptionRoutes);
  
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
  app.use("/api/groups", groupRoutes);

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

  app.post("/api/posts", authenticateToken, validateRequest(createPostBodySchema), async (req: AuthRequest, res: Response) => {
    try {
      const post = await storage.createPost({
        ...req.body,
        userId: req.user!.id
      });

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

  app.get("/api/posts", async (req: Request & { userId?: number; user?: any }, res: Response) => {
    try {
      const { userId, limit = "20", offset = "0" } = req.query;
      const currentUserId = req.user?.id; // From auth middleware if authenticated (optional for public route)
      const posts = await storage.getPosts({
        userId: userId ? parseInt(userId as string) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        currentUserId: currentUserId,
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

      res.json({ 
        reactions: reactionsObject,
        userReaction,
        totalReactions: totalCount
      });
    } catch (error) {
      console.error('React to post error:', error);
      res.status(500).json({ message: "Failed to react to post" });
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

  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      const { city, eventType, startDate, endDate, limit = "20", offset = "0" } = req.query;
      
      const params: any = {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };
      
      if (city) params.city = city as string;
      if (eventType) params.eventType = eventType as string;
      if (startDate) params.startDate = new Date(startDate as string);
      if (endDate) params.endDate = new Date(endDate as string);
      
      const events = await storage.getEvents(params);
      res.json({ events, total: events.length });
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

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
      .where(and(
        eq(chatMessages.receiverId, req.user!.id),
        eq(chatMessages.isRead, false)
      ));
      
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

  // ============================================================================
  // GROUPS - Additional routes (main routes are above around line 579)
  // ============================================================================

  // Get Group by ID
  app.get("/api/groups/:id", async (req: Request, res: Response) => {
    try {
      const group = await storage.getGroupById(parseInt(req.params.id));
      if (!group) return res.status(404).json({ message: "Group not found" });
      res.json(group);
    } catch (error) {
      console.error("Get group error:", error);
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });

  // Search Groups
  app.get("/api/groups", async (req: Request, res: Response) => {
    try {
      const { search, limit, offset } = req.query;
      const groups = await storage.getGroups({
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(groups);
    } catch (error) {
      console.error("Search groups error:", error);
      res.status(500).json({ message: "Failed to search groups" });
    }
  });

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
  // EVENTS - COMPREHENSIVE API ROUTES
  // ============================================================================

  // Search Events (Enhanced)
  app.get("/api/events/search", async (req: Request, res: Response) => {
    try {
      const { query, eventType, city, startDate, endDate, musicStyle, limit, offset } = req.query;
      const events = await storage.searchEvents({
        query: query as string,
        eventType: eventType as string,
        city: city as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        musicStyle: musicStyle as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(events);
    } catch (error) {
      console.error("Search events error:", error);
      res.status(500).json({ message: "Failed to search events" });
    }
  });

  // Update Event
  app.put("/api/events/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const event = await storage.updateEvent(parseInt(req.params.id), req.body);
      if (!event) return res.status(404).json({ message: "Event not found" });
      res.json(event);
    } catch (error) {
      console.error("Update event error:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  // Delete Event
  app.delete("/api/events/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteEvent(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Delete event error:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Check-in Event Attendee
  app.post("/api/events/:eventId/rsvps/:userId/check-in", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const rsvp = await storage.checkInEventAttendee(parseInt(req.params.eventId), parseInt(req.params.userId));
      if (!rsvp) return res.status(404).json({ message: "RSVP not found" });
      res.json(rsvp);
    } catch (error) {
      console.error("Check-in attendee error:", error);
      res.status(500).json({ message: "Failed to check-in attendee" });
    }
  });

  // Add to Waitlist
  app.post("/api/events/:id/waitlist", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const rsvp = await storage.addToWaitlist(parseInt(req.params.id), req.user!.id, req.body.guestCount);
      res.status(201).json(rsvp);
    } catch (error) {
      console.error("Add to waitlist error:", error);
      res.status(500).json({ message: "Failed to add to waitlist" });
    }
  });

  // Get Event Waitlist
  app.get("/api/events/:id/waitlist", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const waitlist = await storage.getEventWaitlist(parseInt(req.params.id));
      res.json(waitlist);
    } catch (error) {
      console.error("Get waitlist error:", error);
      res.status(500).json({ message: "Failed to fetch waitlist" });
    }
  });

  // Upload Event Photo
  app.post("/api/events/:id/photos", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const photo = await storage.uploadEventPhoto({
        eventId: parseInt(req.params.id),
        uploaderId: req.user!.id,
        ...req.body,
      });
      res.status(201).json(photo);
    } catch (error) {
      console.error("Upload event photo error:", error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  // Get Event Photos
  app.get("/api/events/:id/photos", async (req: Request, res: Response) => {
    try {
      const photos = await storage.getEventPhotos(parseInt(req.params.id));
      res.json(photos);
    } catch (error) {
      console.error("Get event photos error:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // Delete Event Photo
  app.delete("/api/events/photos/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteEventPhoto(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Delete event photo error:", error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Feature Event Photo
  app.post("/api/events/photos/:id/feature", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.featureEventPhoto(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Feature event photo error:", error);
      res.status(500).json({ message: "Failed to feature photo" });
    }
  });

  // Unfeature Event Photo
  app.post("/api/events/photos/:id/unfeature", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.unfeatureEventPhoto(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Unfeature event photo error:", error);
      res.status(500).json({ message: "Failed to unfeature photo" });
    }
  });

  // Create Event Comment
  app.post("/api/events/:id/comments", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const comment = await storage.createEventComment({
        eventId: parseInt(req.params.id),
        userId: req.user!.id,
        content: req.body.content,
        parentCommentId: req.body.parentCommentId,
      });
      res.status(201).json(comment);
    } catch (error) {
      console.error("Create event comment error:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Get Event Comments
  app.get("/api/events/:id/comments", async (req: Request, res: Response) => {
    try {
      const comments = await storage.getEventComments(parseInt(req.params.id));
      res.json(comments);
    } catch (error) {
      console.error("Get event comments error:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Update Event Comment
  app.put("/api/events/comments/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const comment = await storage.updateEventComment(parseInt(req.params.id), req.body.content);
      if (!comment) return res.status(404).json({ message: "Comment not found" });
      res.json(comment);
    } catch (error) {
      console.error("Update event comment error:", error);
      res.status(500).json({ message: "Failed to update comment" });
    }
  });

  // Delete Event Comment
  app.delete("/api/events/comments/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteEventComment(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Delete event comment error:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Create Event Reminder
  app.post("/api/events/rsvps/:rsvpId/reminders", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const reminder = await storage.createEventReminder({
        rsvpId: parseInt(req.params.rsvpId),
        ...req.body,
      });
      res.status(201).json(reminder);
    } catch (error) {
      console.error("Create event reminder error:", error);
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  // Get Event Reminders
  app.get("/api/events/rsvps/:rsvpId/reminders", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const reminders = await storage.getEventReminders(parseInt(req.params.rsvpId));
      res.json(reminders);
    } catch (error) {
      console.error("Get event reminders error:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
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
  // STORIES SYSTEM APIs (PART 1-11) - 6 endpoints
  // ============================================================================

  // 1. POST /api/stories - Create a new story
  app.post("/api/stories", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

      const [story] = await db.insert(stories)
        .values({
          userId: req.user!.id,
          mediaUrl: req.body.mediaUrl,
          mediaType: req.body.mediaType,
          caption: req.body.caption || null,
          expiresAt,
          type: req.body.type || 'media', // Default type
          isActive: true
        })
        .returning();

      res.status(201).json(story);
    } catch (error) {
      console.error("Create story error:", error);
      res.status(500).json({ message: "Failed to create story" });
    }
  });

  // 2. GET /api/stories - Get all active stories (not expired)
  app.get("/api/stories", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const activeStories = await db.select()
        .from(stories)
        .where(and(
          gte(stories.expiresAt, new Date()),
          eq(stories.isActive, true)
        ))
        .orderBy(desc(stories.createdAt));

      res.json(activeStories);
    } catch (error) {
      console.error("Get stories error:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  // 3. GET /api/stories/:id - Get story by ID
  app.get("/api/stories/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const storyId = parseInt(req.params.id);
      
      const [story] = await db.select()
        .from(stories)
        .where(eq(stories.id, storyId));

      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }

      res.json(story);
    } catch (error) {
      console.error("Get story error:", error);
      res.status(500).json({ message: "Failed to fetch story" });
    }
  });

  // 4. DELETE /api/stories/:id - Delete story
  app.delete("/api/stories/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const storyId = parseInt(req.params.id);
      
      const [story] = await db.select()
        .from(stories)
        .where(eq(stories.id, storyId));

      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }

      if (story.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this story" });
      }

      await db.delete(stories).where(eq(stories.id, storyId));

      res.json({ message: "Story deleted successfully" });
    } catch (error) {
      console.error("Delete story error:", error);
      res.status(500).json({ message: "Failed to delete story" });
    }
  });

  // 5. POST /api/stories/:id/view - Track story view
  app.post("/api/stories/:id/view", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const storyId = parseInt(req.params.id);
      
      // Check if user already viewed this story
      const existingView = await db.select()
        .from(storyViews)
        .where(and(
          eq(storyViews.storyId, storyId),
          eq(storyViews.viewerId, req.user!.id)
        ));

      if (existingView.length === 0) {
        // Record new view
        await db.insert(storyViews).values({
          storyId,
          viewerId: req.user!.id
        });

        // Increment view count
        await db.update(stories)
          .set({ viewCount: sql`${stories.viewCount} + 1` })
          .where(eq(stories.id, storyId));
      }

      res.json({ message: "View recorded" });
    } catch (error) {
      console.error("Track story view error:", error);
      res.status(500).json({ message: "Failed to track view" });
    }
  });

  // 6. GET /api/stories/:id/viewers - Get story viewers
  app.get("/api/stories/:id/viewers", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const storyId = parseInt(req.params.id);
      
      const viewers = await db.select({
        id: users.id,
        name: users.name,
        profileImage: users.profileImage,
        viewedAt: storyViews.createdAt
      })
      .from(storyViews)
      .innerJoin(users, eq(storyViews.viewerId, users.id))
      .where(eq(storyViews.storyId, storyId))
      .orderBy(desc(storyViews.createdAt));

      res.json(viewers);
    } catch (error) {
      console.error("Get story viewers error:", error);
      res.status(500).json({ message: "Failed to fetch viewers" });
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

      res.json({
        views,
        followers,
        following,
        connections,
        completionPercentage,
        totalPosts: user.postCount || 0,
        totalEvents: user.eventCount || 0,
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
      const profile = await storage.createDjProfile({ ...validated, userId: req.user!.id });
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
      const profile = await storage.getDjProfile(parseInt(req.params.userId));
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
      const profile = await storage.updateDjProfile(req.user!.id, validated);
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
      await storage.deleteDjProfile(req.user!.id);
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
      const results = await storage.searchDjProfiles(filters);
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

  return httpServer;
}
