import { db } from '../db';
import { users } from '@shared/schema';
import { eq, and, ilike, or, sql } from 'drizzle-orm';
import { calculateYearsInRole, getMaxExperienceYears } from '@shared/utils/roleExperience';

interface TalentSearchParams {
  query: string;
  userId: number;
  limit?: number;
  languages?: string[];
  primaryLanguage?: string;
  languageMatchMode?: 'any' | 'all';
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
  languages: string[];
  primaryLanguage: string | null;
  semanticScore: number;
  compatibilityScore: number;
  languageMatchScore: number;
  matchReasons: string[];
}

interface ParsedQuery {
  location?: string;
  experience?: number;
  role?: string;
  skills?: string[];
  styles?: string[];
  availability?: string;
  languages?: string[];
  primaryLanguage?: string;
  languageMatchMode?: 'any' | 'all';
}

const LANGUAGE_PATTERNS: Record<string, { code: string; name: string; nativeName: string }> = {
  'english': { code: 'en', name: 'English', nativeName: 'English' },
  'spanish': { code: 'es', name: 'Spanish', nativeName: 'Español' },
  'argentine spanish': { code: 'es-AR', name: 'Argentine Spanish', nativeName: 'Español Rioplatense' },
  'rioplatense': { code: 'es-AR', name: 'Argentine Spanish', nativeName: 'Español Rioplatense' },
  'portuguese': { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  'french': { code: 'fr', name: 'French', nativeName: 'Français' },
  'german': { code: 'de', name: 'German', nativeName: 'Deutsch' },
  'italian': { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  'chinese': { code: 'zh', name: 'Chinese', nativeName: '中文' },
  'mandarin': { code: 'zh', name: 'Chinese', nativeName: '中文' },
  'japanese': { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  'korean': { code: 'ko', name: 'Korean', nativeName: '한국어' },
  'russian': { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  'arabic': { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  'hindi': { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  'dutch': { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  'polish': { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  'turkish': { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  'greek': { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  'hebrew': { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  'swedish': { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  'norwegian': { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  'danish': { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  'finnish': { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  'ukrainian': { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
};

export class NaturalLanguageTalentSearch {
  async search(params: TalentSearchParams): Promise<TalentSearchResult[]> {
    const parsedQuery = await this.parseQuery(params.query);
    
    if (params.languages?.length) {
      parsedQuery.languages = params.languages;
    }
    if (params.primaryLanguage) {
      parsedQuery.primaryLanguage = params.primaryLanguage;
    }
    if (params.languageMatchMode) {
      parsedQuery.languageMatchMode = params.languageMatchMode;
    }
    
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

    if (parsedQuery.primaryLanguage) {
      whereConditions.push(
        or(
          eq(users.primaryLanguage, parsedQuery.primaryLanguage),
          sql`${parsedQuery.primaryLanguage} = ANY(${users.languages})`
        )!
      );
    }

    if (parsedQuery.languages && parsedQuery.languages.length > 0) {
      if (parsedQuery.languageMatchMode === 'all') {
        for (const lang of parsedQuery.languages) {
          whereConditions.push(
            or(
              eq(users.primaryLanguage, lang),
              sql`${lang} = ANY(${users.languages})`
            )!
          );
        }
      } else {
        const langConditions = parsedQuery.languages.map(lang =>
          or(
            eq(users.primaryLanguage, lang),
            sql`${lang} = ANY(${users.languages})`
          )!
        );
        whereConditions.push(or(...langConditions)!);
      }
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
      languages: users.languages,
      primaryLanguage: users.primaryLanguage
    })
    .from(users)
    .where(and(...whereConditions))
    .limit(params.limit || 20);

    const rankedResults = candidates.map(candidate => {
      const matchReasons = this.explainMatch(candidate, parsedQuery);
      const semanticScore = this.calculateSemanticScore(candidate, params.query, parsedQuery);
      const languageMatchScore = this.calculateLanguageScore(
        parsedQuery.languages || [],
        parsedQuery.primaryLanguage,
        candidate.languages || [],
        candidate.primaryLanguage
      );
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
        languages: candidate.languages || [],
        primaryLanguage: candidate.primaryLanguage,
        semanticScore,
        compatibilityScore,
        languageMatchScore,
        matchReasons
      };
    });

    const hasLanguageFilter = parsedQuery.languages?.length || parsedQuery.primaryLanguage;
    
    return rankedResults.sort((a, b) => {
      if (hasLanguageFilter) {
        const aTotal = a.semanticScore * 0.4 + a.compatibilityScore * 0.3 + a.languageMatchScore * 0.3;
        const bTotal = b.semanticScore * 0.4 + b.compatibilityScore * 0.3 + b.languageMatchScore * 0.3;
        return bTotal - aTotal;
      }
      return (b.semanticScore * 0.6 + b.compatibilityScore * 0.4) - 
             (a.semanticScore * 0.6 + a.compatibilityScore * 0.4);
    });
  }

  private calculateLanguageScore(
    userPreferredLanguages: string[],
    userPrimaryLanguage: string | undefined,
    talentLanguages: string[],
    talentPrimaryLanguage: string | null
  ): number {
    if (!userPreferredLanguages.length && !userPrimaryLanguage) {
      return 0.5;
    }

    let score = 0;
    let maxPossibleScore = 0;

    if (userPrimaryLanguage) {
      maxPossibleScore += 1.0;
      if (talentPrimaryLanguage === userPrimaryLanguage) {
        score += 1.0;
      } else if (talentLanguages.includes(userPrimaryLanguage)) {
        score += 0.7;
      }
    }

    for (const lang of userPreferredLanguages) {
      maxPossibleScore += 0.5;
      if (talentPrimaryLanguage === lang) {
        score += 0.5;
      } else if (talentLanguages.includes(lang)) {
        score += 0.3;
      }
    }

    return maxPossibleScore > 0 ? Math.min(score / maxPossibleScore, 1.0) : 0.5;
  }

  private async parseQuery(query: string): Promise<ParsedQuery> {
    const queryLower = query.toLowerCase();
    
    const parsed: ParsedQuery = {};

    const cities = ['buenos aires', 'san francisco', 'new york', 'paris', 'berlin', 'london', 'tokyo', 'moscow', 'rome', 'madrid', 'lisbon', 'amsterdam', 'vienna', 'prague', 'barcelona'];
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

    parsed.languages = this.parseLanguagesFromQuery(queryLower);
    
    const primaryLangPatterns = [
      /native\s+(\w+)\s+speaker/i,
      /primary\s+language\s+(\w+)/i,
      /fluent\s+in\s+(\w+)/i,
      /(\w+)\s+native/i
    ];
    
    for (const pattern of primaryLangPatterns) {
      const match = queryLower.match(pattern);
      if (match && match[1]) {
        const langInfo = LANGUAGE_PATTERNS[match[1].toLowerCase()];
        if (langInfo) {
          parsed.primaryLanguage = langInfo.code;
          break;
        }
      }
    }

    if (queryLower.includes(' and ') && parsed.languages && parsed.languages.length > 1) {
      parsed.languageMatchMode = 'all';
    } else {
      parsed.languageMatchMode = 'any';
    }

    return parsed;
  }

  private parseLanguagesFromQuery(queryLower: string): string[] {
    const languages: string[] = [];
    
    const languageIndicators = [
      /speaks?\s+(\w+)/gi,
      /speaking\s+(\w+)/gi,
      /fluent\s+in\s+(\w+)/gi,
      /(\w+)[\s-]speaking/gi,
      /who\s+knows?\s+(\w+)/gi,
      /in\s+(\w+)\s+language/gi,
      /understands?\s+(\w+)/gi,
      /can\s+speak\s+(\w+)/gi,
    ];

    for (const pattern of languageIndicators) {
      let match;
      while ((match = pattern.exec(queryLower)) !== null) {
        const langName = match[1].toLowerCase();
        const langInfo = LANGUAGE_PATTERNS[langName];
        if (langInfo && !languages.includes(langInfo.code)) {
          languages.push(langInfo.code);
        }
      }
    }

    for (const [langName, langInfo] of Object.entries(LANGUAGE_PATTERNS)) {
      if (queryLower.includes(langName) && !languages.includes(langInfo.code)) {
        const beforeLang = queryLower.indexOf(langName);
        const contextBefore = queryLower.substring(Math.max(0, beforeLang - 30), beforeLang);
        
        if (contextBefore.includes('speak') || 
            contextBefore.includes('fluent') || 
            contextBefore.includes('language') ||
            contextBefore.includes('knows') ||
            contextBefore.includes('understand') ||
            queryLower.includes(`${langName}-speaking`) ||
            queryLower.includes(`${langName} speaking`)) {
          languages.push(langInfo.code);
        }
      }
    }

    return languages;
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

    if (query.languages && query.languages.length > 0) {
      const candidateLangs = candidate.languages || [];
      const candidatePrimary = candidate.primaryLanguage;
      
      const matchingLanguages = query.languages.filter(lang => 
        candidatePrimary === lang || candidateLangs.includes(lang)
      );
      
      if (matchingLanguages.length > 0) {
        const langNames = matchingLanguages.map(code => {
          const entry = Object.entries(LANGUAGE_PATTERNS).find(([, info]) => info.code === code);
          return entry ? entry[1].name : code;
        });
        
        if (matchingLanguages.some(lang => candidatePrimary === lang)) {
          reasons.push(`🗣️ Native ${langNames[0]} speaker`);
        } else {
          reasons.push(`🌍 Speaks ${langNames.join(', ')}`);
        }
      }
    } else if (candidate.languages && candidate.languages.length > 0) {
      const displayLangs = candidate.languages.slice(0, 3);
      const langNames = displayLangs.map((code: string) => {
        const entry = Object.entries(LANGUAGE_PATTERNS).find(([, info]) => info.code === code);
        return entry ? entry[1].name : code;
      });
      reasons.push(`🌍 Speaks ${langNames.join(', ')}${candidate.languages.length > 3 ? '...' : ''}`);
    }

    if (query.primaryLanguage) {
      if (candidate.primaryLanguage === query.primaryLanguage) {
        const langEntry = Object.entries(LANGUAGE_PATTERNS).find(([, info]) => info.code === query.primaryLanguage);
        const langName = langEntry ? langEntry[1].name : query.primaryLanguage;
        reasons.push(`⭐ Primary language: ${langName}`);
      }
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

    if (parsedQuery.languages && parsedQuery.languages.length > 0) {
      const candidateLangs = candidate.languages || [];
      const candidatePrimary = candidate.primaryLanguage;
      
      const matchCount = parsedQuery.languages.filter(lang => 
        candidatePrimary === lang || candidateLangs.includes(lang)
      ).length;
      
      if (matchCount > 0) {
        score += (matchCount / parsedQuery.languages.length) * 0.15;
      }
    }

    if (parsedQuery.primaryLanguage) {
      if (candidate.primaryLanguage === parsedQuery.primaryLanguage) {
        score += 0.1;
      } else if (candidate.languages?.includes(parsedQuery.primaryLanguage)) {
        score += 0.05;
      }
    }

    return Math.min(score, 1.0);
  }

  static getLanguageCode(languageName: string): string | undefined {
    const entry = LANGUAGE_PATTERNS[languageName.toLowerCase()];
    return entry?.code;
  }

  static getLanguageName(code: string): string | undefined {
    const entry = Object.entries(LANGUAGE_PATTERNS).find(([, info]) => info.code === code);
    return entry?.[1].name;
  }
}
