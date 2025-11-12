import { Router, type Response } from "express";
import { storage } from "../storage";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import {
  insertTeacherProfileSchema,
  insertDJProfileSchema,
  insertMusicianProfileSchema,
  insertChoreographerProfileSchema,
  insertPhotographerProfileSchema,
  insertPerformerProfileSchema,
  insertVendorProfileSchema,
  teacherProfiles,
  djProfiles,
  musicianProfiles,
  users,
} from "@shared/schema";
import { db } from "@shared/db";
import { eq, and, or, sql, gte, lte, ilike, desc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// ============================================================================
// BATCH 04-05: PROFESSIONAL PROFILE API ENDPOINTS
// Artist/Educator + Service Provider Profiles
// ============================================================================

// ============================================================================
// TEACHER PROFILE LIST ENDPOINTS WITH FILTERS
// ============================================================================

// GET /api/profiles/teachers - List all teachers with filters
router.get("/teachers", async (req, res: Response) => {
  try {
    const { 
      city, 
      minRate, 
      maxRate, 
      styles,
      availability,
      limit = "20",
      offset = "0"
    } = req.query;

    let query = db
      .select({
        profile: teacherProfiles,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(teacherProfiles)
      .leftJoin(users, eq(teacherProfiles.userId, users.id))
      .where(eq(teacherProfiles.isActive, true))
      .$dynamic();

    const conditions = [eq(teacherProfiles.isActive, true)];

    // Filter by city
    if (city && typeof city === "string") {
      conditions.push(ilike(users.city, `%${city}%`));
    }

    // Filter by rate range
    if (minRate && typeof minRate === "string") {
      const rate = parseFloat(minRate);
      if (!isNaN(rate)) {
        conditions.push(gte(teacherProfiles.hourlyRate, rate.toString()));
      }
    }

    if (maxRate && typeof maxRate === "string") {
      const rate = parseFloat(maxRate);
      if (!isNaN(rate)) {
        conditions.push(lte(teacherProfiles.hourlyRate, rate.toString()));
      }
    }

    // Filter by teaching styles
    if (styles && typeof styles === "string") {
      const styleList = styles.split(",").map(s => s.trim());
      conditions.push(
        sql`${teacherProfiles.teachingStyles} && ARRAY[${sql.join(styleList.map(s => sql`${s}`), sql`, `)}]::text[]`
      );
    }

    // Filter by availability (if availability is a JSONB field)
    if (availability && typeof availability === "string") {
      conditions.push(
        sql`${teacherProfiles.availability} IS NOT NULL`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;

    const results = await query
      .orderBy(desc(teacherProfiles.averageRating))
      .limit(limitNum)
      .offset(offsetNum);

    res.json({
      success: true,
      data: results.map(r => ({
        ...r.profile,
        user: r.user,
      })),
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        total: results.length,
      }
    });
  } catch (error) {
    console.error("[ProfessionalProfile] Error listing teachers:", error);
    res.status(500).json({ message: "Failed to list teachers" });
  }
});

// GET /api/profiles/teachers/:userId - Get teacher profile by user ID
router.get("/teachers/:userId", async (req: any, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const result = await db
      .select({
        profile: teacherProfiles,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(teacherProfiles)
      .leftJoin(users, eq(teacherProfiles.userId, users.id))
      .where(eq(teacherProfiles.userId, userId))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    // Track profile view
    const viewerId = req.userId || null;
    const viewerIp = req.ip || req.socket?.remoteAddress || null;
    if (viewerId !== userId) {
      await storage.trackProfileView(viewerId, userId, 'teacher', viewerIp);
    }

    res.json({
      ...result[0].profile,
      user: result[0].user,
    });
  } catch (error) {
    console.error("[ProfessionalProfile] Error fetching teacher profile:", error);
    res.status(500).json({ message: "Failed to fetch teacher profile" });
  }
});

// POST /api/profiles/teachers - Create teacher profile
router.post("/teachers", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertTeacherProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createTeacherProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error creating teacher profile:", error);
    res.status(500).json({ message: "Failed to create teacher profile" });
  }
});

// PUT /api/profiles/teachers/:userId - Update teacher profile
router.put("/teachers/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership - user can only update their own profile
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const validatedData = insertTeacherProfileSchema.partial().parse(req.body);
    const profile = await storage.updateTeacherProfile(userId, validatedData);
    
    if (!profile) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error updating teacher profile:", error);
    res.status(500).json({ message: "Failed to update teacher profile" });
  }
});

// DELETE /api/profiles/teachers/:userId - Delete teacher profile
router.delete("/teachers/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteTeacherProfile(userId);
    res.json({ success: true, message: "Teacher profile deleted successfully" });
  } catch (error) {
    console.error("[ProfessionalProfile] Error deleting teacher profile:", error);
    res.status(500).json({ message: "Failed to delete teacher profile" });
  }
});

// ============================================================================
// DJ PROFILE LIST ENDPOINTS WITH FILTERS
// ============================================================================

// GET /api/profiles/djs - List all DJs with filters
router.get("/djs", async (req, res: Response) => {
  try {
    const { 
      city, 
      minRate, 
      maxRate, 
      styles,
      availability,
      limit = "20",
      offset = "0"
    } = req.query;

    let query = db
      .select({
        profile: djProfiles,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(djProfiles)
      .leftJoin(users, eq(djProfiles.userId, users.id))
      .where(eq(djProfiles.isActive, true))
      .$dynamic();

    const conditions = [eq(djProfiles.isActive, true)];

    // Filter by city
    if (city && typeof city === "string") {
      conditions.push(ilike(users.city, `%${city}%`));
    }

    // Filter by rate range (using eventRate for DJs)
    if (minRate && typeof minRate === "string") {
      const rate = parseFloat(minRate);
      if (!isNaN(rate)) {
        conditions.push(gte(djProfiles.eventRate, rate.toString()));
      }
    }

    if (maxRate && typeof maxRate === "string") {
      const rate = parseFloat(maxRate);
      if (!isNaN(rate)) {
        conditions.push(lte(djProfiles.eventRate, rate.toString()));
      }
    }

    // Filter by music styles
    if (styles && typeof styles === "string") {
      const styleList = styles.split(",").map(s => s.trim());
      conditions.push(
        sql`${djProfiles.musicStyles} && ARRAY[${sql.join(styleList.map(s => sql`${s}`), sql`, `)}]::text[]`
      );
    }

    // Filter by availability
    if (availability && typeof availability === "string") {
      conditions.push(
        sql`${djProfiles.availability} IS NOT NULL`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;

    const results = await query
      .orderBy(desc(djProfiles.averageRating))
      .limit(limitNum)
      .offset(offsetNum);

    res.json({
      success: true,
      data: results.map(r => ({
        ...r.profile,
        user: r.user,
      })),
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        total: results.length,
      }
    });
  } catch (error) {
    console.error("[ProfessionalProfile] Error listing DJs:", error);
    res.status(500).json({ message: "Failed to list DJs" });
  }
});

// GET /api/profiles/djs/:userId - Get DJ profile by user ID
router.get("/djs/:userId", async (req: any, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const result = await db
      .select({
        profile: djProfiles,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(djProfiles)
      .leftJoin(users, eq(djProfiles.userId, users.id))
      .where(eq(djProfiles.userId, userId))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "DJ profile not found" });
    }

    // Track profile view
    const viewerId = req.userId || null;
    const viewerIp = req.ip || req.socket?.remoteAddress || null;
    if (viewerId !== userId) {
      await storage.trackProfileView(viewerId, userId, 'dj', viewerIp);
    }

    res.json({
      ...result[0].profile,
      user: result[0].user,
    });
  } catch (error) {
    console.error("[ProfessionalProfile] Error fetching DJ profile:", error);
    res.status(500).json({ message: "Failed to fetch DJ profile" });
  }
});

// POST /api/profiles/djs - Create DJ profile
router.post("/djs", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertDJProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createDJProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error creating DJ profile:", error);
    res.status(500).json({ message: "Failed to create DJ profile" });
  }
});

// PUT /api/profiles/djs/:userId - Update DJ profile
router.put("/djs/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const validatedData = insertDJProfileSchema.partial().parse(req.body);
    const profile = await storage.updateDJProfile(userId, validatedData);
    
    if (!profile) {
      return res.status(404).json({ message: "DJ profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error updating DJ profile:", error);
    res.status(500).json({ message: "Failed to update DJ profile" });
  }
});

// DELETE /api/profiles/djs/:userId - Delete DJ profile
router.delete("/djs/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteDJProfile(userId);
    res.json({ success: true, message: "DJ profile deleted successfully" });
  } catch (error) {
    console.error("[ProfessionalProfile] Error deleting DJ profile:", error);
    res.status(500).json({ message: "Failed to delete DJ profile" });
  }
});

// ============================================================================
// MUSICIAN PROFILE LIST ENDPOINTS WITH FILTERS
// ============================================================================

// GET /api/profiles/musicians - List all musicians with filters
router.get("/musicians", async (req, res: Response) => {
  try {
    const { 
      city, 
      minRate, 
      maxRate, 
      styles,
      availability,
      limit = "20",
      offset = "0"
    } = req.query;

    let query = db
      .select({
        profile: musicianProfiles,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(musicianProfiles)
      .leftJoin(users, eq(musicianProfiles.userId, users.id))
      .where(eq(musicianProfiles.isActive, true))
      .$dynamic();

    const conditions = [eq(musicianProfiles.isActive, true)];

    // Filter by city
    if (city && typeof city === "string") {
      conditions.push(ilike(users.city, `%${city}%`));
    }

    // Filter by rate range (using performanceFee for musicians)
    if (minRate && typeof minRate === "string") {
      const rate = parseFloat(minRate);
      if (!isNaN(rate)) {
        conditions.push(gte(musicianProfiles.performanceFee, rate.toString()));
      }
    }

    if (maxRate && typeof maxRate === "string") {
      const rate = parseFloat(maxRate);
      if (!isNaN(rate)) {
        conditions.push(lte(musicianProfiles.performanceFee, rate.toString()));
      }
    }

    // Filter by musical styles
    if (styles && typeof styles === "string") {
      const styleList = styles.split(",").map(s => s.trim());
      conditions.push(
        sql`${musicianProfiles.musicalStyles} && ARRAY[${sql.join(styleList.map(s => sql`${s}`), sql`, `)}]::text[]`
      );
    }

    // Filter by availability
    if (availability && typeof availability === "string") {
      conditions.push(
        sql`${musicianProfiles.availability} IS NOT NULL`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;

    const results = await query
      .orderBy(desc(musicianProfiles.averageRating))
      .limit(limitNum)
      .offset(offsetNum);

    res.json({
      success: true,
      data: results.map(r => ({
        ...r.profile,
        user: r.user,
      })),
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        total: results.length,
      }
    });
  } catch (error) {
    console.error("[ProfessionalProfile] Error listing musicians:", error);
    res.status(500).json({ message: "Failed to list musicians" });
  }
});

// GET /api/profiles/musicians/:userId - Get musician profile by user ID
router.get("/musicians/:userId", async (req: any, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const result = await db
      .select({
        profile: musicianProfiles,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(musicianProfiles)
      .leftJoin(users, eq(musicianProfiles.userId, users.id))
      .where(eq(musicianProfiles.userId, userId))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Musician profile not found" });
    }

    // Track profile view
    const viewerId = req.userId || null;
    const viewerIp = req.ip || req.socket?.remoteAddress || null;
    if (viewerId !== userId) {
      await storage.trackProfileView(viewerId, userId, 'musician', viewerIp);
    }

    res.json({
      ...result[0].profile,
      user: result[0].user,
    });
  } catch (error) {
    console.error("[ProfessionalProfile] Error fetching musician profile:", error);
    res.status(500).json({ message: "Failed to fetch musician profile" });
  }
});

// POST /api/profiles/musicians - Create musician profile
router.post("/musicians", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertMusicianProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createMusicianProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error creating musician profile:", error);
    res.status(500).json({ message: "Failed to create musician profile" });
  }
});

// PUT /api/profiles/musicians/:userId - Update musician profile
router.put("/musicians/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const validatedData = insertMusicianProfileSchema.partial().parse(req.body);
    const profile = await storage.updateMusicianProfile(userId, validatedData);
    
    if (!profile) {
      return res.status(404).json({ message: "Musician profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error updating musician profile:", error);
    res.status(500).json({ message: "Failed to update musician profile" });
  }
});

// DELETE /api/profiles/musicians/:userId - Delete musician profile
router.delete("/musicians/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteMusicianProfile(userId);
    res.json({ success: true, message: "Musician profile deleted successfully" });
  } catch (error) {
    console.error("[ProfessionalProfile] Error deleting musician profile:", error);
    res.status(500).json({ message: "Failed to delete musician profile" });
  }
});

// ============================================================================
// TEACHER PROFILE ROUTES (LEGACY - SINGULAR ENDPOINTS)
// ============================================================================

// GET /api/profiles/teacher/:userId - Get teacher profile by user ID
router.get("/teacher/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getTeacherProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[ProfessionalProfile] Error fetching teacher profile:", error);
    res.status(500).json({ message: "Failed to fetch teacher profile" });
  }
});

// POST /api/profiles/teacher - Create teacher profile for authenticated user
router.post("/teacher", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Validate request body
    const validatedData = insertTeacherProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createTeacherProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error creating teacher profile:", error);
    res.status(500).json({ message: "Failed to create teacher profile" });
  }
});

// PUT /api/profiles/teacher - Update own teacher profile
router.put("/teacher", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify ownership - user can only update their own profile
    const existingProfile = await storage.getTeacherProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.updateTeacherProfile(req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error updating teacher profile:", error);
    res.status(500).json({ message: "Failed to update teacher profile" });
  }
});

// DELETE /api/profiles/teacher - Delete own teacher profile
router.delete("/teacher", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify ownership
    const existingProfile = await storage.getTeacherProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteTeacherProfile(req.userId);
    res.json({ success: true, message: "Teacher profile deleted successfully" });
  } catch (error) {
    console.error("[ProfessionalProfile] Error deleting teacher profile:", error);
    res.status(500).json({ message: "Failed to delete teacher profile" });
  }
});

// ============================================================================
// DJ PROFILE ROUTES
// ============================================================================

// GET /api/profiles/dj/:userId
router.get("/dj/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getDJProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "DJ profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[ProfessionalProfile] Error fetching DJ profile:", error);
    res.status(500).json({ message: "Failed to fetch DJ profile" });
  }
});

// POST /api/profiles/dj
router.post("/dj", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertDJProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createDJProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error creating DJ profile:", error);
    res.status(500).json({ message: "Failed to create DJ profile" });
  }
});

// PUT /api/profiles/dj
router.put("/dj", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getDJProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "DJ profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.updateDJProfile(req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "DJ profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error updating DJ profile:", error);
    res.status(500).json({ message: "Failed to update DJ profile" });
  }
});

// DELETE /api/profiles/dj
router.delete("/dj", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getDJProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "DJ profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteDJProfile(req.userId);
    res.json({ success: true, message: "DJ profile deleted successfully" });
  } catch (error) {
    console.error("[ProfessionalProfile] Error deleting DJ profile:", error);
    res.status(500).json({ message: "Failed to delete DJ profile" });
  }
});

// ============================================================================
// MUSICIAN PROFILE ROUTES
// ============================================================================

// GET /api/profiles/musician/:userId
router.get("/musician/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
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
    console.error("[ProfessionalProfile] Error fetching musician profile:", error);
    res.status(500).json({ message: "Failed to fetch musician profile" });
  }
});

// POST /api/profiles/musician
router.post("/musician", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertMusicianProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createMusicianProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error creating musician profile:", error);
    res.status(500).json({ message: "Failed to create musician profile" });
  }
});

// PUT /api/profiles/musician
router.put("/musician", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getMusicianProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Musician profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.updateMusicianProfile(req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Musician profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error updating musician profile:", error);
    res.status(500).json({ message: "Failed to update musician profile" });
  }
});

// DELETE /api/profiles/musician
router.delete("/musician", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getMusicianProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Musician profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteMusicianProfile(req.userId);
    res.json({ success: true, message: "Musician profile deleted successfully" });
  } catch (error) {
    console.error("[ProfessionalProfile] Error deleting musician profile:", error);
    res.status(500).json({ message: "Failed to delete musician profile" });
  }
});

// ============================================================================
// CHOREOGRAPHER PROFILE ROUTES
// ============================================================================

// GET /api/profiles/choreographer/:userId
router.get("/choreographer/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getChoreographerProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Choreographer profile not found" });
    }

    // Track profile view
    const viewerId = req.userId || null;
    const viewerIp = req.ip || req.socket?.remoteAddress || null;
    if (viewerId !== userId) {
      await storage.trackProfileView(viewerId, userId, 'choreographer', viewerIp);
    }

    res.json(profile);
  } catch (error) {
    console.error("[ProfessionalProfile] Error fetching choreographer profile:", error);
    res.status(500).json({ message: "Failed to fetch choreographer profile" });
  }
});

// POST /api/profiles/choreographer
router.post("/choreographer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertChoreographerProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createChoreographerProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error creating choreographer profile:", error);
    res.status(500).json({ message: "Failed to create choreographer profile" });
  }
});

// PUT /api/profiles/choreographer
router.put("/choreographer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getChoreographerProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Choreographer profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.updateChoreographerProfile(req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Choreographer profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error updating choreographer profile:", error);
    res.status(500).json({ message: "Failed to update choreographer profile" });
  }
});

// DELETE /api/profiles/choreographer
router.delete("/choreographer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getChoreographerProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Choreographer profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteChoreographerProfile(req.userId);
    res.json({ success: true, message: "Choreographer profile deleted successfully" });
  } catch (error) {
    console.error("[ProfessionalProfile] Error deleting choreographer profile:", error);
    res.status(500).json({ message: "Failed to delete choreographer profile" });
  }
});

// ============================================================================
// PHOTOGRAPHER PROFILE ROUTES
// ============================================================================

// GET /api/profiles/photographer/:userId
router.get("/photographer/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getPhotographerProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Photographer profile not found" });
    }

    // Track profile view
    const viewerId = req.userId || null;
    const viewerIp = req.ip || req.socket?.remoteAddress || null;
    if (viewerId !== userId) {
      await storage.trackProfileView(viewerId, userId, 'photographer', viewerIp);
    }

    res.json(profile);
  } catch (error) {
    console.error("[ProfessionalProfile] Error fetching photographer profile:", error);
    res.status(500).json({ message: "Failed to fetch photographer profile" });
  }
});

// POST /api/profiles/photographer
router.post("/photographer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertPhotographerProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createPhotographerProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error creating photographer profile:", error);
    res.status(500).json({ message: "Failed to create photographer profile" });
  }
});

// PUT /api/profiles/photographer
router.put("/photographer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getPhotographerProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Photographer profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.updatePhotographerProfile(req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Photographer profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error updating photographer profile:", error);
    res.status(500).json({ message: "Failed to update photographer profile" });
  }
});

// DELETE /api/profiles/photographer
router.delete("/photographer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getPhotographerProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Photographer profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deletePhotographerProfile(req.userId);
    res.json({ success: true, message: "Photographer profile deleted successfully" });
  } catch (error) {
    console.error("[ProfessionalProfile] Error deleting photographer profile:", error);
    res.status(500).json({ message: "Failed to delete photographer profile" });
  }
});

// ============================================================================
// PERFORMER PROFILE ROUTES
// ============================================================================

// GET /api/profiles/performer/:userId
router.get("/performer/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getPerformerProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Performer profile not found" });
    }

    // Track profile view
    const viewerId = req.userId || null;
    const viewerIp = req.ip || req.socket?.remoteAddress || null;
    if (viewerId !== userId) {
      await storage.trackProfileView(viewerId, userId, 'performer', viewerIp);
    }

    res.json(profile);
  } catch (error) {
    console.error("[ProfessionalProfile] Error fetching performer profile:", error);
    res.status(500).json({ message: "Failed to fetch performer profile" });
  }
});

// POST /api/profiles/performer
router.post("/performer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertPerformerProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createPerformerProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error creating performer profile:", error);
    res.status(500).json({ message: "Failed to create performer profile" });
  }
});

// PUT /api/profiles/performer
router.put("/performer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getPerformerProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Performer profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.updatePerformerProfile(req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Performer profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error updating performer profile:", error);
    res.status(500).json({ message: "Failed to update performer profile" });
  }
});

// DELETE /api/profiles/performer
router.delete("/performer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getPerformerProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Performer profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deletePerformerProfile(req.userId);
    res.json({ success: true, message: "Performer profile deleted successfully" });
  } catch (error) {
    console.error("[ProfessionalProfile] Error deleting performer profile:", error);
    res.status(500).json({ message: "Failed to delete performer profile" });
  }
});

// ============================================================================
// VENDOR PROFILE ROUTES
// ============================================================================

// GET /api/profiles/vendor/:userId
router.get("/vendor/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getVendorProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    // Track profile view
    const viewerId = req.userId || null;
    const viewerIp = req.ip || req.socket?.remoteAddress || null;
    if (viewerId !== userId) {
      await storage.trackProfileView(viewerId, userId, 'vendor', viewerIp);
    }

    res.json(profile);
  } catch (error) {
    console.error("[ProfessionalProfile] Error fetching vendor profile:", error);
    res.status(500).json({ message: "Failed to fetch vendor profile" });
  }
});

// POST /api/profiles/vendor
router.post("/vendor", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertVendorProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createVendorProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error creating vendor profile:", error);
    res.status(500).json({ message: "Failed to create vendor profile" });
  }
});

// PUT /api/profiles/vendor
router.put("/vendor", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getVendorProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.updateVendorProfile(req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ProfessionalProfile] Error updating vendor profile:", error);
    res.status(500).json({ message: "Failed to update vendor profile" });
  }
});

// DELETE /api/profiles/vendor
router.delete("/vendor", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getVendorProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteVendorProfile(req.userId);
    res.json({ success: true, message: "Vendor profile deleted successfully" });
  } catch (error) {
    console.error("[ProfessionalProfile] Error deleting vendor profile:", error);
    res.status(500).json({ message: "Failed to delete vendor profile" });
  }
});

export default router;
