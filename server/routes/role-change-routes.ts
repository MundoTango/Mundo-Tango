import { Router, type Response } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { storage, db } from "../storage";
import { groups, groupMembers, users } from "@shared/schema";
import { eq, and, ilike, sql } from "drizzle-orm";

const router = Router();

const PRO_ROLE_IMAGES: Record<string, string> = {
  'leader': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80',
  'follower': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80',
  'teacher': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
  'student': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
  'dj': 'https://images.unsplash.com/photo-1571266028243-d220c6a8b0c5?w=800&q=80',
  'musician': 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80',
  'organizer': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'performer': 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&q=80',
  'photographer': 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80',
  'videographer': 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80',
  'venue-owner': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'promoter': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'instructor': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
  'host': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'choreographer': 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&q=80',
  'historian': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80',
  'journalist': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80',
  'designer': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80',
  'vendor': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80',
  'taxi-dancer': 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&q=80',
};

const DEFAULT_PRO_GROUP_IMAGE = 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80';

function getPROGroupImage(role: string): string {
  return PRO_ROLE_IMAGES[role] || DEFAULT_PRO_GROUP_IMAGE;
}

const PRO_ROLE_GROUP_MAPPINGS: Record<string, { name: string; description: string; slug: string }> = {
  'teacher': { 
    name: 'Tango Teachers Worldwide', 
    description: 'Connect with tango teachers from around the globe. Share teaching methods, discuss pedagogy, and grow your teaching practice.',
    slug: 'pro-teachers'
  },
  'dj': { 
    name: 'Tango DJs Network', 
    description: 'The global community of tango DJs. Share playlists, discuss music selection, and connect with event organizers.',
    slug: 'pro-djs'
  },
  'performer': { 
    name: 'Tango Performers Guild', 
    description: 'For professional tango performers and show dancers. Collaborate on performances, find partners, and share opportunities.',
    slug: 'pro-performers'
  },
  'organizer': { 
    name: 'Event Organizers Hub', 
    description: 'Connect with fellow tango event organizers. Share best practices, coordinate calendars, and build the global tango scene.',
    slug: 'pro-organizers'
  },
  'venue-owner': { 
    name: 'Tango Venues Alliance', 
    description: 'A network of tango venue owners and managers. Share operational insights and promote your spaces.',
    slug: 'pro-venues'
  },
  'photographer': { 
    name: 'Tango Photographers & Videographers', 
    description: 'Capture the beauty of tango. Share techniques, collaborate on projects, and connect with events seeking coverage.',
    slug: 'pro-photographers'
  },
  'musician': { 
    name: 'Tango Musicians Collective', 
    description: 'For tango musicians, composers, and bandleaders. Collaborate, share music, and find performance opportunities.',
    slug: 'pro-musicians'
  },
  'artist': { 
    name: 'Tango Artists & Designers', 
    description: 'Creative professionals in the tango world. Share your art, collaborate on projects, and find commissions.',
    slug: 'pro-artists'
  },
  'clothing-designer': { 
    name: 'Tango Fashion Designers', 
    description: 'Designers of tango clothing, shoes, and accessories. Showcase your work and connect with dancers worldwide.',
    slug: 'pro-fashion'
  },
  'coach': { 
    name: 'Tango Coaches & Mentors', 
    description: 'Professional coaches helping dancers reach their potential. Share mentoring strategies and success stories.',
    slug: 'pro-coaches'
  },
  'mc': { 
    name: 'Tango MCs & Hosts', 
    description: 'The voices of tango events. Share hosting tips, connect with organizers, and elevate event experiences.',
    slug: 'pro-mcs'
  },
  'journalist': { 
    name: 'Tango Media & Journalists', 
    description: 'Writers, bloggers, and journalists covering the tango world. Share stories and collaborate on coverage.',
    slug: 'pro-journalists'
  },
  'historian': { 
    name: 'Tango Historians Circle', 
    description: 'Preserving and sharing tango history. Research, document, and educate about tango heritage.',
    slug: 'pro-historians'
  },
  'community-builder': { 
    name: 'Community Builders Network', 
    description: 'Leaders building tango communities worldwide. Share strategies for growing and nurturing local scenes.',
    slug: 'pro-community-builders'
  },
  'business': { 
    name: 'Tango Business Network', 
    description: 'Vendors and businesses serving the tango community. Connect, collaborate, and grow together.',
    slug: 'pro-business'
  },
  'taxi-dancer': { 
    name: 'Taxi Dancers Guild', 
    description: 'Professional taxi dancers who enhance milonga experiences. Connect with organizers, share best practices, and find opportunities.',
    slug: 'pro-taxi-dancers'
  },
};

router.post("/change-effects", authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { previousRoles, newRoles } = req.body;

  if (!newRoles || !Array.isArray(newRoles)) {
    return res.status(400).json({ error: "newRoles array is required" });
  }

  try {
    console.log(`[RoleChangeEffects] Processing for user ${userId}: ${(previousRoles || []).join(',')} -> ${newRoles.join(',')}`);

    const addedRoles = newRoles.filter((r: string) => !(previousRoles || []).includes(r));
    const removedRoles = (previousRoles || []).filter((r: string) => !newRoles.includes(r));

    const autoJoinedGroups: any[] = [];
    const createdGroups: any[] = [];
    const autoLeftGroups: any[] = [];

    // ========== ROLE REMOVAL CASCADE - Auto-LEAVE PRO Groups ==========
    for (const role of removedRoles) {
      const mapping = PRO_ROLE_GROUP_MAPPINGS[role];
      if (!mapping) continue;

      try {
        // Find the PRO group for this role
        const existingGroups = await db
          .select({
            group: groups,
          })
          .from(groups)
          .where(and(eq(groups.type, "role"), eq(groups.slug, mapping.slug)))
          .limit(1);

        if (existingGroups.length > 0) {
          const group = existingGroups[0].group;
          
          // Check if user is a member of this group
          const membership = await db
            .select()
            .from(groupMembers)
            .where(and(
              eq(groupMembers.groupId, group.id),
              eq(groupMembers.userId, userId),
              eq(groupMembers.status, 'active')
            ))
            .limit(1);

          if (membership.length > 0) {
            // Leave the group
            await db
              .delete(groupMembers)
              .where(and(
                eq(groupMembers.groupId, group.id),
                eq(groupMembers.userId, userId)
              ));

            // Decrement member count
            await db
              .update(groups)
              .set({ memberCount: sql`GREATEST(0, ${groups.memberCount} - 1)` })
              .where(eq(groups.id, group.id));

            autoLeftGroups.push({
              groupId: group.id,
              groupName: group.name,
              role,
            });
            console.log(`[RoleChangeEffects] User ${userId} auto-left PRO group ${group.id} (${group.name}) after removing role ${role}`);
          }
        }
      } catch (leaveError) {
        console.error(`[RoleChangeEffects] Failed to leave PRO group for role ${role}:`, leaveError);
      }
    }

    // ========== ROLE ADDITION CASCADE - Auto-JOIN PRO Groups ==========
    for (const role of addedRoles) {
      const mapping = PRO_ROLE_GROUP_MAPPINGS[role];
      if (!mapping) continue;

      const existingGroups = await db
        .select({
          group: groups,
          memberCount: sql<number>`(
            SELECT COUNT(*)::int 
            FROM ${groupMembers} 
            WHERE ${groupMembers.groupId} = ${groups.id}
            AND ${groupMembers.status} = 'active'
          )`.as("member_count"),
        })
        .from(groups)
        .where(and(eq(groups.type, "role"), eq(groups.slug, mapping.slug)))
        .limit(1);

      if (existingGroups.length > 0) {
        const group = existingGroups[0].group;
        try {
          await storage.joinGroup(group.id, userId);
          autoJoinedGroups.push({
            groupId: group.id,
            groupName: group.name,
            role,
            memberCount: existingGroups[0].memberCount || 0
          });
          console.log(`[RoleChangeEffects] User ${userId} auto-joined PRO group ${group.id} (${group.name}) for role ${role}`);
        } catch (joinError: any) {
          if (joinError?.message?.includes("already") || joinError?.code === "23505") {
            autoJoinedGroups.push({
              groupId: group.id,
              groupName: group.name,
              role,
              alreadyMember: true,
              memberCount: existingGroups[0].memberCount || 0
            });
          } else {
            console.error(`[RoleChangeEffects] Failed to join PRO group:`, joinError);
          }
        }
      } else {
        console.log(`[RoleChangeEffects] No PRO group found for role ${role}, creating...`);
        try {
          const [newGroup] = await db.insert(groups).values({
            name: mapping.name,
            slug: mapping.slug,
            description: mapping.description,
            type: 'role',
            visibility: 'public',
            joinApproval: 'open',
            allowEvents: true,
            allowPosts: true,
            allowDiscussions: true,
            createdBy: userId,
            ownerId: userId,
            memberCount: 1,
            coverImage: getPROGroupImage(role),
          }).returning();

          if (newGroup) {
            await storage.joinGroup(newGroup.id, userId);
            createdGroups.push({
              groupId: newGroup.id,
              groupName: newGroup.name,
              role,
              memberCount: 1,
              created: true
            });
            autoJoinedGroups.push({
              groupId: newGroup.id,
              groupName: newGroup.name,
              role,
              memberCount: 1,
              created: true
            });
            console.log(`[RoleChangeEffects] Created and joined new PRO group: ${newGroup.id} (${newGroup.name})`);
          }
        } catch (createError) {
          console.error(`[RoleChangeEffects] Failed to create PRO group for role ${role}:`, createError);
        }
      }
    }

    // ========== NOTIFICATIONS ==========
    // Notification for joined groups
    if (autoJoinedGroups.length > 0) {
      const groupNames = autoJoinedGroups.map(g => g.groupName).slice(0, 3);
      const moreCount = autoJoinedGroups.length > 3 ? ` and ${autoJoinedGroups.length - 3} more` : '';
      
      await storage.createNotification({
        userId,
        type: "role_change",
        title: `Welcome to PRO Groups!`,
        message: `You've joined ${groupNames.join(', ')}${moreCount}.`,
        data: { 
          addedRoles, 
          autoJoinedGroups: autoJoinedGroups.map(g => ({ groupId: g.groupId, groupName: g.groupName }))
        },
        actionUrl: autoJoinedGroups.length === 1 
          ? `/groups/${autoJoinedGroups[0].groupId}` 
          : `/groups?filter=my-groups`,
      });
    }

    // Notification for left groups (role removal cascade)
    if (autoLeftGroups.length > 0) {
      const leftGroupNames = autoLeftGroups.map(g => g.groupName).slice(0, 3);
      const moreLeftCount = autoLeftGroups.length > 3 ? ` and ${autoLeftGroups.length - 3} more` : '';
      
      await storage.createNotification({
        userId,
        type: "role_change",
        title: `PRO Group Membership Updated`,
        message: `You've left ${leftGroupNames.join(', ')}${moreLeftCount} as the role is no longer in your profile.`,
        data: { 
          removedRoles, 
          autoLeftGroups: autoLeftGroups.map(g => ({ groupId: g.groupId, groupName: g.groupName }))
        },
        actionUrl: `/groups?filter=my-groups`,
      });
    }

    // ========== BUILD RESPONSE ==========
    let message = 'Role update complete.';
    if (autoJoinedGroups.length > 0 && autoLeftGroups.length > 0) {
      message = `You've joined ${autoJoinedGroups.length} and left ${autoLeftGroups.length} PRO group(s) based on your role changes.`;
    } else if (autoJoinedGroups.length > 0) {
      message = `You've been added to ${autoJoinedGroups.length} PRO group(s) based on your roles.`;
    } else if (autoLeftGroups.length > 0) {
      message = `You've left ${autoLeftGroups.length} PRO group(s) as roles were removed.`;
    }

    const response = {
      addedRoles,
      removedRoles,
      autoJoinedGroups,
      autoLeftGroups,
      createdGroups,
      message,
    };

    console.log(`[RoleChangeEffects] Response:`, JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error("[RoleChangeEffects] Error:", error);
    res.status(500).json({ error: "Failed to process role change effects" });
  }
});

router.get("/pro-groups", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const proGroups = await db
      .select({
        group: groups,
        memberCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${groupMembers} 
          WHERE ${groupMembers.groupId} = ${groups.id}
          AND ${groupMembers.status} = 'active'
        )`.as("member_count"),
      })
      .from(groups)
      .where(eq(groups.type, "role"))
      .orderBy(groups.name);

    res.json(proGroups.map(g => ({
      id: g.group.id,
      name: g.group.name,
      slug: g.group.slug,
      description: g.group.description,
      memberCount: g.memberCount || 0,
      coverImage: g.group.coverImage,
    })));
  } catch (error) {
    console.error("[RoleChangeEffects] Error fetching PRO groups:", error);
    res.status(500).json({ error: "Failed to fetch PRO groups" });
  }
});

export default router;
