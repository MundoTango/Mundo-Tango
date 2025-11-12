import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { z } from "zod";
import {
  updateTeacherProfileSchema,
  updateDJProfileSchema,
  updatePhotographerProfileSchema,
  updatePerformerProfileSchema,
  updateVendorProfileSchema,
  updateMusicianProfileSchema,
  updateChoreographerProfileSchema,
  updateTangoSchoolProfileSchema,
  updateTangoHotelProfileSchema,
  updateWellnessProfileSchema,
  updateTourOperatorProfileSchema,
  updateHostVenueProfileSchema,
  updateTangoGuideProfileSchema,
  updateContentCreatorProfileSchema,
  updateLearningResourceProfileSchema,
  updateTaxiDancerProfileSchema,
  updateOrganizerProfileSchema,
  insertTeacherProfileSchema,
  insertDJProfileSchema,
  insertPhotographerProfileSchema,
  insertPerformerProfileSchema,
  insertVendorProfileSchema,
  insertMusicianProfileSchema,
  insertChoreographerProfileSchema,
  insertTangoSchoolProfileSchema,
  insertTangoHotelProfileSchema,
  insertWellnessProfileSchema,
  insertTourOperatorProfileSchema,
  insertHostVenueProfileSchema,
  insertTangoGuideProfileSchema,
  insertContentCreatorProfileSchema,
  insertLearningResourceProfileSchema,
  insertTaxiDancerProfileSchema,
  insertOrganizerProfileSchema,
} from "@shared/schema";
import { requireOwnerOrAdmin } from "../middleware/profilePermissions";

const router = Router();

// ============================================================================
// PROFILE CORE ROUTES (BATCH 02-03)
// ============================================================================

// GET /api/profile/:userId - Get user's complete profile
router.get("/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[Profile] Error fetching profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// PUT /api/profile/:userId - Update basic profile
router.put("/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ownership validation: users can only edit own profiles
    if (req.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const updateSchema = z.object({
      name: z.string().optional(),
      bio: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      profilePicture: z.string().optional(),
      coverPhoto: z.string().optional(),
      phone: z.string().optional(),
      website: z.string().optional(),
      socialLinks: z.record(z.string()).optional(),
      languages: z.array(z.string()).optional(),
      timezone: z.string().optional(),
      currency: z.string().optional(),
    });

    const validatedData = updateSchema.parse(req.body);
    
    const updatedProfile = await storage.updateUserProfile(userId, validatedData);

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
    console.error("[Profile] Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// GET /api/profile/:userId/public - Get public view of profile
router.get("/:userId/public", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const publicProfile = await storage.getPublicProfile(userId);

    if (!publicProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(publicProfile);
  } catch (error) {
    console.error("[Profile] Error fetching public profile:", error);
    res.status(500).json({ message: "Failed to fetch public profile" });
  }
});

// GET /api/profile/:userId/settings - Get profile settings
router.get("/:userId/settings", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ownership validation: users can only view own settings
    if (req.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only view your own settings" });
    }

    const settings = await storage.getUserSettings(userId);

    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    res.json(settings);
  } catch (error) {
    console.error("[Profile] Error fetching settings:", error);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// PUT /api/profile/:userId/settings - Update settings
router.put("/:userId/settings", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ownership validation: users can only update own settings
    if (req.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own settings" });
    }

    const settingsSchema = z.object({
      emailNotifications: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
      privacyLevel: z.enum(['public', 'friends', 'private']).optional(),
      showOnlineStatus: z.boolean().optional(),
      allowMessagesFrom: z.enum(['everyone', 'friends', 'nobody']).optional(),
      language: z.string().optional(),
      timezone: z.string().optional(),
      theme: z.enum(['light', 'dark', 'auto']).optional(),
    });

    const validatedData = settingsSchema.parse(req.body);
    
    const updatedSettings = await storage.updateUserSettings(userId, validatedData);

    if (!updatedSettings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    res.json(updatedSettings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid data", 
        errors: error.errors 
      });
    }
    console.error("[Profile] Error updating settings:", error);
    res.status(500).json({ message: "Failed to update settings" });
  }
});

// POST /api/profile/:userId/view - Track profile view
router.post("/:userId/view", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const viewedUserId = parseInt(req.params.userId);
    
    if (isNaN(viewedUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (req.userId === viewedUserId) {
      return res.status(400).json({ message: "Cannot track views of own profile" });
    }

    await storage.trackProfileView(req.userId, viewedUserId);

    res.json({ success: true, message: "Profile view tracked" });
  } catch (error) {
    console.error("[Profile] Error tracking profile view:", error);
    res.status(500).json({ message: "Failed to track profile view" });
  }
});

// GET /api/profile/:userId/stats - Get profile statistics
router.get("/:userId/stats", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const stats = await storage.getProfileStats(userId);

    res.json(stats);
  } catch (error) {
    console.error("[Profile] Error fetching profile stats:", error);
    res.status(500).json({ message: "Failed to fetch profile stats" });
  }
});

// GET /api/profile/:userId/analytics - Get profile analytics
router.get("/:userId/analytics", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const analytics = await storage.getProfileAnalytics(userId);

    res.json(analytics);
  } catch (error) {
    console.error("[Profile] Error fetching profile analytics:", error);
    res.status(500).json({ message: "Failed to fetch profile analytics" });
  }
});

// GET /api/profile/:userId/insights - Get profile insights
router.get("/:userId/insights", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const insights = await storage.getProfileInsights(userId);

    res.json(insights);
  } catch (error) {
    console.error("[Profile] Error fetching profile insights:", error);
    res.status(500).json({ message: "Failed to fetch profile insights" });
  }
});

// GET /api/profile/search - Search profiles
router.get("/search", async (req: Request, res: Response) => {
  try {
    const {
      query,
      city,
      country,
      role,
      limit = "20",
      offset = "0"
    } = req.query;

    const profiles = await storage.searchProfiles({
      query: query as string,
      city: city as string,
      country: country as string,
      role: role as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    res.json(profiles);
  } catch (error) {
    console.error("[Profile] Error searching profiles:", error);
    res.status(500).json({ message: "Failed to search profiles" });
  }
});

// ============================================================================
// GENERIC PROFILE TYPE ROUTES (BATCH 03)
// ============================================================================

// Profile type mapping for dynamic routes
const PROFILE_TYPE_MAPPING: Record<string, {
  getMethod: string;
  createMethod: string;
  updateMethod: string;
  deleteMethod: string;
  insertSchema: any;
  updateSchema: any;
}> = {
  teacher: {
    getMethod: 'getTeacherProfile',
    createMethod: 'createTeacherProfile',
    updateMethod: 'updateTeacherProfile',
    deleteMethod: 'deleteTeacherProfile',
    insertSchema: insertTeacherProfileSchema,
    updateSchema: updateTeacherProfileSchema,
  },
  dj: {
    getMethod: 'getDJProfile',
    createMethod: 'createDJProfile',
    updateMethod: 'updateDJProfile',
    deleteMethod: 'deleteDJProfile',
    insertSchema: insertDJProfileSchema,
    updateSchema: updateDJProfileSchema,
  },
  photographer: {
    getMethod: 'getPhotographerProfile',
    createMethod: 'createPhotographerProfile',
    updateMethod: 'updatePhotographerProfile',
    deleteMethod: 'deletePhotographerProfile',
    insertSchema: insertPhotographerProfileSchema,
    updateSchema: updatePhotographerProfileSchema,
  },
  performer: {
    getMethod: 'getPerformerProfile',
    createMethod: 'createPerformerProfile',
    updateMethod: 'updatePerformerProfile',
    deleteMethod: 'deletePerformerProfile',
    insertSchema: insertPerformerProfileSchema,
    updateSchema: updatePerformerProfileSchema,
  },
  vendor: {
    getMethod: 'getVendorProfile',
    createMethod: 'createVendorProfile',
    updateMethod: 'updateVendorProfile',
    deleteMethod: 'deleteVendorProfile',
    insertSchema: insertVendorProfileSchema,
    updateSchema: updateVendorProfileSchema,
  },
  musician: {
    getMethod: 'getMusicianProfile',
    createMethod: 'createMusicianProfile',
    updateMethod: 'updateMusicianProfile',
    deleteMethod: 'deleteMusicianProfile',
    insertSchema: insertMusicianProfileSchema,
    updateSchema: updateMusicianProfileSchema,
  },
  choreographer: {
    getMethod: 'getChoreographerProfile',
    createMethod: 'createChoreographerProfile',
    updateMethod: 'updateChoreographerProfile',
    deleteMethod: 'deleteChoreographerProfile',
    insertSchema: insertChoreographerProfileSchema,
    updateSchema: updateChoreographerProfileSchema,
  },
  tango_school: {
    getMethod: 'getTangoSchoolProfile',
    createMethod: 'createTangoSchoolProfile',
    updateMethod: 'updateTangoSchoolProfile',
    deleteMethod: 'deleteTangoSchoolProfile',
    insertSchema: insertTangoSchoolProfileSchema,
    updateSchema: updateTangoSchoolProfileSchema,
  },
  tango_hotel: {
    getMethod: 'getTangoHotelProfile',
    createMethod: 'createTangoHotelProfile',
    updateMethod: 'updateTangoHotelProfile',
    deleteMethod: 'deleteTangoHotelProfile',
    insertSchema: insertTangoHotelProfileSchema,
    updateSchema: updateTangoHotelProfileSchema,
  },
  wellness: {
    getMethod: 'getWellnessProfile',
    createMethod: 'createWellnessProfile',
    updateMethod: 'updateWellnessProfile',
    deleteMethod: 'deleteWellnessProfile',
    insertSchema: insertWellnessProfileSchema,
    updateSchema: updateWellnessProfileSchema,
  },
  tour_operator: {
    getMethod: 'getTourOperatorProfile',
    createMethod: 'createTourOperatorProfile',
    updateMethod: 'updateTourOperatorProfile',
    deleteMethod: 'deleteTourOperatorProfile',
    insertSchema: insertTourOperatorProfileSchema,
    updateSchema: updateTourOperatorProfileSchema,
  },
  host_venue: {
    getMethod: 'getHostVenueProfile',
    createMethod: 'createHostVenueProfile',
    updateMethod: 'updateHostVenueProfile',
    deleteMethod: 'deleteHostVenueProfile',
    insertSchema: insertHostVenueProfileSchema,
    updateSchema: updateHostVenueProfileSchema,
  },
  tango_guide: {
    getMethod: 'getTangoGuideProfile',
    createMethod: 'createTangoGuideProfile',
    updateMethod: 'updateTangoGuideProfile',
    deleteMethod: 'deleteTangoGuideProfile',
    insertSchema: insertTangoGuideProfileSchema,
    updateSchema: updateTangoGuideProfileSchema,
  },
  content_creator: {
    getMethod: 'getContentCreatorProfile',
    createMethod: 'createContentCreatorProfile',
    updateMethod: 'updateContentCreatorProfile',
    deleteMethod: 'deleteContentCreatorProfile',
    insertSchema: insertContentCreatorProfileSchema,
    updateSchema: updateContentCreatorProfileSchema,
  },
  learning_resource: {
    getMethod: 'getLearningResourceProfile',
    createMethod: 'createLearningResourceProfile',
    updateMethod: 'updateLearningResourceProfile',
    deleteMethod: 'deleteLearningResourceProfile',
    insertSchema: insertLearningResourceProfileSchema,
    updateSchema: updateLearningResourceProfileSchema,
  },
  taxi_dancer: {
    getMethod: 'getTaxiDancerProfile',
    createMethod: 'createTaxiDancerProfile',
    updateMethod: 'updateTaxiDancerProfile',
    deleteMethod: 'deleteTaxiDancerProfile',
    insertSchema: insertTaxiDancerProfileSchema,
    updateSchema: updateTaxiDancerProfileSchema,
  },
  organizer: {
    getMethod: 'getOrganizerProfile',
    createMethod: 'createOrganizerProfile',
    updateMethod: 'updateOrganizerProfile',
    deleteMethod: 'deleteOrganizerProfile',
    insertSchema: insertOrganizerProfileSchema,
    updateSchema: updateOrganizerProfileSchema,
  },
};

// GET /api/profile/:userId/type/:profileType - Get specific profile type
router.get("/:userId/type/:profileType", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { profileType } = req.params;
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const typeConfig = PROFILE_TYPE_MAPPING[profileType];
    if (!typeConfig) {
      return res.status(400).json({ 
        message: "Invalid profile type",
        validTypes: Object.keys(PROFILE_TYPE_MAPPING)
      });
    }

    const getMethod = typeConfig.getMethod as keyof typeof storage;
    const profile = await (storage[getMethod] as any)(userId);

    if (!profile) {
      return res.status(404).json({ message: `${profileType} profile not found` });
    }

    res.json(profile);
  } catch (error) {
    console.error(`[Profile] Error fetching ${req.params.profileType} profile:`, error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// PUT /api/profile/:userId/type/:profileType - Update specific profile type
router.put("/:userId/type/:profileType", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { profileType } = req.params;
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ownership validation: users can only edit own profiles
    if (req.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const typeConfig = PROFILE_TYPE_MAPPING[profileType];
    if (!typeConfig) {
      return res.status(400).json({ 
        message: "Invalid profile type",
        validTypes: Object.keys(PROFILE_TYPE_MAPPING)
      });
    }

    const validatedData = typeConfig.updateSchema.parse(req.body);
    const updateMethod = typeConfig.updateMethod as keyof typeof storage;
    const profile = await (storage[updateMethod] as any)(userId, validatedData);

    if (!profile) {
      return res.status(404).json({ message: `${profileType} profile not found` });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid data", 
        errors: error.errors 
      });
    }
    console.error(`[Profile] Error updating ${req.params.profileType} profile:`, error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// DELETE /api/profile/:userId/type/:profileType - Delete specific profile type
router.delete("/:userId/type/:profileType", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { profileType } = req.params;
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ownership validation: users can only delete own profiles
    if (req.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    const typeConfig = PROFILE_TYPE_MAPPING[profileType];
    if (!typeConfig) {
      return res.status(400).json({ 
        message: "Invalid profile type",
        validTypes: Object.keys(PROFILE_TYPE_MAPPING)
      });
    }

    const deleteMethod = typeConfig.deleteMethod as keyof typeof storage;
    await (storage[deleteMethod] as any)(userId);

    res.json({ success: true, message: `${profileType} profile deleted successfully` });
  } catch (error) {
    console.error(`[Profile] Error deleting ${req.params.profileType} profile:`, error);
    res.status(500).json({ message: "Failed to delete profile" });
  }
});

// POST /api/profile/:userId/visibility - Update visibility settings
router.post("/:userId/visibility", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ownership validation: users can only update own visibility settings
    if (req.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own visibility settings" });
    }

    const visibilitySchema = z.object({
      profileVisibility: z.enum(['public', 'friends', 'private']).optional(),
      showEmail: z.boolean().optional(),
      showPhone: z.boolean().optional(),
      showLocation: z.boolean().optional(),
      showSocialLinks: z.boolean().optional(),
      allowMessagesFrom: z.enum(['everyone', 'friends', 'nobody']).optional(),
      showOnlineStatus: z.boolean().optional(),
      showLastActive: z.boolean().optional(),
      profileTypes: z.record(z.object({
        visible: z.boolean(),
        visibility: z.enum(['public', 'friends', 'private']).optional(),
      })).optional(),
    });

    const validatedData = visibilitySchema.parse(req.body);
    
    // Update visibility settings (assuming storage method exists or will be created)
    const updatedSettings = await storage.updateUserSettings(userId, validatedData);

    if (!updatedSettings) {
      return res.status(404).json({ message: "User settings not found" });
    }

    res.json({ 
      success: true, 
      message: "Visibility settings updated successfully",
      settings: updatedSettings 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid data", 
        errors: error.errors 
      });
    }
    console.error("[Profile] Error updating visibility settings:", error);
    res.status(500).json({ message: "Failed to update visibility settings" });
  }
});

// GET /api/profile/featured/:type - Get featured profiles
router.get("/featured/:type", async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { limit = "10", offset = "0" } = req.query;

    // Validate profile type if provided (not 'all')
    if (type !== 'all' && !PROFILE_TYPE_MAPPING[type]) {
      return res.status(400).json({ 
        message: "Invalid profile type",
        validTypes: ['all', ...Object.keys(PROFILE_TYPE_MAPPING)]
      });
    }

    // Fetch featured profiles
    // This assumes a storage method exists or will be created
    const featuredProfiles = await storage.getFeaturedProfiles({
      profileType: type === 'all' ? undefined : type,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    res.json(featuredProfiles);
  } catch (error) {
    console.error("[Profile] Error fetching featured profiles:", error);
    res.status(500).json({ message: "Failed to fetch featured profiles" });
  }
});

// ============================================================================
// SPECIALIZED PROFILE TYPE ROUTES
// ============================================================================

// Teacher Profile Routes
router.get("/:userId/teacher", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const profile = await storage.getTeacherProfile(userId);
    res.json(profile);
  } catch (error) {
    console.error("[Profile] Error fetching teacher profile:", error);
    res.status(500).json({ message: "Failed to fetch teacher profile" });
  }
});

router.post("/:userId/teacher", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertTeacherProfileSchema.parse({
      userId: req.userId,
      ...req.body
    });

    const profile = await storage.createTeacherProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid data", 
        errors: error.errors 
      });
    }
    console.error("[Profile] Error creating teacher profile:", error);
    res.status(500).json({ message: "Failed to create teacher profile" });
  }
});

router.put("/:userId/teacher", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = updateTeacherProfileSchema.parse(req.body);
    const profile = await storage.updateTeacherProfile(req.userId, validatedData);
    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid data", 
        errors: error.errors 
      });
    }
    console.error("[Profile] Error updating teacher profile:", error);
    res.status(500).json({ message: "Failed to update teacher profile" });
  }
});

router.delete("/:userId/teacher", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    await storage.deleteTeacherProfile(req.userId);
    res.json({ success: true });
  } catch (error) {
    console.error("[Profile] Error deleting teacher profile:", error);
    res.status(500).json({ message: "Failed to delete teacher profile" });
  }
});

// DJ Profile Routes
router.get("/:userId/dj", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const profile = await storage.getDJProfile(userId);
    res.json(profile);
  } catch (error) {
    console.error("[Profile] Error fetching DJ profile:", error);
    res.status(500).json({ message: "Failed to fetch DJ profile" });
  }
});

router.post("/:userId/dj", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertDJProfileSchema.parse({
      userId: req.userId,
      ...req.body
    });

    const profile = await storage.createDJProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid data", 
        errors: error.errors 
      });
    }
    console.error("[Profile] Error creating DJ profile:", error);
    res.status(500).json({ message: "Failed to create DJ profile" });
  }
});

router.put("/:userId/dj", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = updateDJProfileSchema.parse(req.body);
    const profile = await storage.updateDJProfile(req.userId, validatedData);
    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid data", 
        errors: error.errors 
      });
    }
    console.error("[Profile] Error updating DJ profile:", error);
    res.status(500).json({ message: "Failed to update DJ profile" });
  }
});

router.delete("/:userId/dj", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    await storage.deleteDJProfile(req.userId);
    res.json({ success: true });
  } catch (error) {
    console.error("[Profile] Error deleting DJ profile:", error);
    res.status(500).json({ message: "Failed to delete DJ profile" });
  }
});

// Photographer Profile Routes
router.get("/:userId/photographer", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const profile = await storage.getPhotographerProfile(userId);
    res.json(profile);
  } catch (error) {
    console.error("[Profile] Error fetching photographer profile:", error);
    res.status(500).json({ message: "Failed to fetch photographer profile" });
  }
});

router.post("/:userId/photographer", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertPhotographerProfileSchema.parse({
      userId: req.userId,
      ...req.body
    });

    const profile = await storage.createPhotographerProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid data", 
        errors: error.errors 
      });
    }
    console.error("[Profile] Error creating photographer profile:", error);
    res.status(500).json({ message: "Failed to create photographer profile" });
  }
});

router.put("/:userId/photographer", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = updatePhotographerProfileSchema.parse(req.body);
    const profile = await storage.updatePhotographerProfile(req.userId, validatedData);
    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid data", 
        errors: error.errors 
      });
    }
    console.error("[Profile] Error updating photographer profile:", error);
    res.status(500).json({ message: "Failed to update photographer profile" });
  }
});

router.delete("/:userId/photographer", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    await storage.deletePhotographerProfile(req.userId);
    res.json({ success: true });
  } catch (error) {
    console.error("[Profile] Error deleting photographer profile:", error);
    res.status(500).json({ message: "Failed to delete photographer profile" });
  }
});

// Performer Profile Routes
router.get("/:userId/performer", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const profile = await storage.getPerformerProfile(userId);
    res.json(profile);
  } catch (error) {
    console.error("[Profile] Error fetching performer profile:", error);
    res.status(500).json({ message: "Failed to fetch performer profile" });
  }
});

router.post("/:userId/performer", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertPerformerProfileSchema.parse({
      userId: req.userId,
      ...req.body
    });

    const profile = await storage.createPerformerProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid data", 
        errors: error.errors 
      });
    }
    console.error("[Profile] Error creating performer profile:", error);
    res.status(500).json({ message: "Failed to create performer profile" });
  }
});

router.put("/:userId/performer", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = updatePerformerProfileSchema.parse(req.body);
    const profile = await storage.updatePerformerProfile(req.userId, validatedData);
    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid data", 
        errors: error.errors 
      });
    }
    console.error("[Profile] Error updating performer profile:", error);
    res.status(500).json({ message: "Failed to update performer profile" });
  }
});

router.delete("/:userId/performer", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    await storage.deletePerformerProfile(req.userId);
    res.json({ success: true });
  } catch (error) {
    console.error("[Profile] Error deleting performer profile:", error);
    res.status(500).json({ message: "Failed to delete performer profile" });
  }
});

// Vendor Profile Routes
router.get("/:userId/vendor", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const profile = await storage.getVendorProfile(userId);
    res.json(profile);
  } catch (error) {
    console.error("[Profile] Error fetching vendor profile:", error);
    res.status(500).json({ message: "Failed to fetch vendor profile" });
  }
});

router.post("/:userId/vendor", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertVendorProfileSchema.parse({
      userId: req.userId,
      ...req.body
    });

    const profile = await storage.createVendorProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid data", 
        errors: error.errors 
      });
    }
    console.error("[Profile] Error creating vendor profile:", error);
    res.status(500).json({ message: "Failed to create vendor profile" });
  }
});

router.put("/:userId/vendor", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = updateVendorProfileSchema.parse(req.body);
    const profile = await storage.updateVendorProfile(req.userId, validatedData);
    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid data", 
        errors: error.errors 
      });
    }
    console.error("[Profile] Error updating vendor profile:", error);
    res.status(500).json({ message: "Failed to update vendor profile" });
  }
});

router.delete("/:userId/vendor", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    await storage.deleteVendorProfile(req.userId);
    res.json({ success: true });
  } catch (error) {
    console.error("[Profile] Error deleting vendor profile:", error);
    res.status(500).json({ message: "Failed to delete vendor profile" });
  }
});

// Musician Profile Routes
router.get("/:userId/musician", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getMusicianProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ message: "Musician profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[Profile] Error fetching musician profile:", error);
    res.status(500).json({ message: "Failed to fetch musician profile" });
  }
});

router.post("/:userId/musician", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertMusicianProfileSchema.parse({
      userId: req.userId,
      ...req.body
    });

    const profile = await storage.createMusicianProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid data", 
        errors: error.errors 
      });
    }
    console.error("[Profile] Error creating musician profile:", error);
    res.status(500).json({ message: "Failed to create musician profile" });
  }
});

router.put("/:userId/musician", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ownership validation
    if (req.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const validatedData = updateMusicianProfileSchema.parse(req.body);
    const profile = await storage.updateMusicianProfile(userId, validatedData);
    
    if (!profile) {
      return res.status(404).json({ message: "Musician profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid data", 
        errors: error.errors 
      });
    }
    console.error("[Profile] Error updating musician profile:", error);
    res.status(500).json({ message: "Failed to update musician profile" });
  }
});

router.delete("/:userId/musician", authenticateToken, requireOwnerOrAdmin(req => parseInt(req.params.userId)), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Ownership validation
    if (req.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteMusicianProfile(userId);
    res.json({ success: true });
  } catch (error) {
    console.error("[Profile] Error deleting musician profile:", error);
    res.status(500).json({ message: "Failed to delete musician profile" });
  }
});

export default router;
