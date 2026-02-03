/**
 * VENUE SCRAPER
 * Specialized scraper for tango retreat centers and venue operators
 * 
 * Purpose:
 * - Extract venue information (not just events)
 * - Create venue owner profiles with "Venue Owner" tango role
 * - Add venues to Pro Discovery marketplace
 * 
 * Target sites: domaineharmonie.fr and similar tango retreat centers
 * 
 * MB.MD v9.9.3: Multi-language support for 6 languages
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '@shared/db';
import { users, venues } from '@shared/schema';
import { eq, ilike, or } from 'drizzle-orm';
import { languageAwareFieldMapper, SupportedLanguage } from '../../services/LanguageAwareFieldMapper';

interface VenueData {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  website: string;
  email?: string;
  phone?: string;
  ownerNames: string[];
  amenities: string[];
  capacity?: number;
  imageUrls: string[];
  venueType: 'retreat_center' | 'dance_studio' | 'cultural_center' | 'hotel' | 'other';
}

interface VenueOwnerResult {
  userId: number;
  username: string;
  name: string;
  isNew: boolean;
}

export class VenueScraper {
  private readonly tangoVenueKeywords = [
    'tango', 'milonga', 'practica', 'dance', 'retreat', 
    'workshop', 'stage', 'cours', 'clase', 'unterricht'
  ];

  /**
   * Scrape a venue/retreat center website
   */
  async scrapeVenue(url: string): Promise<VenueData | null> {
    try {
      console.log(`[VenueScraper] 🏠 Scraping venue: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MundoTangoBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en,es,fr,de,it,pt'
        }
      });

      const $ = cheerio.load(response.data);
      const html = response.data as string;
      
      const language = languageAwareFieldMapper.detectLanguage(html);
      console.log(`[VenueScraper] Detected language: ${language}`);

      const venue = this.extractVenueData($, url, language);
      
      if (!venue) {
        console.log(`[VenueScraper] Could not extract venue data from ${url}`);
        return null;
      }

      console.log(`[VenueScraper] ✅ Extracted venue: ${venue.name}`);
      return venue;
    } catch (error) {
      console.error(`[VenueScraper] Error scraping ${url}:`, error);
      return null;
    }
  }

  /**
   * Extract venue data from HTML
   */
  private extractVenueData($: cheerio.CheerioAPI, url: string, language: SupportedLanguage): VenueData | null {
    const domain = new URL(url).hostname.replace('www.', '');
    
    const name = this.extractVenueName($, domain);
    if (!name) return null;

    const description = this.extractDescription($, language);
    const location = this.extractLocation($, language);
    const contact = this.extractContact($);
    const ownerNames = this.extractOwnerNames($, language);
    const amenities = this.extractAmenities($, language);
    const imageUrls = this.extractImages($, url);

    return {
      name,
      description,
      address: location.address,
      city: location.city,
      country: location.country,
      website: url,
      email: contact.email,
      phone: contact.phone,
      ownerNames,
      amenities,
      capacity: undefined,
      imageUrls,
      venueType: this.determineVenueType($, description)
    };
  }

  /**
   * Extract venue name from page
   */
  private extractVenueName($: cheerio.CheerioAPI, domain: string): string | null {
    const selectors = [
      'h1.site-title', '.site-title', '.logo-text', 
      'header h1', '.brand-name', 'h1:first',
      'title', 'meta[property="og:site_name"]'
    ];

    for (const selector of selectors) {
      const text = $(selector).first().text().trim() || 
                   $(selector).attr('content')?.trim();
      if (text && text.length > 2 && text.length < 100) {
        return text.split('|')[0].split('-')[0].trim();
      }
    }

    return domain.replace(/\.(com|fr|de|it|es|net|org)$/, '')
      .split('.')
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');
  }

  /**
   * Extract description
   */
  private extractDescription($: cheerio.CheerioAPI, language: SupportedLanguage): string {
    const selectors = [
      'meta[name="description"]',
      'meta[property="og:description"]',
      '.about-text', '.description', '.intro-text',
      'main p:first', 'article p:first'
    ];

    for (const selector of selectors) {
      const content = $(selector).attr('content') || $(selector).text();
      if (content && content.trim().length > 50) {
        return content.trim().slice(0, 500);
      }
    }

    return '';
  }

  /**
   * Extract location information
   */
  private extractLocation($: cheerio.CheerioAPI, language: SupportedLanguage): { address: string; city: string; country: string } {
    const addressPatterns: Record<SupportedLanguage, RegExp[]> = {
      fr: [/(\d+[^,]+,\s*\d{5}\s+[^,]+,?\s*France)/i],
      de: [/(\d+[^,]+,\s*\d{5}\s+[^,]+,?\s*Deutschland)/i],
      es: [/(\d+[^,]+,\s*\d{5}\s+[^,]+,?\s*España)/i],
      it: [/(\d+[^,]+,\s*\d{5}\s+[^,]+,?\s*Italia)/i],
      pt: [/(\d+[^,]+,\s*\d{5}(?:-\d{3})?\s+[^,]+,?\s*Portugal)/i],
      en: [/(\d+[^,]+,\s*[A-Z]{1,2}\d+[^,]*,?\s*(?:UK|USA|Canada|Australia))/i]
    };

    const html = $.html().toLowerCase();
    
    const countryMap: Record<string, string> = {
      'france': 'France', 'francia': 'France', 'frankreich': 'France',
      'germany': 'Germany', 'alemania': 'Germany', 'deutschland': 'Germany', 'allemagne': 'Germany',
      'spain': 'Spain', 'españa': 'Spain', 'espagne': 'Spain', 'spanien': 'Spain',
      'italy': 'Italy', 'italia': 'Italy', 'italie': 'Italy', 'italien': 'Italy',
      'portugal': 'Portugal',
      'argentina': 'Argentina',
      'netherlands': 'Netherlands', 'pays-bas': 'Netherlands', 'niederlande': 'Netherlands',
      'belgium': 'Belgium', 'belgique': 'Belgium', 'belgien': 'Belgium'
    };

    let country = 'Unknown';
    for (const [key, value] of Object.entries(countryMap)) {
      if (html.includes(key)) {
        country = value;
        break;
      }
    }

    const addressSelectors = [
      '.address', '.location', '[itemprop="address"]',
      '.contact-address', '.venue-address', 'address'
    ];

    let address = '';
    let city = '';

    for (const selector of addressSelectors) {
      const text = $(selector).text().trim();
      if (text && text.length > 10) {
        address = text.replace(/\s+/g, ' ').slice(0, 200);
        const cityMatch = text.match(/\d{5}\s+([A-Za-zÀ-ÿ\s-]+)/);
        if (cityMatch) {
          city = cityMatch[1].trim();
        }
        break;
      }
    }

    return { address, city, country };
  }

  /**
   * Extract contact information
   */
  private extractContact($: cheerio.CheerioAPI): { email?: string; phone?: string } {
    const emailMatch = $.html().match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = $.html().match(/(?:\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/);

    return {
      email: emailMatch?.[0],
      phone: phoneMatch?.[0]?.replace(/[^\d+\-\s()]/g, '')
    };
  }

  /**
   * Extract owner/operator names using multi-language detection
   * Supports: y (ES), e (PT/IT), et (FR), und (DE), and (EN), &
   */
  private extractOwnerNames($: cheerio.CheerioAPI, language: SupportedLanguage): string[] {
    const names: string[] = [];
    
    const ownerKeywords: Record<SupportedLanguage, string[]> = {
      fr: ['propriétaire', 'gérant', 'directeur', 'fondateur', 'contact', 'par'],
      de: ['inhaber', 'leiter', 'gründer', 'kontakt', 'von'],
      es: ['propietario', 'gerente', 'director', 'fundador', 'contacto', 'por'],
      it: ['proprietario', 'gestore', 'direttore', 'fondatore', 'contatto', 'da'],
      pt: ['proprietário', 'gerente', 'diretor', 'fundador', 'contato', 'por'],
      en: ['owner', 'manager', 'director', 'founder', 'contact', 'by', 'operated by']
    };

    const keywords = ownerKeywords[language] || ownerKeywords.en;
    const html = $.html();

    for (const keyword of keywords) {
      const pattern = new RegExp(
        `${keyword}[:\\s]+([A-ZÀ-ÿ][\\w'\\-\\.]+(?:\\s+(?:y|e|et|und|and|&|,)\\s+[A-ZÀ-ÿ][\\w'\\-\\.]+|\\s+[A-ZÀ-ÿ][\\w'\\-\\.]+)*)`,
        'gi'
      );
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const nameGroup = match[1];
        const splitNames = nameGroup.split(/\s*(?:,|\by\b|\be\b|\bet\b|\bund\b|\band\b|&)\s*/i);
        for (const name of splitNames) {
          const trimmed = name.trim();
          if (trimmed.length > 2 && trimmed.length < 50 && !names.includes(trimmed)) {
            names.push(trimmed);
          }
        }
      }
    }

    return names;
  }

  /**
   * Extract amenities
   */
  private extractAmenities($: cheerio.CheerioAPI, language: SupportedLanguage): string[] {
    const amenities: string[] = [];
    
    const amenityKeywords: Record<string, string[]> = {
      accommodation: ['chambre', 'zimmer', 'habitación', 'camera', 'room', 'accommodation', 'hébergement'],
      pool: ['piscine', 'pool', 'schwimmbad', 'piscina'],
      garden: ['jardin', 'garten', 'jardín', 'giardino', 'garden'],
      parking: ['parking', 'parkplatz', 'aparcamiento', 'parcheggio'],
      wifi: ['wifi', 'internet', 'wi-fi'],
      meals: ['repas', 'mahlzeiten', 'comidas', 'pasti', 'meals', 'cuisine', 'kitchen'],
      dance_floor: ['salle de danse', 'tanzsaal', 'sala de baile', 'sala da ballo', 'dance floor', 'piste']
    };

    const html = $.html().toLowerCase();

    for (const [amenity, keywords] of Object.entries(amenityKeywords)) {
      if (keywords.some(k => html.includes(k))) {
        amenities.push(amenity);
      }
    }

    return amenities;
  }

  /**
   * Extract images
   */
  private extractImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const images: string[] = [];
    const baseUrlObj = new URL(baseUrl);

    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !src.includes('logo') && !src.includes('icon')) {
        try {
          const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrlObj.origin).href;
          if (!images.includes(fullUrl)) {
            images.push(fullUrl);
          }
        } catch {}
      }
    });

    return images.slice(0, 10);
  }

  /**
   * Determine venue type
   */
  private determineVenueType($: cheerio.CheerioAPI, description: string): VenueData['venueType'] {
    const text = ($.html() + description).toLowerCase();
    
    if (text.includes('retreat') || text.includes('retraite') || text.includes('retiro')) {
      return 'retreat_center';
    }
    if (text.includes('studio') || text.includes('école') || text.includes('escuela') || text.includes('schule')) {
      return 'dance_studio';
    }
    if (text.includes('hotel') || text.includes('hôtel')) {
      return 'hotel';
    }
    if (text.includes('cultural') || text.includes('culturel') || text.includes('kulturell')) {
      return 'cultural_center';
    }
    return 'other';
  }

  /**
   * Create or find venue owner user with "Venue Owner" tango role
   */
  async createVenueOwner(name: string, venueName: string, city?: string, country?: string): Promise<VenueOwnerResult | null> {
    try {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(or(
          ilike(users.name, name),
          ilike(users.username, this.generateUsername(name))
        ))
        .limit(1);

      if (existingUser) {
        console.log(`[VenueScraper] Found existing user: ${existingUser.username}`);
        
        const currentRoles = existingUser.tangoRoles || [];
        if (!currentRoles.includes('venue_owner')) {
          await db.update(users)
            .set({ tangoRoles: [...currentRoles, 'venue_owner'] })
            .where(eq(users.id, existingUser.id));
          console.log(`[VenueScraper] Added venue_owner role to ${existingUser.username}`);
        }

        return {
          userId: existingUser.id,
          username: existingUser.username,
          name: existingUser.name || name,
          isNew: false
        };
      }

      const username = await this.generateUniqueUsername(name);
      
      const [newUser] = await db.insert(users).values({
        username,
        email: `${username}@venue.mundotango.app`,
        name,
        password: 'scraped_venue_owner',
        role: 'user',
        isVerified: false,
        tangoRoles: ['venue_owner'],
        isPro: true,
        bio: `Venue owner at ${venueName}`,
        city: city || undefined,
        country: country || undefined
      }).returning();

      console.log(`[VenueScraper] Created venue owner: ${username} for ${venueName}`);

      return {
        userId: newUser.id,
        username: newUser.username,
        name: newUser.name || name,
        isNew: true
      };
    } catch (error) {
      console.error(`[VenueScraper] Error creating venue owner ${name}:`, error);
      return null;
    }
  }

  /**
   * Generate username from name
   */
  private generateUsername(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .slice(0, 25);
  }

  /**
   * Generate unique username
   */
  private async generateUniqueUsername(name: string): Promise<string> {
    const base = this.generateUsername(name);
    if (!base) return `venue_owner_${Date.now()}`;

    const [existing] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.username, base))
      .limit(1);

    if (!existing) return base;

    for (let i = 2; i <= 100; i++) {
      const candidate = `${base}_${i}`;
      const [found] = await db
        .select({ username: users.username })
        .from(users)
        .where(eq(users.username, candidate))
        .limit(1);
      if (!found) return candidate;
    }

    return `${base}_${Date.now()}`;
  }

  /**
   * Full scrape and ingest pipeline for a venue
   */
  async scrapeAndIngestVenue(url: string): Promise<{
    venue: VenueData | null;
    owners: VenueOwnerResult[];
    success: boolean;
  }> {
    const venue = await this.scrapeVenue(url);
    if (!venue) {
      return { venue: null, owners: [], success: false };
    }

    const owners: VenueOwnerResult[] = [];
    for (const ownerName of venue.ownerNames) {
      const owner = await this.createVenueOwner(
        ownerName, 
        venue.name, 
        venue.city, 
        venue.country
      );
      if (owner) {
        owners.push(owner);
      }
    }

    console.log(`[VenueScraper] ✅ Processed venue: ${venue.name} with ${owners.length} owners`);

    return { venue, owners, success: true };
  }
}

export const venueScraper = new VenueScraper();
