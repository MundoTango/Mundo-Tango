/**
 * Mr. Blue Data Service - Database Access Layer
 * Provides real-time platform data for AI-powered responses
 */

import { db } from '@db';
import { events, cities, users, groups, friendships, eventRsvps, cityMembers, groupMembers, directMessages } from '@shared/schema';
import { eq, desc, gte, like, sql, and, or, inArray } from 'drizzle-orm';

interface PlatformStats {
  totalEvents: number;
  upcomingEvents: number;
  totalCities: number;
  totalUsers: number;
  totalGroups: number;
}

interface EventSummary {
  id: number;
  title: string;
  eventType: string | null;
  city: string | null;
  startDate: Date | null;
  endDate: Date | null;
}

interface CitySummary {
  id: number;
  name: string;
  country: string | null;
  memberCount: number | null;
}

// MB.MD Pattern 64: User Context Interfaces
interface UserFriend {
  id: number;
  name: string;
  closenessScore: number | null;
  status: string | null;
}

interface UserRSVP {
  eventId: number;
  eventTitle: string;
  status: string;
  eventDate: Date | null;
}

interface UserCityFollow {
  cityId: number;
  cityName: string;
  country: string | null;
}

interface UserGroupMembership {
  groupId: number;
  groupName: string;
  role: string | null;
}

interface UserContext {
  friends: UserFriend[];
  rsvps: UserRSVP[];
  followedCities: UserCityFollow[];
  groupMemberships: UserGroupMembership[];
  unreadMessages: number;
}

export class MrBlueDataService {
  
  async getPlatformStats(): Promise<PlatformStats> {
    try {
      const now = new Date();
      
      const [eventCount] = await db.select({ count: sql<number>`count(*)` }).from(events);
      const [upcomingCount] = await db.select({ count: sql<number>`count(*)` }).from(events).where(gte(events.startDate, now));
      const [cityCount] = await db.select({ count: sql<number>`count(*)` }).from(cities);
      const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
      const [groupCount] = await db.select({ count: sql<number>`count(*)` }).from(groups);
      
      return {
        totalEvents: Number(eventCount?.count) || 0,
        upcomingEvents: Number(upcomingCount?.count) || 0,
        totalCities: Number(cityCount?.count) || 0,
        totalUsers: Number(userCount?.count) || 0,
        totalGroups: Number(groupCount?.count) || 0,
      };
    } catch (error) {
      console.error('[MrBlueData] Error getting platform stats:', error);
      return {
        totalEvents: 0,
        upcomingEvents: 0,
        totalCities: 0,
        totalUsers: 0,
        totalGroups: 0,
      };
    }
  }

  async getUpcomingEvents(limit: number = 5): Promise<EventSummary[]> {
    try {
      const now = new Date();
      const upcomingEvents = await db
        .select({
          id: events.id,
          title: events.title,
          eventType: events.eventType,
          city: events.city,
          startDate: events.startDate,
          endDate: events.endDate,
        })
        .from(events)
        .where(gte(events.startDate, now))
        .orderBy(events.startDate)
        .limit(limit);
      
      return upcomingEvents;
    } catch (error) {
      console.error('[MrBlueData] Error getting upcoming events:', error);
      return [];
    }
  }

  async searchEvents(query: string, limit: number = 5): Promise<EventSummary[]> {
    try {
      const searchPattern = `%${query}%`;
      const results = await db
        .select({
          id: events.id,
          title: events.title,
          eventType: events.eventType,
          city: events.city,
          startDate: events.startDate,
          endDate: events.endDate,
        })
        .from(events)
        .where(
          or(
            like(events.title, searchPattern),
            like(events.city, searchPattern),
            like(events.eventType, searchPattern)
          )
        )
        .orderBy(desc(events.startDate))
        .limit(limit);
      
      return results;
    } catch (error) {
      console.error('[MrBlueData] Error searching events:', error);
      return [];
    }
  }

  async getPopularCities(limit: number = 5): Promise<CitySummary[]> {
    try {
      const popularCities = await db
        .select({
          id: cities.id,
          name: cities.name,
          country: cities.country,
          memberCount: cities.memberCount,
        })
        .from(cities)
        .orderBy(desc(cities.memberCount))
        .limit(limit);
      
      return popularCities;
    } catch (error) {
      console.error('[MrBlueData] Error getting popular cities:', error);
      return [];
    }
  }

  async searchCities(query: string, limit: number = 5): Promise<CitySummary[]> {
    try {
      const searchPattern = `%${query}%`;
      const results = await db
        .select({
          id: cities.id,
          name: cities.name,
          country: cities.country,
          memberCount: cities.memberCount,
        })
        .from(cities)
        .where(
          or(
            like(cities.name, searchPattern),
            like(cities.country, searchPattern)
          )
        )
        .limit(limit);
      
      return results;
    } catch (error) {
      console.error('[MrBlueData] Error searching cities:', error);
      return [];
    }
  }

  async getEventsInCity(cityName: string, limit: number = 5): Promise<EventSummary[]> {
    try {
      const now = new Date();
      const searchPattern = `%${cityName}%`;
      
      const cityEvents = await db
        .select({
          id: events.id,
          title: events.title,
          eventType: events.eventType,
          city: events.city,
          startDate: events.startDate,
          endDate: events.endDate,
        })
        .from(events)
        .where(
          and(
            like(events.city, searchPattern),
            gte(events.startDate, now)
          )
        )
        .orderBy(events.startDate)
        .limit(limit);
      
      return cityEvents;
    } catch (error) {
      console.error('[MrBlueData] Error getting events in city:', error);
      return [];
    }
  }

  async buildPlatformContext(): Promise<string> {
    const stats = await this.getPlatformStats();
    const upcomingEvents = await this.getUpcomingEvents(3);
    const popularCities = await this.getPopularCities(5);
    
    let context = `
MUNDO TANGO PLATFORM DATA (Real-time):
- Total Events: ${stats.totalEvents}
- Upcoming Events: ${stats.upcomingEvents}
- Cities: ${stats.totalCities}
- Users: ${stats.totalUsers}
- Groups: ${stats.totalGroups}
`;

    if (upcomingEvents.length > 0) {
      context += `\nNEXT UPCOMING EVENTS:\n`;
      upcomingEvents.forEach(e => {
        const date = e.startDate ? new Date(e.startDate).toLocaleDateString() : 'TBD';
        context += `- ${e.title} (${e.eventType || 'Event'}) in ${e.city || 'Unknown'} on ${date}\n`;
      });
    }

    if (popularCities.length > 0) {
      context += `\nPOPULAR TANGO CITIES:\n`;
      popularCities.forEach(c => {
        context += `- ${c.name}, ${c.country || ''} (${c.memberCount || 0} members)\n`;
      });
    }

    return context;
  }

  detectQueryIntent(message: string): {
    type: 'events' | 'cities' | 'general' | 'help';
    location?: string;
    eventType?: string;
  } {
    const msg = message.toLowerCase();
    
    if (msg.includes('event') || msg.includes('milonga') || msg.includes('festival') || msg.includes('workshop') || msg.includes('practica')) {
      const cityMatch = msg.match(/in\s+([a-z\s]+?)(?:\s|$|,|\?)/i);
      return {
        type: 'events',
        location: cityMatch ? cityMatch[1].trim() : undefined,
        eventType: msg.includes('milonga') ? 'milonga' : 
                   msg.includes('festival') ? 'festival' : 
                   msg.includes('workshop') ? 'workshop' : undefined
      };
    }
    
    if (msg.includes('city') || msg.includes('cities') || msg.includes('where') || msg.includes('tango scene')) {
      return { type: 'cities' };
    }
    
    if (msg.includes('help') || msg.includes('how') || msg.includes('what can')) {
      return { type: 'help' };
    }
    
    return { type: 'general' };
  }

  // MB.MD Pattern 64: User Context Methods
  
  async getUserFriends(userId: number, limit: number = 10): Promise<UserFriend[]> {
    try {
      const friendsList = await db
        .select({
          id: users.id,
          name: users.name,
          closenessScore: friendships.closenessScore,
          status: friendships.status,
        })
        .from(friendships)
        .innerJoin(users, eq(users.id, friendships.friendId))
        .where(and(
          eq(friendships.userId, userId),
          eq(friendships.status, 'accepted')
        ))
        .orderBy(desc(friendships.closenessScore))
        .limit(limit);
      
      return friendsList.map(f => ({
        id: f.id,
        name: f.name || 'Unknown',
        closenessScore: f.closenessScore,
        status: f.status
      }));
    } catch (error) {
      console.error('[MrBlueData] Error getting user friends:', error);
      return [];
    }
  }

  async getUserRSVPs(userId: number, limit: number = 10): Promise<UserRSVP[]> {
    try {
      const now = new Date();
      const rsvpList = await db
        .select({
          eventId: events.id,
          eventTitle: events.title,
          status: eventRsvps.status,
          eventDate: events.startDate,
        })
        .from(eventRsvps)
        .innerJoin(events, eq(events.id, eventRsvps.eventId))
        .where(and(
          eq(eventRsvps.userId, userId),
          gte(events.startDate, now)
        ))
        .orderBy(events.startDate)
        .limit(limit);
      
      return rsvpList.map(r => ({
        eventId: r.eventId,
        eventTitle: r.eventTitle || 'Untitled Event',
        status: r.status || 'going',
        eventDate: r.eventDate
      }));
    } catch (error) {
      console.error('[MrBlueData] Error getting user RSVPs:', error);
      return [];
    }
  }

  async getUserCities(userId: number, limit: number = 10): Promise<UserCityFollow[]> {
    try {
      const cityList = await db
        .select({
          cityId: cities.id,
          cityName: cities.name,
          country: cities.country,
        })
        .from(cityMembers)
        .innerJoin(cities, eq(cities.id, cityMembers.cityId))
        .where(eq(cityMembers.userId, userId))
        .limit(limit);
      
      return cityList.map(c => ({
        cityId: c.cityId,
        cityName: c.cityName,
        country: c.country
      }));
    } catch (error) {
      console.error('[MrBlueData] Error getting user cities:', error);
      return [];
    }
  }

  async getUserGroups(userId: number, limit: number = 10): Promise<UserGroupMembership[]> {
    try {
      const groupList = await db
        .select({
          groupId: groups.id,
          groupName: groups.name,
          role: groupMembers.role,
        })
        .from(groupMembers)
        .innerJoin(groups, eq(groups.id, groupMembers.groupId))
        .where(eq(groupMembers.userId, userId))
        .limit(limit);
      
      return groupList.map(g => ({
        groupId: g.groupId,
        groupName: g.groupName,
        role: g.role
      }));
    } catch (error) {
      console.error('[MrBlueData] Error getting user groups:', error);
      return [];
    }
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    try {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(directMessages)
        .where(and(
          eq(directMessages.receiverId, userId),
          eq(directMessages.isRead, false)
        ));
      
      return Number(result?.count) || 0;
    } catch (error) {
      console.error('[MrBlueData] Error getting unread messages:', error);
      return 0;
    }
  }

  async getUserContext(userId: number): Promise<UserContext> {
    try {
      const [friends, rsvps, followedCities, groupMemberships, unreadMessages] = await Promise.all([
        this.getUserFriends(userId),
        this.getUserRSVPs(userId),
        this.getUserCities(userId),
        this.getUserGroups(userId),
        this.getUnreadMessageCount(userId)
      ]);

      return {
        friends,
        rsvps,
        followedCities,
        groupMemberships,
        unreadMessages
      };
    } catch (error) {
      console.error('[MrBlueData] Error building user context:', error);
      return {
        friends: [],
        rsvps: [],
        followedCities: [],
        groupMemberships: [],
        unreadMessages: 0
      };
    }
  }

  async buildUserContextString(userId: number): Promise<string> {
    const ctx = await this.getUserContext(userId);
    
    let userContextStr = `\nYOUR PERSONAL CONTEXT:\n`;
    
    if (ctx.friends.length > 0) {
      userContextStr += `\nFriends (${ctx.friends.length}):\n`;
      ctx.friends.slice(0, 5).forEach(f => {
        userContextStr += `- ${f.name}${f.closenessScore ? ` (closeness: ${f.closenessScore})` : ''}\n`;
      });
    }
    
    if (ctx.rsvps.length > 0) {
      userContextStr += `\nUpcoming Events You're Attending:\n`;
      ctx.rsvps.forEach(r => {
        const date = r.eventDate ? new Date(r.eventDate).toLocaleDateString() : 'TBD';
        userContextStr += `- ${r.eventTitle} on ${date} (${r.status})\n`;
      });
    }
    
    if (ctx.followedCities.length > 0) {
      userContextStr += `\nCities You Follow:\n`;
      ctx.followedCities.forEach(c => {
        userContextStr += `- ${c.cityName}, ${c.country || ''}\n`;
      });
    }
    
    if (ctx.groupMemberships.length > 0) {
      userContextStr += `\nGroups You're In:\n`;
      ctx.groupMemberships.forEach(g => {
        userContextStr += `- ${g.groupName}${g.role ? ` (${g.role})` : ''}\n`;
      });
    }
    
    if (ctx.unreadMessages > 0) {
      userContextStr += `\nUnread Messages: ${ctx.unreadMessages}\n`;
    }
    
    return userContextStr;
  }

  // MB.MD Pattern 65: God Mode - Full system access for admin/CTO users
  async buildGodModeContext(): Promise<string> {
    const stats = await this.getPlatformStats();
    
    // Get recent error logs if available (placeholder for now)
    const godContext = `
GOD MODE SYSTEM ACCESS (Admin/CTO Only):
=========================================
REAL-TIME PLATFORM METRICS:
- Total Events: ${stats.totalEvents}
- Upcoming Events: ${stats.upcomingEvents}  
- Total Cities: ${stats.totalCities}
- Total Users: ${stats.totalUsers}
- Total Groups: ${stats.totalGroups}

SYSTEM CAPABILITIES:
- Full database read access
- User management queries
- Event management
- Content moderation
- System diagnostics

You have full Replit AI Agent-level access to help with platform issues.
`;
    return godContext;
  }
}

export const mrBlueDataService = new MrBlueDataService();
