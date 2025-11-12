import { Router, Response } from "express";
import { db } from "@shared/db";
import { djProfiles, users } from "@shared/schema";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/djs/search - Search DJ profiles
router.get("/search", async (req, res: Response) => {
  try {
    const { 
      query, 
      genre, 
      city, 
      country, 
      minRating, 
      limit = "20", 
      offset = "0" 
    } = req.query;

    let dbQuery = db.select({
      dj: djProfiles,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
        city: users.city,
        country: users.country,
      },
    })
    .from(djProfiles)
    .leftJoin(users, eq(djProfiles.userId, users.id))
    .orderBy(desc(djProfiles.rating))
    .$dynamic();

    const conditions = [];

    // Text search
    if (query && typeof query === "string") {
      conditions.push(
        or(
          ilike(users.name, `%${query}%`),
          ilike(djProfiles.bio, `%${query}%`)
        ) as any
      );
    }

    // Genre filter
    if (genre && typeof genre === "string") {
      conditions.push(
        sql`${djProfiles.genres} && ARRAY[${genre}]::text[]`
      );
    }

    // City filter
    if (city && typeof city === "string") {
      conditions.push(ilike(users.city, `%${city}%`));
    }

    // Country filter
    if (country && typeof country === "string") {
      conditions.push(ilike(users.country, `%${country}%`));
    }

    // Rating filter
    if (minRating && typeof minRating === "string") {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        conditions.push(sql`${djProfiles.rating} >= ${rating}`);
      }
    }

    if (conditions.length > 0) {
      dbQuery = dbQuery.where(and(...conditions));
    }

    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;
    
    dbQuery = dbQuery.limit(limitNum).offset(offsetNum);

    const result = await dbQuery;

    res.json({
      success: true,
      data: result.map((r: any) => ({
        ...r.dj,
        user: r.user,
      })),
      pagination: {
        limit: limitNum,
        offset: offsetNum,
      }
    });
  } catch (error) {
    console.error("Error searching DJs:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to search DJs" 
    });
  }
});

export default router;
