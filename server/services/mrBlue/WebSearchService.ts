/**
 * Web Search Service (Pattern 76)
 * 
 * Provides web search capabilities for Mr. Blue to gather current information.
 * Uses DuckDuckGo Instant Answer API for quick lookups.
 * 
 * MB.MD v3.1 - VibeCoding Evolution
 */

import axios from 'axios';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  results: SearchResult[];
  instantAnswer?: string;
  relatedTopics?: string[];
  error?: string;
}

interface CacheEntry {
  response: SearchResponse;
  timestamp: number;
}

class WebSearchService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 3600000;
  private readonly DDG_API = 'https://api.duckduckgo.com/';
  private lastRequestTime: number = 0;
  private readonly MIN_REQUEST_INTERVAL = 500;

  constructor() {
    console.log('[WebSearch] Service initialized');
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  private getCacheKey(query: string): string {
    return query.toLowerCase().trim();
  }

  async search(query: string): Promise<SearchResponse> {
    const cacheKey = this.getCacheKey(query);
    
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`[WebSearch] Cache hit for: ${query}`);
      return cached.response;
    }

    try {
      await this.waitForRateLimit();

      console.log(`[WebSearch] Searching: ${query}`);

      const response = await axios.get(this.DDG_API, {
        params: {
          q: query,
          format: 'json',
          no_html: 1,
          skip_disambig: 1
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'MundoTango/1.0 (AI Assistant)'
        }
      });

      const data = response.data;
      const results: SearchResult[] = [];

      if (data.AbstractText) {
        results.push({
          title: data.Heading || query,
          url: data.AbstractURL || '',
          snippet: data.AbstractText,
          source: data.AbstractSource || 'DuckDuckGo'
        });
      }

      if (data.RelatedTopics) {
        for (const topic of data.RelatedTopics.slice(0, 5)) {
          if (topic.Text) {
            results.push({
              title: topic.Text.slice(0, 100),
              url: topic.FirstURL || '',
              snippet: topic.Text,
              source: 'DuckDuckGo'
            });
          }
        }
      }

      const relatedTopics = data.RelatedTopics
        ?.filter((t: any) => t.Name)
        .map((t: any) => t.Name)
        .slice(0, 5) || [];

      const searchResponse: SearchResponse = {
        success: true,
        query,
        results,
        instantAnswer: data.Answer || undefined,
        relatedTopics
      };

      this.cache.set(cacheKey, {
        response: searchResponse,
        timestamp: Date.now()
      });

      return searchResponse;

    } catch (error: any) {
      console.error('[WebSearch] Error:', error.message);
      return {
        success: false,
        query,
        results: [],
        error: error.message
      };
    }
  }

  async searchForDocs(technology: string): Promise<SearchResponse> {
    return this.search(`${technology} documentation official`);
  }

  async searchForError(errorMessage: string): Promise<SearchResponse> {
    const cleanError = errorMessage
      .replace(/at\s+.*$/gm, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200);
    
    return this.search(`${cleanError} solution`);
  }

  async searchForLibrary(name: string, framework?: string): Promise<SearchResponse> {
    const query = framework 
      ? `${name} ${framework} npm package usage`
      : `${name} npm package how to use`;
    return this.search(query);
  }

  clearCache(): void {
    this.cache.clear();
    console.log('[WebSearch] Cache cleared');
  }

  getCacheStats(): { size: number; oldestEntry?: Date } {
    let oldest: number | undefined;
    
    const entries = Array.from(this.cache.values());
    for (const entry of entries) {
      if (!oldest || entry.timestamp < oldest) {
        oldest = entry.timestamp;
      }
    }

    return {
      size: this.cache.size,
      oldestEntry: oldest ? new Date(oldest) : undefined
    };
  }
}

export const webSearchService = new WebSearchService();
