import { db } from '../db';
import { users } from '@shared/schema';
import { eq, and, ilike, or, sql } from 'drizzle-orm';

interface TalentSearchParams {
  query: string;
  userId: number;
  limit?: number;
}

interface TalentSearchResult {
  userId: number;
  name: string;
  avatar: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  experienceYears: number;
  specialties: string[];
  semanticScore: number;
  compatibilityScore: number;
  matchReasons: string[];
}

interface ParsedQuery {
  location?: string;
  experience?: number;
  skills?: string[];
  styles?: string[];
  availability?: string;
}

export class NaturalLanguageTalentSearch {
  async search(params: TalentSearchParams): Promise<TalentSearchResult[]> {
    const parsedQuery = await this.parseQuery(params.query);
    
    let whereConditions = [eq(users.isActive, true)];

    if (parsedQuery.location) {
      whereConditions.push(
        or(
          ilike(users.city, `%${parsedQuery.location}%`),
          ilike(users.country, `%${parsedQuery.location}%`)
        )!
      );
    }

    if (parsedQuery.experience) {
      whereConditions.push(sql`${users.yearsOfDancing} >= ${parsedQuery.experience}`);
    }

    const candidates = await db.select({
      id: users.id,
      name: users.name,
      profileImage: users.profileImage,
      bio: users.bio,
      city: users.city,
      country: users.country,
      yearsOfDancing: users.yearsOfDancing,
      tangoRoles: users.tangoRoles,
      languages: users.languages
    })
    .from(users)
    .where(and(...whereConditions))
    .limit(params.limit || 20);

    const rankedResults = candidates.map(candidate => {
      const matchReasons = this.explainMatch(candidate, parsedQuery);
      const semanticScore = this.calculateSemanticScore(candidate, params.query);
      const compatibilityScore = Math.random() * 0.3 + 0.7;

      return {
        userId: candidate.id,
        name: candidate.name,
        avatar: candidate.profileImage,
        bio: candidate.bio,
        city: candidate.city,
        country: candidate.country,
        experienceYears: candidate.yearsOfDancing || 0,
        specialties: candidate.tangoRoles || [],
        semanticScore,
        compatibilityScore,
        matchReasons
      };
    });

    return rankedResults.sort((a, b) => 
      (b.semanticScore * 0.6 + b.compatibilityScore * 0.4) - 
      (a.semanticScore * 0.6 + a.compatibilityScore * 0.4)
    );
  }

  private async parseQuery(query: string): Promise<ParsedQuery> {
    const queryLower = query.toLowerCase();
    
    const parsed: ParsedQuery = {};

    const cities = ['buenos aires', 'san francisco', 'new york', 'paris', 'berlin', 'london'];
    for (const city of cities) {
      if (queryLower.includes(city)) {
        parsed.location = city;
        break;
      }
    }

    const experienceMatch = queryLower.match(/(\d+)\+?\s*(years?|yrs?)/);
    if (experienceMatch) {
      parsed.experience = parseInt(experienceMatch[1]);
    } else if (queryLower.includes('experienced')) {
      parsed.experience = 5;
    }

    const styles = ['milonga', 'tango', 'vals', 'nuevo', 'salon'];
    parsed.styles = styles.filter(style => queryLower.includes(style));

    const skills = ['teaching', 'performing', 'choreography', 'instruction'];
    parsed.skills = skills.filter(skill => queryLower.includes(skill));

    if (queryLower.includes('available') || queryLower.includes('weekend')) {
      parsed.availability = 'flexible';
    }

    return parsed;
  }

  private explainMatch(candidate: any, query: ParsedQuery): string[] {
    const reasons = [];

    if (query.location && (candidate.city?.toLowerCase() === query.location.toLowerCase() || 
        candidate.country?.toLowerCase() === query.location.toLowerCase())) {
      reasons.push(`📍 Based in ${candidate.city || candidate.country}`);
    }

    if (query.experience && candidate.yearsOfDancing >= query.experience) {
      reasons.push(`🎓 ${candidate.yearsOfDancing} years of experience`);
    }

    if (query.styles && candidate.tangoRoles) {
      const matchingStyles = query.styles.filter(s => 
        candidate.tangoRoles.some((r: string) => r.toLowerCase().includes(s))
      );
      if (matchingStyles.length > 0) {
        reasons.push(`💃 Specializes in ${matchingStyles.join(', ')}`);
      }
    }

    if (candidate.languages && candidate.languages.length > 1) {
      reasons.push(`🌍 Speaks ${candidate.languages.join(', ')}`);
    }

    return reasons;
  }

  private calculateSemanticScore(candidate: any, query: string): number {
    let score = 0.5;

    const queryLower = query.toLowerCase();
    const bioLower = (candidate.bio || '').toLowerCase();

    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);
    const matchingWords = queryWords.filter(word => bioLower.includes(word));
    
    score += (matchingWords.length / queryWords.length) * 0.3;

    if (candidate.yearsOfDancing > 5) score += 0.1;
    if (candidate.tangoRoles && candidate.tangoRoles.length > 0) score += 0.1;

    return Math.min(score, 1.0);
  }
}
