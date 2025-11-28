import { db } from '../db';
import { users } from '@shared/schema';
import { eq, and, ilike, or, sql } from 'drizzle-orm';
import { calculateYearsInRole, getMaxExperienceYears } from '@shared/utils/roleExperience';

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
  role?: string;
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
      if (parsedQuery.role) {
        const currentYear = new Date().getFullYear();
        const minStartYear = currentYear - parsedQuery.experience;
        whereConditions.push(
          or(
            sql`EXISTS (
              SELECT 1 FROM jsonb_array_elements(${users.tangoRoleExperience}) AS role_exp
              WHERE role_exp->>'role' = ${parsedQuery.role}
              AND (role_exp->>'startYear')::int <= ${minStartYear}
            )`,
            sql`(${users.tangoRoleExperience} IS NULL AND ${users.yearsOfDancing} >= ${parsedQuery.experience})`
          )!
        );
      } else {
        whereConditions.push(
          or(
            sql`EXISTS (
              SELECT 1 FROM jsonb_array_elements(${users.tangoRoleExperience}) AS role_exp
              WHERE (${new Date().getFullYear()} - (role_exp->>'startYear')::int) >= ${parsedQuery.experience}
            )`,
            sql`${users.yearsOfDancing} >= ${parsedQuery.experience}`
          )!
        );
      }
    }

    if (parsedQuery.role) {
      whereConditions.push(
        sql`${parsedQuery.role} = ANY(${users.tangoRoles})`
      );
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
      tangoRoleExperience: users.tangoRoleExperience,
      tangoStartYear: users.tangoStartYear,
      languages: users.languages
    })
    .from(users)
    .where(and(...whereConditions))
    .limit(params.limit || 20);

    const rankedResults = candidates.map(candidate => {
      const matchReasons = this.explainMatch(candidate, parsedQuery);
      const semanticScore = this.calculateSemanticScore(candidate, params.query, parsedQuery);
      const compatibilityScore = Math.random() * 0.3 + 0.7;

      const experienceYears = parsedQuery.role
        ? calculateYearsInRole(candidate, parsedQuery.role)
        : getMaxExperienceYears(candidate);

      return {
        userId: candidate.id,
        name: candidate.name,
        avatar: candidate.profileImage,
        bio: candidate.bio,
        city: candidate.city,
        country: candidate.country,
        experienceYears,
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

    const rolePatterns: Record<string, string[]> = {
      'teacher': ['teacher', 'teachers', 'instructor', 'instructors', 'teaching'],
      'dj': ['dj', 'djs', 'disc jockey'],
      'organizer': ['organizer', 'organizers', 'organizing', 'host', 'hosts'],
      'performer': ['performer', 'performers', 'performing'],
      'leader': ['leader', 'leaders', 'leading'],
      'follower': ['follower', 'followers', 'following'],
      'musician': ['musician', 'musicians', 'music'],
      'photographer': ['photographer', 'photographers', 'photo'],
      'videographer': ['videographer', 'videographers', 'video']
    };

    for (const [role, patterns] of Object.entries(rolePatterns)) {
      if (patterns.some(pattern => queryLower.includes(pattern))) {
        parsed.role = role;
        break;
      }
    }

    const experienceMatch = queryLower.match(/(\d+)\+?\s*(years?|yrs?)/);
    if (experienceMatch) {
      parsed.experience = parseInt(experienceMatch[1]);
    } else if (queryLower.includes('experienced')) {
      parsed.experience = 5;
    } else if (queryLower.includes('senior') || queryLower.includes('veteran')) {
      parsed.experience = 10;
    } else if (queryLower.includes('beginner') || queryLower.includes('new')) {
      parsed.experience = 0;
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
    const reasons: string[] = [];

    if (query.location && (candidate.city?.toLowerCase() === query.location.toLowerCase() || 
        candidate.country?.toLowerCase() === query.location.toLowerCase())) {
      reasons.push(`📍 Based in ${candidate.city || candidate.country}`);
    }

    if (query.experience) {
      if (query.role) {
        const roleYears = calculateYearsInRole(candidate, query.role);
        if (roleYears >= query.experience) {
          reasons.push(`🎓 ${roleYears} years as ${query.role}`);
        }
      } else {
        const maxYears = getMaxExperienceYears(candidate);
        if (maxYears >= query.experience) {
          reasons.push(`🎓 ${maxYears} years of experience`);
        }
      }
    } else if (query.role) {
      const roleYears = calculateYearsInRole(candidate, query.role);
      if (roleYears > 0) {
        reasons.push(`🎓 ${roleYears} years as ${query.role}`);
      } else {
        reasons.push(`🎓 Active ${query.role}`);
      }
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

  private calculateSemanticScore(candidate: any, query: string, parsedQuery: ParsedQuery): number {
    let score = 0.5;

    const queryLower = query.toLowerCase();
    const bioLower = (candidate.bio || '').toLowerCase();

    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);
    const matchingWords = queryWords.filter(word => bioLower.includes(word));
    
    if (queryWords.length > 0) {
      score += (matchingWords.length / queryWords.length) * 0.3;
    }

    const experienceYears = parsedQuery.role
      ? calculateYearsInRole(candidate, parsedQuery.role)
      : getMaxExperienceYears(candidate);

    if (experienceYears > 5) score += 0.1;
    if (experienceYears > 10) score += 0.05;
    
    if (candidate.tangoRoles && candidate.tangoRoles.length > 0) score += 0.1;

    if (parsedQuery.role && candidate.tangoRoles?.includes(parsedQuery.role)) {
      score += 0.15;
    }

    return Math.min(score, 1.0);
  }
}
