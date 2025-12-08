/**
 * DEDUPLICATION ENGINE
 * Fuzzy matching for event deduplication
 * 
 * Features:
 * - Compare: title similarity, date matching, location proximity
 * - Confidence scoring (0-100)
 * - Merge duplicate events into single record
 */

import logger from '../../middleware/logger';
import { ScrapedEventData } from './StaticPageScraper';

export interface DeduplicationConfig {
  titleSimilarityThreshold: number;
  dateToleranceHours: number;
  locationSimilarityThreshold: number;
  overallConfidenceThreshold: number;
  weights: {
    title: number;
    date: number;
    location: number;
    venue: number;
  };
}

export interface DuplicateMatch {
  event1Id: string;
  event2Id: string;
  confidence: number;
  matchDetails: {
    titleSimilarity: number;
    dateMatch: boolean;
    dateDifferenceHours: number;
    locationSimilarity: number;
    venueSimilarity: number;
  };
}

export interface DeduplicationResult {
  totalEvents: number;
  uniqueEvents: number;
  duplicatesFound: number;
  mergedEvents: ScrapedEventData[];
  duplicateMatches: DuplicateMatch[];
}

export interface MergeStrategy {
  preferLongerDescription: boolean;
  preferEarlierDate: boolean;
  combineOrganizers: boolean;
  preferHigherPrice: boolean;
  keepAllTags: boolean;
}

const DEFAULT_CONFIG: DeduplicationConfig = {
  titleSimilarityThreshold: 0.7,
  dateToleranceHours: 4,
  locationSimilarityThreshold: 0.6,
  overallConfidenceThreshold: 75,
  weights: {
    title: 40,
    date: 30,
    location: 20,
    venue: 10
  }
};

const DEFAULT_MERGE_STRATEGY: MergeStrategy = {
  preferLongerDescription: true,
  preferEarlierDate: false,
  combineOrganizers: true,
  preferHigherPrice: false,
  keepAllTags: true
};

export class DeduplicationEngine {
  private config: DeduplicationConfig;
  private mergeStrategy: MergeStrategy;

  constructor(config?: Partial<DeduplicationConfig>, mergeStrategy?: Partial<MergeStrategy>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.mergeStrategy = { ...DEFAULT_MERGE_STRATEGY, ...mergeStrategy };
  }

  async deduplicate(events: ScrapedEventData[]): Promise<DeduplicationResult> {
    logger.info(`[DeduplicationEngine] Starting deduplication of ${events.length} events`);

    const result: DeduplicationResult = {
      totalEvents: events.length,
      uniqueEvents: 0,
      duplicatesFound: 0,
      mergedEvents: [],
      duplicateMatches: []
    };

    if (events.length === 0) {
      return result;
    }

    const duplicateGroups = this.findDuplicateGroups(events);
    const { mergedEvents, matches } = this.mergeGroups(duplicateGroups, events);

    result.mergedEvents = mergedEvents;
    result.uniqueEvents = mergedEvents.length;
    result.duplicatesFound = events.length - mergedEvents.length;
    result.duplicateMatches = matches;

    logger.info(`[DeduplicationEngine] Complete: ${result.uniqueEvents} unique, ${result.duplicatesFound} duplicates merged`);

    return result;
  }

  calculateMatchConfidence(event1: ScrapedEventData, event2: ScrapedEventData): DuplicateMatch {
    const titleSimilarity = this.calculateTitleSimilarity(event1.title, event2.title);
    const { isMatch: dateMatch, differenceHours } = this.calculateDateMatch(event1.startDate, event2.startDate);
    const locationSimilarity = this.calculateLocationSimilarity(
      event1.location || event1.address || '',
      event2.location || event2.address || ''
    );
    const venueSimilarity = this.calculateVenueSimilarity(
      event1.venue || '',
      event2.venue || ''
    );

    const { weights } = this.config;
    const totalWeight = weights.title + weights.date + weights.location + weights.venue;

    const confidence = Math.round(
      (
        (titleSimilarity * weights.title) +
        ((dateMatch ? 1 : 0) * weights.date) +
        (locationSimilarity * weights.location) +
        (venueSimilarity * weights.venue)
      ) / totalWeight * 100
    );

    return {
      event1Id: event1.externalId || this.generateEventId(event1),
      event2Id: event2.externalId || this.generateEventId(event2),
      confidence,
      matchDetails: {
        titleSimilarity: Math.round(titleSimilarity * 100),
        dateMatch,
        dateDifferenceHours: Math.round(differenceHours * 10) / 10,
        locationSimilarity: Math.round(locationSimilarity * 100),
        venueSimilarity: Math.round(venueSimilarity * 100)
      }
    };
  }

  private calculateTitleSimilarity(title1: string, title2: string): number {
    const normalized1 = this.normalizeText(title1);
    const normalized2 = this.normalizeText(title2);

    if (normalized1 === normalized2) return 1;

    const levenshteinSim = 1 - (this.levenshteinDistance(normalized1, normalized2) / 
      Math.max(normalized1.length, normalized2.length));

    const jaccardSim = this.jaccardSimilarity(
      normalized1.split(/\s+/),
      normalized2.split(/\s+/)
    );

    return (levenshteinSim * 0.4) + (jaccardSim * 0.6);
  }

  private calculateDateMatch(date1: Date, date2: Date): { isMatch: boolean; differenceHours: number } {
    const diff = Math.abs(date1.getTime() - date2.getTime());
    const differenceHours = diff / (1000 * 60 * 60);
    const isMatch = differenceHours <= this.config.dateToleranceHours;

    return { isMatch, differenceHours };
  }

  private calculateLocationSimilarity(location1: string, location2: string): number {
    if (!location1 && !location2) return 1;
    if (!location1 || !location2) return 0;

    const normalized1 = this.normalizeLocation(location1);
    const normalized2 = this.normalizeLocation(location2);

    if (normalized1 === normalized2) return 1;

    return this.jaccardSimilarity(
      normalized1.split(/\s+/),
      normalized2.split(/\s+/)
    );
  }

  private calculateVenueSimilarity(venue1: string, venue2: string): number {
    if (!venue1 && !venue2) return 1;
    if (!venue1 || !venue2) return 0;

    const normalized1 = this.normalizeText(venue1);
    const normalized2 = this.normalizeText(venue2);

    if (normalized1 === normalized2) return 1;

    return 1 - (this.levenshteinDistance(normalized1, normalized2) / 
      Math.max(normalized1.length, normalized2.length));
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeLocation(location: string): string {
    const stopWords = ['the', 'at', 'in', 'on', 'of', 'and', '&', 'street', 'st', 'avenue', 'ave', 'road', 'rd'];
    
    let normalized = this.normalizeText(location);
    
    const words = normalized.split(/\s+/).filter(w => !stopWords.includes(w));
    
    return words.join(' ');
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    return dp[m][n];
  }

  private jaccardSimilarity(set1: string[], set2: string[]): number {
    const s1 = new Set(set1.filter(Boolean));
    const s2 = new Set(set2.filter(Boolean));

    if (s1.size === 0 && s2.size === 0) return 1;

    const intersection = new Set([...s1].filter(x => s2.has(x)));
    const union = new Set([...s1, ...s2]);

    return intersection.size / union.size;
  }

  private findDuplicateGroups(events: ScrapedEventData[]): Map<string, Set<number>> {
    const groups = new Map<string, Set<number>>();
    const eventToGroup = new Map<number, string>();
    let groupCounter = 0;

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const match = this.calculateMatchConfidence(events[i], events[j]);

        if (match.confidence >= this.config.overallConfidenceThreshold) {
          const groupI = eventToGroup.get(i);
          const groupJ = eventToGroup.get(j);

          if (!groupI && !groupJ) {
            const newGroupId = `group-${groupCounter++}`;
            groups.set(newGroupId, new Set([i, j]));
            eventToGroup.set(i, newGroupId);
            eventToGroup.set(j, newGroupId);
          } else if (groupI && !groupJ) {
            groups.get(groupI)!.add(j);
            eventToGroup.set(j, groupI);
          } else if (!groupI && groupJ) {
            groups.get(groupJ)!.add(i);
            eventToGroup.set(i, groupJ);
          } else if (groupI && groupJ && groupI !== groupJ) {
            const merged = new Set([...groups.get(groupI)!, ...groups.get(groupJ)!]);
            groups.delete(groupJ);
            groups.set(groupI, merged);
            for (const idx of merged) {
              eventToGroup.set(idx, groupI);
            }
          }
        }
      }
    }

    const groupedIndices = new Set<number>();
    for (const indices of groups.values()) {
      for (const idx of indices) {
        groupedIndices.add(idx);
      }
    }

    for (let i = 0; i < events.length; i++) {
      if (!groupedIndices.has(i)) {
        const singleGroupId = `single-${i}`;
        groups.set(singleGroupId, new Set([i]));
      }
    }

    return groups;
  }

  private mergeGroups(
    groups: Map<string, Set<number>>,
    events: ScrapedEventData[]
  ): { mergedEvents: ScrapedEventData[]; matches: DuplicateMatch[] } {
    const mergedEvents: ScrapedEventData[] = [];
    const matches: DuplicateMatch[] = [];

    for (const [groupId, indices] of groups) {
      const groupEvents = [...indices].map(i => events[i]);

      if (groupEvents.length === 1) {
        mergedEvents.push(groupEvents[0]);
      } else {
        const merged = this.mergeEvents(groupEvents);
        mergedEvents.push(merged);

        const indicesArray = [...indices];
        for (let i = 0; i < indicesArray.length; i++) {
          for (let j = i + 1; j < indicesArray.length; j++) {
            const match = this.calculateMatchConfidence(
              events[indicesArray[i]],
              events[indicesArray[j]]
            );
            matches.push(match);
          }
        }
      }
    }

    return { mergedEvents, matches };
  }

  mergeEvents(events: ScrapedEventData[]): ScrapedEventData {
    if (events.length === 0) {
      throw new Error('Cannot merge empty event list');
    }

    if (events.length === 1) {
      return events[0];
    }

    const sorted = [...events].sort((a, b) => {
      if (this.mergeStrategy.preferEarlierDate) {
        return a.startDate.getTime() - b.startDate.getTime();
      }
      const scoreA = this.calculateEventQualityScore(a);
      const scoreB = this.calculateEventQualityScore(b);
      return scoreB - scoreA;
    });

    const primary = sorted[0];
    const others = sorted.slice(1);

    let description = primary.description;
    if (this.mergeStrategy.preferLongerDescription) {
      for (const event of others) {
        if (event.description && (!description || event.description.length > description.length)) {
          description = event.description;
        }
      }
    }

    const organizers: string[] = [];
    if (primary.organizer) organizers.push(primary.organizer);
    if (this.mergeStrategy.combineOrganizers) {
      for (const event of others) {
        if (event.organizer && !organizers.includes(event.organizer)) {
          organizers.push(event.organizer);
        }
      }
    }

    let tags: string[] = [];
    if (this.mergeStrategy.keepAllTags) {
      const allTags = events.flatMap(e => e.tags || []);
      tags = [...new Set(allTags)];
    } else {
      tags = primary.tags || [];
    }

    let price = primary.price;
    if (this.mergeStrategy.preferHigherPrice) {
      for (const event of others) {
        if (event.price) {
          const numPrice = parseFloat(event.price) || 0;
          const numCurrentPrice = parseFloat(price || '0') || 0;
          if (numPrice > numCurrentPrice) {
            price = event.price;
          }
        }
      }
    }

    const merged: ScrapedEventData = {
      ...primary,
      description,
      organizer: organizers.join(', '),
      tags,
      price,
      location: primary.location || others.find(e => e.location)?.location,
      venue: primary.venue || others.find(e => e.venue)?.venue,
      address: primary.address || others.find(e => e.address)?.address,
      city: primary.city || others.find(e => e.city)?.city,
      country: primary.country || others.find(e => e.country)?.country,
      imageUrl: primary.imageUrl || others.find(e => e.imageUrl)?.imageUrl,
      externalId: `merged-${this.generateMergedId(events)}`
    };

    return merged;
  }

  private calculateEventQualityScore(event: ScrapedEventData): number {
    let score = 0;

    if (event.title) score += 10;
    if (event.description) score += Math.min(event.description.length / 100, 20);
    if (event.location) score += 10;
    if (event.venue) score += 10;
    if (event.address) score += 10;
    if (event.organizer) score += 10;
    if (event.price) score += 5;
    if (event.imageUrl) score += 15;
    if (event.tags?.length) score += Math.min(event.tags.length * 2, 10);

    return score;
  }

  private generateEventId(event: ScrapedEventData): string {
    const str = `${event.title}-${event.startDate.toISOString()}-${event.location || ''}`;
    return this.hashString(str);
  }

  private generateMergedId(events: ScrapedEventData[]): string {
    const ids = events.map(e => e.externalId || this.generateEventId(e)).sort();
    return this.hashString(ids.join('|'));
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  findDuplicates(events: ScrapedEventData[], threshold?: number): DuplicateMatch[] {
    const matches: DuplicateMatch[] = [];
    const confidenceThreshold = threshold || this.config.overallConfidenceThreshold;

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const match = this.calculateMatchConfidence(events[i], events[j]);
        if (match.confidence >= confidenceThreshold) {
          matches.push(match);
        }
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  isDuplicate(event1: ScrapedEventData, event2: ScrapedEventData): boolean {
    const match = this.calculateMatchConfidence(event1, event2);
    return match.confidence >= this.config.overallConfidenceThreshold;
  }

  static createDefault(): DeduplicationEngine {
    return new DeduplicationEngine();
  }
}

export default DeduplicationEngine;
