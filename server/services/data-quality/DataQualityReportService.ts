/**
 * DATA QUALITY REPORT SERVICE
 * MB.MD Implementation - Pattern: Observe → Decide → Act → Validate
 * December 21, 2025
 * 
 * Generates comprehensive data quality reports for:
 * - Cities (cover images, descriptions, event counts)
 * - Events (covers, organizers, venues)
 * - Scraper sources (activity, coverage)
 * - Found people (DJ/teacher/organizer linking)
 */

import { db } from '@shared/db';
import { events, groups, eventScrapingSources, users } from '@shared/schema';
import { eq, sql, isNull, ne, count, and, or, ilike, desc } from 'drizzle-orm';

export interface CityQualityMetrics {
  totalCities: number;
  withCoverImage: number;
  withDescription: number;
  withRichDescription: number;
  withEvents: number;
  missingCoverPct: number;
  missingDescriptionPct: number;
  citiesWithIssues: Array<{
    id: number;
    name: string;
    issues: string[];
    eventCount: number;
  }>;
}

export interface EventQualityMetrics {
  totalEvents: number;
  withCoverImage: number;
  withOrganizerText: number;
  withDJText: number;
  withTeacherText: number;
  withVenue: number;
  fromScraping: number;
  uniqueCities: number;
  missingCoverPct: number;
  missingOrganizerPct: number;
  eventsWithIssues: Array<{
    id: number;
    title: string;
    city: string;
    issues: string[];
  }>;
}

export interface SourceQualityMetrics {
  totalSources: number;
  activeSources: number;
  everScraped: number;
  neverScraped: number;
  duplicateSources: number;
  coveragePct: number;
  staleSourcesCount: number;
  sourcesNeedingAttention: Array<{
    id: number;
    name: string;
    url: string;
    city: string;
    issue: string;
  }>;
}

export interface FoundPeopleMetrics {
  eventsWithOrganizers: number;
  eventsWithDJs: number;
  eventsWithTeachers: number;
  linkedOrganizers: number;
  linkedDJs: number;
  linkedTeachers: number;
  unlinkedNamesCount: number;
  topUnlinkedNames: Array<{
    name: string;
    role: string;
    occurrences: number;
  }>;
}

export interface DataQualityReport {
  generatedAt: Date;
  cities: CityQualityMetrics;
  events: EventQualityMetrics;
  sources: SourceQualityMetrics;
  foundPeople: FoundPeopleMetrics;
  overallHealthScore: number;
  recommendations: string[];
}

export class DataQualityReportService {
  /**
   * Generate city quality metrics
   */
  static async getCityMetrics(): Promise<CityQualityMetrics> {
    console.log('[DataQuality] 📊 Generating city metrics...');

    // Basic counts
    const cityGroups = await db.select({
      id: groups.id,
      name: groups.name,
      city: groups.city,
      coverImage: groups.coverImage,
      description: groups.description,
    }).from(groups).where(eq(groups.type, 'city'));

    const totalCities = cityGroups.length;
    
    // Count cities with cover images (not null or empty)
    const withCoverImage = cityGroups.filter(c => c.coverImage && c.coverImage.trim() !== '').length;
    
    // Count cities with descriptions
    const withDescription = cityGroups.filter(c => c.description && c.description.trim() !== '').length;
    
    // Count cities with rich descriptions (not just the generic template)
    const withRichDescription = cityGroups.filter(c => 
      c.description && 
      c.description.length > 100 && 
      !c.description.includes('Connect with fellow tangueros')
    ).length;

    // Get event counts per city
    const eventCounts = await db.select({
      city: events.city,
      count: count(),
    }).from(events)
      .where(sql`${events.city} IS NOT NULL`)
      .groupBy(events.city);

    const eventCountMap = new Map(eventCounts.map(e => [e.city?.toLowerCase(), e.count]));

    // Find cities with events
    const withEvents = cityGroups.filter(c => {
      const cityName = c.city?.toLowerCase() || c.name?.toLowerCase();
      return cityName && (eventCountMap.get(cityName) || 0) > 0;
    }).length;

    // Identify cities with issues
    const citiesWithIssues = cityGroups
      .map(c => {
        const issues: string[] = [];
        const cityName = c.city?.toLowerCase() || c.name?.toLowerCase();
        const eventCount = eventCountMap.get(cityName || '') || 0;

        if (!c.coverImage || c.coverImage.trim() === '') {
          issues.push('missing_cover');
        }
        if (!c.description || c.description.includes('Connect with fellow tangueros')) {
          issues.push('generic_description');
        }
        if (eventCount === 0) {
          issues.push('no_events');
        }

        return {
          id: c.id,
          name: c.name || c.city || 'Unknown',
          issues,
          eventCount,
        };
      })
      .filter(c => c.issues.length > 0);

    const missingCoverPct = totalCities > 0 ? ((totalCities - withCoverImage) / totalCities) * 100 : 0;
    const missingDescriptionPct = totalCities > 0 ? ((totalCities - withRichDescription) / totalCities) * 100 : 0;

    console.log(`[DataQuality] ✅ City metrics: ${totalCities} total, ${withCoverImage} with covers, ${citiesWithIssues.length} with issues`);

    return {
      totalCities,
      withCoverImage,
      withDescription,
      withRichDescription,
      withEvents,
      missingCoverPct: Math.round(missingCoverPct * 100) / 100,
      missingDescriptionPct: Math.round(missingDescriptionPct * 100) / 100,
      citiesWithIssues,
    };
  }

  /**
   * Generate event quality metrics
   */
  static async getEventMetrics(): Promise<EventQualityMetrics> {
    console.log('[DataQuality] 📊 Generating event metrics...');

    const allEvents = await db.select({
      id: events.id,
      title: events.title,
      city: events.city,
      coverImage: events.coverImage,
      organizerText: events.organizerText,
      djText: events.djText,
      teacherText: events.teacherText,
      venue: events.venue,
      sourceName: events.sourceName,
    }).from(events);

    const totalEvents = allEvents.length;
    const withCoverImage = allEvents.filter(e => e.coverImage && e.coverImage.trim() !== '').length;
    const withOrganizerText = allEvents.filter(e => e.organizerText && e.organizerText.trim() !== '').length;
    const withDJText = allEvents.filter(e => e.djText && e.djText.trim() !== '').length;
    const withTeacherText = allEvents.filter(e => e.teacherText && e.teacherText.trim() !== '').length;
    const withVenue = allEvents.filter(e => e.venue && e.venue.trim() !== '').length;
    const fromScraping = allEvents.filter(e => e.sourceName).length;

    // Count unique cities
    const uniqueCities = new Set(allEvents.map(e => e.city?.toLowerCase()).filter(Boolean)).size;

    // Identify events with issues (sample first 50)
    const eventsWithIssues = allEvents
      .map(e => {
        const issues: string[] = [];
        if (!e.coverImage) issues.push('missing_cover');
        if (!e.organizerText) issues.push('missing_organizer');
        if (!e.venue) issues.push('missing_venue');
        return {
          id: e.id,
          title: e.title || 'Untitled',
          city: e.city || 'Unknown',
          issues,
        };
      })
      .filter(e => e.issues.length > 0)
      .slice(0, 50);

    const missingCoverPct = totalEvents > 0 ? ((totalEvents - withCoverImage) / totalEvents) * 100 : 0;
    const missingOrganizerPct = totalEvents > 0 ? ((totalEvents - withOrganizerText) / totalEvents) * 100 : 0;

    console.log(`[DataQuality] ✅ Event metrics: ${totalEvents} total, ${withCoverImage} with covers`);

    return {
      totalEvents,
      withCoverImage,
      withOrganizerText,
      withDJText,
      withTeacherText,
      withVenue,
      fromScraping,
      uniqueCities,
      missingCoverPct: Math.round(missingCoverPct * 100) / 100,
      missingOrganizerPct: Math.round(missingOrganizerPct * 100) / 100,
      eventsWithIssues,
    };
  }

  /**
   * Generate scraper source metrics
   */
  static async getSourceMetrics(): Promise<SourceQualityMetrics> {
    console.log('[DataQuality] 📊 Generating source metrics...');

    const allSources = await db.select({
      id: eventScrapingSources.id,
      name: eventScrapingSources.name,
      url: eventScrapingSources.url,
      city: eventScrapingSources.city,
      isActive: eventScrapingSources.isActive,
      lastScrapedAt: eventScrapingSources.lastScrapedAt,
    }).from(eventScrapingSources);

    const totalSources = allSources.length;
    const activeSources = allSources.filter(s => s.isActive).length;
    const everScraped = allSources.filter(s => s.lastScrapedAt).length;
    const neverScraped = totalSources - everScraped;

    // Detect duplicates (same URL or similar names for same city)
    const urlMap = new Map<string, number>();
    allSources.forEach(s => {
      if (s.url) {
        const normalizedUrl = s.url.toLowerCase().replace(/\/$/, '');
        urlMap.set(normalizedUrl, (urlMap.get(normalizedUrl) || 0) + 1);
      }
    });
    const duplicateSources = Array.from(urlMap.values()).filter(count => count > 1).reduce((a, b) => a + b, 0);

    // Stale sources (active but not scraped in 7+ days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const staleSources = allSources.filter(s => 
      s.isActive && 
      s.lastScrapedAt && 
      new Date(s.lastScrapedAt) < sevenDaysAgo
    );

    // Sources needing attention
    const sourcesNeedingAttention = allSources
      .filter(s => s.isActive && !s.lastScrapedAt)
      .map(s => ({
        id: s.id,
        name: s.name || 'Unnamed',
        url: s.url || '',
        city: s.city || 'Unknown',
        issue: 'never_scraped',
      }))
      .slice(0, 20);

    const coveragePct = totalSources > 0 ? (everScraped / totalSources) * 100 : 0;

    console.log(`[DataQuality] ✅ Source metrics: ${totalSources} total, ${everScraped} scraped, ${neverScraped} never scraped`);

    return {
      totalSources,
      activeSources,
      everScraped,
      neverScraped,
      duplicateSources,
      coveragePct: Math.round(coveragePct * 100) / 100,
      staleSourcesCount: staleSources.length,
      sourcesNeedingAttention,
    };
  }

  /**
   * Generate found people (DJ/teacher/organizer) metrics
   */
  static async getFoundPeopleMetrics(): Promise<FoundPeopleMetrics> {
    console.log('[DataQuality] 📊 Generating found people metrics...');

    const eventsWithPeople = await db.select({
      organizerText: events.organizerText,
      djText: events.djText,
      teacherText: events.teacherText,
      organizerProfiles: events.organizerProfiles,
      djProfiles: events.djProfiles,
      teacherProfiles: events.teacherProfiles,
    }).from(events);

    const eventsWithOrganizers = eventsWithPeople.filter(e => e.organizerText && e.organizerText.trim() !== '').length;
    const eventsWithDJs = eventsWithPeople.filter(e => e.djText && e.djText.trim() !== '').length;
    const eventsWithTeachers = eventsWithPeople.filter(e => e.teacherText && e.teacherText.trim() !== '').length;

    // Count linked profiles
    const linkedOrganizers = eventsWithPeople.filter(e => e.organizerProfiles && e.organizerProfiles.length > 0).length;
    const linkedDJs = eventsWithPeople.filter(e => e.djProfiles && e.djProfiles.length > 0).length;
    const linkedTeachers = eventsWithPeople.filter(e => e.teacherProfiles && e.teacherProfiles.length > 0).length;

    // Extract unlinked names and count occurrences
    const nameOccurrences = new Map<string, { role: string; count: number }>();
    
    const extractNames = (text: string | null, role: string) => {
      if (!text) return;
      const names = text.split(/[,&]/).map(n => n.trim().replace(/^DJ\s+/i, '').replace(/^with\s+/i, ''));
      names.forEach(name => {
        if (name.length > 2 && name.length < 50) {
          const key = `${name.toLowerCase()}|${role}`;
          const existing = nameOccurrences.get(key);
          nameOccurrences.set(key, { role, count: (existing?.count || 0) + 1 });
        }
      });
    };

    eventsWithPeople.forEach(e => {
      if (e.organizerText && (!e.organizerProfiles || e.organizerProfiles.length === 0)) {
        extractNames(e.organizerText, 'organizer');
      }
      if (e.djText && (!e.djProfiles || e.djProfiles.length === 0)) {
        extractNames(e.djText, 'dj');
      }
      if (e.teacherText && (!e.teacherProfiles || e.teacherProfiles.length === 0)) {
        extractNames(e.teacherText, 'teacher');
      }
    });

    const topUnlinkedNames = Array.from(nameOccurrences.entries())
      .map(([key, data]) => ({
        name: key.split('|')[0],
        role: data.role,
        occurrences: data.count,
      }))
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 20);

    console.log(`[DataQuality] ✅ Found people metrics: ${eventsWithOrganizers} with organizers, ${linkedOrganizers} linked`);

    return {
      eventsWithOrganizers,
      eventsWithDJs,
      eventsWithTeachers,
      linkedOrganizers,
      linkedDJs,
      linkedTeachers,
      unlinkedNamesCount: nameOccurrences.size,
      topUnlinkedNames,
    };
  }

  /**
   * Generate full data quality report
   */
  static async generateFullReport(): Promise<DataQualityReport> {
    console.log('[DataQuality] 🚀 Generating full data quality report...');

    const [cities, events, sources, foundPeople] = await Promise.all([
      this.getCityMetrics(),
      this.getEventMetrics(),
      this.getSourceMetrics(),
      this.getFoundPeopleMetrics(),
    ]);

    // Calculate overall health score (0-100)
    const cityScore = 100 - cities.missingCoverPct - (cities.missingDescriptionPct * 0.5);
    const eventScore = 100 - events.missingCoverPct - (events.missingOrganizerPct * 0.3);
    const sourceScore = sources.coveragePct;
    const peopleScore = foundPeople.eventsWithOrganizers > 0 
      ? (foundPeople.linkedOrganizers / foundPeople.eventsWithOrganizers) * 100 
      : 100;

    const overallHealthScore = Math.round((cityScore + eventScore + sourceScore + peopleScore) / 4);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (cities.missingCoverPct > 20) {
      recommendations.push(`Add cover images to ${Math.round(cities.missingCoverPct)}% of cities`);
    }
    if (events.missingCoverPct > 30) {
      recommendations.push(`Extract cover images for ${Math.round(events.missingCoverPct)}% of events`);
    }
    if (sources.neverScraped > 50) {
      recommendations.push(`Activate ${sources.neverScraped} never-scraped sources`);
    }
    if (foundPeople.unlinkdNamesCount > 50) {
      recommendations.push(`Link ${foundPeople.unlinkdNamesCount} unmatched DJ/teacher/organizer names`);
    }

    console.log(`[DataQuality] ✅ Report complete. Health score: ${overallHealthScore}/100`);

    return {
      generatedAt: new Date(),
      cities,
      events,
      sources,
      foundPeople,
      overallHealthScore,
      recommendations,
    };
  }
}
