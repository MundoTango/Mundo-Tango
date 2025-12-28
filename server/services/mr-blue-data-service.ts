/**
 * Mr. Blue Data Service - Database Access Layer
 * Provides real-time platform data for AI-powered responses
 */

import { db } from '@db';
import { events, cities, users, groups } from '@shared/schema';
import { eq, desc, gte, like, sql, and, or } from 'drizzle-orm';

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
}

export const mrBlueDataService = new MrBlueDataService();
