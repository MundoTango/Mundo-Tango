import { Router, Response } from "express";
import { db } from "@shared/db";
import { musicianProfiles, users } from "@shared/schema";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/musicians/search - Search musician profiles
router.get("/search", async (req, res: Response) => {
  try {
    const { 
      query, 
      instrument, 
      genre,
      city, 
      country, 
      minRating, 
      limit = "20", 
      offset = "0" 
    } = req.query;

    let dbQuery = db.select({
      musician: musicianProfiles,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
        city: users.city,
        country: users.country,
      },
    })
    .from(musicianProfiles)
    .leftJoin(users, eq(musicianProfiles.userId, users.id))
    .orderBy(desc(musicianProfiles.rating))
    .$dynamic();

    const conditions = [];

    // Text search
    if (query && typeof query === "string") {
      conditions.push(
        or(
          ilike(users.name, `%${query}%`),
          ilike(musicianProfiles.bio, `%${query}%`)
        ) as any
      );
    }

    // Instrument filter
    if (instrument && typeof instrument === "string") {
      conditions.push(
        sql`${musicianProfiles.instruments} && ARRAY[${instrument}]::text[]`
      );
    }

    // Genre filter
    if (genre && typeof genre === "string") {
      conditions.push(
        sql`${musicianProfiles.genres} && ARRAY[${genre}]::text[]`
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
        conditions.push(sql`${musicianProfiles.rating} >= ${rating}`);
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
        ...r.musician,
        user: r.user,
      })),
      pagination: {
        limit: limitNum,
        offset: offsetNum,
      }
    });
  } catch (error) {
    console.error("Error searching musicians:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to search musicians" 
    });
  }
});

export default router;
