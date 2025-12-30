/**
 * GEOCODING SERVICE
 * Uses OpenStreetMap Nominatim API (free, no key required)
 * 
 * Features:
 * - Rate limiting: 1 request/second per Nominatim usage policy
 * - In-memory caching to avoid duplicate lookups
 * - Retry logic with exponential backoff
 */

import axios from "axios";

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  confidence: number;
}

interface CacheEntry {
  result: GeocodingResult | null;
  timestamp: number;
}

class GeocodingService {
  private cache: Map<string, CacheEntry> = new Map();
  private lastRequestTime: number = 0;
  private readonly MIN_REQUEST_INTERVAL = 1100; // 1.1 seconds to be safe
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
  private readonly USER_AGENT = "MundoTango/1.0 (tango community platform)";
  private readonly MAX_RETRIES = 3;

  /**
   * Generate a cache key from address components
   */
  private getCacheKey(address: string | null, city: string | null, country: string | null): string {
    return [address, city, country]
      .filter(Boolean)
      .map(s => s?.toLowerCase().trim())
      .join("|");
  }

  /**
   * Wait for rate limit before making a request
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Check if a cache entry is still valid
   */
  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_TTL;
  }

  /**
   * Build search query from address components
   */
  private buildSearchQuery(address: string | null, city: string | null, country: string | null): string {
    const parts: string[] = [];
    
    if (address) parts.push(address);
    if (city) parts.push(city);
    if (country) parts.push(country);
    
    return parts.join(", ");
  }

  /**
   * Geocode an address to coordinates
   * 
   * @param address - Street address (optional)
   * @param city - City name (optional)
   * @param country - Country name (optional)
   * @returns GeocodingResult with lat/lng or null if not found
   */
  async geocodeAddress(
    address: string | null,
    city: string | null,
    country: string | null
  ): Promise<GeocodingResult | null> {
    const cacheKey = this.getCacheKey(address, city, country);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log(`[Geocoding] Cache hit for: ${cacheKey}`);
      return cached.result;
    }

    // Build search query
    const query = this.buildSearchQuery(address, city, country);
    if (!query) {
      console.log("[Geocoding] Empty query, skipping");
      return null;
    }

    // Retry loop with exponential backoff
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // Rate limiting
        await this.waitForRateLimit();

        console.log(`[Geocoding] Searching: "${query}" (attempt ${attempt})`);

        const response = await axios.get(this.NOMINATIM_URL, {
          params: {
            q: query,
            format: "json",
            limit: 1,
            addressdetails: 1,
          },
          headers: {
            "User-Agent": this.USER_AGENT,
          },
          timeout: 10000,
        });

        if (response.data && response.data.length > 0) {
          const result = response.data[0];
          const geocodingResult: GeocodingResult = {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            displayName: result.display_name,
            confidence: parseFloat(result.importance) || 0.5,
          };

          // Cache the result
          this.cache.set(cacheKey, {
            result: geocodingResult,
            timestamp: Date.now(),
          });

          console.log(`[Geocoding] Found: ${geocodingResult.displayName} (${geocodingResult.lat}, ${geocodingResult.lng})`);
          return geocodingResult;
        }

        // No results found - cache null to avoid repeated lookups
        this.cache.set(cacheKey, {
          result: null,
          timestamp: Date.now(),
        });
        console.log(`[Geocoding] No results for: "${query}"`);
        return null;

      } catch (error: any) {
        const isLastAttempt = attempt === this.MAX_RETRIES;
        
        if (error.response?.status === 429) {
          // Rate limited - wait longer
          console.log(`[Geocoding] Rate limited, waiting 5 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else if (isLastAttempt) {
          console.error(`[Geocoding] Failed after ${this.MAX_RETRIES} attempts:`, error.message);
          return null;
        } else {
          // Exponential backoff
          const backoffTime = Math.pow(2, attempt) * 1000;
          console.log(`[Geocoding] Error, retrying in ${backoffTime}ms:`, error.message);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
    }

    return null;
  }

  /**
   * Geocode city and country to coordinates
   * Simplified version for city-level geocoding
   */
  async geocodeCity(city: string, country?: string): Promise<GeocodingResult | null> {
    return this.geocodeAddress(null, city, country || null);
  }

  /**
   * Geocode a venue name with city context
   */
  async geocodeVenue(
    venueName: string,
    city: string,
    country?: string
  ): Promise<GeocodingResult | null> {
    // Try venue + city first
    let result = await this.geocodeAddress(venueName, city, country || null);
    
    // If no result, try just city
    if (!result && city) {
      console.log(`[Geocoding] Falling back to city-only for venue: ${venueName}`);
      result = await this.geocodeAddress(null, city, country || null);
    }
    
    return result;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hits: number; validEntries: number } {
    let validEntries = 0;
    const values = Array.from(this.cache.values());
    for (const entry of values) {
      if (this.isCacheValid(entry)) {
        validEntries++;
      }
    }
    return {
      size: this.cache.size,
      hits: validEntries,
      validEntries,
    };
  }

  /**
   * Clear expired cache entries
   */
  cleanCache(): number {
    let removed = 0;
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (!this.isCacheValid(entry)) {
        this.cache.delete(key);
        removed++;
      }
    }
    console.log(`[Geocoding] Cleaned ${removed} expired cache entries`);
    return removed;
  }

  /**
   * Clear all cache entries
   */
  clearCache(): void {
    this.cache.clear();
    console.log("[Geocoding] Cache cleared");
  }
}

export const geocodingService = new GeocodingService();
