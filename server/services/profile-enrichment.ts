/**
 * PROFILE ENRICHMENT SERVICE
 * Extracts and enriches profile data from LinkedIn and GitHub URLs
 * 
 * Capabilities:
 * - GitHub: Full public profile data via API (no auth needed for public profiles)
 * - LinkedIn: URL validation and pattern extraction only (scraping blocked by LinkedIn)
 * 
 * Created: December 2024
 * Integration: Uses Replit GitHub connection for authenticated requests
 */

import { Octokit } from '@octokit/rest';

export interface GitHubProfileData {
  username: string;
  profileUrl: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  email: string | null;
  blog: string | null;
  avatarUrl: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
  languages: string[];
  topRepositories: GitHubRepo[];
  contributionStats: {
    totalPublicRepos: number;
    totalStars: number;
    totalForks: number;
    primaryLanguage: string | null;
  };
  fetchedAt: string;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  isForked: boolean;
  updatedAt: string;
}

export interface LinkedInProfileData {
  profileUrl: string;
  username: string | null;
  extractedName: string | null;
  isValidUrl: boolean;
  urlType: 'vanity' | 'public' | 'unknown';
  note: string;
  fetchedAt: string;
}

export interface ProfileEnrichmentResult {
  github: GitHubProfileData | null;
  linkedin: LinkedInProfileData | null;
  errors: string[];
}

export class ProfileEnrichmentService {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit();
  }

  /**
   * Enrich profile from multiple URLs
   */
  async enrichFromUrls(urls: string[]): Promise<ProfileEnrichmentResult> {
    const result: ProfileEnrichmentResult = {
      github: null,
      linkedin: null,
      errors: [],
    };

    for (const url of urls) {
      try {
        if (this.isGitHubUrl(url)) {
          const username = this.extractGitHubUsername(url);
          if (username) {
            result.github = await this.fetchGitHubProfile(username);
          }
        } else if (this.isLinkedInUrl(url)) {
          result.linkedin = this.processLinkedInUrl(url);
        }
      } catch (error: any) {
        result.errors.push(`Error processing ${url}: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Check if URL is a GitHub URL
   */
  private isGitHubUrl(url: string): boolean {
    return url.toLowerCase().includes('github.com');
  }

  /**
   * Check if URL is a LinkedIn URL
   */
  private isLinkedInUrl(url: string): boolean {
    return url.toLowerCase().includes('linkedin.com');
  }

  /**
   * Extract GitHub username from URL
   * Handles formats like:
   * - https://github.com/username
   * - https://github.com/username/repo
   * - https://www.github.com/username
   */
  extractGitHubUsername(url: string): string | null {
    try {
      const cleanUrl = url.trim();
      const patterns = [
        /github\.com\/([a-zA-Z0-9_-]+)(?:\/|$)/i,
        /github\.com\/([a-zA-Z0-9_-]+)$/i,
      ];

      for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match && match[1]) {
          const username = match[1];
          if (!['orgs', 'about', 'pricing', 'enterprise', 'features', 'security', 'team', 'explore'].includes(username.toLowerCase())) {
            return username;
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Fetch GitHub profile data using public API (no auth needed)
   */
  async fetchGitHubProfile(username: string): Promise<GitHubProfileData> {
    console.log(`[ProfileEnrichment] Fetching GitHub profile for: ${username}`);

    const { data: user } = await this.octokit.users.getByUsername({ username });

    const { data: repos } = await this.octokit.repos.listForUser({
      username,
      sort: 'updated',
      per_page: 100,
      type: 'owner',
    });

    const languages = new Set<string>();
    let totalStars = 0;
    let totalForks = 0;
    const languageCount: Record<string, number> = {};

    const topRepos: GitHubRepo[] = repos
      .filter(repo => !repo.fork)
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 10)
      .map(repo => {
        if (repo.language) {
          languages.add(repo.language);
          languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
        }
        totalStars += repo.stargazers_count || 0;
        totalForks += repo.forks_count || 0;

        return {
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count || 0,
          forks: repo.forks_count || 0,
          url: repo.html_url,
          isForked: repo.fork,
          updatedAt: repo.updated_at || '',
        };
      });

    const primaryLanguage = Object.entries(languageCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      username,
      profileUrl: user.html_url,
      name: user.name,
      bio: user.bio,
      company: user.company,
      location: user.location,
      email: user.email,
      blog: user.blog,
      avatarUrl: user.avatar_url,
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
      createdAt: user.created_at,
      languages: Array.from(languages),
      topRepositories: topRepos,
      contributionStats: {
        totalPublicRepos: repos.filter(r => !r.fork).length,
        totalStars,
        totalForks,
        primaryLanguage,
      },
      fetchedAt: new Date().toISOString(),
    };
  }

  /**
   * Process LinkedIn URL - validation and pattern extraction only
   * NOTE: LinkedIn blocks scraping, so we only validate and extract what we can from the URL
   */
  processLinkedInUrl(url: string): LinkedInProfileData {
    const cleanUrl = url.trim();
    
    const vanityPattern = /linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i;
    const publicPattern = /linkedin\.com\/pub\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)/i;

    let username: string | null = null;
    let extractedName: string | null = null;
    let urlType: 'vanity' | 'public' | 'unknown' = 'unknown';
    let isValidUrl = false;

    const vanityMatch = cleanUrl.match(vanityPattern);
    if (vanityMatch && vanityMatch[1]) {
      username = vanityMatch[1];
      urlType = 'vanity';
      isValidUrl = true;

      extractedName = username
        .replace(/-\d+$/, '')
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    const publicMatch = cleanUrl.match(publicPattern);
    if (publicMatch && publicMatch[1]) {
      username = publicMatch[1];
      urlType = 'public';
      isValidUrl = true;

      extractedName = decodeURIComponent(publicMatch[1])
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    if (!isValidUrl && cleanUrl.includes('linkedin.com')) {
      isValidUrl = true;
    }

    return {
      profileUrl: cleanUrl,
      username,
      extractedName,
      isValidUrl,
      urlType,
      note: 'LinkedIn profile data cannot be fetched automatically due to LinkedIn\'s terms of service. Only URL validation and pattern extraction is available.',
      fetchedAt: new Date().toISOString(),
    };
  }

  /**
   * Enrich volunteer profile with external data
   */
  async enrichVolunteerProfile(volunteerId: number, urls: string[]): Promise<{
    enrichment: ProfileEnrichmentResult;
    profileJson: Record<string, any>;
  }> {
    const enrichment = await this.enrichFromUrls(urls);

    const profileJson: Record<string, any> = {
      externalProfiles: {
        github: enrichment.github,
        linkedin: enrichment.linkedin,
      },
      enrichedAt: new Date().toISOString(),
      enrichmentErrors: enrichment.errors,
    };

    if (enrichment.github) {
      profileJson.skills = profileJson.skills || [];
      profileJson.skills.push(...enrichment.github.languages);
      profileJson.skills = [...new Set(profileJson.skills)];
    }

    return { enrichment, profileJson };
  }

  /**
   * Quick validation check for profile URLs
   */
  validateProfileUrls(urls: string[]): {
    valid: string[];
    invalid: string[];
    github: string[];
    linkedin: string[];
  } {
    const result = {
      valid: [] as string[],
      invalid: [] as string[],
      github: [] as string[],
      linkedin: [] as string[],
    };

    for (const url of urls) {
      if (this.isGitHubUrl(url)) {
        const username = this.extractGitHubUsername(url);
        if (username) {
          result.valid.push(url);
          result.github.push(url);
        } else {
          result.invalid.push(url);
        }
      } else if (this.isLinkedInUrl(url)) {
        const linkedIn = this.processLinkedInUrl(url);
        if (linkedIn.isValidUrl) {
          result.valid.push(url);
          result.linkedin.push(url);
        } else {
          result.invalid.push(url);
        }
      } else if (
        url.includes('behance.net') ||
        url.includes('dribbble.com') ||
        url.includes('portfolio')
      ) {
        result.valid.push(url);
      } else {
        result.invalid.push(url);
      }
    }

    return result;
  }
}

export const profileEnrichmentService = new ProfileEnrichmentService();
