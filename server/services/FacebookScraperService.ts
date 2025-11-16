/**
 * FACEBOOK SCRAPER SERVICE - SYSTEM 0 DATA PIPELINE
 * Playwright-based automation for Facebook data extraction
 * 
 * Features:
 * - Login to multiple Facebook accounts
 * - Extract: profile, posts, friends, events, groups
 * - Save JSON data + media files
 * - Rate limiting (max 100 requests/hour)
 * - Cookie persistence for session management
 * - 2FA support with manual code entry
 * - Error handling for login failures, CAPTCHA, account bans
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';
import axios from 'axios';

// ===========================
// TYPE DEFINITIONS
// ===========================

interface ProfileData {
  accountName: string;
  name: string;
  bio: string;
  location: string;
  photos: string[];
  profilePictureUrl?: string;
  coverPhotoUrl?: string;
  scrapedAt: string;
}

interface PostData {
  id: string;
  text: string;
  mediaUrls: string[];
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  postUrl: string;
}

interface FriendData {
  name: string;
  profileUrl: string;
  mutualFriends?: number;
  relationshipType?: string;
}

interface EventData {
  title: string;
  date: string;
  location: string;
  eventUrl: string;
  status: 'attending' | 'interested' | 'going';
  description?: string;
}

interface GroupData {
  name: string;
  groupUrl: string;
  memberCount?: number;
  role?: string;
}

interface ScraperConfig {
  username: string;
  password: string;
  accountName: string;
  headless?: boolean;
  slowMo?: number;
}

interface RateLimitTracker {
  requests: number[];
  maxRequestsPerHour: number;
}

// ===========================
// FACEBOOK SCRAPER SERVICE
// ===========================

export class FacebookScraperService {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private rateLimiter: RateLimitTracker = {
    requests: [],
    maxRequestsPerHour: 100
  };
  
  // Storage paths
  private readonly baseStoragePath = path.join(process.cwd(), 'attached_assets', 'facebook_import');
  private readonly cookiesPath = path.join(process.cwd(), 'attached_assets', 'facebook_cookies');

  constructor() {
    console.log('[Facebook Scraper] Service initialized');
  }

  // ===========================
  // RATE LIMITING
  // ===========================

  /**
   * Check if we can make another request (max 100/hour)
   */
  private async checkRateLimit(): Promise<boolean> {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Remove old requests (older than 1 hour)
    this.rateLimiter.requests = this.rateLimiter.requests.filter(
      timestamp => timestamp > oneHourAgo
    );

    // Check if we're under the limit
    if (this.rateLimiter.requests.length >= this.rateLimiter.maxRequestsPerHour) {
      const oldestRequest = Math.min(...this.rateLimiter.requests);
      const waitTime = oldestRequest + 60 * 60 * 1000 - now;
      console.warn(`[Facebook Scraper] Rate limit reached. Wait ${Math.ceil(waitTime / 1000 / 60)} minutes`);
      return false;
    }

    return true;
  }

  /**
   * Track a new request for rate limiting
   */
  private trackRequest(): void {
    this.rateLimiter.requests.push(Date.now());
  }

  /**
   * Add random delay to avoid detection (1-3 seconds)
   */
  private async randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // ===========================
  // BROWSER & SESSION MANAGEMENT
  // ===========================

  /**
   * Initialize browser with proper settings
   */
  private async initBrowser(headless: boolean = false): Promise<void> {
    console.log('[Facebook Scraper] Launching browser...');
    
    this.browser = await chromium.launch({
      headless: headless, // Set to false to avoid bot detection
      slowMo: 50, // Slow down actions to appear more human
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox'
      ]
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    // Inject scripts to avoid detection
    await this.context.addInitScript(() => {
      // Override navigator.webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    console.log('[Facebook Scraper] Browser launched successfully');
  }

  /**
   * Save cookies for session persistence
   */
  private async saveCookies(accountName: string): Promise<void> {
    if (!this.context) return;

    try {
      const cookies = await this.context.cookies();
      const cookieFile = path.join(this.cookiesPath, `${accountName}_cookies.json`);
      
      await fs.mkdir(this.cookiesPath, { recursive: true });
      await fs.writeFile(cookieFile, JSON.stringify(cookies, null, 2));
      
      console.log(`[Facebook Scraper] Cookies saved for ${accountName}`);
    } catch (error: any) {
      console.error('[Facebook Scraper] Error saving cookies:', error.message);
    }
  }

  /**
   * Load cookies from previous session
   */
  private async loadCookies(accountName: string): Promise<boolean> {
    if (!this.context) return false;

    try {
      const cookieFile = path.join(this.cookiesPath, `${accountName}_cookies.json`);
      const cookieData = await fs.readFile(cookieFile, 'utf-8');
      const cookies = JSON.parse(cookieData);
      
      await this.context.addCookies(cookies);
      console.log(`[Facebook Scraper] Cookies loaded for ${accountName}`);
      return true;
    } catch (error: any) {
      console.log(`[Facebook Scraper] No saved cookies for ${accountName}`);
      return false;
    }
  }

  // ===========================
  // AUTHENTICATION
  // ===========================

  /**
   * Login to Facebook
   * Handles 2FA if prompted (waits for manual code entry)
   */
  async loginToFacebook(username: string, password: string, accountName: string): Promise<Page> {
    console.log(`[Facebook Scraper] Logging in as ${accountName}...`);

    if (!this.browser || !this.context) {
      await this.initBrowser(false); // headless=false for 2FA
    }

    const page = await this.context!.newPage();

    try {
      // Try loading saved cookies first
      const cookiesLoaded = await this.loadCookies(accountName);
      
      await page.goto('https://www.facebook.com', { waitUntil: 'domcontentloaded' });
      await this.randomDelay(2000, 4000);

      // Check if already logged in
      const isLoggedIn = await page.evaluate(() => {
        return document.cookie.includes('c_user=');
      });

      if (isLoggedIn && cookiesLoaded) {
        console.log(`[Facebook Scraper] Already logged in as ${accountName}`);
        return page;
      }

      // Perform login
      console.log('[Facebook Scraper] Entering credentials...');
      
      await page.fill('input[name="email"]', username);
      await this.randomDelay(500, 1000);
      
      await page.fill('input[name="pass"]', password);
      await this.randomDelay(500, 1000);
      
      await page.click('button[name="login"]');
      await this.randomDelay(3000, 5000);

      // Check for 2FA
      const needs2FA = await page.evaluate(() => {
        return document.body.textContent?.includes('Two-factor authentication') ||
               document.body.textContent?.includes('Enter the 6-digit code') ||
               document.querySelector('input[name="approvals_code"]') !== null;
      });

      if (needs2FA) {
        console.log('⚠️  [Facebook Scraper] 2FA REQUIRED - Please enter code manually in browser');
        console.log('⏳ Waiting 60 seconds for manual 2FA code entry...');
        
        // Wait for navigation after 2FA (up to 60 seconds)
        await page.waitForNavigation({ timeout: 60000 }).catch(() => {
          console.warn('[Facebook Scraper] 2FA timeout - may need more time');
        });
      }

      // Check for CAPTCHA
      const hasCaptcha = await page.evaluate(() => {
        return document.body.textContent?.includes('Security Check') ||
               document.querySelector('iframe[title*="recaptcha"]') !== null;
      });

      if (hasCaptcha) {
        console.error('🚨 [Facebook Scraper] CAPTCHA detected - manual intervention required');
        console.log('⏳ Waiting 60 seconds for manual CAPTCHA solving...');
        await new Promise(resolve => setTimeout(resolve, 60000));
      }

      // Verify login success
      await page.waitForSelector('[aria-label="Home"]', { timeout: 10000 }).catch(() => {
        throw new Error('Login failed - could not find home feed');
      });

      console.log(`✅ [Facebook Scraper] Successfully logged in as ${accountName}`);

      // Save cookies for future sessions
      await this.saveCookies(accountName);
      
      this.trackRequest();
      return page;

    } catch (error: any) {
      console.error(`❌ [Facebook Scraper] Login failed for ${accountName}:`, error.message);
      throw error;
    }
  }

  // ===========================
  // DATA EXTRACTION
  // ===========================

  /**
   * Scrape profile data
   */
  async scrapeProfile(page: Page, accountName: string): Promise<ProfileData> {
    console.log(`[Facebook Scraper] Scraping profile for ${accountName}...`);

    try {
      // Navigate to own profile
      await page.goto('https://www.facebook.com/me', { waitUntil: 'domcontentloaded' });
      await this.randomDelay(2000, 4000);
      this.trackRequest();

      const profileData: ProfileData = {
        accountName,
        name: '',
        bio: '',
        location: '',
        photos: [],
        scrapedAt: new Date().toISOString()
      };

      // Extract profile name
      profileData.name = await page.evaluate(() => {
        const nameElement = document.querySelector('h1');
        return nameElement?.textContent?.trim() || '';
      });

      // Extract bio/intro
      profileData.bio = await page.evaluate(() => {
        const bioElement = document.querySelector('[data-pagelet*="ProfileTimeline"] span');
        return bioElement?.textContent?.trim() || '';
      });

      // Extract profile picture
      profileData.profilePictureUrl = await page.evaluate(() => {
        const img = document.querySelector('image[href*="profile"]') || 
                    document.querySelector('img[data-imgperflogname="profileCoverPhoto"]');
        return img?.getAttribute('src') || img?.getAttribute('href') || '';
      });

      // Extract location (from "Intro" section)
      profileData.location = await page.evaluate(() => {
        const locationElement = Array.from(document.querySelectorAll('span')).find(
          el => el.textContent?.includes('Lives in') || el.textContent?.includes('From')
        );
        return locationElement?.textContent?.replace(/^(Lives in|From)\s+/, '').trim() || '';
      });

      console.log(`✅ [Facebook Scraper] Profile scraped: ${profileData.name}`);
      return profileData;

    } catch (error: any) {
      console.error('[Facebook Scraper] Error scraping profile:', error.message);
      throw error;
    }
  }

  /**
   * Scrape posts from timeline
   */
  async scrapePosts(page: Page, accountName: string, limit: number = 20): Promise<PostData[]> {
    console.log(`[Facebook Scraper] Scraping posts for ${accountName}...`);

    try {
      // Navigate to own profile
      await page.goto('https://www.facebook.com/me', { waitUntil: 'domcontentloaded' });
      await this.randomDelay(2000, 4000);
      this.trackRequest();

      const posts: PostData[] = [];

      // Scroll to load more posts
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await this.randomDelay(2000, 3000);
      }

      // Extract posts
      const postElements = await page.$$('[data-pagelet*="FeedUnit"], [role="article"]');

      for (let i = 0; i < Math.min(postElements.length, limit); i++) {
        const post = postElements[i];

        try {
          const postData = await post.evaluate((el) => {
            const text = el.querySelector('[data-ad-preview="message"]')?.textContent?.trim() || '';
            const timestamp = el.querySelector('abbr')?.getAttribute('data-utime') || '';
            const postUrl = el.querySelector('a[href*="/posts/"]')?.getAttribute('href') || '';

            return {
              id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              text,
              mediaUrls: [],
              likes: 0,
              comments: 0,
              shares: 0,
              timestamp: timestamp ? new Date(parseInt(timestamp) * 1000).toISOString() : new Date().toISOString(),
              postUrl: postUrl.startsWith('http') ? postUrl : `https://www.facebook.com${postUrl}`
            };
          });

          posts.push(postData);
          
          if (!await this.checkRateLimit()) break;
          this.trackRequest();

        } catch (error: any) {
          console.warn(`[Facebook Scraper] Error parsing post ${i}:`, error.message);
        }
      }

      console.log(`✅ [Facebook Scraper] Scraped ${posts.length} posts`);
      return posts;

    } catch (error: any) {
      console.error('[Facebook Scraper] Error scraping posts:', error.message);
      return [];
    }
  }

  /**
   * Scrape friends list
   */
  async scrapeFriends(page: Page, accountName: string, limit: number = 50): Promise<FriendData[]> {
    console.log(`[Facebook Scraper] Scraping friends for ${accountName}...`);

    try {
      // Navigate to friends page
      await page.goto('https://www.facebook.com/me/friends', { waitUntil: 'domcontentloaded' });
      await this.randomDelay(2000, 4000);
      this.trackRequest();

      const friends: FriendData[] = [];

      // Scroll to load more friends
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await this.randomDelay(2000, 3000);
      }

      // Extract friend data
      const friendElements = await page.$$('[data-pagelet*="ProfileAppSection"] a[href*="/profile/"]');

      for (let i = 0; i < Math.min(friendElements.length, limit); i++) {
        const friendEl = friendElements[i];

        try {
          const friendData = await friendEl.evaluate((el) => {
            const name = el.textContent?.trim() || '';
            const profileUrl = el.getAttribute('href') || '';
            
            return {
              name,
              profileUrl: profileUrl.startsWith('http') ? profileUrl : `https://www.facebook.com${profileUrl}`
            };
          });

          if (friendData.name) {
            friends.push(friendData);
          }

          if (!await this.checkRateLimit()) break;
          this.trackRequest();

        } catch (error: any) {
          console.warn(`[Facebook Scraper] Error parsing friend ${i}:`, error.message);
        }
      }

      console.log(`✅ [Facebook Scraper] Scraped ${friends.length} friends`);
      return friends;

    } catch (error: any) {
      console.error('[Facebook Scraper] Error scraping friends:', error.message);
      return [];
    }
  }

  /**
   * Scrape events (attending/interested)
   */
  async scrapeEvents(page: Page, accountName: string): Promise<EventData[]> {
    console.log(`[Facebook Scraper] Scraping events for ${accountName}...`);

    try {
      // Navigate to events page
      await page.goto('https://www.facebook.com/events', { waitUntil: 'domcontentloaded' });
      await this.randomDelay(2000, 4000);
      this.trackRequest();

      const events: EventData[] = [];

      // Scroll to load events
      for (let i = 0; i < 2; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await this.randomDelay(2000, 3000);
      }

      // Extract event data
      const eventElements = await page.$$('[role="article"], [data-pagelet*="Event"]');

      for (let i = 0; i < eventElements.length; i++) {
        const eventEl = eventElements[i];

        try {
          const eventData = await eventEl.evaluate((el) => {
            const title = el.querySelector('span[role="heading"]')?.textContent?.trim() || '';
            const dateText = el.querySelector('span[dir="auto"]')?.textContent?.trim() || '';
            const location = el.querySelector('div[role="button"]')?.textContent?.trim() || '';
            const eventUrl = el.querySelector('a[href*="/events/"]')?.getAttribute('href') || '';

            return {
              title,
              date: dateText,
              location,
              eventUrl: eventUrl.startsWith('http') ? eventUrl : `https://www.facebook.com${eventUrl}`,
              status: 'attending' as const
            };
          });

          if (eventData.title) {
            events.push(eventData);
          }

          if (!await this.checkRateLimit()) break;
          this.trackRequest();

        } catch (error: any) {
          console.warn(`[Facebook Scraper] Error parsing event ${i}:`, error.message);
        }
      }

      console.log(`✅ [Facebook Scraper] Scraped ${events.length} events`);
      return events;

    } catch (error: any) {
      console.error('[Facebook Scraper] Error scraping events:', error.message);
      return [];
    }
  }

  /**
   * Scrape groups membership
   */
  async scrapeGroups(page: Page, accountName: string): Promise<GroupData[]> {
    console.log(`[Facebook Scraper] Scraping groups for ${accountName}...`);

    try {
      // Navigate to groups page
      await page.goto('https://www.facebook.com/groups/feed', { waitUntil: 'domcontentloaded' });
      await this.randomDelay(2000, 4000);
      this.trackRequest();

      const groups: GroupData[] = [];

      // Scroll to load groups
      for (let i = 0; i < 2; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await this.randomDelay(2000, 3000);
      }

      // Extract group data
      const groupElements = await page.$$('a[href*="/groups/"]');

      for (let i = 0; i < groupElements.length; i++) {
        const groupEl = groupElements[i];

        try {
          const groupData = await groupEl.evaluate((el) => {
            const name = el.textContent?.trim() || '';
            const groupUrl = el.getAttribute('href') || '';
            
            return {
              name,
              groupUrl: groupUrl.startsWith('http') ? groupUrl : `https://www.facebook.com${groupUrl}`
            };
          });

          // Deduplicate and filter valid groups
          if (groupData.name && !groups.some(g => g.groupUrl === groupData.groupUrl)) {
            groups.push(groupData);
          }

          if (!await this.checkRateLimit()) break;
          this.trackRequest();

        } catch (error: any) {
          console.warn(`[Facebook Scraper] Error parsing group ${i}:`, error.message);
        }
      }

      console.log(`✅ [Facebook Scraper] Scraped ${groups.length} groups`);
      return groups;

    } catch (error: any) {
      console.error('[Facebook Scraper] Error scraping groups:', error.message);
      return [];
    }
  }

  // ===========================
  // FILE OPERATIONS
  // ===========================

  /**
   * Save data to JSON file
   */
  async saveToFile(data: any, filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.baseStoragePath, filePath);
      const dir = path.dirname(fullPath);

      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true });

      // Write JSON file
      await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8');
      
      console.log(`✅ [Facebook Scraper] Saved data to ${filePath}`);
    } catch (error: any) {
      console.error('[Facebook Scraper] Error saving file:', error.message);
      throw error;
    }
  }

  /**
   * Download media file from URL
   */
  async downloadMedia(url: string, savePath: string): Promise<void> {
    if (!url) return;

    try {
      const fullPath = path.join(this.baseStoragePath, savePath);
      const dir = path.dirname(fullPath);

      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true });

      // Download file
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      await fs.writeFile(fullPath, response.data);

      console.log(`✅ [Facebook Scraper] Downloaded media to ${savePath}`);
      
      this.trackRequest();
    } catch (error: any) {
      console.error(`[Facebook Scraper] Error downloading media from ${url}:`, error.message);
    }
  }

  // ===========================
  // MAIN SCRAPING WORKFLOW
  // ===========================

  /**
   * Run full scraping workflow for an account
   */
  async scrapeAccount(config: ScraperConfig): Promise<{
    success: boolean;
    profile?: ProfileData;
    posts?: PostData[];
    friends?: FriendData[];
    events?: EventData[];
    groups?: GroupData[];
    errors: string[];
  }> {
    const errors: string[] = [];
    let page: Page | null = null;

    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🚀 Starting Facebook scrape for ${config.accountName}`);
      console.log(`${'='.repeat(60)}\n`);

      // Initialize browser
      await this.initBrowser(config.headless || false);

      // Login
      page = await this.loginToFacebook(config.username, config.password, config.accountName);

      // Scrape all data types
      const profile = await this.scrapeProfile(page, config.accountName);
      await this.saveToFile(profile, `${config.accountName}/profile.json`);

      const posts = await this.scrapePosts(page, config.accountName);
      await this.saveToFile(posts, `${config.accountName}/posts.json`);

      const friends = await this.scrapeFriends(page, config.accountName);
      await this.saveToFile(friends, `${config.accountName}/friends.json`);

      const events = await this.scrapeEvents(page, config.accountName);
      await this.saveToFile(events, `${config.accountName}/events.json`);

      const groups = await this.scrapeGroups(page, config.accountName);
      await this.saveToFile(groups, `${config.accountName}/groups.json`);

      // Download profile picture
      if (profile.profilePictureUrl) {
        await this.downloadMedia(
          profile.profilePictureUrl,
          `${config.accountName}/media/profile_picture.jpg`
        );
      }

      console.log(`\n${'='.repeat(60)}`);
      console.log(`✅ Scraping complete for ${config.accountName}`);
      console.log(`   - Profile: ${profile.name}`);
      console.log(`   - Posts: ${posts.length}`);
      console.log(`   - Friends: ${friends.length}`);
      console.log(`   - Events: ${events.length}`);
      console.log(`   - Groups: ${groups.length}`);
      console.log(`${'='.repeat(60)}\n`);

      return {
        success: true,
        profile,
        posts,
        friends,
        events,
        groups,
        errors
      };

    } catch (error: any) {
      console.error(`❌ Error scraping ${config.accountName}:`, error.message);
      errors.push(error.message);
      
      return {
        success: false,
        errors
      };

    } finally {
      // Cleanup
      if (page) await page.close().catch(() => {});
      await this.cleanup();
    }
  }

  /**
   * Scrape both configured Facebook accounts
   */
  async scrapeAllAccounts(): Promise<void> {
    const accounts: ScraperConfig[] = [
      {
        username: process.env.facebook_sboddye_username || '',
        password: process.env.facebook_sboddye_password || '',
        accountName: 'sboddye',
        headless: false
      },
      {
        username: process.env.facebook_mundotango_username || '',
        password: process.env.facebook_mundotango_password || '',
        accountName: 'mundotango',
        headless: false
      }
    ];

    for (const account of accounts) {
      if (!account.username || !account.password) {
        console.warn(`⚠️  Skipping ${account.accountName} - missing credentials`);
        continue;
      }

      await this.scrapeAccount(account);
      
      // Wait between accounts to avoid rate limiting
      console.log('⏳ Waiting 60 seconds before next account...');
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }

  /**
   * Cleanup browser resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();
      this.context = null;
      this.browser = null;
      console.log('[Facebook Scraper] Browser closed');
    } catch (error: any) {
      console.error('[Facebook Scraper] Error during cleanup:', error.message);
    }
  }
}

// Export singleton instance
export const facebookScraper = new FacebookScraperService();
