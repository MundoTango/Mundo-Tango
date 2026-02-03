import axios from 'axios';
import * as cheerio from 'cheerio';

interface ProfileScrapingResult {
  name: string;
  bio: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    tiktok?: string;
  };
  profileImage?: string;
}

class WebsiteProfileScraper {
  private static instance: WebsiteProfileScraper;
  private constructor() {}

  public static getInstance(): WebsiteProfileScraper {
    if (!WebsiteProfileScraper.instance) {
      WebsiteProfileScraper.instance = new WebsiteProfileScraper();
    }
    return WebsiteProfileScraper.instance;
  }

  public async scrape(url: string): Promise<ProfileScrapingResult | null> {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const name = $('title').text() || $('h1').text();
      const bio = $('meta[name="description"]').attr('content') || $('about').text();
      const socialLinks = {
        instagram: $('a[href*="instagram.com"]').attr('href'),
        facebook: $('a[href*="facebook.com"]').attr('href'),
        youtube: $('a[href*="youtube.com"]').attr('href'),
        twitter: $('a[href*="twitter.com"]').attr('href'),
        linkedin: $('a[href*="linkedin.com"]').attr('href'),
        tiktok: $('a[href*="tiktok.com"]').attr('href'),
      };
      const profileImage = $('meta[property="og:image"]').attr('content') || $('img').first().attr('src');
      return { name, bio, socialLinks, profileImage };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching profile:', error.message);
      }
      return null;
    }
  }
}

export const webProfileScraper = WebsiteProfileScraper.getInstance();