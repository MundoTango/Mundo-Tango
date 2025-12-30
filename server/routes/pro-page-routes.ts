import { Router, type Request, Response } from 'express';
import { authenticateToken, type AuthRequest, optionalAuth } from '../middleware/auth';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq, ne, and, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

const contactFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
  proUserId: z.number(),
});

const settingsSchema = z.object({
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  contactEmail: z.string().email().optional().or(z.literal('')),
  galleryEnabled: z.boolean().default(true),
  eventsEnabled: z.boolean().default(true),
  testimonialsEnabled: z.boolean().default(false),
});

router.get('/resolve/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const slugLower = slug.toLowerCase();
    
    const [proUser] = await db
      .select({
        id: users.id,
        name: users.name,
        proPageSlug: users.proPageSlug,
      })
      .from(users)
      .where(and(
        sql`LOWER(${users.proPageSlug}) = ${slugLower}`,
        eq(users.proPageEnabled, true),
        eq(users.isActive, true)
      ))
      .limit(1);
    
    if (proUser) {
      return res.json({
        found: true,
        type: 'pro',
        id: proUser.id,
        name: proUser.name,
        redirectTo: `/p/${proUser.proPageSlug}`,
      });
    }
    
    const [regularUser] = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
      })
      .from(users)
      .where(and(
        sql`LOWER(${users.username}) = ${slugLower}`,
        eq(users.isActive, true)
      ))
      .limit(1);
    
    if (regularUser) {
      return res.json({
        found: true,
        type: 'user',
        id: regularUser.id,
        name: regularUser.name,
        redirectTo: `/profile/${regularUser.id}`,
      });
    }
    
    return res.json({
      found: false,
      type: null,
      redirectTo: null,
    });
  } catch (error) {
    console.error('[ProPage] Error resolving username:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/page/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const [user] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.proPageSlug, slug),
        eq(users.proPageEnabled, true)
      ))
      .limit(1);
    
    if (!user) {
      return res.status(404).json({ error: 'Pro page not found' });
    }

    const proPageData = {
      id: user.id,
      name: user.name,
      bio: user.bio,
      photo: user.profileImageUrl,
      socialLinks: user.socialLinks || {},
      galleryEnabled: (user.proPageSections as any)?.galleryEnabled ?? true,
      photos: user.portfolioUrls || [],
      testimonialsEnabled: (user.proPageSections as any)?.testimonialsEnabled ?? false,
      testimonials: [],
      proPageContactEmail: user.proPageContactEmail,
    };

    return res.json(proPageData);
  } catch (error) {
    console.error('[ProPage] Error fetching pro page:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/settings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const settings = {
      slug: user.proPageSlug || '',
      contactEmail: user.proPageContactEmail || '',
      galleryEnabled: (user.proPageSections as any)?.galleryEnabled ?? true,
      eventsEnabled: (user.proPageSections as any)?.eventsEnabled ?? true,
      testimonialsEnabled: (user.proPageSections as any)?.testimonialsEnabled ?? false,
    };

    return res.json(settings);
  } catch (error) {
    console.error('[ProPage] Error fetching settings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/settings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parseResult = settingsSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid data', details: parseResult.error.errors });
    }

    const { slug, contactEmail, galleryEnabled, eventsEnabled, testimonialsEnabled } = parseResult.data;

    const existingSlug = await db
      .select({ id: users.id })
      .from(users)
      .where(and(
        eq(users.proPageSlug, slug),
        ne(users.id, userId)
      ))
      .limit(1);

    if (existingSlug.length > 0) {
      return res.status(409).json({ error: 'Slug already taken' });
    }

    await db
      .update(users)
      .set({
        proPageSlug: slug,
        proPageContactEmail: contactEmail || null,
        proPageEnabled: true,
        proPageSections: {
          galleryEnabled,
          eventsEnabled,
          testimonialsEnabled,
        },
      })
      .where(eq(users.id, userId));

    return res.json({ success: true });
  } catch (error) {
    console.error('[ProPage] Error updating settings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/check-slug/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.proPageSlug, slug))
      .limit(1);

    return res.json({ available: existing.length === 0 });
  } catch (error) {
    console.error('[ProPage] Error checking slug:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/contact', async (req: Request, res: Response) => {
  try {
    const parseResult = contactFormSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid data', details: parseResult.error.errors });
    }

    const { name, email, phone, message, proUserId } = parseResult.data;

    const [proUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, proUserId))
      .limit(1);

    if (!proUser) {
      return res.status(404).json({ error: 'Pro user not found' });
    }

    // MB.MD FIX (Dec 30, 2025): Deliver message to user's inbox
    try {
      const contactMessage = `New PRO Page Inquiry from ${name} (${email}):\n\n${message}${phone ? `\n\nPhone: ${phone}` : ''}`;
      
      // Check if a conversation already exists between system (id: 1) and proUser
      const [existingRoom] = await db
        .select()
        .from(chatRooms)
        .where(or(
          and(eq(chatRooms.userId1, 1), eq(chatRooms.userId2, proUserId)),
          and(eq(chatRooms.userId1, proUserId), eq(chatRooms.userId2, 1))
        ))
        .limit(1);

      let chatRoomId: number;
      if (existingRoom) {
        chatRoomId = existingRoom.id;
      } else {
        const [newRoom] = await db.insert(chatRooms).values({
          userId1: 1,
          userId2: proUserId,
          type: 'direct',
          name: `Inquiry: ${name}`
        }).returning();
        chatRoomId = newRoom.id;
      }
      
      // Store in chatMessages
      await db.insert(chatMessages).values({
        senderId: 1, // System/Admin user
        chatRoomId: chatRoomId,
        content: contactMessage,
      });

      // Also create a notification
      await db.insert(notifications).values({
        userId: proUserId,
        type: 'message',
        title: 'New PRO Inquiry',
        message: `You received a new message from ${name} via your PRO page.`,
        link: '/messages',
        isRead: false,
      });
    } catch (msgError) {
      console.error('[ProPage] Failed to deliver inbox message:', msgError);
    }

    console.log(`[ProPage] Contact form submission from ${name} (${email}) to user ${proUserId}`);

    return res.json({ 
      success: true, 
      message: 'Your message has been sent successfully' 
    });
  } catch (error) {
    console.error('[ProPage] Error submitting contact form:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
