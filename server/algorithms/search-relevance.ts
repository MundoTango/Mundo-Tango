/**
 * A47: SEARCH RELEVANCE ALGORITHM
 * Ranks search results by relevance
 */

interface SearchResult {
  id: number;
  title: string;
  content: string;
  type: string;
  relevanceScore: number;
}

export class SearchRelevanceAlgorithm {
  async rankResults(query: string, results: any[]): Promise<SearchResult[]> {
    return results
      .map(result => ({
        ...result,
        relevanceScore: this.calculateRelevance(query, result),
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private calculateRelevance(query: string, result: any): number {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const title = (result.title || '').toLowerCase();
    const content = (result.content || '').toLowerCase();

    let score = 0;

    // Title exact match (50%)
    if (title.includes(query.toLowerCase())) {
      score += 0.5;
    } else {
      // Title partial match
      const titleMatches = queryTerms.filter(term => title.includes(term)).length;
      score += (titleMatches / queryTerms.length) * 0.5;
    }

    // Content match (30%)
    const contentMatches = queryTerms.filter(term => content.includes(term)).length;
    score += (contentMatches / queryTerms.length) * 0.3;

    // Recency bonus (10%)
    const daysSince = (Date.now() - new Date(result.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, (1 - daysSince / 30) * 0.1);

    // Popularity bonus (10%)
    const popularity = (result.likes || 0) + (result.views || 0);
    score += Math.min(popularity / 100, 0.1);

    return score;
  }
}

export const searchRelevance = new SearchRelevanceAlgorithm();
