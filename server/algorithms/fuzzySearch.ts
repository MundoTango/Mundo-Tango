/**
 * A17: Fuzzy Search Algorithm
 * 
 * Implements fuzzy matching for search queries
 * Handles typos, partial matches, and relevance ranking
 */

export interface FuzzySearchResult {
  item: any;
  score: number; // 0-1 (1 = perfect match)
  matches: MatchDetail[];
}

export interface MatchDetail {
  field: string;
  value: string;
  matchedIndices: number[][];
  score: number;
}

/**
 * Calculate Levenshtein distance between two strings
 * Returns number of edits needed to transform one string into another
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Create 2D array for dynamic programming
  const dp: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));
  
  // Initialize first row and column
  for (let i = 0; i <= len1; i++) dp[i][0] = i;
  for (let j = 0; j <= len2; j++) dp[0][j] = j;
  
  // Fill in the rest of the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }
  
  return dp[len1][len2];
}

/**
 * Calculate similarity score between two strings (0-1)
 * Uses Levenshtein distance normalized by string length
 */
function calculateStringSimilarity(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  
  // Exact match
  if (q === t) return 1.0;
  
  // Contains match (partial)
  if (t.includes(q)) return 0.9;
  if (q.includes(t)) return 0.85;
  
  // Fuzzy match using Levenshtein
  const distance = levenshteinDistance(q, t);
  const maxLength = Math.max(q.length, t.length);
  
  if (maxLength === 0) return 0;
  
  const similarity = 1 - (distance / maxLength);
  return Math.max(0, similarity);
}

/**
 * Find matched character indices for highlighting
 */
function findMatchIndices(query: string, target: string): number[][] {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  
  const matches: number[][] = [];
  let queryIndex = 0;
  let matchStart = -1;
  
  for (let i = 0; i < t.length && queryIndex < q.length; i++) {
    if (t[i] === q[queryIndex]) {
      if (matchStart === -1) matchStart = i;
      queryIndex++;
      
      // End of query or end of consecutive match
      if (queryIndex === q.length || (i + 1 < t.length && t[i + 1] !== q[queryIndex])) {
        matches.push([matchStart, i]);
        matchStart = -1;
      }
    }
  }
  
  return matches;
}

/**
 * Search a single field with fuzzy matching
 */
function searchField(
  query: string,
  fieldValue: string,
  fieldName: string,
  threshold: number = 0.3
): MatchDetail | null {
  const score = calculateStringSimilarity(query, fieldValue);
  
  if (score < threshold) return null;
  
  const matchedIndices = findMatchIndices(query, fieldValue);
  
  return {
    field: fieldName,
    value: fieldValue,
    matchedIndices,
    score
  };
}

/**
 * Main fuzzy search function
 * Searches across multiple fields and returns ranked results
 */
export function fuzzySearch<T extends Record<string, any>>(
  query: string,
  items: T[],
  searchFields: (keyof T)[],
  options: {
    threshold?: number;
    limit?: number;
    fieldWeights?: Partial<Record<keyof T, number>>;
  } = {}
): FuzzySearchResult[] {
  const {
    threshold = 0.3,
    limit = 50,
    fieldWeights = {}
  } = options;
  
  const results: FuzzySearchResult[] = [];
  
  for (const item of items) {
    const matches: MatchDetail[] = [];
    let totalScore = 0;
    let totalWeight = 0;
    
    // Search each field
    for (const field of searchFields) {
      const fieldValue = item[field];
      if (typeof fieldValue !== 'string') continue;
      
      const match = searchField(query, fieldValue, String(field), threshold);
      
      if (match) {
        matches.push(match);
        
        // Apply field weight (default 1.0)
        const weight = fieldWeights[field] || 1.0;
        totalScore += match.score * weight;
        totalWeight += weight;
      }
    }
    
    // If any field matched, add to results
    if (matches.length > 0) {
      const averageScore = totalWeight > 0 ? totalScore / totalWeight : 0;
      
      results.push({
        item,
        score: averageScore,
        matches
      });
    }
  }
  
  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  
  // Apply limit
  return results.slice(0, limit);
}

/**
 * Specialized fuzzy search for user search
 * Searches name, username, bio, city
 */
export function fuzzySearchUsers(
  query: string,
  users: Array<{
    id: number;
    name: string;
    username: string;
    bio?: string | null;
    cityName?: string | null;
  }>,
  limit: number = 20
): FuzzySearchResult[] {
  return fuzzySearch(query, users, ['name', 'username', 'bio', 'cityName'], {
    limit,
    threshold: 0.25,
    fieldWeights: {
      name: 2.0,        // Name matches worth most
      username: 1.5,    // Username next
      cityName: 1.0,    // City moderate
      bio: 0.5          // Bio least important
    }
  });
}

/**
 * Specialized fuzzy search for events
 * Searches title, description, venue, city
 */
export function fuzzySearchEvents(
  query: string,
  events: Array<{
    id: number;
    title: string;
    description?: string | null;
    venue?: string | null;
    cityName?: string | null;
  }>,
  limit: number = 20
): FuzzySearchResult[] {
  return fuzzySearch(query, events, ['title', 'description', 'venue', 'cityName'], {
    limit,
    threshold: 0.3,
    fieldWeights: {
      title: 3.0,       // Title most important
      venue: 1.5,       // Venue moderately important
      cityName: 1.0,    // City moderate
      description: 0.5  // Description least (too long)
    }
  });
}

/**
 * Specialized fuzzy search for teachers
 */
export function fuzzySearchTeachers(
  query: string,
  teachers: Array<{
    id: number;
    name: string;
    specialty?: string | null;
    bio?: string | null;
    cityName?: string | null;
  }>,
  limit: number = 20
): FuzzySearchResult[] {
  return fuzzySearch(query, teachers, ['name', 'specialty', 'cityName', 'bio'], {
    limit,
    threshold: 0.3,
    fieldWeights: {
      name: 2.5,
      specialty: 2.0,
      cityName: 1.0,
      bio: 0.5
    }
  });
}
