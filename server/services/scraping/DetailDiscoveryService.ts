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
    
    languageAwareFieldMapper.detectLanguage(html);
    const lang = languageAwareFieldMapper.getLanguage();
    console.log(`[DetailDiscovery] 🌐 Detected language: ${lang}`);

    const data: DetailPageData = {
      organizers: [],
      djs: [],
      teachers: [],
      orchestras: [],
      performers: [],
      hosts: [],
    };

    // First try to extract from JSON-LD structured data
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const jsonText = $(el).html();
        if (jsonText) {
          const jsonData = JSON.parse(jsonText);
          if (jsonData['@type'] === 'DanceEvent' || jsonData['@type'] === 'Event') {
            // Extract venue/location
            if (jsonData.location) {
              if (typeof jsonData.location === 'string') {
                data.venue = jsonData.location;
              } else if (jsonData.location.name) {
                data.venue = jsonData.location.name;
              }
              if (jsonData.location.address) {
                if (typeof jsonData.location.address === 'string') {
                  data.fullAddress = jsonData.location.address;
                } else if (jsonData.location.address.streetAddress) {
                  const addr = jsonData.location.address;
                  data.fullAddress = [
                    addr.streetAddress,
                    addr.addressLocality,
                    addr.addressRegion,
                    addr.addressCountry
                  ].filter(Boolean).join(', ');
                }
              }
            }

            // Extract organizer
            if (jsonData.organizer) {
              const orgName = typeof jsonData.organizer === 'string' 
                ? jsonData.organizer 
                : jsonData.organizer.name;
              if (orgName) {
                data.organizers.push(orgName);
              }
            }

            // Extract image
            if (jsonData.image) {
              data.coverImage = Array.isArray(jsonData.image) ? jsonData.image[0] : jsonData.image;
            }

            // Extract offers/price
            if (jsonData.offers) {
              const offer = Array.isArray(jsonData.offers) ? jsonData.offers[0] : jsonData.offers;
              if (offer.price !== undefined) {
                data.price = `${offer.priceCurrency || ''} ${offer.price}`.trim();
              }
            }

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
