import { Router, Response } from "express";
import { db } from "@shared/db";
import { venues } from "@shared/schema";
import { eq, desc, and, or, ilike } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// Sample venue data for when database is empty
const sampleVenues = [
  {
    id: 1,
    name: "La Viruta Tango",
    address: "Armenia 1366, Palermo",
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "milonga",
    rating: "4.9",
    reviewCount: 328,
    phone: "+54 11 4774-6357",
    website: "https://lavirutatango.com",
    hours: "Tue-Sun 11pm-5am",
    image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800",
    description: "Legendary Buenos Aires milonga with live orchestras and authentic atmosphere"
  },
  {
    id: 2,
    name: "Salon Canning",
    address: "Scalabrini Ortiz 1331",
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "milonga",
    rating: "4.8",
    reviewCount: 256,
    phone: "+54 11 4832-6753",
    hours: "Mon-Sun 10pm-4am",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800",
    description: "Classic milonga venue in the heart of Palermo"
  },
  {
    id: 3,
    name: "El Beso",
    address: "Riobamba 416",
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "milonga",
    rating: "4.7",
    reviewCount: 189,
    hours: "Wed-Sun 11pm-4am",
    image: "https://images.unsplash.com/photo-1485872299829-c673f50dea4d?w=800",
    description: "Intimate traditional milonga with classic tango atmosphere"
  },
  {
    id: 4,
    name: "Tango Malevaje",
    address: "123 Tango Street",
    city: "New York",
    country: "USA",
    venueType: "studio",
    rating: "4.6",
    reviewCount: 142,
    website: "https://tangomalevaje.com",
    hours: "Daily classes and practica",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    description: "Premier tango studio in Manhattan with world-class instruction"
  },
  {
    id: 5,
    name: "Milonga del Indio",
    address: "Güemes 4671",
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "milonga",
    rating: "4.8",
    reviewCount: 203,
    hours: "Fri-Sat 11pm-5am",
    image: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800",
    description: "Traditional milonga with great floor and authentic atmosphere"
  }
];

// GET /api/venues - List venues with search/filter
router.get("/", async (req, res: Response) => {
  try {
    const { search, city, country } = req.query;

    let query = db.select()
      .from(venues)
      .orderBy(desc(venues.rating))
      .$dynamic();

    const conditions = [];
    
    if (search && typeof search === "string") {
      conditions.push(
        or(
          ilike(venues.name, `%${search}%`),
          ilike(venues.description, `%${search}%`)
        ) as any
      );
    }

    if (city && typeof city === "string") {
      conditions.push(eq(venues.city, city));
    }

    if (country && typeof country === "string") {
      conditions.push(eq(venues.country, country));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;

    // Return sample data if database is empty
    if (result.length === 0) {
      let filteredSamples = sampleVenues;
      if (city && typeof city === "string") {
        filteredSamples = filteredSamples.filter(v => v.city.toLowerCase().includes(city.toLowerCase()));
      }
      if (country && typeof country === "string") {
        filteredSamples = filteredSamples.filter(v => v.country.toLowerCase().includes(country.toLowerCase()));
      }
      if (search && typeof search === "string") {
        filteredSamples = filteredSamples.filter(v => 
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          v.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      return res.json(filteredSamples);
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching venues:", error);
    res.status(500).json({ message: "Failed to fetch venues" });
  }
});

// GET /api/venues/:id - Get venue detail
router.get("/:id", async (req, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.select()
      .from(venues)
      .where(eq(venues.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Venue not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching venue:", error);
    res.status(500).json({ message: "Failed to fetch venue" });
  }
});

// POST /api/venues - Create venue (auth required)
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, address, city, country, phone, email, hours, image } = req.body;

    if (!name || !address || !city || !country) {
      return res.status(400).json({ message: "Name, address, city, and country are required" });
    }

    const result = await db.insert(venues).values({
      name,
      description: description || null,
      address,
      city,
      country,
      phone: phone || null,
      email: email || null,
      hours: hours || null,
      image: image || null,
      rating: 0,
      reviewCount: 0,
      verified: false,
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating venue:", error);
    res.status(500).json({ message: "Failed to create venue" });
  }
});

// PATCH /api/venues/:id - Update venue (auth required)
router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, address, city, country, phone, email, hours, image } = req.body;

    // Check existence
    const existing = await db.select().from(venues).where(eq(venues.id, parseInt(id))).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Venue not found" });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (hours !== undefined) updateData.hours = hours;
    if (image !== undefined) updateData.image = image;

    const result = await db.update(venues)
      .set(updateData)
      .where(eq(venues.id, parseInt(id)))
      .returning();

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating venue:", error);
    res.status(500).json({ message: "Failed to update venue" });
  }
});

// DELETE /api/venues/:id - Delete venue (auth required)
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check existence
    const existing = await db.select().from(venues).where(eq(venues.id, parseInt(id))).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Venue not found" });
    }

    await db.delete(venues).where(eq(venues.id, parseInt(id)));

    res.json({ message: "Venue deleted successfully" });
  } catch (error) {
    console.error("Error deleting venue:", error);
    res.status(500).json({ message: "Failed to delete venue" });
  }
});

// GET /api/venues/recommendations - Get venue recommendations based on location and rating
router.get("/recommendations", async (req, res: Response) => {
  try {
    const { city, country, minRating = "0" } = req.query;

    let query = db.select()
      .from(venues)
      .orderBy(desc(venues.rating), desc(venues.reviewCount))
      .limit(20)
      .$dynamic();

    const conditions = [];
    
    if (city && typeof city === "string") {
      conditions.push(eq(venues.city, city));
    }

    if (country && typeof country === "string") {
      conditions.push(eq(venues.country, country));
    }

    const rating = parseInt(minRating as string);
    if (rating > 0) {
      conditions.push(sql`${venues.rating} >= ${rating}`);
    }

    // Only show verified or highly rated venues in recommendations
    conditions.push(
      or(
        eq(venues.verified, true),
        sql`${venues.rating} >= 4`
      ) as any
    );

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;

    res.json(result);
  } catch (error) {
    console.error("Error fetching venue recommendations:", error);
    res.status(500).json({ message: "Failed to fetch venue recommendations" });
  }
});

export default router;
