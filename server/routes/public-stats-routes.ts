import { Router } from "express";
import { db } from "../db";
import { 
  platformDonations, 
  ambassadors,
  users,
  eventScrapingSources,
  notifications,
} from "@shared/schema";
import { sql, eq, and, sum, count, ilike, or } from "drizzle-orm";

const router = Router();

// Note: Main /stats endpoint is in routes.ts at /api/stats/public
// This file handles: /supporters, /ambassadors, /tango-legends, /donations

// Get all supporters for the recognition wall
router.get("/supporters", async (req, res) => {
  try {
    const supporters = await db.select({
      id: platformDonations.id,
      name: platformDonations.name,
      tier: platformDonations.tier,
      message: platformDonations.message,
      isAnonymous: platformDonations.isAnonymous,
      createdAt: platformDonations.createdAt,
      userId: platformDonations.userId,
    })
      .from(platformDonations)
      .where(and(
        eq(platformDonations.status, "completed"),
        eq(platformDonations.displayOnWall, true),
      ))
      .orderBy(sql`
        CASE tier 
          WHEN 'gardel' THEN 1 
          WHEN 'copes' THEN 2 
          WHEN 'piazzolla' THEN 3 
          WHEN 'cachafaz' THEN 4 
        END,
        created_at DESC
      `)
      .limit(100);

    const formattedSupporters = supporters.map(s => ({
      id: s.id,
      name: s.isAnonymous ? "Anonymous Supporter" : (s.name || "Generous Donor"),
      tier: s.tier,
      message: s.isAnonymous ? null : s.message,
      createdAt: s.createdAt,
    }));

    res.json(formattedSupporters);
  } catch (error) {
    console.error("Error fetching supporters:", error);
    // Return empty array if tables don't exist yet
    res.json([]);
  }
});

// Get donation stats (total raised, donor count)
router.get("/donation-stats", async (req, res) => {
  try {
    const result = await db.select({
      totalCents: sum(platformDonations.amountCents),
      donorCount: count(),
    })
      .from(platformDonations)
      .where(eq(platformDonations.status, "completed"));

    res.json({
      totalRaisedCents: Number(result[0]?.totalCents) || 0,
      totalRaisedFormatted: `$${((Number(result[0]?.totalCents) || 0) / 100).toLocaleString()}`,
      donorCount: result[0]?.donorCount || 0,
    });
  } catch (error) {
    console.error("Error fetching donation stats:", error);
    res.json({
      totalRaisedCents: 0,
      totalRaisedFormatted: "$0",
      donorCount: 0,
    });
  }
});

// Get active ambassadors
router.get("/ambassadors", async (req, res) => {
  try {
    const activeAmbassadors = await db.select({
      id: ambassadors.id,
      city: ambassadors.city,
      country: ambassadors.country,
      userId: ambassadors.userId,
      activatedAt: ambassadors.activatedAt,
    })
      .from(ambassadors)
      .where(eq(ambassadors.isActive, true))
      .orderBy(ambassadors.city);

    // Join with users to get names/avatars
    const ambassadorsWithUsers = await Promise.all(
      activeAmbassadors.map(async (amb) => {
        if (amb.userId) {
          const [user] = await db.select({
            name: users.name,
            profileImage: users.profileImage,
          })
            .from(users)
            .where(eq(users.id, amb.userId))
            .limit(1);
          return {
            ...amb,
            userName: user?.name || "Ambassador",
            userAvatar: user?.profileImage,
          };
        }
        return { ...amb, userName: "Ambassador", userAvatar: null };
      })
    );

    res.json(ambassadorsWithUsers);
  } catch (error) {
    console.error("Error fetching ambassadors:", error);
    res.json([]);
  }
});

// Get cities looking for ambassadors (cities with users but no ambassador)
router.get("/cities-seeking-ambassadors", async (req, res) => {
  try {
    // Get all cities with active users
    const citiesWithUsers = await db.select({
      city: users.city,
      country: users.country,
      userCount: count(),
    })
      .from(users)
      .where(and(
        eq(users.isActive, true),
        sql`city IS NOT NULL AND city != ''`
      ))
      .groupBy(users.city, users.country)
      .having(sql`COUNT(*) >= 3`)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(50);

    // Get cities that already have ambassadors
    const ambassadorCities = await db.select({
      city: ambassadors.city,
      country: ambassadors.country,
    })
      .from(ambassadors)
      .where(eq(ambassadors.isActive, true));

    const ambassadorCitySet = new Set(
      ambassadorCities.map(a => `${a.city}-${a.country}`)
    );

    // Filter to cities without ambassadors
    const citiesSeekingAmbassadors = citiesWithUsers.filter(
      c => !ambassadorCitySet.has(`${c.city}-${c.country}`)
    );

    res.json(citiesSeekingAmbassadors);
  } catch (error) {
    console.error("Error fetching cities seeking ambassadors:", error);
    res.json([]);
  }
});

// Tango legends information (static data - educational content)
router.get("/tango-legends", async (req, res) => {
  const legends = [
    {
      id: "cachafaz",
      name: "El Cachafaz",
      fullName: "Ovidio José Bianquet",
      tier: "$10+",
      tierAmountCents: 1000,
      years: "1883-1942",
      description: "Born Ovidio José Bianquet, El Cachafaz was the first tango dancer to tour the world. He taught high society in Paris and even performed for Pope Benedict XV. His elegant style defined tango's Golden Age.",
      impact: "Support 10 community events this month",
      badge: "Cachafaz badge on your profile",
      benefits: [
        "Name on Supporters page",
        "Cachafaz badge on your profile",
        "Monthly supporter newsletter",
      ],
    },
    {
      id: "piazzolla", 
      name: "Astor Piazzolla",
      fullName: "Astor Pantaleón Piazzolla",
      tier: "$50+",
      tierAmountCents: 5000,
      years: "1921-1992",
      description: "The revolutionary composer who created Tango Nuevo, fusing tango with jazz and classical music. He faced fierce opposition from traditionalists but forever transformed the art form.",
      impact: "Power AI event discovery for 1 week",
      badge: "Piazzolla badge on your profile",
      benefits: [
        "All Cachafaz benefits",
        "Featured on Supporters page",
        "Piazzolla badge on your profile",
        "Early access to new features",
      ],
    },
    {
      id: "copes",
      name: "Juan Carlos Copes",
      fullName: "Juan Carlos Copes",
      tier: "$100+",
      tierAmountCents: 10000,
      years: "1931-2021",
      description: "The maestro who saved tango from extinction during Argentina's military dictatorship. He created modern stage tango and trained legends like Robert Duvall and Mikhail Baryshnikov.",
      impact: "Sponsor a city for 1 month (ad-free)",
      badge: "Copes badge on your profile",
      benefits: [
        "All Piazzolla benefits",
        "Name on About page",
        "Copes badge on your profile",
        "Quarterly supporter newsletter",
        "Vote on platform features",
      ],
    },
    {
      id: "gardel",
      name: "Carlos Gardel",
      fullName: "Carlos Gardel",
      tier: "$500+",
      tierAmountCents: 50000,
      years: "1890-1935",
      description: "THE KING OF TANGO. He created tango-canción and remains the most influential tango artist of all time. Argentinians say 'Gardel sings better every day' - his legend only grows.",
      impact: "Sponsor the entire platform for 1 month",
      badge: "Gardel badge (highest honor)",
      benefits: [
        "All Copes benefits",
        "Prominent placement on About page",
        "Gardel badge (highest honor)",
        "Quarterly video call with founder Scott",
        "Input on platform roadmap",
        "Lifetime supporter status",
      ],
    },
  ];

  res.json(legends);
});

// H2AC Volunteer divisions info
router.get("/volunteer-divisions", async (req, res) => {
  const divisions = [
    {
      id: "foundation",
      name: "Foundation Division",
      layers: "1-10",
      description: "Database, Auth, API, Backend, DevOps",
      roles: ["Database Architect", "Auth Engineer", "API Developer", "Backend Developer", "DevOps Engineer"],
      skills: ["PostgreSQL", "Node.js", "TypeScript", "Redis", "Docker"],
      icon: "Database",
    },
    {
      id: "core",
      name: "Core Division",
      layers: "11-20",
      description: "Frontend, UI/UX, Components, Mobile",
      roles: ["Frontend Developer", "UI/UX Designer", "Component Developer", "Mobile Developer"],
      skills: ["React", "Tailwind CSS", "Figma", "React Native", "TypeScript"],
      icon: "Layout",
    },
    {
      id: "business",
      name: "Business Division",
      layers: "21-30",
      description: "Payments, Growth, Marketing, Analytics",
      roles: ["Payment Engineer", "Growth Hacker", "Marketing Specialist", "Business Analyst"],
      skills: ["Stripe", "Analytics", "SEO", "Content Strategy", "A/B Testing"],
      icon: "TrendingUp",
    },
    {
      id: "intelligence",
      name: "Intelligence Division",
      layers: "31-46",
      description: "AI/ML, Data Science, NLP, Mr Blue",
      roles: ["AI/ML Engineer", "Data Scientist", "NLP Specialist", "Mr Blue Trainer"],
      skills: ["Python", "OpenAI", "LangChain", "Vector DBs", "Prompt Engineering"],
      icon: "Brain",
    },
    {
      id: "platform",
      name: "Platform Division",
      layers: "47-56",
      description: "Security, QA, Performance, SRE",
      roles: ["Security Engineer", "QA Tester", "Performance Engineer", "SRE"],
      skills: ["Security Auditing", "Playwright", "Monitoring", "Incident Response"],
      icon: "Shield",
    },
    {
      id: "extended",
      name: "Extended Division",
      layers: "57-61",
      description: "Translation, Content, Community, Social",
      roles: ["Translator", "Content Writer", "Community Moderator", "Event Curator", "Ambassador", "Social Media Manager"],
      skills: ["Writing", "Community Management", "Languages", "Social Media", "Event Planning"],
      icon: "Globe",
    },
  ];

  res.json(divisions);
});

router.get("/event-sources", async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city || typeof city !== 'string') {
      return res.status(400).json({ error: "City parameter is required" });
    }

    const sources = await db.select({
      id: eventScrapingSources.id,
      name: eventScrapingSources.name,
      url: eventScrapingSources.url,
      platform: eventScrapingSources.platform,
      city: eventScrapingSources.city,
      country: eventScrapingSources.country,
    })
      .from(eventScrapingSources)
      .where(and(
        eq(eventScrapingSources.isActive, true),
        ilike(eventScrapingSources.city, `%${city}%`)
      ))
      .limit(10);

    res.json({
      city,
      sources,
      count: sources.length,
    });
  } catch (error) {
    console.error("Error fetching event sources:", error);
    res.json({ city: req.query.city, sources: [], count: 0 });
  }
});

router.post("/event-sources/suggest", async (req, res) => {
  try {
    const { city, country, url, name } = req.body;
    
    if (!city || !url) {
      return res.status(400).json({ error: "City and URL are required" });
    }

    // Check for duplicate URL
    const existing = await db.select({ id: eventScrapingSources.id })
      .from(eventScrapingSources)
      .where(eq(eventScrapingSources.url, url))
      .limit(1);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: "This website has already been submitted" });
    }

    const [newSource] = await db.insert(eventScrapingSources).values({
      name: name || `User suggested: ${url}`,
      url,
      platform: "user_suggested",
      city,
      country: country || null,
      isActive: false,
    }).returning({ id: eventScrapingSources.id });

    // Notify admins about new source suggestion
    try {
      const admins = await db.select({ id: users.id })
        .from(users)
        .where(or(
          eq(users.role, 'super_admin'),
          eq(users.role, 'admin')
        ))
        .limit(10);

      for (const admin of admins) {
        await db.insert(notifications).values({
          userId: admin.id,
          type: 'system_announcement',
          title: 'New Event Source Suggested',
          message: `A user suggested a new event source for ${city}: ${url}`,
          actionUrl: '/admin/scraping',
          isRead: false,
          priority: 'normal',
        });
      }
    } catch (notifyError) {
      console.error("Failed to notify admins:", notifyError);
      // Don't fail the request if notification fails
    }

    res.json({ success: true, message: "Thank you! We'll review this source." });
  } catch (error) {
    console.error("Error adding suggested source:", error);
    res.status(500).json({ error: "Failed to add suggestion" });
  }
});

export default router;
