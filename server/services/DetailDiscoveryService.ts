/**
 * MB.MD v9.9.3: Detail Discovery Service
 * 
 * Fetches event detail pages with rate limiting, caching, and error handling.
 * Extracts rich event data: venue, address, organizers, cover images, prices.
 */

import * as cheerio from 'cheerio';
import { languageAwareFieldMapper, ExtractedFields } from './LanguageAwareFieldMapper';

interface DetailPageData {
  venue?: string;
  address?: string;
  fullAddress?: string;
  organizers: string[];
  djs: string[];
  teachers: string[];
  orchestras: string[];
  performers: string[];
  hosts: string[];
  price?: string;
  status?: string;
  coverImage?: string;
  time?: string;
  startTime?: string;  // Local time from source (e.g., "20:00")
  endTime?: string;    // Local time from source (e.g., "01:00")
  startDate?: string;  // ISO date string in local time
  endDate?: string;    // ISO date string in local time
  description?: string;
  coordinates?: { lat: number; lng: number };
}

interface RateLimitConfig {
  maxConcurrent: number;
  delayBetweenRequests: number;
  maxRetries: number;
  retryDelay: number;
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxConcurrent: 2,
  delayBetweenRequests: 1000,
  maxRetries: 2,
  retryDelay: 2000,
};

class DetailRequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = DEFAULT_RATE_LIMIT) {
    this.config = config;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.running >= this.config.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const task = this.queue.shift();

    if (task) {
      try {
        await task();
      } finally {
        await this.delay(this.config.delayBetweenRequests);
        this.running--;
        this.processQueue();
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const requestQueues: Map<string, DetailRequestQueue> = new Map();

function getQueueForDomain(url: string): DetailRequestQueue {
  const domain = new URL(url).hostname;
  if (!requestQueues.has(domain)) {
    requestQueues.set(domain, new DetailRequestQueue());
  }
  return requestQueues.get(domain)!;
}

const responseCache: Map<string, { data: DetailPageData; timestamp: number }> = new Map();
const CACHE_TTL = 1000 * 60 * 60;

export class DetailDiscoveryService {
  /**
   * Fetch and extract data from an event detail page
   */
  async fetchDetailPage(url: string): Promise<DetailPageData | null> {
    const cached = responseCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[DetailDiscovery] 📦 Cache hit: ${url}`);
      return cached.data;
    }

    const queue = getQueueForDomain(url);
    
    return queue.add(async () => {
      console.log(`[DetailDiscovery] 🔍 Fetching: ${url}`);
      
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,es;q=0.8,pt;q=0.7',
          },
        });

        if (!response.ok) {
          console.log(`[DetailDiscovery] ⚠️ HTTP ${response.status}: ${url}`);
          return null;
        }

        const html = await response.text();
        const data = this.parseDetailPage(html, url);
        
        responseCache.set(url, { data, timestamp: Date.now() });
        
        return data;
      } catch (error) {
        console.error(`[DetailDiscovery] ❌ Error fetching ${url}:`, error);
        return null;
      }
    });
  }

  /**
   * Parse HoyMilonga detail page specifically
   * HoyMilonga embeds event data as JSON-LD structured data
   */
  parseHoyMilongaDetailPage(html: string): DetailPageData {
    const $ = cheerio.load(html);
    
    // Detect language in stateless manner
    const lang = languageAwareFieldMapper.detectLanguage(html);
    console.log(`[DetailDiscovery] 🌐 Detected language: ${lang}`);

    const data: DetailPageData = {
      organizers: [],
      djs: [],
      teachers: [],
      orchestras: [],
      performers: [],
      hosts: [],
      startTime: undefined,
      endTime: undefined,
    };

    // First try to extract from JSON-LD structured data
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const jsonText = $(el).html();
        if (jsonText) {
          let jsonData = JSON.parse(jsonText);
          
          // Handle arrays and @graph entries
          const items: any[] = [];
          if (Array.isArray(jsonData)) {
            items.push(...jsonData);
          } else if (jsonData['@graph'] && Array.isArray(jsonData['@graph'])) {
            items.push(...jsonData['@graph']);
          } else {
            items.push(jsonData);
          }

          for (const item of items) {
            // Process DanceEvent or Event entries
            if (item['@type'] === 'DanceEvent' || item['@type'] === 'Event') {
              if (item.location) {
                if (typeof item.location === 'string') {
                  data.venue = data.venue || item.location;
                } else if (item.location.name) {
                  data.venue = data.venue || item.location.name;
                }
                if (item.location.address) {
                  if (typeof item.location.address === 'string') {
                    data.fullAddress = data.fullAddress || item.location.address;
                  } else if (item.location.address.streetAddress) {
                    const addr = item.location.address;
                    data.fullAddress = data.fullAddress || [
                      addr.streetAddress,
                      addr.addressLocality,
                      addr.addressRegion,
                      addr.addressCountry
                    ].filter(Boolean).join(', ');
                  }
                }
              }

              if (item.organizer) {
                const orgName = typeof item.organizer === 'string' 
                  ? item.organizer 
                  : item.organizer.name;
                if (orgName && !data.organizers.includes(orgName)) {
                  data.organizers.push(orgName);
                }
              }

              if (item.image && !data.coverImage) {
                data.coverImage = Array.isArray(item.image) ? item.image[0] : item.image;
              }

              if (item.offers && !data.price) {
                const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
                if (offer.price !== undefined) {
                  data.price = `${offer.priceCurrency || ''} ${offer.price}`.trim();
                }
              }

              // Extract start/end times from ISO date strings (already in local time)
              if (item.startDate && !data.startDate) {
                data.startDate = item.startDate;
                // Extract time portion (e.g., "2025-12-17T20:00:00" -> "20:00")
                const timeMatch = item.startDate.match(/T(\d{2}:\d{2})/);
                if (timeMatch) {
                  data.startTime = timeMatch[1];
                }
              }
              if (item.endDate && !data.endDate) {
                data.endDate = item.endDate;
                const timeMatch = item.endDate.match(/T(\d{2}:\d{2})/);
                if (timeMatch) {
                  data.endTime = timeMatch[1];
                }
              }
            }

            // Process Place entries for venue/address
            if (item['@type'] === 'Place') {
              data.venue = data.venue || item.name;
              if (item.address) {
                if (typeof item.address === 'string') {
                  data.fullAddress = data.fullAddress || item.address;
                } else if (item.address.streetAddress) {
                  const addr = item.address;
                  data.fullAddress = data.fullAddress || [
                    addr.streetAddress,
                    addr.addressLocality,
                    addr.addressRegion,
                    addr.addressCountry
                  ].filter(Boolean).join(', ');
                }
              }
            }

            // Process Organization entries for organizers
            if (item['@type'] === 'Organization' || item['@type'] === 'Person') {
              if (item.name && !data.organizers.includes(item.name)) {
                data.organizers.push(item.name);
              }
            }
          }

          if (data.venue || data.fullAddress) {
            console.log(`[DetailDiscovery] 📊 Parsed JSON-LD: venue=${data.venue}, address=${data.fullAddress?.slice(0, 50)}`);
          }
        }
      } catch (e) {
        // JSON parse error, continue with HTML extraction
      }
    });

    // Fallback: Extract from HTML content
    const pageText = $('body').text();

    // Extract organizers from text if not found in JSON-LD
    if (data.organizers.length === 0) {
      const organizerPattern = /(?:organizador(?:es)?|organiza(?:n)?)[/:]?\s*:?\s*([A-ZÀ-ÿ][A-Za-zÀ-ÿ\s]+(?:\s+(?:y|&)\s+[A-ZÀ-ÿ][A-Za-zÀ-ÿ\s]+)?)/gi;
      const matches = pageText.matchAll(organizerPattern);
      for (const match of matches) {
        const names = match[1].split(/\s*(?:y|&)\s*/i);
        for (const name of names) {
          const trimmed = name.trim();
          if (trimmed.length > 2 && trimmed.length < 40 && !data.organizers.includes(trimmed)) {
            data.organizers.push(trimmed);
          }
        }
      }
    }

    // Extract DJs - look for "DJ: Name" or "Musicalizador: Name" patterns
    const djPattern = /(?:dj|musicalizador(?:a)?)[:\s]+([A-ZÀ-ÿ][A-Za-zÀ-ÿ\s]+(?:\s+(?:y|&)\s+[A-ZÀ-ÿ][A-Za-zÀ-ÿ\s]+)?)/gi;
    const djMatches = pageText.matchAll(djPattern);
    for (const match of djMatches) {
      const names = match[1].split(/\s*(?:y|&)\s*/i);
      for (const name of names) {
        const trimmed = name.trim().replace(/\.+$/, '');
        if (trimmed.length > 2 && trimmed.length < 40 && !data.djs.includes(trimmed)) {
          data.djs.push(trimmed);
        }
      }
    }

    // Extract status
    data.status = languageAwareFieldMapper.extractStatus(pageText);

    // Extract cover image from meta tags if not in JSON-LD
    if (!data.coverImage) {
      const ogImage = $('meta[property="og:image"]').attr('content');
      const twitterImage = $('meta[name="twitter:image"]').attr('content');
      data.coverImage = ogImage || twitterImage;
    }

    return data;
  }

  /**
   * Generic detail page parser
   */
  parseDetailPage(html: string, url: string): DetailPageData {
    if (url.includes('hoy-milonga.com')) {
      return this.parseHoyMilongaDetailPage(html);
    }

    const $ = cheerio.load(html);
    
    languageAwareFieldMapper.detectLanguage(html);
    
    const data: DetailPageData = {
      organizers: [],
      djs: [],
      teachers: [],
      orchestras: [],
      performers: [],
      hosts: [],
    };

    const pageText = $('body').text();
    
    const extractedRoles = languageAwareFieldMapper.extractAllRoles(pageText);
    data.organizers = extractedRoles.organizers;
    data.djs = extractedRoles.djs;
    data.teachers = extractedRoles.teachers;
    data.orchestras = extractedRoles.orchestras;
    data.performers = extractedRoles.performers;
    data.hosts = extractedRoles.hosts;

    data.price = languageAwareFieldMapper.extractPrice(pageText);
    data.status = languageAwareFieldMapper.extractStatus(pageText);

    const ogImage = $('meta[property="og:image"]').attr('content');
    data.coverImage = ogImage || $('img[class*="event"], img[class*="cover"]').first().attr('src');

    return data;
  }

  /**
   * Batch fetch multiple detail pages with progress reporting
   */
  async fetchMultipleDetailPages(
    urls: string[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<Map<string, DetailPageData | null>> {
    const results = new Map<string, DetailPageData | null>();
    let completed = 0;

    const fetchPromises = urls.map(async (url) => {
      const data = await this.fetchDetailPage(url);
      results.set(url, data);
      completed++;
      onProgress?.(completed, urls.length);
    });

    await Promise.all(fetchPromises);
    return results;
  }

  clearCache() {
    responseCache.clear();
    console.log('[DetailDiscovery] 🧹 Cache cleared');
  }
}

export const detailDiscoveryService = new DetailDiscoveryService();
