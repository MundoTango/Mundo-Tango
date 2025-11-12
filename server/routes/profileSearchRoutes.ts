import { Router, type Response } from "express";
import { storage } from "../storage";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// ============================================================================
// BATCH 15: ADVANCED PROFILE SEARCH AND FILTERING
// Comprehensive search across all professional profile types
// ============================================================================

// Search Filters Schema
const profileSearchFiltersSchema = z.object({
  profileTypes: z.array(z.enum([
    'teacher', 'dj', 'photographer', 'performer', 'vendor', 'musician',
    'choreographer', 'tango-school', 'tango-hotel', 'wellness',
    'tour-operator', 'host-venue', 'tango-guide', 'content-creator',
    'learning-resource', 'taxi-dancer', 'organizer'
  ])).optional(),
  location: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    radius: z.number().optional() // in km
  }).optional(),
  priceRange: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  availability: z.enum(['available_now', 'weekends', 'flexible', 'by_appointment']).optional(),
  experience: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  languages: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  rating: z.object({
    min: z.number().min(0).max(5).optional()
  }).optional(),
  searchQuery: z.string().optional(), // Full-text search
  sortBy: z.enum(['relevance', 'rating', 'price', 'experience', 'recent']).optional().default('relevance'),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0)
});

type ProfileSearchFilters = z.infer<typeof profileSearchFiltersSchema>;

// ============================================================================
// POST /api/profiles/search - Advanced profile search
// ============================================================================
router.post("/search", async (req: AuthRequest, res: Response) => {
  try {
    // Validate request body
    const filters = profileSearchFiltersSchema.parse(req.body);

    // Perform search
    const results = await storage.searchProfiles(filters);

    res.json({
      success: true,
      data: results.profiles,
      pagination: {
        total: results.total,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: (filters.offset || 0) + (filters.limit || 20) < results.total
      },
      filters: filters // Return applied filters for client reference
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }
    console.error("[ProfileSearch] Error searching profiles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search profiles"
    });
  }
});

// ============================================================================
// GET /api/profiles/directory - Browse profiles by type
// ============================================================================
router.get("/directory", async (req: AuthRequest, res: Response) => {
  try {
    const profileType = req.query.type as string;
    const city = req.query.city as string | undefined;
    const country = req.query.country as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!profileType) {
      return res.status(400).json({
        success: false,
        message: "Profile type is required"
      });
    }

    // Validate profile type
    const validTypes = [
      'teacher', 'dj', 'photographer', 'performer', 'vendor', 'musician',
      'choreographer', 'tango-school', 'tango-hotel', 'wellness',
      'tour-operator', 'host-venue', 'tango-guide', 'content-creator',
      'learning-resource', 'taxi-dancer', 'organizer'
    ];

    if (!validTypes.includes(profileType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile type"
      });
    }

    const results = await storage.getProfileDirectory({
      profileType,
      city,
      country,
      limit,
      offset
    });

    res.json({
      success: true,
      data: results.profiles,
      pagination: {
        total: results.total,
        limit,
        offset,
        hasMore: offset + limit < results.total
      }
    });
  } catch (error) {
    console.error("[ProfileSearch] Error fetching profile directory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile directory"
    });
  }
});

// ============================================================================
// GET /api/profiles/featured - Get featured professionals
// ============================================================================
router.get("/featured", async (req: AuthRequest, res: Response) => {
  try {
    const profileType = req.query.type as string | undefined;
    const limit = parseInt(req.query.limit as string) || 10;

    const results = await storage.getFeaturedProfiles({
      profileType,
      limit
    });

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error("[ProfileSearch] Error fetching featured profiles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured profiles"
    });
  }
});

// ============================================================================
// GET /api/profiles/nearby - Location-based profile search
// ============================================================================
router.get("/nearby", async (req: AuthRequest, res: Response) => {
  try {
    const latitude = parseFloat(req.query.latitude as string);
    const longitude = parseFloat(req.query.longitude as string);
    const radius = parseInt(req.query.radius as string) || 50; // Default 50km
    const profileType = req.query.type as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required"
      });
    }

    const results = await storage.getNearbyProfiles({
      latitude,
      longitude,
      radius,
      profileType,
      limit
    });

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error("[ProfileSearch] Error fetching nearby profiles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch nearby profiles"
    });
  }
});

// ============================================================================
// GET /api/profiles/recommendations - Recommended profiles for user
// ============================================================================
router.get("/recommendations", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const limit = parseInt(req.query.limit as string) || 10;

    const results = await storage.getRecommendedProfiles({
      userId: req.userId,
      limit
    });

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error("[ProfileSearch] Error fetching recommended profiles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recommended profiles"
    });
  }
});

// ============================================================================
// GET /api/profiles/stats - Get profile statistics by type
// ============================================================================
router.get("/stats", async (req: AuthRequest, res: Response) => {
  try {
    const stats = await storage.getProfileStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("[ProfileSearch] Error fetching profile stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile statistics"
    });
  }
});

export default router;
